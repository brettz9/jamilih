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

export {matches, matchesXMLStringWithinElement, matchesXMLStringOnElement, matchesXMLString};
