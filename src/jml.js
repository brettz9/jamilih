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

/* istanbul ignore next */
let win = typeof window !== 'undefined' && window;
/* istanbul ignore next */
let doc = typeof document !== 'undefined' && document;
/* istanbul ignore next */
let XmlSerializer = typeof XMLSerializer !== 'undefined' && XMLSerializer;

// STATIC PROPERTIES

const possibleOptions = [
  '$plugins',
  // '$mode', // Todo (SVG/XML)
  // 'state', // Used internally
  '$map' // Add any other options here
];

const NS_HTML = 'http://www.w3.org/1999/xhtml',
  hyphenForCamelCase = /-([a-z])/gu;

const ATTR_MAP = {
  readonly: 'readOnly'
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

// From JsonML
const ATTR_DOM = BOOL_ATTS.concat([
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
const $$ = (sel) => [...doc.querySelectorAll(sel)];

/**
* Retrieve the (lower-cased) HTML name of a node.
* @static
* @param {Node} node The HTML node
* @returns {string} The lower-cased node name
*/
function _getHTMLNodeName (node) {
  return node.nodeName && node.nodeName.toLowerCase();
}

/**
* Apply styles if this is a style tag.
* @static
* @param {Node} node The element to check whether it is a style tag
* @returns {void}
*/
function _applyAnyStylesheet (node) {
  // Only used in IE
  /* istanbul ignore else */
  if (!doc.createStyleSheet) {
    return;
  }
  /* istanbul ignore next */
  if (_getHTMLNodeName(node) === 'style') { // IE
    const ss = doc.createStyleSheet(); // Create a stylesheet to actually do something useful
    ss.cssText = node.cssText;
    // We continue to add the style tag, however
  }
}

/**
 * Need this function for IE since options weren't otherwise getting added.
 * @private
 * @static
 * @param {Element} parent The parent to which to append the element
 * @param {Node} child The element or other node to append to the parent
 * @returns {void}
 */
function _appendNode (parent, child) {
  const parentName = _getHTMLNodeName(parent);
  const childName = _getHTMLNodeName(child);

  // IE only
  /* istanbul ignore if */
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
    parent.content.append(child);
    return;
  }
  try {
    parent.append(child); // IE9 is now ok with this
  } catch (e) {
    /* istanbul ignore next */
    if (parentName === 'select' && childName === 'option') {
      try { // Since this is now DOM Level 4 standard behavior (and what IE7+ can handle), we try it first
        parent.add(child);
      } catch (err) { // DOM Level 2 did require a second argument, so we try it too just in case the user is using an older version of Firefox, etc.
        parent.add(child, null); // IE7 has a problem with this, but IE8+ is ok
      }
      return;
    }
    /* istanbul ignore next */
    throw e;
  }
}

/**
 * Attach event in a cross-browser fashion.
 * @static
 * @param {Element} el DOM element to which to attach the event
 * @param {string} type The DOM event (without 'on') to attach to the element
 * @param {EventListener} handler The event handler to attach to the element
 * @param {boolean} [capturing] Whether or not the event should be
 *   capturing (W3C-browsers only); default is false; NOT IN USE
 * @returns {void}
 */
function _addEvent (el, type, handler, capturing) {
  el.addEventListener(type, handler, Boolean(capturing));
}

/**
* Creates a text node of the result of resolving an entity or character reference.
* @param {'entity'|'decimal'|'hexadecimal'} type Type of reference
* @param {string} prefix Text to prefix immediately after the "&"
* @param {string} arg The body of the reference
* @returns {Text} The text node of the resolved reference
*/
function _createSafeReference (type, prefix, arg) {
  // For security reasons related to innerHTML, we ensure this string only
  //  contains potential entity characters
  if (!arg.match(/^\w+$/u)) {
    throw new TypeError('Bad ' + type);
  }
  const elContainer = doc.createElement('div');
  // Todo: No workaround for XML?
  // eslint-disable-next-line no-unsanitized/property
  elContainer.innerHTML = '&' + prefix + arg + ';';
  return doc.createTextNode(elContainer.innerHTML);
}

/**
* @param {string} n0 Whole expression match (including "-")
* @param {string} n1 Lower-case letter match
* @returns {string} Uppercased letter
*/
function _upperCase (n0, n1) {
  return n1.toUpperCase();
}

// Todo: Make as public utility
/**
 * @param {any} o
 * @returns {boolean}
 */
function _isNullish (o) {
  return o === null || o === undefined;
}

// Todo: Make as public utility, but also return types for undefined, boolean, number, document, etc.
/**
* @private
* @static
* @param {string|JamilihAttributes|JamilihArray|Element|DocumentFragment} item
* @returns {"string"|"null"|"array"|"element"|"fragment"|"object"}
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
* @param {DocumentFragment} frag
* @param {Node} node
* @returns {DocumentFragment}
*/
function _fragReducer (frag, node) {
  frag.append(node);
  return frag;
}

/**
* @private
* @static
* @param {Object<{string:string}>} xmlnsObj
* @returns {string}
*/
function _replaceDefiner (xmlnsObj) {
  return function (n0) {
    let retStr = xmlnsObj[''] ? ' xmlns="' + xmlnsObj[''] + '"' : (n0 || ''); // Preserve XHTML
    for (const ns in xmlnsObj) {
      if ({}.hasOwnProperty.call(xmlnsObj, ns)) {
        if (ns !== '') {
          retStr += ' xmlns:' + ns + '="' + xmlnsObj[ns] + '"';
        }
      }
    }
    return retStr;
  };
}

/**
 *
 * @param {JamilihArray} args
 * @returns {Element}
 */
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
* @param {string} arg
* @returns {Element}
*/
function _jmlSingleArg (arg) {
  return jml(arg);
}

/**
* @typedef {JamilihAttributes} AttributeArray
* @property {string} 0 The key
* @property {string} 1 The value
*/

/**
* @private
* @static
* @todo Deprecate as now there is predictable iteration order?
* @param {AttributeArray} attArr
* @returns {PlainObject}
*/
function _copyOrderedAtts (attArr) {
  const obj = {};
  // Todo: Fix if allow prefixed attributes
  obj[attArr[0]] = attArr[1]; // array of ordered attribute-value arrays
  return obj;
}

/**
* @callback ChildrenToJMLCallback
* @param {JamilihArray|Jamilih} childNodeJML
* @param {Integer} i
* @returns {void}
*/

/**
* @private
* @static
* @param {Node} node
* @returns {ChildrenToJMLCallback}
*/
function _childrenToJML (node) {
  return function (childNodeJML, i) {
    const cn = node.childNodes[i];
    const j = Array.isArray(childNodeJML) ? jml(...childNodeJML) : jml(childNodeJML);
    cn.parentNode.replaceChild(j, cn);
  };
}

/**
* @callback JamilihAppender
* @param {JamilihArray} childJML
* @returns {void}
*/

/**
* @private
* @static
* @param {Node} node
* @returns {JamilihAppender}
*/
function _appendJML (node) {
  return function (childJML) {
    node.append(jml(...childJML));
  };
}

/**
* @callback appender
* @param {string|JamilihArray} childJML
* @returns {void}
*/

/**
* @private
* @static
* @param {Node} node
* @returns {appender}
*/
function _appendJMLOrText (node) {
  return function (childJML) {
    if (typeof childJML === 'string') {
      node.append(childJML);
    } else {
      node.append(jml(...childJML));
    }
  };
}

/**
* @private
* @static
*/
/*
function _DOMfromJMLOrString (childNodeJML) {
  if (typeof childNodeJML === 'string') {
    return doc.createTextNode(childNodeJML);
  }
  return jml(...childNodeJML);
}
*/

/**
* @typedef {Element|DocumentFragment} JamilihReturn
*/

/**
* @typedef {PlainObject<string, string>} JamilihAttributes
*/

/**
* @typedef {GenericArray} JamilihArray
* @property {string} 0 The element to create (by lower-case name)
* @property {JamilihAttributes} [1] Attributes to add with the key as the
*   attribute name and value as the attribute value; important for IE where
*   the input element's type cannot be added later after already added to the page
* @param {Element[]} [children] The optional children of this element
*   (but raw DOM elements required to be specified within arrays since
*   could not otherwise be distinguished from siblings being added)
* @param {Element} [parent] The optional parent to which to attach the element
*   (always the last unless followed by null, in which case it is the
*   second-to-last)
* @param {null} [returning] Can use null to indicate an array of elements
*   should be returned
*/

/**
 * Creates an XHTML or HTML element (XHTML is preferred, but only in browsers
 * that support); any element after element can be omitted, and any subsequent
 * type or types added afterwards.
 * @param {JamilihArray} args
 * @returns {JamilihReturn} The newly created (and possibly already appended)
 *   element or array of elements
 */
const jml = function jml (...args) {
  let elem = doc.createDocumentFragment();
  /**
   *
   * @param {Object<{string: string}>} atts
   * @returns {void}
   */
  function _checkAtts (atts) {
    let att;
    for (att in atts) {
      if (!{}.hasOwnProperty.call(atts, att)) {
        continue;
      }
      const attVal = atts[att];
      att = att in ATTR_MAP ? ATTR_MAP[att] : att;
      if (NULLABLES.includes(att)) {
        if (!_isNullish(attVal)) {
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
        const getConstructor = (cnstrct) => {
          const baseClass = options && options.extends
            ? doc.createElement(options.extends).constructor
            : customizedBuiltIn
              ? doc.createElement(localName).constructor
              : HTMLElement;
          return cnstrct
            ? class extends baseClass {
              constructor () {
                super();
                cnstrct.call(this);
              }
            }
            : class extends baseClass {};
        };

        let cnstrctr, options, prototype;
        if (Array.isArray(attVal)) {
          if (attVal.length <= 2) {
            [cnstrctr, options] = attVal;
            if (typeof options === 'string') {
              options = {extends: options};
            } else if (!{}.hasOwnProperty.call(options, 'extends')) {
              prototype = options;
            }
            if (typeof cnstrctr === 'object') {
              prototype = cnstrctr;
              cnstrctr = getConstructor();
            }
          } else {
            [cnstrctr, prototype, options] = attVal;
            if (typeof options === 'string') {
              options = {extends: options};
            }
          }
        } else if (typeof attVal === 'function') {
          cnstrctr = attVal;
        } else {
          prototype = attVal;
          cnstrctr = getConstructor();
        }
        if (!cnstrctr.toString().startsWith('class')) {
          cnstrctr = getConstructor(cnstrctr);
        }
        if (!options && customizedBuiltIn) {
          options = {extends: localName};
        }
        if (prototype) {
          Object.assign(cnstrctr.prototype, prototype);
        }
        customElements.define(def, cnstrctr, customizedBuiltIn ? options : undefined);
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
      } case '$data': {
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
        // Todo: Conditionally create XML document
        const node = doc.implementation.createHTMLDocument();
        if (attVal.childNodes) {
          // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
          attVal.childNodes.forEach(_childrenToJML(node));
          // Remove any extra nodes created by createHTMLDocument().
          let j = attVal.childNodes.length;
          while (node.childNodes[j]) {
            const cn = node.childNodes[j];
            cn.remove();
            j++;
          }
        } else {
          if (attVal.$DOCTYPE) {
            const dt = {$DOCTYPE: attVal.$DOCTYPE};
            const doctype = jml(dt);
            node.firstChild.replaceWith(doctype);
          }
          const html = node.childNodes[1];
          const head = html.childNodes[0];
          const body = html.childNodes[1];
          if (attVal.title || attVal.head) {
            const meta = doc.createElement('meta');
            meta.setAttribute('charset', 'utf-8');
            head.append(meta);
          }
          if (attVal.title) {
            node.title = attVal.title; // Appends after meta
          }
          if (attVal.head) {
            // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
            attVal.head.forEach(_appendJML(head));
          }
          if (attVal.body) {
            // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
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
            // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
            entities: attVal.entities.map(_jmlSingleArg),
            // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
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
          if ({}.hasOwnProperty.call(attVal, p2)) {
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
        if (!_isNullish(attVal)) {
          elem.className = attVal;
        }
        break;
      case 'dataset': {
        // Map can be keyed with hyphenated or camel-cased properties
        const recurse = (atVal, startProp) => {
          let prop = '';
          const pastInitialProp = startProp !== '';
          Object.keys(atVal).forEach((key) => {
            const value = atVal[key];
            if (pastInitialProp) {
              prop = startProp + key.replace(hyphenForCamelCase, _upperCase).replace(/^([a-z])/u, _upperCase);
            } else {
              prop = startProp + key.replace(hyphenForCamelCase, _upperCase);
            }
            if (value === null || typeof value !== 'object') {
              if (!_isNullish(value)) {
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
        if (!_isNullish(attVal)) {
          // eslint-disable-next-line no-unsanitized/property
          elem.innerHTML = attVal;
        }
        break;
        // #endif
      case 'htmlFor': case 'for':
        if (elStr === 'label') {
          if (!_isNullish(attVal)) {
            elem.htmlFor = attVal;
          }
          break;
        }
        elem.setAttribute(att, attVal);
        break;
      case 'xmlns':
        // Already handled
        break;
      default: {
        if (att.startsWith('on')) {
          elem[att] = attVal;
          // _addEvent(elem, att.slice(2), attVal, false); // This worked, but perhaps the user wishes only one event
          break;
        }
        if (att === 'style') {
          if (_isNullish(attVal)) {
            break;
          }
          if (typeof attVal === 'object') {
            for (const p2 in attVal) {
              if ({}.hasOwnProperty.call(attVal, p2) && !_isNullish(attVal[p2])) {
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
        throw new TypeError('$plugins must be an array');
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
    } else if ((/^\[object (?:Weak)?Map\]$/u).test([].toString.call(dataVal))) {
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
    default:
      // Todo: Throw here instead?
      break;
    case 'null': // null always indicates a place-holder (only needed for last argument if want array returned)
      if (i === argc - 1) {
        _applyAnyStylesheet(nodes[0]); // We have to execute any stylesheets even if not appending or otherwise IE will never apply them
        // Todo: Fix to allow application of stylesheets of style tags within fragments?
        return nodes.length <= 1
          ? nodes[0]
        // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
          : nodes.reduce(_fragReducer, doc.createDocumentFragment()); // nodes;
      }
      break;
    case 'string': // Strings indicate elements
      switch (arg) {
      case '!':
        nodes[nodes.length] = doc.createComment(args[++i]);
        break;
      case '?': {
        arg = args[++i];
        let procValue = args[++i];
        const val = procValue;
        if (typeof val === 'object') {
          procValue = [];
          for (const p in val) {
            if ({}.hasOwnProperty.call(val, p)) {
              procValue.push(
                p + '=' + '"' +
                // https://www.w3.org/TR/xml-stylesheet/#NT-PseudoAttValue
                val[p].replace(/"/gu, '&quot;') +
                '"'
              );
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
      } case '&':
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
        } else if (doc.createElementNS) {
          elem = doc.createElementNS(NS_HTML, elStr);
        } else {
          elem = doc.createElement(elStr);
        }
        nodes[nodes.length] = elem; // Add to parent
        break;
      }
      }
      break;
    case 'object': { // Non-DOM-element objects indicate attribute-value pairs
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
      // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
      const orderedArr = atts.$a ? atts.$a.map(_copyOrderedAtts) : [atts];
      // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
      orderedArr.forEach(_checkAtts);
      break;
    } case 'fragment':
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
    case 'array': { // Arrays or arrays of arrays indicate child nodes
      const child = arg;
      const cl = child.length;
      for (let j = 0; j < cl; j++) { // Go through children array container to handle elements
        const childContent = child[j];
        const childContentType = typeof childContent;
        if (childContent === undefined) {
          throw new Error('Parent array:' + JSON.stringify(args) + '; child: ' + child + '; index:' + j);
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
  }
  const ret = nodes[0] || elem;
  if (opts && isRoot && opts.$map && opts.$map.root) {
    setMap(true);
  }
  return ret;
};

/**
* Converts a DOM object or a string of HTML into a Jamilih object (or string).
* @param {string|HTMLElement} [dom=document.documentElement] Defaults to converting the current document.
* @param {PlainObject} [config] Configuration object
* @param {boolean} [config.stringOutput=false] Whether to output the Jamilih object as a string.
* @returns {JamilihArray|string} Array containing the elements which represent
* a Jamilih object, or, if `stringOutput` is true, it will be the stringified
* version of such an object
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

  /**
   *
   * @throws {DOMException}
   * @returns {void}
   */
  function invalidStateError () { // These are probably only necessary if working with text/html
    // eslint-disable-next-line no-shadow
    class DOMException {}
    if (prohibitHTMLOnly) {
      // INVALID_STATE_ERR per section 9.3 XHTML 5: http://www.w3.org/TR/html5/the-xhtml-syntax.html
      // Since we can't instantiate without this (at least in Mozilla), this mimicks at least (good idea?)
      const e = new DOMException();
      e.code = 11;
      throw e;
    }
  }

  /**
   *
   * @param {DocumentType|Entity|Notation} obj
   * @param {Node} node
   * @returns {void}
   */
  function addExternalID (obj, node) {
    if (node.systemId.includes('"') && node.systemId.includes("'")) {
      invalidStateError();
    }
    const {publicId, systemId} = node;
    if (systemId) {
      obj.systemId = systemId;
    }
    if (publicId) {
      obj.publicId = publicId;
    }
  }

  /**
   *
   * @param {any} val
   * @returns {void}
   */
  function set (val) {
    parent[parentIdx] = val;
    parentIdx++;
  }

  /**
   * @returns {void}
   */
  function setChildren () {
    set([]);
    parent = parent[parentIdx - 1];
    parentIdx = 0;
  }

  /**
   *
   * @param {string} prop1
   * @param {string} prop2
   * @returns {void}
   */
  function setObj (prop1, prop2) {
    parent = parent[parentIdx - 1][prop1];
    parentIdx = 0;
    if (prop2) {
      parent = parent[prop2];
    }
  }

  /**
   *
   * @param {Node} node
   * @param {object<{string: string}>} namespaces
   * @returns {void}
   */
  function parseDOM (node, namespaces) {
    // namespaces = clone(namespaces) || {}; // Ensure we're working with a copy, so different levels in the hierarchy can treat it differently

    /*
    if ((node.prefix && node.prefix.includes(':')) || (node.localName && node.localName.includes(':'))) {
      invalidStateError();
    }
    */

    const type = 'nodeType' in node ? node.nodeType : null;
    namespaces = {...namespaces};

    const xmlChars = /([\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD]|[\uD800-\uDBFF][\uDC00-\uDFFF])*$/u; // eslint-disable-line no-control-regex
    if ([2, 3, 4, 7, 8].includes(type) && !xmlChars.test(node.nodeValue)) {
      invalidStateError();
    }

    let children, start, tmpParent, tmpParentIdx;

    /**
     * @returns {void}
     */
    function setTemp () {
      tmpParent = parent;
      tmpParentIdx = parentIdx;
    }
    /**
     * @returns {void}
     */
    function resetTemp () {
      parent = tmpParent;
      parentIdx = tmpParentIdx;
      parentIdx++; // Increment index in parent container of this element
    }
    switch (type) {
    case 1: { // ELEMENT
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
        set([...node.attributes].reduce(function (obj, att) {
          obj[att.name] = att.value; // Attr.nodeName and Attr.nodeValue are deprecated as of DOM4 as Attr no longer inherits from Node, so we can safely use name and value
          return obj;
        }, start));
      } else if (hasNamespaceDeclaration) {
        set(start);
      }

      children = node.childNodes;
      if (children.length) {
        setChildren(); // Element children array container
        [...children].forEach(function (childNode) {
          parseDOM(childNode, namespaces);
        });
      }
      resetTemp();
      break;
    } case undefined: // Treat as attribute node until this is fixed: https://github.com/jsdom/jsdom/issues/1641 / https://github.com/jsdom/jsdom/pull/1822
    case 2: // ATTRIBUTE (should only get here if passing in an attribute node)
      set({$attribute: [node.namespaceURI, node.name, node.value]});
      break;
    case 3: // TEXT
      if (config.stripWhitespace && (/^\s+$/u).test(node.nodeValue)) {
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

        [...children].forEach(function (childNode) {
          parseDOM(childNode, namespaces);
        });
      }
      resetTemp();
      break;
    case 7: // PROCESSING INSTRUCTION
      if ((/^xml$/iu).test(node.target)) {
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
    case 9: { // DOCUMENT
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

      [...children].forEach(function (childNode) { // Can't just do documentElement as there may be doctype, comments, etc.
        // No need for setChildren, as we have already built the container array
        parseDOM(childNode, namespaces);
      });
      resetTemp();
      break;
    } case 10: { // DOCUMENT TYPE
      setTemp();

      // Can create directly by doc.implementation.createDocumentType
      start = {$DOCTYPE: {name: node.name}};
      if (node.internalSubset) {
        start.internalSubset = node.internalSubset;
      }
      const pubIdChar = /^(\u0020|\u000D|\u000A|[a-zA-Z0-9]|[-'()+,./:=?;!*#@$_%])*$/u; // eslint-disable-line no-control-regex
      if (!pubIdChar.test(node.publicId)) {
        invalidStateError();
      }
      addExternalID(start.$DOCTYPE, node);
      // Fit in internal subset along with entities?: probably don't need as these would only differ if from DTD, and we're not rebuilding the DTD
      set(start); // Auto-generate the internalSubset instead? Avoid entities/notations in favor of array to preserve order?

      resetTemp();
      break;
    } case 11: // DOCUMENT FRAGMENT
      setTemp();

      set({'#': []});

      // Set position to fragment's array children
      setObj('#');

      children = node.childNodes;
      [...children].forEach(function (childNode) {
        // No need for setChildren, as we have already built the container array
        parseDOM(childNode, namespaces);
      });

      resetTemp();
      break;
    case 12: // NOTATION
      start = {$NOTATION: {name: node.nodeName}};
      addExternalID(start.$NOTATION, node);
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

/**
 *
 * @param {JamilihArray} args
 * @returns {JamilihReturn}
 */
jml.toDOM = function (...args) { // Alias for jml()
  return jml(...args);
};

/**
 *
 * @param {JamilihArray} args
 * @returns {string}
 */
jml.toHTML = function (...args) { // Todo: Replace this with version of jml() that directly builds a string
  const ret = jml(...args);
  // Todo: deal with serialization of properties like 'selected', 'checked', 'value', 'defaultValue', 'for', 'dataset', 'on*', 'style'! (i.e., need to build a string ourselves)
  return ret.outerHTML;
};

/**
 *
 * @param {JamilihArray} args
 * @returns {string}
 */
jml.toDOMString = function (...args) { // Alias for jml.toHTML for parity with jml.toJMLString
  return jml.toHTML(...args);
};

/**
 *
 * @param {JamilihArray} args
 * @returns {string}
 */
jml.toXML = function (...args) {
  const ret = jml(...args);
  return new XmlSerializer().serializeToString(ret);
};

/**
 *
 * @param {JamilihArray} args
 * @returns {string}
 */
jml.toXMLDOMString = function (...args) { // Alias for jml.toXML for parity with jml.toJMLString
  return jml.toXML(...args);
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
  elem = typeof elem === 'string' ? $(elem) : elem;
  return elem[typeof sym === 'symbol' ? sym : Symbol.for(sym)];
};

jml.command = function (elem, symOrMap, methodName, ...args) {
  elem = typeof elem === 'string' ? $(elem) : elem;
  let func;
  if (['symbol', 'string'].includes(typeof symOrMap)) {
    func = jml.sym(elem, symOrMap);
    if (typeof func === 'function') {
      return func(methodName, ...args); // Already has `this` bound to `elem`
    }
    return func[methodName](...args);
  }
  func = symOrMap.get(elem);
  if (typeof func === 'function') {
    return func.call(elem, methodName, ...args);
  }
  return func[methodName](elem, ...args);
  // return func[methodName].call(elem, ...args);
};

jml.setWindow = (wind) => {
  win = wind;
};
jml.setDocument = (docum) => {
  doc = docum;
  if (docum && docum.body) {
    ({body} = docum);
  }
};
jml.setXMLSerializer = (xmls) => {
  XmlSerializer = xmls;
};

jml.getWindow = () => {
  return win;
};
jml.getDocument = () => {
  return doc;
};
jml.getXMLSerializer = () => {
  return XmlSerializer;
};

/**
 * Does not run Jamilih so can be further processed.
 * @param {JamilihArray} jmlArray
 * @param {string|JamilihArray|Element} glu
 * @returns {Element}
 */
function glue (jmlArray, glu) {
  return [...jmlArray].reduce((arr, item) => {
    arr.push(item, glu);
    return arr;
  }, []).slice(0, -1);
}

/* istanbulu ignore next */
let body = doc && doc.body; // eslint-disable-line import/no-mutable-exports

const nbsp = '\u00A0'; // Very commonly needed in templates

export {jml, $, $$, nbsp, body, glue};

export default jml;
