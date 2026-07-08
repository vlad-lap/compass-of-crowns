export function buildKingdomBorders(kingdoms, continents, islands) {
    const coastlineVertices = new Set();
    for (const source of [continents, islands]) {
        for (const feature of source.features) {
            const rings =
                feature.geometry.type === 'Polygon'
                    ? feature.geometry.coordinates
                    : feature.geometry.coordinates.flat(1);
            for (const ring of rings) {
                for (const [lng, lat] of ring) {
                    coastlineVertices.add(`${lng},${lat}`);
                }
            }
        }
    }

    const seenSegments = new Set();
    const borderLines = [];

    for (const feature of kingdoms.features) {
        const rings =
            feature.geometry.type === 'Polygon'
                ? feature.geometry.coordinates
                : feature.geometry.coordinates.flat(1);

        for (const ring of rings) {
            for (let i = 0; i < ring.length - 1; i++) {
                const segmentStart = ring[i];
                const segmentEnd = ring[i + 1];
                const segmentStartKey = `${segmentStart[0]},${segmentStart[1]}`;
                const segmentEndKey = `${segmentEnd[0]},${segmentEnd[1]}`;

                if (
                    coastlineVertices.has(segmentStartKey) &&
                    coastlineVertices.has(segmentEndKey)
                ) {
                    continue;
                }

                const segKey =
                    segmentStartKey < segmentEndKey
                        ? `${segmentStartKey}|${segmentEndKey}`
                        : `${segmentEndKey}|${segmentStartKey}`;

                if (!seenSegments.has(segKey)) {
                    seenSegments.add(segKey);
                    borderLines.push([segmentStart, segmentEnd]);
                }
            }
        }
    }

    return {
        type: 'FeatureCollection',
        features: borderLines.map(coordinates => ({
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates },
        })),
    };
}
