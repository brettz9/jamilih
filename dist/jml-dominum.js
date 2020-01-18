'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);

      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(receiver);
      }

      return desc.value;
    };
  }

  return _get(target, property, receiver || target);
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
    return;
  }

  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

// eslint-disable-next-line unicorn/custom-error-definition
class DOMException extends Error {
  constructor(message, name) {
    super(message); // eslint-disable-next-line unicorn/custom-error-definition

    this.name = name;
  }

}
/**
 * @license MIT
 * @author Sam Sneddon, Filip Dupanović, Brett Zamir
 * @copyright © 2016 Sam Sneddon, Filip Dupanović, © 2020 Brett Zamir
 */


let allowWrite;
/**
 * @param {boolean} isAllowed
 * @returns {boolean} Last value of `allowWrite`
 */

function setWritingPermission(isAllowed) {
  const lastValue = allowWrite;
  allowWrite = isAllowed;
  return lastValue;
}
/**
 * @see https://tc39.es/ecma262/#_ref_3065
 * @param {string} p
 * @returns {boolean}
 */


function isArrayIndex(p) {
  // https://tc39.es/ecma262/#_ref_3065
  // "A String property name P is an array index if and only if
  //   ToString(ToUint32(P)) is equal to P and ToUint32(P) is not
  //   equal to 2^32 - 1."
  // ToUint32
  // eslint-disable-next-line no-bitwise
  const uint = p >>> 0; // ToString
  // eslint-disable-next-line no-implicit-coercion

  const s = uint + '';
  return p === s && uint !== 0xFFFFFFFF;
}
/**
 * @param {GenericObject} target
 * @param {boolean} writable
 * @returns {Proxy<any>}
 */


function arrayExoticObject(target, writable) {
  Object.defineProperties(target, {
    length: {
      value: 0,
      writable: true
    },
    [Symbol.iterator]: {
      value() {
        let index = 0;
        return {
          next() {
            return {
              value: target[index++],
              done: index > target.length
            };
          }

        };
      }

    }
  });
  return new Proxy(target, {
    deleteProperty(target, property) {
      if (isArrayIndex(property)) {
        const succeeded = Reflect.deleteProperty(target, property); // Not sure how to simulate (if possible)

        /* istanbul ignore next */

        if (!succeeded) {
          return false;
        } // Todo: Examine spec to ensure following closely here
        // eslint-disable-next-line no-bitwise


        const index = property >>> 0;

        for (let i = index + 1; i < target.length; i++) {
          target[i - 1] = target[i];
          delete target[i];
        }

        return Reflect.set(target, 'length', target.length - 1);
      }

      return Reflect.deleteProperty(target, property);
    },

    set(target, property, value, receiver) {
      // https://tc39.es/ecma262/#sec-array-exotic-objects-defineownproperty-p-desc
      if (property === 'length') {
        // https://tc39.es/ecma262/#sec-arraysetlength
        // 3. ToUint32
        // eslint-disable-next-line no-bitwise
        const newLen = value >>> 0; // 4. ToNumber as through `+`: https://tc39.es/ecma262/#sec-unary-plus-operator-runtime-semantics-evaluation
        // eslint-disable-next-line no-implicit-coercion

        const numberLen = +value;

        if (newLen !== numberLen) {
          // 5.
          throw RangeError('Unexpected length');
        } // 7-9


        const oldLen = target.length; // 10.

        if (newLen >= oldLen) {
          // 10.a.
          return Reflect.set(target, 'length', newLen);
        } // 14.


        const succeeded = Reflect.set(target, 'length', newLen);

        if (!succeeded) {
          // 15.
          return false;
        } // 16.

        /* istanbul ignore if */


        if (Object.keys(target).filter(key => {
          return isArrayIndex(key) && parseInt(key) >= newLen;
        }).map(key => {
          return parseInt(key);
        }).sort((a, b) => {
          // Reverse numerical
          // `Object.keys` seems to predictably order, so first
          //   condition seems not reachable, nor last

          /* istanbul ignore next  */
          return a > b ? -1 : a < b ? 1 : 0;
        }).some(p => {
          // 16.a.
          const deleteSucceeded = Reflect.deleteProperty(target, p); // 16.b.
          // Can't seem to simulate a failure, and `deleteProperty` seems
          //  not internally triggered here, including with `delete`

          /* istanbul ignore next */

          if (!deleteSucceeded) {
            // 16.b.i., 16.b.iii
            // eslint-disable-next-line no-bitwise
            Reflect.set(target, 'length', p >>> 0 + 1);
            return true;
          }

          return false;
        })) {
          // 16.b.iv.

          /* istanbul ignore next */
          return false;
        } // 18.


        return true;
      } else if (isArrayIndex(property)) {
        // a. (b. is an assert)
        const oldLenDesc = Reflect.getOwnPropertyDescriptor(target, 'length'); // c.

        const oldLen = oldLenDesc.value; // d. (ToUint32)
        // eslint-disable-next-line no-bitwise

        const index = property >>> 0; // e.

        if (index >= oldLen && !allowWrite && writable === false) {
          return false;
        } // f.


        const succeeded = Reflect.set(target, property, value); // g.
        // How to simulate failure (if possible)?

        /* istanbul ignore next */

        if (!succeeded) {
          return false;
        } // h.


        if (index >= oldLen) {
          // h.i. and h.ii.
          Reflect.set(target, 'length', index + 1);
        } // i.


        return true;
      } // https://tc39.es/ecma262/#sec-ordinarydefineownproperty


      target[property] = value;
      return true;
    }

  });
}
/**
 * This class is of the "live" `NodeList` variety (unlike say the `NodeList`
 * given by `document.querySelectorAll`), meaning its `length` is dynamic
 * as items are added to the list.
 */


class NodeList {
  constructor() {
    // eslint-disable-next-line no-constructor-return
    return arrayExoticObject(this, false);
  }

}

class Node {
  constructor() {
    this.parentNode = null;
    this.childNodes = new NodeList();
  }

  appendChild(arg) {
    const lastValue = setWritingPermission(true);
    this.childNodes[this.childNodes.length] = arg;
    setWritingPermission(lastValue);
    arg.parentNode = this;
  }

  removeChild(child) {
    // Could replace with `some` if `NodeList` ever adds
    for (let i = 0; i < this.childNodes.length; i++) {
      if (this.childNodes[i] === child) {
        // splice one (our Proxy's `deleteProperty` to handle the rest)
        const removed = this.childNodes[i];
        delete this.childNodes[i];
        return removed;
      }
    }

    throw new DOMException('Node was not found', 'NotFoundError');
  }

}

const ChildNode = {
  remove() {
    if (!this.parentNode) {
      return;
    } // eslint-disable-next-line unicorn/prefer-node-remove


    this.parentNode.removeChild(this);
  }

};

class CharacterData extends Node {
  constructor(data, parentNode) {
    super();
    this.data = data;
    this.parentNode = parentNode || null;
    Object.assign(this, ChildNode);
  }

}

class Text extends CharacterData {
  constructor(data, parentNode) {
    super(data, parentNode);
    this.nodeName = '#text'; // Not needed w3c-xmlserializer
  }

}

Text.prototype.nodeType = 3;
const ParentNode = {
  append(...args) {
    args.forEach(arg => {
      if (typeof arg === 'string') {
        arg = new Text(arg, this);
      } // eslint-disable-next-line unicorn/prefer-node-append


      this.appendChild(arg);
    });
  }
  /*
  prepend () {
    // Todo (though not as critical for building)
  }
  */


};

class Attr extends Node {
  constructor(qualifiedNameStr, ownerElement, ns) {
    super();
    const hasPrefix = qualifiedNameStr.includes(':');
    const [prefix, localName] = ns !== undefined && hasPrefix ? qualifiedNameStr.split(':') : [null, qualifiedNameStr]; // Note: If `ns` is `null` (as with `createAttributeNS`), does not
    //   get lower-cased.
    // Though these properties are not needed when w3c-xmlserializer directly
    //  serializes Attr, they are needed when part of `Element.attributes`,
    //  so we ensure constructor can build minimal data (could add on methods
    //  that manipulate `attributes`, but other `Attr` creators can use anyways)

    const name = ns === undefined && !hasPrefix ? qualifiedNameStr.toLowerCase() : qualifiedNameStr;
    this.value = '';
    this.prefix = prefix || null;
    this.namespaceURI = ns !== undefined ? ns : null;
    this.localName = ns === undefined && !hasPrefix ? localName.toLowerCase() : localName; // `name` and `nodeName` are not needed by w3c-xmlserializer, but
    //   unobtrusive and basic enough to add

    this.name = name;
    this.nodeName = name; // Not needed for w3c-serializer, but needed for
    //  `document.evaluate`-retrieved `Attr`

    this.ownerElement = ownerElement || null;
  }

}

Attr.prototype.nodeType = 2; // Todo: Add `setNamedItem`, `getNamedItem`, `removeNamedItem` way

/**
 * This class is "live", meaning its `length` is dynamic
 * as items are added to the list.
 */

class NamedNodeMap {
  constructor() {
    // eslint-disable-next-line no-constructor-return
    return arrayExoticObject(this, false);
  }

}

class Element extends Node {
  constructor(qualifiedNameStr, ns, ownerDocument) {
    super();
    const [prefix, name] = qualifiedNameStr.includes(':') ? qualifiedNameStr.split(':') : [null, qualifiedNameStr];
    this.attributes = new NamedNodeMap();
    this.namespaceURI = ns !== undefined ? ns : null;
    this.prefix = prefix;
    this.localName = name; // `tagName` and `nodeName` are not needed by w3c-xmlserializer, but
    //   unobtrusive and basic enough to add

    this.tagName = name;
    this.nodeName = name; // Todo: Other Nodes should have also

    this.ownerDocument = ownerDocument;
    Object.assign(this, ParentNode, ChildNode);
  }

  setAttribute(name, value) {
    for (const att of this.attributes) {
      if (att.name === name) {
        att.value = value;
        return;
      }
    }

    const attr = new Attr(name, this);
    attr.value = value;
    const lastValue = setWritingPermission(true);
    this.attributes[this.attributes.length] = attr;
    setWritingPermission(lastValue);
  } // Note: Won't use given prefix if already existing with a different
  //  namespace


  setAttributeNS(ns, qualifiedName, value) {
    for (const att of this.attributes) {
      const [prefix, name] = qualifiedName.includes(':') ? qualifiedName.split(':') : [null, qualifiedName];

      if (att.localName === name && att.namespaceURI === ns) {
        att.value = value; // Prefix may now be different, so set

        att.name = prefix !== null ? qualifiedName : name;
        att.prefix = prefix;
        return;
      }
    }

    const attr = new Attr(qualifiedName, this, ns);
    attr.value = value;
    const lastValue = setWritingPermission(true);
    this.attributes[this.attributes.length] = attr;
    setWritingPermission(lastValue);
  } // Todo: Add `removeAttributeNode`, `setAttributeNode`,
  //   `setAttributeNodeNS`, and use `new Attr()` for new ones


}

Element.prototype.nodeType = 1;

