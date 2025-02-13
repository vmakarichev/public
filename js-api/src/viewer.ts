/** A viewer that is typically docked inside a [TableView]. */
import {FILTER_TYPE, TYPE, VIEWER, ViewerPropertyType, ViewerType} from "./const";
import {Column, DataFrame} from "./dataframe.js";
import {Property, PropertyOptions} from "./entities";
import {Menu, ObjectPropertyBag, Widget} from "./widgets";
import {_toJson, MapProxy} from "./utils";
import {toJs} from "./wrappers";
import {__obs, StreamSubscription} from "./events";
import * as rxjs from "rxjs";
import {Subscription} from "rxjs";
import {map} from 'rxjs/operators';
import {Grid, Point, Rect} from "./grid";
import {FormulaLinesHelper} from "./helpers";
import * as interfaces from "./interfaces/d4";
import dayjs from "dayjs";

declare let DG: any;
declare let ui: any;
let api = <any>window;

export class TypedEventArgs<TData> {
  dart: any;
  constructor(dart: any) {
    this.dart = dart;
  }

  get type(): string {
    return api.grok_TypedEventArgs_Get_Type(this.dart);
  }

  get data(): TData {
    let data = api.grok_TypedEventArgs_Get_Data(this.dart);
    return toJs(data);
  }
}

/**
 * Represents a {@link https://datagrok.ai/help/visualize/viewers | viewer}.
 * See also {@link https://datagrok.ai/help/develop/how-to/manipulate-viewers}
 *
 * Use Viewer to control the viewers. To develop a custom viewer, {@see JsViewer}.
 *
 * @example
 * let view = grok.shell.addTableView(grok.data.demo.demog());
 * view.scatterPlot({
     x: 'height',
     y: 'weight',
     size: 'age',
     color: 'race',
   });
 **/
export class Viewer<TSettings = any> extends Widget<TSettings> {

  public tags: any;
  private _meta: ViewerMetaHelper | undefined;

  /** @constructs Viewer */
  constructor(dart: any, root?: HTMLElement) {
    super(root ?? api.grok_Viewer_Root(dart));
    this.initDartObject(dart);
  }

  initDartObject(dart: any) {
    this.dart = dart;

    if (dart != null) {
      /** @member {ObjectPropertyBag} */
      // @ts-ignore
      this.props = new ObjectPropertyBag(this, api.grok_Viewer_Get_Look(this.dart));
      this.tags = new MapProxy(api.grok_Viewer_Get_Tags(this.dart), 'tags', 'string');
    }
  }

  /** Creates a new viewer of the specified type.
   * @param {ViewerType} viewerType
   * @param {DataFrame} table
   * @param options
   * @returns {Viewer} */
  static fromType(viewerType: ViewerType, table: DataFrame, options: object | null = null): Viewer {
    return toJs(api.grok_Viewer_FromType(viewerType, table.dart, _toJson(options)));
  }

  static getViewerTypes(): ViewerType[] {
    return api.grok_Viewer_GetViewerTypes();
  }

  /**
   *  Sets viewer options. See also {@link getOptions}
   *  Sample: {@link https://public.datagrok.ai/js/samples/ui/viewers/types/scatter-plot}
   *  @param {object} map */
  // add tsettings
  setOptions(map: { type?: ViewerType, [key: string]: any }): void {
    api.grok_Viewer_Options(this.dart, JSON.stringify(map));
  }

  /**
   * Gets the serialized viewer options. [includeDefaults] flag specifies whether the
   * properties with the default values should be returned. Not including default
   * properties makes it more clean and efficient for serialization purposes.
   *
   * See also {@link setOptions}
   *  Sample: https://public.datagrok.ai/js/samples/ui/viewers/types/scatter-plot
   *  @returns {object} */
  getOptions(includeDefaults: boolean = false): {id: string, type: ViewerType, look: {[key: string]: any}} {
    return JSON.parse(api.grok_Viewer_Serialize(this.dart, includeDefaults));
  }

  getInfo(): { [index: string]: any } {
    return api.grok_Viewer_GetInfo(this.dart);
  }

  getProperties(): Property[] {
    return api.grok_Viewer_Get_Properties(this.dart);
  }

  /** Closes and detaches the viewer. */
  close(): void {
    api.grok_Viewer_Close(this.dart);
  }

  /** Visual root.
   * @type {HTMLElement} */
  get root(): HTMLElement {
    return api.grok_Viewer_Root(this.dart);
  }

  get meta(): ViewerMetaHelper {
    if (this._meta == undefined)
      this._meta = new ViewerMetaHelper(this);
    return this._meta;
  }

  /** Returns viewer type (see VIEWER constants)
   * @returns {string} */
  get type(): ViewerType {
    return api.grok_Viewer_Get_Type(this.dart);
  }

