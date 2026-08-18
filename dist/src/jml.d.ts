export type HTMLWindow = Window & {
    DocumentFragment: typeof DocumentFragment;
};
export type ArbitraryValue = unknown;
export type StoredValue = unknown;
export type UserArg = any;
export type ElementExpando = any;
export type ExpandoHTMLElement = HTMLElement & {
    [key: string]: ElementExpando;
};
export type Integer = number;
export type PluginSettings = {
    element: Document | HTMLElement | DocumentFragment;
    attribute: {
        name: string | null;
        value: JamilihAttValue;
    };
    opts: JamilihOptions;
};
export type JamilihPlugin = {
    name: string;
    set: (opts: PluginSettings) => string | Promise<void>;
};
/**
 * @param {string} sel
 * @returns {HTMLElement|null}
 */
declare const $: (sel: string) => HTMLElement | null;
/**
 * @param {string} sel
 * @returns {HTMLElement[]}
 */
declare const $$: (sel: string) => HTMLElement[];
export type ChildrenToJMLCallback = (childNodeJML: JamilihArray | JamilihChildType | string, i: Integer) => void;
export type JamilihFirstArg = JamilihDoc | JamilihDoctype | JamilihTextNode | JamilihAttributeNode | JamilihOptions | ElementName | HTMLElement | JamilihDocumentFragment;
export type JamilihAppender = (childJML: JamilihArray | JamilihArrayLike | JamilihFirstArg | Node | TextNodeString) => void;
export type appender = (childJML: JamilihArray | JamilihArrayLike | JamilihFirstArg | Node | TextNodeString) => void;
export type JamilihReturn = HTMLElement | DocumentFragment | Comment | Attr | Text | Document | DocumentType | ProcessingInstruction | CDATASection;
export type TemplateJamilihArray = [(JamilihAttributes | JamilihArray | JamilihArray[] | HTMLElement), ...(JamilihArray | JamilihArray[] | HTMLElement)[]];
export type ShadowRootJamilihArrayContainer = (JamilihArray | HTMLElement)[];
export type JamilihShadowRootObject = {
    open?: boolean | ShadowRootJamilihArrayContainer;
    closed?: boolean | ShadowRootJamilihArrayContainer;
    template?: string | HTMLTemplateElement | TemplateJamilihArray;
    content?: ShadowRootJamilihArrayContainer | DocumentFragment;
};
export type XmlnsAttributeObject = {
    [key: string]: string;
};
export type XmlnsAttributeValue = null | XmlnsAttributeObject;
export type DatasetAttributeObject = {
    [key: string]: string | number | null | undefined | DatasetAttributeObject;
};
export type StyleAttributeValue = string | undefined | {
    [key: string]: string | null;
};
export type EventHandler<T extends HTMLElement = HTMLElement> = (this: T, event: Event & {
    target: T;
}) => void;
export type OnAttributeObject<T extends HTMLElement = HTMLElement> = {
    [key: string]: EventHandler<T> | [EventHandler<T>, boolean];
};
export type OnAttribute<T extends HTMLElement = HTMLElement> = {
    $on?: OnAttributeObject<T> | null;
};
export type BooleanAttribute = boolean;
export type HandlerAttributeValue = ((this: HTMLElement, event?: Event) => void);
export type OnHandlerObject = {
    [key: string]: HandlerAttributeValue;
};
export type StringifiableNumber = number;
export type JamilihDocumentType = {
    name: string;
    systemId?: string;
    publicId?: string;
};
export type DefineOptions = string | {
    extends?: string;
};
export type DefineMixin = {
    [key: string]: string | number | boolean | ((this: ElementExpando, ...args: UserArg[]) => UserArg);
};
export type DefineConstructor = {
    new (): HTMLElement;
    prototype: HTMLElement;
};
export type DefineUserConstructor = (this: HTMLElement) => void;
export type DefineObjectArray = [DefineConstructor | DefineUserConstructor | DefineMixin, DefineOptions?] | [DefineConstructor | DefineUserConstructor, DefineMixin?, DefineOptions?];
export type DefineObject = DefineObjectArray | DefineConstructor | DefineMixin | DefineUserConstructor;
export type SymbolObject<T = ArbitraryValue, U extends HTMLElement = HTMLElement> = T & {
    elem?: U;
};
export type SymbolMethod<T extends HTMLElement = HTMLElement> = (this: T, ...args: UserArg[]) => UserArg;
export type BoundSymbolMethod = (...args: UserArg[]) => UserArg;
export type SymbolArray<T extends HTMLElement = HTMLElement> = [symbol | string, SymbolMethod<T> | SymbolObject<ArbitraryValue, T>];
export type SymbolResult = BoundSymbolMethod | SymbolObject | ArbitraryValue;
export type NullableAttributeValue = null | undefined;
export type PluginValue = [string, object] | string | object;
export type JamilihAttValue = (string | NullableAttributeValue | BooleanAttribute | JamilihArray | JamilihShadowRootObject | StringifiableNumber | JamilihDocumentType | JamilihDocument | XmlnsAttributeValue | OnAttributeObject | HandlerAttributeValue | DefineObject | SymbolArray | PluginReference | PluginValue);
export type DataAttributeObject = {
    [key: string]: string | number | ((this: HTMLElement, ...args: UserArg[]) => UserArg);
};
export type DataAttribute = {
    $data?: true | string[] | Map<HTMLElement, UserArg> | WeakMap<HTMLElement, UserArg> | DataAttributeObject | [undefined, DataAttributeObject] | [Map<HTMLElement, UserArg> | WeakMap<HTMLElement, UserArg> | undefined, DataAttributeObject];
};
export type DatasetAttribute = {
    dataset?: DatasetAttributeObject;
};
export type StyleAttribute = {
    style?: StyleAttributeValue;
};
export type JamilihShadowRootAttribute = {
    $shadow?: JamilihShadowRootObject;
};
export type DefineAttribute = {
    is?: string | null;
    $define?: DefineObject;
};
export type CustomAttribute = {
    $custom?: {
        [key: string]: unknown;
    };
};
export type SymbolAttribute = {
    $symbol?: SymbolArray;
};
export type XmlnsAttribute = {
    xmlns?: string | null | XmlnsAttributeObject;
};
export type JamilihAttributes = DataAttribute & StyleAttribute & JamilihShadowRootAttribute & DefineAttribute & DatasetAttribute & CustomAttribute & SymbolAttribute & OnAttribute & XmlnsAttribute & Partial<JamilihAttributeNode> & Partial<JamilihTextNode> & Partial<JamilihDoc> & Partial<JamilihDoctype> & {
    [key: string]: JamilihAttValue | HandlerAttributeValue;
};
export type JamilihDocument = {
    title?: string;
    xmlDeclaration?: {
        version: string;
        encoding: string;
        standalone: boolean;
    };
    childNodes?: JamilihChildType[];
    $DOCTYPE?: JamilihDocumentType;
    head?: JamilihChildren;
    body?: JamilihChildren;
};
export type JamilihDoc = {
    $document: JamilihDocument;
};
export type JamilihDoctype = {
    $DOCTYPE: JamilihDocumentType;
};
export type JamilihDocumentFragmentContent = JamilihArray | TextNodeString | HTMLElement;
export type JamilihDocumentFragment = {
    '#': JamilihDocumentFragmentContent[];
};
export type ElementName = string;
export type TextNodeString = string | number;
export type PluginReference = {
    [key: string]: string;
};
export type JamilihFirstArgument = Document | ElementName | HTMLElement | DocumentFragment | JamilihDocumentFragment | JamilihDoc | JamilihDoctype | JamilihTextNode | JamilihAttributeNode;
export type JamilihArrayLike = (JamilihFirstArg | JamilihAttributes | JamilihArrayLike | TextNodeString | ShadowRoot | null)[];
export type JamilihChildren = (JamilihArray | JamilihArrayLike | TextNodeString | HTMLElement | Comment | ProcessingInstruction | Text | DocumentFragment | JamilihProcessingInstruction | JamilihDocumentFragment | PluginReference)[];
export type JamilihArray = [
    JamilihOptions | JamilihFirstArgument,
    (JamilihFirstArgument | JamilihAttributes | JamilihChildren | HTMLElement | ShadowRoot | null)?,
    (JamilihAttributes | JamilihChildren | HTMLElement | ShadowRoot | ElementName | null)?,
    ...(JamilihAttributes | JamilihChildren | HTMLElement | ShadowRoot | ElementName | null)[]
];
export type JamilihArrayPostOptions = [
    (string | HTMLElement | ShadowRoot),
    (JamilihArray[] | JamilihAttributes | HTMLElement | ShadowRoot | null)?,
    ...(JamilihArray[] | HTMLElement | JamilihAttributes | ShadowRoot | null)[]
];
export type MapWithRoot = {
    root: [Map<HTMLElement, UserArg> | WeakMap<HTMLElement, UserArg>, UserArg];
    [key: string]: [Map<HTMLElement, UserArg> | WeakMap<HTMLElement, UserArg>, UserArg];
};
export type TraversalState = "root" | "attributeValue" | "element" | "fragment" | "children" | "fragmentChildren";
export type JamilihOptions = {
    $state?: TraversalState;
    $plugins?: JamilihPlugin[];
    $map?: MapWithRoot | [Map<HTMLElement, UserArg> | WeakMap<HTMLElement, UserArg>, UserArg];
};
export type ValueOf<T> = T[keyof T];
export type RawCustomFromJamilihArray<T extends JamilihArray> = Extract<Extract<T[number], {
    $custom?: {
        [key: string]: unknown;
    };
}>['$custom'], object>;
export type HasXmlnsFromJamilihArray<T extends JamilihArray> = Extract<T[number], {
    xmlns: unknown;
}> extends never ? false : true;
export type ElementFromJamilihArray<T extends JamilihArray> = T extends [infer K, ...ArbitraryValue[]] ? (HasXmlnsFromJamilihArray<T> extends true ? Element : K extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[K] : HTMLElement) : Element;
export type WithCustomThis<A, E extends Element> = A extends {
    $custom: infer C;
} ? (C extends object ? Omit<A, '$custom'> & {
    $custom?: C & ThisType<E & C>;
} : A) : A;
export type JamilihArrayWithCustomThis<T extends JamilihArray, E extends Element> = {
    [K in keyof T]: WithCustomThis<T[K], E>;
};
export type CustomFromJamilihArray<T extends JamilihArray> = (RawCustomFromJamilihArray<T> extends never ? object : RawCustomFromJamilihArray<T>);
export type ResolvedElement<U, W> = U extends void ? (ExpandoHTMLElement & W) : (U & W);
declare function jml<T extends JamilihArray, U extends T extends [infer K, ...ArbitraryValue[]] ? (HasXmlnsFromJamilihArray<T> extends true ? Element : K extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[K] : K extends string ? HTMLElement : void) : void, E extends ElementFromJamilihArray<T>, W extends CustomFromJamilihArray<T>>(...args: JamilihArrayWithCustomThis<T, E>): U extends void ? JamilihReturn : ResolvedElement<U, W>;
declare namespace jml {
    export { toJML };
    export { toJMLString };
    export { toDOM };
    export { toHTML };
    export { toDOMString };
    export { toXML };
    export { toXMLDOMString };
    export { JamilihMap as Map };
    export { JamilihWeakMap as WeakMap };
    export var weak: <V>(obj: V, args_0: string | HTMLElement | ShadowRoot, args_1?: JamilihArray[] | HTMLElement | ShadowRoot | JamilihAttributes | null | undefined, ...args: (JamilihArray[] | HTMLElement | ShadowRoot | JamilihAttributes | null)[]) => MapAndElementArray<V>;
    export var strong: <V>(obj: V, args_0: string | HTMLElement | ShadowRoot, args_1?: JamilihArray[] | HTMLElement | ShadowRoot | JamilihAttributes | null | undefined, ...args: (JamilihArray[] | HTMLElement | ShadowRoot | JamilihAttributes | null)[]) => MapAndElementArray<V>;
    export var symbol: (element: string | HTMLElement, sym: symbol | string) => SymbolResult;
    export var sym: (element: string | HTMLElement, sym: symbol | string) => SymbolResult;
    export var _a: (element: string | HTMLElement, sym: symbol | string) => SymbolResult;
    export { _a as for };
    export var command: (elem: (string | HTMLElement) | null, symOrMap: symbol | string | Map<HTMLElement, MapCommand> | WeakMap<HTMLElement, MapCommand>, methodName: string | UserArg, ...args: UserArg[]) => StoredValue;
    export { setWindow };
    export { getWindow };
}
export type ToJmlConfig = {
    /**
     * Whether to output the Jamilih object as a string.
     */
    stringOutput?: boolean;
    /**
     * If true (the default), will report invalid state errors
     */
    reportInvalidState?: boolean;
    /**
     * Strip whitespace for text nodes
     */
    stripWhitespace?: boolean;
};
export type JamilihAttributeNodeValue = [namespace: string | null, name: string, value?: string];
export type JamilihAttributeNode = {
    $attribute: JamilihAttributeNodeValue;
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
export declare class DOMException extends Error {
    code: number;
    /**
     * @param {string} message
     * @param {string} name
     */
    constructor(message: string, name: string);
}
export type JamilihChildType = JamilihArray | JamilihDoctype | JamilihCDATANode | JamilihEntityReference | JamilihProcessingInstruction | JamilihComment | JamilihDocumentFragment;
export type JamilihType = JamilihDoc | JamilihAttributeNode | JamilihChildType;
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
export declare const toJML: (nde: string | HTMLElement | Node | Entity, { stringOutput, reportInvalidState, stripWhitespace }?: ToJmlConfig) => JamilihType | string;
/**
 * @param {string|HTMLElement} dom
 * @param {ToJmlConfig} [config]
 * @returns {string}
 */
export declare const toJMLString: (dom: string | HTMLElement, config?: ToJmlConfig) => string;
/**
 *
 * @param {JamilihArray} args
 * @returns {JamilihReturn}
 */
export declare const toDOM: (...args: JamilihArray) => JamilihReturn;
/**
 *
 * @param {JamilihArray} args
 * @returns {string}
 */
export declare const toHTML: (...args: JamilihArray) => string;
/**
 *
 * @param {JamilihArray} args
 * @returns {string}
 */
export declare const toDOMString: (...args: JamilihArray) => string;
/**
 *
 * @param {JamilihArray} args
 * @returns {string}
 */
export declare const toXML: (...args: JamilihArray) => string;
/**
 *
 * @param {JamilihArray} args
 * @returns {string}
 */
export declare const toXMLDOMString: (...args: JamilihArray) => string;
/**
 * Element-aware wrapper for `Map`.
 * @template V
 */
declare class JamilihMap<V> extends Map {
    /**
     * @param {?(string|HTMLElement)} element
     * @returns {V}
     */
    get(element: (string | HTMLElement) | null): V;
    /**
     * @param {string|HTMLElement} element
     * @param {V} value
     * @returns {this}
     */
    set(element: string | HTMLElement, value: V): this;
    /**
     * @param {string|HTMLElement} element
     * @param {string} methodName
     * @param {...UserArg} args
     * @returns {StoredValue}
     */
    invoke(element: string | HTMLElement, methodName: string, ...args: UserArg[]): StoredValue;
}
/**
 * Element-aware wrapper for `WeakMap`.
 * @template V
 */
declare class JamilihWeakMap<V> extends WeakMap {
    /**
     * @param {?(string|object|symbol)} element
     * @returns {V}
     */
    get(element: (string | object | symbol) | null): V;
    /**
     * @param {?(string|object|symbol)} element
     * @param {V} value
     * @returns {this}
     */
    set(element: (string | object | symbol) | null, value: V): this;
    /**
     * @param {string|HTMLElement} element
     * @param {string} methodName
     * @param {...UserArg} args
     * @returns {StoredValue}
     */
    invoke(element: string | HTMLElement, methodName: string, ...args: UserArg[]): StoredValue;
}
export type MapAndElementArray<V> = [JamilihWeakMap<V> | JamilihMap<V>, HTMLElement];
export type MapCommand = ((elem: HTMLElement, ...args: UserArg[]) => void) | {
    [key: string]: (elem: HTMLElement, ...args: UserArg[]) => void;
};
/**
 * Expects properties `document`, `XMLSerializer`, and `DOMParser`.
 * Also updates `body` with `document.body`.
 * @param {import('jsdom').DOMWindow|HTMLWindow|typeof globalThis|undefined} wind
 * @returns {void}
 */
export declare const setWindow: (wind: import('jsdom').DOMWindow | HTMLWindow | typeof globalThis | undefined) => void;
/**
 * @returns {import('jsdom').DOMWindow|HTMLWindow|typeof globalThis}
 */
export declare const getWindow: () => import('jsdom').DOMWindow | HTMLWindow | typeof globalThis;
/**
 * Does not run Jamilih so can be further processed.
 * @template T
 * @param {T[]} array
 * @param {T} glu
 * @returns {T[]}
 */
declare function glue<T>(array: T[], glu: T): T[];
/**
 * @type {HTMLBodyElement}
 */
declare let body: HTMLBodyElement;
declare const nbsp = "\u00A0";
export { jml, $, $$, nbsp, body, glue };
//# sourceMappingURL=jml.d.ts.map