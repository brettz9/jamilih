(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Interpolator = {}));
})(this, (function (exports) { 'use strict';

  /* globals performance */

  // The `performance` global is optional

  /**
   * @typedef {object} JamilihPluginWithArgs
   * @property {any[]} args
   * @property {string} uuid
   * @property {() => {[key: string]: string}} dynamic
   * @property {import('../src/jml.js').JamilihPlugin} plugin
   */

  /**
   * @todo We could use `import generateUUID from 'uuid/v4';` (but it needs
   *   crypto library, etc.; `rollup-plugin-node-builtins` doesn't recommend
   *   using its own version and though there is <https://www.npmjs.com/package/crypto-browserify>,
   *   it may be troublesome to bundle and not strongly needed)
   * @returns {string}
   */
  function generateUUID() {
    //  Adapted from original: public domain/MIT: http://stackoverflow.com/a/8809472/271577
    let d = Date.now() + (
    // use high-precision timer if available
    /* eslint-disable compat/compat */
    /* c8 ignore next 4 */
    typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now()
    /* eslint-enable compat/compat */ : 0);
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/gu, function (c) {
      /* eslint-disable no-bitwise */
      const r = Math.trunc((d + Math.random() * 16) % 16);
      d = Math.floor(d / 16);
      return (c === 'x' ? r : r & 0x3 | 0x8).toString(16);
      /* eslint-enable no-bitwise */
    });
  }

  const name = '$_interpolator';

  /**
   * Use with `String.raw({raw: elementsAsString.split(uniqueID)}, ...args)`.
   * @returns {{
   *   args: string[],
   *   uuid: string,
   *   dynamic: (val: string) => {$_interpolator: string},
   *   plugin: import('../src/jml.js').JamilihPlugin
   * }}
   */
  function getInterpolator() {
    /**
     * @type {string[]}
     */
    const args = [];
    const uuid = generateUUID();
    return {
      args,
      uuid,
      dynamic(val) {
        return {
          [name]: val
        };
      },
      plugin: {
        name,
        set({
          element,
          attribute: {
            value
          },
          opts
        }) {
          // Todo: Support in element name or fragment position
          //  (with ability to convert whole set of arguments?); and
          //  ability to alter all attributes

          switch (opts.$state) {
            case 'children':
            case 'attributeValue':
              args.push( /** @type {{[key: string]: string}} */value[this.name]);
              return uuid;
            /*
            case 'fragmentChildren':
              args.push(value[this.name]);
              return {$text: uuid};
            case 'root':
            case 'element':
            case 'fragment':
            */
            /* c8 ignore next 5 */
            default:
              throw new Error(`Interpolator plugin not expected in ${opts.$state} position`);
          }
        }
      }
    };
  }

  exports.default = getInterpolator;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
