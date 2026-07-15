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
    Initial = 3.4,
    Medium = 4.5,
    High = 6,
}

export const BLACK = '#333333';
export const WHITE = '#faf7ef';
export const GREY = '#5d6d7e';
export const ORANGE = '#ffa80d';
export const RED = '#ff3b30';

export enum LandscapeColor {
    Land = '#d2fade',
    Water = '#90d9ed',
    Forest = '#93cba2',
    Swamp = '#bae8d6',
    Road = ORANGE,
    Wall = WHITE,
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

export enum LocationRadius {
    SM = 2,
    MD = 3,
    LG = 4,
}

export enum SymbolMarkerSize {
    SM = 14,
    LG = 18,
}

export const TOUCH_HIT_RADIUS_PX = 15;

export const MOUNTAIN_PATTERN_ID = 'mountain-pattern';

export const TOOLTIP_LAYER_IDS = [
    'cities-mark',
    'towns-mark',
    'greatCastles-mark',
    'castles-mark',
    'ruins-mark',
    'other-mark',
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
