export interface FeatureData {
    id: string;
    name: string;
    searchKeys?: string[];
}

export interface LocationData extends FeatureData {
    type?: string;
    size?: number;
    continentId?: string;
    islandId?: string;
    kingdomId?: string;
    regionId?: string;
}

export type LocationType = 'cities' | 'towns' | 'greatCastles' | 'castles' | 'ruins' | 'other';

export type LocationDict<T> = Partial<Record<LocationType, T>>;
