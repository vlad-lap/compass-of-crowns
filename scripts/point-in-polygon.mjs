function pointInRing(point, ring) {
    const [pointX, pointY] = point;
    let inside = false;
    for (let curr = 0, prev = ring.length - 1; curr < ring.length; prev = curr++) {
        const [currX, currY] = ring[curr];
        const [prevX, prevY] = ring[prev];
        const edgeCrossesHorizontal = currY > pointY !== prevY > pointY;
        const intersectX = ((prevX - currX) * (pointY - currY)) / (prevY - currY) + currX;
        if (edgeCrossesHorizontal && pointX < intersectX) {
            inside = !inside;
        }
    }
    return inside;
}

export function pointInPolygon(point, geometry) {
    if (geometry.type === 'Polygon') {
        const [outerRing, ...holes] = geometry.coordinates;
        return pointInRing(point, outerRing) && holes.every(hole => !pointInRing(point, hole));
    }
    if (geometry.type === 'MultiPolygon') {
        return geometry.coordinates.some(
            ([outerRing, ...holes]) =>
                pointInRing(point, outerRing) && holes.every(hole => !pointInRing(point, hole)),
        );
    }
    return false;
}

function distanceToSegment(point, segmentStart, segmentEnd) {
    const [pointX, pointY] = point;
    const [startX, startY] = segmentStart;
    const [endX, endY] = segmentEnd;
    const dx = endX - startX;
    const dy = endY - startY;
    const lengthSquared = dx * dx + dy * dy;
    const projectionRatio =
        lengthSquared === 0
            ? 0
            : Math.max(
                  0,
                  Math.min(1, ((pointX - startX) * dx + (pointY - startY) * dy) / lengthSquared),
              );
    const closestX = startX + projectionRatio * dx;
    const closestY = startY + projectionRatio * dy;
    return Math.hypot(pointX - closestX, pointY - closestY);
}

function distanceToRing(point, ring) {
    let minDistance = Infinity;
    for (let curr = 0, prev = ring.length - 1; curr < ring.length; prev = curr++) {
        minDistance = Math.min(minDistance, distanceToSegment(point, ring[prev], ring[curr]));
    }
    return minDistance;
}

export function distanceToPolygon(point, geometry) {
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
    let minDistance = Infinity;
    for (const [outerRing, ...holes] of polygons) {
        minDistance = Math.min(minDistance, distanceToRing(point, outerRing));
        for (const hole of holes) {
            minDistance = Math.min(minDistance, distanceToRing(point, hole));
        }
    }
    return minDistance;
}
