import { pointInPolygon } from './point-in-polygon.mjs';
import { filterGeodata } from './filter-geodata.mjs';

export function locationsInContinent(locations, continents, islands) {
    return filterGeodata(locations, f => {
        const point = f.geometry.coordinates;
        const polygons = [...(continents?.features ?? []), ...(islands?.features ?? [])];
        return polygons.some(polygon => pointInPolygon(point, polygon.geometry));
    });
}