  get table(): DataFrame {
    return toJs(api.grok_Viewer_Get_DataFrame(this.dart));
  }

  /** Returns a view this viewer is associated with, or null */
  get view(): any | null {
    return toJs(api.grok_Viewer_Get_View(this.dart));
  }

  /** @type {DataFrame} */
  get dataFrame(): DataFrame {
    return toJs(api.grok_Viewer_Get_DataFrame(this.dart));
  }

  set dataFrame(t: DataFrame) {
    api.grok_Viewer_Set_DataFrame(this.dart, t == null ? null : t.dart);
  }

  get helpUrl(): string {
    return api.grok_Viewer_Get_HelpUrl(this.dart);
  }

  set helpUrl(s: string) {
    api.grok_Viewer_Set_HelpUrl(this.dart, s);
  }

  static grid(t: DataFrame, options: object | null = null): Grid<interfaces.IGridLookSettings> {
    return new DG.Grid(api.grok_Viewer_Grid(t.dart, _toJson(options)));
  }

  static histogram(t: DataFrame, options: object | null = null): Viewer<interfaces.IHistogramLookSettings> {
    return new Viewer(api.grok_Viewer_Histogram(t.dart, _toJson(options)));
  }

  static barChart(t: DataFrame, options: object | null = null): Viewer<interfaces.IBarChartLookSettings> {
    return <Viewer>Viewer.fromType(VIEWER.BAR_CHART, t, options);
  }

  static heatMap(t: DataFrame, options: object | null = null): Viewer<interfaces.IGridLookSettings> {
    return <Viewer>Viewer.fromType(VIEWER.HEAT_MAP, t, options);
  }

  static boxPlot(t: DataFrame, options: object | null = null): Viewer<interfaces.IBoxPlotLookSettings> {
    return new Viewer(api.grok_Viewer_BoxPlot(t.dart, _toJson(options)));
  }

  static filters(t: DataFrame, options: object | null = null): Viewer<interfaces.IFiltersLookSettings> {
    return new Viewer(api.grok_Viewer_Filters(t.dart, _toJson(options)));
  }

  static scatterPlot(t: DataFrame, options: object | null = null): ScatterPlotViewer {
    return new ScatterPlotViewer(api.grok_Viewer_ScatterPlot(t.dart, _toJson(options)));
  }

  static lineChart(t: DataFrame, options: object | null = null): Viewer<interfaces.ILineChartLookSettings> {
    return new Viewer(api.grok_Viewer_LineChart(t.dart, _toJson(options)));
  }

  static network(t: DataFrame, options: object | null = null): Viewer<interfaces.INetworkDiagramLookSettings> {
    return <Viewer>Viewer.fromType(VIEWER.NETWORK_DIAGRAM, t, options);
  }

  static calendar(t: DataFrame, options: object | null = null): Viewer<interfaces.ICalendarLookSettings> {
    return <Viewer>Viewer.fromType(VIEWER.CALENDAR, t, options);
  }

  static correlationPlot(t: DataFrame, options: object | null = null): Viewer<interfaces.ICorrelationPlotLookSettings> {
    return <Viewer>Viewer.fromType(VIEWER.CORR_PLOT, t, options);
  }

  static densityPlot(t: DataFrame, options: object | null = null): Viewer<interfaces.IDensityPlotLookSettings> {
    return <Viewer>Viewer.fromType(VIEWER.DENSITY_PLOT, t, options);
  }

  static form(t: DataFrame, options: object | null = null): Viewer<interfaces.IFormLookSettings> {
    return <Viewer>Viewer.fromType(VIEWER.FORM, t, options);
  }

  static markup(t: DataFrame, options: object | null = null): Viewer<interfaces.IMarkupViewerLookSettings> {
    return <Viewer>Viewer.fromType(VIEWER.MARKUP, t, options);
  }

  static matrixPlot(t: DataFrame, options: object | null = null): Viewer<interfaces.IMatrixPlotLookSettings> {
    return <Viewer>Viewer.fromType(VIEWER.MATRIX_PLOT, t, options);
  }

  static pcPlot(t: DataFrame, options: object | null = null): Viewer<interfaces.IPcPlotLookSettings> {
    return <Viewer>Viewer.fromType(VIEWER.PC_PLOT, t, options);
  }

  static pieChart(t: DataFrame, options: object | null = null): Viewer<interfaces.IPieChartLookSettings> {
    return <Viewer>Viewer.fromType(VIEWER.PIE_CHART, t, options);
  }

  static scatterPlot3d(t: DataFrame, options: object | null = null): Viewer<interfaces.IScatterPlot3dLookSettings> {
    return <Viewer>Viewer.fromType(VIEWER.SCATTER_PLOT_3D, t, options);
  }

