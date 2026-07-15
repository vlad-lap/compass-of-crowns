import {
    CircleLayerSpecification,
    DataDrivenPropertyValueSpecification,
    ExpressionSpecification,
    FillLayerSpecification,
    ImageSourceSpecification,
    LineLayerSpecification,
    LngLatBoundsLike,
    RasterLayerSpecification,
    StyleSpecification,
    SymbolLayerSpecification,
} from 'maplibre-gl';
import {
    BLACK,
    FontSize,
    FontStyle,
    LabelColor,
    LandscapeColor,
    WHITE,
    LocationRadius,
    MapBounds,
    MOUNTAIN_PATTERN_ID,
    RED,
    ZoomLevel,
    SymbolMarkerSize,
} from './constants';
import { GeodataDict, LocationDict } from '../../models';

export const MAP_STYLE: StyleSpecification = {
    version: 8,
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {},
    layers: [
        {
            id: 'background',
            type: 'background',
            paint: {
                'background-color': LandscapeColor.Water,
            },
        },
    ],
};

export const MAP_BOUNDS: LngLatBoundsLike = [
    [MapBounds.West, MapBounds.South],
    [MapBounds.East, MapBounds.North],
];

const GRADIENT_WIDTH = 2;

export const GRADIENT_COORDINATES: Record<string, ImageSourceSpecification['coordinates']> = {
    north: [
        [MapBounds.West, MapBounds.North],
        [MapBounds.East, MapBounds.North],
        [MapBounds.East, MapBounds.North - GRADIENT_WIDTH],
        [MapBounds.West, MapBounds.North - GRADIENT_WIDTH],
    ],
    south: [
        [MapBounds.West, MapBounds.South],
        [MapBounds.East, MapBounds.South],
        [MapBounds.East, MapBounds.South + GRADIENT_WIDTH],
        [MapBounds.West, MapBounds.South + GRADIENT_WIDTH],
    ],
    east: [
        [MapBounds.East, MapBounds.North],
        [MapBounds.East, MapBounds.South],
        [MapBounds.East - GRADIENT_WIDTH, MapBounds.South],
        [MapBounds.East - GRADIENT_WIDTH, MapBounds.North],
    ],
    west: [
        [MapBounds.West, MapBounds.North],
        [MapBounds.West, MapBounds.South],
        [MapBounds.West + GRADIENT_WIDTH, MapBounds.South],
        [MapBounds.West + GRADIENT_WIDTH, MapBounds.North],
    ],
};

export const GRADIENT_PAINT: RasterLayerSpecification['paint'] = {
    'raster-fade-duration': 0,
};

export const POLYGONS_PAINT: GeodataDict<FillLayerSpecification['paint']> = {
    continents: {
        'fill-color': LandscapeColor.Land,
    },
    islands: {
        'fill-color': LandscapeColor.Land,
    },
    mountains: {
        'fill-pattern': MOUNTAIN_PATTERN_ID,
        'fill-opacity': 0.15,
    },
    forests: {
        'fill-color': LandscapeColor.Forest,
        'fill-opacity': 0.35,
    },
    steppes: {
        'fill-opacity': 0,
    },
    swamps: {
        'fill-color': LandscapeColor.Swamp,
        'fill-opacity': 0.5,
    },
    lakes: {
        'fill-color': LandscapeColor.Water,
    },
};

export const MOUNTAINS_OUTLINE_LAYOUT: LineLayerSpecification['layout'] = {
    'line-join': 'round',
};

export const MOUNTAINS_OUTLINE_PAINT: Record<string, LineLayerSpecification['paint']> = {
    outline: {
        'line-color': LandscapeColor.Land,
        'line-width': 8,
    },
    blur: {
        'line-color': LandscapeColor.Land,
        'line-width': 10,
        'line-blur': 10,
        'line-offset': 5,
    },
};

export const LINES_LAYOUT: GeodataDict<LineLayerSpecification['layout']> = {
    roads: {
        'line-cap': 'round',
        'line-join': 'round',
    },
    wall: {
        'line-cap': 'round',
        'line-join': 'round',
    },
};

export const LINES_PAINT: GeodataDict<LineLayerSpecification['paint']> = {
    rivers: {
        'line-color': LandscapeColor.Water,
    },
    roads: {
        'line-color': LandscapeColor.Road,
    },
    wall: {
        'line-color': LandscapeColor.Wall,
        'line-width': 3,
    },
    kingdomBorders: {
        'line-color': LandscapeColor.KingdomBorder,
        'line-dasharray': [4, 4],
        'line-opacity': 0.6,
    },
};

export const LINES_SHADOW: GeodataDict<LineLayerSpecification['paint']> = {
    wall: {
        'line-color': BLACK,
        'line-width': 7,
        'line-opacity': 0.3,
        'line-blur': 8,
        'line-translate': [1, 1],
    },
};

