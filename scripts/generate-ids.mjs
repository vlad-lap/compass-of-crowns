import _ from 'lodash';
import { createHash } from 'crypto';

function generateHash(feature) {
    return createHash('sha1')
        .update(JSON.stringify(feature.geometry.coordinates))
        .digest('hex')
        .slice(0, 8);
}

function generateId(feature) {
    const { name, type, continent } = feature.properties;
    const idParts = name
        ? [type, name].map(_.kebabCase)
        : [...[type, continent].map(_.kebabCase), generateHash(feature)];

    return idParts.filter(Boolean).join('-');
}

export function generateIds(collection) {
    if (!collection) {
        return null;
    }

    return {
        ...collection,
        features: collection.features.map(feature => ({
            ...feature,
            properties: { ...feature.properties, id: generateId(feature) },
        })),
    };
}
