import { readFileSync, writeFileSync } from 'fs';

export function readJSON(path) {
    try {
        return JSON.parse(readFileSync(path, 'utf8'));
    } catch (_) {
        return {};
    }
}

export function writeJSON(path, json) {
    writeFileSync(path, JSON.stringify(json, null, 2));
}
