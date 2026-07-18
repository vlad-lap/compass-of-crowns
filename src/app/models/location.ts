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
    description?: string;
}

export type LocationType = 'cities' | 'towns' | 'castles' | 'ruins' | 'other';
export type LocationTier = 'primary' | 'secondary' | 'tertiary';
export type LocationDict<T> = Partial<Record<LocationTier, T>>;
