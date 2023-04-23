/// <reference types="jsdom" />
/// <reference types="jsdom" />
/**
 * Configuration object.
 * @typedef {object} ToJmlConfig
 * @property {boolean} [stringOutput=false] Whether to output the Jamilih object as a string.
 * @property {boolean} [reportInvalidState=true] If true (the default), will report invalid state errors
 * @property {boolean} [stripWhitespace=false] Strip whitespace for text nodes
 */
/**
 * @typedef {[namespace: string|null, name: string, value?: string]} JamilihAttributeNodeValue
 */
/**
 * @typedef {{
 *   $attribute: JamilihAttributeNodeValue
 * }} JamilihAttributeNode
 */
/**
 * @typedef {{
 *   $text: string
 * }} JamilihTextNode
 */
/**
 * @typedef {['![', string]} JamilihCDATANode
 */
/**
 * @typedef {['&', string]} JamilihEntityReference
 */
/**
 * @typedef {[code: '?', target: string, value: string]} JamilihProcessingInstruction
 */
/**
 * @typedef {[code: '!', value: string]} JamilihComment
 */
/**
 * @typedef {{
 *   nodeType: number,
 *   nodeName: string
 * }} Entity
 */
/**
 * Polyfill for `DOMException`.
 */
export class DOMException extends Error {
    /**
     * @param {string} message
     * @param {string} name
     */
    constructor(message: string, name: string);
    code: number;
}
export default jml;
export type AttributeArray = JamilihAttributes;
export type ChildrenToJMLCallback = (childNodeJML: JamilihArray | JamilihChildType | string, i: Integer) => void;
/**
 * Keep this in sync with `JamilihArray`'s first argument (minus `Document`).
 */
export type JamilihFirstArg = JamilihDoc | JamilihDoctype | JamilihTextNode | JamilihAttributeNode | JamilihOptions | ElementName | Element | JamilihDocumentFragment;
export type JamilihAppender = (childJML: JamilihArray | JamilihFirstArg | Node) => void;
export type appender = (childJML: JamilihArray | JamilihFirstArg | Node) => void;
export type JamilihReturn = Element | DocumentFragment | Comment | Attr | Text | Document | DocumentType | ProcessingInstruction | CDATASection;
/**
 * Can either be an array of:
 * 1. JamilihAttributes followed by an array of JamilihArrays or Elements.
 *     (Cannot be multiple single JamilihArrays despite TS type).
 * 2. Any number of JamilihArrays.
 */
