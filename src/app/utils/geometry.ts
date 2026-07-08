import { MultiPolygon, Polygon, Position } from 'geojson';

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
