export type PolygonGeodataType =
    'continents' | 'kingdoms' | 'islands' | 'mountains' | 'forests' | 'steppes' | 'swamps' | 'lakes';

export type LineGeodataType = 'rivers' | 'kingdomBorders' | 'roads' | 'wall';

export type PointGeodataType = 'locations';

export type GeodataType = PolygonGeodataType | LineGeodataType | PointGeodataType;

export type GeodataDict<T> = Partial<Record<GeodataType, T>>;