class Comment extends CharacterData {
  constructor(data, parentNode) {
    super(data, parentNode);
    this.nodeName = '#comment'; // Not needed w3c-xmlserializer
  }

}

Comment.prototype.nodeType = 8;

class DocumentFragment extends Node {
  constructor() {
    super();
    this.nodeName = '#document-fragment'; // Not needed w3c-xmlserializer

    Object.assign(this, ParentNode);
  }

}

DocumentFragment.prototype.nodeType = 11;

class ProcessingInstruction extends Node {
  constructor(target, data) {
    super();
    this.target = target;
    this.data = data;
    this.nodeName = target; // Not needed w3c-xmlserializer
  }

}

ProcessingInstruction.prototype.nodeType = 7;

class DocumentType extends Node {
  constructor(name, publicId = '', systemId = '') {
    super();
    this.name = name;
    this.publicId = publicId;
    this.systemId = systemId;
    this.nodeName = name; // Not needed w3c-xmlserializer

    Object.assign(this, ChildNode);
  }

}

DocumentType.prototype.nodeType = 10;
/* eslint-disable class-methods-use-this */

class Document extends Node {
  constructor(documentType, documentElement) {
    super();
    this.nodeName = '#document'; // Not needed w3c-xmlserializer

    Object.assign(this, ParentNode);

    if (documentType) {
      this.doctype = documentType;
      this.append(documentType);
    }

    if (documentElement) {
      this.append(documentElement);
    }

    this.documentElement = documentElement || null;
  }

  createComment(data) {
    return new Comment(data);
  }

  createProcessingInstruction(target, data) {
    return new ProcessingInstruction(target, data);
  }

  createAttribute(name) {
    return new Attr(name);
  }

  createDocumentFragment() {
    return new DocumentFragment();
  }

  createTextNode(data) {
    return new Text(data);
  } // createElement's namespace differs on HTML vs. XML documents, but not
  //  apparently with `createElementNS`


  createElementNS(namespace, elem) {
    return new Element(elem, namespace, this);
  }

}

Document.prototype.nodeType = 9;
/**
 * We need this to avoid TDZ problems from circular dependencies between
 * `Document` and `HTMLDocument`/`XMLDocument`.
 * @param {HTMLDocument} HTMLDocument
 * @param {XMLDocument} XMLDocument
 * @returns {void}
 */

function setImplementation(HTMLDocument, XMLDocument) {
  Document.prototype.implementation = {
    createDocumentType(name, publicId, systemId) {
      return new DocumentType(name, publicId, systemId);
    },

    createDocument(namespaceURI, qualifiedNameStr, documentType = null) {
      return new XMLDocument(namespaceURI, qualifiedNameStr, documentType);
    },

    createHTMLDocument(title) {
      return new HTMLDocument(title, this.createDocumentType('html'));
    }

  };
}

class HTMLElement$1 extends Element {
  constructor(name, ownerDocument) {
    super(name, 'http://www.w3.org/1999/xhtml', ownerDocument);
    this.localName = name.toLowerCase(); // `tagName` and `nodeName` are not needed by w3c-xmlserializer, but
    //   unobtrusive and basic enough to add

    const tagName = name.toUpperCase();
    this.tagName = tagName;
    this.nodeName = tagName;

    if (name === 'template') {
      // Create without an owner for now as not (yet?) specific to
      //  `document` instance
      this.content = !ownerDocument ? new DocumentFragment() : ownerDocument.createDocumentFragment();
    }
  } // Note: doesn't actually set a namespace in HTML


  setAttributeNS(ns, qualifiedName, value) {
    for (const att of this.attributes) {
      if (att.name === qualifiedName) {
        att.value = value;
        return;
      }
    }

    const attr = new Attr(qualifiedName, this);
    attr.value = value;
    const lastValue = setWritingPermission(true);
    this.attributes[this.attributes.length] = attr;
    setWritingPermission(lastValue);
  }

} // eslint-disable-next-line import/no-named-default


class HTMLDocument extends Document {
  constructor(title, documentType) {
    super(documentType);
    this.documentElement = new HTMLElement$1('html', this);
    const head = new HTMLElement$1('head', this);

    if (title !== undefined) {
      const titleElement = new HTMLElement$1('title', this);
      titleElement.append(title);
      head.append(titleElement);
    }

    const body = new HTMLElement$1('body', this);
    this.documentElement.append(head, body);
    this.append(this.documentElement);
  }

  createElement(elem) {
    return new HTMLElement$1(elem, this);
  } // eslint-disable-next-line class-methods-use-this


  createCDATASection(data) {
    throw new DOMException('Operation is not supported', 'NotSupportedError');
  }

}

class CDATASection extends Text {
  constructor(data, parentNode) {
    super(data, parentNode);
    this.nodeName = '#cdata-section'; // Not needed w3c-xmlserializer
  }

}

CDATASection.prototype.nodeType = 4; // eslint-disable-next-line import/no-named-default
// Note that the distinctive argument, `title` used with `HTMLDocument`
//  returns an empty string for XML document (though it seems this is a
//  browser or spec bug and it should not be defined at all)

class XMLDocument extends Document {
  constructor(namespaceURI, qualifiedNameStr, documentType) {
    super(documentType);
    const documentElement = new Element(qualifiedNameStr, namespaceURI, this);
    this.documentElement = documentElement;
    this.append(this.documentElement);
  }

  createElement(elem) {
    return new Element(elem, null, this);
  } // eslint-disable-next-line class-methods-use-this


  createCDATASection(data) {
    return new CDATASection(data);
  }

} // eslint-disable-next-line import/no-named-default


setImplementation(HTMLDocument, XMLDocument);
/**
 * A non-standard utility to more easily create documents (especially useful
 * if an empty doctype is desired).
 * @param {PlainObject} [cfg]
 * @param {string} [cfg.title=undefined]
 * @param {boolean} [cfg.doctype=true}]
 * @returns {HTMLDocument}
 */

const createHTMLDocument = ({
  title = undefined,
  doctype = true
} = {}) => {
  return new HTMLDocument(title, doctype ? Document.prototype.implementation.createDocumentType.call(null, 'html') : undefined);
};

