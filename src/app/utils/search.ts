import { FeatureCollection } from 'geojson';
import { FeatureData, LocationData, LocationDict, LocationType } from '../models';
import { groupBy, uniq, uniqBy } from 'lodash';

const LOCATION_TYPES: Record<string, LocationType> = {
    City: 'cities',
    Town: 'towns',
    Castle: 'castles',
    Ruin: 'ruins',
    Other: 'other',
};

function buildSearchKeys(name: string): string[] {
    const normalized = name.toLowerCase().trim();
    return uniq([normalized, normalized.replace(/'/g, '')]);
}

export function getSearchOptions({ features }: FeatureCollection): FeatureData[] {
    const options = features
        .filter(({ properties }) => !!properties?.name)
        .map(({ properties: { id, name } }) => ({
            id,
            name,
            searchKeys: buildSearchKeys(name),
        }));

    return uniqBy(options, 'id');
}

export function getLocationsSearchOptions({
    features,
}: FeatureCollection): LocationDict<LocationData[]> {
    const locations: LocationData[] = features
        .filter(({ properties }) => !!properties?.name)
        .map(({ properties: { id, name, type } }) => ({
            id,
            name,
            type,
            searchKeys: buildSearchKeys(name),
        }));

    const uniqueLocations = uniqBy(locations, 'id');

    return groupBy(uniqueLocations, ({ type }) => LOCATION_TYPES[type]);
}

export function matchesSearch(searchKeys: string[], query: string): boolean {
    const queryWords = query.toLowerCase().trim().split(/\s+/);

    return searchKeys.some(searchKey => {
        const nameWords = searchKey.split(/\s+/);
        const nameStartIndex = nameWords.findIndex(word => word.startsWith(queryWords[0]));

        if (queryWords.length === 1) {
            return nameStartIndex !== -1;
        }

        return (
            queryWords.length <= nameWords.length &&
            nameStartIndex !== -1 &&
            queryWords.every((queryWord, i, ) => nameWords[nameStartIndex + i]?.startsWith(queryWord))
        );
    });
}