  static statistics(t: DataFrame, options: object | null = null): Viewer<interfaces.IStatsViewerLookSettings> {
    return <Viewer>Viewer.fromType(VIEWER.STATISTICS, t, options);
  }

  static tile(t: DataFrame, options: object | null = null): Viewer<interfaces.ITileViewerLookSettings> {
    return <Viewer>Viewer.fromType(VIEWER.TILE_VIEWER, t, options);
  }

  static treeMap(t: DataFrame, options: object | null = null): Viewer<interfaces.ITreeMapLookSettings> {
    return <Viewer>Viewer.fromType(VIEWER.TREE_MAP, t, options);
  }

  static trellisPlot(t: DataFrame, options: object | null = null): Viewer<interfaces.ITrellisPlotLookSettings> {
    return <Viewer>Viewer.fromType(VIEWER.TRELLIS_PLOT, t, options);
  }

  static wordCloud(t: DataFrame, options: object | null = null): Viewer<interfaces.IWordCloudLookSettings> {
    return <Viewer>Viewer.fromType(VIEWER.WORD_CLOUD, t, options);
  }

  get onContextMenu(): rxjs.Observable<Menu> {
    return this.onEvent('d4-context-menu').pipe(map(x => x.args.menu));
  }

  /** Observes platform events with the specified eventId. */
  onEvent(eventId: string | null = null): rxjs.Observable<any> {
    if (eventId !== null)
      return __obs(eventId, this.dart);

    let dartStream = api.grok_Viewer_Get_EventBus_Events(this.dart);
    return rxjs.fromEventPattern(
      function (handler) {
        return api.grok_Stream_Listen(dartStream, function (x: any) {
          handler(new TypedEventArgs(x));
        });
      },
      function (handler, dart) {
        new StreamSubscription(dart).cancel();
      }
    );
  }

  removeFromView() {
    return toJs(api.grok_Viewer_Remove_From_View(this.dart));
  }
}


/** Subclass JsViewer to implement a DataFrame-bound Datagrok viewer in JavaScript.
 *  See an example on github: {@link https://github.com/datagrok-ai/public/tree/master/packages/Leaflet}
 *  */
export class JsViewer extends Viewer {
  public dart: any;

  subs: Subscription[];
  obs: rxjs.Observable<any>[];
  props: ObjectPropertyBag;

  /** @constructs JsViewer */
  constructor() {
    let _root = ui.box();
    super(null, _root);

    this.dart = api.grok_Viewer_FromJsViewer(this);
    this.initDartObject(this.dart);
    this._root = _root;

    /** @type {StreamSubscription[]} */
    this.subs = [];  // stream subscriptions - will be canceled when the viewer is detached

    this.obs = [];

    /** @member {ObjectPropertyBag} */
    this.props = new ObjectPropertyBag(this);
  }

  onFrameAttached(dataFrame: DataFrame): void {
    this.onTableAttached();
  }

  get root(): HTMLElement { return this._root; }
  set root(r: HTMLElement) { this._root = r; }

  /** Gets called when a table is attached to the viewer. */
  onTableAttached(): void { }