export const LOCATIONS_FILTER: LocationDict<ExpressionSpecification> = {
    cities: ['==', ['get', 'type'], 'City'],
    towns: ['==', ['get', 'type'], 'Town'],
    greatCastles: ['all', ['==', ['get', 'type'], 'Castle'], ['==', ['get', 'size'], 4]],
    castles: ['all', ['==', ['get', 'type'], 'Castle'], ['==', ['get', 'size'], 3]],
    ruins: ['==', ['get', 'type'], 'Ruin'],
    other: ['==', ['get', 'type'], 'Other'],
};

export const LABEL_SIZE_FILTER: ExpressionSpecification = ['>', ['number', ['get', 'size']], 1];

export const LOCATION_LABELS_FILTER: LocationDict<ExpressionSpecification> = {
    cities: ['all', LOCATIONS_FILTER.cities, LABEL_SIZE_FILTER],
    towns: ['all', LOCATIONS_FILTER.towns, LABEL_SIZE_FILTER],
    greatCastles: ['all', LOCATIONS_FILTER.greatCastles, LABEL_SIZE_FILTER],
    castles: ['all', LOCATIONS_FILTER.castles, LABEL_SIZE_FILTER],
    ruins: ['all', LOCATIONS_FILTER.ruins, LABEL_SIZE_FILTER],
    other: ['all', LOCATIONS_FILTER.other, LABEL_SIZE_FILTER],
};

export const LOCATIONS_MIN_ZOOM: LocationDict<ZoomLevel> = {
    towns: ZoomLevel.Medium,
    castles: ZoomLevel.Medium,
    ruins: ZoomLevel.High,
    other: ZoomLevel.High,
};

const POINT_CIRCLE_RADIUS: DataDrivenPropertyValueSpecification<number> = [
    'match',
    ['get', 'size'],
    1,
    LocationRadius.SM,
    2,
    LocationRadius.MD,
    3,
    LocationRadius.MD,
    4,
    LocationRadius.LG,
    5,
    LocationRadius.LG,
    LocationRadius.MD,
];

const POINT_SHADOW_RADIUS: DataDrivenPropertyValueSpecification<number> = [
    'match',
    ['get', 'size'],
    1,
    LocationRadius.SM + 2,
    2,
    LocationRadius.MD + 2,
    3,
    LocationRadius.MD + 2,
    4,
    LocationRadius.LG + 2,
    5,
    LocationRadius.LG + 2,
    LocationRadius.MD + 2,
];

export const POINTS_PAINT: CircleLayerSpecification['paint'] = {
    'circle-radius': POINT_CIRCLE_RADIUS,
    'circle-color': WHITE,
    'circle-stroke-color': BLACK,
    'circle-stroke-width': 1,
};

export const POINTS_SHADOW: CircleLayerSpecification['paint'] = {
    'circle-radius': POINT_SHADOW_RADIUS,
    'circle-color': BLACK,
    'circle-opacity': 0.3,
    'circle-blur': 0.8,
    'circle-translate': [1.5, 1.5],
};

const SYMBOL_MARKER_SIZE: DataDrivenPropertyValueSpecification<number> = [
    'match',
    ['get', 'size'],
    1,
    SymbolMarkerSize.SM,
    SymbolMarkerSize.LG,
];

export const SYMBOL_MARKER_LAYOUT: SymbolLayerSpecification['layout'] = {
    'text-field': '×',
    'text-font': [FontStyle.Bold],
    'text-size': SYMBOL_MARKER_SIZE,
    'text-allow-overlap': true,
    'text-ignore-placement': true,
};

export const SYMBOL_MARKER_PAINT: SymbolLayerSpecification['paint'] = {
    'text-color': BLACK,
    'text-halo-color': WHITE,
    'text-halo-width': 1,
};

export const LABELS_MIN_ZOOM: GeodataDict<ZoomLevel> = {
    mountains: ZoomLevel.Medium,
    forests: ZoomLevel.Medium,
    islands: ZoomLevel.Medium,
    lakes: ZoomLevel.Medium,
    rivers: ZoomLevel.Low,
    roads: ZoomLevel.Medium,
};

const DEFAULT_LABEL_LAYOUT: SymbolLayerSpecification['layout'] = {
    'text-field': ['get', 'name'],
    'text-font': [FontStyle.Italic],
    'text-size': [
        'match',
        ['get', 'size'],
        1,
        FontSize.Small,
        2,
        FontSize.Small,
        3,
        FontSize.Medium,
        4,
        FontSize.Medium,
        5,
        FontSize.Large,
        FontSize.Medium,
    ]
};

