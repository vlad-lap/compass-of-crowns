import {
    ChangeDetectionStrategy,
    Component,
    ComponentRef,
    signal,
    ViewContainerRef,
    viewChild,
    computed,
    effect,
} from '@angular/core';
import { Store } from '@ngxs/store';
import {
    GeoJSONSourceComponent,
    ImageSourceComponent,
    LayerComponent,
    MapComponent,
} from '@maplibre/ngx-maplibre-gl';
import {
    CircleLayerSpecification,
    LineLayerSpecification,
    LngLatBounds,
    LngLatLike,
    Map,
    MapGeoJSONFeature,
    MapLayerMouseEvent,
    MapMouseEvent,
    Popup,
} from 'maplibre-gl';
import { Feature, FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson';
import { GEODATA_URLS } from '../../constants';
import {
    INITIAL_MAP_CENTER,
    MOUNTAIN_PATTERN_ID,
    SELECTABLE_LAYER_IDS,
    TOUCH_HIT_RADIUS_PX,
    ZoomLevel,
} from './constants';
import {
    FeatureData,
    GeodataType,
    LineGeodataType,
    LocationData,
    LocationTier,
    PolygonGeodataType,
} from '../../models';
import { GeodataState } from '../../store/geodata';
import {
    DEFAULT_LABEL_LAYOUT,
    DIM_OVERLAY_PAINT,
    GRADIENT_COORDINATES,
    GRADIENT_PAINT,
    LABEL_LAYOUT,
    LABEL_PAINT,
    LABELS_MIN_ZOOM,
    LINES_LAYOUT,
    LINES_OUTLINE,
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
} from './configs';
import { buildMaskPolygon, getGeometryPositions, HighlightableGeometry } from '../../utils';
import { MatIconButton, MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { AboutDialogComponent } from '../about-dialog/about-dialog.component';
import { TooltipComponent } from '../tooltip/tooltip.component';
import { MapSearchComponent } from '../map-search/map-search.component';
import { KeyValuePipe } from '@angular/common';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { CardComponent } from '../card/card.component';
import { takeUntil } from 'rxjs';

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
    protected readonly map = viewChild.required(MapComponent);
    protected readonly searchComponent = viewChild.required(MapSearchComponent);

    protected readonly cursorStyle = signal<string>('default');

    protected readonly searchHighlightFeature = signal<Feature>(null);

    protected readonly searchHighlight = computed<FeatureCollection>(() => {
        const feature = this.searchHighlightFeature();
        return {
            type: 'FeatureCollection',
            features: feature ? [feature] : null,
        };
    });

    protected readonly searchHighlightLayerType = computed<'polygon' | 'line' | 'point' | null>(
        () => {
            const feature = this.searchHighlightFeature();
            return feature
                ? this.getHighlightLayerType(feature.geometry.type as HighlightableGeometry['type'])
                : null;
        },
    );

    protected readonly dimOverlay = computed<FeatureCollection>(() => {
        const feature = this.searchHighlightFeature();
        const isMaskable = this.searchHighlightLayerType() === 'polygon';
        return {
            type: 'FeatureCollection',
            features: isMaskable
                ? [
                      {
                          ...feature,
                          geometry: buildMaskPolygon(
                              feature.geometry as Polygon | MultiPolygon,
                              MAP_BOUNDS as [Position, Position],
                          ),
                      },
                  ]
                : null,
        };
    });

    protected readonly mapStyle = MAP_STYLE;
    protected readonly geodataUrls = GEODATA_URLS;
    protected readonly ZoomLevel = ZoomLevel;
    protected readonly maxBounds = MAP_BOUNDS;
    protected readonly initialCenter = INITIAL_MAP_CENTER;

    protected readonly polygonTypes: PolygonGeodataType[] = [
        'continents',
        'lands',
        'lakes',
        'seas',
        'shores',
        'islands',
        'mountains',
        'steppes',
        'deserts',
        'swamps',
        'forests',
    ];
    protected readonly lineTypes: LineGeodataType[] = ['kingdomBorders', 'rivers', 'roads'];

    protected readonly labeledTypes: GeodataType[] = [
        'lands',
        'mountains',
        'steppes',
        'deserts',
        'swamps',
        'seas',
        'shores',
        'forests',
        'lakes',
        'islands',
        'rivers',
        'roads',
        'wall',
    ];

    protected readonly continentsLabelPoints = this.store.selectSignal(
        GeodataState.labelPoints('continents'),
    );

    protected readonly kingdomsLabelPoints = this.store.selectSignal(
        GeodataState.labelPoints('kingdoms'),
    );

    protected readonly polygonsPaint = POLYGONS_PAINT;

    protected readonly mountainsOutlineLayout = MOUNTAINS_OUTLINE_LAYOUT;
    protected readonly mountainsOutlinePaint = MOUNTAINS_OUTLINE_PAINT;

    protected readonly linesLayout = LINES_LAYOUT;
    protected readonly linesPaint = LINES_PAINT;
    protected readonly linesOutline = LINES_OUTLINE;
    protected readonly linesShadow = LINES_SHADOW;

    protected readonly pointsPaint = POINTS_PAINT;
    protected readonly pointsShadow = POINTS_SHADOW;

    protected readonly locationTiers: LocationTier[] = ['primary', 'secondary', 'tertiary'];
    protected readonly locationsFilter = LOCATIONS_FILTER;
    protected readonly locationsMinZoom = LOCATIONS_MIN_ZOOM;

    protected readonly labelLayout = LABEL_LAYOUT;
    protected readonly defaultLabelLayout = DEFAULT_LABEL_LAYOUT;
    protected readonly labelPaint = LABEL_PAINT;
    protected readonly labelsMinZoom = LABELS_MIN_ZOOM;
    protected readonly locationLabelsFilter = LOCATION_LABELS_FILTER;

    protected readonly gradientUrl = this.buildGradientUrl();
    protected readonly gradientCoordinates = GRADIENT_COORDINATES;
    protected readonly gradientPaint = GRADIENT_PAINT;

    protected readonly searchHighlightPolygonLayout = computed<LineLayerSpecification['layout']>(
        () => ({
            visibility: this.searchHighlightLayerType() === 'polygon' ? 'visible' : 'none',
        }),
    );

    protected readonly searchHighlightLineLayout = computed<LineLayerSpecification['layout']>(
        () => ({
            ...SEARCH_HIGHLIGHT_LINE_LAYOUT,
            visibility: this.searchHighlightLayerType() === 'line' ? 'visible' : 'none',
        }),
    );

    protected readonly searchHighPointLayout = computed<CircleLayerSpecification['layout']>(() => ({
        visibility: this.searchHighlightLayerType() === 'point' ? 'visible' : 'none',
    }));
    protected readonly searchHighlightLinePaint = SEARCH_HIGHLIGHT_LINE_PAINT;
    protected readonly searchHighlightPointPaint = SEARCH_HIGHLIGHT_CIRCLE_PAINT;

    protected readonly dimOverlayPaint = DIM_OVERLAY_PAINT;

    private readonly hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    private popup: Popup;
    private tooltipRef: ComponentRef<TooltipComponent>;
    private bottomSheetRef: MatBottomSheetRef;

    constructor(
        private store: Store,
        private dialog: MatDialog,
        private bottomSheet: MatBottomSheet,
        private viewContainerRef: ViewContainerRef,
    ) {
        effect(() => {
            const highlight = this.searchHighlightFeature();
            if (highlight && this.hasCard(highlight)) {
                this.openCard(highlight);
            } else {
                this.closeCard();
            }
        });
    }

    async onMapLoad(map: Map): Promise<void> {
        map.touchZoomRotate.disableRotation();
        const { data } = await map.loadImage('hillshade.png');
        map.addImage(MOUNTAIN_PATTERN_ID, data);

        const feature = this.searchHighlightFeature();
        if (feature) {
            this.zoomToFeature(feature);
        }
    }

    resetMapView(): void {
        this.map().mapInstance.flyTo({ center: INITIAL_MAP_CENTER, zoom: ZoomLevel.Initial });
    }

    onFeatureEnter({ lngLat, target, features }: MapLayerMouseEvent): void {
        if (!this.hasHover) {
            return;
        }

        const feature = features?.[0];
        if (!feature) {
            return;
        }

        this.cursorStyle.set('pointer');
        this.showTooltip(target, feature, lngLat);
    }

    onFeatureLeave(): void {
        this.cursorStyle.set('default');
        this.popup?.remove();
        this.popup = null;
        this.tooltipRef?.destroy();
        this.tooltipRef = null;
    }

    onMapDragStart(): void {
        this.cursorStyle.set('grabbing');
    }

    onMapDragEnd(): void {
        this.cursorStyle.set('default');
    }

    onMapClick({ target, point: { x, y } }: MapMouseEvent): void {
        const [feature] = target.queryRenderedFeatures(
            [
                [x - TOUCH_HIT_RADIUS_PX, y - TOUCH_HIT_RADIUS_PX],
                [x + TOUCH_HIT_RADIUS_PX, y + TOUCH_HIT_RADIUS_PX],
            ],
            { layers: SELECTABLE_LAYER_IDS },
        );

        if (!feature?.properties?.name) {
            return;
        }

        this.searchComponent().setSelectedId(feature.properties.id);
    }

    search({ id }: FeatureData): void {
        const feature = this.store.selectSnapshot(GeodataState.byId(id));
        if (!feature) {
            return;
        }

        this.searchHighlightFeature.set(feature);
        this.zoomToFeature(feature);
    }

    resetSearch(): void {
        this.searchHighlightFeature.set(null);
    }

    openAboutDialog(): void {
        this.dialog.open(AboutDialogComponent);
    }

    private zoomToFeature({ geometry }: Feature): void {
        const mapInstance = this.map().mapInstance;

        if (!mapInstance) {
            return;
        }

        const bounds = getGeometryPositions(geometry as HighlightableGeometry).reduce(
            (initialBounds, position) => initialBounds.extend(position as LngLatLike),
            new LngLatBounds(),
        );
        mapInstance.fitBounds(bounds, {
            maxZoom: ZoomLevel.High + 0.5,
            padding: 60,
            offset: [0, -55],
        });
    }

    private getHighlightLayerType(
        geometryType: HighlightableGeometry['type'],
    ): 'polygon' | 'line' | 'point' {
        const layerTypes = {
            Polygon: 'polygon',
            MultiPolygon: 'polygon',
            LineString: 'line',
            MultiLineString: 'line',
            Point: 'point',
        } as const;
        return layerTypes[geometryType];
    }

    private hasCard({ properties, geometry }: Feature): boolean {
        return geometry.type === 'Point' || properties.id === 'the-wall';
    }

    private openCard(feature: Feature): void {
        this.onFeatureLeave();

        const bottomSheetRef = (this.bottomSheetRef = this.bottomSheet.open(CardComponent, {
            hasBackdrop: false,
            data: feature.properties as LocationData,
        }));

        bottomSheetRef.instance.goToLocation$
            .pipe(takeUntil(bottomSheetRef.afterDismissed()))
            .subscribe(() => this.zoomToFeature(feature));

        bottomSheetRef.afterDismissed().subscribe(() => {
            if (this.bottomSheetRef === bottomSheetRef) {
                this.searchComponent().setSelectedId(null);
            }
        });
    }

    private closeCard(): void {
        this.bottomSheet.dismiss();
    }

    private showTooltip(
        map: MapLayerMouseEvent['target'],
        { geometry, properties }: MapGeoJSONFeature,
        lngLat: LngLatLike,
    ): void {
        const anchor = geometry.type === 'Point' ? (geometry.coordinates as LngLatLike) : lngLat;

        this.popup?.remove();
        this.tooltipRef?.destroy();
        this.popup = new Popup({
            closeButton: false,
            closeOnClick: false,
            className: 'cc-map-popup',
        })
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
        this.tooltipRef = this.viewContainerRef.createComponent(TooltipComponent);
        this.tooltipRef.setInput('location', location);
        this.tooltipRef.changeDetectorRef.detectChanges();
        return this.tooltipRef.location.nativeElement;
    }
}
