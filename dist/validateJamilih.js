(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.validateJamilih = {}));
})(this, (function (exports) { 'use strict';

  /**
   * The recognized keys on the optional leading options object passed to `jml()`.
   *
   * An object in first-argument position is only treated as an options object
   * when it carries at least one of these keys.
   *
   * `$mode` (reserved for a future SVG/XML mode) and `$state` (the internal
   * traversal marker) are deliberately absent: they are reserved names that
   * `jml()` rejects when author-supplied. Templating dialects layered on Jamilih
   * may use any other `$`-prefixed key freely; `validateJamilih`'s
   * `allowableOptions` governs validation of those.
   * @type {string[]}
   */
  const possibleOptions = ['$plugins', '$Map'];

  /**
   * Structural + policy validator for Jamilih input.
   *
   * Window-free and dependency-free: it re-implements the `jml()` argument
   * grammar as a non-mutating recursive checker and never calls `jml()` or
   * touches a DOM. Its only import is the shared {@link possibleOptions} list.
   */


  /**
   * @typedef {"javascript"|"json"} ValidateJamilihFormat
   */

  /**
   * @typedef {object} ValidateJamilihOptions
   * @property {ValidateJamilihFormat} [format] Default `"javascript"`. `"json"`
   *   additionally requires every value to be losslessly JSON round-trippable.
   * @property {boolean} [allowInnerHTML] Default `true`. When `false`, an
   *   `innerHTML` attribute key is rejected.
   * @property {boolean} [allowDOM] Default `true`; forced `false` when
   *   `format` is `"json"`. When effectively `false`, raw DOM nodes are rejected.
   * @property {string[]} [allowableOptions] Whitelist of extensible
   *   `$`-prefixed properties accepted wherever `$` magic is read. Sentinels:
   *   `"default"` expands to the builtin option keys, `"any"` / `"*"` permits
   *   any unknown `$`-key. Omitting the option is equivalent to `["default"]`.
   * @property {boolean} [failFast] Default `false`. When `true`, stop at the
   *   first error.
   */

  /**
   * @typedef {object} JamilihValidationError
   * @property {string} code Stable enum, e.g. `"BAD_CHILD"`.
   * @property {string} message Human-readable description.
   * @property {string} path JSON-pointer-ish location, e.g. `"/2/0/1"`.
   */

  /**
   * @typedef {object} JamilihValidationResult
   * @property {boolean} valid
   * @property {JamilihValidationError[]} errors
   */

  const FAIL_FAST = Symbol('validateJamilih.failFast');
  const RESERVED_NAMES = ['$state', '$mode'];

  // Node-producing keys a first-argument object may carry (mirrors `jml()`).
  const FIRST_ARG_NODE_KEYS = ['#', '$text', '$document', '$DOCTYPE', '$attribute'];

  // `$`-keys `_checkAtts` / the first-argument object handling recognize. Valid
  // only as an attributes object or an array-wrapped first-argument object, not
  // as a bare object child.
  const MAGIC_ATTR_BUILTINS = ['$on', '$symbol', '$define', '$data', '$custom', '$shadow', '$attribute', '$text', '$document', '$DOCTYPE'];
  const TEXTUAL_TYPES = ['string', 'number', 'boolean'];
  const NON_NODE_PRIMITIVE_TYPES = ['function', 'symbol', 'bigint'];

  // First-argument special strings and how many following string args they take.
  const SPECIAL_STRING_ARGC = {
    '!': 1,
    '&': 1,
    '#': 1,
    '#x': 1,
    '?': 2,
    '![': 1
  };

  /**
   * @param {unknown} v
   * @returns {boolean}
   */
  function isDOMNode(v) {
    return Boolean(v && typeof v === 'object' && typeof (/** @type {{nodeType?: unknown}} */v).nodeType === 'number');
  }

  /**
   * @param {unknown} v
   * @returns {boolean}
   */
  function isMapLike(v) {
    return /^\[object (?:Weak)?Map\]$/u.test(Object.prototype.toString.call(v));
  }

  /**
   * @param {unknown} v
   * @returns {boolean}
   */
  function isPlainObject(v) {
    if (!v || typeof v !== 'object' || Array.isArray(v)) {
      return false;
    }
    const proto = Object.getPrototypeOf(v);
    return proto === Object.prototype || proto === null;
  }

  /**
   * @param {string} key
   * @returns {boolean}
   */
  function isPluginKey(key) {
    return key.startsWith('$_');
  }

  /**
   * @param {unknown} v
   * @returns {boolean}
   */
  function isNullish(v) {
    return v === null || v === undefined;
  }

  /**
   * @param {ValidateJamilihOptions} options
   * @throws {TypeError} If `allowableOptions` is not an array.
   * @returns {{allowAny: boolean, allowable: Set<string>, emptyPolicy: boolean}}
   */
  function resolveAllowable(options) {
    const provided = Object.hasOwn(options, 'allowableOptions');
    const raw = provided ? options.allowableOptions : ['default'];
    if (!Array.isArray(raw)) {
      throw new TypeError('`allowableOptions` must be an array of strings');
    }
    let allowAny = false;
    const allowable = new Set();
    for (const entry of raw) {
      if (entry === 'any' || entry === '*') {
        allowAny = true;
      } else if (entry === 'default') {
        for (const k of possibleOptions) {
          allowable.add(k);
        }
      } else {
        allowable.add(entry);
      }
    }
    return {
      allowAny,
      allowable,
      emptyPolicy: provided && raw.length === 0
    };
  }

  /**
   * Validate a single-array Jamilih structure against structural and policy
   * rules.
   * @param {unknown} structure The JSON-serializable Jamilih array form.
   * @param {ValidateJamilihOptions} [options]
   * @throws {TypeError} If `format` or `allowableOptions` is invalid.
   * @returns {JamilihValidationResult}
   */
  const validateJamilih = (structure, options = {}) => {
    const format = options.format ?? 'javascript';
    if (format !== 'javascript' && format !== 'json') {
      throw new TypeError(`Unknown \`format\`: ${JSON.stringify(format)}`);
    }
    const allowInnerHTML = options.allowInnerHTML !== false;
    const failFast = options.failFast === true;
    const {
      allowAny,
      allowable,
      emptyPolicy
    } = resolveAllowable(options);

    // `json` can never carry a DOM node; the explicit combination is a conflict.
    const domConflict = format === 'json' && options.allowDOM === true;
    const allowDOM = format === 'json' ? false : options.allowDOM !== false;

    /** @type {JamilihValidationError[]} */
    const errors = [];

    /**
     * @param {string} code
     * @param {string} message
     * @param {(string|number)[]} pathParts
     * @returns {void}
     */
    const err = (code, message, pathParts) => {
      errors.push({
        code,
        message,
        path: pathParts.length ? '/' + pathParts.join('/') : '/'
      });
      if (failFast) {
        throw FAIL_FAST;
      }
    };

    /**
     * @param {string} key
     * @returns {boolean}
     */
    const isReserved = key => RESERVED_NAMES.includes(key);

    /**
     * @param {string} key
     * @returns {boolean}
     */
    const isOptionKey = key => possibleOptions.includes(key);

    /**
     * Deep JSON round-trippability check for `format: "json"`.
     * @param {unknown} v
     * @param {(string|number)[]} path
     * @returns {void}
     */
    const checkJSONValue = (v, path) => {
      if (v === null) {
        return;
      }
      const t = typeof v;
      if (t === 'string' || t === 'boolean') {
        return;
      }
      if (t === 'number') {
        if (!Number.isFinite(v)) {
          err('NON_JSON_VALUE', '`NaN`/`Infinity` is not valid JSON', path);
        }
        return;
      }
      if (t === 'undefined') {
        err('NON_JSON_VALUE', '`undefined` is not valid JSON', path);
        return;
      }
      if (NON_NODE_PRIMITIVE_TYPES.includes(t)) {
        err('NON_JSON_VALUE', `A ${t} value is not valid JSON`, path);
        return;
      }
      if (isDOMNode(v)) {
        err('NON_JSON_VALUE', 'A DOM node is not valid JSON', path);
        return;
      }
      if (isMapLike(v)) {
        err('NON_JSON_VALUE', 'A Map/WeakMap is not valid JSON', path);
        return;
      }
      if (Array.isArray(v)) {
        v.forEach((item, i) => checkJSONValue(item, [...path, i]));
        return;
      }
      if (!isPlainObject(v)) {
        err('NON_JSON_VALUE', 'A non-plain object (Date/RegExp/class instance) is not valid JSON', path);
        return;
      }
      for (const [k, item] of Object.entries(/** @type {Record<string, unknown>} */v)) {
        checkJSONValue(item, [...path, k]);
      }
    };

    /**
     * @param {string} key
     * @param {unknown} val
     * @param {(string|number)[]} path
     * @returns {void}
     */
    const checkExtensibleMagicKey = (key, val, path) => {
      if (allowAny || allowable.has(key)) {
        if (format === 'json') {
          checkJSONValue(val, path);
        }
        return;
      }
      err('UNKNOWN_MAGIC_PROPERTY', `Unknown \`$\`-prefixed property \`${key}\` is not permitted by \`allowableOptions\``, path);
    };

    /**
     * @param {Record<string, unknown>} obj
     * @param {(string|number)[]} path
     * @returns {void}
     */
    const flagMisplacedOptions = (obj, path) => {
      for (const k of Object.keys(obj)) {
        if (k === '$state' || isOptionKey(k)) {
          err('MISPLACED_OPTIONS_OBJECT', `\`${k}\` is a root-only option and cannot appear on a nested array head`, [...path, k]);
        }
      }
    };

    /**
     * @param {unknown} val
     * @param {(string|number)[]} path
     * @returns {void}
     */
    const validatePluginsOption = (val, path) => {
      if (!Array.isArray(val)) {
        err('BAD_ATTRIBUTES_OBJECT', '`$plugins` must be an array', path);
        return;
      }
      val.forEach((p, i) => {
        if (!p || typeof p !== 'object') {
          err('BAD_ATTRIBUTES_OBJECT', '`$plugins` entries must be objects', [...path, i]);
          return;
        }
        const plugin = /** @type {{name?: unknown, set?: unknown}} */p;
        if (typeof plugin.name !== 'string' || !plugin.name.startsWith('$_')) {
          err('BAD_ATTRIBUTES_OBJECT', 'Plugin `name` must be a string beginning with `$_`', [...path, i, 'name']);
        }
        if (format === 'json') {
          err('NON_JSON_CONSTRUCT', 'Plugins require a `set` function; not valid in `format: "json"`', [...path, i, 'set']);
        } else if (typeof plugin.set !== 'function') {
          err('BAD_ATTRIBUTES_OBJECT', 'Plugin `set` must be a function', [...path, i, 'set']);
        }
      });
    };

    /**
     * @param {unknown} val
     * @param {(string|number)[]} path
     * @returns {void}
     */
    const validateMapOption = (val, path) => {
      if (format === 'json') {
        err('NON_JSON_CONSTRUCT', '`$Map` carries a Map/WeakMap; not valid in `format: "json"`', path);
        return;
      }
      const ok = isMapLike(val) || Array.isArray(val) && (val[0] === undefined || isMapLike(val[0])) || isPlainObject(val) && Object.hasOwn(/** @type {object} */val, 'root');
      if (!ok) {
        err('BAD_DATA', '`$Map` must be `[map, value]` or `{root: [...], ...}`', path);
      }
    };

    /**
     * @param {unknown} val
     * @param {(string|number)[]} path
     * @returns {void}
     */
    const validateOnObject = (val, path) => {
      if (!isPlainObject(val)) {
        err('BAD_ON_HANDLER', '`$on` must be an object of event handlers', path);
        return;
      }
      const entries = Object.entries(/** @type {Record<string, unknown>} */val);
      if (entries.length === 0) {
        return; // documented no-op
      }
      if (format === 'json') {
        err('NON_JSON_CONSTRUCT', '`$on` handlers are functions; not valid in `format: "json"`', path);
        return;
      }
      for (const [evt, handler] of entries) {
        const okHandler = typeof handler === 'function' || Array.isArray(handler) && typeof handler[0] === 'function';
        if (!okHandler) {
          err('BAD_ON_HANDLER', `\`$on.${evt}\` must be a function or \`[function, capturing]\``, [...path, evt]);
        }
      }
    };

    /**
     * @param {unknown} val
     * @param {(string|number)[]} path
     * @returns {void}
     */
    const validateShadowObject = (val, path) => {
      if (!isPlainObject(val)) {
        err('BAD_SHADOW', '`$shadow` must be an object', path);
        return;
      }
      const obj = /** @type {Record<string, unknown>} */val;
      for (const slot of ['template', 'content']) {
        if (!Object.hasOwn(obj, slot)) {
          continue;
        }
        const v = obj[slot];
        if (Array.isArray(v)) {
          validateChildrenContainer(v, [...path, slot]);
        } else if (isDOMNode(v)) {
          if (!allowDOM) {
            err('DOM_NODE_NOT_ALLOWED', `\`$shadow.${slot}\` DOM node is not allowed`, [...path, slot]);
          }
        } else if (typeof v !== 'string' && typeof v !== 'boolean' && !isNullish(v)) {
          err('BAD_SHADOW', `\`$shadow.${slot}\` must be a Jamilih array, selector string, or DOM node`, [...path, slot]);
        }
      }
    };

    /**
     * @param {unknown} val
     * @param {(string|number)[]} path
     * @returns {void}
     */
    const validateDocumentObject = (val, path) => {
      if (!isPlainObject(val)) {
        err('BAD_ATTRIBUTES_OBJECT', '`$document` must be an object', path);
        return;
      }
      const obj = /** @type {Record<string, unknown>} */val;
      for (const slot of ['childNodes', 'head', 'body']) {
        if (Array.isArray(obj[slot])) {
          validateChildrenContainer(/** @type {unknown[]} */obj[slot], [...path, slot]);
        }
      }
    };

    /**
     * @param {Record<string, unknown>} obj
     * @param {(string|number)[]} path
     * @param {boolean} isChildHead
     * @returns {void}
     */
    const validateAttributesObject = (obj, path, isChildHead) => {
      for (const [key, val] of Object.entries(obj)) {
        const at = [...path, key];
        if (key === '#') {
          if (Array.isArray(val)) {
            validateChildrenContainer(val, at);
          } else {
            err('BAD_ATTRIBUTES_OBJECT', '`#` must hold an array of children', at);
          }
          continue;
        }
        if (isReserved(key)) {
          err('RESERVED_OPTION', `\`${key}\` is reserved by Jamilih and may not be supplied`, at);
          continue;
        }
        if (isOptionKey(key)) {
          err('MISPLACED_OPTIONS_OBJECT', `\`${key}\` is a root-only option and cannot appear ${isChildHead ? 'on a nested array head' : 'in an attributes object'}`, at);
          continue;
        }
        if (key === 'innerHTML') {
          if (!allowInnerHTML) {
            err('INNERHTML_NOT_ALLOWED', '`innerHTML` is not allowed (`allowInnerHTML: false`)', at);
          } else if (typeof val !== 'string' && !isNullish(val)) {
            err('BAD_ATTRIBUTES_OBJECT', '`innerHTML` must be a string', at);
          }
          continue;
        }
        if (key === '$text') {
          if (typeof val !== 'string') {
            err('BAD_ATTRIBUTES_OBJECT', '`$text` must be a string', at);
          }
          continue;
        }
        if (key === '$attribute') {
          const bad = !Array.isArray(val) || val.length < 2 || val.length > 3 || val.slice(1).some(s => !isNullish(s) && typeof s !== 'string');
          if (bad) {
            err('BAD_ATTRIBUTE_NODE', '`$attribute` must be `[namespace, name, value?]`', at);
          }
          continue;
        }
        if (key === '$DOCTYPE') {
          if (!isPlainObject(val) || typeof (/** @type {{name?: unknown}} */val).name !== 'string') {
            err('BAD_DOCTYPE', '`$DOCTYPE` must be an object with a string `name`', at);
          }
          continue;
        }
        if (key === '$document') {
          validateDocumentObject(val, at);
          continue;
        }
        if (key === '$on') {
          validateOnObject(val, at);
          continue;
        }
        if (key === '$symbol') {
          if (format === 'json') {
            err('NON_JSON_CONSTRUCT', '`$symbol` is not valid in `format: "json"`', at);
          } else {
            const bad = !Array.isArray(val) || val.length !== 2 || typeof val[0] !== 'string' && typeof val[0] !== 'symbol' || typeof val[1] !== 'function' && !isPlainObject(val[1]);
            if (bad) {
              err('BAD_SYMBOL', '`$symbol` must be `[symbol|string, function|object]`', at);
            }
          }
          continue;
        }
        if (key === '$define') {
          if (format === 'json') {
            err('NON_JSON_CONSTRUCT', '`$define` is not valid in `format: "json"`', at);
          } else if (typeof val !== 'function' && !isPlainObject(val) && !Array.isArray(val)) {
            err('BAD_DEFINE', '`$define` must be a function, mixin object, or array', at);
          }
          continue;
        }
        if (key === '$data') {
          if (format === 'json') {
            err('NON_JSON_CONSTRUCT', '`$data` requires an options `Map`; not valid in `format: "json"`', at);
          } else if (val !== true && !Array.isArray(val) && !isMapLike(val) && !isPlainObject(val)) {
            err('BAD_DATA', '`$data` must be `true`, an array, a Map, or a data object', at);
          }
          continue;
        }
        if (key === '$custom') {
          if (val && (typeof val === 'object' || typeof val === 'function') && Object.prototype.propertyIsEnumerable.call(val, '__proto__')) {
            err('BAD_CUSTOM_PROTO', '`$custom` may not define `__proto__`', at);
          }
          if (format === 'json') {
            checkJSONValue(val, at);
          }
          continue;
        }
        if (key === '$shadow') {
          validateShadowObject(val, at);
          continue;
        }
        if (isPluginKey(key)) {
          if (format === 'json') {
            checkJSONValue(val, at);
          }
          continue;
        }
        if (!key.startsWith('$') && key.startsWith('on')) {
          if (format === 'json' && typeof val === 'function') {
            err('NON_JSON_CONSTRUCT', `\`${key}\` handler function is not valid in \`format: "json"\``, at);
          }
          continue;
        }
        if (key.startsWith('$')) {
          checkExtensibleMagicKey(key, val, at);
          continue;
        }
        // Ordinary attribute (including `class`, `style`, `dataset`, ...). In
        // `javascript` mode jml() coerces the value via `setAttribute`, so
        // nothing further is enforced here.
        if (format === 'json') {
          checkJSONValue(val, at);
        }
      }
    };

    /**
     * A children-array container: each entry is a child node.
     * @param {unknown[]} arr
     * @param {(string|number)[]} path
     * @returns {void}
     */
    const validateChildrenContainer = (arr, path) => {
      arr.forEach((child, j) => {
        const at = [...path, j];
        if (isNullish(child)) {
          err('BAD_CHILD', '`null`/`undefined` is not a valid child', at);
          return;
        }
        const t = typeof child;
        if (TEXTUAL_TYPES.includes(t)) {
          if (format === 'json' && t === 'number' && !Number.isFinite(child)) {
            err('NON_JSON_VALUE', '`NaN`/`Infinity` text child is not valid JSON', at);
          }
          return;
        }
        if (NON_NODE_PRIMITIVE_TYPES.includes(t)) {
          err('BAD_CHILD', `A bare ${t} is not a valid child`, at);
          return;
        }
        if (isDOMNode(child)) {
          if (!allowDOM) {
            err('DOM_NODE_NOT_ALLOWED', 'Raw DOM node children are not allowed', at);
          }
          return;
        }
        if (Array.isArray(child)) {
          if (child.length === 0) {
            err('BAD_CHILD', 'A child array must not be empty', at);
            return;
          }
          const head = child[0];
          if (typeof head !== 'string' && !isPlainObject(head)) {
            err('BAD_CHILD', 'A child array must be headed by a string or object', at);
            return;
          }
          validateArgSequence(child, 0, at, true);
          return;
        }
        if (isPlainObject(child)) {
          const obj = /** @type {Record<string, unknown>} */child;
          if (Object.hasOwn(obj, '#')) {
            if (Array.isArray(obj['#'])) {
              validateChildrenContainer(/** @type {unknown[]} */obj['#'], [...at, '#']);
            } else {
              err('BAD_CHILD', 'A `#` fragment child must hold an array', [...at, '#']);
            }
            return;
          }
          const keys = Object.keys(obj);
          if (keys.length > 0 && keys.every(k => k.startsWith('$'))) {
            // Templating-dialect placeholder child; policy-checked, opaque value.
            flagMisplacedOptions(obj, at);
            for (const k of keys) {
              if (MAGIC_ATTR_BUILTINS.includes(k)) {
                err('BAD_CHILD', `\`${k}\` produces a node and must be array-wrapped (\`[{${k}: ...}]\`), not a bare object child`, [...at, k]);
              } else if (!isReserved(k) && !isOptionKey(k)) {
                checkExtensibleMagicKey(k, obj[k], [...at, k]);
              }
            }
            return;
          }
          err('BAD_CHILD', 'A plain object child must be a `#` fragment or `$`-magic placeholder', at);
          return;
        }
        if (isMapLike(child)) {
          err('BAD_CHILD', 'A Map/WeakMap is not a valid child', at);
          return;
        }
        err('BAD_CHILD', 'Unrecognized child value', at);
      });
    };

    /**
     * @param {unknown[]} args
     * @param {number} i
     * @param {(string|number)[]} path
     * @returns {number} Number of *additional* args consumed after `i`.
     */
    const validateStringArg = (args, i, path) => {
      const arg = /** @type {string} */args[i];
      if (arg === '' || !Object.hasOwn(SPECIAL_STRING_ARGC, arg)) {
        // Fragment marker or an ordinary element name; nothing to consume here.
        return 0;
      }
      const need = SPECIAL_STRING_ARGC[(/** @type {keyof typeof SPECIAL_STRING_ARGC} */arg)];
      for (let k = 1; k <= need; k++) {
        const follow = args[i + k];
        if (isNullish(follow) || typeof follow !== 'string' && typeof follow !== 'number') {
          err(arg === '?' ? 'BAD_PROCESSING_INSTRUCTION' : 'BAD_SPECIAL_ARG', `\`${arg}\` must be followed by ${need} string argument${need > 1 ? 's' : ''}`, [...path, i]);
          return 0;
        }
      }
      return need;
    };

    /**
     * @param {unknown[]} args
     * @param {number} start
     * @param {(string|number)[]} path
     * @param {boolean} [headIsChild] The object at `start`, if any, is the head
     *   of a nested child array (so root-only options there are misplaced).
     * @returns {void}
     */
    const validateArgSequence = (args, start, path, headIsChild = false) => {
      let i = start;
      while (i < args.length) {
        const arg = args[i];
        const at = [...path, i];
        if (arg === null) {
          if (i !== args.length - 1) {
            err('MISPLACED_NULL', '`null` is only allowed as the final argument', at);
          }
          i += 1;
          continue;
        }
        if (arg === undefined) {
          err('BAD_FIRST_ARG', '`undefined` is not a valid Jamilih argument', at);
          i += 1;
          continue;
        }
        const t = typeof arg;
        if (t === 'string') {
          i += 1 + validateStringArg(args, i, path);
          continue;
        }
        if (t !== 'object') {
          err('UNKNOWN_TYPE', `Unexpected ${t} in argument position`, at);
          i += 1;
          continue;
        }
        if (isDOMNode(arg)) {
          if (!allowDOM) {
            err('DOM_NODE_NOT_ALLOWED', 'Raw DOM nodes are not allowed here', at);
          }
        } else if (Array.isArray(arg)) {
          validateChildrenContainer(arg, at);
        } else if (isMapLike(arg)) {
          err('DOM_NODE_NOT_ALLOWED', 'A Map/WeakMap is not a valid Jamilih argument', at);
        } else if (isPlainObject(arg)) {
          validateAttributesObject(/** @type {Record<string, unknown>} */arg, at, headIsChild && i === start);
        } else {
          err('UNKNOWN_TYPE', 'Unrecognized argument type', at);
        }
        i += 1;
      }
    };

    /**
     * @param {Record<string, unknown>} obj
     * @param {(string|number)[]} path
     * @returns {void}
     */
    const validateOptionsObject = (obj, path) => {
      if (emptyPolicy) {
        err('OPTIONS_OBJECT_NOT_ALLOWED', 'A leading options object is not permitted (`allowableOptions: []`)', path);
        return;
      }
      for (const [key, val] of Object.entries(obj)) {
        if (isReserved(key)) {
          err('RESERVED_OPTION', `\`${key}\` is reserved by Jamilih and may not be supplied`, [...path, key]);
          continue;
        }
        if (isOptionKey(key)) {
          if (!allowAny && !allowable.has(key)) {
            err('DISALLOWED_OPTION', `Option \`${key}\` is not permitted by \`allowableOptions\``, [...path, key]);
          } else if (key === '$plugins') {
            validatePluginsOption(val, [...path, key]);
          } else if (key === '$Map') {
            validateMapOption(val, [...path, key]);
          }
          continue;
        }
        if (!key.startsWith('$')) {
          err('ATTRIBUTES_BEFORE_ELEMENT', 'A genuine attribute may not appear on an object before an element', [...path, key]);
          continue;
        }
        checkExtensibleMagicKey(key, val, [...path, key]);
      }
    };

    /**
     * @param {unknown} struct
     * @returns {void}
     */
    const validateStructure = struct => {
      if (!Array.isArray(struct)) {
        err('NOT_ARRAY', 'Jamilih structure must be an array', []);
        return;
      }
      if (struct.length === 0) {
        err('EMPTY_ARRAY', 'Jamilih structure must not be empty', []);
        return;
      }
      let argStart = 0;
      const first = struct[0];
      if (isPlainObject(first) && !isDOMNode(first)) {
        const firstObj = /** @type {Record<string, unknown>} */first;
        const keys = Object.keys(firstObj);
        if (possibleOptions.some(k => keys.includes(k))) {
          validateOptionsObject(firstObj, ['0']);
          argStart = 1;
        } else if (keys.some(k => RESERVED_NAMES.includes(k))) {
          for (const k of keys) {
            if (RESERVED_NAMES.includes(k)) {
              err('RESERVED_OPTION', `\`${k}\` is reserved by Jamilih and may not be supplied`, ['0', k]);
            }
          }
          argStart = 1;
        } else if (keys.some(k => FIRST_ARG_NODE_KEYS.includes(k))) ; else if (keys.every(k => k.startsWith('$'))) {
          // Dialect-only / empty object: base Jamilih skips it.
          argStart = 1;
        } else {
          err('ATTRIBUTES_BEFORE_ELEMENT', 'A genuine attribute may not appear on an object before an element', ['0']);
          argStart = 1;
        }
      }
      validateArgSequence(struct, argStart, []);
    };
    try {
      if (domConflict) {
        err('OPTION_CONFLICT', '`allowDOM: true` conflicts with `format: "json"`; DOM nodes stay rejected', []);
      }
      validateStructure(structure);
    } catch (e) {
      /* c8 ignore next 3 -- defensive: only the fail-fast sentinel is caught here */
      if (e !== FAIL_FAST) {
        throw e;
      }
    }
    return {
      valid: errors.length === 0,
      errors
    };
  };

  /**
   * Boolean predicate wrapper around {@link validateJamilih}.
   * @param {unknown} structure
   * @param {ValidateJamilihOptions} [options]
   * @returns {boolean}
   */
  const isValidJamilih = (structure, options) => validateJamilih(structure, options).valid;

  exports.isValidJamilih = isValidJamilih;
  exports.validateJamilih = validateJamilih;

}));