export type TemplateJamilihArray = [(JamilihAttributes | [string | Element | Document | DocumentFragment | JamilihOptions | JamilihDoc | JamilihDoctype | JamilihTextNode | JamilihAttributeNode | JamilihDocumentFragment, (string | Element | Document | globalThis.ShadowRoot | DocumentFragment | JamilihAttributes | JamilihChildren | null | undefined)?, (string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null | undefined)?, ...(string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null)[]] | [string | Element | Document | DocumentFragment | JamilihOptions | JamilihDoc | JamilihDoctype | JamilihTextNode | JamilihAttributeNode | JamilihDocumentFragment, (string | Element | Document | globalThis.ShadowRoot | DocumentFragment | JamilihAttributes | JamilihChildren | null | undefined)?, (string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null | undefined)?, ...(string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null)[]][] | Element), ...([string | Element | Document | DocumentFragment | JamilihOptions | JamilihDoc | JamilihDoctype | JamilihTextNode | JamilihAttributeNode | JamilihDocumentFragment, (string | Element | Document | globalThis.ShadowRoot | DocumentFragment | JamilihAttributes | JamilihChildren | null | undefined)?, (string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null | undefined)?, ...(string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null)[]] | [string | Element | Document | DocumentFragment | JamilihOptions | JamilihDoc | JamilihDoctype | JamilihTextNode | JamilihAttributeNode | JamilihDocumentFragment, (string | Element | Document | globalThis.ShadowRoot | DocumentFragment | JamilihAttributes | JamilihChildren | null | undefined)?, (string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null | undefined)?, ...(string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null)[]][] | Element)[]];
export type ShadowRootJamilihArrayContainer = ([string | Element | Document | DocumentFragment | JamilihOptions | JamilihDoc | JamilihDoctype | JamilihTextNode | JamilihAttributeNode | JamilihDocumentFragment, (string | Element | Document | globalThis.ShadowRoot | DocumentFragment | JamilihAttributes | JamilihChildren | null | undefined)?, (string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null | undefined)?, ...(string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null)[]] | Element)[];
export type ShadowRoot = {
    open?: boolean | (Element | JamilihArray)[];
    closed?: boolean | (Element | JamilihArray)[];
    template?: string | HTMLTemplateElement | [Element | JamilihArray | JamilihAttributes | JamilihArray[], ...(Element | JamilihArray | JamilihArray[])[]];
    content?: (Element | JamilihArray)[];
};
export type XmlnsAttributeObject = {
    [key: string]: string;
};
export type XmlnsAttribute = null | XmlnsAttributeObject;
export type DatasetAttributeObject = {
    [key: string]: string | number | ((this: Element, ...args: any[]) => any);
};
export type StyleAttributeObject = string | {
    [key: string]: string | null;
} | undefined;
export type OnAttributeObject = {
    [key: string]: (this: Element, event?: Event) => void;
};
export type BooleanAttribute = boolean;
export type HandlerAttribute = ((...arg: any[]) => any) | {
    [key: string]: [(this: Element, ...arg: any[]) => any, (boolean | undefined)?] | ((this: Element, ...arg: any[]) => any);
};
export type StringifiableNumber = number;
export type JamilihDocumentType = {
    name: string;
    systemId?: string;
    publicId?: string;
};
export type DefineOptions = {
    extends?: string;
};
export type DefineMixin = {
    [key: string]: any;
};
export type DefineConstructor = {
    new (): HTMLElement;
    prototype: HTMLElement & {
        [key: string]: any;
    };
};
export type DefineObjectArray = [DefineConstructor | DefineMixin, DefineOptions?] | [DefineConstructor, DefineMixin?, DefineOptions?];
export type DefineObject = DefineObjectArray | DefineConstructor | DefineMixin;
export type SymbolObject = {
    [key: string]: any;
    elem?: Element | undefined;
};
export type SymbolArray = [string | symbol, SymbolObject | ((this: Element, ...args: any[]) => any)];
export type JamilihAttValue = (string | [string | Element | Document | DocumentFragment | JamilihOptions | JamilihDoc | JamilihDoctype | JamilihTextNode | JamilihAttributeNode | JamilihDocumentFragment, (string | Element | Document | globalThis.ShadowRoot | DocumentFragment | JamilihAttributes | JamilihChildren | null | undefined)?, (string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null | undefined)?, ...(string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null)[]] | ShadowRoot | StringifiableNumber | JamilihDocumentType | JamilihDocument | XmlnsAttribute | BooleanAttribute | HandlerAttribute | DefineObject | [string | symbol, SymbolObject | ((this: Element, ...args: any[]) => any)]);
export type DataAttributeObject = {
    [key: string]: string | number | ((this: Element, ...args: any[]) => any);
};
export type DataAttribute = {
    $data?: true | string[] | Map<any, any> | WeakMap<any, any> | DataAttributeObject | [
        Map<any, any> | WeakMap<any, any> | undefined,
        DataAttributeObject
    ];
};
export type StyleAttribute = {
    style?: StyleAttributeObject;
};
export type JamilihAttributes = {
    [key: string]: JamilihAttValue;
} & DataAttribute & StyleAttribute;
export type JamilihDocument = {
    title?: string;
    childNodes?: JamilihChildType[];
    $DOCTYPE?: JamilihDocumentType;
    head?: (string | Element | Text | Comment | DocumentFragment | ProcessingInstruction | JamilihArray | JamilihDocumentFragment | JamilihProcessingInstruction | PluginReference)[];
    body?: (string | Element | Text | Comment | DocumentFragment | ProcessingInstruction | JamilihArray | JamilihDocumentFragment | JamilihProcessingInstruction | PluginReference)[];
};
export type JamilihDoc = {
    $document: JamilihDocument;
};
export type JamilihDoctype = {
    $DOCTYPE: JamilihDocumentType;
};
export type JamilihDocumentFragment = {
    '#': ([string | Element | Document | DocumentFragment | JamilihOptions | JamilihDoc | JamilihDoctype | JamilihTextNode | JamilihAttributeNode | JamilihDocumentFragment, (string | Element | Document | globalThis.ShadowRoot | DocumentFragment | JamilihAttributes | JamilihChildren | null | undefined)?, (string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null | undefined)?, ...(string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null)[]] | TextNodeString | Element)[];
};
export type ElementName = string;
export type TextNodeString = string;
export type PluginReference = {
    [key: string]: string;
};
export type JamilihChildren = ([string | Element | Document | DocumentFragment | JamilihOptions | JamilihDoc | JamilihDoctype | JamilihTextNode | JamilihAttributeNode | JamilihDocumentFragment, (string | Element | Document | globalThis.ShadowRoot | DocumentFragment | JamilihAttributes | JamilihChildren | null | undefined)?, (string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null | undefined)?, ...(string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null)[]] | TextNodeString | Element | Comment | ProcessingInstruction | Text | DocumentFragment | [code: "?", target: string, value: string] | JamilihDocumentFragment | PluginReference)[];
/**
 * The optional 0th argument is an Jamilih options object or fragment.
 *
 * The first argument is the element to create (by lower-case name) or DOM element.
 *
 * The second optional argument are attributes to add with the key as the
 *   attribute name and value as the attribute value.
 * The third optional argument are an array of children for this element
 *   (but raw DOM elements are required to be specified within arrays since
 *   could not otherwise be distinguished from siblings being added).
 * The fourth optional argument are a sequence of sibling Elements, represented
 *   as DOM elements, or string/attributes/children sequences.
 * The fifth optional argument is the parent to which to attach the element
 *   (always the last unless followed by null, in which case it is the
 *   second-to-last).
 * The sixth last optional argument is null, used to indicate an array of elements
 *   should be returned.
 */
