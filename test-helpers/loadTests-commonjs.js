'use strict';

// From https://github.com/brettz9/jamilih/blob/master/polyfills/XMLSerializer.js
/* globals DOMException */
/**
* Currently applying not only as a polyfill for IE but for other browsers in order to ensure consistent serialization. For example,
*  its serialization method is serializing attributes in alphabetical order despite Mozilla doing so in document order since
* IE does not appear to otherwise give a readily determinable order
* @license MIT, GPL, Do what you want
* @requires polyfill: Array.from
* @requires polyfill: Array.prototype.map
* @requires polyfill: Node.prototype.lookupNamespaceURI
* @todo NOT COMPLETE! Especially for namespaces
*/
const XMLSerializer$1 = function () {};
const xhtmlNS = 'http://www.w3.org/1999/xhtml';
const emptyElements = '|basefont|frame|isindex' + // Deprecated
    '|area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr|',
    nonEmptyElements = 'article|aside|audio|bdi|canvas|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|rp|rt|ruby|section|summary|time|video' + // new in HTML5
    'html|body|p|h1|h2|h3|h4|h5|h6|form|button|fieldset|label|legend|select|option|optgroup|textarea|table|tbody|colgroup|tr|td|tfoot|thead|th|caption|abbr|acronym|address|b|bdo|big|blockquote|center|code|cite|del|dfn|em|font|i|ins|kbd|pre|q|s|samp|small|strike|strong|sub|sup|tt|u|var|ul|ol|li|dd|dl|dt|dir|menu|frameset|iframe|noframes|head|title|a|map|div|span|style|script|noscript|applet|object|',
    pubIdChar = /^(\u0020|\u000D|\u000A|[a-zA-Z0-9]|[-'()+,./:=?;!*#@$_%])*$/, // eslint-disable-line no-control-regex
    xmlChars = /([\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD]|[\uD800-\uDBFF][\uDC00-\uDFFF])*$/; // eslint-disable-line no-control-regex

const entify = function (str) { // FIX: this is probably too many replaces in some cases and a call to it may not be needed at all in some cases
    return str.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
};
const clone = function (obj) { // We don't need a deep clone, so this should be sufficient without recursion
    let prop;
    const newObj = {};
    for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            newObj[prop] = obj[prop];
        }
    }
    return JSON.parse(JSON.stringify(newObj));
};
const invalidStateError = function () { // These are probably only necessary if working with text/html
    {
        // INVALID_STATE_ERR per section 9.3 XHTML 5: http://www.w3.org/TR/html5/the-xhtml-syntax.html
        throw window.DOMException && DOMException.create
            ? DOMException.create(11)
            // If the (nonstandard) polyfill plugin helper is not loaded (e.g., to reduce overhead and/or modifying a global's property), we'll throw our own light DOMException
            : {message: 'INVALID_STATE_ERR: DOM Exception 11', code: 11};
    }
};
const addExternalID = function (node, all) {
    if (node.systemId.includes('"') && node.systemId.includes("'")) {
        invalidStateError();
    }
    let string = '';
    const
        publicId = node.publicId !== 'undefined' && node.publicId,
        systemId = node.systemId !== 'undefined' && node.systemId,
        publicQuote = publicId && publicId.includes("'") ? "'" : '"', // Don't need to check for quotes here, since not allowed with public
        systemQuote = systemId && systemId.includes("'") ? "'" : '"'; // If as "entity" inside, will it return quote or entity? If former, we need to entify here (should be an error per section 9.3 of http://www.w3.org/TR/html5/the-xhtml-syntax.html )
    if (systemId && publicId) {
        string += ' PUBLIC ' + publicQuote + publicId + publicQuote + ' ' + systemQuote + systemId + systemQuote;
    } else if (publicId) {
        string += ' PUBLIC ' + publicQuote + publicId + publicQuote;
    } else if (all || systemId) {
        string += ' SYSTEM ' + systemQuote + systemId + systemQuote;
    }
    return string;
};
const notIEInsertedAttributes = function (att, node, nameVals) {
    return nameVals.every(function (nameVal) {
        const name = Array.isArray(nameVal) ? nameVal[0] : nameVal,
            val = Array.isArray(nameVal) ? nameVal[1] : null;
        return att.name !== name ||
            (val && att.value !== val) ||
            // (!node.outerHTML.match(new RegExp(' ' + name + '=')));
            (node.outerHTML.match(new RegExp(' ' + name + '=' + val ? '"' + val + '"' : '')));
    });
};
const serializeToString = function (nodeArg) {
    // if (nodeArg.xml) { // If this is genuine XML, IE should be able to handle it (and anyways, I am not sure how to override the prototype of XML elements in IE as we must do to add the likes of lookupNamespaceURI)
    //   return nodeArg.xml;
    // }
    const that = this,
        namespaces = {},
        nodeType = nodeArg.nodeType;
    let emptyElement;
    let htmlElement = true; // Todo: Make conditional on namespace?
    let string = '';
    let children = {};
    let i = 0;

    function serializeDOM (node, namespaces) {
        let children, tagName, tagAttributes, tagAttLen, opt, optionsLen, prefix, val, content, i, textNode,
            string = '';
        const nodeValue = node.nodeValue,
            type = node.nodeType;
        namespaces = clone(namespaces) || {}; // Ensure we're working with a copy, so different levels in the hierarchy can treat it differently

        if ((node.prefix && node.prefix.includes(':')) || (node.localName && node.localName.includes(':'))) {
            invalidStateError();
        }

        if (
            ((type === 3 || type === 4 || type === 7 || type === 8) &&
                !xmlChars.test(nodeValue)) ||
            ((type === 2) && !xmlChars.test(node.value)) // Attr.nodeValue is now deprecated, so we use Attr.value
        ) {
            invalidStateError();
        }

        switch (type) {
        case 1: // ELEMENT
            tagName = node.tagName;

            {
                tagName = tagName.toLowerCase();
            }

            if (that.$formSerialize) {
                // Firefox serializes certain properties even if only set via JavaScript ("disabled", "readonly") and it sometimes even adds the "value" property in certain cases (<input type=hidden>)
                if ('|input|button|object|'.includes('|' + tagName + '|')) {
                    if (node.value !== node.defaultValue) { // May be undefined for an object, or empty string for input, etc.
                        node.setAttribute('value', node.value);
                    }
                    if (tagName === 'input' && node.checked !== node.defaultChecked) {
                        if (node.checked) {
                            node.setAttribute('checked', 'checked');
                        } else {
                            node.removeAttribute('checked');
                        }
                    }
                } else if (tagName === 'select') {
                    for (i = 0, optionsLen = node.options.length; i < optionsLen; i++) {
                        opt = node.options[i];
                        if (opt.selected !== opt.defaultSelected) {
                            if (opt.selected) {
                                opt.setAttribute('selected', 'selected');
                            } else {
                                opt.removeAttribute('selected');
                            }
                        }
                    }
                }
            }

            // Make this consistent, e.g., so browsers can be reliable in serialization

            // Attr.nodeName and Attr.nodeValue are deprecated as of DOM4 as Attr no longer inherits from Node, but we can safely use name and value
            tagAttributes = [].slice.call(node.attributes);

            // Were formally alphabetical in some browsers
            /* .sort(function (attr1, attr2) {
                return attr1.name > attr2.name ? 1 : -1;
            }); */

            prefix = node.prefix;

            string += '<' + tagName;
            /**/
            // Do the attributes above cover our namespaces ok? What if unused but in the DOM?
            if (namespaces[prefix || '$'] === undefined) {
                namespaces[prefix || '$'] = node.namespaceURI || xhtmlNS;
                string += ' xmlns' + (prefix ? ':' + prefix : '') +
                            '="' + entify(namespaces[prefix || '$']) + '"';
            }
            // */
            tagAttLen = tagAttributes.length;
            // Todo: optimize this by joining the for loops together but inserting into an array to sort
            /*
            // Used to be serialized first
            for (i = 0; i < tagAttLen; i++) {
                if (tagAttributes[i].name.match(/^xmlns:\w*$/)) {
                    string += ' ' + tagAttributes[i].name + // .toLowerCase() +
                        '="' + entify(tagAttributes[i].value) + '"'; // .toLowerCase()
                }
            }
            */
            for (i = 0; i < tagAttLen; i++) {
                if (
                    // IE includes attributes like type=text even if not explicitly added as such
                    // Todo: Maybe we should ALWAYS apply instead of never apply in the case of type=text?
                    // Todo: Does XMLSerializer serialize properties in any browsers as well (e.g., if after setting an input.value); it does not in Firefox, but I think this could be very useful (especially since we are
                    // changing native behavior in Firefox anyways in order to sort attributes in a consistent manner
                    // with IE
                    notIEInsertedAttributes(tagAttributes[i], node, [
                        ['type', 'text'], 'colSpan', 'rowSpan', 'cssText', 'shape'
                    ]) &&
                    // Had to add before
                    // && !tagAttributes[i].name.match(/^xmlns:?\w*$/) // Avoid adding these (e.g., from Firefox) as we add above
                    tagAttributes[i].name !== 'xmlns'
                ) {
                    // value = tagAttributes[i].value.split(/;\s+/).sort().join(' ');
                    // else { */
                    string += ' ' + tagAttributes[i].name + // .toLowerCase() +
                        '="' + entify(tagAttributes[i].value) + '"'; // .toLowerCase()
                }
            }

            emptyElement = emptyElements.includes('|' + tagName + '|');
            htmlElement = node.namespaceURI === xhtmlNS || nonEmptyElements.includes('|' + tagName + '|'); // || emptyElement;

            if (!node.firstChild && (emptyElement || !htmlElement)) {
                // string += mode === 'xml' || node.namespaceURI !== xhtmlNS ? ' />' : '>';
                string += (htmlElement ? ' ' : '') + '/>';
            } else {
                string += '>';
                children = node.childNodes;
                // Todo: After text nodes are only entified in XML, could change this first block to insist on document.createStyleSheet
                if (tagName === 'script' || tagName === 'style') {
                    if (tagName === 'script' && (node.type === '' || node.type === 'text/javascript')) {
                        string += document.createStyleSheet ? node.text : node.textContent;
                        // serializeDOM(document.createTextNode(node.text), namespaces);
                    } else if (tagName === 'style') {
                        // serializeDOM(document.createTextNode(node.cssText), namespaces);
                        string += document.createStyleSheet ? node.cssText : node.textContent;
                    }
                } else {
                    if (that.$formSerialize && tagName === 'textarea') {
                        textNode = document.createTextNode(node.value);
                        children = [textNode];
                    }
                    for (i = 0; i < children.length; i++) {
                        string += serializeDOM(children[i], namespaces);
                    }
                }
                string += '</' + tagName + '>';
            }
            break;
        case 2: // ATTRIBUTE (should only get here if passing in an attribute node)
            return ' ' + node.name + // .toLowerCase() +
                            '="' + entify(node.value) + '"'; // .toLowerCase()
        case 3: // TEXT
            return entify(nodeValue); // Todo: only entify for XML
        case 4: // CDATA
            if (nodeValue.includes(']]' + '>')) {
                invalidStateError();
            }
            return '<' + '![CDATA[' +
                            nodeValue +
                            ']]' + '>';
        case 5: // ENTITY REFERENCE (probably not used in browsers since already resolved)
            return '&' + node.nodeName + ';';
        case 6: // ENTITY (would need to pass in directly)
            val = '';
            content = node.firstChild;

            if (node.xmlEncoding) { // an external entity file?
                string += '<?xml ';
                if (node.xmlVersion) {
                    string += 'version="' + node.xmlVersion + '" ';
                }
                string += 'encoding="' + node.xmlEncoding + '"' +
                                '?>';

                if (!content) {
                    return '';
                }
                while (content) {
                    val += content.nodeValue; // FIX: allow for other entity types
                    content = content.nextSibling;
                }
                return string + content; // reconstruct external entity file, if this is that
            }
            string += '<' + '!ENTITY ' + node.nodeName + ' ';
            if (node.publicId || node.systemId) { // External Entity?
                string += addExternalID(node);
                if (node.notationName) {
                    string += ' NDATA ' + node.notationName;
                }
                string += '>';
                break;
            }

            if (!content) {
                return '';
            }
            while (content) {
                val += content.nodeValue; // FIX: allow for other entity types
                content = content.nextSibling;
            }
            string += '"' + entify(val) + '">';
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
            return '<?' + node.target + ' ' + nodeValue + '?>';
        case 8: // COMMENT
            if (nodeValue.includes('--') ||
                (nodeValue.length && nodeValue.lastIndexOf('-') === nodeValue.length - 1)
            ) {
                invalidStateError();
            }
            return '<' + '!--' + nodeValue + '-->';
        case 9: // DOCUMENT (handled earlier in script)
            break;
        case 10: // DOCUMENT TYPE
            string += '<' + '!DOCTYPE ' + node.name;
            if (!pubIdChar.test(node.publicId)) {
                invalidStateError();
            }
            string += addExternalID(node) +
                            (node.internalSubset ? '[\n' + node.internalSubset + '\n]' : '') +
                            '>\n';
            /* Fit in internal subset along with entities?: probably don't need as these would only differ if from DTD, and we're not rebuilding the DTD
            var notations = node.notations;
            if (notations) {
                for (i=0; i < notations.length; i++) {
                    serializeDOM(notations[0], namespaces);
                }
            }
            */
            // UNFINISHED
            break;
        case 11: // DOCUMENT FRAGMENT (handled earlier in script)
            break;
        case 12: // NOTATION (would need to be passed in directly)
            return '<' + '!NOTATION ' + node.nodeName +
                            addExternalID(node, true) +
                            '>';
        default:
            throw new Error('Not an XML type');
        }
        return string;
    }

    if (document.xmlVersion && nodeType === 9) { // DOCUMENT - Faster to do it here without first calling serializeDOM
        string += '<?xml version="' + document.xmlVersion + '"';
        if (document.xmlEncoding !== undefined && document.xmlEncoding !== null) {
            string += ' encoding="' + document.xmlEncoding + '"';
        }
        if (document.xmlStandalone !== undefined) { // Could configure to only output if "yes"
            string += ' standalone="' + (document.xmlStandalone ? 'yes' : 'no') + '"';
        }
        string += '?>\n';
    }
    if (nodeType === 9 || nodeType === 11) { // DOCUMENT & DOCUMENT FRAGMENT - Faster to do it here without first calling serializeDOM
        children = nodeArg.childNodes;
        for (i = 0; i < children.length; i++) {
            string += serializeDOM(children[i], namespaces); // children[i].cloneNode(true)
        }
        return string;
    }
    // While safer to clone to avoid modifying original DOM, we need to iterate over properties to obtain textareas and select menu states (if they have been set dynamically) and these states are lost upon cloning (even though dynamic setting of input boxes is not lost to the DOM)
    // See http://stackoverflow.com/a/21060052/271577 and:
    // https://bugzilla.mozilla.org/show_bug.cgi?id=197294
    // https://bugzilla.mozilla.org/show_bug.cgi?id=230307
    // https://bugzilla.mozilla.org/show_bug.cgi?id=237783
    // nodeArg = nodeArg.cloneNode(true);
    return serializeDOM(nodeArg, namespaces);
};

