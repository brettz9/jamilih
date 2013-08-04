// Todo: add with require shim plugin, and modularize es6-collections further?

/**
 * @requires shim: es6-collections (for Map)
*/

/**
 * Add dataset support to elements
 * No globals, no overriding prototype with non-standard methods,
 *   handles CamelCase properly, attempts to use standard
 *   Object.defineProperty() (and Function bind()) methods,
 *   falls back to native implementation when existing
 * Inspired by http://code.eligrey.com/html5/dataset/
 *   (via {@link https://github.com/adalgiso/html5-dataset/blob/master/html5-dataset.js})
 * Depends on Function.bind and Object.defineProperty/Object.getOwnPropertyDescriptor (shims below)
 * Licensed under the X11/MIT License
*/

// Inspired by https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind#Compatibility
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        'use strict';
        if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            FNOP = function () {},
            fBound = function () {
                return fToBind.apply(
                    this instanceof FNOP && oThis ? this : oThis,
                   aArgs.concat(Array.prototype.slice.call(arguments))
               );
            };

        FNOP.prototype = this.prototype;
        fBound.prototype = new FNOP();

        return fBound;
    };
}

/*
 * Xccessors Standard: Cross-browser ECMAScript 5 accessors
 * http://purl.eligrey.com/github/Xccessors
 *
 * 2010-06-21
 *
 * By Eli Grey, http://eligrey.com
 *
 * A shim that partially implements Object.defineProperty,
 * Object.getOwnPropertyDescriptor, and Object.defineProperties in browsers that have
 * legacy __(define|lookup)[GS]etter__ support.
 *
 * Licensed under the X11/MIT License
 *   See LICENSE.md
*/

// Removed a few JSLint options as Notepad++ JSLint validator complaining and
//   made comply with JSLint; also moved 'use strict' inside function
/*jslint white: true, undef: true, plusplus: true,
  bitwise: true, regexp: true, newcap: true, maxlen: 90 */

/*! @source http://purl.eligrey.com/github/Xccessors/blob/master/xccessors-standard.js*/

(function () {
    'use strict';
    var ObjectProto = Object.prototype,
    defineGetter = ObjectProto.__defineGetter__,
    defineSetter = ObjectProto.__defineSetter__,
    lookupGetter = ObjectProto.__lookupGetter__,
    lookupSetter = ObjectProto.__lookupSetter__,
    hasOwnProp = ObjectProto.hasOwnProperty;

    if (defineGetter && defineSetter && lookupGetter && lookupSetter) {

        if (!Object.defineProperty) {
            Object.defineProperty = function (obj, prop, descriptor) {
                if (arguments.length < 3) { // all arguments required
                    throw new TypeError('Arguments not optional');
                }

                prop += ''; // convert prop to string

                if (hasOwnProp.call(descriptor, 'value')) {
                    if (!lookupGetter.call(obj, prop) && !lookupSetter.call(obj, prop)) {
                        // data property defined and no pre-existing accessors
                        obj[prop] = descriptor.value;
                    }

                    if ((hasOwnProp.call(descriptor, 'get') ||
                         hasOwnProp.call(descriptor, 'set')))
                    {
                        // descriptor has a value prop but accessor already exists
                        throw new TypeError('Cannot specify an accessor and a value');
                    }
                }

                // can't switch off these features in ECMAScript 3
                // so throw a TypeError if any are false
                if (!(descriptor.writable && descriptor.enumerable &&
                    descriptor.configurable))
                {
                    throw new TypeError(
                        'This implementation of Object.defineProperty does not support' +
                        ' false for configurable, enumerable, or writable.'
                    );
                }

                if (descriptor.get) {
                    defineGetter.call(obj, prop, descriptor.get);
                }
                if (descriptor.set) {
                    defineSetter.call(obj, prop, descriptor.set);
                }

                return obj;
            };
        }

        if (!Object.getOwnPropertyDescriptor) {
            Object.getOwnPropertyDescriptor = function (obj, prop) {
                if (arguments.length < 2) { // all arguments required
                    throw new TypeError('Arguments not optional.');
                }

                prop += ''; // convert prop to string

                var descriptor = {
                    configurable: true,
                    enumerable  : true,
                    writable    : true
                },
                getter = lookupGetter.call(obj, prop),
                setter = lookupSetter.call(obj, prop);

                if (!hasOwnProp.call(obj, prop)) {
                    // property doesn't exist or is inherited
                    return descriptor;
                }
                if (!getter && !setter) { // not an accessor so return prop
                    descriptor.value = obj[prop];
                    return descriptor;
                }

                // there is an accessor, remove descriptor.writable;
                // populate descriptor.get and descriptor.set (IE's behavior)
                delete descriptor.writable;
                descriptor.get = descriptor.set = undefined;

                if (getter) {
                    descriptor.get = getter;
                }
                if (setter) {
                    descriptor.set = setter;
                }

                return descriptor;
            };
        }

        if (!Object.defineProperties) {
            Object.defineProperties = function (obj, props) {
                var prop;
                for (prop in props) {
                    if (hasOwnProp.call(props, prop)) {
                        Object.defineProperty(obj, prop, props[prop]);
                    }
                }
            };
        }
    }
}());