export type JamilihArray = [
    JamilihDoc | JamilihDoctype | JamilihTextNode | JamilihAttributeNode | JamilihOptions | ElementName | Element | Document | JamilihDocumentFragment | DocumentFragment,
    (ElementName | Element | DocumentFragment | Document | JamilihAttributes | (string | Element | Text | Comment | DocumentFragment | ProcessingInstruction | JamilihArray | JamilihDocumentFragment | JamilihProcessingInstruction | PluginReference)[] | JamilihAttributes | globalThis.ShadowRoot | null)?,
    ((string | Element | Text | Comment | DocumentFragment | ProcessingInstruction | JamilihArray | JamilihDocumentFragment | JamilihProcessingInstruction | PluginReference)[] | Element | ElementName | JamilihAttributes | globalThis.ShadowRoot | null)?,
    ...(ElementName | Element | JamilihAttributes | (string | Element | Text | Comment | DocumentFragment | ProcessingInstruction | JamilihArray | JamilihDocumentFragment | JamilihProcessingInstruction | PluginReference)[] | globalThis.ShadowRoot | null)[]
];
export type JamilihArrayPostOptions = [
    (string | Element | globalThis.ShadowRoot),
    ([string | Element | Document | DocumentFragment | JamilihOptions | JamilihDoc | JamilihDoctype | JamilihTextNode | JamilihAttributeNode | JamilihDocumentFragment, (string | Element | Document | globalThis.ShadowRoot | DocumentFragment | JamilihAttributes | JamilihChildren | null | undefined)?, (string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null | undefined)?, ...(string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null)[]][] | JamilihAttributes | Element | globalThis.ShadowRoot | null)?,
    ...([string | Element | Document | DocumentFragment | JamilihOptions | JamilihDoc | JamilihDoctype | JamilihTextNode | JamilihAttributeNode | JamilihDocumentFragment, (string | Element | Document | globalThis.ShadowRoot | DocumentFragment | JamilihAttributes | JamilihChildren | null | undefined)?, (string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null | undefined)?, ...(string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null)[]][] | Element | JamilihAttributes | globalThis.ShadowRoot | null)[]
];
export type MapWithRoot = {
    [key: string]: [Map<Element, any> | WeakMap<Element, any>, any];
    root: [Map<Element, any> | WeakMap<Element, any>, any];
};
export type TraversalState = "root" | "attributeValue" | "element" | "fragment" | "children" | "fragmentChildren";
export type JamilihOptions = {
    $state?: TraversalState | undefined;
    $plugins?: JamilihPlugin[] | undefined;
    $map?: [Map<Element, any> | WeakMap<Element, any>, any] | MapWithRoot | undefined;
};
export type HTMLWindow = Window & {
    DocumentFragment: any;
};
export type ArbitraryValue = any;
export type Integer = number;
export type PluginSettings = {
    element: Document | Element | DocumentFragment;
    attribute: {
        name: string | null;
        value: JamilihAttValue;
    };
    opts: JamilihOptions;
};
export type JamilihPlugin = {
    name: string;
    set: (opts: PluginSettings) => string;
};
/**
 * Configuration object.
 */