var generatedParser = function () {
  function _waka(parser, startRule) {
    if (startRule && !parser.rules[startRule]) throw new Error('start rule missing: ' + JSON.stringify(startRule));
    return {
      getState: function () {
        return parser.state;
      },
      getTrace: function (message) {
        return (message ? message + '\n' : '') + parser.state.traceLine();
      },
      exec: function (input) {
        if (!startRule) throw new Error('no start rule given');
        parser.state.setInput(input);

        try {
          var value = parser.rules[startRule]();
        } catch (err) {
          var error = err;
        }

        if (error == null) {
          if (!parser.state.adv || !parser.state.isEOF()) var error = new Error('Unexpected syntax in top');
        }

        return {
          success: error == null,
          value: !error ? value : undefined,
          error: error
        };
      },
      startWith: function (rule) {
        return _waka(parser, rule);
      }
    };
  }
  return _waka(function () {

    var _rules = {};

    _rules.NameStartChar = function () {
      var _R = _P.match(":");

      if (!_P.adv) {
        _P.adv = true;

        var $0 = _P.cur();

        if ($0 == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("A" <= $0 && $0 <= "Z");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var _R = _P.match("_");
      }

      if (!_P.adv) {
        _P.adv = true;

        var $1 = _P.cur();

        if ($1 == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("a" <= $1 && $1 <= "z");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var $2 = _P.cur();

        if ($2 == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("\u00C0" <= $2 && $2 <= "\u00D6");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var $3 = _P.cur();

        if ($3 == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("\u00D8" <= $3 && $3 <= "\u00F6");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var $4 = _P.cur();

        if ($4 == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("\u00F8" <= $4 && $4 <= "\u02FF");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var $5 = _P.cur();

        if ($5 == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("\u0370" <= $5 && $5 <= "\u037D");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var $6 = _P.cur();

        if ($6 == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("\u037F" <= $6 && $6 <= "\u1FFF");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var $7 = _P.cur();

        if ($7 == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("\u200C" <= $7 && $7 <= "\u200D");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var $8 = _P.cur();

        if ($8 == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("\u2070" <= $8 && $8 <= "\u218F");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var $9 = _P.cur();

        if ($9 == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("\u2C00" <= $9 && $9 <= "\u2FEF");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var $a = _P.cur();

        if ($a == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("\u3001" <= $a && $a <= "\uD7FF");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var $b = _P.cur();

        if ($b == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("\uF900" <= $b && $b <= "\uFDCF");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var $c = _P.cur();

        if ($c == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("\uFDF0" <= $c && $c <= "\uFFFD");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        $d: {
          var $e = _P.pos;

          var $f = _P.cur();

          if ($f == null) {
            _P.adv = false;
          } else {
            _P.step("\uD800" <= $f && $f <= "\uDB7F");
          }

          if (!_P.adv) break $d;

          var $g = _P.cur();

          if ($g == null) {
            _P.adv = false;
          } else {
            _P.step("\uDC00" <= $g && $g <= "\uDFFF");
          }

          var _R = _P.doc.substring($e, _P.pos);
        }

        if (!_P.adv) _P.pos = $e;
      }

      return _R;
    };

    _rules.NameChar = function () {
      var _R = _rules.NameStartChar();

      if (!_P.adv) {
        _P.adv = true;

        var _R = _P.match("-");
      }

      if (!_P.adv) {
        _P.adv = true;

        var _R = _P.match(".");
      }

      if (!_P.adv) {
        _P.adv = true;

        var $0 = _P.cur();

        if ($0 == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("0" <= $0 && $0 <= "9");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var _R = _P.match("\u00B7");
      }

      if (!_P.adv) {
        _P.adv = true;

        var $1 = _P.cur();

        if ($1 == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("\u0300" <= $1 && $1 <= "\u036F");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var $2 = _P.cur();

        if ($2 == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("\u203F" <= $2 && $2 <= "\u2040");
        }
      }

      return _R;
    };

    _rules.Name = function () {
      $0: {
        var $1 = _P.pos;

        _rules.NameStartChar();

        if (!_P.adv) break $0;

        for (;;) {
          _rules.NameChar();

          if (!_P.adv) break;
        }
        _P.adv = true;

        var _R = _P.doc.substring($1, _P.pos);
      }

      if (!_P.adv) _P.pos = $1;
      return _R;
    };

    _rules.QName = function () {
      var _R = _rules.PrefixedName();

      if (!_P.adv) {
        _P.adv = true;

        var _R = _rules.UnprefixedName();
      }

      return _R;
    };

    _rules.PrefixedName = function () {
      $0: {
        var $1 = _P.pos;

        _rules.Prefix();

        if (!_P.adv) break $0;

        _P.match(":");

        if (!_P.adv) break $0;

        _rules.LocalPart();

        var _R = _P.doc.substring($1, _P.pos);
      }

      if (!_P.adv) _P.pos = $1;
      return _R;
    };

    _rules.UnprefixedName = function () {
      var _R = _rules.LocalPart();

      return _R;
    };

    _rules.Prefix = function () {
      var _R = _rules.NCName();

      return _R;
    };

    _rules.LocalPart = function () {
      var _R = _rules.NCName();

      return _R;
    };

    _rules.NCNameStartChar = function () {
      var $0 = _P.cur();

      if ($0 == null) {
        _P.adv = false;
        var _R = null;
      } else {
        var _R = _P.step("A" <= $0 && $0 <= "Z");
      }

      if (!_P.adv) {
        _P.adv = true;

        var _R = _P.match("_");
      }

      if (!_P.adv) {
        _P.adv = true;

        var $1 = _P.cur();

        if ($1 == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("a" <= $1 && $1 <= "z");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var $2 = _P.cur();

        if ($2 == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("\u00C0" <= $2 && $2 <= "\u00D6");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var $3 = _P.cur();

        if ($3 == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("\u00D8" <= $3 && $3 <= "\u00F6");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var $4 = _P.cur();

        if ($4 == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("\u00F8" <= $4 && $4 <= "\u02FF");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var $5 = _P.cur();

        if ($5 == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("\u0370" <= $5 && $5 <= "\u037D");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var $6 = _P.cur();

        if ($6 == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("\u037F" <= $6 && $6 <= "\u1FFF");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var $7 = _P.cur();

        if ($7 == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("\u200C" <= $7 && $7 <= "\u200D");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var $8 = _P.cur();

        if ($8 == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("\u2070" <= $8 && $8 <= "\u218F");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var $9 = _P.cur();

        if ($9 == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("\u2C00" <= $9 && $9 <= "\u2FEF");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var $a = _P.cur();

        if ($a == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("\u3001" <= $a && $a <= "\uD7FF");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var $b = _P.cur();

        if ($b == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("\uF900" <= $b && $b <= "\uFDCF");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var $c = _P.cur();

        if ($c == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("\uFDF0" <= $c && $c <= "\uFFFD");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        $d: {
          var $e = _P.pos;

          var $f = _P.cur();

          if ($f == null) {
            _P.adv = false;
          } else {
            _P.step("\uD800" <= $f && $f <= "\uDB7F");
          }

          if (!_P.adv) break $d;

          var $g = _P.cur();

          if ($g == null) {
            _P.adv = false;
          } else {
            _P.step("\uDC00" <= $g && $g <= "\uDFFF");
          }

          var _R = _P.doc.substring($e, _P.pos);
        }

        if (!_P.adv) _P.pos = $e;
      }

      return _R;
    };

    _rules.NCNameChar = function () {
      var _R = _rules.NCNameStartChar();

      if (!_P.adv) {
        _P.adv = true;

        var _R = _P.match("-");
      }

      if (!_P.adv) {
        _P.adv = true;

        var _R = _P.match(".");
      }

      if (!_P.adv) {
        _P.adv = true;

        var $0 = _P.cur();

        if ($0 == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("0" <= $0 && $0 <= "9");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var _R = _P.match("\u00B7");
      }

      if (!_P.adv) {
        _P.adv = true;

        var $1 = _P.cur();

        if ($1 == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("\u0300" <= $1 && $1 <= "\u036F");
        }
      }

      if (!_P.adv) {
        _P.adv = true;

        var $2 = _P.cur();

        if ($2 == null) {
          _P.adv = false;
          var _R = null;
        } else {
          var _R = _P.step("\u203F" <= $2 && $2 <= "\u2040");
        }
      }

      return _R;
    };

    _rules.NCName = function () {
      $0: {
        var $1 = _P.pos;

        _rules.NCNameStartChar();

        if (!_P.adv) break $0;

        for (;;) {
          _rules.NCNameChar();

          if (!_P.adv) break;
        }
        _P.adv = true;

        var _R = _P.doc.substring($1, _P.pos);
      }

      if (!_P.adv) _P.pos = $1;
      return _R;
    };

    function ParserState() {
      this.doc = '';
      this.pos = 0;
      this.adv = true;

      this.setInput = function (doc) {
        this.doc = doc;
        this.pos = 0;
        this.adv = true;
      };

      this.isEOF = function () {
        return this.pos == this.doc.length;
      };

      this.cur = function () {
        return _P.doc[_P.pos];
      };

      this.match = function (str) {
        if (_P.adv = _P.doc.substr(_P.pos, str.length) == str) {
          _P.pos += str.length;
          return str;
        }
      };

      this.step = function (flag) {
        if (_P.adv = flag) {
          _P.pos++;
          return _P.doc[_P.pos - 1];
        }
      };

      this.unexpected = function (rule) {
        throw new Error('Unexpected syntax in ' + rule);
      };

      this.traceLine = function (pos) {
        if (!pos) pos = _P.pos;

        var from = _P.doc.lastIndexOf('\n', pos),
            to = _P.doc.indexOf('\n', pos);

        if (from == -1) from = 0;else from++;
        if (to == -1) to = pos.length;

        var lineNo = _P.doc.substring(0, from).split('\n').length;

        var line = _P.doc.substring(from, to);

        var pointer = Array(200).join(' ').substr(0, pos - from) + '^^^';
        return 'Line ' + lineNo + ':\n' + line + '\n' + pointer;
      };
    }

    var _P = new ParserState();

    return {
      state: _P,
      rules: _rules
    };
  }(), null);
}();

var name = function (potentialName) {
  return mapResult(generatedParser.startWith("Name").exec(potentialName));
};

var qname = function (potentialQname) {
  return mapResult(generatedParser.startWith("QName").exec(potentialQname));
};

function mapResult(result) {
  return {
    success: result.success,
    error: result.error && generatedParser.getTrace(result.error.message)
  };
}

var xmlNameValidator = {
	name: name,
	qname: qname
};

var NAMESPACES = {
  HTML: "http://www.w3.org/1999/xhtml",
  XML: "http://www.w3.org/XML/1998/namespace",
  XMLNS: "http://www.w3.org/2000/xmlns/"
};
var NODE_TYPES = {
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  // historical
  TEXT_NODE: 3,
  CDATA_SECTION_NODE: 4,
  ENTITY_REFERENCE_NODE: 5,
  // historical
  ENTITY_NODE: 6,
  // historical
  PROCESSING_INSTRUCTION_NODE: 7,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11,
  NOTATION_NODE: 12 // historical

};
var VOID_ELEMENTS = new Set(["area", "base", "basefont", "bgsound", "br", "col", "embed", "frame", "hr", "img", "input", "keygen", "link", "menuitem", "meta", "param", "source", "track", "wbr"]);

var constants = {
	NAMESPACES: NAMESPACES,
	NODE_TYPES: NODE_TYPES,
	VOID_ELEMENTS: VOID_ELEMENTS
};

const {
  NAMESPACES: NAMESPACES$1
} = constants;

function generatePrefix(map, newNamespace, prefixIndex) {
  const generatedPrefix = "ns" + prefixIndex;
  map[newNamespace] = [generatedPrefix];
  return generatedPrefix;
}

function preferredPrefixString(map, ns, preferredPrefix) {
  const candidateList = map[ns];

  if (!candidateList) {
    return null;
  }

  if (candidateList.includes(preferredPrefix)) {
    return preferredPrefix;
  }

  return candidateList[candidateList.length - 1];
}

function serializeAttributeValue(value
/* , requireWellFormed*/
) {
  if (value === null) {
    return "";
  } // TODO: Check well-formedness


  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\t/g, "&#x9;").replace(/\n/g, "&#xA;").replace(/\r/g, "&#xD;");
}

function serializeAttributes(element, map, localPrefixes, ignoreNamespaceDefAttr, requireWellFormed, refs) {
  let result = "";
  const namespaceLocalnames = Object.create(null);

  for (const attr of element.attributes) {
    if (requireWellFormed && namespaceLocalnames[attr.namespaceURI] && namespaceLocalnames[attr.namespaceURI].has(attr.localName)) {
      throw new Error("Found duplicated attribute");
    }

    if (!namespaceLocalnames[attr.namespaceURI]) {
      namespaceLocalnames[attr.namespaceURI] = new Set();
    }

    namespaceLocalnames[attr.namespaceURI].add(attr.localName);
    const attributeNamespace = attr.namespaceURI;
    let candidatePrefix = null;

    if (attributeNamespace !== null) {
      candidatePrefix = preferredPrefixString(map, attributeNamespace, attr.prefix);

      if (attributeNamespace === NAMESPACES$1.XMLNS) {
        if (attr.value === NAMESPACES$1.XML || attr.prefix === null && ignoreNamespaceDefAttr || attr.prefix !== null && localPrefixes[attr.localName] !== attr.value && map[attr.value].includes(attr.localName)) {
          continue;
        }

        if (requireWellFormed && attr.value === NAMESPACES$1.XMLNS) {
          throw new Error("The XMLNS namespace is reserved and cannot be applied as an element's namespace via XML parsing");
        }

        if (requireWellFormed && attr.value === "") {
          throw new Error("Namespace prefix declarations cannot be used to undeclare a namespace");
        }

        if (attr.prefix === "xmlns") {
          candidatePrefix = "xmlns";
        }
      } else if (candidatePrefix === null) {
        candidatePrefix = generatePrefix(map, attributeNamespace, refs.prefixIndex++);
        result += ` xmlns:${candidatePrefix}="${serializeAttributeValue(attributeNamespace)}"`;
      }
    }

    result += " ";

    if (candidatePrefix !== null) {
      result += candidatePrefix + ":";
    }

    if (requireWellFormed && (attr.localName.includes(":") || !xmlNameValidator.name(attr.localName) || attr.localName === "xmlns" && attributeNamespace === null)) {
      throw new Error("Invalid attribute localName value");
    }

    result += `${attr.localName}="${serializeAttributeValue(attr.value)}"`;
  }

  return result;
}

var preferredPrefixString_1 = preferredPrefixString;
var generatePrefix_1 = generatePrefix;
var serializeAttributeValue_1 = serializeAttributeValue;
var serializeAttributes_1 = serializeAttributes;

var attributes = {
	preferredPrefixString: preferredPrefixString_1,
	generatePrefix: generatePrefix_1,
	serializeAttributeValue: serializeAttributeValue_1,
	serializeAttributes: serializeAttributes_1
};

const {
  NAMESPACES: NAMESPACES$2,
  VOID_ELEMENTS: VOID_ELEMENTS$1,
  NODE_TYPES: NODE_TYPES$1
} = constants;

const XML_CHAR = /^(\x09|\x0A|\x0D|[\x20-\uD7FF]|[\uE000-\uFFFD]|(?:[\uD800-\uDBFF][\uDC00-\uDFFF]))*$/;
const PUBID_CHAR = /^(\x20|\x0D|\x0A|[a-zA-Z0-9]|[-'()+,./:=?;!*#@$_%])*$/;

function asciiCaseInsensitiveMatch(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; ++i) {
    if ((a.charCodeAt(i) | 32) !== (b.charCodeAt(i) | 32)) {
      return false;
    }
  }

  return true;
}

function recordNamespaceInformation(element, map, prefixMap) {
  let defaultNamespaceAttrValue = null;

  for (let i = 0; i < element.attributes.length; ++i) {
    const attr = element.attributes[i];

    if (attr.namespaceURI === NAMESPACES$2.XMLNS) {
      if (attr.prefix === null) {
        defaultNamespaceAttrValue = attr.value;
        continue;
      }

      let namespaceDefinition = attr.value;

      if (namespaceDefinition === NAMESPACES$2.XML) {
        continue;
      } // This is exactly the other way than the spec says, but that's intended.
      // All the maps coalesce null to the empty string (explained in the
      // spec), so instead of doing that every time, just do it once here.


      if (namespaceDefinition === null) {
        namespaceDefinition = "";
      }

      if (namespaceDefinition in map && map[namespaceDefinition].includes(attr.localName)) {
        continue;
      }

      if (!(namespaceDefinition in map)) {
        map[namespaceDefinition] = [];
      }

      map[namespaceDefinition].push(attr.localName);
      prefixMap[attr.localName] = namespaceDefinition;
    }
  }

  return defaultNamespaceAttrValue;
}

function serializeDocumentType(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed && !PUBID_CHAR.test(node.publicId)) {
    throw new Error("Failed to serialize XML: document type node publicId is not well-formed.");
  }

  if (requireWellFormed && (!XML_CHAR.test(node.systemId) || node.systemId.includes('"') && node.systemId.includes("'"))) {
    throw new Error("Failed to serialize XML: document type node systemId is not well-formed.");
  }

  let markup = `<!DOCTYPE ${node.name}`;

  if (node.publicId !== "") {
    markup += ` PUBLIC "${node.publicId}"`;
  } else if (node.systemId !== "") {
    markup += " SYSTEM";
  }

  if (node.systemId !== "") {
    markup += ` "${node.systemId}"`;
  }

  return markup + ">";
}

function serializeProcessingInstruction(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed && (node.target.includes(":") || asciiCaseInsensitiveMatch(node.target, "xml"))) {
    throw new Error("Failed to serialize XML: processing instruction node target is not well-formed.");
  }

  if (requireWellFormed && (!XML_CHAR.test(node.data) || node.data.includes("?>"))) {
    throw new Error("Failed to serialize XML: processing instruction node data is not well-formed.");
  }

  return `<?${node.target} ${node.data}?>`;
}

function serializeDocument(node, namespace, prefixMap, requireWellFormed, refs) {
  if (requireWellFormed && node.documentElement === null) {
    throw new Error("Failed to serialize XML: document does not have a document element.");
  }

  let serializedDocument = "";

  for (const child of node.childNodes) {
    serializedDocument += xmlSerialization(child, namespace, prefixMap, requireWellFormed, refs);
  }

  return serializedDocument;
}

function serializeDocumentFragment(node, namespace, prefixMap, requireWellFormed, refs) {
  let markup = "";

  for (const child of node.childNodes) {
    markup += xmlSerialization(child, namespace, prefixMap, requireWellFormed, refs);
  }

  return markup;
}

function serializeText(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed && !XML_CHAR.test(node.data)) {
    throw new Error("Failed to serialize XML: text node data is not well-formed.");
  }

  return node.data.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function serializeComment(node, namespace, prefixMap, requireWellFormed) {
  if (requireWellFormed && !XML_CHAR.test(node.data)) {
    throw new Error("Failed to serialize XML: comment node data is not well-formed.");
  }

  if (requireWellFormed && (node.data.includes("--") || node.data.endsWith("-"))) {
    throw new Error("Failed to serialize XML: found hyphens in illegal places in comment node data.");
  }

  return `<!--${node.data}-->`;
}

function serializeElement(node, namespace, prefixMap, requireWellFormed, refs) {
  if (requireWellFormed && (node.localName.includes(":") || !xmlNameValidator.name(node.localName))) {
    throw new Error("Failed to serialize XML: element node localName is not a valid XML name.");
  }

  let markup = "<";
  let qualifiedName = "";
  let skipEndTag = false;
  let ignoreNamespaceDefinitionAttr = false;
  const map = Object.assign({}, prefixMap);
  const localPrefixesMap = Object.create(null);
  const localDefaultNamespace = recordNamespaceInformation(node, map, localPrefixesMap);
  let inheritedNs = namespace;
  const ns = node.namespaceURI;

  if (inheritedNs === ns) {
    if (localDefaultNamespace !== null) {
      ignoreNamespaceDefinitionAttr = true;
    }

    if (ns === NAMESPACES$2.XML) {
      qualifiedName = "xml:" + node.localName;
    } else {
      qualifiedName = node.localName;
    }

    markup += qualifiedName;
  } else {
    let {
      prefix
    } = node;
    let candidatePrefix = attributes.preferredPrefixString(map, ns, prefix);

    if (prefix === "xmlns") {
      if (requireWellFormed) {
        throw new Error("Failed to serialize XML: element nodes can't have a prefix of \"xmlns\".");
      }

      candidatePrefix = "xmlns";
    }

    if (candidatePrefix !== null) {
      qualifiedName = candidatePrefix + ":" + node.localName;

      if (localDefaultNamespace !== null && localDefaultNamespace !== NAMESPACES$2.XML) {
        inheritedNs = localDefaultNamespace === "" ? null : localDefaultNamespace;
      }

      markup += qualifiedName;
    } else if (prefix !== null) {
      if (prefix in localPrefixesMap) {
        prefix = attributes.generatePrefix(map, ns, refs.prefixIndex++);
      }

      if (map[ns]) {
        map[ns].push(prefix);
      } else {
        map[ns] = [prefix];
      }

      qualifiedName = prefix + ":" + node.localName;
      markup += `${qualifiedName} xmlns:${prefix}="${attributes.serializeAttributeValue(ns, requireWellFormed)}"`;

      if (localDefaultNamespace !== null) {
        inheritedNs = localDefaultNamespace === "" ? null : localDefaultNamespace;
      }
    } else if (localDefaultNamespace === null || localDefaultNamespace !== ns) {
      ignoreNamespaceDefinitionAttr = true;
      qualifiedName = node.localName;
      inheritedNs = ns;
      markup += `${qualifiedName} xmlns="${attributes.serializeAttributeValue(ns, requireWellFormed)}"`;
    } else {
      qualifiedName = node.localName;
      inheritedNs = ns;
      markup += qualifiedName;
    }
  }

  markup += attributes.serializeAttributes(node, map, localPrefixesMap, ignoreNamespaceDefinitionAttr, requireWellFormed, refs);

  if (ns === NAMESPACES$2.HTML && node.childNodes.length === 0 && VOID_ELEMENTS$1.has(node.localName)) {
    markup += " /";
    skipEndTag = true;
  } else if (ns !== NAMESPACES$2.HTML && node.childNodes.length === 0) {
    markup += "/";
    skipEndTag = true;
  }

  markup += ">";

  if (skipEndTag) {
    return markup;
  }

  if (ns === NAMESPACES$2.HTML && node.localName === "template") {
    markup += xmlSerialization(node.content, inheritedNs, map, requireWellFormed, refs);
  } else {
    for (const child of node.childNodes) {
      markup += xmlSerialization(child, inheritedNs, map, requireWellFormed, refs);
    }
  }

  markup += `</${qualifiedName}>`;
  return markup;
}

function serializeCDATASection(node) {
  return "<![CDATA[" + node.data + "]]>";
}
/**
 * @param {{prefixIndex: number}} refs
 */


function xmlSerialization(node, namespace, prefixMap, requireWellFormed, refs) {
  switch (node.nodeType) {
    case NODE_TYPES$1.ELEMENT_NODE:
      return serializeElement(node, namespace, prefixMap, requireWellFormed, refs);

    case NODE_TYPES$1.DOCUMENT_NODE:
      return serializeDocument(node, namespace, prefixMap, requireWellFormed, refs);

    case NODE_TYPES$1.COMMENT_NODE:
      return serializeComment(node, namespace, prefixMap, requireWellFormed);

    case NODE_TYPES$1.TEXT_NODE:
      return serializeText(node, namespace, prefixMap, requireWellFormed);

    case NODE_TYPES$1.DOCUMENT_FRAGMENT_NODE:
      return serializeDocumentFragment(node, namespace, prefixMap, requireWellFormed, refs);

    case NODE_TYPES$1.DOCUMENT_TYPE_NODE:
      return serializeDocumentType(node, namespace, prefixMap, requireWellFormed);

    case NODE_TYPES$1.PROCESSING_INSTRUCTION_NODE:
      return serializeProcessingInstruction(node, namespace, prefixMap, requireWellFormed);

    case NODE_TYPES$1.ATTRIBUTE_NODE:
      return "";

    case NODE_TYPES$1.CDATA_SECTION_NODE:
      return serializeCDATASection(node);

    default:
      throw new TypeError("Failed to serialize XML: only Nodes can be serialized.");
  }
}

var serialize = (root, {
  requireWellFormed = false
} = {}) => {
  const namespacePrefixMap = Object.create(null);
  namespacePrefixMap["http://www.w3.org/XML/1998/namespace"] = ["xml"];
  return xmlSerialization(root, null, namespacePrefixMap, requireWellFormed, {
    prefixIndex: 1
  });
};

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
// istanbul ignore next
var win = typeof window !== 'undefined' && window; // istanbul ignore next

var doc = typeof document !== 'undefined' && document || win && win.document; // STATIC PROPERTIES

var possibleOptions = ['$plugins', // '$mode', // Todo (SVG/XML)
// 'state', // Used internally
'$map' // Add any other options here
];
var NS_HTML = 'http://www.w3.org/1999/xhtml',
    hyphenForCamelCase = /\x2D([a-z])/g;
var ATTR_MAP = {
  readonly: 'readOnly'
}; // We define separately from ATTR_DOM for clarity (and parity with JsonML) but no current need
// We don't set attribute esp. for boolean atts as we want to allow setting of `undefined`
//   (e.g., from an empty variable) on templates to have no effect

var BOOL_ATTS = ['checked', 'defaultChecked', 'defaultSelected', 'disabled', 'indeterminate', 'open', // Dialog elements
'readOnly', 'selected']; // From JsonML

var ATTR_DOM = BOOL_ATTS.concat(['accessKey', // HTMLElement
'async', 'autocapitalize', // HTMLElement
'autofocus', 'contentEditable', // HTMLElement through ElementContentEditable
'defaultValue', 'defer', 'draggable', // HTMLElement
'formnovalidate', 'hidden', // HTMLElement
'innerText', // HTMLElement
'inputMode', // HTMLElement through ElementContentEditable
'ismap', 'multiple', 'novalidate', 'pattern', 'required', 'spellcheck', // HTMLElement
'translate', // HTMLElement
'value', 'willvalidate']); // Todo: Add more to this as useful for templating
//   to avoid setting through nullish value

var NULLABLES = ['dir', // HTMLElement
'lang', // HTMLElement
'max', 'min', 'title' // HTMLElement
];

var $ = function $(sel) {
  return doc.querySelector(sel);
};

var $$ = function $$(sel) {
  return _toConsumableArray(doc.querySelectorAll(sel));
};
/**
* Retrieve the (lower-cased) HTML name of a node.
* @static
* @param {Node} node The HTML node
* @returns {string} The lower-cased node name
*/


function _getHTMLNodeName(node) {
  return node.nodeName && node.nodeName.toLowerCase();
}
/**
* Apply styles if this is a style tag.
* @static
* @param {Node} node The element to check whether it is a style tag
* @returns {void}
*/


function _applyAnyStylesheet(node) {
  // Only used in IE
  // istanbul ignore else
  if (!doc.createStyleSheet) {
    return;
  } // istanbul ignore next


  if (_getHTMLNodeName(node) === 'style') {
    // IE
    var ss = doc.createStyleSheet(); // Create a stylesheet to actually do something useful

    ss.cssText = node.cssText; // We continue to add the style tag, however
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


function _appendNode(parent, child) {
  var parentName = _getHTMLNodeName(parent);

  var childName = _getHTMLNodeName(child); // IE only
  // istanbul ignore if


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
    // istanbul ignore next
    if (parentName === 'select' && childName === 'option') {
      try {
        // Since this is now DOM Level 4 standard behavior (and what IE7+ can handle), we try it first
        parent.add(child);
      } catch (err) {
        // DOM Level 2 did require a second argument, so we try it too just in case the user is using an older version of Firefox, etc.
        parent.add(child, null); // IE7 has a problem with this, but IE8+ is ok
      }

      return;
    } // istanbul ignore next


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


function _addEvent(el, type, handler, capturing) {
  el.addEventListener(type, handler, Boolean(capturing));
}
/**
* Creates a text node of the result of resolving an entity or character reference.
* @param {'entity'|'decimal'|'hexadecimal'} type Type of reference
* @param {string} prefix Text to prefix immediately after the "&"
* @param {string} arg The body of the reference
* @returns {Text} The text node of the resolved reference
*/


function _createSafeReference(type, prefix, arg) {
  // For security reasons related to innerHTML, we ensure this string only
  //  contains potential entity characters
  if (!arg.match(/^[0-9A-Z_a-z]+$/)) {
    throw new TypeError('Bad ' + type);
  }

  var elContainer = doc.createElement('div'); // Todo: No workaround for XML?
  // eslint-disable-next-line no-unsanitized/property

  elContainer.innerHTML = '&' + prefix + arg + ';';
  return doc.createTextNode(elContainer.innerHTML);
}
/**
* @param {string} n0 Whole expression match (including "-")
* @param {string} n1 Lower-case letter match
* @returns {string} Uppercased letter
*/


function _upperCase(n0, n1) {
  return n1.toUpperCase();
} // Todo: Make as public utility

/**
 * @param {any} o
 * @returns {boolean}
 */


function _isNullish(o) {
  return o === null || o === undefined;
} // Todo: Make as public utility, but also return types for undefined, boolean, number, document, etc.

/**
* @private
* @static
* @param {string|JamilihAttributes|JamilihArray|Element|DocumentFragment} item
* @returns {"string"|"null"|"array"|"element"|"fragment"|"object"|"symbol"|"function"|"number"|"boolean"}
*/


function _getType(item) {
  var type = _typeof(item);

  switch (type) {
    case 'object':
      if (item === null) {
        return 'null';
      }

      if (Array.isArray(item)) {
        return 'array';
      }

      if ('nodeType' in item) {
        switch (item.nodeType) {
          case 1:
            return 'element';

          case 9:
            return 'document';

          case 11:
            return 'fragment';

          default:
            return 'non-container node';
        }
      }

    // Fallthrough

    default:
      return type;
  }
}
/**
* @private
* @static
* @param {DocumentFragment} frag
* @param {Node} node
* @returns {DocumentFragment}
*/


function _fragReducer(frag, node) {
  frag.append(node);
  return frag;
}
/**
* @private
* @static
* @param {Object<{string:string}>} xmlnsObj
* @returns {string}
*/


function _replaceDefiner(xmlnsObj) {
  return function (n0) {
    var retStr = xmlnsObj[''] ? ' xmlns="' + xmlnsObj[''] + '"' : n0; // Preserve XHTML

    for (var _i = 0, _Object$entries = Object.entries(xmlnsObj); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          ns = _Object$entries$_i[0],
          xmlnsVal = _Object$entries$_i[1];

      if (ns !== '') {
        retStr += ' xmlns:' + ns + '="' + xmlnsVal + '"';
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


function _optsOrUndefinedJML() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return jml.apply(void 0, _toConsumableArray(args[0] === undefined ? args.slice(1) : args));
}
/**
* @typedef {JamilihAttributes} AttributeArray
* @property {string} 0 The key
* @property {string} 1 The value
*/

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


function _childrenToJML(node) {
  return function (childNodeJML, i) {
    var cn = node.childNodes[i];
    var j = Array.isArray(childNodeJML) ? jml.apply(void 0, _toConsumableArray(childNodeJML)) : jml(childNodeJML);
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


function _appendJML(node) {
  return function (childJML) {
    node.append(jml.apply(void 0, _toConsumableArray(childJML)));
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


function _appendJMLOrText(node) {
  return function (childJML) {
    if (typeof childJML === 'string') {
      node.append(childJML);
    } else {
      node.append(jml.apply(void 0, _toConsumableArray(childJML)));
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


var jml = function jml() {
  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  var elem = doc.createDocumentFragment();
  /**
   *
   * @param {Object<{string: string}>} atts
   * @returns {void}
   */

  function _checkAtts(atts) {
    var _loop = function _loop() {
      var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
          att = _Object$entries2$_i[0],
          attVal = _Object$entries2$_i[1];

      att = att in ATTR_MAP ? ATTR_MAP[att] : att;

      if (NULLABLES.includes(att)) {
        if (!_isNullish(attVal)) {
          elem[att] = attVal;
        }

        return "continue";
      } else if (ATTR_DOM.includes(att)) {
        elem[att] = attVal;
        return "continue";
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
        case '#':
          {
            // Document fragment
            nodes[nodes.length] = _optsOrUndefinedJML(opts, attVal);
            break;
          }

        case '$shadow':
          {
            var open = attVal.open,
                closed = attVal.closed;
            var content = attVal.content,
                template = attVal.template;
            var shadowRoot = elem.attachShadow({
              mode: closed || open === false ? 'closed' : 'open'
            });

            if (template) {
              if (Array.isArray(template)) {
                if (_getType(template[0]) === 'object') {
                  // Has attributes
                  template = jml.apply(void 0, ['template'].concat(_toConsumableArray(template), [doc.body]));
                } else {
                  // Array is for the children
                  template = jml('template', template, doc.body);
                }
              } else if (typeof template === 'string') {
                template = $(template);
              }

              jml(template.content.cloneNode(true), shadowRoot);
            } else {
              if (!content) {
                content = open || closed;
              }

              if (content && typeof content !== 'boolean') {
                if (Array.isArray(content)) {
                  jml({
                    '#': content
                  }, shadowRoot);
                } else {
                  jml(content, shadowRoot);
                }
              }
            }

            break;
          }

        case 'is':
          {
            // Currently only in Chrome
            // Handled during element creation
            break;
          }

        case '$custom':
          {
            Object.assign(elem, attVal);
            break;
          }

        /* istanbul ignore next */

        case '$define':
          {
            var localName = elem.localName.toLowerCase(); // Note: customized built-ins sadly not working yet

            var customizedBuiltIn = !localName.includes('-'); // We check attribute in case this is a preexisting DOM element
            // const {is} = atts;

            var is;

            if (customizedBuiltIn) {
              is = elem.getAttribute('is');

              if (!is) {
                if (!{}.hasOwnProperty.call(atts, 'is')) {
                  throw new TypeError('Expected `is` with `$define` on built-in');
                }

                elem.setAttribute('is', atts.is);
                is = atts.is;
              }
            }

            var def = customizedBuiltIn ? is : localName;

            if (customElements.get(def)) {
              break;
            }

            var getConstructor = function getConstructor(cnstrct) {
              var baseClass = options && options["extends"] ? doc.createElement(options["extends"]).constructor : customizedBuiltIn ? doc.createElement(localName).constructor : HTMLElement;
              return cnstrct ?
              /*#__PURE__*/
              function (_baseClass) {
                _inherits(_class, _baseClass);

                function _class() {
                  var _this;

                  _classCallCheck(this, _class);

                  _this = _possibleConstructorReturn(this, _getPrototypeOf(_class).call(this));
                  cnstrct.call(_assertThisInitialized(_this));
                  return _this;
                }

                return _class;
              }(baseClass) :
              /*#__PURE__*/
              function (_baseClass2) {
                _inherits(_class2, _baseClass2);

                function _class2() {
                  _classCallCheck(this, _class2);

                  return _possibleConstructorReturn(this, _getPrototypeOf(_class2).apply(this, arguments));
                }

                return _class2;
              }(baseClass);
            };

            var cnstrctr, options, mixin;

            if (Array.isArray(attVal)) {
              if (attVal.length <= 2) {
                var _attVal = _slicedToArray(attVal, 2);

                cnstrctr = _attVal[0];
                options = _attVal[1];

                if (typeof options === 'string') {
                  // Todo: Allow creating a definition without using it;
                  //  that may be the only reason to have a string here which
                  //  differs from the `localName` anyways
                  options = {
                    "extends": options
                  };
                } else if (options && !{}.hasOwnProperty.call(options, 'extends')) {
                  mixin = options;
                }

                if (_typeof(cnstrctr) === 'object') {
                  mixin = cnstrctr;
                  cnstrctr = getConstructor();
                }
              } else {
                var _attVal2 = _slicedToArray(attVal, 3);

                cnstrctr = _attVal2[0];
                mixin = _attVal2[1];
                options = _attVal2[2];

                if (typeof options === 'string') {
                  options = {
                    "extends": options
                  };
                }
              }
            } else if (typeof attVal === 'function') {
              cnstrctr = attVal;
            } else {
              mixin = attVal;
              cnstrctr = getConstructor();
            }

            if (!cnstrctr.toString().startsWith('class')) {
              cnstrctr = getConstructor(cnstrctr);
            }

            if (!options && customizedBuiltIn) {
              options = {
                "extends": localName
              };
            }

            if (mixin) {
              Object.entries(mixin).forEach(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                    methodName = _ref2[0],
                    method = _ref2[1];

                cnstrctr.prototype[methodName] = method;
              });
            } // console.log('def', def, '::', typeof options === 'object' ? options : undefined);


            customElements.define(def, cnstrctr, _typeof(options) === 'object' ? options : undefined);
            break;
          }

        case '$symbol':
          {
            var _attVal3 = _slicedToArray(attVal, 2),
                symbol = _attVal3[0],
                func = _attVal3[1];

            if (typeof func === 'function') {
              var funcBound = func.bind(elem);

              if (typeof symbol === 'string') {
                elem[Symbol["for"](symbol)] = funcBound;
              } else {
                elem[symbol] = funcBound;
              }
            } else {
              var obj = func;
              obj.elem = elem;

              if (typeof symbol === 'string') {
                elem[Symbol["for"](symbol)] = obj;
              } else {
                elem[symbol] = obj;
              }
            }

            break;
          }

        case '$data':
          {
            setMap(attVal);
            break;
          }

        case '$attribute':
          {
            // Attribute node
            var node = attVal.length === 3 ? doc.createAttributeNS(attVal[0], attVal[1]) : doc.createAttribute(attVal[0]);
            node.value = attVal[attVal.length - 1];
            nodes[nodes.length] = node;
            break;
          }

        case '$text':
          {
            // Todo: Also allow as jml(['a text node']) (or should that become a fragment)?
            var _node = doc.createTextNode(attVal);

            nodes[nodes.length] = _node;
            break;
          }

        case '$document':
          {
            // Todo: Conditionally create XML document
            var _node2 = doc.implementation.createHTMLDocument();

            if (attVal.childNodes) {
              // Remove any extra nodes created by createHTMLDocument().
              var j = attVal.childNodes.length;

              while (_node2.childNodes[j]) {
                var cn = _node2.childNodes[j];
                cn.remove(); // `j` should stay the same as removing will cause node to be present
              } // eslint-disable-next-line unicorn/no-fn-reference-in-iterator


              attVal.childNodes.forEach(_childrenToJML(_node2));
            } else {
              if (attVal.$DOCTYPE) {
                var dt = {
                  $DOCTYPE: attVal.$DOCTYPE
                };
                var doctype = jml(dt);

                _node2.firstChild.replaceWith(doctype);
              }

              var html = _node2.childNodes[1];
              var head = html.childNodes[0];
              var _body = html.childNodes[1];

              if (attVal.title || attVal.head) {
                var meta = doc.createElement('meta');
                meta.setAttribute('charset', 'utf-8');
                head.append(meta);

                if (attVal.title) {
                  _node2.title = attVal.title; // Appends after meta
                }

                if (attVal.head) {
                  // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
                  attVal.head.forEach(_appendJML(head));
                }
              }

              if (attVal.body) {
                // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
                attVal.body.forEach(_appendJMLOrText(_body));
              }
            }

            nodes[nodes.length] = _node2;
            break;
          }

        case '$DOCTYPE':
          {
            var _node3 = doc.implementation.createDocumentType(attVal.name, attVal.publicId || '', attVal.systemId || '');

            nodes[nodes.length] = _node3;
            break;
          }

        case '$on':
          {
            // Events
            for (var _i3 = 0, _Object$entries3 = Object.entries(attVal); _i3 < _Object$entries3.length; _i3++) {
              var _Object$entries3$_i = _slicedToArray(_Object$entries3[_i3], 2),
                  p2 = _Object$entries3$_i[0],
                  val = _Object$entries3$_i[1];

              if (typeof val === 'function') {
                val = [val, false];
              }

              if (typeof val[0] !== 'function') {
                throw new TypeError('Expect a function for `$on`');
              }

              _addEvent(elem, p2, val[0], val[1]); // element, event name, handler, capturing

            }

            break;
          }

        case 'className':
        case 'class':
          if (!_isNullish(attVal)) {
            elem.className = attVal;
          }

          break;

        case 'dataset':
          {
            // Map can be keyed with hyphenated or camel-cased properties
            var recurse = function recurse(atVal, startProp) {
              var prop = '';
              var pastInitialProp = startProp !== '';
              Object.keys(atVal).forEach(function (key) {
                var value = atVal[key];

                if (pastInitialProp) {
                  prop = startProp + key.replace(hyphenForCamelCase, _upperCase).replace(/^([a-z])/, _upperCase);
                } else {
                  prop = startProp + key.replace(hyphenForCamelCase, _upperCase);
                }

                if (value === null || _typeof(value) !== 'object') {
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
            break; // Todo: Disable this by default unless configuration explicitly allows (for security)
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

        case 'htmlFor':
        case 'for':
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

        default:
          {
            if (att.startsWith('on')) {
              elem[att] = attVal; // _addEvent(elem, att.slice(2), attVal, false); // This worked, but perhaps the user wishes only one event

              break;
            }

            if (att === 'style') {
              if (_isNullish(attVal)) {
                break;
              }

              if (_typeof(attVal) === 'object') {
                for (var _i4 = 0, _Object$entries4 = Object.entries(attVal); _i4 < _Object$entries4.length; _i4++) {
                  var _Object$entries4$_i = _slicedToArray(_Object$entries4[_i4], 2),
                      _p = _Object$entries4$_i[0],
                      styleVal = _Object$entries4$_i[1];

                  if (!_isNullish(styleVal)) {
                    // Todo: Handle aggregate properties like "border"
                    if (_p === 'float') {
                      elem.style.cssFloat = styleVal;
                      elem.style.styleFloat = styleVal; // Harmless though we could make conditional on older IE instead
                    } else {
                      elem.style[_p.replace(hyphenForCamelCase, _upperCase)] = styleVal;
                    }
                  }
                }

                break;
              } // setAttribute unfortunately erases any existing styles


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

            var matchingPlugin = opts && opts.$plugins && opts.$plugins.find(function (p) {
              return p.name === att;
            });

            if (matchingPlugin) {
              matchingPlugin.set({
                element: elem,
                attribute: {
                  name: att,
                  value: attVal
                }
              });
              break;
            }

            elem.setAttribute(att, attVal);
            break;
          }
      }
    };

    for (var _i2 = 0, _Object$entries2 = Object.entries(atts); _i2 < _Object$entries2.length; _i2++) {
      var _ret = _loop();

      if (_ret === "continue") continue;
    }
  }

  var nodes = [];
  var elStr;
  var opts;
  var isRoot = false;

  if (_getType(args[0]) === 'object' && Object.keys(args[0]).some(function (key) {
    return possibleOptions.includes(key);
  })) {
    opts = args[0];

    if (opts.state !== 'child') {
      isRoot = true;
      opts.state = 'child';
    }

    if (opts.$map && !opts.$map.root && opts.$map.root !== false) {
      opts.$map = {
        root: opts.$map
      };
    }

    if ('$plugins' in opts) {
      if (!Array.isArray(opts.$plugins)) {
        throw new TypeError('$plugins must be an array');
      }

      opts.$plugins.forEach(function (pluginObj) {
        if (!pluginObj || _typeof(pluginObj) !== 'object') {
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

  var argc = args.length;
  var defaultMap = opts && opts.$map && opts.$map.root;

  var setMap = function setMap(dataVal) {
    var map, obj; // Boolean indicating use of default map and object

    if (dataVal === true) {
      var _defaultMap = _slicedToArray(defaultMap, 2);

      map = _defaultMap[0];
      obj = _defaultMap[1];
    } else if (Array.isArray(dataVal)) {
      // Array of strings mapping to default
      if (typeof dataVal[0] === 'string') {
        dataVal.forEach(function (dVal) {
          setMap(opts.$map[dVal]);
        });
        return; // Array of Map and non-map data object
      }

      map = dataVal[0] || defaultMap[0];
      obj = dataVal[1] || defaultMap[1]; // Map
    } else if (/^\[object (?:Weak)?Map\]$/.test([].toString.call(dataVal))) {
      map = dataVal;
      obj = defaultMap[1]; // Non-map data object
    } else {
      map = defaultMap[0];
      obj = dataVal;
    }

    map.set(elem, obj);
  };

  for (var i = 0; i < argc; i++) {
    var arg = args[i];

    var type = _getType(arg);

    switch (type) {
      default:
        throw new TypeError('Unexpected type: ' + type);

      case 'null':
        // null always indicates a place-holder (only needed for last argument if want array returned)
        if (i === argc - 1) {
          _applyAnyStylesheet(nodes[0]); // We have to execute any stylesheets even if not appending or otherwise IE will never apply them
          // Todo: Fix to allow application of stylesheets of style tags within fragments?


          return nodes.length <= 1 ? nodes[0] // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
          : nodes.reduce(_fragReducer, doc.createDocumentFragment()); // nodes;
        }

        throw new TypeError('`null` values not allowed except as final Jamilih argument');

      case 'string':
        // Strings normally indicate elements
        switch (arg) {
          case '!':
            nodes[nodes.length] = doc.createComment(args[++i]);
            break;

          case '?':
            {
              arg = args[++i];
              var procValue = args[++i];
              var val = procValue;

              if (val && _typeof(val) === 'object') {
                procValue = [];

                for (var _i5 = 0, _Object$entries5 = Object.entries(val); _i5 < _Object$entries5.length; _i5++) {
                  var _Object$entries5$_i = _slicedToArray(_Object$entries5[_i5], 2),
                      p = _Object$entries5$_i[0],
                      procInstVal = _Object$entries5$_i[1];

                  procValue.push(p + '=' + '"' + // https://www.w3.org/TR/xml-stylesheet/#NT-PseudoAttValue
                  procInstVal.replace(/"/g, '&quot;') + '"');
                }

                procValue = procValue.join(' ');
              } // Firefox allows instructions with ">" in this method, but not if placed directly!


              try {
                nodes[nodes.length] = doc.createProcessingInstruction(arg, procValue);
              } catch (e) {
                // Getting NotSupportedError in IE, so we try to imitate a processing instruction with a comment
                // innerHTML didn't work
                // var elContainer = doc.createElement('div');
                // elContainer.innerHTML = '<?' + doc.createTextNode(arg + ' ' + procValue).nodeValue + '?>';
                // nodes[nodes.length] = elContainer.innerHTML;
                // Todo: any other way to resolve? Just use XML?
                nodes[nodes.length] = doc.createComment('?' + arg + ' ' + procValue + '?');
              }

              break; // Browsers don't support doc.createEntityReference, so we just use this as a convenience
            }

          case '&':
            nodes[nodes.length] = _createSafeReference('entity', '', args[++i]);
            break;

          case '#':
            // // Decimal character reference - ['#', '01234'] // &#01234; // probably easier to use JavaScript Unicode escapes
            nodes[nodes.length] = _createSafeReference('decimal', arg, String(args[++i]));
            break;

          case '#x':
            // Hex character reference - ['#x', '123a'] // &#x123a; // probably easier to use JavaScript Unicode escapes
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
            nodes[nodes.length] = elem = doc.createDocumentFragment();
            break;

          default:
            {
              // An element
              elStr = arg;
              var atts = args[i + 1];

              if (_getType(atts) === 'object' && atts.is) {
                var is = atts.is; // istanbul ignore else

                if (doc.createElementNS) {
                  elem = doc.createElementNS(NS_HTML, elStr, {
                    is: is
                  });
                } else {
                  elem = doc.createElement(elStr, {
                    is: is
                  });
                }
              } else
                /* istanbul ignore else */
                if (doc.createElementNS) {
                  elem = doc.createElementNS(NS_HTML, elStr);
                } else {
                  elem = doc.createElement(elStr);
                }

              nodes[nodes.length] = elem; // Add to parent

              break;
            }
        }

        break;

      case 'object':
        {
          // Non-DOM-element objects indicate attribute-value pairs
          var _atts = arg;

          if (_atts.xmlns !== undefined) {
            // We handle this here, as otherwise may lose events, etc.
            // As namespace of element already set as XHTML, we need to change the namespace
            // elem.setAttribute('xmlns', atts.xmlns); // Doesn't work
            // Can't set namespaceURI dynamically, renameNode() is not supported, and setAttribute() doesn't work to change the namespace, so we resort to this hack
            var replacer = void 0;

            if (_typeof(_atts.xmlns) === 'object') {
              replacer = _replaceDefiner(_atts.xmlns);
            } else {
              replacer = ' xmlns="' + _atts.xmlns + '"';
            } // try {
            // Also fix DOMParser to work with text/html


            elem = nodes[nodes.length - 1] = new win.DOMParser().parseFromString(new win.XMLSerializer().serializeToString(elem) // Mozilla adds XHTML namespace
            .replace(' xmlns="' + NS_HTML + '"', replacer), 'application/xml').documentElement; // }catch(e) {alert(elem.outerHTML);throw e;}
          }

          _checkAtts(_atts);

          break;
        }

      case 'document':
      case 'fragment':
      case 'element':
        /*
        1) Last element always the parent (put null if don't want parent and want to return array) unless only atts and children (no other elements)
        2) Individual elements (DOM elements or sequences of string[/object/array]) get added to parent first-in, first-added
        */
        if (i === 0) {
          // Allow wrapping of element, fragment, or document
          elem = arg;
        }

        if (i === argc - 1 || i === argc - 2 && args[i + 1] === null) {
          // parent
          var elsl = nodes.length;

          for (var k = 0; k < elsl; k++) {
            _appendNode(arg, nodes[k]);
          } // Todo: Apply stylesheets if any style tags were added elsewhere besides the first element?


          _applyAnyStylesheet(nodes[0]); // We have to execute any stylesheets even if not appending or otherwise IE will never apply them

        } else {
          nodes[nodes.length] = arg;
        }

        break;

      case 'array':
        {
          // Arrays or arrays of arrays indicate child nodes
          var child = arg;
          var cl = child.length;

          for (var j = 0; j < cl; j++) {
            // Go through children array container to handle elements
            var childContent = child[j];

            var childContentType = _typeof(childContent);

            if (_isNullish(childContent)) {
              throw new TypeError('Bad children (parent array: ' + JSON.stringify(args) + '; child: ' + child + '; index:' + j + ')');
            }

            switch (childContentType) {
              // Todo: determine whether null or function should have special handling or be converted to text
              case 'string':
              case 'number':
              case 'boolean':
                _appendNode(elem, doc.createTextNode(childContent));

                break;

              default:
                if (Array.isArray(childContent)) {
                  // Arrays representing child elements
                  _appendNode(elem, _optsOrUndefinedJML.apply(void 0, [opts].concat(_toConsumableArray(childContent))));
                } else if (childContent['#']) {
                  // Fragment
                  _appendNode(elem, _optsOrUndefinedJML(opts, childContent['#']));
                } else {
                  // Single DOM element children
                  _appendNode(elem, childContent);
                }

                break;
            }
          }

          break;
        }
    }
  }

  var ret = nodes[0] || elem;

  if (opts && isRoot && opts.$map && opts.$map.root) {
    setMap(true);
  }

  return ret;
};
/**
* Converts a DOM object or a string of HTML into a Jamilih object (or string).
* @param {string|HTMLElement} dom If a string, will parse as document
* @param {PlainObject} [config] Configuration object
* @param {boolean} [config.stringOutput=false] Whether to output the Jamilih object as a string.
* @param {boolean} [config.reportInvalidState=true] If true (the default), will report invalid state errors
* @param {boolean} [config.stripWhitespace=false] Strip whitespace for text nodes
* @returns {JamilihArray|string} Array containing the elements which represent
* a Jamilih object, or, if `stringOutput` is true, it will be the stringified
* version of such an object
*/


jml.toJML = function (dom) {
  var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref3$stringOutput = _ref3.stringOutput,
      stringOutput = _ref3$stringOutput === void 0 ? false : _ref3$stringOutput,
      _ref3$reportInvalidSt = _ref3.reportInvalidState,
      reportInvalidState = _ref3$reportInvalidSt === void 0 ? true : _ref3$reportInvalidSt,
      _ref3$stripWhitespace = _ref3.stripWhitespace,
      stripWhitespace = _ref3$stripWhitespace === void 0 ? false : _ref3$stripWhitespace;

  if (typeof dom === 'string') {
    dom = new win.DOMParser().parseFromString(dom, 'text/html'); // todo: Give option for XML once implemented and change JSDoc to allow for Element
  }

  var ret = [];
  var parent = ret;
  var parentIdx = 0;
  /**
   * @param {string} msg
   * @throws {DOMException}
   * @returns {void}
   */

  function invalidStateError(msg) {
    // These are probably only necessary if working with text/html
    // eslint-disable-next-line no-shadow, unicorn/custom-error-definition
    var DOMException =
    /*#__PURE__*/
    function (_Error) {
      _inherits(DOMException, _Error);

      function DOMException(message, name) {
        var _this2;

        _classCallCheck(this, DOMException);

        _this2 = _possibleConstructorReturn(this, _getPrototypeOf(DOMException).call(this, message)); // eslint-disable-next-line unicorn/custom-error-definition

        _this2.name = name;
        return _this2;
      }

      return DOMException;
    }(_wrapNativeSuper(Error));

    if (reportInvalidState) {
      // INVALID_STATE_ERR per section 9.3 XHTML 5: http://www.w3.org/TR/html5/the-xhtml-syntax.html
      var e = new DOMException(msg, 'INVALID_STATE_ERR');
      e.code = 11;
      throw e;
    }
  }
  /**
   *
   * @param {DocumentType|Entity} obj
   * @param {Node} node
   * @returns {void}
   */


  function addExternalID(obj, node) {
    if (node.systemId.includes('"') && node.systemId.includes("'")) {
      invalidStateError('systemId cannot have both single and double quotes.');
    }

    var publicId = node.publicId,
        systemId = node.systemId;

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


  function set(val) {
    parent[parentIdx] = val;
    parentIdx++;
  }
  /**
   * @returns {void}
   */


  function setChildren() {
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


  function setObj(prop1, prop2) {
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


  function parseDOM(node, namespaces) {
    // namespaces = clone(namespaces) || {}; // Ensure we're working with a copy, so different levels in the hierarchy can treat it differently

    /*
    if ((node.prefix && node.prefix.includes(':')) || (node.localName && node.localName.includes(':'))) {
      invalidStateError('Prefix cannot have a colon');
    }
    */
    var type = 'nodeType' in node ? node.nodeType : null;
    namespaces = _objectSpread2({}, namespaces);
    var xmlChars = /^([\t\n\r -\uD7FF\uE000-\uFFFD]|(?:[\uD800-\uDBFF](?![\uDC00-\uDFFF]))(?:(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))*$/; // eslint-disable-line no-control-regex

    if ([2, 3, 4, 7, 8].includes(type) && !xmlChars.test(node.nodeValue)) {
      invalidStateError('Node has bad XML character value');
    }

    var tmpParent, tmpParentIdx;
    /**
     * @returns {void}
     */

    function setTemp() {
      tmpParent = parent;
      tmpParentIdx = parentIdx;
    }
    /**
     * @returns {void}
     */


    function resetTemp() {
      parent = tmpParent;
      parentIdx = tmpParentIdx;
      parentIdx++; // Increment index in parent container of this element
    }

    switch (type) {
      case 1:
        {
          // ELEMENT
          setTemp();
          var nodeName = node.nodeName.toLowerCase(); // Todo: for XML, should not lower-case

          setChildren(); // Build child array since elements are, except at the top level, encapsulated in arrays

          set(nodeName);
          var start = {};
          var hasNamespaceDeclaration = false;

          if (namespaces[node.prefix || ''] !== node.namespaceURI) {
            namespaces[node.prefix || ''] = node.namespaceURI;

            if (node.prefix) {
              start['xmlns:' + node.prefix] = node.namespaceURI;
            } else if (node.namespaceURI) {
              start.xmlns = node.namespaceURI;
            } else {
              start.xmlns = null;
            }

            hasNamespaceDeclaration = true;
          }

          if (node.attributes.length) {
            set(_toConsumableArray(node.attributes).reduce(function (obj, att) {
              obj[att.name] = att.value; // Attr.nodeName and Attr.nodeValue are deprecated as of DOM4 as Attr no longer inherits from Node, so we can safely use name and value

              return obj;
            }, start));
          } else if (hasNamespaceDeclaration) {
            set(start);
          }

          var childNodes = node.childNodes;

          if (childNodes.length) {
            setChildren(); // Element children array container

            _toConsumableArray(childNodes).forEach(function (childNode) {
              parseDOM(childNode, namespaces);
            });
          }

          resetTemp();
          break;
        }

      case undefined: // Treat as attribute node until this is fixed: https://github.com/jsdom/jsdom/issues/1641 / https://github.com/jsdom/jsdom/pull/1822

      case 2:
        // ATTRIBUTE (should only get here if passing in an attribute node)
        set({
          $attribute: [node.namespaceURI, node.name, node.value]
        });
        break;

      case 3:
        // TEXT
        if (stripWhitespace && /^[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+$/.test(node.nodeValue)) {
          set('');
          return;
        }

        set(node.nodeValue);
        break;

      case 4:
        // CDATA
        if (node.nodeValue.includes(']]' + '>')) {
          invalidStateError('CDATA cannot end with closing ]]>');
        }

        set(['![', node.nodeValue]);
        break;

      case 5:
        // ENTITY REFERENCE (though not in browsers (was already resolved
        //  anyways), ok to keep for parity with our "entity" shorthand)
        set(['&', node.nodeName]);
        break;

      case 7:
        // PROCESSING INSTRUCTION
        if (/^xml$/i.test(node.target)) {
          invalidStateError('Processing instructions cannot be "xml".');
        }

        if (node.target.includes('?>')) {
          invalidStateError('Processing instruction targets cannot include ?>');
        }

        if (node.target.includes(':')) {
          invalidStateError('The processing instruction target cannot include ":"');
        }

        if (node.data.includes('?>')) {
          invalidStateError('Processing instruction data cannot include ?>');
        }

        set(['?', node.target, node.data]); // Todo: Could give option to attempt to convert value back into object if has pseudo-attributes

        break;

      case 8:
        // COMMENT
        if (node.nodeValue.includes('--') || node.nodeValue.length && node.nodeValue.lastIndexOf('-') === node.nodeValue.length - 1) {
          invalidStateError('Comments cannot include --');
        }

        set(['!', node.nodeValue]);
        break;

      case 9:
        {
          // DOCUMENT
          setTemp();
          var docObj = {
            $document: {
              childNodes: []
            }
          };
          set(docObj); // doc.implementation.createHTMLDocument
          // Set position to fragment's array children

          setObj('$document', 'childNodes');
          var _childNodes = node.childNodes;

          if (!_childNodes.length) {
            invalidStateError('Documents must have a child node');
          } // set({$xmlDocument: []}); // doc.implementation.createDocument // Todo: use this conditionally


          _toConsumableArray(_childNodes).forEach(function (childNode) {
            // Can't just do documentElement as there may be doctype, comments, etc.
            // No need for setChildren, as we have already built the container array
            parseDOM(childNode, namespaces);
          });

          resetTemp();
          break;
        }

      case 10:
        {
          // DOCUMENT TYPE
          setTemp(); // Can create directly by doc.implementation.createDocumentType

          var _start = {
            $DOCTYPE: {
              name: node.name
            }
          };
          var pubIdChar = /^( |\r|\n|[0-9A-Za-z]|[!#-%'-\/:;=\?@_])*$/; // eslint-disable-line no-control-regex

          if (!pubIdChar.test(node.publicId)) {
            invalidStateError('A publicId must have valid characters.');
          }

          addExternalID(_start.$DOCTYPE, node); // Fit in internal subset along with entities?: probably don't need as these would only differ if from DTD, and we're not rebuilding the DTD

          set(_start); // Auto-generate the internalSubset instead?

          resetTemp();
          break;
        }

      case 11:
        {
          // DOCUMENT FRAGMENT
          setTemp();
          set({
            '#': []
          }); // Set position to fragment's array children

          setObj('#');
          var _childNodes2 = node.childNodes;

          _toConsumableArray(_childNodes2).forEach(function (childNode) {
            // No need for setChildren, as we have already built the container array
            parseDOM(childNode, namespaces);
          });

          resetTemp();
          break;
        }

      default:
        throw new TypeError('Not an XML type');
    }
  }

  parseDOM(dom, {});

  if (stringOutput) {
    return JSON.stringify(ret[0]);
  }

  return ret[0];
};

jml.toJMLString = function (dom, config) {
  return jml.toJML(dom, Object.assign(config || {}, {
    stringOutput: true
  }));
};
/**
 *
 * @param {JamilihArray} args
 * @returns {JamilihReturn}
 */


jml.toDOM = function () {
  // Alias for jml()
  return jml.apply(void 0, arguments);
};
/**
 *
 * @param {JamilihArray} args
 * @returns {string}
 */


jml.toHTML = function () {
  // Todo: Replace this with version of jml() that directly builds a string
  var ret = jml.apply(void 0, arguments); // Todo: deal with serialization of properties like 'selected',
  //  'checked', 'value', 'defaultValue', 'for', 'dataset', 'on*',
  //  'style'! (i.e., need to build a string ourselves)

  return ret.outerHTML;
};
/**
 *
 * @param {JamilihArray} args
 * @returns {string}
 */


jml.toDOMString = function () {
  // Alias for jml.toHTML for parity with jml.toJMLString
  return jml.toHTML.apply(jml, arguments);
};
/**
 *
 * @param {JamilihArray} args
 * @returns {string}
 */


jml.toXML = function () {
  var ret = jml.apply(void 0, arguments);
  return new XMLSerializer().serializeToString(ret);
};
/**
 *
 * @param {JamilihArray} args
 * @returns {string}
 */


jml.toXMLDOMString = function () {
  // Alias for jml.toXML for parity with jml.toJMLString
  return jml.toXML.apply(jml, arguments);
};

var JamilihMap =
/*#__PURE__*/
function (_Map) {
  _inherits(JamilihMap, _Map);

  function JamilihMap() {
    _classCallCheck(this, JamilihMap);

    return _possibleConstructorReturn(this, _getPrototypeOf(JamilihMap).apply(this, arguments));
  }

  _createClass(JamilihMap, [{
    key: "get",
    value: function get(elem) {
      elem = typeof elem === 'string' ? $(elem) : elem;
      return _get(_getPrototypeOf(JamilihMap.prototype), "get", this).call(this, elem);
    }
  }, {
    key: "set",
    value: function set(elem, value) {
      elem = typeof elem === 'string' ? $(elem) : elem;
      return _get(_getPrototypeOf(JamilihMap.prototype), "set", this).call(this, elem, value);
    }
  }, {
    key: "invoke",
    value: function invoke(elem, methodName) {
      var _this$get;

      elem = typeof elem === 'string' ? $(elem) : elem;

      for (var _len3 = arguments.length, args = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
        args[_key3 - 2] = arguments[_key3];
      }

      return (_this$get = this.get(elem))[methodName].apply(_this$get, [elem].concat(args));
    }
  }]);

  return JamilihMap;
}(_wrapNativeSuper(Map));

var JamilihWeakMap =
/*#__PURE__*/
function (_WeakMap) {
  _inherits(JamilihWeakMap, _WeakMap);

  function JamilihWeakMap() {
    _classCallCheck(this, JamilihWeakMap);

    return _possibleConstructorReturn(this, _getPrototypeOf(JamilihWeakMap).apply(this, arguments));
  }

  _createClass(JamilihWeakMap, [{
    key: "get",
    value: function get(elem) {
      elem = typeof elem === 'string' ? $(elem) : elem;
      return _get(_getPrototypeOf(JamilihWeakMap.prototype), "get", this).call(this, elem);
    }
  }, {
    key: "set",
    value: function set(elem, value) {
      elem = typeof elem === 'string' ? $(elem) : elem;
      return _get(_getPrototypeOf(JamilihWeakMap.prototype), "set", this).call(this, elem, value);
    }
  }, {
    key: "invoke",
    value: function invoke(elem, methodName) {
      var _this$get2;

      elem = typeof elem === 'string' ? $(elem) : elem;

      for (var _len4 = arguments.length, args = new Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
        args[_key4 - 2] = arguments[_key4];
      }

      return (_this$get2 = this.get(elem))[methodName].apply(_this$get2, [elem].concat(args));
    }
  }]);

  return JamilihWeakMap;
}(_wrapNativeSuper(WeakMap));

jml.Map = JamilihMap;
jml.WeakMap = JamilihWeakMap;
/**
* @typedef {GenericArray} MapAndElementArray
* @property {JamilihWeakMap|JamilihMap} 0
* @property {Element} 1
*/

/**
 * @param {GenericObject} obj
 * @param {...JamilihArray} args
 * @returns {MapAndElementArray}
 */

jml.weak = function (obj) {
  var map = new JamilihWeakMap();

  for (var _len5 = arguments.length, args = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
    args[_key5 - 1] = arguments[_key5];
  }

  var elem = jml.apply(void 0, [{
    $map: [map, obj]
  }].concat(args));
  return [map, elem];
};
/**
 * @param {any} obj
 * @param {...JamilihArray} args
 * @returns {MapAndElementArray}
 */


jml.strong = function (obj) {
  var map = new JamilihMap();

  for (var _len6 = arguments.length, args = new Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
    args[_key6 - 1] = arguments[_key6];
  }

  var elem = jml.apply(void 0, [{
    $map: [map, obj]
  }].concat(args));
  return [map, elem];
};
/**
 * @param {string|Element} elem If a string, will be interpreted as a selector
 * @param {symbol|string} sym If a string, will be used with `Symbol.for`
 * @returns {any} The value associated with the symbol
 */


jml.symbol = jml.sym = jml["for"] = function (elem, sym) {
  elem = typeof elem === 'string' ? $(elem) : elem;
  return elem[_typeof(sym) === 'symbol' ? sym : Symbol["for"](sym)];
};
/**
 * @param {string|Element} elem If a string, will be interpreted as a selector
 * @param {symbol|string|Map|WeakMap} symOrMap If a string, will be used with `Symbol.for`
 * @param {string|any} methodName Can be `any` if the symbol or map directly
 *   points to a function (it is then used as the first argument).
 * @param {any[]} args
 * @returns {any}
 */


jml.command = function (elem, symOrMap, methodName) {
  var _func3;

  elem = typeof elem === 'string' ? $(elem) : elem;
  var func;

  for (var _len7 = arguments.length, args = new Array(_len7 > 3 ? _len7 - 3 : 0), _key7 = 3; _key7 < _len7; _key7++) {
    args[_key7 - 3] = arguments[_key7];
  }

  if (['symbol', 'string'].includes(_typeof(symOrMap))) {
    var _func;

    func = jml.sym(elem, symOrMap);

    if (typeof func === 'function') {
      return func.apply(void 0, [methodName].concat(args)); // Already has `this` bound to `elem`
    }

    return (_func = func)[methodName].apply(_func, args);
  }

  func = symOrMap.get(elem);

  if (typeof func === 'function') {
    var _func2;

    return (_func2 = func).call.apply(_func2, [elem, methodName].concat(args));
  }

  return (_func3 = func)[methodName].apply(_func3, [elem].concat(args)); // return func[methodName].call(elem, ...args);
};
/**
 * Expects properties `document`, `XMLSerializer`, and `DOMParser`.
 * Also updates `body` with `document.body`.
 * @param {Window} wind
 * @returns {void}
 */


jml.setWindow = function (wind) {
  win = wind;
  doc = win.document;

  if (doc && doc.body) {
    var _doc = doc;
    exports.body = _doc.body;
  }
};
/**
 * @returns {Window}
 */


jml.getWindow = function () {
  return win;
};
/**
 * Does not run Jamilih so can be further processed.
 * @param {JamilihArray} jmlArray
 * @param {string|JamilihArray|Element} glu
 * @returns {Element}
 */


function glue(jmlArray, glu) {
  return _toConsumableArray(jmlArray).reduce(function (arr, item) {
    arr.push(item, glu);
    return arr;
  }, []).slice(0, -1);
} // istanbul ignore next


exports.body = doc && doc.body; // eslint-disable-line import/no-mutable-exports

var nbsp = "\xA0"; // Very commonly needed in templates

/* istanbul ignore else */

if (typeof process !== 'undefined') {
  var doc$1 = createHTMLDocument(); // Give more helpful errors if user attempts to use some unpolyfilled items

  var notImplemented = function notImplemented() {
    throw new Error('Not implemented!');
  };

  Element.prototype.querySelector = Element.prototype.querySelectorAll = doc$1.querySelector = doc$1.querySelectorAll = notImplemented; // Todo: Could make DOMParser and XMLSerializer optional as not really
  //   critical to most functioning

  jml.setWindow({
    document: doc$1,
    XMLSerializer:
    /*#__PURE__*/
    function () {
      function XMLSerializer() {
        _classCallCheck(this, XMLSerializer);
      }

      _createClass(XMLSerializer, [{
        key: "serializeToString",
        // eslint-disable-next-line class-methods-use-this
        value: function serializeToString(str) {
          return serialize(str);
        }
      }]);

      return XMLSerializer;
    }(),
    DOMParser:
    /*#__PURE__*/
    function () {
      function DOMParser() {
        _classCallCheck(this, DOMParser);
      }

      _createClass(DOMParser, [{
        key: "parseFromString",
        // eslint-disable-next-line class-methods-use-this
        value: function parseFromString() {
          throw new Error('Not implemented!');
        }
      }]);

      return DOMParser;
    }()
  });
}

exports.$ = $;
exports.$$ = $$;
exports.default = jml;
exports.glue = glue;
exports.jml = jml;
exports.nbsp = nbsp;
