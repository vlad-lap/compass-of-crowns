import {
    ChangeDetectionStrategy,
    Component,
    ComponentRef,
    signal,
    ViewContainerRef,
    viewChild,
    computed,
} from '@angular/core';
import { Store } from '@ngxs/store';
import {
    GeoJSONSourceComponent,
    ImageSourceComponent,
    LayerComponent,
    MapComponent,
} from '@maplibre/ngx-maplibre-gl';
import {
    LineLayerSpecification,
    LngLatBounds,
    LngLatLike,
    Map,
    MapGeoJSONFeature,
    MapLayerMouseEvent,
    MapLibreEvent,
    MapMouseEvent,
    Popup,
} from 'maplibre-gl';
import { Feature, FeatureCollection } from 'geojson';
import { GEODATA_URLS } from '../../constants';
import {
    INITIAL_MAP_CENTER,
    MOUNTAIN_PATTERN_ID,
    TOOLTIP_LAYER_IDS,
    TOUCH_HIT_RADIUS_PX,
    ZoomLevel,
} from './constants';
import {
    FeatureData,
    GeodataType,
    LineGeodataType,
    LocationData,
    LocationType,
    PolygonGeodataType,
} from '../../models';
import { GeodataState } from '../../store/geodata';
import {
    GRADIENT_COORDINATES,
    GRADIENT_PAINT,
    LABEL_LAYOUT,
    LABEL_PAINT,
    LABELS_MIN_ZOOM,
    LINES_LAYOUT,
    LINES_PAINT,
    LINES_SHADOW,
    LOCATION_LABELS_FILTER,
    LOCATIONS_FILTER,
    LOCATIONS_MIN_ZOOM,
    MAP_BOUNDS,
    MAP_STYLE,
    MOUNTAINS_OUTLINE_LAYOUT,
    MOUNTAINS_OUTLINE_PAINT,
    POINTS_PAINT,
    POINTS_SHADOW,
    POLYGONS_PAINT,
    SEARCH_HIGHLIGHT_CIRCLE_PAINT,
    SEARCH_HIGHLIGHT_LINE_LAYOUT,
    SEARCH_HIGHLIGHT_LINE_PAINT,
    SYMBOL_MARKER_LAYOUT,
    SYMBOL_MARKER_PAINT,
} from './configs';
import { getGeometryPositions, HighlightableGeometry } from '../../utils';
import { MatIconButton, MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { AboutDialogComponent } from '../about-dialog/about-dialog.component';
import { MapTooltipComponent } from '../map-tooltip/map-tooltip.component';
import { MapSearchComponent } from '../map-search/map-search.component';
import { KeyValuePipe } from '@angular/common';

@Component({
    selector: 'cc-map-page',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MapComponent,
        GeoJSONSourceComponent,
        ImageSourceComponent,
        LayerComponent,
        MatMiniFabButton,
        MatIcon,
        MatIconButton,
        MapSearchComponent,
        KeyValuePipe,
    ],
    templateUrl: './map-page.component.html',
    styleUrl: './map-page.component.scss',
})
export class MapPageComponent {
    readonly map = viewChild.required(MapComponent);

    readonly isZoomedOut = signal<boolean>(false);

    readonly searchHighlightFeature = signal<Feature>(null);

    readonly searchHighlight = computed<FeatureCollection>(() => {
        const feature = this.searchHighlightFeature();
        return {
            type: 'FeatureCollection',
            features: feature ? [feature] : null,
        };
    });

    readonly searchHighlightLayerType = computed<'line' | 'circle' | null>(() => {
        const feature = this.searchHighlightFeature();
        return feature
            ? this.getHighlightLayerType(feature.geometry.type as HighlightableGeometry['type'])
            : null;
    });

    protected readonly mapStyle = MAP_STYLE;
    protected readonly geodataUrls = GEODATA_URLS;
    protected readonly ZoomLevel = ZoomLevel;
    protected readonly maxBounds = MAP_BOUNDS;
    protected readonly initialCenter = INITIAL_MAP_CENTER;

    protected readonly polygonTypes: PolygonGeodataType[] = [
        'continents',
        'lakes',
        'islands',
        'mountains',
        'steppes',
        'swamps',
        'forests',
    ];
    protected readonly lineTypes: LineGeodataType[] = ['kingdomBorders', 'rivers', 'roads'];

    protected readonly labeledTypes: GeodataType[] = [
        'mountains',
        'steppes',
        'swamps',
        'forests',
        'lakes',
        'islands',
        'rivers',
        'roads',
        'wall',
    ];

    protected readonly kingdomsLabelPoints = this.store.selectSignal(
        GeodataState.labelPoints('kingdoms'),
    );

    protected readonly polygonsPaint = POLYGONS_PAINT;

    protected readonly mountainsOutlineLayout = MOUNTAINS_OUTLINE_LAYOUT;
    protected readonly mountainsOutlinePaint = MOUNTAINS_OUTLINE_PAINT;

    protected readonly linesLayout = LINES_LAYOUT;
    protected readonly linesPaint = LINES_PAINT;
    protected readonly linesShadow = LINES_SHADOW;

    protected readonly pointsPaint = POINTS_PAINT;
    protected readonly pointsShadow = POINTS_SHADOW;

    protected readonly symbolMarkerLayout = SYMBOL_MARKER_LAYOUT;
    protected readonly symbolMarkerPaint = SYMBOL_MARKER_PAINT;

    protected readonly locationTypes: LocationType[] = [
        'cities',
        'towns',
        'greatCastles',
        'castles',
        'ruins',
        'other',
    ];
    protected readonly locationsFilter = LOCATIONS_FILTER;
    protected readonly locationsMinZoom = LOCATIONS_MIN_ZOOM;

