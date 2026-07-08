import { pointInPolygon, distanceToPolygon } from './point-in-polygon.mjs';
import { filterGeodata } from './filter-geodata.mjs';

const MAX_DISTANCE_FROM_COASTLINE = 0.05;

export function locationsInContinent(locations, continents, islands) {
    return filterGeodata(locations, f => {
        const point = f.geometry.coordinates;
        const polygons = [...(continents?.features ?? []), ...(islands?.features ?? [])];
        return polygons.some(
            polygon =>
                pointInPolygon(point, polygon.geometry) ||
                distanceToPolygon(point, polygon.geometry) <= MAX_DISTANCE_FROM_COASTLINE,
        );
    });
}
