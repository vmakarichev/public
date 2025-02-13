import {Balloon, Color} from './widgets';
import {toDart, toJs} from './wrappers';
import {ColorType, MARKER_TYPE} from "./const";
import {Point, Rect, GridCell} from "./grid";

let api = <any>window;

declare global {
  interface CanvasRenderingContext2D {

    setFillStyle(fill: string | CanvasGradient | CanvasPattern): CanvasRenderingContext2D;

    setStrokeStyle(stroke: string | CanvasGradient | CanvasPattern): CanvasRenderingContext2D;

    roundRect(x: number, y: number, w: number, h: number, r: number): CanvasRenderingContext2D

    line(x1: number, y1: number, x2: number, y2: number, color: ColorType): CanvasRenderingContext2D;

    /**
     * Use stroke() or fill() after.
     * @param pa: Array of points
     */
    polygon(pa: Point[]): CanvasRenderingContext2D;

  }
}

CanvasRenderingContext2D.prototype.setFillStyle = function (fill: string | CanvasGradient | CanvasPattern) {
  this.fillStyle = fill;
  return this;
}

CanvasRenderingContext2D.prototype.setStrokeStyle = function (stroke: string | CanvasGradient | CanvasPattern) {
  this.strokeStyle = stroke;
  return this;
}

CanvasRenderingContext2D.prototype.roundRect = function (x: number, y: number, w: number, h: number, r: number) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  this.closePath();
  return this;
}

CanvasRenderingContext2D.prototype.line = function (x1, y1, x2, y2, color) {
  this.beginPath();
  this.strokeStyle = Color.toRgb(color);
  this.moveTo(x1, y1);
  this.lineTo(x2, y2);
  this.stroke();

  return this;
}

CanvasRenderingContext2D.prototype.polygon = function (pa: Point[]) {
  this.beginPath();

  const last_p = pa[pa.length - 1]
  this.moveTo(last_p.x, last_p.y);

  for (let p of pa) {
    this.lineTo(p.x, p.y);
  }
  this.closePath();

  return this;
}


export namespace Paint {

  export function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): CanvasRenderingContext2D {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
    return g;
  }

  /** Renders a marker */
  export function marker(g: CanvasRenderingContext2D, markerType: MARKER_TYPE, x: number, y: number, color: number, size: number) {
    api.grok_Paint_Marker(g, markerType, x, y, color, size);
  }

  /** Renders a PNG image from bytes */
  export function pngImage(g: CanvasRenderingContext2D, bounds: Rect, imageBytes: Uint8Array) {
    let r = new FileReader();
    r.readAsBinaryString(new Blob([imageBytes]));

    r.onload = function() {
      let img = new Image();

      img.onload = function() {
        bounds = new Rect(bounds.x, bounds.y, bounds.width, bounds.height).fit(img.width, img.height)
        g.drawImage(img, bounds.x, bounds.y, bounds.width, bounds.height);
      }

      img.src = "data:image/jpeg;base64," + window.btoa(r.result as string);
    };
  }
}

export class Utils {
  /** @param {Iterable} iterable*/
  static firstOrNull<T>(iterable: Iterable<T>): T | null {
    let first = iterable[Symbol.iterator]().next();
    return first.done ? null : first.value;
  }

  /** Returns an 'identity' array where the element in idx-th position is equals to idx. */
  static identity(length: number) {
    let res = new Uint32Array(length);
    for (let i = 0; i < length; i++)
      res[i] = i;
    return res;
  }

  static replaceAll(string: string, search: string, replace: string) {
    return string.split(search).join(replace);
  }

  static isEmpty(s?: string) {
    return !s || s === '';
  }

  static nullIfEmpty(s?: string) {
    return Utils.isEmpty(s) ? null : s;
  }

  /** Shows "Open File" dialog, and lets you process the result. */
  static openFile(options: {accept: string, open: (file: File) => void}): void {
    let input: HTMLInputElement = document.createElement('input');
    input.type = 'file';
    input.multiple = false;
    input.accept = options.accept ?? '';
    input.onchange = _this => {
        options.open(input.files![0]);
    };
    input.click();
  }

  /** Shows "Open File" dialog, and lets you process the result. */
  static openFileBytes(options: {accept: string, open: (bytes: Uint8Array) => void}): void {
    Utils.openFile({
      accept: options.accept,
      open: (f) => {
        var reader = new FileReader();
        reader.onload = () => {
          options.open(new Uint8Array(reader.result as ArrayBuffer));
        };
        reader.readAsArrayBuffer(f);
      }
    })
  }