XMLSerializer$1.prototype.serializeToString = serializeToString;

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

let win = typeof window !== 'undefined' && window;
let doc = typeof document !== 'undefined' && document;
let XmlSerializer = typeof XMLSerializer !== 'undefined' && XMLSerializer;

// STATIC PROPERTIES

const possibleOptions = [
    '$plugins',
    '$map' // Add any other options here
];

const NS_HTML = 'http://www.w3.org/1999/xhtml',
    hyphenForCamelCase = /-([a-z])/g;

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
    'accessKey', // HTMLElement
    'async',
    'autocapitalize', // HTMLElement
    'autofocus',
    'contentEditable', // HTMLElement through ElementContentEditable
    'defaultValue',
    'defer',
    'draggable', // HTMLElement
    'formnovalidate',
    'hidden', // HTMLElement
    'innerText', // HTMLElement
    'inputMode', // HTMLElement through ElementContentEditable
    'ismap',
    'multiple',
    'novalidate',
    'pattern',
    'required',
    'spellcheck', // HTMLElement
    'translate', // HTMLElement
    'value',
    'willvalidate'
]);
// Todo: Add more to this as useful for templating
//   to avoid setting through nullish value
const NULLABLES = [
    'dir', // HTMLElement
    'lang', // HTMLElement
    'max',
    'min',
    'title' // HTMLElement
];

