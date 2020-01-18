/* eslint-env node */
import {createHTMLDocument} from 'dominum';
import xmlserializer from 'w3c-xmlserializer';
import {DOMParser as domparser} from 'xmldom';

import {jml} from './jml.js';

// For $ and $$, we'd need query-selector of such (which itself needs
//   `compareDocumentPosition`, as in https://github.com/jsdom/js-symbol-tree#symboltreecomparetreepositionleft-right--number , and traversal)
//   so it is not worth it at this point
export {$, $$, jml, nbsp, body, glue} from './jml.js';

/* istanbul ignore else */
if (typeof process !== 'undefined') {
  const doc = createHTMLDocument();

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
    DOMParser: domparser
  });
}

export default jml;
