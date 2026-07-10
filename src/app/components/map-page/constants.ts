import { LngLatLike } from 'maplibre-gl';

export enum MapBounds {
    North = 43,
    South = -42,
    East = 92,
    West = -10,
}

export const INITIAL_MAP_CENTER: LngLatLike = [15, 10];

export enum ZoomLevel {
    Low = 3,
    Initial = 3.75,
    Medium = 4.5,
    High = 6,
}

export const BLACK = '#333333';
export const GREY = '#5d6d7e';
export const ORANGE = '#ffa80d';
export const RED = '#e53935';

export enum LandscapeColor {
    Land = '#d2fade',
    Water = '#90d9ed',
    Forest = '#93cba2',
    Mountain = '#f1e6d1',
    Road = ORANGE,
    Wall = GREY,
    KingdomBorder = GREY,
}

export enum LabelColor {
    Land = '#12875f',
    Water = '#1a6b8a',
    Mountain = '#5a4208',
    Road = '#bd7c05',
    Kingdom = GREY,
    Wall = BLACK,
    Location = BLACK,
}

export enum LocationColor {
    City = ORANGE,
    Town = ORANGE,
    Castle = GREY,
    Ruin = '#aab7b8',
    Other = '#c9ccd0',
}

export enum LocationRadius {
    SM = 3,
    MD = 4,
    LG = 5,
    XL = 7,
}

export const TOUCH_HIT_RADIUS_PX = 15;

export const TOOLTIP_LAYER_IDS = [
    'cities-circle',
    'towns-circle',
    'greatCastles-circle',
    'castles-circle',
    'ruins-circle',
    'other-circle',
    'wall-line',
];

export enum FontStyle {
    Regular = 'Noto Sans Regular',
    Italic = 'Noto Sans Italic',
    Bold = 'Noto Sans Bold',
}

export enum FontSize {
    Small = 9,
    Medium = 12,
    Large = 14,
}