    protected readonly labelLayout = LABEL_LAYOUT;
    protected readonly labelPaint = LABEL_PAINT;
    protected readonly labelsMinZoom = LABELS_MIN_ZOOM;
    protected readonly locationLabelsFilter = LOCATION_LABELS_FILTER;

    protected readonly gradientUrl = this.buildGradientUrl();
    protected readonly gradientCoordinates = GRADIENT_COORDINATES;
    protected readonly gradientPaint = GRADIENT_PAINT;

    protected readonly searchHighlightLineLayout = computed<LineLayerSpecification['layout']>(
        () => ({
            ...SEARCH_HIGHLIGHT_LINE_LAYOUT,
            visibility: this.searchHighlightLayerType() === 'line' ? 'visible' : 'none',
        }),
    );
    protected readonly searchHighlightLinePaint = SEARCH_HIGHLIGHT_LINE_PAINT;
    protected readonly searchHighlightCirclePaint = SEARCH_HIGHLIGHT_CIRCLE_PAINT;

    private readonly hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    private popup: Popup;
    private tooltipRef: ComponentRef<MapTooltipComponent>;

    constructor(
        private store: Store,
        private dialog: MatDialog,
        private viewContainerRef: ViewContainerRef,
    ) {}

    async onMapLoad(map: Map): Promise<void> {
        map.touchZoomRotate.disableRotation();
        const { data } = await map.loadImage('hillshade.png');
        map.addImage(MOUNTAIN_PATTERN_ID, data);
    }

    onHomeClick(): void {
        this.map().mapInstance.flyTo({ center: INITIAL_MAP_CENTER, zoom: ZoomLevel.Initial });
    }

    onFeatureEnter({ lngLat, target, features }: MapLayerMouseEvent): void {
        if (!this.hasHover) {
            return;
        }

        const feature = features?.[0];
        if (!feature?.properties?.name) {
            return;
        }

        this.showTooltip(target, feature, lngLat);
    }

    onFeatureLeave(): void {
        this.popup?.remove();
        this.popup = null;
        this.tooltipRef?.destroy();
        this.tooltipRef = null;
    }

    onMapZoom(event: MapLibreEvent<MouseEvent | TouchEvent | WheelEvent | undefined>): void {
        const isZoomedOut = event.target.getZoom() < ZoomLevel.Initial;
        if (this.isZoomedOut() !== isZoomedOut) {
            this.isZoomedOut.set(isZoomedOut);
        }
    }

    onMapClick({ target, lngLat, point: { x, y } }: MapMouseEvent): void {
        if (this.hasHover) {
            return;
        }

        const [feature] = target.queryRenderedFeatures(
            [
                [x - TOUCH_HIT_RADIUS_PX, y - TOUCH_HIT_RADIUS_PX],
                [x + TOUCH_HIT_RADIUS_PX, y + TOUCH_HIT_RADIUS_PX],
            ],
            { layers: TOOLTIP_LAYER_IDS },
        );

        if (!feature?.properties?.name) {
            this.onFeatureLeave();
            return;
        }

        this.showTooltip(target, feature, lngLat);
    }

    search({ id }: FeatureData): void {
        const feature = this.store.selectSnapshot(GeodataState.byId(id));
        if (!feature) {
            return;
        }

        this.searchHighlightFeature.set(feature);
        const bounds = this.zoomToFeature(feature);

        if (this.hasTooltip(feature)) {
            this.showTooltip(
                this.map().mapInstance,
                feature as MapGeoJSONFeature,
                bounds.getCenter(),
            );
        }
    }

    resetSearch(): void {
        this.searchHighlightFeature.set(null);
        this.onFeatureLeave();
    }

    openAboutDialog(): void {
        this.dialog.open(AboutDialogComponent);
    }

    private zoomToFeature({ geometry }: Feature): LngLatBounds {
        const bounds = getGeometryPositions(geometry as HighlightableGeometry).reduce(
            (initialBounds, position) => initialBounds.extend(position as LngLatLike),
            new LngLatBounds(),
        );
        this.map().mapInstance.fitBounds(bounds, {
            maxZoom: ZoomLevel.High,
            padding: 60,
            offset: this.hasHover ? [0, 0] : [0, -80],
        });
        return bounds;
    }

    private getHighlightLayerType(geometryType: HighlightableGeometry['type']): 'line' | 'circle' {
        return geometryType === 'Point' ? 'circle' : 'line';
    }

    private hasTooltip({ properties, geometry }: Feature): boolean {
        return geometry.type === 'Point' || properties.id === 'the-wall';
    }

    private showTooltip(
        map: MapLayerMouseEvent['target'],
        { geometry, properties }: MapGeoJSONFeature,
        lngLat: LngLatLike,
    ): void {
        const anchor = geometry.type === 'Point' ? (geometry.coordinates as LngLatLike) : lngLat;

        this.popup?.remove();
        this.tooltipRef?.destroy();
        this.popup = new Popup({ closeButton: false, closeOnClick: false })
            .setLngLat(anchor)
            .setDOMContent(this.buildTooltip(properties as LocationData))
            .addTo(map);
    }

    private buildGradientUrl(): string {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 256;
        const ctx = canvas.getContext('2d')!;
        const gradient = ctx.createLinearGradient(0, 0, 0, 256);
        gradient.addColorStop(0, 'rgba(250, 247, 239, 0.75)');
        gradient.addColorStop(1, 'rgba(250, 247, 239, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1, 256);
        return canvas.toDataURL();
    }

    private buildTooltip(location: LocationData): HTMLElement {
        this.tooltipRef = this.viewContainerRef.createComponent(MapTooltipComponent);
        this.tooltipRef.setInput('location', location);
        this.tooltipRef.changeDetectorRef.detectChanges();
        return this.tooltipRef.location.nativeElement;
    }
}
