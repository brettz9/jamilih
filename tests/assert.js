/* globals exports, XMLSerializer */
(function () {
'use strict';

const assert = {
    matches: function (item1, item2) {
        if (!item2) { // For convenience in debugging
            alert(item1);
        }
        if (item1 !== item2) {
            alert(item1 + '\n\n' + item2);
        }
        document.write((item1 === item2) + '<br />\n');
    },
    matchesXMLStringWithinElement: function (element, item2) {
        const docFrag = document.createDocumentFragment();
        for (let i = 0; i < element.childNodes.length; i++) {
            docFrag.appendChild(element.childNodes[i].cloneNode(true));
        }
        this.matchesXMLString(docFrag, item2);
    },
    matchesXMLStringOnElement: function (element, item2) {
        const lastInsert = element.childNodes[element.childNodes.length - 1];
        this.matchesXMLString(lastInsert, item2);
    },
    matchesXMLString: function (item1, item2) {
        const ser = new XMLSerializer();
        ser.$overrideNative = true;
        item1 = ser.serializeToString(item1);
        this.matches(item1, item2);
    }
};

// EXPORTS
(typeof exports === 'undefined' ? window : exports).assert = assert;
}());