  /** Gets called when this viewer is detached. */
  detach(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  /** Gets property by name (case-sensitive).
   * @param {string} name
   * @returns {Property} */
  getProperty(name: string): Property | undefined {
    return this.getProperties().find((p) => p.name === name);
  }

  getProperties(): Property[] {
    return this._properties;
  }

  /** cleanup() will get called when the viewer is disposed */
  protected registerCleanup(cleanup: Function): void {
    api.grok_Widget_RegisterCleanup(this.root, cleanup);
  }

  protected _obs(observable: rxjs.Observable<any>): rxjs.Observable<any> {
    this.obs.push(observable);
    return observable;
  }

  /** Returns the column bound to the specified data property.
   *  Note that "ColumnName" suffix (this determines whether this is a data property) should be omitted. */
  protected column(dataPropertyName: string, options: { [key: string]: any } & PropertyOptions | null = null): Column {
    return this.addProperty(`${dataPropertyName}ColumnName`, TYPE.STRING, null, options);
  }

  protected columnList(propertyName: ViewerPropertyType, defaultValue: string[] | null = null, options: { [key: string]: any } & PropertyOptions | null = null): string[] {
    return this.addProperty(propertyName, DG.TYPE.COLUMN_LIST, defaultValue, options);
  }

  /** Registers an integer property with the specified name and defaultValue */
  protected int(propertyName: ViewerPropertyType, defaultValue: number | null = null, options: { [key: string]: any } & PropertyOptions | null = null): number {
    return this.addProperty(propertyName, TYPE.INT, defaultValue, options);
  }

  /** Registers a floating point property with the specified name and defaultValue */
  protected float(propertyName: ViewerPropertyType, defaultValue: number | null = null, options: { [key: string]: any } & PropertyOptions | null = null): number {
    return this.addProperty(propertyName, TYPE.FLOAT, defaultValue, options);
  }

  /** Registers a string property with the specified name and defaultValue */
  protected string(propertyName: ViewerPropertyType, defaultValue: string | null = null, options: { [key: string]: any } & PropertyOptions | null = null): string {
    return this.addProperty(propertyName, TYPE.STRING, defaultValue, options);
  }

  /** Registers a string list property with the specified name and defaultValue */
  protected stringList(propertyName: ViewerPropertyType, defaultValue: string[] | null = null, options: { [key: string]: any } & PropertyOptions | null = null): string[] {
    return this.addProperty(propertyName, TYPE.STRING_LIST, defaultValue, options);
  }

  /** Registers a boolean property with the specified name and defaultValue */
  protected bool(propertyName: ViewerPropertyType, defaultValue: boolean | null = null, options: { [key: string]: any } & PropertyOptions | null = null): boolean {
    return this.addProperty(propertyName, TYPE.BOOL, defaultValue, options);
  }

  /** Registers a datetime property with the specified name and defaultValue */
  protected dateTime(propertyName: ViewerPropertyType, defaultValue: dayjs.Dayjs | null = null, options: { [key: string]: any } & PropertyOptions | null = null): dayjs.Dayjs {
    return this.addProperty(propertyName, TYPE.DATE_TIME, defaultValue, options);
  }
}


export interface FilterState {
  type: FILTER_TYPE | string;
  column?: string;
}


/** Represents a group of filters that are located together. */
export class FilterGroup extends Viewer {
  dart: any;

  constructor(dart: any) {
    super(dart);
  }

  add<T extends FilterState>(state: T) {
    api.grok_FilterGroup_Add(this.dart, state);
  }
}


/** 2D scatter plot */
export class ScatterPlotViewer extends Viewer<interfaces.IScatterPlotLookSettings> {
  constructor(dart: any) {
    super(dart);
  }

  /** Row hit test using canvas coords */
  hitTest(x: number, y: number): number {
    return api.grok_ScatterPlotViewer_HitTest(this.dart, x, y);
  }

  /** Zoom using world coords */
  zoom(x1: number, y1: number, x2: number, y2: number) {
    api.grok_ScatterPlotViewer_Zoom(this.dart, x1, y1, x2, y2);
  }

  get viewBox(): Rect { return toJs(api.grok_ScatterPlotViewer_Get_ViewBox(this.dart)); }
  get xAxisBox(): Rect { return toJs(api.grok_ScatterPlotViewer_Get_XAxisBox(this.dart)); }
  get yAxisBox(): Rect { return toJs(api.grok_ScatterPlotViewer_Get_YAxisBox(this.dart)); }

  get viewport(): Rect { return toJs(api.grok_ScatterPlotViewer_Get_Viewport(this.dart)); }
  set viewport(viewport: Rect) { api.grok_ScatterPlotViewer_Set_Viewport(this.dart, viewport.x, viewport.y, viewport.width, viewport.height); }

  /** Convert coords */
  worldToScreen(x: number, y: number): Point { return toJs(api.grok_ScatterPlotViewer_WorldToScreen(this.dart, x, y)); }
  screenToWorld(x: number, y: number): Point { return toJs(api.grok_ScatterPlotViewer_ScreenToWorld(this.dart, x, y)); }

  get onZoomed(): rxjs.Observable<Rect> { return this.onEvent('d4-scatterplot-zoomed'); }
  get onResetView(): rxjs.Observable<null> { return this.onEvent('d4-scatterplot-reset-view'); }
  get onViewportChanged(): rxjs.Observable<Rect> { return this.onEvent('d4-viewport-changed'); }
  get onAfterDrawScene(): rxjs.Observable<null> { return this.onEvent('d4-after-draw-scene'); }
  get onBeforeDrawScene(): rxjs.Observable<null> { return this.onEvent('d4-before-draw-scene'); }
}

export class ViewerMetaHelper {
  private readonly _viewer: Viewer;

  readonly formulaLines: ViewerFormulaLinesHelper;

  constructor(viewer: Viewer) {
    this._viewer = viewer;
    this.formulaLines = new ViewerFormulaLinesHelper(this._viewer);
  }
}

export class ViewerFormulaLinesHelper extends FormulaLinesHelper {
  readonly viewer: Viewer;

  get storage(): string { return this.viewer.props['formulaLines']; }
  set storage(value: string) { this.viewer.props['formulaLines'] = value; }

  constructor(viewer: Viewer) {
    super();
    this.viewer = viewer;
  }
}