  /** Downloads the specified content locally */
  static download(filename: string, content: BlobPart, contentType?: string) {
    contentType = contentType ?? 'application/octet-stream';
    const a = document.createElement('a');
    const blob = new Blob([content], {'type':contentType});
    a.href = window.URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }
}


/** A proxy to a Dart List<T>. */
export class DartList<T> implements Iterable<T> {
  dart: any;

  /** Creates a proxy to an existing Dart list. */
  static fromDart<T>(dart: any): DartList<T> {
    let list = new DartList();
    list.dart = dart;
    return list as DartList<T>;
  }

  [key: number]: any;

  /** Returns the number of objects in this list. */
  get length(): number { return api.grok_List_Get_Length(this.dart); }

  /** Removes all objects from this list; the length of the list becomes zero. */
  clear() { api.grok_List_Clear(this.dart); }

  /** Sorts this list. */
  sort() { api.grok_List_Sort(this.dart); }

  /** Adds [value] to the end of this list, extending the length by one. */
  push(value: T) { api.grok_List_Add(this.dart, value); }

  /** Returns the object at the given [index] in the list. */
  get(index: number): T { return api.grok_List_Get(this.dart, index); }

  /** Sets the value at the given [index] in the list to [value]. */
  set(index: number, value: T): T { return api.grok_List_Get(this.dart, index, value); }

  includes(item: T, start?: number) {
    const length = this.length;
    for (let i = (start ? start : 0); i < length; i++) {
      if (this.get(i) === item)
        return true;
    }
    return false;
  }

  * [Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this.length; i++)
      yield this.get(i);
  }
}


/** Html-related utilities */
export namespace HtmlUtils {

  /** Renders the element to canvas */
  export function renderToCanvas(element: HTMLElement, ratio: number = 1): Promise<HTMLCanvasElement> {
    return api.grok_HtmlUtils_RenderToCanvas(element, ratio);
  }
}

/**
 * Proxies a Dart Map, API-compliant to ES 2015+
 */
export const MapProxy = new Proxy(class {
    dart: any;
    objectName: string | null;
    valueType: string | null;
    constructor(dart: any, objectName: string | null = null, valueType: string | null = null) {
      this.dart = dart;
      this.objectName = objectName;
      this.valueType = valueType;
    }
    keys(): Iterable<any> {
      return _toIterable(api.grok_Map_Keys(this.dart));
    }
    values() {
      return _toIterable(toJs(api.grok_Map_Values(this.dart)));
    }
    * [Symbol.iterator] () {
      for (let key of this.keys()) {
        const value = toJs(api.grok_Map_Get(this.dart, key));
        yield [key, toJs(value)];
      }
    }
    entries() {
      return this;
    }
    forEach(callback: (key: string, value: any) => void) {
      for (const [key, value] of this) {
        callback(key, toJs(value));
      }
    }
    delete(key: string) {
      return toJs(api.grok_Map_Delete(this.dart, toDart(key)));
    }
    get(key: any) {
      return toJs(api.grok_Map_Get(this.dart, key));
    }
    has(key: string) {
      return api.grok_Map_Has(this.dart, toDart(key));
    }
    set(key: string, value: any) {
      api.grok_Map_Set(this.dart, key, toDart(value));
      return this;
    }
    clear() {
      api.grok_Map_Clear(this.dart);
    }
    size() {
      return toJs(api.grok_Map_Size(this.dart));
    }
  }, {
    construct(target, args) {
      // @ts-ignore
      return new Proxy(new target(...args), {
        get: function (target: any, prop) {
          const val = target[prop];
          if (typeof val === 'function') {
            return function (...args :string[]) {
              return val.apply(target, args);
            };
          } else {
            return toJs(api.grok_Map_Get(target.dart, prop));
          }
        },
        set: function (target, prop, value) {
          const valueType = typeof(value);
          if (!target.valueType || target.valueType === valueType) {
            api.grok_Map_Set(target.dart, prop, toDart(value));
          } else {
            throw new Error(`Entries of ${target.objectName} require type '${target.valueType}', passed '${valueType}'`);
          }
          return true;
        },
        deleteProperty: function (target, prop) {
          api.grok_Map_Delete(target.dart, toDart(prop));
          return true;
        },
        has: function (target, prop) {
          return api.grok_Map_Has(target.dart, toDart(prop));
        },
        getOwnPropertyDescriptor(target, prop) {
          return {
            enumerable: true,
            configurable: true
          };
        },
        ownKeys: function (target) {
          return Array.from(target.keys());
        }
      });
    }
  }
);