// Begin dataset code

if (!document.documentElement.dataset &&
         // FF is empty while IE gives empty object
        (!Object.getOwnPropertyDescriptor(Element.prototype, 'dataset')  ||
        !Object.getOwnPropertyDescriptor(Element.prototype, 'dataset').get)
    ) {
    var HTML5_Element_Map = new Map(),
        NAME_START_CHAR = '[_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u0200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\ud800-\udbff][\udc00-\udfff]'; // The last two ranges are for surrogates that comprise #x10000-#xEFFFF; // colon and A-Z removed for sake of dataset
        NAME_END_CHAR = '[.0-9\u00B7\u0300-\u036F\u203F-\u2040-]';
        dataAttributeRegexp = new RegExp('^data-' +
            '(?:' + NAME_START_CHAR + ')(?:' + NAME_START_CHAR + '|' + NAME_END_CHAR + ')*' + // XML Name minus ':' and A-Z
            '$'
        ),
        propDescriptor = {
            enumerable: true,
            get: function () {
                'use strict';
                var i,
                    that = this,
                    HTML5_DOMStringMap,
                    attrVal, attrName, propName,
                    attribute,
                    attributes = this.attributes,
                    attsLength = attributes.length,
                    toUpperCase = function (n0) {
                        return n0.charAt(1).toUpperCase();
                    },
                    getter = function () {
                        return this;
                    },
                    setter = function (attrName, value) {
                        return (typeof value !== 'undefined') ?
                            this.setAttribute(attrName, value) :
                            this.removeAttribute(attrName);
                    },
                    defineProperty = function (attrName, attrVal) {
                    // Todo: validate?
                        // Change to CamelCase
                        var propName = attrName.slice(5).replace(/-[a-z]?/g, toUpperCase);

if (attrName === 'abcDefGh') {
alert('a:'+attrVal + propName)
}

                        try {
                            Object.defineProperty(HTML5_DOMStringMap, propName, {
                                enumerable: that.enumerable,
                                get: getter.bind(attrVal || ''),
                                set: setter.bind(that, attrName)
                            });
                        }
                        catch (e2) { // if accessors are not working
                            HTML5_DOMStringMap[propName] = attrVal;
                        }
                    };

                if (HTML5_Element_Map.has(this)) {
                    HTML5_DOMStringMap = HTML5_Element_Map.get(this);
                    var o = 0;
                    for (attrName in HTML5_DOMStringMap) {
                    o++;
                    if (attrName === 'jklMnoPq') {
                    alert(attrName);
                    }
                        attrVal = HTML5_DOMStringMap[attrName];
                        defineProperty(attrName, attrVal);
                    }
//                    alert(o);
                }
                else {
                    try { // Simulate DOMStringMap w/accessor support
                        // Test setting accessor on normal object
                        ({}).__defineGetter__('test', function () {});
                        HTML5_DOMStringMap = {};
                    }
                    catch (e1) { // Use a DOM object for IE8
                        HTML5_DOMStringMap = document.createElement(''); // createComment also works
                    }
                }
                // alert(HTML5_DOMStringMap['abcDefGh'] + '::' + HTML5_DOMStringMap['jklMnoPq']);

                for (i = 0; i < attsLength; i++) {
                    attribute = attributes[i];
                    attrName = attribute && attribute.name;
                    if (attrName &&
                        dataAttributeRegexp.test(attrName)) {
                        attrVal = attribute.value;
                        defineProperty(attrName, attrVal);
                    }
                }
                HTML5_Element_Map.set(this, HTML5_DOMStringMap);
                return HTML5_DOMStringMap;
            }
        };
    try {
        // FF enumerates over element's dataset, but not
        //   Element.prototype.dataset; IE9 iterates over both
        Object.defineProperty(Element.prototype, 'dataset', propDescriptor);
    } catch (e) {
        propDescriptor.enumerable = false; // IE8 does not allow setting to true
        Object.defineProperty(Element.prototype, 'dataset', propDescriptor);
    }
}