const $ = (sel) => doc.querySelector(sel);

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
        if ('nodeType' in item) {
            if (item.nodeType === 1) {
                return 'element';
            }
            if (item.nodeType === 11) {
                return 'fragment';
            }
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
    return jml$1(...(
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
    return jml$1(arg);
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
        const j = Array.isArray(childNodeJML) ? jml$1(...childNodeJML) : jml$1(childNodeJML);
        cn.parentNode.replaceChild(j, cn);
    };
}

/**
* @private
* @static
*/
function _appendJML (node) {
    return function (childJML) {
        node.appendChild(jml$1(...childJML));
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
            node.appendChild(jml$1(...childJML));
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
const jml$1 = function jml (...args) {
    let elem = doc.createDocumentFragment();
    function _checkAtts (atts) {
        let att;
        for (att in atts) {
            if (!atts.hasOwnProperty(att)) {
                continue;
            }
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
                        template = $(template);
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
                nodes[nodes.length] = node;
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
                    node = doc.implementation.createDocumentType(attVal.name, attVal.publicId || '', attVal.systemId || '');
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
            }
            // #if IS_REMOVE
            // Don't remove this `if` block (for sake of no-innerHTML build)
            case 'innerHTML':
                if (attVal != null) {
                    elem.innerHTML = attVal;
                }
                break;
            // #endif
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
                if (att === 'style') {
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
                        break;
                    }
                    // setAttribute unfortunately erases any existing styles
                    elem.setAttribute(att, attVal);
                    /*
                    // The following reorders which is troublesome for serialization, e.g., as used in our testing
                    if (elem.style.cssText !== undefined) {
                        elem.style.cssText += attVal;
                    } else { // Opera
                        elem.style += attVal;
                    }
                    */
                    break;
                }
                const matchingPlugin = opts && opts.$plugins && opts.$plugins.find((p) => {
                    return p.name === att;
                });
                if (matchingPlugin) {
                    matchingPlugin.set({element: elem, attribute: {name: att, value: attVal}});
                    break;
                }
                elem.setAttribute(att, attVal);
                break;
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
        if ('$plugins' in opts) {
            if (!Array.isArray(opts.$plugins)) {
                throw new Error('$plugins must be an array');
            }
            opts.$plugins.forEach((pluginObj) => {
                if (!pluginObj) {
                    throw new TypeError('Plugin must be an object');
                }
                if (!pluginObj.name || !pluginObj.name.startsWith('$_')) {
                    throw new TypeError('Plugin object name must be present and begin with `$_`');
                }
                if (typeof pluginObj.set !== 'function') {
                    throw new TypeError('Plugin object must have a `set` method');
                }
            });
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
jml$1.toJML = function (dom, config) {
    config = config || {stringOutput: false};
    if (typeof dom === 'string') {
        dom = new DOMParser().parseFromString(dom, 'text/html'); // todo: Give option for XML once implemented and change JSDoc to allow for Element
    }

    const ret = [];
    let parent = ret;
    let parentIdx = 0;

    function invalidStateError () { // These are probably only necessary if working with text/html
        function DOMException () { return this; }
        {
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

        const type = 'nodeType' in node ? node.nodeType : null;
        namespaces = Object.assign({}, namespaces);

        const xmlChars = /([\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD]|[\uD800-\uDBFF][\uDC00-\uDFFF])*$/; // eslint-disable-line no-control-regex
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
        case undefined: // Treat as attribute node until this is fixed: https://github.com/tmpvar/jsdom/issues/1641 / https://github.com/tmpvar/jsdom/pull/1822
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
            const pubIdChar = /^(\u0020|\u000D|\u000A|[a-zA-Z0-9]|[-'()+,./:=?;!*#@$_%])*$/; // eslint-disable-line no-control-regex
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
jml$1.toJMLString = function (dom, config) {
    return jml$1.toJML(dom, Object.assign(config || {}, {stringOutput: true}));
};
jml$1.toDOM = function (...args) { // Alias for jml()
    return jml$1(...args);
};
jml$1.toHTML = function (...args) { // Todo: Replace this with version of jml() that directly builds a string
    const ret = jml$1(...args);
    // Todo: deal with serialization of properties like 'selected', 'checked', 'value', 'defaultValue', 'for', 'dataset', 'on*', 'style'! (i.e., need to build a string ourselves)
    return ret.outerHTML;
};
jml$1.toDOMString = function (...args) { // Alias for jml.toHTML for parity with jml.toJMLString
    return jml$1.toHTML(...args);
};
jml$1.toXML = function (...args) {
    const ret = jml$1(...args);
    return new XmlSerializer().serializeToString(ret);
};
jml$1.toXMLDOMString = function (...args) { // Alias for jml.toXML for parity with jml.toJMLString
    return jml$1.toXML(...args);
};

class JamilihMap extends Map {
    get (elem) {
        elem = typeof elem === 'string' ? $(elem) : elem;
        return super.get.call(this, elem);
    }
    set (elem, value) {
        elem = typeof elem === 'string' ? $(elem) : elem;
        return super.set.call(this, elem, value);
    }
    invoke (elem, methodName, ...args) {
        elem = typeof elem === 'string' ? $(elem) : elem;
        return this.get(elem)[methodName](elem, ...args);
    }
}
class JamilihWeakMap extends WeakMap {
    get (elem) {
        elem = typeof elem === 'string' ? $(elem) : elem;
        return super.get(elem);
    }
    set (elem, value) {
        elem = typeof elem === 'string' ? $(elem) : elem;
        return super.set(elem, value);
    }
    invoke (elem, methodName, ...args) {
        elem = typeof elem === 'string' ? $(elem) : elem;
        return this.get(elem)[methodName](elem, ...args);
    }
}

jml$1.Map = JamilihMap;
jml$1.WeakMap = JamilihWeakMap;

jml$1.weak = function (obj, ...args) {
    const map = new JamilihWeakMap();
    const elem = jml$1({$map: [map, obj]}, ...args);
    return [map, elem];
};

jml$1.strong = function (obj, ...args) {
    const map = new JamilihMap();
    const elem = jml$1({$map: [map, obj]}, ...args);
    return [map, elem];
};

jml$1.symbol = jml$1.sym = jml$1.for = function (elem, sym) {
    elem = typeof elem === 'string' ? $(elem) : elem;
    return elem[typeof sym === 'symbol' ? sym : Symbol.for(sym)];
};

jml$1.command = function (elem, symOrMap, methodName, ...args) {
    elem = typeof elem === 'string' ? $(elem) : elem;
    let func;
    if (['symbol', 'string'].includes(typeof symOrMap)) {
        func = jml$1.sym(elem, symOrMap);
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

jml$1.setWindow = (wind) => {
    win = wind;
};
jml$1.setDocument = (docum) => {
    doc = docum;
    if (docum && docum.body) {
        body = docum.body;
    }
};
jml$1.setXMLSerializer = (xmls) => {
    XmlSerializer = xmls;
};

jml$1.getWindow = () => {
    return win;
};
jml$1.getDocument = () => {
    return doc;
};
jml$1.getXMLSerializer = () => {
    return XmlSerializer;
};

let body = doc && doc.body;

/* eslint-env node */

// import {JSDOM} from 'jsdom';
const {JSDOM} = require('jsdom');

const win$1 = new JSDOM('').window;

jml$1.setWindow(win$1);
jml$1.setDocument(win$1.document);
// jml.setXMLSerializer(require('xmldom').XMLSerializer);
jml$1.setXMLSerializer(XMLSerializer$1);

let currentTester;

const nbsp$1 = '\u00a0';
const write = (...msgs) => {
    if (currentTester) {
        currentTester.ok(...msgs);
        return;
    }
    if (typeof module === 'undefined') {
        document.body.append(
            ...msgs, ...Array.from({length: 2}, () => document.createElement('br'))
        );
    } else {
        console.log(...msgs);
    }
};
const skip = (...msgs) => { // Todo: Could track and report on test count
    return write(...msgs);
};
const assert = (ok, msg) => {
    if (!ok) {
        const err = new Error('Stack');
        console.log('Assertion not ok:', err);
    }
    write(!!ok, ` ${nbsp$1}` + msg);
};
const matches = (item1, item2, msg) => {
    if (!item2) { // For convenience in debugging
        console.log('Missing item2\n', item1);
    }
    if (item1 !== item2) {
        const err = new Error('Stack');
        console.log('Items not equal:', err);
        console.log(item1 + '\n\n' + item2);
    }
    write(item1 === item2, ` ${nbsp$1}` + msg);
};
const matchesXMLStringWithinElement = (element, item2, msg) => {
    const docFrag = document.createDocumentFragment();
    for (let i = 0; i < element.childNodes.length; i++) {
        docFrag.appendChild(element.childNodes[i].cloneNode(true));
    }
    matchesXMLString(docFrag, item2, msg);
};
const matchesXMLStringOnElement = (element, item2, msg) => {
    const lastInsert = element.childNodes[element.childNodes.length - 1];
    matchesXMLString(lastInsert, item2, msg);
};
const matchesXMLString = (item1, item2, msg) => {
    const ser = new XMLSerializer();
    item1 = ser.serializeToString(item1);
    matches(item1, item2, msg);
};

const init = (test, expected) => {
    if (expected) {
        test.expect(expected);
    }
    currentTester = test;
};

const throws = (cb, msg) => {
    try {
        cb();
        assert(false, `Should throw: ${msg}`);
    } catch (err) {
        assert(true, msg);
    }
};

/* globals jml */

const $$1 = (sel) => { return document.querySelector(sel); };

const testCase = {
    setUp (callback) {
        let jmlTestContent = $$1('#jmlTestContent');
        if (!jmlTestContent) {
            jmlTestContent = document.createElement('div');
            jmlTestContent.id = 'jmlTestContent';
            $$1('body').append(jmlTestContent);
        }
        jmlTestContent.innerHTML = `
            <div style="display:none;" id="DOMChildrenMustBeInArray">test1</div>
            <div style="display:none;" id="anotherElementToAddToParent">test2</div>
            <div style="display:none;" id="yetAnotherSiblingToAddToParent">test3</div>
        `;
        callback();
    },
    'Single element with no children' (test) {
        init(test, 3);

        matchesXMLString(
            jml('input'),
            '<input xmlns="http://www.w3.org/1999/xhtml" />',
            'Single element argument element'
        );
        matchesXMLString(
            jml('input', null),
            '<input xmlns="http://www.w3.org/1999/xhtml" />',
            'Single element argument with `null` at end'
        );

        matchesXMLString(
            jml('input', {type: 'password', id: 'my_pass'}),
            '<input xmlns="http://www.w3.org/1999/xhtml" type="password" id="my_pass" />',
            'Single element with two attributes'
        );
        test.done();
    },
    'DOM wrapping' (test) {
        init(test, 2);

        const div = jml(
            'div', {style: 'position:absolute !important; left: -1000px;'}, [
                $$1('#DOMChildrenMustBeInArray')
            ],
            $$1('#anotherElementToAddToParent'),
            $$1('#yetAnotherSiblingToAddToParent'),
            $$1('body')
        );

        matchesXMLString(
            div,
            '<div xmlns="http://www.w3.org/1999/xhtml" style="position:absolute !important; left: -1000px;"><div style="display:none;" id="DOMChildrenMustBeInArray">test1</div></div>',
            // '<div xmlns="http://www.w3.org/1999/xhtml" style="position: absolute; left: -1000px;"><div id="DOMChildrenMustBeInArray" style="display:none;">test1</div></div><div id="anotherElementToAddToParent" style="display:none;">test2</div><div id="yetAnotherSiblingToAddToParent" style="display:none;">test3</div>'
            'Single element with attribute and DOM child and two DOM siblings'
        );

        jml('hr', $$1('body'));
        matchesXMLStringOnElement(
            $$1('body'),
            '<hr xmlns="http://www.w3.org/1999/xhtml" />',
            'Single (empty) DOM element (with body parent)'
        );

        test.done();
    },
    'Single element with children' (test) {
        init(test, 5);
        matchesXMLString(
            jml('div', [
                'no attributes on the div'
            ]),
            '<div xmlns="http://www.w3.org/1999/xhtml">no attributes on the div</div>',
            'Single element with text only'
        );
        matchesXMLString(
            jml('div', [
                ['p', ['no attributes on the div']]
            ]),
            '<div xmlns="http://www.w3.org/1999/xhtml"><p>no attributes on the div</p></div>',
            'Single element with single text-containing element child'
        );
        matchesXMLString(
            jml('div', {'class': 'myClass'}, [
                ['p', ['Some inner text']],
                ['p', ['another child paragraph']]
            ]),
            '<div xmlns="http://www.w3.org/1999/xhtml" class="myClass"><p>Some inner text</p><p>another child paragraph</p></div>',
            'Single element with attribute and two text-containing element children'
        );
        matchesXMLString(
            jml('div', {'class': 'myClass'}, [
                'text1',
                ['p', ['Some inner text']],
                'text3'
            ]),
            '<div xmlns="http://www.w3.org/1999/xhtml" class="myClass">text1<p>Some inner text</p>text3</div>',
            'Single element with attribute containing two next node children separated by an element child'
        );
        const table = jml('table', {style: 'position:absolute; left: -1000px;'}, $$1('body'));
        /* const firstTr = */
        jml(
            'tr', [
                ['td', ['row 1 cell 1']],
                ['td', ['row 1 cell 2']]
            ],
            'tr', {className: 'anotherRowSibling'}, [
                ['td', ['row 2 cell 1']],
                ['td', ['row 2 cell 2']]
            ],
            table
        );

        matchesXMLStringWithinElement(
            table,
            '<tr xmlns="http://www.w3.org/1999/xhtml"><td>row 1 cell 1</td><td>row 1 cell 2</td></tr><tr xmlns="http://www.w3.org/1999/xhtml" class="anotherRowSibling"><td>row 2 cell 1</td><td>row 2 cell 2</td></tr>',
            'Single element with attribute and body parent with separate jml call appending to it two sibling elements each containing text-containing element children (and one with attribute)'
        );
        test.done();
    },
    'Single element wrapped' (test) {
        init(test, 1);
        matches($$1('body'), jml($$1('body')), 'Wrapping single pre-existing DOM element');
        test.done();
    },
    'Namespace declarations' (test) {
        init(test, 4);

        matches(
            jml('abc', {xmlns: 'def'}).namespaceURI,
            'def',
            'Single unknown element with non-HTML default namespace declaration'
        );

        matchesXMLString(
            jml('abc', {z: 3, xmlns: {'prefix3': 'zzz', 'prefix1': 'def', 'prefix2': 'ghi'}, b: 7, a: 6}),
            '<abc xmlns="http://www.w3.org/1999/xhtml" xmlns:prefix3="zzz" xmlns:prefix1="def" xmlns:prefix2="ghi" z="3" b="7" a="6"></abc>',
            'Single element with attributes and prefixed (non-HTML) namespace declarations'
        );

        matchesXMLString(
            jml('abc', {xmlns: {'prefix1': 'def', 'prefix2': 'ghi', '': 'newdefault'}}),
            '<abc xmlns="newdefault" xmlns:prefix1="def" xmlns:prefix2="ghi"/>',
            'Single element with non-HTML default namespace declaration and prefixed declarations'
        );

        matches(
            jml('abc', {xmlns: {'prefix1': 'def', 'prefix2': 'ghi', '': 'newdefault'}}).namespaceURI,
            'newdefault',
            'Single element with non-HTML default namespace declaration and prefixed declarations (confirming namespaceURI)'
        );
        /*
        // Todo:
        // lookupNamespaceURI(prefix) is not working in Mozilla, so we test this way
        xmlTesting.matches(
            jml('abc', {xmlns: {'prefix1': 'def', 'prefix2': 'ghi'}}, [
                {$: {prefix2: ['prefixedElement']}}
            ]).firstChild.namespaceURI,
            '',
            'Single element with prefixed namesapce declarations and element child using one of the prefixes'
        );
        */

        test.done();
    },
    'fragment' (test) {
        init(test, 3);

        jml('table', {style: 'position:absolute; left: -1000px;'}, $$1('body')); // Rebuild
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
        matches(
            ser.serializeToString(trsFragment.childNodes[0]) +
            ser.serializeToString(trsFragment.childNodes[1]),
            '<tr xmlns="http://www.w3.org/1999/xhtml"><td>row 1 cell 1</td><td>row 1 cell 2</td></tr><tr xmlns="http://www.w3.org/1999/xhtml" class="anotherRowSibling"><td>row 2 cell 1</td><td>row 2 cell 2</td></tr>',
            'XMLSerialized fragment children (`null` parent) are equal'
        );

        matchesXMLString(
            jml('div', [
                'text0',
                {'#': ['text1', ['span', ['inner text']], 'text2']},
                'text3'
            ]),
            '<div xmlns="http://www.w3.org/1999/xhtml">text0text1<span>inner text</span>text2text3</div>',
            'Single element with text children separated by fragment (of text nodes separated by element with text child)'
        );

        // Todo: Do we want this in this format?
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
            ], $$1('body')),
            '<ul xmlns="http://www.w3.org/1999/xhtml"><li style="color:red;">First Item</li>' +
            '<li title="Some hover text." style="color:green;">Second Item</li>' +
            '<li><span class="Remove-Me" style="font-weight:bold;">Not Filtered</span> Item</li>' +
            '<li><a href="#NewWindow">Special Link</a></li></ul>',
            'Single element with element children containing siblings and null final argument added to body'
        );

        // Todo: Allow the following form? If so, add to README as well.
        /*
        xmlTesting.matchesXMLString(
            jml('div',
                {'#': ['text1', ['span', ['inner text']], 'text2']}
            ),
            '<div xmlns="http://www.w3.org/1999/xhtml">text1<span>inner text</span>text2</div>',
            'Single element with fragment in place of children'
        );
        */
        test.done();
    },
    'text node' (test) {
        test.expect(2);
        const expected = document.createTextNode('abc');
        const result = jml({$text: 'abc'});
        test.deepEqual(expected.nodeType, result.nodeType, 'Equal `nodeType`');
        test.deepEqual(expected.nodeValue, result.nodeValue, 'Equal `nodeValue`');
        test.done();
    },
    'attribute node' (test) {
        test.expect(3);
        const xlink = ['http://www.w3.org/1999/xlink', 'href', 'http://example.com'];
        const expected = document.createAttributeNS.apply(document, xlink.slice(0, -1));
        expected.value = xlink[2];
        const result = jml({$attribute: xlink});
        test.deepEqual(expected.name, result.name, 'Equal `name`');
        test.deepEqual(expected.value, result.value, 'Equal `value`');
        test.deepEqual(expected.namespaceURI, result.namespaceURI, 'Equal `namespaceURI`');
        // test.strictEqual(result.nodeType, Node.ATTRIBUTE_NODE); // Todo: Commenting out until https://github.com/tmpvar/jsdom/issues/1641 / https://github.com/tmpvar/jsdom/pull/1822
        test.done();
    },
    'Comments, processing instructions, entities, character references, CDATA' (test) {
        init(test, 1);
        const isIE = window.navigator && window.navigator.appName === 'Microsoft Internet Explorer';
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
            '>\u00A9\u04D2\u0AB3&amp;test &lt;CDATA&gt; content</div>',
            'Single element with comment, processing instruction, entity, decimal and hex character references, and CDATA'
        );
        test.done();
    },
    'Document and doctype' (test) {
        init(test, 3);
        const doc = jml({$document: {
            childNodes: [
                {$DOCTYPE: {name: 'NETSCAPE-Bookmark-file-1'}},
                ['html', [
                    ['head', [
                        ['meta', {charset: 'utf-8'}]
                    ]],
                    ['body']
                ]]
            ]
        }});
        matchesXMLString(
            doc.documentElement,
            '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8" /></head><body></body></html>'
        );
        matches(
            doc.firstChild.name,
            'NETSCAPE-Bookmark-file-1'
        );
        matchesXMLString(
            doc,
            `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8" /></head><body></body></html>`
        );
        test.done();
    },
    'Event listeners' (test) {
        init(test, 3);
        let str;
        const input = jml('input', {
            type: 'button',
            style: 'position:absolute; left: -1000px;',
            $on: {click: [function () {
                str = 'worked1';
            }, true]}
        }, $$1('body'));
        input.click(); // IE won't activate unless the above element is appended to the DOM

        matches(str, 'worked1', 'Single empty element with attributes and triggered click listener added to body');

        const input2 = jml('input', {
            style: 'position:absolute; left: -1000px;',
            $on: {
                click () {
                    str = 'worked3';
                },
                change: [function () {
                    str = 'worked2';
                }, true]
            }
        }, $$1('body')); // For focus (or select) event to work, we need to append to the document

        if (input2.fireEvent) {
            input2.fireEvent('onchange');
        } else {
            const event = new Event('change');
            input2.dispatchEvent(event);
        }
        matches(str, 'worked2', 'Single element with attributes and triggered change listener (alongside click) added to body');

        input2.click();
        matches(str, 'worked3', 'Single element with attributes and triggered click listener (alongside change) added to body');

        test.done();
    },
    'style attribute object' (test) {
        init(test, 1);
        matchesXMLString(
            jml('div', {style: {'float': 'left', 'border-color': 'red'}}, ['test']),
            '<div xmlns="http://www.w3.org/1999/xhtml" style="float: left; border-color: red;">test</div>',
            'Single element with style object and text child'
        );
        test.done();
    },
    'dataset' (test) {
        init(test, 2);
        matchesXMLString(
            jml('div', {dataset: {'abcDefGh': 'fff', 'jkl-mno-pq': 'ggg'}}),
            '<div xmlns="http://www.w3.org/1999/xhtml" data-abc-def-gh="fff" data-jkl-mno-pq="ggg"></div>',
            'Single element using dataset with two properties'
        );
        matchesXMLString(
            jml('div', {dataset: {
                'aCamel-case': {result: 'hello', result2: 'helloTwo'},
                'anotherResult': 'world', 'aNullishToIgnore': null, aNum: 8
            }}),
            '<div xmlns="http://www.w3.org/1999/xhtml" data-a-camel-case-result="hello" ' +
            'data-a-camel-case-result2="helloTwo" data-another-result="world" data-a-num="8"></div>',
            'Single element with mixed and nested CamelCase dataset objects'
        );
        test.done();
    },
    'Style element' (test) {
        init(test, 1);
        matchesXMLString(
            jml('style', {id: 'myStyle'}, ['p.test {color:red;}'], $$1('body')),
            '<style xmlns="http://www.w3.org/1999/xhtml" id="myStyle">p.test {color:red;}</style>',
            'Single style element with attribute and text content added to body'
        );
        test.done();
    },
    'Script element' (test) {
        init(test, 1);
        matchesXMLString(
            jml('script', {'class': 'test'}, ['console.log("hello!");'], $$1('body')),
            '<script xmlns="http://www.w3.org/1999/xhtml" class="test">console.log("hello!");</script>',
            'Single script element with attribute and text content (check console for "hello!")'
        );
        test.done();
    },
    'Maps' (test) {
        init(test, 8);
        // Todo: Let `$map` accept an array of map-object arrays (and add tests)
        // Todo: Add tests for array of map strings
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
        ], $$1('body'));
        matches(
            weakMap1.get(el),
            testObj1,
            'Externally retrieve element with Jamilih-returned element associated with normal WeakMap (alongside a JamilihWeakMap); using default map and object'
        );
        matches(
            weakMap1.get($$1('#input1')),
            testObj1,
            'Externally retrieve element with DOM retrieved element associated with normal WeakMap (alongside a JamilihWeakMap); using default map and object'
        );
        matches(
            weakMap2.get($$1('#input2')),
            testObj2,
            'Externally retrieve element with DOM retrieved element associated with JamilihWeakMap (alongside a normal WeakMap); using array-based map and object'
        );
        matches(
            weakMap1.get($$1('#input3')),
            testObj1,
            'Externally retrieve element with DOM retrieved element associated with normal WeakMap (alongside a JamilihWeakMap); using single map defaulting object'
        );
        matches(
            weakMap1.get($$1('#input4')),
            testObj2,
            'Externally retrieve element with DOM retrieved element associated with JamilihWeakMap (alongside a normal WeakMap); using single object defaulting map'
        );
        matches(
            weakMap1.get($$1('#input5')),
            testObj1,
            'Externally retrieve element with DOM retrieved element associated with normal WeakMap (alongside a JamilihWeakMap); using array-based map attachment with empty default map and single object'
        );
        matches(
            weakMap1.get($$1('#input6')),
            testObj1,
            'Externally retrieve element with DOM retrieved element associated with normal WeakMap (alongside a JamilihWeakMap); using single-item array map (defaulting object)'
        );
        matches(
            jml.command($$1('#input7'), weakMap1, 'arg1'),
            'input7 ok arg1',
            'Externally retrieve element with DOM retrieved element associated with normal WeakMap (alongside a JamilihWeakMap); using array-based map and function'
        );
        test.done();
    },
    'Symbol' (test) {
        init(test, 17);
        const privateSym = Symbol('Test symbol');
        jml('div', [
            ['input', {id: 'symInput1', $symbol: ['publicForSym1', function (arg1) {
                matches(
                    this.id + ' ' + arg1,
                    'symInput1 arg1',
                    'Public symbol-attached function with `this` and argument'
                );
            }]}],
            ['div', {id: 'divSymbolTest', $on: {
                click () {
                    // Can supply element or selector to `jml.sym` utility
                    jml.sym(this.previousElementSibling, 'publicForSym1')('arg1');
                    jml.sym($$1('#symInput2'), privateSym)('arg2');
                    jml.sym('#symInput3', privateSym).test('arg3');

                    // Or add symbol directly:
                    this.previousElementSibling[Symbol.for('publicForSym1')]('arg1');
                    $$1('#symInput2')[privateSym]('arg2');
                }
            }}],
            ['input', {id: 'symInput2', $symbol: [privateSym, (arg1) => {
                // No `this` available as using arrow function, but would give element
                matches(
                    arg1,
                    'arg2',
                    'Private symbol-attached arrow function with argument'
                );
            }]}],
            ['input', {id: 'symInput3', $symbol: [privateSym, {
                localValue: 5,
                test (arg1) {
                    matches(
                        this.localValue,
                        5,
                        'Private-symbol attached object method with `this`'
                    );
                    matches(
                        this.elem.id + ' ' + arg1,
                        'symInput3 arg3',
                        'Private-symbol attached object method with `this.elem` and argument'
                    );
                }
            }]}]
        ], $$1('body'));

        $$1('#symInput1')[Symbol.for('publicForSym1')]('arg1');
        jml.sym($$1('#symInput1'), 'publicForSym1')('arg1');
        jml.sym('#symInput1', 'publicForSym1')('arg1');

        $$1('#symInput2')[privateSym]('arg2');

        $$1('#symInput3')[privateSym].test('arg3');
        jml.sym('#symInput3', privateSym).test('arg3');
        $$1('#divSymbolTest').dispatchEvent(new Event('click'));
        jml.command('#symInput1', 'publicForSym1', 'arg1');
        jml.command('#symInput3', privateSym, 'test', 'arg3');

        test.done();
    },
    'Shadow DOM' (test) {
        if (!$$1('body').attachShadow) {
            init(test, 0);
            skip("SKIPPING: ENVIRONMENT DOESN'T SUPPORT attachShadow");
        } else {
            init(test, 2);
            // Todo: Need a more precise check than this
            test.doesNotThrow(function () {
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
                ], $$1('body'));
            }, null, 'Adding Shadow DOM (via `open`/`template`) does not throw');

            test.doesNotThrow(function () {
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
                ], $$1('body'));
            }, null, 'Adding Shadow DOM (via `content`) does not throw');
        }
        test.done();
    },
    'Custom elements' (test) {
        if (!window.customElements) {
            init(test, 0);
            skip("SKIPPING: ENVIRONMENT DOESN'T SUPPORT CUSTOM ELEMENT DEFINITIONS");
        } else {
            init(test, 9);
            const myEl = jml('my-el', {
                id: 'myEl',
                $define: {
                    test () {
                        return this.id;
                    }
                }
            }, $$1('body'));
            matches(
                myEl.test(),
                'myEl',
                'Custom element object method with `this`'
            );

            let constructorSetVar2;
            jml('my-el2', {
                id: 'myEl2',
                $define () {
                    constructorSetVar2 = this.id;
                }
            }, $$1('body'));
            matches(
                constructorSetVar2,
                'myEl2',
                'Custom element with invoked constructor with `this`'
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
            }, $$1('body'));
            matches(
                constructorSetVar3,
                'myEl3',
                'Custom element with class-based invoked constructor with `this`'
            );

            let constructorSetVar4;
            const myel4 = jml('my-el4', {
                id: 'myEl4',
                $define: [function () {
                    constructorSetVar4 = this.id;
                }, {
                    test (arg1) {
                        matches(this.id + arg1, 'myEl4arg1', 'Custom element with array of constructor and object method invoked with `this` and argument');
                    },
                    test2 (arg1) {
                        this.test(arg1);
                    }
                }]
            }, $$1('body'));
            matches(
                constructorSetVar4,
                'myEl4',
                'Custom element with array of constructor and object, with constructor invoked with `this`'
            );
            myel4.test('arg1');
            myel4.test2('arg1');

            let constructorSetVar5;
            const myel5 = jml('my-el5', {
                id: 'myEl5',
                $define: [class extends HTMLElement {
                    constructor () {
                        super();
                        constructorSetVar5 = this.id;
                    }
                }, {
                    test (arg1) {
                        matches(this.id + arg1, 'myEl5arg1', 'Custom element with array of class-based constructor and object method invoked with `this` and argument');
                    },
                    test2 (arg1) {
                        this.test(arg1);
                    }
                }]
            }, $$1('body'));
            matches(
                constructorSetVar5,
                'myEl5',
                'Custom element with array of class-based constructor and object, with constructor invoked with `this`'
            );
            myel5.test('arg1');
            myel5.test2('arg1');
        }

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
        }, $('body'));
        xmlTesting.matches(
            mySelect.test(),
            'mySelect'
        );
        */
        test.done();
    },
    '$custom properties' (test) {
        init(test, 3);
        const mySelect = jml('select', {
            id: 'mySelect',
            $custom: {
                [Symbol.for('testCustom')] (arg1) {
                    return this.test(arg1);
                },
                test (arg1) {
                    return this.id + arg1;
                },
                test2 (arg1) {
                    return this.test(arg1);
                }
            }
        }, $$1('body'));

        matches(
            mySelect.test('Arg1'),
            'mySelectArg1',
            'Invoke `$custom`-attached object with regular method with argument and `this`'
        );
        matches(
            mySelect.test2('Arg1'),
            'mySelectArg1',
            'Invoke `$custom`-attached object with regular method with argument and `this` (calling another regular object method)'
        );
        matches(
            mySelect[Symbol.for('testCustom')]('Arg1'),
            'mySelectArg1',
            'Invoke `$custom`-attached object with symbol-attached method with argument and `this`'
        );
        test.done();
    },
    '$plugins' (test) {
        init(test, 7);
        const options = {$plugins: [
            {
                name: '$_myplugin',
                set ({element, attribute: {name, value}}) {
                    // console.log('vvv', value, '::', element, '::', name);
                    // Add code here to modify the element
                    // element.setAttribute(name, value);
                    if (value.blueAndRed) {
                        element.style.color = 'blue';
                        element.style.backgroundColor = 'red';
                    }
                }
            }
        ]};
        const div = jml(options, 'div', {id: 'myDiv', $_myplugin: {
            blueAndRed: true
        }}, document.body);
        matches(
            div.style.color,
            'blue',
            'Should have text set to a blue color'
        );
        matches(
            div.style.backgroundColor,
            'red',
            'Should have text set to a red background color'
        );
        matches(
            div.nodeName.toLowerCase(),
            'div',
            'Should be a `div` element'
        );
        matches(
            div.id,
            'myDiv',
            'Should allow other non-plugin attributes'
        );
        throws(() => {
            jml({$plugins: [{
                set () {}
            }]}, 'div');
        }, 'Should throw when no `name` ');
        throws(() => {
            jml({$plugins: [{
                name: '$_myplugin'
            }]}, 'div');
        }, 'Should throw when no `set` method');
        throws(() => {
            jml({$plugins: [{
                name: 'myplugin',
                set () {}
            }]}, 'div');
        }, 'Should throw with bad `name`');
        test.done();
    }
};