// export class PropProxy {
//     constructor(dart) {
//         this.dart = dart;
//         return new Proxy({}, {
//             get: function(target, prop) { return DG.toJs(api.grok_PropMixin_Get(dart, prop)); },
//             set: function(target, prop, value) { api.grok_PropMixin_Set(dart, prop, DG.toDart(value)); }
//         })
//     }
// }


export function _toIterable(dart: any): Iterable<any> {
  let iterable = {};
  // @ts-ignore
  iterable[Symbol.iterator] = () => _getIterator(dart);
  // @ts-ignore
  return iterable;
}

export function _getIterator(dart: any) {
  let iterator = api.grok_Iterable_Get_Iterator(dart);
  return {
    next: function () {
      return api.grok_Iterator_MoveNext(iterator) ?
        {value: toJs(api.grok_Iterator_Current(iterator)), done: false} :
        {done: true};
    }
  };
}

export function _isDartium() {
  return Array
    .from(document.getElementsByTagName('script'))
    .some((s) => {
      let a = s.getAttribute('src');
      if (a == null)
        return null;
      return a.includes('dart.js');
    });
}

export function _jsThen(promise: Promise<any>, f: (value: any) => any) {
  promise.then(f);
}

export function _toJson(x: any) {
  return x === null ? null : JSON.stringify(x);
}

export function* range(length: number) {
  for (let i = 0; i < length; i++)
    yield i;
}

/** Returns an 'identity' array where the element in idx-th position is equals to idx. */
export function identity(length: number) {
  let res = new Uint32Array(length);
  for (let i = 0; i < length; i++)
    res[i] = i;
  return res;
}

/*window.onerror = function (message, url, lineNumber, columnNumber, errorObject) {
    return api.grok_Error(message, url, lineNumber, columnNumber, errorObject);
};*/

/** Times the execution of function f
 * @param {string} name - a label for the execution time to display
 * @param {Function} f - function with no parameters that will get measured
 * @returns {value} - a value which f returns
 * */
export function time(name: string, f: Function) {
  let start = new Date();
  let result = f();
  let stop = new Date();
  // @ts-ignore
  console.log(`${name}: ${stop - start} ms`);
  // @ts-ignore
  new Balloon().info(`${name}: ${stop - start} ms`);
  return result;
}

/** Times the execution of asyncronous function f
 * @async
 * @param {string} name - a label for the execution time to display
 * @param {Function} f - async function with no parameters that will get measured
 * @returns {Promise<value>} - a promise for the value which f returns
 * */
export async function timeAsync(name: string, f: Function) {
  let start = new Date();
  let result = await f();
  let stop = new Date();
  // @ts-ignore
  console.log(`${name}: ${stop - start} ms`);
  // @ts-ignore
  new Balloon().info(`${name}: ${stop - start} ms`);
  return result;
}

export function _identityInt32(length: number): Int32Array {
  let values = new Int32Array(length);
  for (let i = 0; i < length; i++)
    values[i] = i;
  return values;
}


/**
 * Least recently used cache.
 * Inspired by https://github.com/Yomguithereal/mnemonist/blob/master/lru-cache.js
 * */
export class LruCache<K = any, V = any> {
  private capacity: number;
  public onItemEvicted: Function | null;
  private items: {};
  private tail: number;
  private forward: Uint16Array;
  private backward: Uint16Array;
  private V: any[];
  private K: any[];
  private size: number;
  private head: number;

  constructor(capacity: number = 100) {
    this.capacity = capacity;
    this.forward = new Uint16Array(this.capacity);
    this.backward = new Uint16Array(this.capacity);
    this.V = new Array(this.capacity);
    this.K = new Array(this.capacity);
    this.size = 0;
    this.head = 0;
    this.tail = 0;
    this.items = {};
    this.onItemEvicted = null;
  }

