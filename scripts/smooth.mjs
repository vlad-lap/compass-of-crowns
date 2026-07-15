function smoothRing(points, iterations = 2) {
    let ring = points.slice(0, -1);

    for (let iteration = 0; iteration < iterations; iteration++) {
        const smoothedRing = [];

        for (let i = 0; i < ring.length; i++) {
            const currentPoint = ring[i];
            const nextPoint = ring[(i + 1) % ring.length];

            const firstPoint = [
                currentPoint[0] * 0.75 + nextPoint[0] * 0.25,
                currentPoint[1] * 0.75 + nextPoint[1] * 0.25,
            ];

            const secondPoint = [
                currentPoint[0] * 0.25 + nextPoint[0] * 0.75,
                currentPoint[1] * 0.25 + nextPoint[1] * 0.75,
            ];

            smoothedRing.push(firstPoint, secondPoint);
        }

        ring = smoothedRing;
    }

    return [...ring, ring[0]];
}

export function smoothPolygon(feature) {
    let coordinates = feature.geometry.coordinates;

    switch (feature.geometry.type) {
        case 'Polygon':
            coordinates = feature.geometry.coordinates.map(ring => smoothRing(ring));
            break;
        case 'MultiPolygon':
            coordinates = feature.geometry.coordinates.map(polygon =>
                polygon.map(ring => smoothRing(ring)),
            );
            break;
    }

    return {
        ...feature,
        geometry: {
            ...feature.geometry,
            coordinates,
        },
    };
}