export type ToJmlConfig = {
    /**
     * Whether to output the Jamilih object as a string.
     */
    stringOutput?: boolean | undefined;
    /**
     * If true (the default), will report invalid state errors
     */
    reportInvalidState?: boolean | undefined;
    /**
     * Strip whitespace for text nodes
     */
    stripWhitespace?: boolean | undefined;
};
export type JamilihAttributeNodeValue = [namespace: string | null, name: string, value?: string];
export type JamilihAttributeNode = {
    $attribute: [namespace: string | null, name: string, value?: string | undefined];
};
export type JamilihTextNode = {
    $text: string;
};
export type JamilihCDATANode = ['![', string];
export type JamilihEntityReference = ['&', string];
export type JamilihProcessingInstruction = [code: '?', target: string, value: string];
export type JamilihComment = [code: '!', value: string];
export type Entity = {
    nodeType: number;
    nodeName: string;
};
export type JamilihChildType = [string | Element | Document | DocumentFragment | JamilihOptions | JamilihDoc | JamilihDoctype | JamilihTextNode | JamilihAttributeNode | JamilihDocumentFragment, (string | Element | Document | globalThis.ShadowRoot | DocumentFragment | JamilihAttributes | JamilihChildren | null | undefined)?, (string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null | undefined)?, ...(string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null)[]] | JamilihDoctype | ["![", string] | ["&", string] | [code: "?", target: string, value: string] | [code: "!", value: string] | JamilihDocumentFragment;
export type JamilihType = JamilihDoc | JamilihAttributeNode | JamilihChildType;
export type MapAndElementArray = [JamilihWeakMap | JamilihMap, Element];
export type MapCommand = {
    [key: string]: (elem: Element, ...args: any[]) => void;
} | ((elem: Element, ...args: any[]) => void);
/**
 * Creates an XHTML or HTML element (XHTML is preferred, but only in browsers
 * that support); any element after element can be omitted, and any subsequent
 * type or types added afterwards.
 * @param {JamilihArray} args
 * @returns {JamilihReturn} The newly created (and possibly already appended)
 *   element or array of elements
 */