const DEFAULT_LINE_LABEL_LAYOUT: SymbolLayerSpecification['layout'] = {
    ...DEFAULT_LABEL_LAYOUT,
    'text-size': FontSize.Small,
    'symbol-placement': 'line-center',
};

const DEFAULT_POINT_LABEL_LAYOUT: SymbolLayerSpecification['layout'] = {
    ...DEFAULT_LABEL_LAYOUT,
    'text-variable-anchor': ['bottom', 'top', 'left', 'right'],
    'text-radial-offset': 0.6,
    'text-justify': 'auto',
    'text-font': [
        'case',
        LOCATIONS_FILTER.cities,
        ['literal', [FontStyle.Bold]],
        LOCATIONS_FILTER.greatCastles,
        ['literal', [FontStyle.Bold]],
        ['literal', [FontStyle.Regular]],
    ],
    'text-size': [
        'case',
        LOCATIONS_FILTER.cities,
        FontSize.Large,
        LOCATIONS_FILTER.greatCastles,
        FontSize.Large,
        FontSize.Medium,
    ],
};

export const LABEL_LAYOUT: Partial<GeodataDict<SymbolLayerSpecification['layout']>> = {
    mountains: DEFAULT_LABEL_LAYOUT,
    forests: DEFAULT_LABEL_LAYOUT,
    steppes: DEFAULT_LABEL_LAYOUT,
    swamps: DEFAULT_LABEL_LAYOUT,
    lakes: {
        ...DEFAULT_LABEL_LAYOUT,
        'text-size': FontSize.Small,
    },
    islands: {
        ...DEFAULT_LABEL_LAYOUT,
        'text-size': FontSize.Small,
    },
    kingdoms: {
        ...DEFAULT_LABEL_LAYOUT,
        'text-size': FontSize.Large,
        'text-variable-anchor': ['bottom', 'top', 'left', 'right'],
        'text-justify': 'auto',
    },
    rivers: DEFAULT_LINE_LABEL_LAYOUT,
    roads: {
        ...DEFAULT_LINE_LABEL_LAYOUT,
        'text-font': [FontStyle.Bold],
    },
    wall: {
        ...DEFAULT_LINE_LABEL_LAYOUT,
        'text-font': [FontStyle.Bold],
        'text-size': FontSize.Large,
    },
    locations: DEFAULT_POINT_LABEL_LAYOUT,
};

export const DEFAULT_LABEL_PAINT: SymbolLayerSpecification['paint'] = {
    'text-halo-color': WHITE,
    'text-halo-width': 1,
};

export const DEFAULT_LAND_LABEL_PAINT: SymbolLayerSpecification['paint'] = {
    ...DEFAULT_LABEL_PAINT,
    'text-color': LabelColor.Land,
};

export const DEFAULT_WATER_LABEL_PAINT: SymbolLayerSpecification['paint'] = {
    ...DEFAULT_LABEL_PAINT,
    'text-color': LabelColor.Water,
};

export const DEFAULT_POINT_LABEL_PAINT: SymbolLayerSpecification['paint'] = {
    ...DEFAULT_LABEL_PAINT,
    'text-color': LabelColor.Location,
};

export const LABEL_PAINT: Partial<GeodataDict<SymbolLayerSpecification['paint']>> = {
    mountains: { ...DEFAULT_LABEL_PAINT, 'text-color': LabelColor.Mountain },
    forests: DEFAULT_LAND_LABEL_PAINT,
    steppes: DEFAULT_LAND_LABEL_PAINT,
    swamps: DEFAULT_LAND_LABEL_PAINT,
    lakes: DEFAULT_WATER_LABEL_PAINT,
    islands: DEFAULT_LAND_LABEL_PAINT,
    kingdoms: { ...DEFAULT_LABEL_PAINT, 'text-color': LabelColor.Kingdom },
    rivers: DEFAULT_WATER_LABEL_PAINT,
    roads: { ...DEFAULT_LABEL_PAINT, 'text-color': LabelColor.Road },
    wall: { ...DEFAULT_LABEL_PAINT, 'text-color': LabelColor.Wall },
    locations: DEFAULT_POINT_LABEL_PAINT,
};

export const SEARCH_HIGHLIGHT_LINE_LAYOUT: LineLayerSpecification['layout'] = {
    'line-cap': 'round',
    'line-join': 'round',
}

export const SEARCH_HIGHLIGHT_LINE_PAINT: LineLayerSpecification['paint'] = {
    'line-width': 8,
    'line-color': RED,
    'line-opacity': 0.6,
};

export const SEARCH_HIGHLIGHT_CIRCLE_PAINT: CircleLayerSpecification['paint'] = {
    'circle-opacity': 0,
    'circle-radius': POINT_CIRCLE_RADIUS,
    'circle-stroke-color': RED,
    'circle-stroke-width': 10,
    'circle-stroke-opacity': 0.6,
};
