import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
    CONTINENT_KEY,
    DISPLAYED_CONTINENT,
    EXTRA_LOCATIONS,
    GREAT_CASTLES,
} from './constants.mjs';
import { locationsInContinent } from './locations-in-continent.mjs';
import { splitByType } from './split-by-type.mjs';
import { filterGeodata } from './filter-geodata.mjs';
import { generateIds } from './generate-ids.mjs';
import { buildKingdomBorders } from './build-kingdom-borders.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VENDORS = join(__dirname, '..', 'vendors');
const GEODATA = join(__dirname, '..', 'geodata');

function readGeoJSON(fileName) {
    return JSON.parse(readFileSync(join(VENDORS, fileName), 'utf8'));
}

function writeGeoJSON(fileName, data) {
    const dataWithIds = generateIds(data);
    writeFileSync(join(GEODATA, fileName), JSON.stringify(dataWithIds, null, 2));
    console.log(`${fileName}: ${dataWithIds.features.length} features`);
}

function processGeoJSON(fileName, filterFn) {
    const raw = readGeoJSON(fileName);
    const filtered = filterFn ? filterGeodata(raw, filterFn) : raw;
    const processed = generateIds(filtered);
    writeGeoJSON(fileName, processed);
    return processed;
}

mkdirSync(GEODATA, { recursive: true });

const filterDisplayedContinent = key => feature =>
    feature.properties[key ?? CONTINENT_KEY] === DISPLAYED_CONTINENT;

const filteredContinents = processGeoJSON(
    'got_continents.geojson',
    filterDisplayedContinent('name'),
);
const filteredIslands = processGeoJSON('got_islands.geojson', filterDisplayedContinent());
const kingdoms = processGeoJSON('got_political.geojson');

processGeoJSON('got_lakes.geojson', filterDisplayedContinent());
processGeoJSON('got_rivers.geojson', filterDisplayedContinent());
processGeoJSON('got_roads.geojson', filterDisplayedContinent());
processGeoJSON('got_wall.geojson');

const borders = buildKingdomBorders(kingdoms, filteredContinents, filteredIslands);
writeGeoJSON('got_political_borders.geojson', borders);

const locations = readGeoJSON('got_locations.geojson');
const filteredLocations = locationsInContinent(locations, filteredContinents, filteredIslands);
const locationsWithExtras = {
    ...filteredLocations,
    features: [...filteredLocations.features, ...EXTRA_LOCATIONS].map(feature => {
        const isGreatCastle = GREAT_CASTLES.includes(feature.properties.name);
        const size = isGreatCastle ? 4 : feature.properties.size;
        const properties = { ...feature.properties, size };
        return { ...feature, properties };
    }),
};

writeGeoJSON('got_locations.geojson', locationsWithExtras);

const landscape = readGeoJSON('got_landscape.geojson');
const filteredLandscape = filterGeodata(landscape, filterDisplayedContinent());
const landscapeByType = splitByType(filteredLandscape);

for (const [type, collection] of Object.entries(landscapeByType)) {
    writeGeoJSON(`got_landscape_${type.toLowerCase()}.geojson`, collection);
}
