import { GeodataDict, Language } from './models';

export const APP_TITLE = 'Compass of Ice and Fire';

export const AVAILABLE_LANGUAGES: Language[] = ['en', 'ru'];
export const DEFAULT_LANGUAGE: Language = 'en';

export const GEODATA_URLS: GeodataDict<string> = {
    continents: 'geodata/got_continents.geojson',
    kingdoms: 'geodata/got_political.geojson',
    lands: 'geodata/got_land.geojson',
    islands: 'geodata/got_islands.geojson',
    mountains: 'geodata/got_mountain.geojson',
    steppes: 'geodata/got_stepp.geojson',
    deserts: 'geodata/got_desert.geojson',
    swamps: 'geodata/got_swamp.geojson',
    forests: 'geodata/got_forest.geojson',
    lakes: 'geodata/got_lakes.geojson',
    seas: 'geodata/got_water.geojson',
    shores: 'geodata/got_shore.geojson',
    rivers: 'geodata/got_rivers.geojson',
    kingdomBorders: 'geodata/got_political_borders.geojson',
    roads: 'geodata/got_roads.geojson',
    wall: 'geodata/got_wall.geojson',
    locations: 'geodata/got_locations.geojson',
};