  /**
   * Splays a value on top.
   * @param {number} pointer - Pointer of the value to splay on top.
   * @return {LruCache}
   */
  splayOnTop(pointer: number): LruCache<K, V> {
    let oldHead = this.head;

    if (this.head === pointer)
      return this;

    let previous = this.backward[pointer];
    let next = this.forward[pointer];

    if (this.tail === pointer)
      this.tail = previous;
    else
      this.backward[next] = previous;

    this.forward[previous] = next;
    this.backward[oldHead] = pointer;
    this.head = pointer;
    this.forward[pointer] = oldHead;

    return this;
  }


  /**
   * Checks whether the key exists in the cache.
   *
   * @param  {any} key   - Key.
   */
  has(key: any): boolean {
    return key in this.items;
  }

  /**
   * Sets the value for the given key in the cache.
   *
   * @param  {any} key   - Key.
   * @param  {any} value - Value.
   */
  set(key: any, value: any): void {

    // The key already exists, we just need to update the value and splay on top
    // @ts-ignore
    let pointer = this.items[key];

    if (typeof pointer !== 'undefined') {
      this.splayOnTop(pointer);
      this.V[pointer] = value;

      return;
    }

    // The cache is not yet full
    if (this.size < this.capacity) {
      pointer = this.size++;
    }

    // Cache is full, we need to drop the last value
    else {
      pointer = this.tail;
      this.tail = this.backward[pointer];
      if (this.onItemEvicted != null)
        this.onItemEvicted(this.V[pointer]);
      // @ts-ignore
      delete this.items[this.K[pointer]];
    }

    // Storing key & value
    // @ts-ignore
    this.items[key] = pointer;
    this.K[pointer] = key;
    this.V[pointer] = value;

    // Moving the item at the front of the list
    this.forward[pointer] = this.head;
    this.backward[this.head] = pointer;
    this.head = pointer;
  }

  /**
   * Gets the value attached to the given key, and makes it the most recently used item.
   *
   * @param  {any} key - Key.
   */
  get(key: any): V | undefined {
    // @ts-ignore
    let pointer = this.items[key];

    if (typeof pointer === 'undefined')
      return undefined;

    this.splayOnTop(pointer);

    return this.V[pointer];
  }

  /**
   * Returns the value with the specified key, if it already exists in the cache,
   * or creates a new one by calling the provided function.
   *
   * @param  {any} key   - Key.
   * @param  {Function} createFromKey - Function to create a new item.
   * @return {any}
   */
  getOrCreate(key: K, createFromKey: (key: K) => V): V {
    let value = this.get(key);
    if (value !== undefined)
      return value;
    else {
      let item = createFromKey(key);
      this.set(key, item);
      return item;
    }
  }
}

/**
 * @param {HTMLElement} element
 * @param {string | ElementOptions | null} options
 * @returns {HTMLElement}
 * */
export function _options(element: HTMLElement, options: any) {
  if (options == null)
    return element;
  if (typeof options === 'string')
    element.className += ` ${options.replace(/,/g, ' ')}`;
  if (options.id != null)
    element.id = options.id;
  if (options.classes != null)
    element.className += ` ${options.classes}`;
  if (options.style != null)
    Object.assign(element.style, options.style);
  if (options.processNode != null)
    options.processNode(element);
  if (options.onClick != null)
    element.addEventListener('click', options.onClick);
  return element;
}

/**
 * Converts entity properties between JavaScript and Dart.
 * See also: {@link include}
 */
export function _propsToDart(s: string, cls: string): string {
  const jsToDart: { [indes:string] : {[index: string]: string} } = {
    'Group' : {
      'adminMemberships': 'parents.parent',
      'memberships': 'parents.parent',
      'members': 'children.child',
      'adminMembers': 'children.child',
    },
    'Project': {
      'children': 'relations.entity',
      'links': 'relations.entity'
    },
    'Function': {
      'inputs': 'params',
      'outputs': 'params'
    }
  };

  let propsMap = jsToDart[cls];
  if (!propsMap)
    return s;
  let res = '';
  if (s === res) return res;
  let ents = s.split(',');
  for (let ent of ents) {
    let props = ent.trim();

    while (props) {
      let idx = props.indexOf('.');
      let match = propsMap[props];
      if (match) res += match;
      else {
        let p = (idx === -1) ? props : props.slice(0, idx);
        res += propsMap[p] || p;
      }
      if (idx === -1) props = '';
      else {
        props = props.slice(idx + 1);
        res += '.';
      }
    }

    res += ',';
  }
  return res;
}

export function format(x: number, format?: string): string {
  return api.grok_Utils_FormatNumber(x, format);
}