/* globals jml */
const $$2 = (sel) => { return document.querySelector(sel); };

const testCase$1 = {
    'jml.toJMLString()' (test) {
        test.expect(1);
        const br = document.createElement('br');
        const expected = '["br",{"xmlns":"http://www.w3.org/1999/xhtml"}]';
        const result = jml.toJMLString(br);
        test.deepEqual(expected, result, 'Empty element with no attributes');
        test.done();
    },
    'jml.toHTML()' (test) {
        test.expect(1);
        const expected = '<br>';
        const result = jml.toHTML('br');
        test.deepEqual(expected, result, 'Empty element with no attributes');
        test.done();
    },
    'jml.toXML()' (test) {
        test.expect(1);
        const expected = '<br xmlns="http://www.w3.org/1999/xhtml" />';
        const result = jml.toXML('br');
        test.deepEqual(expected, result, 'Empty element with no attributes');
        test.done();
    },
    'jml.toDOM()' (test) {
        test.expect(1);
        const expected = jml('br');
        const result = jml.toDOM('br');
        test.deepEqual(expected.nodeName, result.nodeName, '`nodeName` equal');
        test.done();
    },
    'jml.toXMLDOMString()' (test) {
        test.expect(1);
        const expected = jml.toXMLDOMString('br');
        const result = jml.toXML('br');
        test.deepEqual(expected, result, 'Empty element with no attributes');
        test.done();
    },
    'jml.toDOMString()' (test) {
        test.expect(1);
        const expected = jml.toDOMString('br');
        const result = jml.toHTML('br');
        test.deepEqual(expected, result, 'Empty element with no attributes');
        test.done();
    },
    'jml.weak()' (test) {
        init(test, 0);

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
                        'internal test localValue 1001',
                        'JamilihWeakMap `invoke` method with arguments and `this`'
                    );
                }
            }}],
            ['div', {id: 'clickArea', $data: {
                localVariable: 8,
                test (el, arg1) {
                    matches(
                        arg1 + ' ' + el.id + this.localVariable,
                        'arg1 clickArea8',
                        'Attached JamilihWeakMap $data method invoked by click listener with arguments and `this`'
                    );
                }
            }, $on: {
                click () {
                    myMap.invoke(this, 'test', 'arg1');
                }
            }}]
        ], $$2('body'));
        matches(
            myMap.invoke(elem, 'myMethod', 'external test'),
            'external test localValue 100',
            'Externally invoke JamilihWeakMap `invoke` method with arguments and `this`'
        );
        matches(
            myMap.get('#mapTest').localVar, // Test overridden `get` accepting selectors also
            'localValue',
            'Externally retrieve JamilihWeakMap-associated element by selector'
        );

        const mapInput = $$2('#mapTest').firstElementChild;
        mapInput.value = '1001';
        mapInput.dispatchEvent(
            new Event('input')
        );
        const mapDiv = $$2('#clickArea');
        mapDiv.dispatchEvent(new Event('click'));
        test.done();
    }
};

