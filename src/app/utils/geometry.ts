import { LineString, MultiLineString, MultiPolygon, Point, Polygon, Position } from 'geojson';
import { flatten, flattenDepth } from 'lodash';

export type HighlightableGeometry = Polygon | MultiPolygon | LineString | MultiLineString | Point;

export function getGeometryPositions(geometry: HighlightableGeometry): Position[] {
    switch (geometry.type) {
        case 'Point':
            return [geometry.coordinates];
        case 'LineString':
            return geometry.coordinates;
        case 'MultiLineString':
        case 'Polygon':
            return flatten(geometry.coordinates);
        case 'MultiPolygon':
            return flattenDepth<Position>(geometry.coordinates, 2);
    }
}

export function getCentralPoint(geometry: Polygon | MultiPolygon): Position {
    switch (geometry.type) {
        case 'Polygon':
            return ringCentroid(geometry.coordinates[0]);
        case 'MultiPolygon': {
            const largestPolygon = geometry.coordinates.reduce((acc, polygon) =>
                polygon[0].length > acc[0].length ? polygon : acc,
            );
            return ringCentroid(largestPolygon[0]);
        }
    }
}

export function ringCentroid(ring: Position[]): Position {
    const [totalLon, totalLat] = ring.reduce(
        ([lon, lat], [posLon, posLat]) => [lon + posLon, lat + posLat],
        [0, 0],
    );
    return [totalLon / ring.length, totalLat / ring.length];
}
