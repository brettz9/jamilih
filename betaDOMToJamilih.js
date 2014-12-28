/*jslint todo:true, vars:true */
/**
* @requires polyfill: Element.prototype.getAttribute (in {@link https://github.com/brettz9/jamilih/blob/master/polyfills/Element.prototype.getAttribute.js})
* to ensure style property is harmonized for older browsers
*/
function domToJamilih (node) {
    'use strict';
    var contextJML, hasChildren;
    function iterateAnyChildren (treeWalker, cb, noChildrenCb) {
        var parent = treeWalker.currentNode,
            referenceNode = treeWalker.firstChild();
        if (!referenceNode) {
            if (noChildrenCb) {
                noChildrenCb(parent);
            }
            return;
        }
        do {
            cb(referenceNode, parent);
            iterateAnyChildren(treeWalker, cb, noChildrenCb);
            referenceNode = treeWalker.nextSibling();
        } while (referenceNode);
        treeWalker.parentNode(); // Return it back to position as we descended into child nodes
    }
    function buildJMLForNode (node) {
        switch (node.nodeType) {
            case 1: // ELEMENT
                contextJML = [node.nodeName.toLowerCase()];
                if (node.attributes.length) {
                    contextJML[1] = [].slice.call(node.attributes).reduce(function (obj, att) {
                        obj[att.name] = att.value; // Attr.nodeName and Attr.nodeValue are deprecated as of DOM4 as Attr no longer inherits from Node, so we can safely use name and value
                        return obj;
                    }, {});
                }
                hasChildren = false;
                return;
            case 2: // ATTRIBUTE (should only get here if passing in an attribute node)
                return {$attribute: [node.nodeName, node.nodeValue]}; // Todo: add attribute node support to Jamilih
            case 3: // TEXT
                if (!hasChildren) {
                    contextJML.push([]);
                    hasChildren = true;
                }
                contextJML[contextJML.length - 1].push(node.nodeValue);
                return;
            case 4: // CDATA
                return ['![', node.nodeValue];
            case 5: // ENTITY REFERENCE (probably not used in browsers since already resolved)
                return ['&', node.nodeName];
            case 6: // ENTITY (would need to pass in directly)
                return; // todo
            case 7: // PROCESSING INSTRUCTION
                return ['?', node.target, node.nodeValue]; // Todo: Could give option to attempt to convert value back into object if has pseudo-attributes
            case 8: // COMMENT
                return ['!', node.nodeValue];
            case 9: // DOCUMENT
                return {$document: []}; // document.implementation.createHTMLDocument
                // return {$xmlDocument: []} // document.implementation.createDocument // Todo: use this conditonally
            case 10: // DOCUMENT TYPE
                // Can create directly by document.implementation.createDocumentType
                return; // {$documentType: {name: node.name, entities: [], notations: [], publicId: '', systemId: '', internalSubset: ''}}; // Auto-generate the internalSubset instead? Avoid entities/notations in favor of array to preserve order?
            case 11: // DOCUMENT FRAGMENT
                return {'#': []};
            case 12: // NOTATION (would need to be passed in directly)
                return {$notation: [node.nodeName, '', '']}; // 'publicId', 'systemId'
            default:
                throw 'Not an XML type';
        }
    }

    var jml = buildJMLForNode(node),
        treeWalker = document.createTreeWalker(node,
            4294967295, // NodeFilter.SHOW_ALL,
            null, // Note: IE won't accept an acceptNode object here though it will accept a function or null
            false // IE 10 insisting on this entityExpansion argument though no longer required in DOM4
        );

    iterateAnyChildren(treeWalker, function (referenceNode, parent) {
        parent;
        buildJMLForNode(referenceNode);
    });
 // todo: need to add to contextJML
    alert(jml);
}

domToJamilih(document.body);
