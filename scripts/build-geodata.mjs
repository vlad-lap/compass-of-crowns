import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { EXCLUDED_IDS, EXTRA_LOCATIONS, GREAT_CASTLES } from './constants.mjs';
import { splitByType } from './split-by-type.mjs';
import { addContinentId, filterGeodata, getContainingPolygonId, getLocationContinentId, mapGeodata } from './geodata-utils.mjs';
import { generateIds } from './generate-ids.mjs';
import { buildKingdomBorders } from './build-kingdom-borders.mjs';
import { smoothPolygon } from './smooth.mjs';
import _ from 'lodash';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VENDORS = join(__dirname, '..', 'vendors');
const GEODATA = join(__dirname, '..', 'geodata');

function readGeoJSON(fileName) {
    const collection = JSON.parse(readFileSync(join(VENDORS, fileName), 'utf8'));
    const collectionWithIds = generateIds(collection);
    return filterGeodata(
        collectionWithIds,
        feature => !EXCLUDED_IDS.includes(feature.properties.id),
    );
}

function writeGeoJSON(fileName, collection) {
    writeFileSync(join(GEODATA, fileName), JSON.stringify(collection, null, 2));
    console.log(`${fileName}: ${collection.features.length} features`);
}

function processGeoJSON(fileName, { filterFn, mapFn } = {}) {
    const collection = readGeoJSON(fileName);
    const filtered = filterFn ? filterGeodata(collection, filterFn) : collection;
    const mapped = mapFn ? mapGeodata(filtered, mapFn) : filtered;
    writeGeoJSON(fileName, mapped);
    return mapped;
}

mkdirSync(GEODATA, { recursive: true });

const continents = processGeoJSON('got_continents.geojson');

const islands = processGeoJSON('got_islands.geojson', {
    mapFn: feature => addContinentId(feature, continents)
});
const kingdoms = processGeoJSON('got_political.geojson');

const borders = buildKingdomBorders(kingdoms, continents, islands);
writeGeoJSON('got_political_borders.geojson', borders);

processGeoJSON('got_lakes.geojson');
processGeoJSON('got_rivers.geojson');
processGeoJSON('got_roads.geojson');

const landscape = readGeoJSON('got_landscape.geojson');
const landscapeByType = splitByType(landscape);

const regions = readGeoJSON('got_regions.geojson');
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
    const lowercased = type.toLowerCase();
    const features = [
        ...landscapeByType[lowercased]?.features,
        ...regionsByType[lowercased]?.features,
    ];

    const collection = {
        type: 'FeatureCollection',
        features: _.uniqBy(features, 'properties.id').map(smoothPolygon),
    };

    appendNamedRegions(collection);
    writeGeoJSON(`got_${lowercased}.geojson`, collection);
}

for (const [type, collection] of Object.entries({ ...landscapeByType, ...regionsByType })) {
    const lowercased = type.toLowerCase();
    if (!combinedTypes.includes(lowercased)) {
        appendNamedRegions(collection);

        const smoothed = {
            ...collection,
            features: collection.features.map(smoothPolygon),
        };
        writeGeoJSON(`got_${lowercased}.geojson`, smoothed);
    }
}

processGeoJSON('got_wall.geojson', {
    mapFn: feature => ({
        ...feature,
        properties: {
            ...feature.properties,
            continentId: getLocationContinentId(feature, continents, islands),
            kingdomId: getContainingPolygonId(feature, kingdoms),
            regionId: getContainingPolygonId(feature, namedRegions),
            islandId: getContainingPolygonId(feature, islands),
        },
    }),
});

const locations = readGeoJSON('got_locations.geojson');
const locationsWithExtras = {
    ...locations,
    features: [...locations.features, ...EXTRA_LOCATIONS].map(feature => {
        const isGreatCastle = GREAT_CASTLES.includes(feature.properties.name);
        const properties = {
            ...feature.properties,
            size: isGreatCastle ? 4 : feature.properties.size,
            continentId: getLocationContinentId(feature, continents, islands),
            kingdomId: getContainingPolygonId(feature, kingdoms),
            regionId: getContainingPolygonId(feature, namedRegions),
            islandId: getContainingPolygonId(feature, islands),
        };
        return { ...feature, properties };
    }),
};

writeGeoJSON('got_locations.geojson', locationsWithExtras);
