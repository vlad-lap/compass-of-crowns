export function splitByType(collection) {
    const byType = Map.groupBy(collection.features, f => f.properties.type);

    return Object.fromEntries(
        [...byType.entries()].map(([type, features]) => [type, { ...collection, features }]),
    );
}
