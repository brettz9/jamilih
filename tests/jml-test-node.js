(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

/* globals require */
/*
Possible todos:
0. Add XSLT to JML-string stylesheet (or even vice versa)
0. IE problem: Add JsonML code to handle name attribute (during element creation)
0. Element-specific: IE object-param handling

Todos inspired by JsonML: https://github.com/mckamey/jsonml/blob/master/jsonml-html.js

0. duplicate attributes?
0. expand ATTR_MAP
0. equivalent of markup, to allow strings to be embedded within an object (e.g., {$value: '<div>id</div>'}); advantage over innerHTML in that it wouldn't need to work as the entire contents (nor destroy any existing content or handlers)
0. More validation?
0. JsonML DOM Level 0 listener
0. Whitespace trimming?

JsonML element-specific:
0. table appending
0. canHaveChildren necessary? (attempts to append to script and img)

Other Todos:
0. Note to self: Integrate research from other jml notes
0. Allow Jamilih to be seeded with an existing element, so as to be able to add/modify attributes and children
0. Allow array as single first argument
0. Settle on whether need to use null as last argument to return array (or fragment) or other way to allow appending? Options object at end instead to indicate whether returning array, fragment, first element, etc.?
0. Allow building of generic XML (pass configuration object)
0. Allow building content internally as a string (though allowing DOM methods, etc.?)
0. Support JsonML empty string element name to represent fragments?
0. Redo browser testing of jml (including ensuring IE7 can work even if test framework can't work)
*/

const isNode = typeof module !== 'undefined';
let JSDOM;
if (isNode) {
    JSDOM = require('jsdom').JSDOM;
}
const win = isNode ? new JSDOM('').window : window;
const doc = isNode ? win.document : document;
const XmlSerializer = isNode ? require('xmldom').XMLSerializer : XMLSerializer; // Can remove xmldom dependency once jsdom may implement: https://github.com/tmpvar/jsdom/issues/1368

// STATIC PROPERTIES
const possibleOptions = [
    '$map' // Add any other options here
];

const NS_HTML = 'http://www.w3.org/1999/xhtml';
const hyphenForCamelCase = /-([a-z])/g;

const ATTR_MAP = {
    'readonly': 'readOnly'
};

// We define separately from ATTR_DOM for clarity (and parity with JsonML) but no current need
// We don't set attribute esp. for boolean atts as we want to allow setting of `undefined`
//   (e.g., from an empty variable) on templates to have no effect
const BOOL_ATTS = [
    'checked',
    'defaultChecked',
    'defaultSelected',
    'disabled',
    'indeterminate',
    'open', // Dialog elements
    'readOnly',
    'selected'
];
const ATTR_DOM = BOOL_ATTS.concat([ // From JsonML
    'async',
    'autofocus',
    'defaultValue',
    'defer',
    'formnovalidate',
    'hidden',
    'ismap',
    'multiple',
    'novalidate',
    'pattern',
    'required',
    'spellcheck',
    'value',
    'willvalidate'
]);
// Todo: Add more to this as useful for templating
//   to avoid setting with nullish value
const NULLABLES = [
    'lang',
    'max',
    'min'
];

/**
* Retrieve the (lower-cased) HTML name of a node
* @static
* @param {Node} node The HTML node
* @returns {String} The lower-cased node name
*/
function _getHTMLNodeName (node) {
    return node.nodeName && node.nodeName.toLowerCase();
}

/**
* Apply styles if this is a style tag
* @static
* @param {Node} node The element to check whether it is a style tag
*/
function _applyAnyStylesheet (node) {
    if (!doc.createStyleSheet) {
        return;
    }
    if (_getHTMLNodeName(node) === 'style') { // IE
        const ss = doc.createStyleSheet(); // Create a stylesheet to actually do something useful
        ss.cssText = node.cssText;
        // We continue to add the style tag, however
    }
}

/**
 * Need this function for IE since options weren't otherwise getting added
 * @private
 * @static
 * @param {DOMElement} parent The parent to which to append the element
 * @param {DOMNode} child The element or other node to append to the parent
 */
function _appendNode (parent, child) {
    const parentName = _getHTMLNodeName(parent);
    const childName = _getHTMLNodeName(child);

    if (doc.createStyleSheet) {
        if (parentName === 'script') {
            parent.text = child.nodeValue;
            return;
        }
        if (parentName === 'style') {
            parent.cssText = child.nodeValue; // This will not apply it--just make it available within the DOM cotents
            return;
        }
    }
    if (parentName === 'template') {
        parent.content.appendChild(child);
        return;
    }
    try {
        parent.appendChild(child); // IE9 is now ok with this
    } catch (e) {
        if (parentName === 'select' && childName === 'option') {
            try { // Since this is now DOM Level 4 standard behavior (and what IE7+ can handle), we try it first
                parent.add(child);
            } catch (err) { // DOM Level 2 did require a second argument, so we try it too just in case the user is using an older version of Firefox, etc.
                parent.add(child, null); // IE7 has a problem with this, but IE8+ is ok
            }
            return;
        }
        throw e;
    }
}

/**
 * Attach event in a cross-browser fashion
 * @static
 * @param {DOMElement} el DOM element to which to attach the event
 * @param {String} type The DOM event (without 'on') to attach to the element
 * @param {Function} handler The event handler to attach to the element
 * @param {Boolean} [capturing] Whether or not the event should be
 *                                                              capturing (W3C-browsers only); default is false; NOT IN USE
 */
function _addEvent (el, type, handler, capturing) {
    el.addEventListener(type, handler, !!capturing);
}

/**
* Creates a text node of the result of resolving an entity or character reference
* @param {'entity'|'decimal'|'hexadecimal'} type Type of reference
* @param {String} prefix Text to prefix immediately after the "&"
* @param {String} arg The body of the reference
* @returns {Text} The text node of the resolved reference
*/
function _createSafeReference (type, prefix, arg) {
    // For security reasons related to innerHTML, we ensure this string only contains potential entity characters
    if (!arg.match(/^\w+$/)) {
        throw new TypeError('Bad ' + type);
    }
    const elContainer = doc.createElement('div');
    // Todo: No workaround for XML?
    elContainer.innerHTML = '&' + prefix + arg + ';';
    return doc.createTextNode(elContainer.innerHTML);
}

/**
* @param {String} n0 Whole expression match (including "-")
* @param {String} n1 Lower-case letter match
* @returns {String} Uppercased letter
*/
function _upperCase (n0, n1) {
    return n1.toUpperCase();
}

/**
* @private
* @static
*/
function _getType (item) {
    if (typeof item === 'string') {
        return 'string';
    }
    if (typeof item === 'object') {
        if (item === null) {
            return 'null';
        }
        if (Array.isArray(item)) {
            return 'array';
        }
        if (item.nodeType === 1) {
            return 'element';
        }
        if (item.nodeType === 11) {
            return 'fragment';
        }
        return 'object';
    }
    return undefined;
}

/**
* @private
* @static
*/
function _fragReducer (frag, node) {
    frag.appendChild(node);
    return frag;
}

/**
* @private
* @static
*/
function _replaceDefiner (xmlnsObj) {
    return function (n0) {
        let retStr = xmlnsObj[''] ? ' xmlns="' + xmlnsObj[''] + '"' : (n0 || ''); // Preserve XHTML
        for (const ns in xmlnsObj) {
            if (xmlnsObj.hasOwnProperty(ns)) {
                if (ns !== '') {
                    retStr += ' xmlns:' + ns + '="' + xmlnsObj[ns] + '"';
                }
            }
        }
        return retStr;
    };
}

function _optsOrUndefinedJML (...args) {
    return jml(...(
        args[0] === undefined
            ? args.slice(1)
            : args
    ));
}

/**
* @private
* @static
*/
function _jmlSingleArg (arg) {
    return jml(arg);
}

/**
* @private
* @static
*/
function _copyOrderedAtts (attArr) {
    const obj = {};
    // Todo: Fix if allow prefixed attributes
    obj[attArr[0]] = attArr[1]; // array of ordered attribute-value arrays
    return obj;
}

/**
* @private
* @static
*/
function _childrenToJML (node) {
    return function (childNodeJML, i) {
        const cn = node.childNodes[i];
        cn.parentNode.replaceChild(jml(...childNodeJML), cn);
    };
}

/**
* @private
* @static
*/
function _appendJML (node) {
    return function (childJML) {
        node.appendChild(jml(...childJML));
    };
}

/**
* @private
* @static
*/
function _appendJMLOrText (node) {
    return function (childJML) {
        if (typeof childJML === 'string') {
            node.appendChild(doc.createTextNode(childJML));
        } else {
            node.appendChild(jml(...childJML));
        }
    };
}

/**
* @private
* @static
function _DOMfromJMLOrString (childNodeJML) {
    if (typeof childNodeJML === 'string') {
        return doc.createTextNode(childNodeJML);
    }
    return jml(...childNodeJML);
}
*/

/**
 * Creates an XHTML or HTML element (XHTML is preferred, but only in browsers that support);
 * Any element after element can be omitted, and any subsequent type or types added afterwards
 * @requires polyfill: Array.isArray
 * @requires polyfill: Array.prototype.reduce For returning a document fragment
 * @requires polyfill: Element.prototype.dataset For dataset functionality (Will not work in IE <= 7)
 * @param {String} el The element to create (by lower-case name)
 * @param {Object} [atts] Attributes to add with the key as the attribute name and value as the
 *                                               attribute value; important for IE where the input element's type cannot
 *                                               be added later after already added to the page
 * @param {DOMElement[]} [children] The optional children of this element (but raw DOM elements
 *                                                                      required to be specified within arrays since
 *                                                                      could not otherwise be distinguished from siblings being added)
 * @param {DOMElement} [parent] The optional parent to which to attach the element (always the last
 *                                                                  unless followed by null, in which case it is the second-to-last)
 * @param {null} [returning] Can use null to indicate an array of elements should be returned
 * @returns {DOMElement} The newly created (and possibly already appended) element or array of elements
 */
const jml = function jml (...args) {
    let elem = doc.createDocumentFragment();
    function _checkAtts (atts) {
        let att;
        for (att in atts) {
            if (atts.hasOwnProperty(att)) {
                const attVal = atts[att];
                att = att in ATTR_MAP ? ATTR_MAP[att] : att;
                if (NULLABLES.includes(att)) {
                    if (attVal != null) {
                        elem[att] = attVal;
                    }
                    continue;
                } else if (ATTR_DOM.includes(att)) {
                    elem[att] = attVal;
                    continue;
                }
                switch (att) {
                /*
                Todos:
                0. JSON mode to prevent event addition

                0. {$xmlDocument: []} // doc.implementation.createDocument

                0. Accept array for any attribute with first item as prefix and second as value?
                0. {$: ['xhtml', 'div']} for prefixed elements
                    case '$': // Element with prefix?
                        nodes[nodes.length] = elem = doc.createElementNS(attVal[0], attVal[1]);
                        break;
                */
                case '#': { // Document fragment
                    nodes[nodes.length] = _optsOrUndefinedJML(opts, attVal);
                    break;
                } case '$shadow': {
                    const {open, closed} = attVal;
                    let {content, template} = attVal;
                    const shadowRoot = elem.attachShadow({
                        mode: closed || open === false ? 'closed' : 'open'
                    });
                    if (template) {
                        if (Array.isArray(template)) {
                            if (_getType(template[0]) === 'object') { // Has attributes
                                template = jml('template', ...template, doc.body);
                            } else { // Array is for the children
                                template = jml('template', template, doc.body);
                            }
                        } else if (typeof template === 'string') {
                            template = doc.querySelector(template);
                        }
                        jml(
                            template.content.cloneNode(true),
                            shadowRoot
                        );
                    } else {
                        if (!content) {
                            content = open || closed;
                        }
                        if (content && typeof content !== 'boolean') {
                            if (Array.isArray(content)) {
                                jml({'#': content}, shadowRoot);
                            } else {
                                jml(content, shadowRoot);
                            }
                        }
                    }
                    break;
                } case 'is': { // Not yet supported in browsers
                    // Handled during element creation
                    break;
                } case '$custom': {
                    Object.assign(elem, attVal);
                    break;
                } case '$define': {
                    const localName = elem.localName.toLowerCase();
                    // Note: customized built-ins sadly not working yet
                    const customizedBuiltIn = !localName.includes('-');

                    const def = customizedBuiltIn ? elem.getAttribute('is') : localName;
                    if (customElements.get(def)) {
                        break;
                    }
                    const getConstructor = (cb) => {
                        const baseClass = options && options.extends
                            ? doc.createElement(options.extends).constructor
                            : customizedBuiltIn
                                ? doc.createElement(localName).constructor
                                : HTMLElement;
                        return cb
                            ? class extends baseClass {
                                constructor () {
                                    super();
                                    cb.call(this);
                                }
                            }
                            : class extends baseClass {};
                    };

                    let constructor, options, prototype;
                    if (Array.isArray(attVal)) {
                        if (attVal.length <= 2) {
                            [constructor, options] = attVal;
                            if (typeof options === 'string') {
                                options = {extends: options};
                            } else if (!options.hasOwnProperty('extends')) {
                                prototype = options;
                            }
                            if (typeof constructor === 'object') {
                                prototype = constructor;
                                constructor = getConstructor();
                            }
                        } else {
                            [constructor, prototype, options] = attVal;
                            if (typeof options === 'string') {
                                options = {extends: options};
                            }
                        }
                    } else if (typeof attVal === 'function') {
                        constructor = attVal;
                    } else {
                        prototype = attVal;
                        constructor = getConstructor();
                    }
                    if (!constructor.toString().startsWith('class')) {
                        constructor = getConstructor(constructor);
                    }
                    if (!options && customizedBuiltIn) {
                        options = {extends: localName};
                    }
                    if (prototype) {
                        Object.assign(constructor.prototype, prototype);
                    }
                    customElements.define(def, constructor, customizedBuiltIn ? options : undefined);
                    break;
                } case '$symbol': {
                    const [symbol, func] = attVal;
                    if (typeof func === 'function') {
                        const funcBound = func.bind(elem);
                        if (typeof symbol === 'string') {
                            elem[Symbol.for(symbol)] = funcBound;
                        } else {
                            elem[symbol] = funcBound;
                        }
                    } else {
                        const obj = func;
                        obj.elem = elem;
                        if (typeof symbol === 'string') {
                            elem[Symbol.for(symbol)] = obj;
                        } else {
                            elem[symbol] = obj;
                        }
                    }
                    break;
                } case '$data' : {
                    setMap(attVal);
                    break;
                } case '$attribute': { // Attribute node
                    const node = attVal.length === 3 ? doc.createAttributeNS(attVal[0], attVal[1]) : doc.createAttribute(attVal[0]);
                    node.value = attVal[attVal.length - 1];
                    nodes[nodes.length] = node;
                    break;
                } case '$text': { // Todo: Also allow as jml(['a text node']) (or should that become a fragment)?
                    const node = doc.createTextNode(attVal);
                    nodes[nodes.length] = node;
                    break;
                } case '$document': {
                    const node = doc.implementation.createHTMLDocument();
                    if (attVal.childNodes) {
                        attVal.childNodes.forEach(_childrenToJML(node));
                        // Remove any extra nodes created by createHTMLDocument().
                        let j = attVal.childNodes.length;
                        while (node.childNodes[j]) {
                            const cn = node.childNodes[j];
                            cn.parentNode.removeChild(cn);
                            j++;
                        }
                    } else {
                        const html = node.childNodes[1];
                        const head = html.childNodes[0];
                        const body = html.childNodes[1];
                        if (attVal.title || attVal.head) {
                            const meta = doc.createElement('meta');
                            meta.charset = 'utf-8';
                            head.appendChild(meta);
                        }
                        if (attVal.title) {
                            node.title = attVal.title; // Appends after meta
                        }
                        if (attVal.head) {
                            attVal.head.forEach(_appendJML(head));
                        }
                        if (attVal.body) {
                            attVal.body.forEach(_appendJMLOrText(body));
                        }
                    }
                    break;
                } case '$DOCTYPE': {
                    /*
                    // Todo:
                    if (attVal.internalSubset) {
                        node = {};
                    }
                    else
                    */
                    let node;
                    if (attVal.entities || attVal.notations) {
                        node = {
                            name: attVal.name,
                            nodeName: attVal.name,
                            nodeValue: null,
                            nodeType: 10,
                            entities: attVal.entities.map(_jmlSingleArg),
                            notations: attVal.notations.map(_jmlSingleArg),
                            publicId: attVal.publicId,
                            systemId: attVal.systemId
                            // internalSubset: // Todo
                        };
                    } else {
                        node = doc.implementation.createDocumentType(attVal.name, attVal.publicId, attVal.systemId);
                    }
                    nodes[nodes.length] = node;
                    break;
                } case '$ENTITY': {
                    /*
                    // Todo: Should we auto-copy another node's properties/methods (like DocumentType) excluding or changing its non-entity node values?
                    const node = {
                        nodeName: attVal.name,
                        nodeValue: null,
                        publicId: attVal.publicId,
                        systemId: attVal.systemId,
                        notationName: attVal.notationName,
                        nodeType: 6,
                        childNodes: attVal.childNodes.map(_DOMfromJMLOrString)
                    };
                    */
                    break;
                } case '$NOTATION': {
                    // Todo: We could add further properties/methods, but unlikely to be used as is.
                    const node = {nodeName: attVal[0], publicID: attVal[1], systemID: attVal[2], nodeValue: null, nodeType: 12};
                    nodes[nodes.length] = node;
                    break;
                } case '$on': { // Events
                    for (const p2 in attVal) {
                        if (attVal.hasOwnProperty(p2)) {
                            let val = attVal[p2];
                            if (typeof val === 'function') {
                                val = [val, false];
                            }
                            if (typeof val[0] === 'function') {
                                _addEvent(elem, p2, val[0], val[1]); // element, event name, handler, capturing
                            }
                        }
                    }
                    break;
                } case 'className': case 'class':
                    if (attVal != null) {
                        elem.className = attVal;
                    }
                    break;
                case 'dataset': {
                    // Map can be keyed with hyphenated or camel-cased properties
                    const recurse = (attVal, startProp) => {
                        let prop = '';
                        const pastInitialProp = startProp !== '';
                        Object.keys(attVal).forEach((key) => {
                            const value = attVal[key];
                            if (pastInitialProp) {
                                prop = startProp + key.replace(hyphenForCamelCase, _upperCase).replace(/^([a-z])/, _upperCase);
                            } else {
                                prop = startProp + key.replace(hyphenForCamelCase, _upperCase);
                            }
                            if (value === null || typeof value !== 'object') {
                                if (value != null) {
                                    elem.dataset[prop] = value;
                                }
                                prop = startProp;
                                return;
                            }
                            recurse(value, prop);
                        });
                    };
                    recurse(attVal, '');
                    break;
                // Todo: Disable this by default unless configuration explicitly allows (for security)
                } case 'innerHTML':
                    if (attVal != null) {
                        elem.innerHTML = attVal;
                    }
                    break;
                case 'htmlFor': case 'for':
                    if (elStr === 'label') {
                        if (attVal != null) {
                            elem.htmlFor = attVal;
                        }
                        break;
                    }
                    elem.setAttribute(att, attVal);
                    break;
                case 'xmlns':
                    // Already handled
                    break;
                default:
                    if (att.match(/^on/)) {
                        elem[att] = attVal;
                        // _addEvent(elem, att.slice(2), attVal, false); // This worked, but perhaps the user wishes only one event
                        break;
                    }
                    if (att === 'style') { // setAttribute will work, but erases any existing styles
                        if (attVal == null) {
                            break;
                        }
                        if (typeof attVal === 'object') {
                            for (const p2 in attVal) {
                                if (attVal.hasOwnProperty(p2) && attVal[p2] != null) {
                                    // Todo: Handle aggregate properties like "border"
                                    if (p2 === 'float') {
                                        elem.style.cssFloat = attVal[p2];
                                        elem.style.styleFloat = attVal[p2]; // Harmless though we could make conditional on older IE instead
                                    } else {
                                        elem.style[p2.replace(hyphenForCamelCase, _upperCase)] = attVal[p2];
                                    }
                                }
                            }
                        } else if (elem.style.cssText !== undefined) {
                            elem.style.cssText += attVal;
                        } else { // Opera
                            elem.style += attVal;
                        }
                        break;
                    }
                    elem.setAttribute(att, attVal);
                    break;
                }
            }
        }
    }
    const nodes = [];
    let elStr;
    let opts;
    let isRoot = false;
    if (_getType(args[0]) === 'object' &&
        Object.keys(args[0]).some((key) => possibleOptions.includes(key))) {
        opts = args[0];
        if (opts.state !== 'child') {
            isRoot = true;
            opts.state = 'child';
        }
        if (opts.$map && !opts.$map.root && opts.$map.root !== false) {
            opts.$map = {root: opts.$map};
        }
        args = args.slice(1);
    }
    const argc = args.length;
    const defaultMap = opts && opts.$map && opts.$map.root;
    const setMap = (dataVal) => {
        let map, obj;
        // Boolean indicating use of default map and object
        if (dataVal === true) {
            [map, obj] = defaultMap;
        } else if (Array.isArray(dataVal)) {
            // Array of strings mapping to default
            if (typeof dataVal[0] === 'string') {
                dataVal.forEach((dVal) => {
                    setMap(opts.$map[dVal]);
                });
            // Array of Map and non-map data object
            } else {
                map = dataVal[0] || defaultMap[0];
                obj = dataVal[1] || defaultMap[1];
            }
        // Map
        } else if ((/^\[object (?:Weak)?Map\]$/).test([].toString.call(dataVal))) {
            map = dataVal;
            obj = defaultMap[1];
        // Non-map data object
        } else {
            map = defaultMap[0];
            obj = dataVal;
        }
        map.set(elem, obj);
    };
    for (let i = 0; i < argc; i++) {
        let arg = args[i];
        switch (_getType(arg)) {
        case 'null': // null always indicates a place-holder (only needed for last argument if want array returned)
            if (i === argc - 1) {
                _applyAnyStylesheet(nodes[0]); // We have to execute any stylesheets even if not appending or otherwise IE will never apply them
                // Todo: Fix to allow application of stylesheets of style tags within fragments?
                return nodes.length <= 1 ? nodes[0] : nodes.reduce(_fragReducer, doc.createDocumentFragment()); // nodes;
            }
            break;
        case 'string': // Strings indicate elements
            switch (arg) {
            case '!':
                nodes[nodes.length] = doc.createComment(args[++i]);
                break;
            case '?':
                arg = args[++i];
                let procValue = args[++i];
                const val = procValue;
                if (typeof val === 'object') {
                    procValue = [];
                    for (const p in val) {
                        if (val.hasOwnProperty(p)) {
                            procValue.push(p + '=' + '"' + val[p].replace(/"/g, '\\"') + '"');
                        }
                    }
                    procValue = procValue.join(' ');
                }
                // Firefox allows instructions with ">" in this method, but not if placed directly!
                try {
                    nodes[nodes.length] = doc.createProcessingInstruction(arg, procValue);
                } catch (e) { // Getting NotSupportedError in IE, so we try to imitate a processing instruction with a comment
                    // innerHTML didn't work
                    // var elContainer = doc.createElement('div');
                    // elContainer.innerHTML = '<?' + doc.createTextNode(arg + ' ' + procValue).nodeValue + '?>';
                    // nodes[nodes.length] = elContainer.innerHTML;
                    // Todo: any other way to resolve? Just use XML?
                    nodes[nodes.length] = doc.createComment('?' + arg + ' ' + procValue + '?');
                }
                break;
            // Browsers don't support doc.createEntityReference, so we just use this as a convenience
            case '&':
                nodes[nodes.length] = _createSafeReference('entity', '', args[++i]);
                break;
            case '#': // // Decimal character reference - ['#', '01234'] // &#01234; // probably easier to use JavaScript Unicode escapes
                nodes[nodes.length] = _createSafeReference('decimal', arg, String(args[++i]));
                break;
            case '#x': // Hex character reference - ['#x', '123a'] // &#x123a; // probably easier to use JavaScript Unicode escapes
                nodes[nodes.length] = _createSafeReference('hexadecimal', arg, args[++i]);
                break;
            case '![':
                // '![', ['escaped <&> text'] // <![CDATA[escaped <&> text]]>
                // CDATA valid in XML only, so we'll just treat as text for mutual compatibility
                // Todo: config (or detection via some kind of doc.documentType property?) of whether in XML
                try {
                    nodes[nodes.length] = doc.createCDATASection(args[++i]);
                } catch (e2) {
                    nodes[nodes.length] = doc.createTextNode(args[i]); // i already incremented
                }
                break;
            case '':
                nodes[nodes.length] = doc.createDocumentFragment();
                break;
            default: { // An element
                elStr = arg;
                const atts = args[i + 1];
                // Todo: Fix this to depend on XML/config, not availability of methods
                if (_getType(atts) === 'object' && atts.is) {
                    const {is} = atts;
                    if (doc.createElementNS) {
                        elem = doc.createElementNS(NS_HTML, elStr, {is});
                    } else {
                        elem = doc.createElement(elStr, {is});
                    }
                } else {
                    if (doc.createElementNS) {
                        elem = doc.createElementNS(NS_HTML, elStr);
                    } else {
                        elem = doc.createElement(elStr);
                    }
                }
                nodes[nodes.length] = elem; // Add to parent
                break;
            }
            }
            break;
        case 'object': // Non-DOM-element objects indicate attribute-value pairs
            const atts = arg;

            if (atts.xmlns !== undefined) { // We handle this here, as otherwise may lose events, etc.
                // As namespace of element already set as XHTML, we need to change the namespace
                // elem.setAttribute('xmlns', atts.xmlns); // Doesn't work
                // Can't set namespaceURI dynamically, renameNode() is not supported, and setAttribute() doesn't work to change the namespace, so we resort to this hack
                let replacer;
                if (typeof atts.xmlns === 'object') {
                    replacer = _replaceDefiner(atts.xmlns);
                } else {
                    replacer = ' xmlns="' + atts.xmlns + '"';
                }
                // try {
                // Also fix DOMParser to work with text/html
                elem = nodes[nodes.length - 1] = new DOMParser().parseFromString(
                    new XmlSerializer().serializeToString(elem)
                        // Mozilla adds XHTML namespace
                        .replace(' xmlns="' + NS_HTML + '"', replacer),
                    'application/xml'
                ).documentElement;
                // }catch(e) {alert(elem.outerHTML);throw e;}
            }
            const orderedArr = atts.$a ? atts.$a.map(_copyOrderedAtts) : [atts];
            orderedArr.forEach(_checkAtts);
            break;
        case 'fragment':
        case 'element':
            /*
            1) Last element always the parent (put null if don't want parent and want to return array) unless only atts and children (no other elements)
            2) Individual elements (DOM elements or sequences of string[/object/array]) get added to parent first-in, first-added
            */
            if (i === 0) { // Allow wrapping of element
                elem = arg;
            }
            if (i === argc - 1 || (i === argc - 2 && args[i + 1] === null)) { // parent
                const elsl = nodes.length;
                for (let k = 0; k < elsl; k++) {
                    _appendNode(arg, nodes[k]);
                }
                // Todo: Apply stylesheets if any style tags were added elsewhere besides the first element?
                _applyAnyStylesheet(nodes[0]); // We have to execute any stylesheets even if not appending or otherwise IE will never apply them
            } else {
                nodes[nodes.length] = arg;
            }
            break;
        case 'array': // Arrays or arrays of arrays indicate child nodes
            const child = arg;
            const cl = child.length;
            for (let j = 0; j < cl; j++) { // Go through children array container to handle elements
                const childContent = child[j];
                const childContentType = typeof childContent;
                if (childContent === undefined) {
                    throw String('Parent array:' + JSON.stringify(args) + '; child: ' + child + '; index:' + j);
                }
                switch (childContentType) {
                // Todo: determine whether null or function should have special handling or be converted to text
                case 'string': case 'number': case 'boolean':
                    _appendNode(elem, doc.createTextNode(childContent));
                    break;
                default:
                    if (Array.isArray(childContent)) { // Arrays representing child elements
                        _appendNode(elem, _optsOrUndefinedJML(opts, ...childContent));
                    } else if (childContent['#']) { // Fragment
                        _appendNode(elem, _optsOrUndefinedJML(opts, childContent['#']));
                    } else { // Single DOM element children
                        _appendNode(elem, childContent);
                    }
                    break;
                }
            }
            break;
        }
    }
    const ret = nodes[0] || elem;
    if (opts && isRoot && opts.$map && opts.$map.root) {
        setMap(true);
    }
    return ret;
};

/**
* Converts a DOM object or a string of HTML into a Jamilih object (or string)
* @param {string|HTMLElement} [dom=document.documentElement] Defaults to converting the current document.
* @param {object} [config={stringOutput:false}] Configuration object
* @param {boolean} [config.stringOutput=false] Whether to output the Jamilih object as a string.
* @returns {array|string} Array containing the elements which represent a Jamilih object, or,
                            if `stringOutput` is true, it will be the stringified version of
                            such an object
*/
jml.toJML = function (dom, config) {
    config = config || {stringOutput: false};
    if (typeof dom === 'string') {
        dom = new DOMParser().parseFromString(dom, 'text/html'); // todo: Give option for XML once implemented and change JSDoc to allow for Element
    }

    const prohibitHTMLOnly = true;

    const ret = [];
    let parent = ret;
    let parentIdx = 0;

    function invalidStateError () { // These are probably only necessary if working with text/html
        function DOMException () { return this; }
        if (prohibitHTMLOnly) {
            // INVALID_STATE_ERR per section 9.3 XHTML 5: http://www.w3.org/TR/html5/the-xhtml-syntax.html
            // Since we can't instantiate without this (at least in Mozilla), this mimicks at least (good idea?)
            const e = new DOMException();
            e.code = 11;
            throw e;
        }
    }

    function addExternalID (obj, node) {
        if (node.systemId.includes('"') && node.systemId.includes("'")) {
            invalidStateError();
        }
        const publicId = node.publicId;
        const systemId = node.systemId;
        if (systemId) {
            obj.systemId = systemId;
        }
        if (publicId) {
            obj.publicId = publicId;
        }
    }

    function set (val) {
        parent[parentIdx] = val;
        parentIdx++;
    }
    function setChildren () {
        set([]);
        parent = parent[parentIdx - 1];
        parentIdx = 0;
    }
    function setObj (prop1, prop2) {
        parent = parent[parentIdx - 1][prop1];
        parentIdx = 0;
        if (prop2) {
            parent = parent[prop2];
        }
    }

    function parseDOM (node, namespaces) {
        // namespaces = clone(namespaces) || {}; // Ensure we're working with a copy, so different levels in the hierarchy can treat it differently

        /*
        if ((node.prefix && node.prefix.includes(':')) || (node.localName && node.localName.includes(':'))) {
            invalidStateError();
        }
        */

        const type = node.nodeType;
        namespaces = Object.assign({}, namespaces);

        const xmlChars = /([\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD]|[\uD800-\uDBFF][\uDC00-\uDFFF])*$/;
        if ([2, 3, 4, 7, 8].includes(type) && !xmlChars.test(node.nodeValue)) {
            invalidStateError();
        }

        let children, start, tmpParent, tmpParentIdx;
        function setTemp () {
            tmpParent = parent;
            tmpParentIdx = parentIdx;
        }
        function resetTemp () {
            parent = tmpParent;
            parentIdx = tmpParentIdx;
            parentIdx++; // Increment index in parent container of this element
        }
        switch (type) {
        case 1: // ELEMENT
            setTemp();
            const nodeName = node.nodeName.toLowerCase(); // Todo: for XML, should not lower-case

            setChildren(); // Build child array since elements are, except at the top level, encapsulated in arrays
            set(nodeName);

            start = {};
            let hasNamespaceDeclaration = false;

            if (namespaces[node.prefix || ''] !== node.namespaceURI) {
                namespaces[node.prefix || ''] = node.namespaceURI;
                if (node.prefix) {
                    start['xmlns:' + node.prefix] = node.namespaceURI;
                } else if (node.namespaceURI) {
                    start.xmlns = node.namespaceURI;
                }
                hasNamespaceDeclaration = true;
            }
            if (node.attributes.length) {
                set(Array.from(node.attributes).reduce(function (obj, att) {
                    obj[att.name] = att.value; // Attr.nodeName and Attr.nodeValue are deprecated as of DOM4 as Attr no longer inherits from Node, so we can safely use name and value
                    return obj;
                }, start));
            } else if (hasNamespaceDeclaration) {
                set(start);
            }

            children = node.childNodes;
            if (children.length) {
                setChildren(); // Element children array container
                Array.from(children).forEach(function (childNode) {
                    parseDOM(childNode, namespaces);
                });
            }
            resetTemp();
            break;
        case 2: // ATTRIBUTE (should only get here if passing in an attribute node)
            set({$attribute: [node.namespaceURI, node.name, node.value]});
            break;
        case 3: // TEXT
            if (config.stripWhitespace && (/^\s+$/).test(node.nodeValue)) {
                return;
            }
            set(node.nodeValue);
            break;
        case 4: // CDATA
            if (node.nodeValue.includes(']]' + '>')) {
                invalidStateError();
            }
            set(['![', node.nodeValue]);
            break;
        case 5: // ENTITY REFERENCE (probably not used in browsers since already resolved)
            set(['&', node.nodeName]);
            break;
        case 6: // ENTITY (would need to pass in directly)
            setTemp();
            start = {};
            if (node.xmlEncoding || node.xmlVersion) { // an external entity file?
                start.$ENTITY = {name: node.nodeName, version: node.xmlVersion, encoding: node.xmlEncoding};
            } else {
                start.$ENTITY = {name: node.nodeName};
                if (node.publicId || node.systemId) { // External Entity?
                    addExternalID(start.$ENTITY, node);
                    if (node.notationName) {
                        start.$ENTITY.NDATA = node.notationName;
                    }
                }
            }
            set(start);
            children = node.childNodes;
            if (children.length) {
                start.$ENTITY.childNodes = [];
                // Set position to $ENTITY's childNodes array children
                setObj('$ENTITY', 'childNodes');

                Array.from(children).forEach(function (childNode) {
                    parseDOM(childNode, namespaces);
                });
            }
            resetTemp();
            break;
        case 7: // PROCESSING INSTRUCTION
            if (/^xml$/i.test(node.target)) {
                invalidStateError();
            }
            if (node.target.includes('?>')) {
                invalidStateError();
            }
            if (node.target.includes(':')) {
                invalidStateError();
            }
            if (node.data.includes('?>')) {
                invalidStateError();
            }
            set(['?', node.target, node.data]); // Todo: Could give option to attempt to convert value back into object if has pseudo-attributes
            break;
        case 8: // COMMENT
            if (node.nodeValue.includes('--') ||
                (node.nodeValue.length && node.nodeValue.lastIndexOf('-') === node.nodeValue.length - 1)) {
                invalidStateError();
            }
            set(['!', node.nodeValue]);
            break;
        case 9: // DOCUMENT
            setTemp();
            const docObj = {$document: {childNodes: []}};

            if (config.xmlDeclaration) {
                docObj.$document.xmlDeclaration = {version: doc.xmlVersion, encoding: doc.xmlEncoding, standAlone: doc.xmlStandalone};
            }

            set(docObj); // doc.implementation.createHTMLDocument

            // Set position to fragment's array children
            setObj('$document', 'childNodes');

            children = node.childNodes;
            if (!children.length) {
                invalidStateError();
            }
            // set({$xmlDocument: []}); // doc.implementation.createDocument // Todo: use this conditionally

            Array.from(children).forEach(function (childNode) { // Can't just do documentElement as there may be doctype, comments, etc.
                // No need for setChildren, as we have already built the container array
                parseDOM(childNode, namespaces);
            });
            resetTemp();
            break;
        case 10: // DOCUMENT TYPE
            setTemp();

            // Can create directly by doc.implementation.createDocumentType
            start = {$DOCTYPE: {name: node.name}};
            if (node.internalSubset) {
                start.internalSubset = node.internalSubset;
            }
            const pubIdChar = /^(\u0020|\u000D|\u000A|[a-zA-Z0-9]|[-'()+,./:=?;!*#@$_%])*$/;
            if (!pubIdChar.test(node.publicId)) {
                invalidStateError();
            }
            addExternalID(start.$DOCTYPE, node);
            // Fit in internal subset along with entities?: probably don't need as these would only differ if from DTD, and we're not rebuilding the DTD
            set(start); // Auto-generate the internalSubset instead? Avoid entities/notations in favor of array to preserve order?

            const entities = node.entities; // Currently deprecated
            if (entities && entities.length) {
                start.$DOCTYPE.entities = [];
                setObj('$DOCTYPE', 'entities');
                Array.from(entities).forEach(function (entity) {
                    parseDOM(entity, namespaces);
                });
                // Reset for notations
                parent = tmpParent;
                parentIdx = tmpParentIdx + 1;
            }

            const notations = node.notations; // Currently deprecated
            if (notations && notations.length) {
                start.$DOCTYPE.notations = [];
                setObj('$DOCTYPE', 'notations');
                Array.from(notations).forEach(function (notation) {
                    parseDOM(notation, namespaces);
                });
            }
            resetTemp();
            break;
        case 11: // DOCUMENT FRAGMENT
            setTemp();

            set({'#': []});

            // Set position to fragment's array children
            setObj('#');

            children = node.childNodes;
            Array.from(children).forEach(function (childNode) {
                // No need for setChildren, as we have already built the container array
                parseDOM(childNode, namespaces);
            });

            resetTemp();
            break;
        case 12: // NOTATION
            start = {$NOTATION: {name: node.nodeName}};
            addExternalID(start.$NOTATION, node, true);
            set(start);
            break;
        default:
            throw new TypeError('Not an XML type');
        }
    }

    parseDOM(dom, {});

    if (config.stringOutput) {
        return JSON.stringify(ret[0]);
    }
    return ret[0];
};
jml.toJMLString = function (dom, config) {
    return jml.toJML(dom, Object.assign(config || {}, {stringOutput: true}));
};
jml.toDOM = function (...args) { // Alias for jml()
    return jml(...args);
};
jml.toHTML = function (...args) { // Todo: Replace this with version of jml() that directly builds a string
    const ret = jml(...args);
    // Todo: deal with serialization of properties like 'selected', 'checked', 'value', 'defaultValue', 'for', 'dataset', 'on*', 'style'! (i.e., need to build a string ourselves)
    return ret.outerHTML;
};
jml.toDOMString = function (...args) { // Alias for jml.toHTML for parity with jml.toJMLString
    return jml.toHTML(...args);
};
jml.toXML = function (...args) {
    const ret = jml(...args);
    return new XmlSerializer().serializeToString(ret);
};
jml.toXMLDOMString = function (...args) { // Alias for jml.toXML for parity with jml.toJMLString
    return jml.toXML(...args);
};

class JamilihMap extends Map {
    get (elem) {
        elem = typeof elem === 'string' ? doc.querySelector(elem) : elem;
        return super.get.call(this, elem);
    }
    set (elem, value) {
        elem = typeof elem === 'string' ? doc.querySelector(elem) : elem;
        return super.set.call(this, elem, value);
    }
    invoke (elem, methodName, ...args) {
        elem = typeof elem === 'string' ? doc.querySelector(elem) : elem;
        return this.get(elem)[methodName](elem, ...args);
    }
}
class JamilihWeakMap extends WeakMap {
    get (elem) {
        elem = typeof elem === 'string' ? doc.querySelector(elem) : elem;
        return super.get.call(this, elem);
    }
    set (elem, value) {
        elem = typeof elem === 'string' ? doc.querySelector(elem) : elem;
        return super.set.call(this, elem, value);
    }
    invoke (elem, methodName, ...args) {
        elem = typeof elem === 'string' ? doc.querySelector(elem) : elem;
        return this.get(elem)[methodName](elem, ...args);
    }
}

jml.Map = JamilihMap;
jml.WeakMap = JamilihWeakMap;

jml.weak = function (obj, ...args) {
    const map = new JamilihWeakMap();
    const elem = jml({$map: [map, obj]}, ...args);
    return [map, elem];
};

jml.strong = function (obj, ...args) {
    const map = new JamilihMap();
    const elem = jml({$map: [map, obj]}, ...args);
    return [map, elem];
};

jml.symbol = jml.sym = jml.for = function (elem, sym) {
    elem = typeof elem === 'string' ? doc.querySelector(elem) : elem;
    return elem[typeof sym === 'symbol' ? sym : Symbol.for(sym)];
};

jml.command = function (elem, symOrMap, methodName, ...args) {
    elem = typeof elem === 'string' ? doc.querySelector(elem) : elem;
    let func;
    if (['symbol', 'string'].includes(typeof symOrMap)) {
        func = jml.sym(elem, symOrMap);
        if (typeof func === 'function') {
            return func(methodName, ...args); // Already has `this` bound to `elem`
        }
        return func[methodName](...args);
    } else {
        func = symOrMap.get(elem);
        if (typeof func === 'function') {
            return func.call(elem, methodName, ...args);
        }
        return func[methodName](elem, ...args);
    }
    // return func[methodName].call(elem, ...args);
};

const matches = (item1, item2) => {
    if (!item2) { // For convenience in debugging
        console.log('Missing item2\n', item1);
    }
    if (item1 !== item2) {
        const err = new Error('Stack');
        console.log('Items not equal:', err);
        console.log(item1 + '\n\n' + item2);
    }
    if (typeof module !== 'undefined') {
        console.log(item1 === item2);
    } else {
        document.body.appendChild(
            document.createTextNode((item1 === item2))
        );
        document.body.appendChild(
            document.createElement('br')
        );
    }
};
const matchesXMLStringWithinElement = (element, item2) => {
    const docFrag = document.createDocumentFragment();
    for (let i = 0; i < element.childNodes.length; i++) {
        docFrag.appendChild(element.childNodes[i].cloneNode(true));
    }
    matchesXMLString(docFrag, item2);
};
const matchesXMLStringOnElement = (element, item2) => {
    const lastInsert = element.childNodes[element.childNodes.length - 1];
    matchesXMLString(lastInsert, item2);
};
const matchesXMLString = (item1, item2) => {
    const ser = new XMLSerializer();
    ser.$overrideNative = true;
    item1 = ser.serializeToString(item1);
    matches(item1, item2);
};

/* globals global, require */
/*
Todos:
0. Confirm working cross-browser (all browsers); fix IE8 with dataset; remove IE8 processing instruction hack?
0. Add test cases for properties: innerHTML, selected, checked, value, htmlFor, for
0. When CDATA XML-check added, add check for CDATA section in XML
0. Fix bug with IE 10 (but not IE 8) when testing $on events (race condition)
0. Harmonize with node unit tests (get Makefile of nodeunit to run so can run in browser)
*/
// Note: we always end styles in the tests with a semi-colon, as our standardizing Element.prototype.getAttribute() polyfill used internally will always add a semi-colon, but even modern browsers do not do this (nor are they required to do so) without the harmonizing polyfill (but to harmonize, such an approach is necessary since IE8 always drops the semi-colon with no apparent way to recover whether it was written with or without it); even though our polyfill could handle either case, by adding a semicolon at the end of even the last rule, we are at least ensuring the tests will remain valid in modern browsers regardless of whether the polyfill is present or not; we really should do the same in alphabetizing our properties as well, since our polyfill handles that (since IE has its own order not the same as document order or alphabetical), but modern browsers (at least Firefox) follow document order.

if (typeof module !== 'undefined') {
    const JSDOM = require('jsdom').JSDOM;
    global.window = new JSDOM('').window;
    global.Event = window.Event;
    global.document = window.document;
    global.DOMParser = window.DOMParser;
    global.XMLSerializer = require('xmldom').XMLSerializer; // Can remove xmldom dependency once jsdom may implement: https://github.com/tmpvar/jsdom/issues/1368
}

// HELPERS
const $ = (sel) => {
    return document.querySelector(sel);
};
const isIE = window.navigator && window.navigator.appName === 'Microsoft Internet Explorer';

// BEGIN TESTS

$('body').innerHTML = `
    <h1 id="nodeunit-header">Jamilih Tests</h1>
    <div style="display:none;" id="DOMChildrenMustBeInArray">test1</div>
    <div style="display:none;" id="anotherElementToAddToParent">test2</div>
    <div style="display:none;" id="yetAnotherSiblingToAddToParent">test3</div>
`;

const br = document.createElement('br');
br.className = 'a>bc';

matchesXMLString(
    jml('input'),
    '<input xmlns="http://www.w3.org/1999/xhtml" />'
);
matchesXMLString(
    jml('input', null),
    '<input xmlns="http://www.w3.org/1999/xhtml" />'
);

matchesXMLString(
    jml('input', {type: 'password', id: 'my_pass'}),
    '<input xmlns="http://www.w3.org/1999/xhtml" type="password" id="my_pass" />'
);

matchesXMLString(
    jml('div', [
        ['p', ['no attributes on the div']]
    ]),
    '<div xmlns="http://www.w3.org/1999/xhtml"><p>no attributes on the div</p></div>'
);

matchesXMLString(
    jml('div', {'class': 'myClass'}, [
        ['p', ['Some inner text']],
        ['p', ['another child paragraph']]
    ]),
    '<div xmlns="http://www.w3.org/1999/xhtml" class="myClass"><p>Some inner text</p><p>another child paragraph</p></div>'
);

matchesXMLString(
    jml('div', {'class': 'myClass'}, [
        'text1',
        ['p', ['Some inner text']],
        'text3'
    ]),
    '<div xmlns="http://www.w3.org/1999/xhtml" class="myClass">text1<p>Some inner text</p>text3</div>'
);

if (!document.body) {
    document.body = document.getElementsByTagName('body')[0];
}
/* const simpleAttachToParent = */
jml('hr', document.body);

matchesXMLStringOnElement(
    document.getElementsByTagName('body')[0],
    '<hr xmlns="http://www.w3.org/1999/xhtml" />'
);

let table = jml('table', {style: 'position:absolute; left: -1000px;'}, document.body);
/* const firstTr = */
jml('tr', [
    ['td', ['row 1 cell 1']],
    ['td', ['row 1 cell 2']]
],
'tr', {className: 'anotherRowSibling'}, [
    ['td', ['row 2 cell 1']],
    ['td', ['row 2 cell 2']]
],
table);

matchesXMLStringWithinElement(
    table,
    '<tr xmlns="http://www.w3.org/1999/xhtml"><td>row 1 cell 1</td><td>row 1 cell 2</td></tr><tr xmlns="http://www.w3.org/1999/xhtml" class="anotherRowSibling"><td>row 2 cell 1</td><td>row 2 cell 2</td></tr>'
);

table = jml('table', {style: 'position:absolute; left: -1000px;'}, document.body); // Rebuild
const trsFragment = jml('tr', [
    ['td', ['row 1 cell 1']],
    ['td', ['row 1 cell 2']]
],
'tr', {className: 'anotherRowSibling'}, [
    ['td', ['row 2 cell 1']],
    ['td', ['row 2 cell 2']]
],
null);

const ser = new XMLSerializer();
ser.$overrideNative = true;

const parent = document.body;

matches(parent, jml(parent));

const div = jml(
    'div', {style: 'position:absolute !important; left: -1000px;'}, [
        $('#DOMChildrenMustBeInArray')
    ],
    $('#anotherElementToAddToParent'),
    $('#yetAnotherSiblingToAddToParent'),
    parent
);

matchesXMLString(
    div,
    '<div xmlns="http://www.w3.org/1999/xhtml" style="left: -1000px; position: absolute !important;"><div style="display:none;" id="DOMChildrenMustBeInArray">test1</div></div>'
    // '<div xmlns="http://www.w3.org/1999/xhtml" style="position: absolute; left: -1000px;"><div id="DOMChildrenMustBeInArray" style="display:none;">test1</div></div><div id="anotherElementToAddToParent" style="display:none;">test2</div><div id="yetAnotherSiblingToAddToParent" style="display:none;">test3</div>'
);
// throw '';

matches(
    ser.serializeToString(trsFragment.childNodes[0]) +
    ser.serializeToString(trsFragment.childNodes[1]),
    '<tr xmlns="http://www.w3.org/1999/xhtml"><td>row 1 cell 1</td><td>row 1 cell 2</td></tr><tr xmlns="http://www.w3.org/1999/xhtml" class="anotherRowSibling"><td>row 2 cell 1</td><td>row 2 cell 2</td></tr>'
);

matchesXMLString(
    jml('div', [
        'text0',
        {'#': ['text1', ['span', ['inner text']], 'text2']},
        'text3'
    ]),
    '<div xmlns="http://www.w3.org/1999/xhtml">text0text1<span>inner text</span>text2text3</div>'
);

// Allow the following form (fragment INSTEAD of child array rather than the fragment as the only argument of a child array)? If so, add to README as well.
/*
assert.matchesXMLString(
    jml('div',
        {'#': ['text1', ['span', ['inner text']], 'text2']}
    ),
    '<div xmlns="http://www.w3.org/1999/xhtml">text1<span>inner text</span>text2</div>'
);
*/

matchesXMLString(
    jml('div', {dataset: {'abcDefGh': 'fff', 'jkl-mno-pq': 'ggg'}}),
    '<div xmlns="http://www.w3.org/1999/xhtml" data-abc-def-gh="fff" data-jkl-mno-pq="ggg"></div>'
);

matchesXMLString(
    jml('div', {style: {'float': 'left', 'border-color': 'red'}}, ['test']),
    '<div xmlns="http://www.w3.org/1999/xhtml" style="float: left; border-color: red;">test</div>'
);

let str;
const input = jml('input', {
    type: 'button',
    style: 'position:absolute; left: -1000px;',
    $on: {click: [function () {
        str = 'worked1';
    }, true]}
}, document.body);
input.click(); // IE won't activate unless the above element is appended to the DOM

matches(str, 'worked1');

const input2 = jml('input', {
    style: 'position:absolute; left: -1000px;',
    $on: {
        click: function () {
            str = 'worked3';
        },
        change: [function () {
            str = 'worked2';
        }, true]
    }
}, document.body); // For focus (or select) event to work, we need to append to the document

if (input2.fireEvent) {
    input2.fireEvent('onchange');
} else {
    const event = new Event('change');
    input2.dispatchEvent(event);
}
matches(str, 'worked2');

input2.click();
matches(str, 'worked3');

matchesXMLString(
    jml('div', [
        ['!', 'a comment'],
        ['?', 'customPI', 'a processing instruction'],
        ['&', 'copy'],
        ['#', '1234'],
        ['#x', 'ab3'],
        ['![', '&test <CDATA> content']
    ]),
    '<div xmlns="http://www.w3.org/1999/xhtml"><!--a comment--' +
    '><' +
    // Any way to overcome the IE problem with pseudo-processing instructions?
    (isIE ? '!--' : '') +
    '?customPI a processing instruction?' +
    (isIE ? '--' : '') +
    '>\u00A9\u04D2\u0AB3&amp;test &lt;CDATA&gt; content</div>'
);

matches(
    jml('abc', {xmlns: 'def'}).namespaceURI,
    'def'
);

matchesXMLString(
    jml('abc', {z: 3, xmlns: {'prefix3': 'zzz', 'prefix1': 'def', 'prefix2': 'ghi'}, b: 7, a: 6}),
    '<abc xmlns="http://www.w3.org/1999/xhtml" xmlns:prefix3="zzz" xmlns:prefix1="def" xmlns:prefix2="ghi" z="3" b="7" a="6"></abc>'
);

matchesXMLString(
    jml('abc', {xmlns: {'prefix1': 'def', 'prefix2': 'ghi', '': 'newdefault'}}),
    '<abc xmlns="newdefault" xmlns:prefix1="def" xmlns:prefix2="ghi"/>'
);

matches(
    jml('abc', {xmlns: {'prefix1': 'def', 'prefix2': 'ghi', '': 'newdefault'}}).namespaceURI,
    'newdefault'
);
/*
// lookupNamespaceURI(prefix) is not working in Mozilla, so we test this way
assert.matches(
    jml('abc', {xmlns: {'prefix1': 'def', 'prefix2': 'ghi'}}, [
        {$: {prefix2: ['prefixedElement']}}
    ]).firstChild.namespaceURI,
    ''
);
*/

matchesXMLString(
    jml('ul', [
        [
            'li', {'style': 'color:red;'}, ['First Item'],
            'li', {
                'title': 'Some hover text.',
                'style': 'color:green;'
            },
            ['Second Item'],
            'li', [
                ['span',
                    {
                        'class': 'Remove-Me',
                        'style': 'font-weight:bold;'
                    },
                    ['Not Filtered']
                ],
                ' Item'
            ],
            'li', [
                ['a',
                    {
                        'href': '#NewWindow'
                    },
                    ['Special Link']
                ]
            ],
            null
        ]
    ], document.body),
    '<ul xmlns="http://www.w3.org/1999/xhtml"><li style="color: red;">First Item</li>' +
    '<li title="Some hover text." style="color: green;">Second Item</li>' +
    '<li><span class="Remove-Me" style="font-weight: bold;">Not Filtered</span> Item</li>' +
    '<li><a href="#NewWindow">Special Link</a></li></ul>'
);

matchesXMLString(
    jml('style', {id: 'myStyle'}, ['p.test {color:red;}'], document.body),
    '<style xmlns="http://www.w3.org/1999/xhtml" id="myStyle">p.test {color:red;}</style>'
);

jml('p', {'class': 'test'}, ['test'], document.body);

matchesXMLString(
    jml('div', {dataset: {
        'aCamel-case': {result: 'hello', result2: 'helloTwo'},
        'anotherResult': 'world', 'aNullishToIgnore': null, aNum: 8
    }}),
    '<div xmlns="http://www.w3.org/1999/xhtml" data-a-camel-case-result="hello" ' +
    'data-a-camel-case-result2="helloTwo" data-another-result="world" data-a-num="8"></div>'
);

matchesXMLString(
    jml('script', {'class': 'test'}, ['console.log("hello!");'], document.body),
    '<script xmlns="http://www.w3.org/1999/xhtml" class="test">console.log("hello!");</script>'
);

const [myMap, elem] = jml.weak({
    localVar: 'localValue',
    myMethod (elem, arg1) {
        return arg1 + ' ' + this.localVar + ' ' + elem.querySelector('input').value;
    }
}, 'div', {id: 'mapTest'}, [
    ['input', {value: '100', $on: {
        input () {
            matches(
                myMap.invoke(this.parentNode, 'myMethod', 'internal test'),
                'internal test localValue 1001'
            );
        }
    }}],
    ['div', {id: 'clickArea', $data: {
        localVariable: 8,
        test (el, arg1) {
            matches(
                arg1 + ' ' + el.id + this.localVariable,
                'arg1 clickArea8'
            );
        }
    }, $on: {
        click () {
            myMap.invoke(this, 'test', 'arg1');
        }
    }}]
], document.body);
matches(
    myMap.invoke(elem, 'myMethod', 'external test'),
    'external test localValue 100'
);
matches(
    myMap.get('#mapTest').localVar, // Test overridden `get` accepting selectors also
    'localValue'
);

const mapInput = $('#mapTest').firstElementChild;
mapInput.value = '1001';
mapInput.dispatchEvent(
    new Event('input')
);
const mapDiv = $('#clickArea');
mapDiv.dispatchEvent(new Event('click'));

// Todo: Let `$map` accept an array of map-object arrays (and add tests)
const weakMap1 = new WeakMap();
const weakMap2 = new jml.WeakMap();
const testObj1 = {test: 5};
const testObj2 = {test: 7};
const testFunc = function (arg1) { return this.id + ' ok ' + arg1; };
const el = jml({$map: [weakMap1, testObj1]}, 'div', {id: 'mapAttributeTest'}, [
    ['input', {id: 'input1', $data: true}, ['Test']],
    ['input', {id: 'input2', $data: [weakMap2, testObj2]}],
    ['input', {id: 'input3', $data: weakMap1}],
    ['input', {id: 'input4', $data: testObj2}],
    ['input', {id: 'input5', $data: [, testObj1]}], // eslint-disable-line no-sparse-arrays
    ['input', {id: 'input6', $data: [weakMap1]}],
    ['input', {id: 'input7', $data: [weakMap1, testFunc]}]
], document.body);
matches(
    weakMap1.get(el),
    testObj1
);
matches(
    weakMap1.get($('#input1')),
    testObj1
);
matches(
    weakMap2.get($('#input2')),
    testObj2
);
matches(
    weakMap1.get($('#input3')),
    testObj1
);
matches(
    weakMap1.get($('#input4')),
    testObj2
);
matches(
    weakMap1.get($('#input5')),
    testObj1
);
matches(
    weakMap1.get($('#input6')),
    testObj1
);
matches(
    jml.command($('#input7'), weakMap1, 'arg1'),
    'input7 ok arg1'
);
// Todo: Add tests for array of map strings

const privateSym = Symbol('Test symbol');
jml('div', [
    ['input', {id: 'symInput1', $symbol: ['publicForSym1', function (arg1) {
        matches(
            this.id + ' ' + arg1,
            'symInput1 arg1'
        );
    }]}],
    ['div', {id: 'divSymbolTest', $on: {
        click () {
            // Can supply element or selector to `jml.sym` utility
            jml.sym(this.previousElementSibling, 'publicForSym1')('arg1');
            jml.sym($('#symInput2'), privateSym)('arg2');
            jml.sym('#symInput3', privateSym).test('arg3');

            // Or add symbol directly:
            this.previousElementSibling[Symbol.for('publicForSym1')]('arg1');
            $('#symInput2')[privateSym]('arg2');
        }
    }}],
    ['input', {id: 'symInput2', $symbol: [privateSym, (arg1) => {
        // No `this` available as using arrow function, but would give element
        matches(
            arg1,
            'arg2'
        );
    }]}],
    ['input', {id: 'symInput3', $symbol: [privateSym, {
        localValue: 5,
        test (arg1) {
            matches(
                this.localValue,
                5
            );
            matches(
                this.elem.id + ' ' + arg1,
                'symInput3 arg3'
            );
        }
    }]}]
], document.body);

$('#symInput1')[Symbol.for('publicForSym1')]('arg1');
jml.sym($('#symInput1'), 'publicForSym1')('arg1');
jml.sym('#symInput1', 'publicForSym1')('arg1');

$('#symInput2')[privateSym]('arg2');

$('#symInput3')[privateSym].test('arg3');
jml.sym('#symInput3', privateSym).test('arg3');
$('#divSymbolTest').dispatchEvent(new Event('click'));
jml.command('#symInput1', 'publicForSym1', 'arg1');
jml.command('#symInput3', privateSym, 'test', 'arg3');

jml('section', {
    id: 'myElem',
    $shadow: {
        open: true, // Default (can also use `closed`)
        template: [
            {id: 'myTemplate'},
            [
                ['style', [`
                    :host {color: red;}
                    ::slotted(p) {color: blue;}
                `]],
                ['slot', {name: 'h'}, ['NEED NAMED SLOT']],
                ['h2', ['Heading level 2']],
                ['slot', ['DEFAULT CONTENT HERE']]
            ]
        ]
    }
}, [
    ['h1', {slot: 'h'}, ['Heading level 1']],
    ['p', ['Other content']]
], document.body);

jml('section', {
    id: 'myElem2',
    $shadow: {
        content: [ // Could also define as `open: []`
            ['style', [`
                :host {color: red;}
                ::slotted(p) {color: blue;}
            `]],
            ['slot', {name: 'h'}, ['NEED NAMED SLOT']],
            ['h2', ['Heading level 2']],
            ['slot', ['DEFAULT CONTENT HERE']]
        ]
    }
}, [
    ['h1', {slot: 'h'}, ['Heading level 1']],
    ['p', ['Other content']]
], document.body);

const myEl = jml('my-el', {
    id: 'myEl',
    $define: {
        test () {
            return this.id;
        }
    }
}, document.body);
matches(
    myEl.test(),
    'myEl'
);

let constructorSetVar2;
jml('my-el2', {
    id: 'myEl2',
    $define: function () {
        constructorSetVar2 = this.id;
    }
}, document.body);
matches(
    constructorSetVar2,
    'myEl2'
);

let constructorSetVar3;
jml('my-el3', {
    id: 'myEl3',
    $define: class extends HTMLElement {
        constructor () {
            super();
            constructorSetVar3 = this.id;
        }
    }
}, document.body);
matches(
    constructorSetVar3,
    'myEl3'
);

let constructorSetVar4;
const myel4 = jml('my-el4', {
    id: 'myEl4',
    $define: [function () {
        constructorSetVar4 = this.id;
    }, {
        test () {
            matches(this.id, 'myEl4');
        },
        test2 () {
            this.test();
        }
    }]
}, document.body);
matches(
    constructorSetVar4,
    'myEl4'
);
myel4.test();
myel4.test2();

let constructorSetVar5;
const myel5 = jml('my-el5', {
    id: 'myEl5',
    $define: [class extends HTMLElement {
        constructor () {
            super();
            constructorSetVar5 = this.id;
        }
    }, {
        test () {
            matches(this.id, 'myEl5');
        },
        test2 () {
            this.test();
        }
    }]
}, document.body);
matches(
    constructorSetVar5,
    'myEl5'
);
myel5.test();
myel5.test2();

const mySelect = jml('select', {
    id: 'mySelect',
    $custom: {
        [Symbol.for('testCustom')] () {
            return this.test();
        },
        test () {
            return this.id;
        },
        test2 () {
            return this.test();
        }
    }
}, document.body);

matches(
    mySelect.test(),
    'mySelect'
);
matches(
    mySelect.test2(),
    'mySelect'
);
matches(
    mySelect[Symbol.for('testCustom')](),
    'mySelect'
);

/*
// If customized built-in elements implemented, ensure testing `$define: [constructor, prototype, {extends: '<nativeElem>'}]`
const mySelect = jml('select', {
    id: 'mySelect',
    is: 'my-select',
    $define: {
        test () {
            return this.id;
        }
    }
}, document.body);
assert.matches(
    mySelect.test(),
    'mySelect'
);
*/

//

})));
