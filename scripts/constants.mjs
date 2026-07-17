export const GREAT_CASTLES = [
    'Winterfell',
    'Riverrun',
    'The Eyrie',
    'Pyke',
    'Harrenhal',
    "Storm's End",
    'Highgarden',
    'Sunspear',
    'Casterly Rock',
];

export const EXTRA_LOCATIONS = [
    {
        type: 'Feature',
        properties: {
            id: 'castle-casterly-rock',
            name: 'Casterly Rock',
            size: 4,
            confirmed: 1,
            type: 'Castle'
        },
        geometry: { type: 'Point', coordinates: [7.305359863219508, 5.4727566272357535] },
    },
];

export const EXCLUDED_IDS = [
    'desert-the-dothraki-sea',
    'water-iron-islands',
    'other-holdfast',
    'other-village',
    'other-unnamed-village',
    'other-fishing-village',
    'other-crofters-village',
    'other-palisade-village',
    'other-sept',
    'other-tower',
];
