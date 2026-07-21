import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import _ from 'lodash';
import { EXCLUDED_IDS } from './constants.mjs';
import { splitByType } from './split-by-type.mjs';
import { addContinentId, filterGeodata, getContainingPolygonId, getLocationContinentId, mapGeodata } from './geodata-utils.mjs';
import { generateIds } from './generate-ids.mjs';
import { buildKingdomBorders } from './build-kingdom-borders.mjs';
import { smoothPolygon } from './smooth.mjs';
import { readJSON, writeJSON } from './json-utils.mjs';
import { addLanguageProperties, syncDescriptions, syncLanguageDict } from './language.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VENDORS = join(__dirname, '..', 'vendors');
const GEODATA = join(__dirname, '..', 'geodata');
const DATA = join(__dirname, '..', 'data');
const RAW_DATA = join(DATA, 'raw');

function readGeoJSON(fileName, languageFileName) {
    const collection = readJSON(join(VENDORS, fileName), 'utf8');
    const collectionWithIds = generateIds(collection);
    const collectionWithLanguages = addLanguageProperties(collectionWithIds, languageFileName);
    return filterGeodata(
        collectionWithLanguages,
        feature => !EXCLUDED_IDS.includes(feature.properties.id),
    );
}

function writeGeoJSON(fileName, collection) {
    writeJSON(join(GEODATA, fileName), collection);
    console.log(`${fileName}: ${collection.features.length} features`);
}

function getFeatureProperties(collection) {
    return collection.features.map(feature => feature.properties);
}

function writeRawDataJSON(fileName, collection) {
    const dataItems = getFeatureProperties(collection);
    writeJSON(join(RAW_DATA, fileName), dataItems);
    const named = dataItems.filter(item => !!item.name);
    const withDescriptions = dataItems.filter(item => !!item.description);
    const translated = dataItems.filter(item => !!item.name_ru);
    console.log(
        `${fileName}: ${dataItems.length} features, ${named.length} named, ${translated.length}/${named.length} translated, ${withDescriptions.length}/${named.length} with descriptions`,
    );
    return dataItems;
}

function syncLanguage(collection, languageFileName) {
    const rawData = writeRawDataJSON(languageFileName, collection);
    syncLanguageDict(rawData, languageFileName);
}

function processGeoJSON(fileName, languageFileName, { filterFn, mapFn } = {}) {
    const collection = readGeoJSON(fileName, languageFileName);
    const filtered = filterFn ? filterGeodata(collection, filterFn) : collection;
    const mapped = mapFn ? mapGeodata(filtered, mapFn) : filtered;
    writeGeoJSON(fileName, mapped);
    syncLanguage(mapped, languageFileName);
    return mapped;
}

mkdirSync(GEODATA, { recursive: true });
mkdirSync(RAW_DATA, { recursive: true });

const continents = processGeoJSON('got_continents.geojson', 'continents.json');

const islands = processGeoJSON('got_islands.geojson', 'islands.json', {
    mapFn: feature => addContinentId(feature, continents)
});
const kingdoms = processGeoJSON('got_political.geojson', 'kingdoms.json');

const borders = buildKingdomBorders(kingdoms, continents, islands);
writeGeoJSON('got_political_borders.geojson', borders);

processGeoJSON('got_lakes.geojson', 'lakes.json');
processGeoJSON('got_rivers.geojson', 'rivers.json');
processGeoJSON('got_roads.geojson', 'roads.json');

const landscape = readGeoJSON('got_landscape.geojson', 'landscape.json');
syncLanguage(landscape, 'landscape.json');
const landscapeByType = splitByType(landscape);

const regions = readGeoJSON('got_regions.geojson', 'regions.json');
syncLanguage(regions, 'regions.json');
const regionsByType = splitByType(regions);

const combinedTypes = ['mountain', 'forest'];

let namedRegions = {
    type: 'FeatureCollection',
    features: [],
};

function appendNamedRegions(collection) {
    namedRegions.features = [
        ...namedRegions.features,
        ...collection.features.filter(feature => !!feature.properties.name && feature.properties.type !== 'water'),
    ];
}

for (const type of combinedTypes) {
    const features = [
        ...landscapeByType[type]?.features,
        ...regionsByType[type]?.features,
    ];

    const collection = {
        type: 'FeatureCollection',
        features: _.uniqBy(features, 'properties.id').map(smoothPolygon),
    };

    appendNamedRegions(collection);
    writeGeoJSON(`got_${type}.geojson`, collection);
}

for (const [type, collection] of Object.entries({ ...landscapeByType, ...regionsByType })) {
    const lowercased = type.toLowerCase();
    if (!combinedTypes.includes(lowercased)) {
        appendNamedRegions(collection);

        const smoothed = {
            ...collection,
            features: collection.features.map(feature => smoothPolygon(feature, 2)),
        };
        writeGeoJSON(`got_${lowercased}.geojson`, smoothed);
    }
}

const descriptions = readJSON(join(DATA, 'descriptions.json'));

const theWall = processGeoJSON('got_wall.geojson', 'the-wall.json', {
    mapFn: feature => ({
        ...feature,
        properties: {
            ...feature.properties,
            continentId: getLocationContinentId(feature, continents, islands),
            kingdomId: getContainingPolygonId(feature, kingdoms),
            regionId: getContainingPolygonId(feature, namedRegions),
            islandId: getContainingPolygonId(feature, islands),
            description: descriptions[feature.properties.id] ?? null,
        },
    }),
});

const locations = processGeoJSON('got_locations.geojson', 'locations.json', {
    mapFn: feature => ({
        ...feature,
        properties: {
            ...feature.properties,
            continentId: getLocationContinentId(feature, continents, islands),
            kingdomId: getContainingPolygonId(feature, kingdoms),
            regionId: getContainingPolygonId(feature, namedRegions),
            islandId: getContainingPolygonId(feature, islands),
            description: descriptions[feature.properties.id] ?? null,
        },
    }),
});

const wallData = getFeatureProperties(theWall);
const locationsData = getFeatureProperties(locations);
syncDescriptions([...wallData, ...locationsData])


