import { LngLatLike } from 'maplibre-gl';

export enum MapBounds {
    North = 43,
    South = -42,
    East = 92,
    West = -10,
}

export const INITIAL_MAP_CENTER: LngLatLike = [15, 10];

export enum ZoomLevel {
    Initial = 3.4,
    Low = 4,
    Medium = 5,
    High = 6,
}

export const BLACK = '#333333';
export const GREY = '#7b766f';
export const LIGHT_GREY = '#b0aaa2';
export const WHITE = '#faf7ef';
export const RED = '#ff3b30';

export enum LandscapeColor {
    Land = '#d2fade',
    Water = '#90d9ed',
    Forest = '#93cba2',
    Swamp = '#bae8d6',
    Desert = '#f4efe5',
    Road = '#ffa80d',
    Wall = WHITE,
    KingdomBorder = GREY,
}

export enum LabelColor {
    Land = '#12875f',
    Water = '#1a6b8a',
    Mountain = '#5a4208',
    Road = '#bd7c05',
    Wall = BLACK,
    Location = BLACK,
    Ruin = GREY,
}

export enum LocationRadius {
    SM = 2,
    MD = 3,
    LG = 4,
}

export const TOUCH_HIT_RADIUS_PX = 15;

export const MOUNTAIN_PATTERN_ID = 'mountain-pattern';

export const SELECTABLE_LAYER_IDS = [
    'primary-point',
    'secondary-point',
    'tertiary-point',
    'wall-line',
];

export enum FontStyle {
    Regular = 'Noto Sans Regular',
    Italic = 'Noto Sans Italic',
    Bold = 'Noto Sans Bold',
}

export enum FontSize {
    SM = 10,
    MD = 12,
    LG = 14,
    XL = 18,
}