export function jml(args_0: string | Element | Document | DocumentFragment | JamilihOptions | JamilihDoc | JamilihDoctype | JamilihTextNode | JamilihAttributeNode | JamilihDocumentFragment, args_1?: string | Element | Document | globalThis.ShadowRoot | DocumentFragment | JamilihAttributes | JamilihChildren | null | undefined, args_2?: string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null | undefined, ...args_3: (string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null)[]): JamilihReturn;
export namespace jml {
    /**
     * @typedef {JamilihArray|JamilihDoctype|
    *    JamilihCDATANode|JamilihEntityReference|JamilihProcessingInstruction|
    *    JamilihComment|JamilihDocumentFragment} JamilihChildType
     */
    /**
     * @typedef {JamilihDoc|JamilihAttributeNode|JamilihChildType} JamilihType
     */
    /**
    * Converts a DOM object or a string of HTML into a Jamilih object (or string).
    * @param {string|HTMLElement|Node|Entity} nde If a string, will parse as document
    * @param {ToJmlConfig} [config] Configuration object
    * @throws {TypeError}
    * @returns {JamilihType|string} Array containing the elements which represent
    * a Jamilih object, or, if `stringOutput` is true, it will be the stringified
    * version of such an object
    */
    export function toJML(nde: string | Node | HTMLElement | Entity, { stringOutput, reportInvalidState, stripWhitespace }?: ToJmlConfig | undefined): string | JamilihType;
    /**
     * @param {string|HTMLElement} dom
     * @param {ToJmlConfig} [config]
     * @returns {string}
     */
    export function toJMLString(dom: string | HTMLElement, config?: ToJmlConfig | undefined): string;
    /**
     *
     * @param {JamilihArray} args
     * @returns {JamilihReturn}
     */
    export function toDOM(args_0: string | Element | Document | DocumentFragment | JamilihOptions | JamilihDoc | JamilihDoctype | JamilihTextNode | JamilihAttributeNode | JamilihDocumentFragment, args_1?: string | Element | Document | globalThis.ShadowRoot | DocumentFragment | JamilihAttributes | JamilihChildren | null | undefined, args_2?: string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null | undefined, ...args_3: (string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null)[]): JamilihReturn;
    /**
     *
     * @param {JamilihArray} args
     * @returns {string}
     */
    export function toHTML(args_0: string | Element | Document | DocumentFragment | JamilihOptions | JamilihDoc | JamilihDoctype | JamilihTextNode | JamilihAttributeNode | JamilihDocumentFragment, args_1?: string | Element | Document | globalThis.ShadowRoot | DocumentFragment | JamilihAttributes | JamilihChildren | null | undefined, args_2?: string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null | undefined, ...args_3: (string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null)[]): string;
    /**
     *
     * @param {JamilihArray} args
     * @returns {string}
     */
    export function toDOMString(args_0: string | Element | Document | DocumentFragment | JamilihOptions | JamilihDoc | JamilihDoctype | JamilihTextNode | JamilihAttributeNode | JamilihDocumentFragment, args_1?: string | Element | Document | globalThis.ShadowRoot | DocumentFragment | JamilihAttributes | JamilihChildren | null | undefined, args_2?: string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null | undefined, ...args_3: (string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null)[]): string;
    /**
     *
     * @param {JamilihArray} args
     * @returns {string}
     */
    export function toXML(args_0: string | Element | Document | DocumentFragment | JamilihOptions | JamilihDoc | JamilihDoctype | JamilihTextNode | JamilihAttributeNode | JamilihDocumentFragment, args_1?: string | Element | Document | globalThis.ShadowRoot | DocumentFragment | JamilihAttributes | JamilihChildren | null | undefined, args_2?: string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null | undefined, ...args_3: (string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null)[]): string;
    /**
     *
     * @param {JamilihArray} args
     * @returns {string}
     */
    export function toXMLDOMString(args_0: string | Element | Document | DocumentFragment | JamilihOptions | JamilihDoc | JamilihDoctype | JamilihTextNode | JamilihAttributeNode | JamilihDocumentFragment, args_1?: string | Element | Document | globalThis.ShadowRoot | DocumentFragment | JamilihAttributes | JamilihChildren | null | undefined, args_2?: string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null | undefined, ...args_3: (string | Element | globalThis.ShadowRoot | JamilihAttributes | JamilihChildren | null)[]): string;
    export { JamilihMap as Map };
    export { JamilihWeakMap as WeakMap };
    /**
     * @typedef {[JamilihWeakMap|JamilihMap, Element]} MapAndElementArray
     */
    /**
     * @param {{[key: string]: any}} obj
     * @param {JamilihArrayPostOptions} args
     * @returns {MapAndElementArray}
     */
    export function weak(obj: {
        [key: string]: any;
    }, args_0: string | Element | globalThis.ShadowRoot, args_1?: Element | globalThis.ShadowRoot | JamilihAttributes | JamilihArray[] | null | undefined, ...args_2: (Element | globalThis.ShadowRoot | JamilihAttributes | JamilihArray[] | null)[]): MapAndElementArray;
    /**
     * @param {ArbitraryValue} obj
     * @param {JamilihArrayPostOptions} args
     * @returns {MapAndElementArray}
     */
    export function strong(obj: any, args_0: string | Element | globalThis.ShadowRoot, args_1?: Element | globalThis.ShadowRoot | JamilihAttributes | JamilihArray[] | null | undefined, ...args_2: (Element | globalThis.ShadowRoot | JamilihAttributes | JamilihArray[] | null)[]): MapAndElementArray;
    export function symbol(element: string | Element, sym: string | symbol): any;
    export function sym(element: string | Element, sym: string | symbol): any;
    function _for(element: string | Element, sym: string | symbol): any;
    export { _for as for };
    /**
     * @typedef {((elem: Element, ...args: any[]) => void)|{[key: string]: (elem: Element, ...args: any[]) => void}} MapCommand
     */
    /**
     * @param {?(string|Element)} elem If a string, will be interpreted as a selector
     * @param {symbol|string|Map<Element, MapCommand>|WeakMap<Element, MapCommand>} symOrMap If a string, will be used with `Symbol.for`
     * @param {string|any} methodName Can be `any` if the symbol or map directly
     *   points to a function (it is then used as the first argument).
     * @param {ArbitraryValue[]} args
     * @returns {ArbitraryValue}
     */
    export function command(elem: string | Element | null, symOrMap: string | symbol | Map<Element, MapCommand> | WeakMap<Element, MapCommand>, methodName: any, ...args: any[]): any;
    /**
     * Expects properties `document`, `XMLSerializer`, and `DOMParser`.
     * Also updates `body` with `document.body`.
     * @param {import('jsdom').DOMWindow|HTMLWindow} wind
     * @returns {void}
     */
    export function setWindow(wind: import("jsdom").DOMWindow | HTMLWindow): void;
    /**
     * @returns {import('jsdom').DOMWindow|HTMLWindow}
     */
    export function getWindow(): import("jsdom").DOMWindow | HTMLWindow;
}
/**
 * @param {string} sel
 * @returns {Element|null}
 */
