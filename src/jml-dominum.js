/* eslint-env node */
import {createHTMLDocument, Element as Elem} from 'dominum';
import xmlserializer from 'w3c-xmlserializer';

import {jml} from './jml.js';

// For $ and $$, we'd need query-selector of such (which itself needs
//   `compareDocumentPosition`, as in https://github.com/jsdom/js-symbol-tree#symboltreecomparetreepositionleft-right--number , and traversal)
//   so it is not worth it at this point, but we expose and wrap with
//   error throwing function below so consuemrs can get message
export {$, $$, jml, nbsp, body, glue} from './jml.js';

// Expose dominum classes for overriding/use
export {
  createHTMLDocument,
  Document, HTMLDocument,
  DOMException,
  NodeList, setNodeListWritingPermission,
  NamedNodeMap, setNamedNodeMapWritingPermission,
  Element, HTMLElement, Attr, Node, DocumentFragment,
  ProcessingInstruction, CharacterData, Comment, Text,
  CDATASection, DocumentType, XMLDocument,
  ParentNode, ChildNode
} from 'dominum';

/* istanbul ignore else */
if (typeof process !== 'undefined') {
  const doc = createHTMLDocument();

  // Give more helpful errors if user attempts to use some unpolyfilled items
  const notImplemented = () => {
    throw new Error('Not implemented!');
  };
  Elem.prototype.querySelector = Elem.prototype.querySelectorAll =
    doc.querySelector = doc.querySelectorAll = notImplemented;

  // Todo: Could make DOMParser and XMLSerializer optional as not really
  //   critical to most functioning
  jml.setWindow({
    document: doc,
    XMLSerializer: class {
      // eslint-disable-next-line class-methods-use-this
      serializeToString (str) {
        return xmlserializer(str);
      }
    },
    DOMParser: class {
      // eslint-disable-next-line class-methods-use-this
      parseFromString () {
        throw new Error('Not implemented!');
      }
    }
  });
}

export default jml;
