export type PolygonGeodataType =
    'continents'
    | 'kingdoms'
    | 'lands'
    | 'shores'
    | 'islands'
    | 'mountains'
    | 'forests'
    | 'deserts'
    | 'steppes'
    | 'swamps'
    | 'lakes'
    | 'seas';

export type LineGeodataType = 'rivers' | 'kingdomBorders' | 'roads' | 'wall';

export type PointGeodataType = 'locations';

export type GeodataType = PolygonGeodataType | LineGeodataType | PointGeodataType;

export type GeodataDict<T> = Partial<Record<GeodataType, T>>;
