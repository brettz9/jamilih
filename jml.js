/*globals define */
/*jslint todo:true, vars:true*/
var module, require, document, window, DOMParser, XMLSerializer;
if (!String.prototype.includes) {
  String.prototype.includes = function() {'use strict';
    return String.prototype.indexOf.apply(this, arguments) !== -1;
  };
}
if (![].includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {'use strict';
    if (this === undefined || this === null) {
      throw new TypeError('Cannot convert this value to object');
    }
    var O = Object(this);
    var len = parseInt(O.length) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1]) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) {
        return true;
      }
      k++;
    }
    return false;
  };
}

(function (undef) {
/*
Todos inspired by JsonML: https://github.com/mckamey/jsonml/blob/master/jsonml-html.js

0. Add JsonML code to handle name attribute (during element creation)
0. boolean attributes?
0. DOM attributes?
0. duplicate attributes?
0. expand with attr_map
0. equivalent of markup, to allow strings to be embedded within an object (e.g., {$value: '<div>id</div>'}); advantage over innerHTML in that it wouldn't need to work as the entire contents (nor destroy any existing content or handlers)
0. More validation?
0. JsonML DOM Level 0 listener
0. Whitespace trimming?

JsonML element-specific:
0. table appending
0. IE object-param handling
0. canHaveChildren necessary? (attempts to append to script and img)

Todos:
0. Note to self: Integrate research from other jml notes
0. Allow array as single first argument
0. Settle on whether need to use null as last argument to return array (or fragment) or other way to allow appending? Options object at end instead to indicate whether returning array, fragment, first element, etc.?
0. Allow building of generic XML (pass configuration object)
0. Allow building content internally as a string (though allowing DOM methods, etc.?)
0. Support JsonML empty string element name to represent fragments?
0. Redo browser testing of jml (including ensuring IE7 can work even if test framework can't work)
*/

    'use strict';

    var jml;

    // STATIC PROPERTIES
    var NS_HTML = 'http://www.w3.org/1999/xhtml',
        hyphenForCamelCase = /-([a-z])/g;

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
        if (!document.createStyleSheet) {
            return;
        }
        if (_getHTMLNodeName(node) === 'style') { // IE
            var ss = document.createStyleSheet(); // Create a stylesheet to actually do something useful
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
        var parentName = _getHTMLNodeName(parent),
            childName = _getHTMLNodeName(child);

        if (document.createStyleSheet) {
            if (parentName === 'script') {
                parent.text = child.nodeValue;
                return;
            }
            if (parentName === 'style') {
                parent.cssText = child.nodeValue; // This will not apply it--just make it available within the DOM cotents
                return;
            }
        }
        try {
            parent.appendChild(child); // IE9 is now ok with this
        }
        catch (e) {
            if (parentName === 'select' && childName === 'option') {
                try { // Since this is now DOM Level 4 standard behavior (and what IE7+ can handle), we try it first
                    parent.add(child);
                }
                catch (err) { // DOM Level 2 did require a second argument, so we try it too just in case the user is using an older version of Firefox, etc.
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
        if (el.addEventListener) { // W3C
            el.addEventListener(type, handler, !!capturing);
        }
        else if (el.attachEvent) { // IE
            el.attachEvent('on' + type, handler);
        }
        else { // OLDER BROWSERS (DOM0)
            el['on' + type] = handler;
        }
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
            throw 'Bad ' + type;
        }
        var elContainer = document.createElement('div');
        // Todo: No workaround for XML?
        elContainer.innerHTML = '&' + prefix + arg + ';';
        return document.createTextNode(elContainer.innerHTML);
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
            return 'object';
        }
        return undef;
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
            var ns, retStr = xmlnsObj[''] ? ' xmlns="' + xmlnsObj[''] + '"' : (n0 || ''); // Preserve XHTML
            for (ns in xmlnsObj) {
                if (xmlnsObj.hasOwnProperty(ns)) {
                    if (ns !== '') {
                        retStr += ' xmlns:' + ns + '="' + xmlnsObj[ns] + '"';
                    }
                }
            }
            return retStr;
        };
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
        var obj = {};
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
            var cn = node.childNodes[i];
            cn.parentNode.replaceChild(jml.apply(null, childNodeJML), cn);
        };
    }

    /**
    * @private
    * @static
    */
    function _appendJML (node) {
        return function (childJML) {
            node.appendChild(jml.apply(null, childJML));
        };
    }

    /**
    * @private
    * @static
    */
    function _appendJMLOrText (node) {
        return function (childJML) {
            if (typeof childJML === 'string') {
                node.appendChild(document.createTextNode(childJML));
            }
            else {
                node.appendChild(jml.apply(null, childJML));
            }
        };
    }

    /**
    * @private
    * @static
    */
    function _DOMfromJMLOrString (childNodeJML) {
        if (typeof childNodeJML === 'string') {
            return document.createTextNode(childNodeJML);
        }
        return jml.apply(null, childNodeJML);
    }

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
    jml = function jml () {
        var i, arg, procValue, p, attVal, childContent, childContentType,
            val, k, elsl, j, cl, cn, replacer = '', node,
            html, body, head, meta,
            elem = document.createDocumentFragment(), nodes = [],
            elStr, atts, ordered_arr, child = [],
            argc = arguments.length, argv = arguments;
        function _checkAtts (atts) {
            var att, p2;
            for (att in atts) {
                if (atts.hasOwnProperty(att)) {
                    attVal = atts[att];
                    switch (att) {
                        /*
                        Todos:
                        0. JSON mode to prevent event addition

                        0. {$xmlDocument: []} // document.implementation.createDocument

                        0. Accept array for any attribute with first item as prefix and second as value?
                        0. {$: ['xhtml', 'div']} for prefixed elements
                            case '$': // Element with prefix?
                                nodes[nodes.length] = elem = document.createElementNS(attVal[0], attVal[1]);
                                break;
                        */
                        case '#': // Document fragment
                            nodes[nodes.length] = jml.apply(null, [attVal]); // Nest within array to avoid confusion with elements
                            break;
                        case '$attribute': // Attribute node
                            node = attVal.length === 3 ? document.createAttributeNS(attVal[0], attVal[1]) : document.createAttribute(attVal[0]);
                            node.value = attVal[attVal.length - 1];
                            nodes[nodes.length] = node;
                            break;
                        case '$text': // Todo: Also allow as jml(['a text node']) (or should that become a fragment)?
                            node = document.createTextNode(attVal);
                            nodes[nodes.length] = node;
                            break;
                        case '$document':
                            node = document.implementation.createHTMLDocument();
                            if (attVal.childNodes) {
                                attVal.childNodes.forEach(_childrenToJML(node));
                                // Remove any extra nodes created by createHTMLDocument().
                                j = attVal.childNodes.length;
                                while (node.childNodes[j]) {
                                    cn = node.childNodes[j];
                                    cn.parentNode.removeChild(cn);
                                    j++;
                                }
                            }
                            else {
                                html = node.childNodes[1];
                                head = html.childNodes[0];
                                body = html.childNodes[1];
                                if (attVal.title || attVal.head) {
                                    meta = document.createElement('meta');
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
                        case '$DOCTYPE':
                            /*
                            // Todo:
                            if (attVal.internalSubset) {
                                node = {};
                            }
                            else
                            */
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
                            }
                            else {
                                node = document.implementation.createDocumentType(attVal.name, attVal.publicId, attVal.systemId);
                            }
                            nodes[nodes.length] = node;
                            break;
                        case '$ENTITY':
                            // Todo: Should we auto-copy another node's properties/methods (like DocumentType) excluding or changing its non-entity node values?
                            node = {
                                nodeName: attVal.name,
                                nodeValue: null,
                                publicId: attVal.publicId,
                                systemId: attVal.systemId,
                                notationName: attVal.notationName,
                                nodeType: 6,
                                childNodes: attVal.childNodes.map(_DOMfromJMLOrString)
                            };
                            break;
                        case '$NOTATION':
                            // Todo: We could add further properties/methods, but unlikely to be used as is.
                            node = {nodeName: attVal[0], publicID: attVal[1], systemID: attVal[2], nodeValue: null, nodeType: 12};
                            nodes[nodes.length] = node;
                            break;
                        case '$on': // Events
                            for (p2 in attVal) {
                                if (attVal.hasOwnProperty(p2)) {
                                    val = attVal[p2];
                                    if (typeof val === 'function') {
                                        val = [val, false];
                                    }
                                    _addEvent(elem, p2, val[0], val[1]); // element, event name, handler, capturing
                                }
                            }
                            break;
                        case 'className': case 'class':
                            elem.className = attVal;
                            break;
                        case 'dataset':
                            for (p2 in attVal) { // Map can be keyed with hyphenated or camel-cased properties
                                if (attVal.hasOwnProperty(p2)) {
                                    elem.dataset[p2.replace(hyphenForCamelCase, _upperCase)] = attVal[p2];
                                }
                            }
                            break;
                        // Todo: Disable this by default unless configuration explicitly allows (for security)
                        case 'innerHTML':
                            elem.innerHTML = attVal;
                            break;
                        case 'selected' : case 'checked': case 'value': case 'defaultValue':
                            elem[att] = attVal;
                            break;
                        case 'htmlFor': case 'for':
                            if (elStr === 'label') {
                                elem.htmlFor = attVal;
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
                                if (attVal && typeof attVal === 'object') {
                                    for (p2 in attVal) {
                                        if (attVal.hasOwnProperty(p2)) {
                                            // Todo: Handle aggregate properties like "border"
                                            if (p2 === 'float') {
                                                elem.style.cssFloat = attVal[p2];
                                                elem.style.styleFloat = attVal[p2]; // Harmless though we could make conditional on older IE instead
                                            }
                                            else {
                                                elem.style[p2.replace(hyphenForCamelCase, _upperCase)] = attVal[p2];
                                            }
                                        }
                                    }
                                }
                                else if (elem.style.cssText !== undef) {
                                    elem.style.cssText += attVal;
                                }
                                else { // Opera
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
        for (i = 0; i < argc; i++) {
            arg = argv[i];
            switch (_getType(arg)) {
                case 'null': // null always indicates a place-holder (only needed for last argument if want array returned)
                    if (i === argc - 1) {
                        _applyAnyStylesheet(nodes[0]); // We have to execute any stylesheets even if not appending or otherwise IE will never apply them
                        // Todo: Fix to allow application of stylesheets of style tags within fragments?
                        return nodes.length <= 1 ? nodes[0] : nodes.reduce(_fragReducer, document.createDocumentFragment()); // nodes;
                    }
                    break;
                case 'string': // Strings indicate elements
                    switch (arg) {
                        case '!':
                            nodes[nodes.length] = document.createComment(argv[++i]);
                            break;
                        case '?':
                            arg = argv[++i];
                            procValue = val = argv[++i];
                            if (typeof val === 'object') {
                                procValue = [];
                                for (p in val) {
                                    if (val.hasOwnProperty(p)) {
                                        procValue.push(p + '=' + '"' + val[p].replace(/"/g, '\\"') + '"');
                                    }
                                }
                                procValue = procValue.join(' ');
                            }
                            // Firefox allows instructions with ">" in this method, but not if placed directly!
                            try {
                                nodes[nodes.length] = document.createProcessingInstruction(arg, procValue);
                            }
                            catch(e) { // Getting NotSupportedError in IE, so we try to imitate a processing instruction with a comment
                                // innerHTML didn't work
                                    // var elContainer = document.createElement('div');
                                    // elContainer.innerHTML = '<?' + document.createTextNode(arg + ' ' + procValue).nodeValue + '?>';
                                    // nodes[nodes.length] = elContainer.innerHTML;
                                // Todo: any other way to resolve? Just use XML?
                                nodes[nodes.length] = document.createComment('?' + arg + ' ' + procValue + '?');
                            }
                            break;
                        // Browsers don't support document.createEntityReference, so we just use this as a convenience
                        case '&':
                            nodes[nodes.length] = _createSafeReference('entity', '', argv[++i]);
                            break;
                        case '#': // // Decimal character reference - ['#', '01234'] // &#01234; // probably easier to use JavaScript Unicode escapes
                            nodes[nodes.length] = _createSafeReference('decimal', arg, String(argv[++i]));
                            break;
                        case '#x': // Hex character reference - ['#x', '123a'] // &#x123a; // probably easier to use JavaScript Unicode escapes
                            nodes[nodes.length] = _createSafeReference('hexadecimal', arg, argv[++i]);
                            break;
                        case '![':
                            // '![', ['escaped <&> text'] // <![CDATA[escaped <&> text]]>
                            // CDATA valid in XML only, so we'll just treat as text for mutual compatibility
                            // Todo: config (or detection via some kind of document.documentType property?) of whether in XML
                            try {
                                nodes[nodes.length] = document.createCDATASection(argv[++i]);
                            }
                            catch (e2) {
                                nodes[nodes.length] = document.createTextNode(argv[i]); // i already incremented
                            }
                            break;
                        case '':
                            nodes[nodes.length] = document.createDocumentFragment();
                            break;
                        default: // An element
                            elStr = arg;
                            if (document.createElementNS) {
                                elem = document.createElementNS(NS_HTML, elStr);
                            }
                            // Todo: Fix this to depend on XML/config, not availability of methods
                            else {
                                elem = document.createElement(elStr);
                            }
                            nodes[nodes.length] = elem; // Add to parent
                            break;
                    }
                    break;
                case 'object': // Non-DOM-element objects indicate attribute-value pairs
                    atts = arg;

                    if (atts.xmlns !== undef) { // We handle this here, as otherwise may lose events, etc.
                        // As namespace of element already set as XHTML, we need to change the namespace
                        // elem.setAttribute('xmlns', atts.xmlns); // Doesn't work
                        // Can't set namespaceURI dynamically, renameNode() is not supported, and setAttribute() doesn't work to change the namespace, so we resort to this hack
                        if (typeof atts.xmlns === 'object') {
                            replacer = _replaceDefiner(atts.xmlns);
                        }
                        else {
                            replacer = ' xmlns="' + atts.xmlns + '"';
                        }
//try {
                        // Also fix DOMParser to work with text/html
                        elem = nodes[nodes.length - 1] = new DOMParser().parseFromString(
                            new XMLSerializer().serializeToString(elem).
                                // Mozilla adds XHTML namespace
                                replace(' xmlns="' + NS_HTML + '"', replacer),
                            'application/xml'
                        ).documentElement;
//}catch(e) {alert(elem.outerHTML);throw e;}
                    }
                    ordered_arr = atts.$a ? atts.$a.map(_copyOrderedAtts) : [atts];
                    ordered_arr.forEach(_checkAtts);
                    break;
                case 'element':
                    /*
                    1) Last element always the parent (put null if don't want parent and want to return array) unless only atts and children (no other elements)
                    2) Individual elements (DOM elements or sequences of string[/object/array]) get added to parent first-in, first-added
                    */
                    if (i === 0) { // Allow wrapping of element
                        elem = arg;
                    }
                    if (i === argc - 1 || (i === argc - 2 && argv[i+1] === null)) { // parent
                        for (k = 0, elsl = nodes.length; k < elsl; k++) {
                            _appendNode(arg, nodes[k]);
                        }
                        // Todo: Apply stylesheets if any style tags were added elsewhere besides the first element?
                        _applyAnyStylesheet(nodes[0]); // We have to execute any stylesheets even if not appending or otherwise IE will never apply them
                    }
                    else {
                        nodes[nodes.length] = arg;
                    }
                    break;
                case 'array': // Arrays or arrays of arrays indicate child nodes
                    child = arg;
                    for (j = 0, cl = child.length; j < cl; j++) { // Go through children array container to handle elements
                        childContent = child[j];
                        childContentType = typeof childContent;
                        if (childContent === undef) {
                            throw String('Parent array:' + JSON.stringify(argv) + '; child: ' + child + '; index:' + j);
                        }
                        switch (childContentType) {
                            // Todo: determine whether null or function should have special handling or be converted to text
                            case 'string': case 'number': case 'boolean':
                                _appendNode(elem, document.createTextNode(childContent));
                                break;
                            default:
                                if (Array.isArray(childContent)) { // Arrays representing child elements
                                    _appendNode(elem, jml.apply(null, childContent));
                                }
                                else if (childContent['#']) { // Fragment
                                    _appendNode(elem, jml.apply(null, [childContent['#']]));
                                }
                                else { // Single DOM element children
                                    _appendNode(elem, childContent);
                                }
                                break;
                        }
                    }
                    break;
            }
        }
        return nodes[0] || elem;
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
        
        var prohibitHTMLOnly = true;

        var ret = [], parent = ret, parentIdx = 0;

        function invalidStateError () { // These are probably only necessary if working with text/html
            function DOMException () {return this;}
            if (prohibitHTMLOnly) {
                // INVALID_STATE_ERR per section 9.3 XHTML 5: http://www.w3.org/TR/html5/the-xhtml-syntax.html
                // Since we can't instantiate without this (at least in Mozilla), this mimicks at least (good idea?)
                var e = new DOMException();
                e.code = 11;
                throw e;
            }
        }

        function addExternalID (obj, node) {
            if (node.systemId.includes('"') && node.systemId.includes("'")) {
                invalidStateError();
            }
            var publicId = node.publicId, systemId = node.systemId;
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
            //namespaces = clone(namespaces) || {}; // Ensure we're working with a copy, so different levels in the hierarchy can treat it differently

            /*
            if ((node.prefix && node.prefix.includes(':')) || (node.localName && node.localName.includes(':'))) {
                invalidStateError();
            }
            */

            var type = node.nodeType;
            namespaces = Object.assign({}, namespaces);

            var xmlChars = /([\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD]|[\uD800-\uDBFF][\uDC00-\uDFFF])*$/;
            if ([2, 3, 4, 7, 8].includes(type) && !xmlChars.test(node.nodeValue)) {
                invalidStateError();
            }

            var children, tmpParent, tmpParentIdx, start;
            function setTemp() {
                tmpParent = parent;
                tmpParentIdx = parentIdx;
            }
            function resetTemp() {
                parent = tmpParent;
                parentIdx = tmpParentIdx;
                parentIdx++; // Increment index in parent container of this element
            }
            switch (type) {
                case 1: // ELEMENT
                    setTemp();
                    var nodeName = node.nodeName.toLowerCase(); // Todo: for XML, should not lower-case

                    setChildren(); // Build child array since elements are, except at the top level, encapsulated in arrays
                    set(nodeName);
                    
                    start = {};
                    var hasNamespaceDeclaration = false;
                    
                    if (namespaces[node.prefix || ''] !== node.namespaceURI) {
                        namespaces[node.prefix || ''] = node.namespaceURI;
                        if (node.prefix) {
                            start['xmlns:' + node.prefix] = node.namespaceURI;
                        }
                        else if (node.namespaceURI) {
                            start.xmlns = node.namespaceURI;
                        }
                        hasNamespaceDeclaration = true;
                    }
                    if (node.attributes.length) {
                        set(Array.from(node.attributes).reduce(function (obj, att) {
                            obj[att.name] = att.value; // Attr.nodeName and Attr.nodeValue are deprecated as of DOM4 as Attr no longer inherits from Node, so we can safely use name and value
                            return obj;
                        }, start));
                    }
                    else if (hasNamespaceDeclaration) {
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
                    if (node.nodeValue.includes(']]'+'>')) {
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
                    }
                    else {
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
                    var docObj = {$document: {childNodes: []}};
                    
                    if (config.xmlDeclaration) {
                        docObj.$document.xmlDeclaration = {version: document.xmlVersion, encoding: document.xmlEncoding, standAlone: document.xmlStandalone};
                    }
                    
                    set(docObj); // document.implementation.createHTMLDocument
                    
                    // Set position to fragment's array children
                    setObj('$document', 'childNodes');
                    
                    children = node.childNodes;
                    if (!children.length) {
                        invalidStateError();
                    }
                    // set({$xmlDocument: []}); // document.implementation.createDocument // Todo: use this conditionally

                    Array.from(children).forEach(function (childNode) { // Can't just do documentElement as there may be doctype, comments, etc.
                        // No need for setChildren, as we have already built the container array
                        parseDOM(childNode, namespaces);
                    });
                    resetTemp();
                    break;
                case 10: // DOCUMENT TYPE
                    setTemp();

                    // Can create directly by document.implementation.createDocumentType
                    start = {$DOCTYPE: {name: node.name}};
                    if (node.internalSubset) {
                        start.internalSubset = node.internalSubset;
                    }
                    var pubIdChar = /^(\u0020|\u000D|\u000A|[a-zA-Z0-9]|[\-'()+,.\/:=?;!*#@$_%])*$/;
                    if (!pubIdChar.test(node.publicId)) {
                        invalidStateError();
                    }
                    addExternalID(start.$DOCTYPE, node);
                    // Fit in internal subset along with entities?: probably don't need as these would only differ if from DTD, and we're not rebuilding the DTD
                    set(start); // Auto-generate the internalSubset instead? Avoid entities/notations in favor of array to preserve order?

                    var entities = node.entities; // Currently deprecated
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

                    var notations = node.notations; // Currently deprecated
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
                    throw 'Not an XML type';
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
    jml.toDOM = function () { // Alias for jml()
        return jml.apply(null, arguments);
    };
    jml.toHTML = function () { // Todo: Replace this with version of jml() that directly builds a string
        var ret = jml.apply(null, arguments);
        return ret.outerHTML;
    };
    jml.toDOMString = function () { // Alias for jml.toHTML for parity with jml.toJMLString
        return jml.toHTML.apply(jml, arguments);
    };
    jml.toXML = function () {
        var ret = jml.apply(null, arguments);
        return new XMLSerializer().serializeToString(ret);
    };
    jml.toXMLDOMString = function () { // Alias for jml.toXML for parity with jml.toJMLString
        return jml.toXML.apply(jml, arguments);
    };

    // EXPORTS
    if (module !== undef) {
        require('array.from');
        Object.assign = require('object-assign');
        document = require('jsdom').jsdom('');
        window = document.parentWindow;
        DOMParser = require('xmldom').DOMParser;
        XMLSerializer = require('xmldom').XMLSerializer;
        module.exports = jml;
    }
    else if (typeof define === 'function' && define.amd) {
        define(function () {
            return jml;
        });
    }
    else {
        window.jml = jml;
    }

}());
