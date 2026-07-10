import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { EXTRA_LOCATIONS, GREAT_CASTLES } from './constants.mjs';
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

const continents = processGeoJSON('got_continents.geojson');
const islands = processGeoJSON('got_islands.geojson');
const kingdoms = processGeoJSON('got_political.geojson');

const borders = buildKingdomBorders(kingdoms, continents, islands);
writeGeoJSON('got_political_borders.geojson', borders);

processGeoJSON('got_lakes.geojson');
processGeoJSON('got_rivers.geojson');
processGeoJSON('got_roads.geojson');
processGeoJSON('got_wall.geojson');

const locations = readGeoJSON('got_locations.geojson');
const locationsWithExtras = {
    ...locations,
    features: [...locations.features, ...EXTRA_LOCATIONS].map(feature => {
        const isGreatCastle = GREAT_CASTLES.includes(feature.properties.name);
        const size = isGreatCastle ? 4 : feature.properties.size;
        const properties = { ...feature.properties, size };
        return { ...feature, properties };
    }),
};

writeGeoJSON('got_locations.geojson', locationsWithExtras);

const landscape = readGeoJSON('got_landscape.geojson');
const landscapeByType = splitByType(landscape);

for (const [type, collection] of Object.entries(landscapeByType)) {
    writeGeoJSON(`got_landscape_${type.toLowerCase()}.geojson`, collection);
}
