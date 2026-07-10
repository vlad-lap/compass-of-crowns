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
    LocationColor,
    LocationRadius,
    MapBounds,
    RED,
    ZoomLevel,
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

export const NORTH_GRADIENT_COORDINATES: ImageSourceSpecification['coordinates'] = [
    [MapBounds.West, MapBounds.North],
    [MapBounds.East, MapBounds.North],
    [MapBounds.East, MapBounds.North - 4],
    [MapBounds.West, MapBounds.North - 4],
];

export const NORTH_GRADIENT_PAINT: RasterLayerSpecification['paint'] = {
    'raster-fade-duration': 0,
};

export const POLYGONS_PAINT: GeodataDict<FillLayerSpecification['paint']> = {
    continents: {
        'fill-color': LandscapeColor.Land,
    },
    mountains: {
        'fill-color': LandscapeColor.Mountain,
    },
    forests: {
        'fill-color': LandscapeColor.Forest,
        'fill-opacity': 0.5,
    },
    lakes: {
        'fill-color': LandscapeColor.Water,
    },
    islands: {
        'fill-color': LandscapeColor.Land,
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

export const LOCATIONS_FILTER: LocationDict<ExpressionSpecification> = {
    cities: ['==', ['get', 'type'], 'City'],
    towns: ['==', ['get', 'type'], 'Town'],
    greatCastles: ['all', ['==', ['get', 'type'], 'Castle'], ['==', ['get', 'size'], 4]],
    castles: ['all', ['==', ['get', 'type'], 'Castle'], ['==', ['get', 'size'], 3]],
    ruins: ['==', ['get', 'type'], 'Ruin'],
    other: ['==', ['get', 'type'], 'Other'],
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
    LocationRadius.XL,
    LocationRadius.MD,
];

export const POINTS_PAINT: CircleLayerSpecification['paint'] = {
    'circle-radius': POINT_CIRCLE_RADIUS,
    'circle-color': [
        'match',
        ['get', 'type'],
        'City',
        LocationColor.City,
        'Town',
        LocationColor.Town,
        'Castle',
        LocationColor.Castle,
        'Ruin',
        LocationColor.Ruin,
        'Other',
        LocationColor.Other,
        LocationColor.Other,
    ],
    'circle-stroke-color': BLACK,
    'circle-stroke-width': [
        'case',
        LOCATIONS_FILTER.cities,
        2,
        LOCATIONS_FILTER.greatCastles,
        2,
        1,
    ],
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
    'text-size': FontSize.Small,
};

const DEFAULT_LINE_LABEL_LAYOUT: SymbolLayerSpecification['layout'] = {
    ...DEFAULT_LABEL_LAYOUT,
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
    lakes: DEFAULT_LABEL_LAYOUT,
    islands: DEFAULT_LABEL_LAYOUT,
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

export const DEFAULT_LAND_LABEL_PAINT: SymbolLayerSpecification['paint'] = {
    'text-color': LabelColor.Land,
};

export const DEFAULT_WATER_LABEL_PAINT: SymbolLayerSpecification['paint'] = {
    'text-color': LabelColor.Water,
};

export const DEFAULT_POINT_LABEL_PAINT: SymbolLayerSpecification['paint'] = {
    'text-color': LabelColor.Location,
};

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

export const LABEL_PAINT: Partial<GeodataDict<SymbolLayerSpecification['paint']>> = {
    mountains: { 'text-color': LabelColor.Mountain },
    forests: DEFAULT_LAND_LABEL_PAINT,
    lakes: DEFAULT_WATER_LABEL_PAINT,
    islands: DEFAULT_LAND_LABEL_PAINT,
    kingdoms: { 'text-color': LabelColor.Kingdom },
    rivers: DEFAULT_WATER_LABEL_PAINT,
    roads: { 'text-color': LabelColor.Road },
    wall: { 'text-color': LabelColor.Wall },
    locations: DEFAULT_POINT_LABEL_PAINT,
};
