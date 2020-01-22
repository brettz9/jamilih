/* globals performance */

// The `performance` global is optional

/**
 * @todo We could use `import generateUUID from 'uuid/v4';` (but it needs
 *   crypto library, etc.; `rollup-plugin-node-builtins` doesn't recommend
 *   using its own version and though there is <https://www.npmjs.com/package/crypto-browserify>,
 *   it may be troublesome to bundle and not strongly needed)
 * @returns {string}
 */
function generateUUID () { //  Adapted from original: public domain/MIT: http://stackoverflow.com/a/8809472/271577
  /* istanbul ignore next */
  let d = new Date().getTime() +
  // use high-precision timer if available
  /* eslint-disable compat/compat */
  (typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    /* eslint-enable compat/compat */
    : 0);

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/gu, function (c) {
    /* eslint-disable no-bitwise */
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    /* eslint-enable no-bitwise */
  });
}

const name = '$_interpolator';

/**
* @typedef {JamilihPlugin} JamilihPluginWithArgs
* @property {any[]} args
*/
/**
 * Use with `String.raw(elementsAsString.split(uniqueID), ...args)`.
 * @returns {JamilihPlugin}
 */
function getInterpolator () {
  const args = [];
  const uuid = generateUUID();
  return {
    args,
    dynamic (val) {
      return {
        [name]: val
      };
    },
    plugin: {
      name,
      set ({element, attribute: {value}, opts}) {
        // Todo: Add unique ID on which to later split
        // Todo: Support in element name or fragment position
        //  (with ability to convert whole set of arguments?); and
        //  ability to alter all attributes
        switch (opts.$state) {
        case 'attributeValue':
          args.push(value[this.name]);
          return uuid;
        /*
        case 'children': case 'fragmentChildren':
          args.push(value[this.name]);
          return {$text: uuid};
        case 'root':
        case 'element':
        case 'fragment':
        */
        /* istanbul ignore next */
        default:
          throw new Error(
            `Interpolator plugin not expected in ${opts.$state} position`
          );
        }
      }
    }
  };
}

export default getInterpolator;
