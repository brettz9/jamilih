/* eslint-disable no-console */
/* globals assert */

const nbsp = '\u00A0';
const write = (...msgs) => {
  if (assert) {
    assert(...msgs);
    return;
  }
  if (typeof module === 'undefined') {
    document.body.append(
      ...msgs,
      ...Array.from({length: 2}, () => document.createElement('br'))
    );
  } else {
    console.log(...msgs);
  }
};
const skip = (...msgs) => { // Todo: Could track and report on test count
  return write(...msgs);
};
const xmlAssert = (ok, msg) => {
  if (!ok) {
    const err = new Error('Stack');
    console.log('Assertion not ok:', err);
  }
  write(Boolean(ok), ` ${nbsp + msg}`);
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
  write(item1 === item2, ` ${nbsp}` + msg);
};
const matchesXMLStringWithinElement = (element, item2, msg) => {
  const docFrag = document.createDocumentFragment();
  for (let i = 0; i < element.childNodes.length; i++) {
    docFrag.append(element.childNodes[i].cloneNode(true));
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

export {write, skip, xmlAssert, matches, matchesXMLStringWithinElement,
  matchesXMLStringOnElement, matchesXMLString};