/* globals jml */

const testCase$2 = {
    setUp (callback) {
        this.divJamilih = ['div', {'class': 'test', 'xmlns': 'http://www.w3.org/1999/xhtml'}, ['someContent']];
        const html = new DOMParser().parseFromString('<div class="test">someContent</div>', 'text/html');
        this.divDOM = html.documentElement.querySelector('.test');
        callback();
    },
    'element with text content' (test) {
        test.expect(1);
        const expected = this.divJamilih;
        const result = jml.toJML(this.divDOM);
        test.deepEqual(
            expected,
            result,
            'Builds Jamilih array for single element with attribute, namespace declaration, and text content'
        );
        test.done();
    },
    /*
    // Todo: Commenting out until https://github.com/tmpvar/jsdom/issues/1641
    'attribute node' (test) {
        test.expect(2);
        const xlink = ['http://www.w3.org/1999/xlink', 'href', 'http://example.com'];

        let expected = {$attribute: xlink};
        let att = document.createAttributeNS.apply(document, xlink.slice(0, -1));
        att.value = xlink.slice(-1);

        let result = jml.toJML(att);
        test.deepEqual(expected, result, 'Namespaced attribute node to Jamilih');

        xlink[0] = null;
        expected = {$attribute: xlink};
        att = document.createAttribute.apply(document, xlink.slice(1, -1));
        att.value = xlink.slice(-1);

        result = jml.toJML(att);
        test.deepEqual(expected, result, 'Non-namespaced attribute node to Jamilih');

        test.done();
    },
    */
    'text node' (test) {
        test.expect(1);
        const expected = 'text node content';

        const result = jml.toJML(document.createTextNode(expected));
        test.deepEqual(expected, result, 'Text node to Jamilih');
        test.done();
    },
    'CDATA section' (test) {
        const content = 'CDATA <>&\'" content';
        const expected = ['![', content];
        test.expect(1);
        const xml = document.implementation.createDocument('', 'xml', null);
        const result = jml.toJML(xml.createCDATASection(content));
        test.deepEqual(expected, result, 'CDATA to Jamilih');
        test.done();
    },
    /*
    // Currently removed from spec: https://dom.spec.whatwg.org/#dom-core-changes
    'entity reference' (test) {
        test.expect(1);
        const expected = ['&', 'anEntity'];

        const result = jml.toJML(document.createEntityReference('anEntity'));
        test.deepEqual(expected, result);
        test.done();
    },
    */
    'entity' (test) {
        test.expect(1);
        const expected = {$ENTITY: {name: 'copy', childNodes: ['\u00a9']}};

        // xmldom is missing the "doctype" property, and even when we use childNodes, it is missing the "entities" NamedNodeMap (and there is no public DOM method to create entities)
        /*
        const doc = new DOMParser().parseFromString('<!DOCTYPE root [<!ENTITY copy "\u00a9">]><root/>', 'text/xml');
        const result = doc.childNodes[0].entities[0];
        */

        // As per the above, we need to simulate an entity
        const result = jml.toJML({nodeType: 6, nodeName: 'copy', childNodes: [{nodeType: 3, nodeValue: '\u00a9'}]});

        test.deepEqual(expected, result, '(Simulated) entity to Jamilih');
        test.done();
    },
    'processing instruction' (test) {
        test.expect(1);
        const expected = ['?', 'aTarget', 'a processing instruction'];

        const result = jml.toJML(document.createProcessingInstruction('aTarget', 'a processing instruction'));
        test.deepEqual(expected, result, 'Processing instruction to Jamilih');
        test.done();
    },
    'comment' (test) {
        test.expect(1);
        const expected = ['!', 'a comment'];

        const result = jml.toJML(document.createComment('a comment'));
        test.deepEqual(expected, result, 'Comment to Jamilih');
        test.done();
    },
    'document' (test) {
        test.expect(1);
        const expected = {$document: {childNodes: [{$DOCTYPE: {name: 'html'}}, ['html', {xmlns: 'http://www.w3.org/1999/xhtml'}, [['head', [['title', ['a title']]]], ['body']]]]}};
        const doc = document.implementation.createHTMLDocument('a title');
        const result = jml.toJML(doc);
        test.deepEqual(expected, result, 'Document node to Jamilih');
        test.done();
    },
    'document type' (test) {
        test.expect(1);
        const expected = {$DOCTYPE: {name: 'a-prefix:a-name', publicId: 'a-pub-id', systemId: 'a-sys-id'}};

        const result = jml.toJML(document.implementation.createDocumentType('a-prefix:a-name', 'a-pub-id', 'a-sys-id'));
        test.deepEqual(expected, result, 'Document type node to Jamilih');
        test.done();
    },
    'document fragment' (test) {
        test.expect(1);
        const expected = {'#': [this.divJamilih]};
        const frag = document.createDocumentFragment();
        frag.appendChild(this.divDOM.cloneNode(true));
        const result = jml.toJML(frag);
        test.deepEqual(expected, result, 'Document fragment node to Jamilih');
        test.done();
    }
};

/* eslint-env node */

global.window = jml$1.getWindow();
global.Event = window.Event;
global.DOMParser = window.DOMParser;
global.Node = window.Node;
global.document = jml$1.getDocument();
global.XMLSerializer = jml$1.getXMLSerializer();
global.jml = jml$1;

// Todo:
// This has problems as a regular `import` even when compiling
//   with node-globals plugin (a `this` context issue which
//   I could not seem to fix); if we could fix this, then our
//   item above could be removed
require('nodeunit').reporters.default.run({
    jmlTests: testCase,
    otherMethodsTests: testCase$1,
    toJMLTests: testCase$2
});