export function $(sel: string): Element | null;
/**
 * @param {string} sel
 * @returns {Element[]}
 */
export function $$(sel: string): Element[];
export const nbsp: " ";
/**
 * @type {HTMLBodyElement}
 */
export let body: HTMLBodyElement;
/**
 * Does not run Jamilih so can be further processed.
 * @param {ArbitraryValue[]} array
 * @param {ArbitraryValue} glu
 * @returns {ArbitraryValue[]}
 */
export function glue(array: ArbitraryValue[], glu: ArbitraryValue): ArbitraryValue[];
/**
 * Element-aware wrapper for `WeakMap`.
 * @extends {WeakMap<any>}
 */
declare class JamilihWeakMap extends WeakMap<any, any> {
    constructor(entries?: readonly [any, any][] | null | undefined);
    constructor(iterable: Iterable<readonly [any, any]>);
    /**
     * @param {Element} element
     * @returns {ArbitraryValue}
     */
    get(element: Element): ArbitraryValue;
    /**
     * @param {Element} element
     * @param {ArbitraryValue} value
     * @returns {ArbitraryValue}
     */
    set(element: Element, value: ArbitraryValue): ArbitraryValue;
    /**
     * @param {string|Element} element
     * @param {string} methodName
     * @param {...ArbitraryValue} args
     * @returns {ArbitraryValue}
     */
    invoke(element: string | Element, methodName: string, ...args: ArbitraryValue[]): ArbitraryValue;
}
/**
 * Element-aware wrapper for `Map`.
 */
declare class JamilihMap extends Map<any, any> {
    constructor();
    constructor(entries?: readonly (readonly [any, any])[] | null | undefined);
    constructor();
    constructor(iterable?: Iterable<readonly [any, any]> | null | undefined);
    /**
     * @param {?(string|Element)} element
     * @returns {ArbitraryValue}
     */
    get(element: (string | Element) | null): ArbitraryValue;
    /**
     * @param {string|Element} element
     * @param {ArbitraryValue} value
     * @returns {ArbitraryValue}
     */
    set(element: string | Element, value: ArbitraryValue): ArbitraryValue;
    /**
     * @param {string|Element} element
     * @param {string} methodName
     * @param {...ArbitraryValue} args
     * @returns {ArbitraryValue}
     */
    invoke(element: string | Element, methodName: string, ...args: ArbitraryValue[]): ArbitraryValue;
}
//# sourceMappingURL=jml.d.ts.map