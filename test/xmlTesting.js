/* eslint-disable no-console */

import {assert} from 'chai';

const nbsp = '\u00A0';

/**
 * @param {ArbitraryValue} val
 * @param {string[]} msgs
 * @returns {void}
 */
const write = (val, ...msgs) => {
  if (assert) {
    assert(val, ...msgs);
    return;
  }
  if (typeof module === 'undefined') {
    document.body.append(
      val,
      ...msgs,
      ...Array.from({length: 2}, () => document.createElement('br'))
    );
  } else {
    console.log(val, ...msgs);
  }
};

/**
 * @param {ArbitraryValue} val
 * @param {string[]} msgs
 * @returns {void}
 */
const skip = (val, ...msgs) => { // Todo: Could track and report on test count
  return write(val, ...msgs);
};

/**
 * @param {ArbitraryValue} ok
 * @param {string} msg
 * @returns {void}
 */
const xmlAssert = (ok, msg) => {
  if (!ok) {
    const err = new Error('Stack');
    console.log('Assertion not ok:', err);
  }
  write(Boolean(ok), ` ${nbsp + msg}`);
};

/**
 * @typedef {any} ArbitraryValue
 */

/**
 * @param {ArbitraryValue} item1
 * @param {ArbitraryValue} item2
 * @param {string} [msg]
 * @returns {void}
 */
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

/**
 * @param {Element|DocumentFragment} element
 * @param {string} item2
 * @param {string} msg
 * @returns {void}
 */
const matchesXMLStringWithinElement = (element, item2, msg) => {
  const docFrag = document.createDocumentFragment();
  // eslint-disable-next-line sonarjs/prefer-for-of -- Not an array
  for (let i = 0; i < element.childNodes.length; i++) {
    docFrag.append(element.childNodes[i].cloneNode(true));
  }
  matchesXMLString(docFrag, item2, msg);
};

/**
 * @param {Element} element
 * @param {string} item2
 * @param {string} msg
 * @returns {void}
 */
const matchesXMLStringOnElement = (element, item2, msg) => {
  // eslint-disable-next-line unicorn/prefer-at -- No `at` method
  const lastInsert = element.childNodes[element.childNodes.length - 1];
  matchesXMLString(lastInsert, item2, msg);
};

/**
 * @param {Node} item1
 * @param {string} item2
 * @param {string} [msg]
 * @returns {void}
 */
const matchesXMLString = (item1, item2, msg) => {
  const ser = new XMLSerializer();
  const str = ser.serializeToString(item1);
  matches(str, item2, msg);
};

export {write, skip, xmlAssert, matches, matchesXMLStringWithinElement,
  matchesXMLStringOnElement, matchesXMLString};
