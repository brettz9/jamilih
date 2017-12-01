'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var buffer = _interopDefault(require('buffer'));
var fs = _interopDefault(require('fs'));
var util = _interopDefault(require('util'));
var vm = _interopDefault(require('vm'));
var http = _interopDefault(require('http'));
var path = _interopDefault(require('path'));
var child_process = _interopDefault(require('child_process'));
var events = _interopDefault(require('events'));

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}



function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var async = createCommonjsModule(function (module) {
/*global setTimeout: false, console: false */
(function () {

    var async = {};

    // global on the server, window in the browser
    var root = this,
        previous_async = root.async;

    if ('object' !== 'undefined' && module.exports) {
        module.exports = async;
    }
    else {
        root.async = async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    //// cross-browser compatiblity functions ////

    var _forEach = function (arr, iterator) {
        if (arr.forEach) {
            return arr.forEach(iterator);
        }
        for (var i = 0; i < arr.length; i += 1) {
            iterator(arr[i], i, arr);
        }
    };

    var _map = function (arr, iterator) {
        if (arr.map) {
            return arr.map(iterator);
        }
        var results = [];
        _forEach(arr, function (x, i, a) {
            results.push(iterator(x, i, a));
        });
        return results;
    };

    var _reduce = function (arr, iterator, memo) {
        if (arr.reduce) {
            return arr.reduce(iterator, memo);
        }
        _forEach(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    };

    var _keys = function (obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    var _indexOf = function (arr, item) {
        if (arr.indexOf) {
            return arr.indexOf(item);
        }
        for (var i = 0; i < arr.length; i += 1) {
            if (arr[i] === item) {
                return i;
            }
        }
        return -1;
    };

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////
    if (typeof setImmediate === 'function') {
        async.nextTick = function (fn) {
            setImmediate(fn);
        };
    }
    else if (typeof process !== 'undefined' && process.nextTick) {
        async.nextTick = process.nextTick;
    }
    else {
        async.nextTick = function (fn) {
            setTimeout(fn, 0);
        };
    }

    async.forEach = function (arr, iterator, callback) {
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        _forEach(arr, function (x) {
            iterator(x, function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed === arr.length) {
                        callback();
                    }
                }
            });
        });
    };

    async.forEachSeries = function (arr, iterator, callback) {
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        var iterate = function () {
            iterator(arr[completed], function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed === arr.length) {
                        callback();
                    }
                    else {
                        iterate();
                    }
                }
            });
        };
        iterate();
    };


    var doParallel = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.forEach].concat(args));
        };
    };
    var doSeries = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.forEachSeries].concat(args));
        };
    };


    var _asyncMap = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (err, v) {
                results[x.index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    };
    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);


    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.reduce = function (arr, memo, iterator, callback) {
        async.forEachSeries(arr, function (x, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };
    // inject alias
    async.inject = async.reduce;
    // foldl alias
    async.foldl = async.reduce;

    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, function (x) {
            return x;
        }).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };
    // foldr alias
    async.foldr = async.reduceRight;

    var _filter = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.filter = doParallel(_filter);
    async.filterSeries = doSeries(_filter);
    // select alias
    async.select = async.filter;
    async.selectSeries = async.filterSeries;

    var _reject = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (!v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.reject = doParallel(_reject);
    async.rejectSeries = doSeries(_reject);

    var _detect = function (eachfn, arr, iterator, main_callback) {
        eachfn(arr, function (x, callback) {
            iterator(x, function (result) {
                if (result) {
                    main_callback(x);
                }
                else {
                    callback();
                }
            });
        }, function (err) {
            main_callback();
        });
    };
    async.detect = doParallel(_detect);
    async.detectSeries = doSeries(_detect);

    async.some = function (arr, iterator, main_callback) {
        async.forEach(arr, function (x, callback) {
            iterator(x, function (v) {
                if (v) {
                    main_callback(true);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(false);
        });
    };
    // any alias
    async.any = async.some;

    async.every = function (arr, iterator, main_callback) {
        async.forEach(arr, function (x, callback) {
            iterator(x, function (v) {
                if (!v) {
                    main_callback(false);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(true);
        });
    };
    // all alias
    async.all = async.every;

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                var fn = function (left, right) {
                    var a = left.criteria, b = right.criteria;
                    return a < b ? -1 : a > b ? 1 : 0;
                };
                callback(null, _map(results.sort(fn), function (x) {
                    return x.value;
                }));
            }
        });
    };

    async.auto = function (tasks, callback) {
        callback = callback || function () {};
        var keys = _keys(tasks);
        if (!keys.length) {
            return callback(null);
        }

        var completed = [];

        var listeners = [];
        var addListener = function (fn) {
            listeners.unshift(fn);
        };
        var removeListener = function (fn) {
            for (var i = 0; i < listeners.length; i += 1) {
                if (listeners[i] === fn) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        };
        var taskComplete = function () {
            _forEach(listeners, function (fn) {
                fn();
            });
        };

        addListener(function () {
            if (completed.length === keys.length) {
                callback(null);
            }
        });

        _forEach(keys, function (k) {
            var task = (tasks[k] instanceof Function) ? [tasks[k]]: tasks[k];
            var taskCallback = function (err) {
                if (err) {
                    callback(err);
                    // stop subsequent errors hitting callback multiple times
                    callback = function () {};
                }
                else {
                    completed.push(k);
                    taskComplete();
                }
            };
            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
            var ready = function () {
                return _reduce(requires, function (a, x) {
                    return (a && _indexOf(completed, x) !== -1);
                }, true);
            };
            if (ready()) {
                task[task.length - 1](taskCallback);
            }
            else {
                var listener = function () {
                    if (ready()) {
                        removeListener(listener);
                        task[task.length - 1](taskCallback);
                    }
                };
                addListener(listener);
            }
        });
    };

    async.waterfall = function (tasks, callback) {
        if (!tasks.length) {
            return callback();
        }
        callback = callback || function () {};
        var wrapIterator = function (iterator) {
            return function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    var args = Array.prototype.slice.call(arguments, 1);
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    async.nextTick(function () {
                        iterator.apply(null, args);
                    });
                }
            };
        };
        wrapIterator(async.iterator(tasks))();
    };

    async.parallel = function (tasks, callback) {
        callback = callback || function () {};
        if (tasks.constructor === Array) {
            async.map(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args || null);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            async.forEach(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.series = function (tasks, callback) {
        callback = callback || function () {};
        if (tasks.constructor === Array) {
            async.mapSeries(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args || null);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            async.forEachSeries(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.iterator = function (tasks) {
        var makeCallback = function (index) {
            var fn = function () {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            };
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        };
        return makeCallback(0);
    };

    async.apply = function (fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            return fn.apply(
                null, args.concat(Array.prototype.slice.call(arguments))
            );
        };
    };

    var _concat = function (eachfn, arr, fn, callback) {
        var r = [];
        eachfn(arr, function (x, cb) {
            fn(x, function (err, y) {
                r = r.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, r);
        });
    };
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        if (test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.whilst(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.until = function (test, iterator, callback) {
        if (!test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.until(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.queue = function (worker, concurrency) {
        var workers = 0;
        var tasks = [];
        var q = {
            concurrency: concurrency,
            push: function (data, callback) {
                tasks.push({data: data, callback: callback});
                async.nextTick(q.process);
            },
            process: function () {
                if (workers < q.concurrency && tasks.length) {
                    var task = tasks.splice(0, 1)[0];
                    workers += 1;
                    worker(task.data, function () {
                        workers -= 1;
                        if (task.callback) {
                            task.callback.apply(task, arguments);
                        }
                        q.process();
                    });
                }
            },
            length: function () {
                return tasks.length;
            }
        };
        return q;
    };

    var _console_fn = function (name) {
        return function (fn) {
            var args = Array.prototype.slice.call(arguments, 1);
            fn.apply(null, args.concat([function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (typeof console !== 'undefined') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _forEach(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            }]));
        };
    };
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        hasher = hasher || function (x) {
            return x;
        };
        return function () {
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (key in memo) {
                callback.apply(null, memo[key]);
            }
            else {
                fn.apply(null, args.concat([function () {
                    memo[key] = arguments;
                    callback.apply(null, arguments);
                }]));
            }
        };
    };

}.call(commonjsGlobal));
});

var assert_1 = createCommonjsModule(function (module, exports) {
/**
 * This file is based on the node.js assert module, but with some small
 * changes for browser-compatibility
 * THIS FILE SHOULD BE BROWSER-COMPATIBLE JS!
 */


/**
 * Added for browser compatibility
 */

var _keys = function(obj){
    if(Object.keys) return Object.keys(obj);
    if (typeof obj != 'object' && typeof obj != 'function') {
        throw new TypeError('-');
    }
    var keys = [];
    for(var k in obj){
        if(obj.hasOwnProperty(k)) keys.push(k);
    }
    return keys;
};



// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


var pSlice = Array.prototype.slice;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = exports;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({message: message, actual: actual, expected: expected})

assert.AssertionError = function AssertionError (options) {
  this.name = "AssertionError";
  this.message = options.message;
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
};
// code from util.inherits in node
assert.AssertionError.super_ = Error;


// EDITED FOR BROWSER COMPATIBILITY: replaced Object.create call
// TODO: test what effect this may have
var ctor = function () { this.constructor = assert.AssertionError; };
ctor.prototype = Error.prototype;
assert.AssertionError.prototype = new ctor();


assert.AssertionError.prototype.toString = function() {
  if (this.message) {
    return [this.name+":", this.message].join(' ');
  } else {
    return [ this.name+":"
           , typeof this.expected !== 'undefined' ? JSON.stringify(this.expected) : 'undefined'
           , this.operator
           , typeof this.actual !== 'undefined' ? JSON.stringify(this.actual) : 'undefined'
           ].join(" ");
  }
};

// assert.AssertionError instanceof Error

assert.AssertionError.__proto__ = Error.prototype;

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

assert.ok = function ok(value, message) {
  if (!!!value) fail(value, true, message, "==", assert.ok);
};

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, "==", assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, "!=", assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, "deepEqual", assert.deepEqual);
  }
};

var Buffer = null;
if (typeof commonjsRequire !== 'undefined' && typeof process !== 'undefined') {
    try {
        Buffer = buffer.Buffer;
    }
    catch (e) {
        // May be a CommonJS environment other than Node.js
        Buffer = null;
    }
}

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected)
    return true;

  // Convert to primitives, if supported
  actual = actual.valueOf ? actual.valueOf() : actual;
  expected = expected.valueOf ? expected.valueOf() : expected;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.2.1 If the expcted value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object that refers to the same source and options
  } else if (actual instanceof RegExp && expected instanceof RegExp) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.ignoreCase === expected.ignoreCase &&
           actual.multiline === expected.multiline;

  } else if (Buffer && actual instanceof Buffer && expected instanceof Buffer) {
    return (function() {
      var i, len;

      for (i = 0, len = expected.length; i < len; i++) {
        if (actual[i] !== expected[i]) {
          return false;
        }
      }
      return actual.length === expected.length;
    })();
  // 7.3. Other pairs that do not both pass typeof value == "object",
  // equivalence is determined by ==.
  } else if (typeof actual != 'object' && typeof expected != 'object') {
    return actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical "prototype" property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isUndefinedOrNull (value) {
  return value === null || value === undefined;
}

function isArguments (object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv (a, b) {
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;

  // an identical "prototype" property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try{
    var ka = _keys(a),
      kb = _keys(b),
      key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key] ))
       return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, "notDeepEqual", assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, "===", assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as determined by !==.
// assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, "!==", assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (expected instanceof RegExp) {
    return expected.test(actual.message || actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail('Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail('Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function (err) { if (err) {throw err;}};
});

var types = createCommonjsModule(function (module, exports) {
/*!
 * Nodeunit
 * Copyright (c) 2010 Caolan McMahon
 * MIT Licensed
 *
 * THIS FILE SHOULD BE BROWSER-COMPATIBLE JS!
 * You can use @REMOVE_LINE_FOR_BROWSER to remove code from the browser build.
 * Only code on that line will be removed, it's mostly to avoid requiring code
 * that is node specific
 */

/**
 * Module dependencies
 */

 //@REMOVE_LINE_FOR_BROWSER


/**
 * Creates assertion objects representing the result of an assert call.
 * Accepts an object or AssertionError as its argument.
 *
 * @param {object} obj
 * @api public
 */

exports.assertion = function (obj) {
    return {
        method: obj.method || '',
        message: obj.message || (obj.error && obj.error.message) || '',
        error: obj.error,
        passed: function () {
            return !this.error;
        },
        failed: function () {
            return Boolean(this.error);
        }
    };
};

/**
 * Creates an assertion list object representing a group of assertions.
 * Accepts an array of assertion objects.
 *
 * @param {Array} arr
 * @param {Number} duration
 * @api public
 */

exports.assertionList = function (arr, duration) {
    var that = arr || [];
    that.failures = function () {
        var failures = 0;
        for (var i = 0; i < this.length; i += 1) {
            if (this[i].failed()) {
                failures += 1;
            }
        }
        return failures;
    };
    that.passes = function () {
        return that.length - that.failures();
    };
    that.duration = duration || 0;
    return that;
};

/**
 * Create a wrapper function for assert module methods. Executes a callback
 * after it's complete with an assertion object representing the result.
 *
 * @param {Function} callback
 * @api private
 */

var assertWrapper = function (callback) {
    return function (new_method, assert_method, arity) {
        return function () {
            var message = arguments[arity - 1];
            var a = exports.assertion({method: new_method, message: message});
            try {
                assert_1[assert_method].apply(null, arguments);
            }
            catch (e) {
                a.error = e;
            }
            callback(a);
        };
    };
};

/**
 * Creates the 'test' object that gets passed to every test function.
 * Accepts the name of the test function as its first argument, followed by
 * the start time in ms, the options object and a callback function.
 *
 * @param {String} name
 * @param {Number} start
 * @param {Object} options
 * @param {Function} callback
 * @api public
 */

exports.test = function (name, start, options, callback) {
    var expecting;
    var a_list = [];

    var wrapAssert = assertWrapper(function (a) {
        a_list.push(a);
        if (options.log) {
            async.nextTick(function () {
                options.log(a);
            });
        }
    });

    var test = {
        done: function (err) {
            if (expecting !== undefined && expecting !== a_list.length) {
                var e = new Error(
                    'Expected ' + expecting + ' assertions, ' +
                    a_list.length + ' ran'
                );
                var a1 = exports.assertion({method: 'expect', error: e});
                a_list.push(a1);
                if (options.log) {
                    async.nextTick(function () {
                        options.log(a1);
                    });
                }
            }
            if (err) {
                var a2 = exports.assertion({error: err});
                a_list.push(a2);
                if (options.log) {
                    async.nextTick(function () {
                        options.log(a2);
                    });
                }
            }
            var end = new Date().getTime();
            async.nextTick(function () {
                var assertion_list = exports.assertionList(a_list, end - start);
                options.testDone(name, assertion_list);
                callback(null, a_list);
            });
        },
        ok: wrapAssert('ok', 'ok', 2),
        same: wrapAssert('same', 'deepEqual', 3),
        equals: wrapAssert('equals', 'equal', 3),
        expect: function (num) {
            expecting = num;
        },
        _assertion_list: a_list
    };
    // add all functions from the assert module
    for (var k in assert_1) {
        if (assert_1.hasOwnProperty(k)) {
            test[k] = wrapAssert(k, k, assert_1[k].length);
        }
    }
    return test;
};

/**
 * Ensures an options object has all callbacks, adding empty callback functions
 * if any are missing.
 *
 * @param {Object} opt
 * @return {Object}
 * @api public
 */

exports.options = function (opt) {
    var optionalCallback = function (name) {
        opt[name] = opt[name] || function () {};
    };

    optionalCallback('moduleStart');
    optionalCallback('moduleDone');
    optionalCallback('testStart');
    optionalCallback('testReady');
    optionalCallback('testDone');
    //optionalCallback('log');

    // 'done' callback is not optional.

    return opt;
};
});

var types_1 = types.assertion;
var types_2 = types.assertionList;
var types_3 = types.test;
var types_4 = types.options;

/*!
 * Nodeunit
 * Copyright (c) 2010 Caolan McMahon
 * MIT Licensed
 */

/**
 * Module dependencies
 */

var Script = vm.Script;


/**
 * Detect if coffee-script, iced-coffeescript, or streamline are available and 
 * the respective file extensions to the search filter in modulePaths if it is.
 */

var extensions = [ 'js' ];  // js is always supported: add it unconditionally
var extensionPattern;

try {
    commonjsRequire('coffee' + '-script/register');
    extensions.push('coffee');
} catch (e) { }

try {
    commonjsRequire('iced-coffee' + '-script/register');
    extensions.push('iced');
} catch (e) { }

try {
    commonjsRequire('stream' + 'line').register();
    extensions.push('_coffee');
    extensions.push('_js');
} catch (e) { }

extensionPattern = new RegExp('\\.(?:' + extensions.join('|') + ')$');


/**
 * Finds all modules at each path in an array, If a path is a directory, it
 * returns all supported file types inside it. This only reads 1 level deep in
 * the directory and does not recurse through sub-directories.
 *
 * The extension (.js, .coffee etc) is stripped from the filenames so they can
 * simply be require()'ed.
 *
 * @param {Array} paths
 * @param {Function} callback
 * @param {Boolean=} recursive
 * @api public
 */
var modulePaths = function modulePaths(paths, callback, recursive) {
    recursive = (recursive === true);
    async.concatSeries(paths, function (p, cb) {
        fs.stat(p, function (err, stats) {
            if (err) {
                return cb(err);
            }
            if (stats.isFile()) {
                return cb(null, [p]);
            }
            if (stats.isDirectory()) {
                fs.readdir(p, function (err, files) {
                    if (err) {
                        return cb(err);
                    }

                    // filter out any filenames with unsupported extensions
                    var modules = files.filter(function (filename) {
                        return extensionPattern.exec(filename);
                    });

                    // remove extension from module name and prepend the
                    // directory path
                    var fullpaths = modules.map(function (filename) {
                        var mod_name = filename.replace(extensionPattern, '');
                        return [p, mod_name].join('/');
                    });

                    if (recursive) {
                        // get all sub directories
                        var directories =
                            files
                                .map(function(filename) {
                                    // resolve path first
                                    return path.resolve(p, filename);
                                })
                                .filter(function(filename) {
                                    // fetch only directories
                                    return (fs.statSync(filename).isDirectory());
                                });

                        // recursively call modulePaths() with sub directories
                        modulePaths(directories, function(err, files) {
                            if (!err) {
                                cb(null, fullpaths.concat(files).sort());
                            } else {
                                cb(err);
                            }
                        }, recursive);
                    } else {
                        // sort filenames here, because Array.map changes order
                        fullpaths.sort();

                        // finish
                        cb(null, fullpaths);
                    }

                });
            }
        });
    }, callback);
};

/**
 * Evaluates JavaScript files in a sandbox, returning the context. The first
 * argument can either be a single filename or an array of filenames. If
 * multiple filenames are given their contents are concatenated before
 * evalution. The second argument is an optional context to use for the sandbox.
 *
 * @param files
 * @param {Object} sandbox
 * @return {Object}
 * @api public
 */

var sandbox = function (files, /*optional*/sandbox) {
    var source, script, result;
    if (!(files instanceof Array)) {
        files = [files];
    }
    source = files.map(function (file) {
        return fs.readFileSync(file, 'utf8');
    }).join('');

    if (!sandbox) {
        sandbox = {};
    }
    script = new Script(source);
    result = script.runInNewContext(sandbox);
    return sandbox;
};

/**
 * Provides a http request, response testing environment.
 *
 * Example:
 *
 *  var httputil = require('nodeunit').utils.httputil
 *  exports.testSomething = function(test) {
 *    httputil(function (req, resp) {
 *        resp.writeHead(200, {});
 *        resp.end('test data');
 *      },
 *      function(server, client) {
 *        client.fetch('GET', '/', {}, function(resp) {
 *          test.equal('test data', resp.body);
 *          server.close();
 *          test.done();
 *        })
 *      });
 *  };
 *
 * @param {Function} cgi
 * @param {Function} envReady
 * @api public
 */
var httputil = function (cgi, envReady) {
    var hostname = process.env.HOSTNAME || 'localhost';
    var port = process.env.PORT || 3000;

    var server = http.createServer(cgi);
    server.listen(port, hostname);

    var agent = new http.Agent({ host: hostname, port: port, maxSockets: 1 });
    var client = {
        fetch: function (method, path$$1, headers, respReady) {
            var request = http.request({
                host: hostname,
                port: port,
                agent: agent,
                method: method,
                path: path$$1,
                headers: headers
            });
            request.end();
            request.on('response', function (response) {
                response.setEncoding('utf8');
                response.on('data', function (chunk) {
                    if (response.body) {
                        response.body += chunk;
                    } else {
                        response.body = chunk;
                    }
                });
                response.on('end', function () {
                    if (response.headers['content-type'] === 'application/json') {
                        response.bodyAsObject = JSON.parse(response.body);
                    }
                    respReady(response);
                });
            });
        }
    };

    process.nextTick(function () {
        if (envReady && typeof envReady === 'function') {
            envReady(server, client);
        }
    });
};


/**
 * Improves formatting of AssertionError messages to make deepEqual etc more
 * readable.
 *
 * @param {Object} assertion
 * @return {Object}
 * @api public
 */

var betterErrors = function (assertion) {
    if (!assertion.error) {
        return assertion;
    }
    var e = assertion.error;

    if (typeof e.actual !== 'undefined' && typeof e.expected !== 'undefined') {
        var actual = util.inspect(e.actual, false, 10).replace(/\n$/, '');
        var expected = util.inspect(e.expected, false, 10).replace(/\n$/, '');

        var multiline = (
            actual.indexOf('\n') !== -1 ||
            expected.indexOf('\n') !== -1
        );
        var spacing = (multiline ? '\n' : ' ');
        e._message = e.message;
        e.stack = (
            e.name + ':' + spacing +
            actual + spacing + e.operator + spacing +
            expected + '\n' +
            e.stack.split('\n').slice(1).join('\n')
        );
    }
    return assertion;
};

var utils = {
	modulePaths: modulePaths,
	sandbox: sandbox,
	httputil: httputil,
	betterErrors: betterErrors
};

var core = createCommonjsModule(function (module, exports) {
/*!
 * Nodeunit
 * Copyright (c) 2010 Caolan McMahon
 * MIT Licensed
 *
 * THIS FILE SHOULD BE BROWSER-COMPATIBLE JS!
 * You can use @REMOVE_LINE_FOR_BROWSER to remove code from the browser build.
 * Only code on that line will be removed, it's mostly to avoid requiring code
 * that is node specific
 */

/**
 * Module dependencies
 */

       //@REMOVE_LINE_FOR_BROWSER


/**
 * Added for browser compatibility
 */

var _keys = function (obj) {
    if (Object.keys) {
        return Object.keys(obj);
    }
    var keys = [];
    for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
            keys.push(k);
        }
    }
    return keys;
};


var _copy = function (obj) {
    var nobj = {};
    var keys = _keys(obj);
    for (var i = 0; i <  keys.length; i += 1) {
        nobj[keys[i]] = obj[keys[i]];
    }
    return nobj;
};


/**
 * Runs a test function (fn) from a loaded module. After the test function
 * calls test.done(), the callback is executed with an assertionList as its
 * second argument.
 *
 * @param {String} name
 * @param {Function} fn
 * @param {Object} opt
 * @param {Function} callback
 * @api public
 */

exports.runTest = function (name, fn, opt, callback) {
    var options = types.options(opt);

    options.testStart(name);
    var start = new Date().getTime();
    var test = types.test(name, start, options, callback);

    options.testReady(test);
    try {
        fn(test);
    }
    catch (e) {
        test.done(e);
    }
};

/**
 * Takes an object containing test functions or other test suites as properties
 * and runs each in series. After all tests have completed, the callback is
 * called with a list of all assertions as the second argument.
 *
 * If a name is passed to this function it is prepended to all test and suite
 * names that run within it.
 *
 * @param {String} name
 * @param {Object} suite
 * @param {Object} opt
 * @param {Function} callback
 * @api public
 */

exports.runSuite = function (name, suite, opt, callback) {
    suite = wrapGroup(suite);
    var keys = _keys(suite);

    async.concatSeries(keys, function (k, cb) {
        var prop = suite[k], _name;

        _name = name ? [].concat(name, k) : [k];
        _name.toString = function () {
            // fallback for old one
            return this.join(' - ');
        };

        if (typeof prop === 'function') {
            var in_name = false,
                in_specific_test = (_name.toString() === opt.testFullSpec) ? true : false;
            for (var i = 0; i < _name.length; i += 1) {
                if (_name[i] === opt.testspec) {
                    in_name = true;
                }
            }

            if ((!opt.testFullSpec || in_specific_test) && (!opt.testspec || in_name)) {
                if (opt.moduleStart) {
                    opt.moduleStart();
                }
                exports.runTest(_name, suite[k], opt, cb);
            }
            else {
                return cb();
            }
        }
        else {
            exports.runSuite(_name, suite[k], opt, cb);
        }
    }, callback);
};

/**
 * Run each exported test function or test suite from a loaded module.
 *
 * @param {String} name
 * @param {Object} mod
 * @param {Object} opt
 * @param {Function} callback
 * @api public
 */

exports.runModule = function (name, mod, opt, callback) {
    var options = _copy(types.options(opt));

    var _run = false;
    var _moduleStart = options.moduleStart;

    mod = wrapGroup(mod);

    function run_once() {
        if (!_run) {
            _run = true;
            _moduleStart(name);
        }
    }
    options.moduleStart = run_once;

    var start = new Date().getTime();

    exports.runSuite(null, mod, options, function (err, a_list) {
        var end = new Date().getTime();
        var assertion_list = types.assertionList(a_list, end - start);
        options.moduleDone(name, assertion_list);
        if (nodeunit$2.complete) {
            nodeunit$2.complete(name, assertion_list);
        }
        callback(null, a_list);
    });
};

/**
 * Treats an object literal as a list of modules keyed by name. Runs each
 * module and finished with calling 'done'. You can think of this as a browser
 * safe alternative to runFiles in the nodeunit module.
 *
 * @param {Object} modules
 * @param {Object} opt
 * @api public
 */

// TODO: add proper unit tests for this function
exports.runModules = function (modules, opt) {
    var options = types.options(opt);
    var start = new Date().getTime();

    async.concatSeries(_keys(modules), function (k, cb) {
        exports.runModule(k, modules[k], options, cb);
    },
    function (err, all_assertions) {
        var end = new Date().getTime();
        options.done(types.assertionList(all_assertions, end - start));
    });
};


/**
 * Wraps a test function with setUp and tearDown functions.
 * Used by testCase.
 *
 * @param {Function} setUp
 * @param {Function} tearDown
 * @param {Function} fn
 * @api private
 */

var wrapTest = function (setUp, tearDown, fn) {
    return function (test) {
        var context = {};
        if (tearDown) {
            var done = test.done;
            test.done = function (err) {
                try {
                    tearDown.call(context, function (err2) {
                        if (err && err2) {
                            test._assertion_list.push(
                                types.assertion({error: err})
                            );
                            return done(err2);
                        }
                        done(err || err2);
                    });
                }
                catch (e) {
                    done(e);
                }
            };
        }
        if (setUp) {
            setUp.call(context, function (err) {
                if (err) {
                    return test.done(err);
                }
                fn.call(context, test);
            });
        }
        else {
            fn.call(context, test);
        }
    };
};


/**
 * Returns a serial callback from two functions.
 *
 * @param {Function} funcFirst
 * @param {Function} funcSecond
 * @api private
 */

var getSerialCallback = function (fns) {
    if (!fns.length) {
        return null;
    }
    return function (callback) {
        var that = this;
        var bound_fns = [];
        for (var i = 0, len = fns.length; i < len; i++) {
            (function (j) {
                bound_fns.push(function () {
                    return fns[j].apply(that, arguments);
                });
            })(i);
        }
        return async.series(bound_fns, callback);
    };
};


/**
 * Wraps a group of tests with setUp and tearDown functions.
 * Used by testCase.
 *
 * @param {Object} group
 * @param {Array} setUps - parent setUp functions
 * @param {Array} tearDowns - parent tearDown functions
 * @api private
 */

var wrapGroup = function (group, setUps, tearDowns) {
    var tests = {};

    var setUps = setUps ? setUps.slice(): [];
    var tearDowns = tearDowns ? tearDowns.slice(): [];

    if (group.setUp) {
        setUps.push(group.setUp);
        delete group.setUp;
    }
    if (group.tearDown) {
        tearDowns.unshift(group.tearDown);
        delete group.tearDown;
    }

    var keys = _keys(group);

    for (var i = 0; i < keys.length; i += 1) {
        var k = keys[i];
        if (typeof group[k] === 'function') {
            tests[k] = wrapTest(
                getSerialCallback(setUps),
                getSerialCallback(tearDowns),
                group[k]
            );
        }
        else if (typeof group[k] === 'object') {
            tests[k] = wrapGroup(group[k], setUps, tearDowns);
        }
    }
    return tests;
};


/**
 * Backwards compatibility for test suites using old testCase API
 */

exports.testCase = function (suite) {
    return suite;
};
});

var core_1 = core.runTest;
var core_2 = core.runSuite;
var core_3 = core.runModule;
var core_4 = core.runModules;
var core_5 = core.testCase;

var utils$2 = createCommonjsModule(function (module, exports) {
/*
 * EJS Embedded JavaScript templates
 * Copyright 2112 Matthew Eernisse (mde@fleegix.org)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
*/

/**
 * Private utility functions
 * @module utils
 * @private
 */

var regExpChars = /[|\\{}()[\]^$+*?.]/g;

/**
 * Escape characters reserved in regular expressions.
 *
 * If `string` is `undefined` or `null`, the empty string is returned.
 *
 * @param {String} string Input string
 * @return {String} Escaped string
 * @static
 * @private
 */
exports.escapeRegExpChars = function (string) {
  // istanbul ignore if
  if (!string) {
    return '';
  }
  return String(string).replace(regExpChars, '\\$&');
};

var _ENCODE_HTML_RULES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&#34;',
  "'": '&#39;'
};
var _MATCH_HTML = /[&<>\'"]/g;

function encode_char(c) {
  return _ENCODE_HTML_RULES[c] || c;
}

/**
 * Stringified version of constants used by {@link module:utils.escapeXML}.
 *
 * It is used in the process of generating {@link ClientFunction}s.
 *
 * @readonly
 * @type {String}
 */

var escapeFuncStr =
  'var _ENCODE_HTML_RULES = {\n'
+ '      "&": "&amp;"\n'
+ '    , "<": "&lt;"\n'
+ '    , ">": "&gt;"\n'
+ '    , \'"\': "&#34;"\n'
+ '    , "\'": "&#39;"\n'
+ '    }\n'
+ '  , _MATCH_HTML = /[&<>\'"]/g;\n'
+ 'function encode_char(c) {\n'
+ '  return _ENCODE_HTML_RULES[c] || c;\n'
+ '};\n';

/**
 * Escape characters reserved in XML.
 *
 * If `markup` is `undefined` or `null`, the empty string is returned.
 *
 * @implements {EscapeCallback}
 * @param {String} markup Input string
 * @return {String} Escaped string
 * @static
 * @private
 */

exports.escapeXML = function (markup) {
  return markup == undefined
    ? ''
    : String(markup)
        .replace(_MATCH_HTML, encode_char);
};
exports.escapeXML.toString = function () {
  return Function.prototype.toString.call(this) + ';\n' + escapeFuncStr;
};

/**
 * Naive copy of properties from one object to another.
 * Does not recurse into non-scalar properties
 * Does not check to see if the property has a value before copying
 *
 * @param  {Object} to   Destination object
 * @param  {Object} from Source object
 * @return {Object}      Destination object
 * @static
 * @private
 */
exports.shallowCopy = function (to, from) {
  from = from || {};
  for (var p in from) {
    to[p] = from[p];
  }
  return to;
};

/**
 * Naive copy of a list of key names, from one object to another.
 * Only copies property if it is actually defined
 * Does not recurse into non-scalar properties
 *
 * @param  {Object} to   Destination object
 * @param  {Object} from Source object
 * @param  {Array} list List of properties to copy
 * @return {Object}      Destination object
 * @static
 * @private
 */
exports.shallowCopyFromList = function (to, from, list) {
  for (var i = 0; i < list.length; i++) {
    var p = list[i];
    if (typeof from[p] != 'undefined') {
      to[p] = from[p];
    }
  }
  return to;
};

/**
 * Simple in-process cache implementation. Does not implement limits of any
 * sort.
 *
 * @implements Cache
 * @static
 * @private
 */
exports.cache = {
  _data: {},
  set: function (key, val) {
    this._data[key] = val;
  },
  get: function (key) {
    return this._data[key];
  },
  reset: function () {
    this._data = {};
  }
};
});

var utils_1 = utils$2.escapeRegExpChars;
var utils_2 = utils$2.escapeXML;
var utils_3 = utils$2.shallowCopy;
var utils_4 = utils$2.shallowCopyFromList;
var utils_5 = utils$2.cache;

var _args = [[{"raw":"ejs@^2.5.2","scope":null,"escapedName":"ejs","name":"ejs","rawSpec":"^2.5.2","spec":">=2.5.2 <3.0.0","type":"range"},"/Users/brett/jamilih/node_modules/nodeunit"]];
var _from = "ejs@>=2.5.2 <3.0.0";
var _id = "ejs@2.5.7";
var _inCache = true;
var _location = "/ejs";
var _nodeVersion = "6.9.1";
var _npmOperationalInternal = {"host":"s3://npm-registry-packages","tmp":"tmp/ejs-2.5.7.tgz_1501385411193_0.3807816591579467"};
var _npmUser = {"name":"mde","email":"mde@fleegix.org"};
var _npmVersion = "3.10.8";
var _phantomChildren = {};
var _requested = {"raw":"ejs@^2.5.2","scope":null,"escapedName":"ejs","name":"ejs","rawSpec":"^2.5.2","spec":">=2.5.2 <3.0.0","type":"range"};
var _requiredBy = ["/nodeunit"];
var _resolved = "https://registry.npmjs.org/ejs/-/ejs-2.5.7.tgz";
var _shasum = "cc872c168880ae3c7189762fd5ffc00896c9518a";
var _shrinkwrap = null;
var _spec = "ejs@^2.5.2";
var _where = "/Users/brett/jamilih/node_modules/nodeunit";
var author = {"name":"Matthew Eernisse","email":"mde@fleegix.org","url":"http://fleegix.org"};
var bugs = {"url":"https://github.com/mde/ejs/issues"};
var contributors = [{"name":"Timothy Gu","email":"timothygu99@gmail.com","url":"https://timothygu.github.io"}];
var dependencies = {};
var description = "Embedded JavaScript templates";
var devDependencies = {"browserify":"^13.0.1","eslint":"^3.0.0","git-directory-deploy":"^1.5.1","istanbul":"~0.4.3","jake":"^8.0.0","jsdoc":"^3.4.0","lru-cache":"^4.0.1","mocha":"^3.0.2","uglify-js":"^2.6.2"};
var directories = {};
var dist = {"shasum":"cc872c168880ae3c7189762fd5ffc00896c9518a","tarball":"https://registry.npmjs.org/ejs/-/ejs-2.5.7.tgz"};
var engines = {"node":">=0.10.0"};
var homepage = "https://github.com/mde/ejs";
var keywords = ["template","engine","ejs"];
var license = "Apache-2.0";
var main = "./lib/ejs.js";
var maintainers = [{"name":"mde","email":"mde@fleegix.org"}];
var name = "ejs";
var optionalDependencies = {};
var readme = "ERROR: No README data found!";
var repository = {"type":"git","url":"git://github.com/mde/ejs.git"};
var scripts = {"coverage":"istanbul cover node_modules/mocha/bin/_mocha","devdoc":"jake doc[dev]","doc":"jake doc","lint":"eslint \"**/*.js\" Jakefile","test":"jake test"};
var version = "2.5.7";
var _package = {
	_args: _args,
	_from: _from,
	_id: _id,
	_inCache: _inCache,
	_location: _location,
	_nodeVersion: _nodeVersion,
	_npmOperationalInternal: _npmOperationalInternal,
	_npmUser: _npmUser,
	_npmVersion: _npmVersion,
	_phantomChildren: _phantomChildren,
	_requested: _requested,
	_requiredBy: _requiredBy,
	_resolved: _resolved,
	_shasum: _shasum,
	_shrinkwrap: _shrinkwrap,
	_spec: _spec,
	_where: _where,
	author: author,
	bugs: bugs,
	contributors: contributors,
	dependencies: dependencies,
	description: description,
	devDependencies: devDependencies,
	directories: directories,
	dist: dist,
	engines: engines,
	homepage: homepage,
	keywords: keywords,
	license: license,
	main: main,
	maintainers: maintainers,
	name: name,
	optionalDependencies: optionalDependencies,
	readme: readme,
	repository: repository,
	scripts: scripts,
	version: version
};

var _package$1 = Object.freeze({
	_args: _args,
	_from: _from,
	_id: _id,
	_inCache: _inCache,
	_location: _location,
	_nodeVersion: _nodeVersion,
	_npmOperationalInternal: _npmOperationalInternal,
	_npmUser: _npmUser,
	_npmVersion: _npmVersion,
	_phantomChildren: _phantomChildren,
	_requested: _requested,
	_requiredBy: _requiredBy,
	_resolved: _resolved,
	_shasum: _shasum,
	_shrinkwrap: _shrinkwrap,
	_spec: _spec,
	_where: _where,
	author: author,
	bugs: bugs,
	contributors: contributors,
	dependencies: dependencies,
	description: description,
	devDependencies: devDependencies,
	directories: directories,
	dist: dist,
	engines: engines,
	homepage: homepage,
	keywords: keywords,
	license: license,
	main: main,
	maintainers: maintainers,
	name: name,
	optionalDependencies: optionalDependencies,
	readme: readme,
	repository: repository,
	scripts: scripts,
	version: version,
	default: _package
});

var require$$0$3 = ( _package$1 && _package ) || _package$1;

var ejs = createCommonjsModule(function (module, exports) {
/*
 * EJS Embedded JavaScript templates
 * Copyright 2112 Matthew Eernisse (mde@fleegix.org)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
*/

var scopeOptionWarned = false;
var _VERSION_STRING = require$$0$3.version;
var _DEFAULT_DELIMITER = '%';
var _DEFAULT_LOCALS_NAME = 'locals';
var _NAME = 'ejs';
var _REGEX_STRING = '(<%%|%%>|<%=|<%-|<%_|<%#|<%|%>|-%>|_%>)';
var _OPTS = ['delimiter', 'scope', 'context', 'debug', 'compileDebug',
  'client', '_with', 'rmWhitespace', 'strict', 'filename'];
// We don't allow 'cache' option to be passed in the data obj
// for the normal `render` call, but this is where Express puts it
// so we make an exception for `renderFile`
var _OPTS_EXPRESS = _OPTS.concat('cache');
var _BOM = /^\uFEFF/;

/**
 * EJS template function cache. This can be a LRU object from lru-cache NPM
 * module. By default, it is {@link module:utils.cache}, a simple in-process
 * cache that grows continuously.
 *
 * @type {Cache}
 */

exports.cache = utils$2.cache;

/**
 * Custom file loader. Useful for template preprocessing or restricting access
 * to a certain part of the filesystem.
 *
 * @type {fileLoader}
 */

exports.fileLoader = fs.readFileSync;

/**
 * Name of the object containing the locals.
 *
 * This variable is overridden by {@link Options}`.localsName` if it is not
 * `undefined`.
 *
 * @type {String}
 * @public
 */

exports.localsName = _DEFAULT_LOCALS_NAME;

/**
 * Get the path to the included file from the parent file path and the
 * specified path.
 *
 * @param {String}  name     specified path
 * @param {String}  filename parent file path
 * @param {Boolean} isDir    parent file path whether is directory
 * @return {String}
 */
exports.resolveInclude = function(name, filename, isDir) {
  var dirname = path.dirname;
  var extname = path.extname;
  var resolve = path.resolve;
  var includePath = resolve(isDir ? filename : dirname(filename), name);
  var ext = extname(name);
  if (!ext) {
    includePath += '.ejs';
  }
  return includePath;
};

/**
 * Get the path to the included file by Options
 *
 * @param  {String}  path    specified path
 * @param  {Options} options compilation options
 * @return {String}
 */
function getIncludePath(path$$2, options) {
  var includePath;
  var filePath;
  var views = options.views;

  // Abs path
  if (path$$2.charAt(0) == '/') {
    includePath = exports.resolveInclude(path$$2.replace(/^\/*/,''), options.root || '/', true);
  }
  // Relative paths
  else {
    // Look relative to a passed filename first
    if (options.filename) {
      filePath = exports.resolveInclude(path$$2, options.filename);
      if (fs.existsSync(filePath)) {
        includePath = filePath;
      }
    }
    // Then look in any views directories
    if (!includePath) {
      if (Array.isArray(views) && views.some(function (v) {
        filePath = exports.resolveInclude(path$$2, v, true);
        return fs.existsSync(filePath);
      })) {
        includePath = filePath;
      }
    }
    if (!includePath) {
      throw new Error('Could not find include include file.');
    }
  }
  return includePath;
}

/**
 * Get the template from a string or a file, either compiled on-the-fly or
 * read from cache (if enabled), and cache the template if needed.
 *
 * If `template` is not set, the file specified in `options.filename` will be
 * read.
 *
 * If `options.cache` is true, this function reads the file from
 * `options.filename` so it must be set prior to calling this function.
 *
 * @memberof module:ejs-internal
 * @param {Options} options   compilation options
 * @param {String} [template] template source
 * @return {(TemplateFunction|ClientFunction)}
 * Depending on the value of `options.client`, either type might be returned.
 * @static
 */

function handleCache(options, template) {
  var func;
  var filename = options.filename;
  var hasTemplate = arguments.length > 1;

  if (options.cache) {
    if (!filename) {
      throw new Error('cache option requires a filename');
    }
    func = exports.cache.get(filename);
    if (func) {
      return func;
    }
    if (!hasTemplate) {
      template = fileLoader(filename).toString().replace(_BOM, '');
    }
  }
  else if (!hasTemplate) {
    // istanbul ignore if: should not happen at all
    if (!filename) {
      throw new Error('Internal EJS error: no file name or template '
                    + 'provided');
    }
    template = fileLoader(filename).toString().replace(_BOM, '');
  }
  func = exports.compile(template, options);
  if (options.cache) {
    exports.cache.set(filename, func);
  }
  return func;
}

/**
 * Try calling handleCache with the given options and data and call the
 * callback with the result. If an error occurs, call the callback with
 * the error. Used by renderFile().
 *
 * @memberof module:ejs-internal
 * @param {Options} options    compilation options
 * @param {Object} data        template data
 * @param {RenderFileCallback} cb callback
 * @static
 */

function tryHandleCache(options, data, cb) {
  var result;
  try {
    result = handleCache(options)(data);
  }
  catch (err) {
    return cb(err);
  }
  return cb(null, result);
}

/**
 * fileLoader is independent
 *
 * @param {String} filePath ejs file path.
 * @return {String} The contents of the specified file.
 * @static
 */

function fileLoader(filePath){
  return exports.fileLoader(filePath);
}

/**
 * Get the template function.
 *
 * If `options.cache` is `true`, then the template is cached.
 *
 * @memberof module:ejs-internal
 * @param {String}  path    path for the specified file
 * @param {Options} options compilation options
 * @return {(TemplateFunction|ClientFunction)}
 * Depending on the value of `options.client`, either type might be returned
 * @static
 */

function includeFile(path$$2, options) {
  var opts = utils$2.shallowCopy({}, options);
  opts.filename = getIncludePath(path$$2, opts);
  return handleCache(opts);
}

/**
 * Get the JavaScript source of an included file.
 *
 * @memberof module:ejs-internal
 * @param {String}  path    path for the specified file
 * @param {Options} options compilation options
 * @return {Object}
 * @static
 */

function includeSource(path$$2, options) {
  var opts = utils$2.shallowCopy({}, options);
  var includePath;
  var template;
  includePath = getIncludePath(path$$2, opts);
  template = fileLoader(includePath).toString().replace(_BOM, '');
  opts.filename = includePath;
  var templ = new Template(template, opts);
  templ.generateSource();
  return {
    source: templ.source,
    filename: includePath,
    template: template
  };
}

/**
 * Re-throw the given `err` in context to the `str` of ejs, `filename`, and
 * `lineno`.
 *
 * @implements RethrowCallback
 * @memberof module:ejs-internal
 * @param {Error}  err      Error object
 * @param {String} str      EJS source
 * @param {String} filename file name of the EJS file
 * @param {String} lineno   line number of the error
 * @static
 */

function rethrow(err, str, flnm, lineno, esc){
  var lines = str.split('\n');
  var start = Math.max(lineno - 3, 0);
  var end = Math.min(lines.length, lineno + 3);
  var filename = esc(flnm); // eslint-disable-line
  // Error context
  var context = lines.slice(start, end).map(function (line, i){
    var curr = i + start + 1;
    return (curr == lineno ? ' >> ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'ejs') + ':'
    + lineno + '\n'
    + context + '\n\n'
    + err.message;

  throw err;
}

function stripSemi(str){
  return str.replace(/;(\s*$)/, '$1');
}

/**
 * Compile the given `str` of ejs into a template function.
 *
 * @param {String}  template EJS template
 *
 * @param {Options} opts     compilation options
 *
 * @return {(TemplateFunction|ClientFunction)}
 * Depending on the value of `opts.client`, either type might be returned.
 * @public
 */

exports.compile = function compile(template, opts) {
  var templ;

  // v1 compat
  // 'scope' is 'context'
  // FIXME: Remove this in a future version
  if (opts && opts.scope) {
    if (!scopeOptionWarned){
      console.warn('`scope` option is deprecated and will be removed in EJS 3');
      scopeOptionWarned = true;
    }
    if (!opts.context) {
      opts.context = opts.scope;
    }
    delete opts.scope;
  }
  templ = new Template(template, opts);
  return templ.compile();
};

/**
 * Render the given `template` of ejs.
 *
 * If you would like to include options but not data, you need to explicitly
 * call this function with `data` being an empty object or `null`.
 *
 * @param {String}   template EJS template
 * @param {Object}  [data={}] template data
 * @param {Options} [opts={}] compilation and rendering options
 * @return {String}
 * @public
 */

exports.render = function (template, d, o) {
  var data = d || {};
  var opts = o || {};

  // No options object -- if there are optiony names
  // in the data, copy them to options
  if (arguments.length == 2) {
    utils$2.shallowCopyFromList(opts, data, _OPTS);
  }

  return handleCache(opts, template)(data);
};

/**
 * Render an EJS file at the given `path` and callback `cb(err, str)`.
 *
 * If you would like to include options but not data, you need to explicitly
 * call this function with `data` being an empty object or `null`.
 *
 * @param {String}             path     path to the EJS file
 * @param {Object}            [data={}] template data
 * @param {Options}           [opts={}] compilation and rendering options
 * @param {RenderFileCallback} cb callback
 * @public
 */

exports.renderFile = function () {
  var filename = arguments[0];
  var cb = arguments[arguments.length - 1];
  var opts = {filename: filename};
  var data;

  if (arguments.length > 2) {
    data = arguments[1];

    // No options object -- if there are optiony names
    // in the data, copy them to options
    if (arguments.length === 3) {
      // Express 4
      if (data.settings) {
        if (data.settings['view options']) {
          utils$2.shallowCopyFromList(opts, data.settings['view options'], _OPTS_EXPRESS);
        }
        if (data.settings.views) {
          opts.views = data.settings.views;
        }
      }
      // Express 3 and lower
      else {
        utils$2.shallowCopyFromList(opts, data, _OPTS_EXPRESS);
      }
    }
    else {
      // Use shallowCopy so we don't pollute passed in opts obj with new vals
      utils$2.shallowCopy(opts, arguments[2]);
    }

    opts.filename = filename;
  }
  else {
    data = {};
  }

  return tryHandleCache(opts, data, cb);
};

/**
 * Clear intermediate JavaScript cache. Calls {@link Cache#reset}.
 * @public
 */

exports.clearCache = function () {
  exports.cache.reset();
};

function Template(text, opts) {
  opts = opts || {};
  var options = {};
  this.templateText = text;
  this.mode = null;
  this.truncate = false;
  this.currentLine = 1;
  this.source = '';
  this.dependencies = [];
  options.client = opts.client || false;
  options.escapeFunction = opts.escape || utils$2.escapeXML;
  options.compileDebug = opts.compileDebug !== false;
  options.debug = !!opts.debug;
  options.filename = opts.filename;
  options.delimiter = opts.delimiter || exports.delimiter || _DEFAULT_DELIMITER;
  options.strict = opts.strict || false;
  options.context = opts.context;
  options.cache = opts.cache || false;
  options.rmWhitespace = opts.rmWhitespace;
  options.root = opts.root;
  options.localsName = opts.localsName || exports.localsName || _DEFAULT_LOCALS_NAME;
  options.views = opts.views;

  if (options.strict) {
    options._with = false;
  }
  else {
    options._with = typeof opts._with != 'undefined' ? opts._with : true;
  }

  this.opts = options;

  this.regex = this.createRegex();
}

Template.modes = {
  EVAL: 'eval',
  ESCAPED: 'escaped',
  RAW: 'raw',
  COMMENT: 'comment',
  LITERAL: 'literal'
};

Template.prototype = {
  createRegex: function () {
    var str = _REGEX_STRING;
    var delim = utils$2.escapeRegExpChars(this.opts.delimiter);
    str = str.replace(/%/g, delim);
    return new RegExp(str);
  },

  compile: function () {
    var src;
    var fn;
    var opts = this.opts;
    var prepended = '';
    var appended = '';
    var escapeFn = opts.escapeFunction;

    if (!this.source) {
      this.generateSource();
      prepended += '  var __output = [], __append = __output.push.bind(__output);' + '\n';
      if (opts._with !== false) {
        prepended +=  '  with (' + opts.localsName + ' || {}) {' + '\n';
        appended += '  }' + '\n';
      }
      appended += '  return __output.join("");' + '\n';
      this.source = prepended + this.source + appended;
    }

    if (opts.compileDebug) {
      src = 'var __line = 1' + '\n'
          + '  , __lines = ' + JSON.stringify(this.templateText) + '\n'
          + '  , __filename = ' + (opts.filename ?
                JSON.stringify(opts.filename) : 'undefined') + ';' + '\n'
          + 'try {' + '\n'
          + this.source
          + '} catch (e) {' + '\n'
          + '  rethrow(e, __lines, __filename, __line, escapeFn);' + '\n'
          + '}' + '\n';
    }
    else {
      src = this.source;
    }

    if (opts.client) {
      src = 'escapeFn = escapeFn || ' + escapeFn.toString() + ';' + '\n' + src;
      if (opts.compileDebug) {
        src = 'rethrow = rethrow || ' + rethrow.toString() + ';' + '\n' + src;
      }
    }

    if (opts.strict) {
      src = '"use strict";\n' + src;
    }
    if (opts.debug) {
      console.log(src);
    }

    try {
      fn = new Function(opts.localsName + ', escapeFn, include, rethrow', src);
    }
    catch(e) {
      // istanbul ignore else
      if (e instanceof SyntaxError) {
        if (opts.filename) {
          e.message += ' in ' + opts.filename;
        }
        e.message += ' while compiling ejs\n\n';
        e.message += 'If the above error is not helpful, you may want to try EJS-Lint:\n';
        e.message += 'https://github.com/RyanZim/EJS-Lint';
      }
      throw e;
    }

    if (opts.client) {
      fn.dependencies = this.dependencies;
      return fn;
    }

    // Return a callable function which will execute the function
    // created by the source-code, with the passed data as locals
    // Adds a local `include` function which allows full recursive include
    var returnedFn = function (data) {
      var include = function (path$$2, includeData) {
        var d = utils$2.shallowCopy({}, data);
        if (includeData) {
          d = utils$2.shallowCopy(d, includeData);
        }
        return includeFile(path$$2, opts)(d);
      };
      return fn.apply(opts.context, [data || {}, escapeFn, include, rethrow]);
    };
    returnedFn.dependencies = this.dependencies;
    return returnedFn;
  },

  generateSource: function () {
    var opts = this.opts;

    if (opts.rmWhitespace) {
      // Have to use two separate replace here as `^` and `$` operators don't
      // work well with `\r`.
      this.templateText =
        this.templateText.replace(/\r/g, '').replace(/^\s+|\s+$/gm, '');
    }

    // Slurp spaces and tabs before <%_ and after _%>
    this.templateText =
      this.templateText.replace(/[ \t]*<%_/gm, '<%_').replace(/_%>[ \t]*/gm, '_%>');

    var self = this;
    var matches = this.parseTemplateText();
    var d = this.opts.delimiter;

    if (matches && matches.length) {
      matches.forEach(function (line, index) {
        var opening;
        var closing;
        var include;
        var includeOpts;
        var includeObj;
        var includeSrc;
        // If this is an opening tag, check for closing tags
        // FIXME: May end up with some false positives here
        // Better to store modes as k/v with '<' + delimiter as key
        // Then this can simply check against the map
        if ( line.indexOf('<' + d) === 0        // If it is a tag
          && line.indexOf('<' + d + d) !== 0) { // and is not escaped
          closing = matches[index + 2];
          if (!(closing == d + '>' || closing == '-' + d + '>' || closing == '_' + d + '>')) {
            throw new Error('Could not find matching close tag for "' + line + '".');
          }
        }
        // HACK: backward-compat `include` preprocessor directives
        if ((include = line.match(/^\s*include\s+(\S+)/))) {
          opening = matches[index - 1];
          // Must be in EVAL or RAW mode
          if (opening && (opening == '<' + d || opening == '<' + d + '-' || opening == '<' + d + '_')) {
            includeOpts = utils$2.shallowCopy({}, self.opts);
            includeObj = includeSource(include[1], includeOpts);
            if (self.opts.compileDebug) {
              includeSrc =
                  '    ; (function(){' + '\n'
                  + '      var __line = 1' + '\n'
                  + '      , __lines = ' + JSON.stringify(includeObj.template) + '\n'
                  + '      , __filename = ' + JSON.stringify(includeObj.filename) + ';' + '\n'
                  + '      try {' + '\n'
                  + includeObj.source
                  + '      } catch (e) {' + '\n'
                  + '        rethrow(e, __lines, __filename, __line, escapeFn);' + '\n'
                  + '      }' + '\n'
                  + '    ; }).call(this)' + '\n';
            }else{
              includeSrc = '    ; (function(){' + '\n' + includeObj.source +
                  '    ; }).call(this)' + '\n';
            }
            self.source += includeSrc;
            self.dependencies.push(exports.resolveInclude(include[1],
                includeOpts.filename));
            return;
          }
        }
        self.scanLine(line);
      });
    }

  },

  parseTemplateText: function () {
    var str = this.templateText;
    var pat = this.regex;
    var result = pat.exec(str);
    var arr = [];
    var firstPos;

    while (result) {
      firstPos = result.index;

      if (firstPos !== 0) {
        arr.push(str.substring(0, firstPos));
        str = str.slice(firstPos);
      }

      arr.push(result[0]);
      str = str.slice(result[0].length);
      result = pat.exec(str);
    }

    if (str) {
      arr.push(str);
    }

    return arr;
  },

  _addOutput: function (line) {
    if (this.truncate) {
      // Only replace single leading linebreak in the line after
      // -%> tag -- this is the single, trailing linebreak
      // after the tag that the truncation mode replaces
      // Handle Win / Unix / old Mac linebreaks -- do the \r\n
      // combo first in the regex-or
      line = line.replace(/^(?:\r\n|\r|\n)/, '');
      this.truncate = false;
    }
    else if (this.opts.rmWhitespace) {
      // rmWhitespace has already removed trailing spaces, just need
      // to remove linebreaks
      line = line.replace(/^\n/, '');
    }
    if (!line) {
      return line;
    }

    // Preserve literal slashes
    line = line.replace(/\\/g, '\\\\');

    // Convert linebreaks
    line = line.replace(/\n/g, '\\n');
    line = line.replace(/\r/g, '\\r');

    // Escape double-quotes
    // - this will be the delimiter during execution
    line = line.replace(/"/g, '\\"');
    this.source += '    ; __append("' + line + '")' + '\n';
  },

  scanLine: function (line) {
    var self = this;
    var d = this.opts.delimiter;
    var newLineCount = 0;

    newLineCount = (line.split('\n').length - 1);

    switch (line) {
    case '<' + d:
    case '<' + d + '_':
      this.mode = Template.modes.EVAL;
      break;
    case '<' + d + '=':
      this.mode = Template.modes.ESCAPED;
      break;
    case '<' + d + '-':
      this.mode = Template.modes.RAW;
      break;
    case '<' + d + '#':
      this.mode = Template.modes.COMMENT;
      break;
    case '<' + d + d:
      this.mode = Template.modes.LITERAL;
      this.source += '    ; __append("' + line.replace('<' + d + d, '<' + d) + '")' + '\n';
      break;
    case d + d + '>':
      this.mode = Template.modes.LITERAL;
      this.source += '    ; __append("' + line.replace(d + d + '>', d + '>') + '")' + '\n';
      break;
    case d + '>':
    case '-' + d + '>':
    case '_' + d + '>':
      if (this.mode == Template.modes.LITERAL) {
        this._addOutput(line);
      }

      this.mode = null;
      this.truncate = line.indexOf('-') === 0 || line.indexOf('_') === 0;
      break;
    default:
        // In script mode, depends on type of tag
      if (this.mode) {
          // If '//' is found without a line break, add a line break.
        switch (this.mode) {
        case Template.modes.EVAL:
        case Template.modes.ESCAPED:
        case Template.modes.RAW:
          if (line.lastIndexOf('//') > line.lastIndexOf('\n')) {
            line += '\n';
          }
        }
        switch (this.mode) {
            // Just executing code
        case Template.modes.EVAL:
          this.source += '    ; ' + line + '\n';
          break;
            // Exec, esc, and output
        case Template.modes.ESCAPED:
          this.source += '    ; __append(escapeFn(' + stripSemi(line) + '))' + '\n';
          break;
            // Exec and output
        case Template.modes.RAW:
          this.source += '    ; __append(' + stripSemi(line) + ')' + '\n';
          break;
        case Template.modes.COMMENT:
              // Do nothing
          break;
            // Literal <%% mode, append as raw output
        case Template.modes.LITERAL:
          this._addOutput(line);
          break;
        }
      }
        // In string mode, just add the output
      else {
        this._addOutput(line);
      }
    }

    if (self.opts.compileDebug && newLineCount) {
      this.currentLine += newLineCount;
      this.source += '    ; __line = ' + this.currentLine + '\n';
    }
  }
};

/**
 * Escape characters reserved in XML.
 *
 * This is simply an export of {@link module:utils.escapeXML}.
 *
 * If `markup` is `undefined` or `null`, the empty string is returned.
 *
 * @param {String} markup Input string
 * @return {String} Escaped string
 * @public
 * @func
 * */
exports.escapeXML = utils$2.escapeXML;

/**
 * Express.js support.
 *
 * This is an alias for {@link module:ejs.renderFile}, in order to support
 * Express.js out-of-the-box.
 *
 * @func
 */

exports.__express = exports.renderFile;

// Add require support
/* istanbul ignore else */
if (commonjsRequire.extensions) {
  commonjsRequire.extensions['.ejs'] = function (module, flnm) {
    var filename = flnm || /* istanbul ignore next */ module.filename;
    var options = {
      filename: filename,
      client: true
    };
    var template = fileLoader(filename).toString();
    var fn = exports.compile(template, options);
    module._compile('module.exports = ' + fn.toString() + ';', filename);
  };
}

/**
 * Version of EJS.
 *
 * @readonly
 * @type {String}
 * @public
 */

exports.VERSION = _VERSION_STRING;

/**
 * Name for detection of EJS.
 *
 * @readonly
 * @type {String}
 * @public
 */

exports.name = _NAME;

/* istanbul ignore if */
if (typeof window != 'undefined') {
  window.ejs = exports;
}
});

var ejs_1 = ejs.cache;
var ejs_2 = ejs.fileLoader;
var ejs_3 = ejs.localsName;
var ejs_4 = ejs.resolveInclude;
var ejs_5 = ejs.compile;
var ejs_6 = ejs.render;
var ejs_7 = ejs.renderFile;
var ejs_8 = ejs.clearCache;
var ejs_9 = ejs.escapeXML;
var ejs_10 = ejs.__express;
var ejs_11 = ejs.VERSION;
var ejs_12 = ejs.name;

/*!
 * Nodeunit
 * Copyright (c) 2010 Caolan McMahon
 * MIT Licensed
 */

/**
 * Module dependencies
 */

var AssertionError = assert_1.AssertionError;


/**
 * Reporter info string
 */

var info = "jUnit XML test reports";


/**
 * Ensures a directory exists using mkdir -p.
 *
 * @param {String} path
 * @param {Function} callback
 * @api private
 */

var ensureDir = function (path$$2, callback) {
    var mkdir = child_process.spawn('mkdir', ['-p', path$$2]);
    mkdir.on('error', function (err) {
        callback(err);
        callback = function(){};
    });
    mkdir.on('exit', function (code) {
        if (code === 0) callback();
        else callback(new Error('mkdir exited with code: ' + code));
    });
};


/**
 * Returns absolute version of a path. Relative paths are interpreted
 * relative to process.cwd() or the cwd parameter. Paths that are already
 * absolute are returned unaltered.
 *
 * @param {String} p
 * @param {String} cwd
 * @return {String}
 * @api public
 */

var abspath = function (p, /*optional*/cwd) {
    if (p[0] === '/') return p;
    cwd = cwd || process.cwd();
    return path.normalize(path.resolve(p));
};


/**
 * Run all tests within each module, reporting the results to the command-line,
 * then writes out junit-compatible xml documents.
 *
 * @param {Array} files
 * @api public
 */

var run = function (files, opts, callback) {
    if (!opts.output) {
        console.error(
            'Error: No output directory defined.\n' +
            '\tEither add an "output" property to your nodeunit.json config ' +
            'file, or\n\tuse the --output command line option.'
        );
        return;
    }
    opts.output = abspath(opts.output);
    var error = function (str) {
        return opts.error_prefix + str + opts.error_suffix;
    };
    var ok    = function (str) {
        return opts.ok_prefix + str + opts.ok_suffix;
    };
    var bold  = function (str) {
        return opts.bold_prefix + str + opts.bold_suffix;
    };

    var start = new Date().getTime();
    var paths = files.map(function (p) {
        return path.resolve(p);
    });

    var modules = {};
    var curModule;

    nodeunit$2.runFiles(paths, {
        testspec: opts.testspec,
        testFullSpec: opts.testFullSpec,
        moduleStart: function (name) {
            curModule = {
                errorCount: 0,
                failureCount: 0,
                tests: 0,
                testcases: {},
                name: name,
                start: new Date().getTime()
            };
            modules[name] = curModule;
        },
        testStart: function(name) {
            curModule.testcases[name] = {name: name, start : new Date().getTime()};
        },
        moduleDone: function(name) {
            curModule.end =  new Date().getTime();
        },
        testDone: function (name, assertions) {
            var testcase = curModule.testcases[name];
            testcase.end = new Date().getTime();
            for (var i=0; i<assertions.length; i++) {
                var a = assertions[i];
                if (a.failed()) {
                    a = utils.betterErrors(a);
                    testcase.failure = {
                        message: a.message,
                        backtrace: a.error.stack
                    };

                    if (a.error instanceof AssertionError) {
                        curModule.failureCount++;
                    }
                    else {
                        curModule.errorCount++;
                    }
                    break;
                }
            }
            curModule.tests++;
            curModule.testcases[name] = testcase;
        },
        done: function (assertions) {
            var end = new Date().getTime();
            ensureDir(opts.output, function (err) {
                var tmpl = __dirname + "/../../share/junit.xml.ejs";
                fs.readFile(tmpl, function (err, data) {
                    if (err) throw err;
                    var tmpl = data.toString();
                    for(var k in modules) {
                        var module = modules[k];
                        var rendered = ejs.render(tmpl, {
                            suites: [module]
                        });
                        var filename = path.resolve(
                            opts.output,
                            module.name + '.xml'
                        );
                        console.log('Writing ' + filename);
                        fs.writeFileSync(filename, rendered, 'utf8');
                    }
                    if (assertions.failures()) {
                        console.log(
                            '\n' + bold(error('FAILURES: ')) +
                            assertions.failures() + '/' +
                            assertions.length + ' assertions failed (' +
                            assertions.duration + 'ms)'
                    	);
                    }
                    else {
                        console.log(
                            '\n' + bold(ok('OK: ')) + assertions.length +
                            ' assertions (' + assertions.duration + 'ms)'
                        );
                    }
                    
                    if (callback) callback(assertions.failures() ? new Error('We have got test failures.') : undefined);
                });
            });
        }
    });
};

var junit = {
	info: info,
	run: run
};

var track = createCommonjsModule(function (module, exports) {
/*!
 * Simple util module to track tests. Adds a process.exit hook to print
 * the undone tests.
 */


exports.createTracker = function (on_exit) {
    var names = {};
    var tracker = {
        names: function () {
            var arr = [];
            for (var k in names) {
                if (names.hasOwnProperty(k)) {
                    arr.push(k);
                }
            }
            return arr;
        },
        unfinished: function () {
            return tracker.names().length;
        },
        put: function (testname) {
            names[testname] = testname;
        },
        remove: function (testname) {
            delete names[testname];
        }
    };

    process.on('exit', function() {
        on_exit = on_exit || exports.default_on_exit;
        on_exit(tracker);
    });

    return tracker;
};

exports.default_on_exit = function (tracker) {
    if (tracker.unfinished()) {
        console.log('');
        console.log('Undone tests (or their setups/teardowns): ');
        var names = tracker.names();
        for (var i = 0; i < names.length; i += 1) {
            console.log(names[i]);
        }
        process.reallyExit(tracker.unfinished());
    }
};
});

var track_1 = track.createTracker;
var track_2 = track.default_on_exit;

/*!
 * Nodeunit
 * Copyright (c) 2010 Caolan McMahon
 * MIT Licensed
 */

/**
 * Module dependencies
 */

var AssertionError$1 = assert_1.AssertionError;

/**
 * Reporter info string
 */

var info$1 = "Default tests reporter";


/**
 * Run all tests within each module, reporting the results to the command-line.
 *
 * @param {Array} files
 * @api public
 */

var run$1 = function (files, options, callback) {

    if (!options) {
        // load default options
        var content = fs.readFileSync(
            __dirname + '/../../bin/nodeunit.json', 'utf8'
        );
        options = JSON.parse(content);
    }

    var error = function (str) {
        return options.error_prefix + str + options.error_suffix;
    };
    var ok    = function (str) {
        return options.ok_prefix + str + options.ok_suffix;
    };
    var bold  = function (str) {
        return options.bold_prefix + str + options.bold_suffix;
    };
    var assertion_message = function (str) {
        return options.assertion_prefix + str + options.assertion_suffix;
    };
    var pass_indicator = process.platform === 'win32' ? '\u221A' : '✔';
    var fail_indicator = process.platform === 'win32' ? '\u00D7' : '✖';

    var start = new Date().getTime();
    var tracker = track.createTracker(function (tracker) {
        if (tracker.unfinished()) {
            console.log('');
            console.log(error(bold(
                'FAILURES: Undone tests (or their setups/teardowns): '
            )));
            var names = tracker.names();
            for (var i = 0; i < names.length; i += 1) {
                console.log('- ' + names[i]);
            }
            console.log('');
            console.log('To fix this, make sure all tests call test.done()');
            process.reallyExit(tracker.unfinished());
        }
    });

	var opts = {
	    testspec: options.testspec,
	    testFullSpec: options.testFullSpec,
        recursive: options.recursive,
        moduleStart: function (name) {
            console.log('\n' + bold(name));
        },
        testDone: function (name, assertions) {
            tracker.remove(name);

            if (!assertions.failures()) {
                console.log(pass_indicator + ' ' + name);
            }
            else {
                console.log(error(fail_indicator + ' ' + name) + '\n');
                assertions.forEach(function (a) {
                    if (a.failed()) {
                        a = utils.betterErrors(a);
                        if (a.error instanceof AssertionError$1 && a.message) {
                            console.log(
                                'Assertion Message: ' +
                                assertion_message(a.message)
                            );
                        }
                        console.log(a.error.stack + '\n');
                    }
                });
            }
        },
        done: function (assertions, end) {
            var end = end || new Date().getTime();
            if (assertions.failures()) {
                console.log(
                    '\n' + bold(error('FAILURES: ')) + assertions.failures() +
                    '/' + assertions.length + ' assertions failed (' +
                    assertions.duration + 'ms)'
                );
            }
            else {
                console.log(
                   '\n' + bold(ok('OK: ')) + assertions.length +
                   ' assertions (' + assertions.duration + 'ms)'
                );
            }

            if (callback) callback(assertions.failures() ? new Error('We have got test failures.') : undefined);
        },
        testStart: function(name) {
            tracker.put(name);
        }
    };
	if (files && files.length) {
	    var paths = files.map(function (p) {
	        return path.resolve(p);
	    });
	    nodeunit$2.runFiles(paths, opts);
	} else {
		nodeunit$2.runModules(files,opts);
	}
};

var _default = {
	info: info$1,
	run: run$1
};

/*!
 * Nodeunit
 * Copyright (c) 2010 Caolan McMahon
 * MIT Licensed
 */

/**
 * Module dependencies
 */

var AssertionError$2 = assert_1.AssertionError;

/**
 * Reporter info string
 */

var info$2 = "Skip passed tests output";

/**
 * Run all tests within each module, reporting the results to the command-line.
 *
 * @param {Array} files
 * @api public
 */

var run$2 = function (files, options, callback) {

    if (!options) {
        // load default options
        var content = fs.readFileSync(
            __dirname + '/../../bin/nodeunit.json', 'utf8'
        );
        options = JSON.parse(content);
    }

    var error = function (str) {
        return options.error_prefix + str + options.error_suffix;
    };
    var ok    = function (str) {
        return options.ok_prefix + str + options.ok_suffix;
    };
    var bold  = function (str) {
        return options.bold_prefix + str + options.bold_suffix;
    };
    var assertion_message = function (str) {
        return options.assertion_prefix + str + options.assertion_suffix;
    };
    var pass_indicator = process.platform === 'win32' ? '\u221A' : '✔';
    var fail_indicator = process.platform === 'win32' ? '\u00D7' : '✖';

    var start = new Date().getTime();
    var paths = files.map(function (p) {
        return path.resolve(p);
    });

    nodeunit$2.runFiles(paths, {
        testspec: options.testspec,
        testFullSpec: options.testFullSpec,
        moduleStart: function (name) {
            console.log('\n' + bold(name));
        },
        testDone: function (name, assertions) {
            if (assertions.failures()) {
                console.log(error(fail_indicator + ' ' + name) + '\n');
                assertions.forEach(function (a) {
                    if (a.failed()) {
                        a = utils.betterErrors(a);
                        if (a.error instanceof AssertionError$2 && a.message) {
                            console.log(
                                'Assertion Message: ' + assertion_message(a.message)
                            );
                        }
                        console.log(a.error.stack + '\n');
                    }
                });
            }
        },
        moduleDone: function (name, assertions) {
            if (!assertions.failures()) {
                console.log(pass_indicator + ' all tests passed');
            }
            else {
                console.log(error(fail_indicator + ' some tests failed'));
            }
        },
        done: function (assertions) {
            var end = new Date().getTime();
            if (assertions.failures()) {
                console.log(
                    '\n' + bold(error('FAILURES: ')) + assertions.failures() +
                    '/' + assertions.length + ' assertions failed (' +
                    assertions.duration + 'ms)'
                );
            }
            else {
                console.log(
                    '\n' + bold(ok('OK: ')) + assertions.length +
                    ' assertions (' + assertions.duration + 'ms)'
                );
            }

            if (callback) callback(assertions.failures() ? new Error('We have got test failures.') : undefined);
        }
    });
};

var skip_passed = {
	info: info$2,
	run: run$2
};

/*!
 * Nodeunit
 * Copyright (c) 2010 Caolan McMahon
 * MIT Licensed
 */

/**
 * Module dependencies
 */

var AssertionError$3 = assert_1.AssertionError;

/**
 * Reporter info string
 */

var info$3 = "Pretty minimal output";

/**
 * Run all tests within each module, reporting the results to the command-line.
 *
 * @param {Array} files
 * @api public
 */

var run$3 = function (files, options, callback) {

    if (!options) {
        // load default options
        var content = fs.readFileSync(
            __dirname + '/../../bin/nodeunit.json', 'utf8'
        );
        options = JSON.parse(content);
    }

    var red   = function (str) {
        return options.error_prefix + str + options.error_suffix;
    };
    var green = function (str) {
        return options.ok_prefix + str + options.ok_suffix;
    };
    var magenta = function (str) {
        return options.assertion_prefix + str + options.assertion_suffix;
    };
    var bold  = function (str) {
        return options.bold_prefix + str + options.bold_suffix;
    };

    var start = new Date().getTime();

    var tracker = track.createTracker(function (tracker) {
        if (tracker.unfinished()) {
            console.log('');
            console.log(bold(red(
                'FAILURES: Undone tests (or their setups/teardowns): '
            )));
            var names = tracker.names();
            for (var i = 0; i < names.length; i += 1) {
                console.log('- ' + names[i]);
            }
            console.log('');
            console.log('To fix this, make sure all tests call test.done()');
            process.reallyExit(tracker.unfinished());
        }
    });


	var opts = {
	    testspec: options.testspec,
	    testFullSpec: options.testFullSpec,
        moduleStart: function (name) {
            process.stdout.write(bold(name) + ': ');
        },
        moduleDone: function (name, assertions) {
            console.log('');
            if (assertions.failures()) {
                assertions.forEach(function (a) {
                    if (a.failed()) {
                        a = utils.betterErrors(a);
                        if (a.error instanceof AssertionError$3 && a.message) {
                            console.log(
                                'Assertion in test ' + bold(a.testname) + ': ' +
                                magenta(a.message)
                            );
                        }
                        console.log(a.error.stack + '\n');
                    }
                });
            }

        },
        testStart: function (name) {
            tracker.put(name);
        },
        testDone: function (name, assertions) {
            tracker.remove(name);

            if (!assertions.failures()) {
                process.stdout.write('.');
            }
            else {
                process.stdout.write(red('F'));
                assertions.forEach(function (assertion) {
                    assertion.testname = name;
                });
            }
        },
        done: function (assertions) {
            var end = new Date().getTime();
            if (assertions.failures()) {
                console.log(
                    '\n' + bold(red('FAILURES: ')) + assertions.failures() +
                    '/' + assertions.length + ' assertions failed (' +
                    assertions.duration + 'ms)'
                );
            }
            else {
                console.log(
                    '\n' + bold(green('OK: ')) + assertions.length +
                    ' assertions (' + assertions.duration + 'ms)'
                );
            }

            if (callback) callback(assertions.failures() ? new Error('We have got test failures.') : undefined);
        }
    };

	if (files && files.length) {
      var paths = files.map(function (p) {
          return path.resolve(p);
      });
	    nodeunit$2.runFiles(paths, opts);
	} else {
		nodeunit$2.runModules(files,opts);
	}
};

var minimal = {
	info: info$3,
	run: run$3
};

/*!
 * Nodeunit
 * Copyright (c) 2010 Caolan McMahon
 * MIT Licensed
 */

/**
 * Module dependencies
 */

var AssertionError$4 = assert_1.AssertionError;

/**
 * Reporter info string
 */

var info$4 = "Report tests result as HTML";

/**
 * Run all tests within each module, reporting the results to the command-line.
 *
 * @param {Array} files
 * @api public
 */

var run$4 = function (files, options, callback) {

    var start = new Date().getTime();
    var paths = files.map(function (p) {
        return path.resolve(p);
    });

    console.log('<html>');
    console.log('<head>');
    console.log('<title></title>');
    console.log('<style type="text/css">');
    console.log('body { font: 12px Helvetica Neue }');
    console.log('h2 { margin:0 ; padding:0 }');
    console.log('pre { font: 11px Andale Mono; margin-left: 1em; padding-left: 1em; margin-top:0; font-size:smaller;}');
    console.log('.assertion_message { margin-left: 1em; }');
    console.log('  ol {' +
    '	list-style: none;' +
    '	margin-left: 1em;' +
    '	padding-left: 1em;' +
    '	text-indent: -1em;' +
    '}');
    console.log('  ol li.pass:before { content: "\\2714 \\0020"; }');
    console.log('  ol li.fail:before { content: "\\2716 \\0020"; }');
    console.log('</style>');
    console.log('</head>');
    console.log('<body>');
    nodeunit$2.runFiles(paths, {
        testspec: options.testspec,
        testFullSpec: options.testFullSpec,
        moduleStart: function (name) {
            console.log('<h2>' + name + '</h2>');
            console.log('<ol>');
        },
        testDone: function (name, assertions) {
            if (!assertions.failures()) {
                console.log('<li class="pass">' + name + '</li>');
            }
            else {
                console.log('<li class="fail">' + name);
                assertions.forEach(function (a) {
                    if (a.failed()) {
                        a = utils.betterErrors(a);
                        if (a.error instanceof AssertionError$4 && a.message) {
                            console.log('<div class="assertion_message">' +
                                'Assertion Message: ' + a.message +
                            '</div>');
                        }
                        console.log('<pre>');
                        console.log(a.error.stack);
                        console.log('</pre>');
                    }
                });
                console.log('</li>');
            }
        },
        moduleDone: function () {
            console.log('</ol>');
        },
        done: function (assertions) {
            var end = new Date().getTime();
            if (assertions.failures()) {
                console.log(
                    '<h3>FAILURES: '  + assertions.failures() +
                    '/' + assertions.length + ' assertions failed (' +
                    assertions.duration + 'ms)</h3>'
                );
            }
            else {
                console.log(
                    '<h3>OK: ' + assertions.length +
                    ' assertions (' + assertions.duration + 'ms)</h3>'
                );
            }
            console.log('</body>');
            console.log('</html>');

            if (callback) callback(assertions.failures() ? new Error('We have got test failures.') : undefined);
        }
    });
};

var html = {
	info: info$4,
	run: run$4
};

/*!
 * Nodeunit
 * Copyright (c) 2010 Caolan McMahon
 * MIT Licensed
 */

/**
 * Module dependencies
 */

var AssertionError$5 = assert_1.AssertionError;

/**
 * Reporter info string
 */

var info$5 = "Reporter for eclipse plugin";


/**
 * Run all tests within each module, reporting the results to the command-line.
 *
 * @param {Array} files
 * @api public
 */

var run$5 = function (files, options, callback) {

    var start = new Date().getTime();
    var paths = files.map(function (p) {
        if (p.indexOf('/') === 0) {
            return p;
        }
        return path.resolve(p);
    });
    var tracker = track.createTracker(function (tracker) {
        if (tracker.unfinished()) {
            console.log('');
            console.log('FAILURES: Undone tests (or their setups/teardowns): ');
            var names = tracker.names();
            for (var i = 0; i < names.length; i += 1) {
                console.log('- ' + names[i]);
            }
            console.log('');
            console.log('To fix this, make sure all tests call test.done()');
            process.reallyExit(tracker.unfinished());
        }
    });

    nodeunit$2.runFiles(paths, {
        testspec: undefined,
        moduleStart: function (name) {
            console.log('\n' + name);
        },
        testDone: function (name, assertions) {
            tracker.remove(name);

            if (!assertions.failures()) {
                console.log('✔ ' + name);
            }
            else {
                console.log('✖ ' + name + '\n');
                assertions.forEach(function (a) {
                    if (a.failed()) {
                        a = utils.betterErrors(a);
                        if (a.error instanceof AssertionError$5 && a.message) {
                            console.log(
                                'Assertion Message: ' + a.message
                            );
                        }
                        console.log(a.error.stack + '\n');
                    }
                });
            }
        },
        done: function (assertions, end) {
            var end = end || new Date().getTime();
            if (assertions.failures()) {
                console.log(
                    '\n' + 'FAILURES: ' + assertions.failures() +
                    '/' + assertions.length + ' assertions failed (' +
                    assertions.duration + 'ms)'
                );
            }
            else {
                console.log(
                   '\n' + 'OK: ' + assertions.length +
                   ' assertions (' + assertions.duration + 'ms)'
                );
            }

            if (callback) callback(assertions.failures() ? new Error('We have got test failures.') : undefined);
        },
        testStart: function (name) {
            tracker.put(name);
        }
    });
};

var eclipse = {
	info: info$5,
	run: run$5
};

/*!
 * Nodeunit
 *
 * @author  Alisue (lambdalisue@hashnote.net)
 * @url     http://hashnote.net/
 *
 * Copyright (c) 2011 Alisue
 * MIT Licensed
 */

/**
 * Module dependencies
 */

var AssertionError$6 = assert_1.AssertionError;

/**
 * Reporter info string
 */

var info$6 = "Tests reporter for machinally analysis";


/**
 * Run all tests within each module, reporting the results to the command-line.
 *
 * @param {Array} files
 * @api public
 */

var run$6 = function (files, options, callback) {
    // options doesn't effect

    var parseStack = function (stack, delimiter) {
        var parseTrace = function (trace) {
            var filename, row, column;
            pattern1 = /\s{4}at\s\S+\s\(([^:]+):(\d+):(\d+)\)/;
            pattern2 = /\s{4}at\s([^:]+):(\d+):(\d+)/;

            if (trace.match(pattern1) !== null) {
                filename = RegExp.$1;
                row = RegExp.$2;
                column = RegExp.$3;
            } else if (trace.match(pattern2) !== null) {
                filename = RegExp.$1;
                row = RegExp.$2;
                column = RegExp.$3;
            } else {
                throw new Error("Could not parse a line of stack trace: " + trace);
            }
            return {filename: filename, row: row, column: column};
        };
        if (delimiter === undefined) {
            delimiter = ':';
        }
        traceback = stack.split('\n');
        firstline = traceback.shift();
        trace = parseTrace(traceback[0]);
        return {filename: trace.filename, row: trace.row, column: trace.column, message: firstline};
    };
    var createErrorMessage = function(type, name, filename, row, column, message){
        return [type, name, filename, row, column, message].join(":");
    };
    var paths = files.map(function (p) {
        return path.resolve(p);
    });
    var tracker = track.createTracker(function (tracker) {
        if (tracker.unfinished()) {
            var names = tracker.names();
            for (var i = 0; i < names.length; i += 1) {
                console.log(createErrorMessage(
                    'Error', names[i], 
                    '', '', '', 
                    'Undone tests - To fix this, make sure all tests call test.done()'
                ));
            }
            process.reallyExit(tracker.unfinished());
        }
    });

    nodeunit$2.runFiles(paths, {
        testspec: options.testspec,
        testFullSpec: options.testFullSpec,
        moduleStart: function (name) {},
        testDone: function (name, assertions) {
            tracker.remove(name);
            if (assertions.failures()) {
                assertions.forEach(function (a) {
                    if (a.failed()) {
                        stackinfo = parseStack(a.error.stack, ':');
                        console.log(createErrorMessage(
                            'Fail', name, stackinfo.filename,
                            stackinfo.row, stackinfo.column, stackinfo.message));
                    }
                });
            }
        },
        done: function (assertions, end) {
            if (callback) callback(assertions.failures() ? new Error('We have got test failures.') : undefined);
        },
        testStart: function(name) {
            tracker.put(name);
        }
    });
};

var machineout = {
	info: info$6,
	run: run$6
};

/*!
 * Nodeunit
 * Copyright (c) 2010 Caolan McMahon
 * MIT Licensed
 */

/**
 * Module dependencies
 */

var AssertionError$7 = assert_1.AssertionError;

/**
 * Reporter info string
 */

var info$7 = "Nested test reporter";


/**
 * Run all tests within each module, reporting the results to the command-line.
 *
 * @param {Array} files
 * @api public
 */

var run$7 = function (files, options, callback) {

    if (!options) {
        // load default options
        var content = fs.readFileSync(
            __dirname + '/../../bin/nodeunit.json',
            'utf8'
        );
        options = JSON.parse(content);
    }

    var error = function (str) {
        return options.error_prefix + str + options.error_suffix;
    };
    var ok    = function (str) {
        return options.ok_prefix + str + options.ok_suffix;
    };
    var bold  = function (str) {
        return options.bold_prefix + str + options.bold_suffix;
    };
    var assertion_message = function (str) {
        return options.assertion_prefix + str + options.assertion_suffix;
    };
    var fail_indicator = process.platform === 'win32' ? '\u00D7' : '✖';

    var spaces_per_indent = options.spaces_per_indent || 4;

    var start = new Date().getTime();
    var paths = files.map(function (p) {
        return path.resolve(p);
    });
    var tracker = track.createTracker(function (tracker) {
        var i, names;
        if (tracker.unfinished()) {
            console.log('');
            console.log(error(bold(
                'FAILURES: Undone tests (or their setups/teardowns): '
            )));
            names = tracker.names();
            for (i = 0; i < names.length; i += 1) {
                console.log('- ' + names[i]);
            }
            console.log('');
            console.log('To fix this, make sure all tests call test.done()');
            process.reallyExit(tracker.unfinished());
        }
    });

    // Object to hold status of each 'part' of the testCase/name array,
    // i.e., whether this part has been printed yet.
    tracker.already_printed = {};

    var pass_text = function (txt) {
        // Print in bold green.
        return bold(ok(txt + " (pass)"));
    };

    var fail_text = function (txt) {
        return bold(error(txt + " (fail) " + fail_indicator + " "));
    };

    var status_text = function (txt, status) {
        if (status === 'pass') {
            return pass_text(txt);
        } else {
            return fail_text(txt);
        }
    };

    /**
     *  Slices an array, returns a string by joining the sliced elements.
     *  @example
     *   > name_slice(['TC1', 'TC1.1', 'mytest'], 1);
     *   "TC1,TC1.1"
     */
    var name_slice = function (name_arr, end_index) {
        return name_arr.slice(0, end_index + 1).join(",");
    };

    var indent = (function () {
        var txt = '';
        var i;
        for (i = 0; i < spaces_per_indent; i++) {
            txt += ' ';
        }
        return txt;
    }());

    // Indent once for each indent_level
    var add_indent = function (txt, indent_level) {
        var k;
        for (k = 0; k < indent_level; k++) {
            txt += indent;
        }
        return txt;
    };

    // If it's not the last element of the name_arr, it's a testCase.
    var is_testCase = function (name_arr, index) {
        return index === name_arr.length - 1 ? false : true;
    };

    var testCase_line = function (txt) {
        return txt + "\n";
    };

    /**
     * Prints (console.log) the nested test status line(s).
     *
     * @param {Array} name_arr - Array of name elements.
     * @param {String} status - either 'pass' or 'fail'.
     * @example
     *   > print_status(['TC1', 'TC1.1', 'mytest'], 'pass');
     *   TC1
     *      TC1.1
     *         mytest (pass)
     */
    var print_status = function (name_arr, status) {
        var txt = '';
        var _name_slice, part, i;
        for (i = 0; i < name_arr.length; i++) {
            _name_slice = name_slice(name_arr, i);
            part = name_arr[i];
            if (!tracker.already_printed[_name_slice]) {
                txt = add_indent(txt, i);
                if (is_testCase(name_arr, i)) {
                    txt += testCase_line(part);
                } else {
                    txt += status_text(part, status);
                }
                tracker.already_printed[_name_slice] = true;
            }
        }
        console.log(txt);
    };

    nodeunit$2.runFiles(paths, {
        testspec: options.testspec,
        testFullSpec: options.testFullSpec,
        moduleStart: function (name) {
            console.log('\n' + bold(name));
        },
        testDone: function (name, assertions) {
            tracker.remove(name);

            if (!assertions.failures()) {
                print_status(name, 'pass');
            } else {
                print_status(name, 'fail');
                assertions.forEach(function (a) {
                    if (a.failed()) {
                        a = utils.betterErrors(a);
                        if (a.error instanceof AssertionError$7 && a.message) {
                            console.log(
                                'Assertion Message: ' +
                                    assertion_message(a.message)
                            );
                        }
                        console.log(a.error.stack + '\n');
                    }
                });
            }
        },
        done: function (assertions, end) {
            end = end || new Date().getTime();
            if (assertions.failures()) {
                console.log(
                    '\n' + bold(error('FAILURES: ')) + assertions.failures() +
                        '/' + assertions.length + ' assertions failed (' +
                        assertions.duration + 'ms)'
                );
            } else {
                console.log(
                    '\n' + bold(ok('OK: ')) + assertions.length +
                        ' assertions (' + assertions.duration + 'ms)'
                );
            }
            
            if (callback) callback(assertions.failures() ? new Error('We have got test failures.') : undefined);
        },
        testStart: function (name) {
            tracker.put(name);
        }
    });
};

var nested = {
	info: info$7,
	run: run$7
};

/*!
 * Nodeunit
 * Copyright (c) 2010 Caolan McMahon
 * MIT Licensed
 */

/**
 * Module dependencies
 */

var AssertionError$8 = assert_1.AssertionError;

/**
 * Reporter info string
 */

var info$8 = "Verbose tests reporter";


/**
 * Run all tests within each module, reporting the results to the command-line.
 *
 * @param {Array} files
 * @api public
 */

var run$8 = function (files, options, callback) {

    if (!options) {
        // load default options
        var content = fs.readFileSync(
            __dirname + '/../../bin/nodeunit.json', 'utf8'
        );
        options = JSON.parse(content);
    }

    var error = function (str) {
        return options.error_prefix + str + options.error_suffix;
    };
    var ok    = function (str) {
        return options.ok_prefix + str + options.ok_suffix;
    };
    var bold  = function (str) {
        return options.bold_prefix + str + options.bold_suffix;
    };
    var pass_indicator = process.platform === 'win32' ? '\u221A' : '✔';
    var fail_indicator = process.platform === 'win32' ? '\u00D7' : '✖';

    var start = new Date().getTime();
    var paths = files.map(function (p) {
        return path.resolve(p);
    });
    var tracker = track.createTracker(function (tracker) {
        if (tracker.unfinished()) {
            console.log('');
            console.log(error(bold(
                'FAILURES: Undone tests (or their setups/teardowns): '
            )));
            var names = tracker.names();
            for (var i = 0; i < names.length; i += 1) {
                console.log('- ' + names[i]);
            }
            console.log('');
            console.log('To fix this, make sure all tests call test.done()');
            process.reallyExit(tracker.unfinished());
        }
    });

    nodeunit$2.runFiles(paths, {
        testspec: options.testspec,
        testFullSpec: options.testFullSpec,
        moduleStart: function (name) {
            console.log('\n' + bold(name));
        },
        testDone: function (name, assertions) {
            tracker.remove(name);

            if (!assertions.failures()) {
                console.log(pass_indicator + ' ' + name);
            }
            else {
                console.log(error(fail_indicator + ' ' + name));
            }
            // verbose so print everything
            assertions.forEach(function (a) {
              if (a.failed()) {
                console.log(error('  ' + fail_indicator + ' ' + a.message));
                a = utils.betterErrors(a);
                console.log('  ' + a.error.stack);
              }
              else {
                console.log('  ' + pass_indicator + ' ' + a.message);
              }
            });
        },
        done: function (assertions, end) {
            var end = end || new Date().getTime();
            if (assertions.failures()) {
                console.log(
                    '\n' + bold(error('FAILURES: ')) + assertions.failures() +
                    '/' + assertions.length + ' assertions failed (' +
                    assertions.duration + 'ms)'
                );
            }
            else {
                console.log(
                   '\n' + bold(ok('OK: ')) + assertions.length +
                   ' assertions (' + assertions.duration + 'ms)'
                );
            }
            
            if (callback) callback(assertions.failures() ? new Error('We have got test failures.') : undefined);
        },
        testStart: function(name) {
            tracker.put(name);
        }
    });
};

var verbose = {
	info: info$8,
	run: run$8
};

/**
 * Module dependencies
 */



/**
 * Reporter info string
 */

var info$9 = 'The LCOV reporter reads JS files instrumented by JSCoverage (http://siliconforks.com/jscoverage/) and outputs coverage data in the LCOV format (http://ltp.sourceforge.net/coverage/lcov/geninfo.1.php)';

/**
 * Run all tests within each module, reporting the results to the command-line.
 *
 * @param {Array} files
 * @api public
 */

var run$9 = function (files, options, callback) {

    var paths = files.map(function (p) {
        return path.resolve(p);
    });
    
    nodeunit$2.runFiles(paths, {
        done: function (assertions) {
            var cov = (commonjsGlobal || window)._$jscoverage || {};

            Object.keys(cov).forEach(function (filename) {
                var data = cov[filename];
                reportFile(filename, data);
            });
            
            if (callback) callback(assertions.failures() ? new Error('We have got test failures.') : undefined);
        }
    });
};

function reportFile(filename, data) {
    console.log('SF:' + filename);

    data.source.forEach(function(line, num) {
        // increase the line number, as JS arrays are zero-based
        num++;

        if (data[num] !== undefined) {
            console.log('DA:' + num + ',' + data[num]);
        }
    });

    console.log('end_of_record');
}

var lcov = {
	info: info$9,
	run: run$9
};

// This is a hack to make browserify skip tap
var tap;
try {
    tap = commonjsRequire('./' + 'tap');
} catch (ex) {
    tap = {
        run: function() {
            throw new Error('Sorry, tap reporter not available');
        }
    };
}

var reporters = {
    'junit': junit,
    'default': _default,
    'skip_passed': skip_passed,
    'minimal': minimal,
    'html': html,
    'eclipse': eclipse,
    'machineout': machineout,
    'tap': tap,
    'nested': nested,
    'verbose' : verbose,
    'lcov' : lcov
    // browser test reporter is not listed because it cannot be used
    // with the command line tool, only inside a browser.
};

var nodeunit$2 = createCommonjsModule(function (module, exports) {
/*!
 * Nodeunit
 * Copyright (c) 2010 Caolan McMahon
 * MIT Licensed
 */

/**
 * Module dependencies
 */




/**
 * Export sub-modules.
 */

exports.types = types;
exports.utils = utils;
exports.reporters = reporters;
exports.assert = assert_1;

// backwards compatibility
exports.testrunner = {
    run: function () {
        console.log(
            'WARNING: nodeunit.testrunner is going to be deprecated, please ' +
            'use nodeunit.reporters.default instead!'
        );
        return reporters['default'].run.apply(this, arguments);
    }
};


/**
 * Export all core functions
 */

for (var k in core) {
    exports[k] = core[k];
}


/**
 * Load modules from paths array and run all exported tests in series. If a path
 * is a directory, load all supported file types inside it as modules. This only
 * reads 1 level deep in the directory and does not recurse through
 * sub-directories.
 *
 * @param {Array} paths
 * @param {Object} opt
 * @api public
 */

exports.runFiles = function (paths, opt) {
    var all_assertions = [];
    var options = types.options(opt);
    var start = new Date().getTime();

    if (!paths.length) {
        return options.done(types.assertionList(all_assertions));
    }

    utils.modulePaths(paths, function (err, files) {
        if (err) throw err;
        async.concatSeries(files, function (file, cb) {
            var name = path.basename(file);
            exports.runModule(name, commonjsRequire(file), options, cb);
        },
        function (err, all_assertions) {
            var end = new Date().getTime();
            exports.done();
            options.done(types.assertionList(all_assertions, end - start));
        });
    }, options.recursive);

};

/* Export all prototypes from events.EventEmitter */
var label;
for (label in events.EventEmitter.prototype) {
  exports[label] = events.EventEmitter.prototype[label];
}

/* Emit event 'complete' on completion of a test suite. */
exports.complete = function(name, assertions)
{
    exports.emit('complete', name, assertions);
};

/* Emit event 'complete' on completion of all tests. */
exports.done = function()
{
    exports.emit('done');
};

module.exports = exports;
});

var nodeunit_1$1 = nodeunit$2.types;
var nodeunit_2 = nodeunit$2.utils;
var nodeunit_3 = nodeunit$2.reporters;
var nodeunit_4 = nodeunit$2.assert;
var nodeunit_5 = nodeunit$2.testrunner;
var nodeunit_6 = nodeunit$2.runFiles;
var nodeunit_7 = nodeunit$2.complete;
var nodeunit_8 = nodeunit$2.done;

// This file is just added for convenience so this repository can be
// directly checked out into a project's deps folder
var nodeunit = nodeunit$2;

var nodeunit_1 = nodeunit.runModules;

// From https://github.com/brettz9/jamilih/blob/master/polyfills/XMLSerializer.js
/* globals DOMException */
/**
* Currently applying not only as a polyfill for IE but for other browsers in order to ensure consistent serialization. For example,
*  its serialization method is serializing attributes in alphabetical order despite Mozilla doing so in document order since
* IE does not appear to otherwise give a readily determinable order
* @license MIT, GPL, Do what you want
* @requires polyfill: Array.from
* @requires polyfill: Array.prototype.map
* @requires polyfill: Node.prototype.lookupNamespaceURI
* @todo NOT COMPLETE! Especially for namespaces
*/
const XMLSerializer$1 = function () {};
const xhtmlNS = 'http://www.w3.org/1999/xhtml';
const prohibitHTMLOnly = true;
const emptyElements = '|basefont|frame|isindex' + // Deprecated
    '|area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr|';
const nonEmptyElements = 'article|aside|audio|bdi|canvas|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|rp|rt|ruby|section|summary|time|video' + // new in HTML5
    'html|body|p|h1|h2|h3|h4|h5|h6|form|button|fieldset|label|legend|select|option|optgroup|textarea|table|tbody|colgroup|tr|td|tfoot|thead|th|caption|abbr|acronym|address|b|bdo|big|blockquote|center|code|cite|del|dfn|em|font|i|ins|kbd|pre|q|s|samp|small|strike|strong|sub|sup|tt|u|var|ul|ol|li|dd|dl|dt|dir|menu|frameset|iframe|noframes|head|title|a|map|div|span|style|script|noscript|applet|object|';
const pubIdChar = /^(\u0020|\u000D|\u000A|[a-zA-Z0-9]|[-'()+,./:=?;!*#@$_%])*$/;
const xmlChars = /([\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD]|[\uD800-\uDBFF][\uDC00-\uDFFF])*$/;

const entify = function (str) { // FIX: this is probably too many replaces in some cases and a call to it may not be needed at all in some cases
    return str.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
};
const clone = function (obj) { // We don't need a deep clone, so this should be sufficient without recursion
    let prop;
    const newObj = {};
    for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            newObj[prop] = obj[prop];
        }
    }
    return JSON.parse(JSON.stringify(newObj));
};
const invalidStateError = function () { // These are probably only necessary if working with text/html
    if (prohibitHTMLOnly) {
        // INVALID_STATE_ERR per section 9.3 XHTML 5: http://www.w3.org/TR/html5/the-xhtml-syntax.html
        throw window.DOMException && DOMException.create
            ? DOMException.create(11)
            // If the (nonstandard) polyfill plugin helper is not loaded (e.g., to reduce overhead and/or modifying a global's property), we'll throw our own light DOMException
            : {message: 'INVALID_STATE_ERR: DOM Exception 11', code: 11};
    }
};
const addExternalID = function (node, all) {
    if (node.systemId.indexOf('"') !== -1 && node.systemId.indexOf("'") !== -1) {
        invalidStateError();
    }
    let string = '';
    const
        publicId = node.publicId,
        systemId = node.systemId,
        publicQuote = publicId && publicId.indexOf("'") !== -1 ? "'" : '"', // Don't need to check for quotes here, since not allowed with public
        systemQuote = systemId && systemId.indexOf("'") !== -1 ? "'" : '"'; // If as "entity" inside, will it return quote or entity? If former, we need to entify here (should be an error per section 9.3 of http://www.w3.org/TR/html5/the-xhtml-syntax.html )
    if (systemId !== null && publicId !== null) {
        string += ' PUBLIC ' + publicQuote + publicId + publicQuote + ' ' + systemQuote + systemId + systemQuote;
    } else if (publicId !== null) {
        string += ' PUBLIC ' + publicQuote + publicId + publicQuote;
    } else if (all || systemId !== null) {
        string += ' SYSTEM ' + systemQuote + systemId + systemQuote;
    }
    return string;
};
const notIEInsertedAttributes = function (att, node, nameVals) {
    return nameVals.every(function (nameVal) {
        const name = Array.isArray(nameVal) ? nameVal[0] : nameVal,
            val = Array.isArray(nameVal) ? nameVal[1] : null;
        return att.name !== name ||
            (val && att.value !== val) ||
            // (!node.outerHTML.match(new RegExp(' ' + name + '=')));
            (node.outerHTML.match(new RegExp(' ' + name + '=' + val ? '"' + val + '"' : '')));
    });
};
const serializeToString = function (nodeArg) {
    // if (nodeArg.xml) { // If this is genuine XML, IE should be able to handle it (and anyways, I am not sure how to override the prototype of XML elements in IE as we must do to add the likes of lookupNamespaceURI)
    //   return nodeArg.xml;
    // }
    const that = this,
        // mode = this.$mode || 'html',
        ieFix = true, // Todo: Make conditional on IE and processing of HTML
        mozilla = true, // Todo: Detect (since built-in lookupNamespaceURI() appears to always return null now for HTML elements),
        namespaces = {},
        xmlDeclaration = true,
        nodeType = nodeArg.nodeType;
    let emptyElement;
    let htmlElement = true; // Todo: Make conditional on namespace?
    let string = '';
    let children = {};
    let i = 0;

    function serializeDOM (node, namespaces) {
        let children, tagName, tagAttributes, tagAttLen, opt, optionsLen, prefix, val, content, i, textNode,
            string = '';
        const nodeValue = node.nodeValue,
            type = node.nodeType;
        namespaces = clone(namespaces) || {}; // Ensure we're working with a copy, so different levels in the hierarchy can treat it differently

        if ((node.prefix && node.prefix.indexOf(':') !== -1) || (node.localName && node.localName.indexOf(':') !== -1)) {
            invalidStateError();
        }

        if (
            ((type === 3 || type === 4 || type === 7 || type === 8) &&
                !xmlChars.test(nodeValue)) ||
            ((type === 2) && !xmlChars.test(node.value)) // Attr.nodeValue is now deprecated, so we use Attr.value
        ) {
            invalidStateError();
        }

        switch (type) {
        case 1: // ELEMENT
            tagName = node.tagName;

            if (ieFix) {
                tagName = tagName.toLowerCase();
            }

            if (that.$formSerialize) {
                // Firefox serializes certain properties even if only set via JavaScript ("disabled", "readonly") and it sometimes even adds the "value" property in certain cases (<input type=hidden>)
                if ('|input|button|object|'.indexOf('|' + tagName + '|') > -1) {
                    if (node.value !== node.defaultValue) { // May be undefined for an object, or empty string for input, etc.
                        node.setAttribute('value', node.value);
                    }
                    if (tagName === 'input' && node.checked !== node.defaultChecked) {
                        if (node.checked) {
                            node.setAttribute('checked', 'checked');
                        } else {
                            node.removeAttribute('checked');
                        }
                    }
                } else if (tagName === 'select') {
                    for (i = 0, optionsLen = node.options.length; i < optionsLen; i++) {
                        opt = node.options[i];
                        if (opt.selected !== opt.defaultSelected) {
                            if (opt.selected) {
                                opt.setAttribute('selected', 'selected');
                            } else {
                                opt.removeAttribute('selected');
                            }
                        }
                    }
                }
            }

            // Make this consistent, e.g., so browsers can be reliable in serialization

            // Attr.nodeName and Attr.nodeValue are deprecated as of DOM4 as Attr no longer inherits from Node, but we can safely use name and value
            tagAttributes = [].slice.call(node.attributes);

            // Were formally alphabetical in some browsers
            /* .sort(function (attr1, attr2) {
                return attr1.name > attr2.name ? 1 : -1;
            }); */

            prefix = node.prefix;

            string += '<' + tagName;
            /**/
            // Do the attributes above cover our namespaces ok? What if unused but in the DOM?
            if ((mozilla || !node.lookupNamespaceURI || node.lookupNamespaceURI(prefix) !== null) && namespaces[prefix || '$'] === undefined) {
                namespaces[prefix || '$'] = node.namespaceURI || xhtmlNS;
                string += ' xmlns' + (prefix ? ':' + prefix : '') +
                            '="' + entify(namespaces[prefix || '$']) + '"';
            }
            // */
            tagAttLen = tagAttributes.length;
            // Todo: optimize this by joining the for loops together but inserting into an array to sort
            /*
            // Used to be serialized first
            for (i = 0; i < tagAttLen; i++) {
                if (tagAttributes[i].name.match(/^xmlns:\w*$/)) {
                    string += ' ' + tagAttributes[i].name + // .toLowerCase() +
                        '="' + entify(tagAttributes[i].value) + '"'; // .toLowerCase()
                }
            }
            */
            for (i = 0; i < tagAttLen; i++) {
                if (
                    // IE includes attributes like type=text even if not explicitly added as such
                    // Todo: Maybe we should ALWAYS apply instead of never apply in the case of type=text?
                    // Todo: Does XMLSerializer serialize properties in any browsers as well (e.g., if after setting an input.value); it does not in Firefox, but I think this could be very useful (especially since we are
                    // changing native behavior in Firefox anyways in order to sort attributes in a consistent manner
                    // with IE
                    notIEInsertedAttributes(tagAttributes[i], node, [
                        ['type', 'text'], 'colSpan', 'rowSpan', 'cssText', 'shape'
                    ]) &&
                    // Had to add before
                    // && !tagAttributes[i].name.match(/^xmlns:?\w*$/) // Avoid adding these (e.g., from Firefox) as we add above
                    tagAttributes[i].name !== 'xmlns'
                ) {
                    // value = tagAttributes[i].value.split(/;\s+/).sort().join(' ');
                    // else { */
                    string += ' ' + tagAttributes[i].name + // .toLowerCase() +
                        '="' + entify(tagAttributes[i].value) + '"'; // .toLowerCase()
                }
            }

            // Todo: Faster to use array with Array.prototype.indexOf polyfill?
            emptyElement = emptyElements.indexOf('|' + tagName + '|') > -1;
            htmlElement = node.namespaceURI === xhtmlNS || nonEmptyElements.indexOf('|' + tagName + '|') > -1; // || emptyElement;

            if (!node.firstChild && (emptyElement || !htmlElement)) {
                // string += mode === 'xml' || node.namespaceURI !== xhtmlNS ? ' />' : '>';
                string += (htmlElement ? ' ' : '') + '/>';
            } else {
                string += '>';
                children = node.childNodes;
                // Todo: After text nodes are only entified in XML, could change this first block to insist on document.createStyleSheet
                if (tagName === 'script' || tagName === 'style') {
                    if (tagName === 'script' && (node.type === '' || node.type === 'text/javascript')) {
                        string += document.createStyleSheet ? node.text : node.textContent;
                        // serializeDOM(document.createTextNode(node.text), namespaces);
                    } else if (tagName === 'style') {
                        // serializeDOM(document.createTextNode(node.cssText), namespaces);
                        string += document.createStyleSheet ? node.cssText : node.textContent;
                    }
                } else {
                    if (that.$formSerialize && tagName === 'textarea') {
                        textNode = document.createTextNode(node.value);
                        children = [textNode];
                    }
                    for (i = 0; i < children.length; i++) {
                        string += serializeDOM(children[i], namespaces);
                    }
                }
                string += '</' + tagName + '>';
            }
            break;
        case 2: // ATTRIBUTE (should only get here if passing in an attribute node)
            return ' ' + node.name + // .toLowerCase() +
                            '="' + entify(node.value) + '"'; // .toLowerCase()
        case 3: // TEXT
            return entify(nodeValue); // Todo: only entify for XML
        case 4: // CDATA
            if (nodeValue.indexOf(']]' + '>') !== -1) {
                invalidStateError();
            }
            return '<' + '![CDATA[' +
                            nodeValue +
                            ']]' + '>';
        case 5: // ENTITY REFERENCE (probably not used in browsers since already resolved)
            return '&' + node.nodeName + ';';
        case 6: // ENTITY (would need to pass in directly)
            val = '';
            content = node.firstChild;

            if (node.xmlEncoding) { // an external entity file?
                string += '<?xml ';
                if (node.xmlVersion) {
                    string += 'version="' + node.xmlVersion + '" ';
                }
                string += 'encoding="' + node.xmlEncoding + '"' +
                                '?>';

                if (!content) {
                    return '';
                }
                while (content) {
                    val += content.nodeValue; // FIX: allow for other entity types
                    content = content.nextSibling;
                }
                return string + content; // reconstruct external entity file, if this is that
            }
            string += '<' + '!ENTITY ' + node.nodeName + ' ';
            if (node.publicId || node.systemId) { // External Entity?
                string += addExternalID(node);
                if (node.notationName) {
                    string += ' NDATA ' + node.notationName;
                }
                string += '>';
                break;
            }

            if (!content) {
                return '';
            }
            while (content) {
                val += content.nodeValue; // FIX: allow for other entity types
                content = content.nextSibling;
            }
            string += '"' + entify(val) + '">';
            break;
        case 7: // PROCESSING INSTRUCTION
            if (/^xml$/i.test(node.target)) {
                invalidStateError();
            }
            if (node.target.indexOf('?>') !== -1) {
                invalidStateError();
            }
            if (node.target.indexOf(':') !== -1) {
                invalidStateError();
            }
            if (node.data.indexOf('?>') !== -1) {
                invalidStateError();
            }
            return '<?' + node.target + ' ' + nodeValue + '?>';
        case 8: // COMMENT
            if (nodeValue.indexOf('--') !== -1 ||
                (nodeValue.length && nodeValue.lastIndexOf('-') === nodeValue.length - 1)
            ) {
                invalidStateError();
            }
            return '<' + '!--' + nodeValue + '-->';
        case 9: // DOCUMENT (handled earlier in script)
            break;
        case 10: // DOCUMENT TYPE
            string += '<' + '!DOCTYPE ' + node.name;
            if (!pubIdChar.test(node.publicId)) {
                invalidStateError();
            }
            string += addExternalID(node) +
                            (node.internalSubset ? '[\n' + node.internalSubset + '\n]' : '') +
                            '>\n';
            /* Fit in internal subset along with entities?: probably don't need as these would only differ if from DTD, and we're not rebuilding the DTD
            var notations = node.notations;
            if (notations) {
                for (i=0; i < notations.length; i++) {
                    serializeDOM(notations[0], namespaces);
                }
            }
            */
            // UNFINISHED
            break;
        case 11: // DOCUMENT FRAGMENT (handled earlier in script)
            break;
        case 12: // NOTATION (would need to be passed in directly)
            return '<' + '!NOTATION ' + node.nodeName +
                            addExternalID(node, true) +
                            '>';
        default:
            throw new Error('Not an XML type');
        }
        return string;
    }

    if (xmlDeclaration && document.xmlVersion && nodeType === 9) { // DOCUMENT - Faster to do it here without first calling serializeDOM
        string += '<?xml version="' + document.xmlVersion + '"';
        if (document.xmlEncoding !== undefined && document.xmlEncoding !== null) {
            string += ' encoding="' + document.xmlEncoding + '"';
        }
        if (document.xmlStandalone !== undefined) { // Could configure to only output if "yes"
            string += ' standalone="' + (document.xmlStandalone ? 'yes' : 'no') + '"';
        }
        string += '?>\n';
    }
    if (nodeType === 9 || nodeType === 11) { // DOCUMENT & DOCUMENT FRAGMENT - Faster to do it here without first calling serializeDOM
        children = nodeArg.childNodes;
        for (i = 0; i < children.length; i++) {
            string += serializeDOM(children[i], namespaces); // children[i].cloneNode(true)
        }
        return string;
    }
    // While safer to clone to avoid modifying original DOM, we need to iterate over properties to obtain textareas and select menu states (if they have been set dynamically) and these states are lost upon cloning (even though dynamic setting of input boxes is not lost to the DOM)
    // See http://stackoverflow.com/a/21060052/271577 and:
    // https://bugzilla.mozilla.org/show_bug.cgi?id=197294
    // https://bugzilla.mozilla.org/show_bug.cgi?id=230307
    // https://bugzilla.mozilla.org/show_bug.cgi?id=237783
    // nodeArg = nodeArg.cloneNode(true);
    return serializeDOM(nodeArg, namespaces);
};

XMLSerializer$1.prototype.serializeToString = serializeToString;

/* globals require */
/*
Possible todos:
0. Add XSLT to JML-string stylesheet (or even vice versa)
0. IE problem: Add JsonML code to handle name attribute (during element creation)
0. Element-specific: IE object-param handling

Todos inspired by JsonML: https://github.com/mckamey/jsonml/blob/master/jsonml-html.js

0. duplicate attributes?
0. expand ATTR_MAP
0. equivalent of markup, to allow strings to be embedded within an object (e.g., {$value: '<div>id</div>'}); advantage over innerHTML in that it wouldn't need to work as the entire contents (nor destroy any existing content or handlers)
0. More validation?
0. JsonML DOM Level 0 listener
0. Whitespace trimming?

JsonML element-specific:
0. table appending
0. canHaveChildren necessary? (attempts to append to script and img)

Other Todos:
0. Note to self: Integrate research from other jml notes
0. Allow Jamilih to be seeded with an existing element, so as to be able to add/modify attributes and children
0. Allow array as single first argument
0. Settle on whether need to use null as last argument to return array (or fragment) or other way to allow appending? Options object at end instead to indicate whether returning array, fragment, first element, etc.?
0. Allow building of generic XML (pass configuration object)
0. Allow building content internally as a string (though allowing DOM methods, etc.?)
0. Support JsonML empty string element name to represent fragments?
0. Redo browser testing of jml (including ensuring IE7 can work even if test framework can't work)
*/

const isNode = typeof module !== 'undefined';
let JSDOM;
if (isNode) {
    JSDOM = require('jsdom').JSDOM;
}
let win = isNode && typeof window === 'undefined' ? new JSDOM('').window : window;
let doc = isNode && typeof document === 'undefined' ? win.document : document;
// let XmlSerializer = isNode && typeof XMLSerializer === 'undefined' ? require('xmldom').XMLSerializer : XMLSerializer // Can remove xmldom dependency once jsdom may implement: https://github.com/tmpvar/jsdom/issues/1368

let XmlSerializer = isNode && typeof XMLSerializer === 'undefined' ? XMLSerializer$1 : XMLSerializer;

// STATIC PROPERTIES
const possibleOptions = [
    '$map' // Add any other options here
];

const NS_HTML = 'http://www.w3.org/1999/xhtml';
const hyphenForCamelCase = /-([a-z])/g;

const ATTR_MAP = {
    'readonly': 'readOnly'
};

// We define separately from ATTR_DOM for clarity (and parity with JsonML) but no current need
// We don't set attribute esp. for boolean atts as we want to allow setting of `undefined`
//   (e.g., from an empty variable) on templates to have no effect
const BOOL_ATTS = [
    'checked',
    'defaultChecked',
    'defaultSelected',
    'disabled',
    'indeterminate',
    'open', // Dialog elements
    'readOnly',
    'selected'
];
const ATTR_DOM = BOOL_ATTS.concat([ // From JsonML
    'async',
    'autofocus',
    'defaultValue',
    'defer',
    'formnovalidate',
    'hidden',
    'ismap',
    'multiple',
    'novalidate',
    'pattern',
    'required',
    'spellcheck',
    'value',
    'willvalidate'
]);
// Todo: Add more to this as useful for templating
//   to avoid setting with nullish value
const NULLABLES = [
    'lang',
    'max',
    'min'
];

/**
* Retrieve the (lower-cased) HTML name of a node
* @static
* @param {Node} node The HTML node
* @returns {String} The lower-cased node name
*/
function _getHTMLNodeName (node) {
    return node.nodeName && node.nodeName.toLowerCase();
}

/**
* Apply styles if this is a style tag
* @static
* @param {Node} node The element to check whether it is a style tag
*/
function _applyAnyStylesheet (node) {
    if (!doc.createStyleSheet) {
        return;
    }
    if (_getHTMLNodeName(node) === 'style') { // IE
        const ss = doc.createStyleSheet(); // Create a stylesheet to actually do something useful
        ss.cssText = node.cssText;
        // We continue to add the style tag, however
    }
}

/**
 * Need this function for IE since options weren't otherwise getting added
 * @private
 * @static
 * @param {DOMElement} parent The parent to which to append the element
 * @param {DOMNode} child The element or other node to append to the parent
 */
function _appendNode (parent, child) {
    const parentName = _getHTMLNodeName(parent);
    const childName = _getHTMLNodeName(child);

    if (doc.createStyleSheet) {
        if (parentName === 'script') {
            parent.text = child.nodeValue;
            return;
        }
        if (parentName === 'style') {
            parent.cssText = child.nodeValue; // This will not apply it--just make it available within the DOM cotents
            return;
        }
    }
    if (parentName === 'template') {
        parent.content.appendChild(child);
        return;
    }
    try {
        parent.appendChild(child); // IE9 is now ok with this
    } catch (e) {
        if (parentName === 'select' && childName === 'option') {
            try { // Since this is now DOM Level 4 standard behavior (and what IE7+ can handle), we try it first
                parent.add(child);
            } catch (err) { // DOM Level 2 did require a second argument, so we try it too just in case the user is using an older version of Firefox, etc.
                parent.add(child, null); // IE7 has a problem with this, but IE8+ is ok
            }
            return;
        }
        throw e;
    }
}

/**
 * Attach event in a cross-browser fashion
 * @static
 * @param {DOMElement} el DOM element to which to attach the event
 * @param {String} type The DOM event (without 'on') to attach to the element
 * @param {Function} handler The event handler to attach to the element
 * @param {Boolean} [capturing] Whether or not the event should be
 *                                                              capturing (W3C-browsers only); default is false; NOT IN USE
 */
function _addEvent (el, type, handler, capturing) {
    el.addEventListener(type, handler, !!capturing);
}

/**
* Creates a text node of the result of resolving an entity or character reference
* @param {'entity'|'decimal'|'hexadecimal'} type Type of reference
* @param {String} prefix Text to prefix immediately after the "&"
* @param {String} arg The body of the reference
* @returns {Text} The text node of the resolved reference
*/
function _createSafeReference (type, prefix, arg) {
    // For security reasons related to innerHTML, we ensure this string only contains potential entity characters
    if (!arg.match(/^\w+$/)) {
        throw new TypeError('Bad ' + type);
    }
    const elContainer = doc.createElement('div');
    // Todo: No workaround for XML?
    elContainer.innerHTML = '&' + prefix + arg + ';';
    return doc.createTextNode(elContainer.innerHTML);
}

/**
* @param {String} n0 Whole expression match (including "-")
* @param {String} n1 Lower-case letter match
* @returns {String} Uppercased letter
*/
function _upperCase (n0, n1) {
    return n1.toUpperCase();
}

/**
* @private
* @static
*/
function _getType (item) {
    if (typeof item === 'string') {
        return 'string';
    }
    if (typeof item === 'object') {
        if (item === null) {
            return 'null';
        }
        if (Array.isArray(item)) {
            return 'array';
        }
        if (item.nodeType === 1) {
            return 'element';
        }
        if (item.nodeType === 11) {
            return 'fragment';
        }
        return 'object';
    }
    return undefined;
}

/**
* @private
* @static
*/
function _fragReducer (frag, node) {
    frag.appendChild(node);
    return frag;
}

/**
* @private
* @static
*/
function _replaceDefiner (xmlnsObj) {
    return function (n0) {
        let retStr = xmlnsObj[''] ? ' xmlns="' + xmlnsObj[''] + '"' : (n0 || ''); // Preserve XHTML
        for (const ns in xmlnsObj) {
            if (xmlnsObj.hasOwnProperty(ns)) {
                if (ns !== '') {
                    retStr += ' xmlns:' + ns + '="' + xmlnsObj[ns] + '"';
                }
            }
        }
        return retStr;
    };
}

function _optsOrUndefinedJML (...args) {
    return jml(...(
        args[0] === undefined
            ? args.slice(1)
            : args
    ));
}

/**
* @private
* @static
*/
function _jmlSingleArg (arg) {
    return jml(arg);
}

/**
* @private
* @static
*/
function _copyOrderedAtts (attArr) {
    const obj = {};
    // Todo: Fix if allow prefixed attributes
    obj[attArr[0]] = attArr[1]; // array of ordered attribute-value arrays
    return obj;
}

/**
* @private
* @static
*/
function _childrenToJML (node) {
    return function (childNodeJML, i) {
        const cn = node.childNodes[i];
        cn.parentNode.replaceChild(jml(...childNodeJML), cn);
    };
}

/**
* @private
* @static
*/
function _appendJML (node) {
    return function (childJML) {
        node.appendChild(jml(...childJML));
    };
}

/**
* @private
* @static
*/
function _appendJMLOrText (node) {
    return function (childJML) {
        if (typeof childJML === 'string') {
            node.appendChild(doc.createTextNode(childJML));
        } else {
            node.appendChild(jml(...childJML));
        }
    };
}

/**
* @private
* @static
function _DOMfromJMLOrString (childNodeJML) {
    if (typeof childNodeJML === 'string') {
        return doc.createTextNode(childNodeJML);
    }
    return jml(...childNodeJML);
}
*/

/**
 * Creates an XHTML or HTML element (XHTML is preferred, but only in browsers that support);
 * Any element after element can be omitted, and any subsequent type or types added afterwards
 * @requires polyfill: Array.isArray
 * @requires polyfill: Array.prototype.reduce For returning a document fragment
 * @requires polyfill: Element.prototype.dataset For dataset functionality (Will not work in IE <= 7)
 * @param {String} el The element to create (by lower-case name)
 * @param {Object} [atts] Attributes to add with the key as the attribute name and value as the
 *                                               attribute value; important for IE where the input element's type cannot
 *                                               be added later after already added to the page
 * @param {DOMElement[]} [children] The optional children of this element (but raw DOM elements
 *                                                                      required to be specified within arrays since
 *                                                                      could not otherwise be distinguished from siblings being added)
 * @param {DOMElement} [parent] The optional parent to which to attach the element (always the last
 *                                                                  unless followed by null, in which case it is the second-to-last)
 * @param {null} [returning] Can use null to indicate an array of elements should be returned
 * @returns {DOMElement} The newly created (and possibly already appended) element or array of elements
 */
const jml = function jml (...args) {
    let elem = doc.createDocumentFragment();
    function _checkAtts (atts) {
        let att;
        for (att in atts) {
            if (atts.hasOwnProperty(att)) {
                const attVal = atts[att];
                att = att in ATTR_MAP ? ATTR_MAP[att] : att;
                if (NULLABLES.includes(att)) {
                    if (attVal != null) {
                        elem[att] = attVal;
                    }
                    continue;
                } else if (ATTR_DOM.includes(att)) {
                    elem[att] = attVal;
                    continue;
                }
                switch (att) {
                /*
                Todos:
                0. JSON mode to prevent event addition

                0. {$xmlDocument: []} // doc.implementation.createDocument

                0. Accept array for any attribute with first item as prefix and second as value?
                0. {$: ['xhtml', 'div']} for prefixed elements
                    case '$': // Element with prefix?
                        nodes[nodes.length] = elem = doc.createElementNS(attVal[0], attVal[1]);
                        break;
                */
                case '#': { // Document fragment
                    nodes[nodes.length] = _optsOrUndefinedJML(opts, attVal);
                    break;
                } case '$shadow': {
                    const {open, closed} = attVal;
                    let {content, template} = attVal;
                    const shadowRoot = elem.attachShadow({
                        mode: closed || open === false ? 'closed' : 'open'
                    });
                    if (template) {
                        if (Array.isArray(template)) {
                            if (_getType(template[0]) === 'object') { // Has attributes
                                template = jml('template', ...template, doc.body);
                            } else { // Array is for the children
                                template = jml('template', template, doc.body);
                            }
                        } else if (typeof template === 'string') {
                            template = doc.querySelector(template);
                        }
                        jml(
                            template.content.cloneNode(true),
                            shadowRoot
                        );
                    } else {
                        if (!content) {
                            content = open || closed;
                        }
                        if (content && typeof content !== 'boolean') {
                            if (Array.isArray(content)) {
                                jml({'#': content}, shadowRoot);
                            } else {
                                jml(content, shadowRoot);
                            }
                        }
                    }
                    break;
                } case 'is': { // Not yet supported in browsers
                    // Handled during element creation
                    break;
                } case '$custom': {
                    Object.assign(elem, attVal);
                    break;
                } case '$define': {
                    const localName = elem.localName.toLowerCase();
                    // Note: customized built-ins sadly not working yet
                    const customizedBuiltIn = !localName.includes('-');

                    const def = customizedBuiltIn ? elem.getAttribute('is') : localName;
                    if (customElements.get(def)) {
                        break;
                    }
                    const getConstructor = (cb) => {
                        const baseClass = options && options.extends
                            ? doc.createElement(options.extends).constructor
                            : customizedBuiltIn
                                ? doc.createElement(localName).constructor
                                : HTMLElement;
                        return cb
                            ? class extends baseClass {
                                constructor () {
                                    super();
                                    cb.call(this);
                                }
                            }
                            : class extends baseClass {};
                    };

                    let constructor, options, prototype;
                    if (Array.isArray(attVal)) {
                        if (attVal.length <= 2) {
                            [constructor, options] = attVal;
                            if (typeof options === 'string') {
                                options = {extends: options};
                            } else if (!options.hasOwnProperty('extends')) {
                                prototype = options;
                            }
                            if (typeof constructor === 'object') {
                                prototype = constructor;
                                constructor = getConstructor();
                            }
                        } else {
                            [constructor, prototype, options] = attVal;
                            if (typeof options === 'string') {
                                options = {extends: options};
                            }
                        }
                    } else if (typeof attVal === 'function') {
                        constructor = attVal;
                    } else {
                        prototype = attVal;
                        constructor = getConstructor();
                    }
                    if (!constructor.toString().startsWith('class')) {
                        constructor = getConstructor(constructor);
                    }
                    if (!options && customizedBuiltIn) {
                        options = {extends: localName};
                    }
                    if (prototype) {
                        Object.assign(constructor.prototype, prototype);
                    }
                    customElements.define(def, constructor, customizedBuiltIn ? options : undefined);
                    break;
                } case '$symbol': {
                    const [symbol, func] = attVal;
                    if (typeof func === 'function') {
                        const funcBound = func.bind(elem);
                        if (typeof symbol === 'string') {
                            elem[Symbol.for(symbol)] = funcBound;
                        } else {
                            elem[symbol] = funcBound;
                        }
                    } else {
                        const obj = func;
                        obj.elem = elem;
                        if (typeof symbol === 'string') {
                            elem[Symbol.for(symbol)] = obj;
                        } else {
                            elem[symbol] = obj;
                        }
                    }
                    break;
                } case '$data' : {
                    setMap(attVal);
                    break;
                } case '$attribute': { // Attribute node
                    const node = attVal.length === 3 ? doc.createAttributeNS(attVal[0], attVal[1]) : doc.createAttribute(attVal[0]);
                    node.value = attVal[attVal.length - 1];
                    nodes[nodes.length] = node;
                    break;
                } case '$text': { // Todo: Also allow as jml(['a text node']) (or should that become a fragment)?
                    const node = doc.createTextNode(attVal);
                    nodes[nodes.length] = node;
                    break;
                } case '$document': {
                    const node = doc.implementation.createHTMLDocument();
                    if (attVal.childNodes) {
                        attVal.childNodes.forEach(_childrenToJML(node));
                        // Remove any extra nodes created by createHTMLDocument().
                        let j = attVal.childNodes.length;
                        while (node.childNodes[j]) {
                            const cn = node.childNodes[j];
                            cn.parentNode.removeChild(cn);
                            j++;
                        }
                    } else {
                        const html = node.childNodes[1];
                        const head = html.childNodes[0];
                        const body = html.childNodes[1];
                        if (attVal.title || attVal.head) {
                            const meta = doc.createElement('meta');
                            meta.charset = 'utf-8';
                            head.appendChild(meta);
                        }
                        if (attVal.title) {
                            node.title = attVal.title; // Appends after meta
                        }
                        if (attVal.head) {
                            attVal.head.forEach(_appendJML(head));
                        }
                        if (attVal.body) {
                            attVal.body.forEach(_appendJMLOrText(body));
                        }
                    }
                    break;
                } case '$DOCTYPE': {
                    /*
                    // Todo:
                    if (attVal.internalSubset) {
                        node = {};
                    }
                    else
                    */
                    let node;
                    if (attVal.entities || attVal.notations) {
                        node = {
                            name: attVal.name,
                            nodeName: attVal.name,
                            nodeValue: null,
                            nodeType: 10,
                            entities: attVal.entities.map(_jmlSingleArg),
                            notations: attVal.notations.map(_jmlSingleArg),
                            publicId: attVal.publicId,
                            systemId: attVal.systemId
                            // internalSubset: // Todo
                        };
                    } else {
                        node = doc.implementation.createDocumentType(attVal.name, attVal.publicId, attVal.systemId);
                    }
                    nodes[nodes.length] = node;
                    break;
                } case '$ENTITY': {
                    /*
                    // Todo: Should we auto-copy another node's properties/methods (like DocumentType) excluding or changing its non-entity node values?
                    const node = {
                        nodeName: attVal.name,
                        nodeValue: null,
                        publicId: attVal.publicId,
                        systemId: attVal.systemId,
                        notationName: attVal.notationName,
                        nodeType: 6,
                        childNodes: attVal.childNodes.map(_DOMfromJMLOrString)
                    };
                    */
                    break;
                } case '$NOTATION': {
                    // Todo: We could add further properties/methods, but unlikely to be used as is.
                    const node = {nodeName: attVal[0], publicID: attVal[1], systemID: attVal[2], nodeValue: null, nodeType: 12};
                    nodes[nodes.length] = node;
                    break;
                } case '$on': { // Events
                    for (const p2 in attVal) {
                        if (attVal.hasOwnProperty(p2)) {
                            let val = attVal[p2];
                            if (typeof val === 'function') {
                                val = [val, false];
                            }
                            if (typeof val[0] === 'function') {
                                _addEvent(elem, p2, val[0], val[1]); // element, event name, handler, capturing
                            }
                        }
                    }
                    break;
                } case 'className': case 'class':
                    if (attVal != null) {
                        elem.className = attVal;
                    }
                    break;
                case 'dataset': {
                    // Map can be keyed with hyphenated or camel-cased properties
                    const recurse = (attVal, startProp) => {
                        let prop = '';
                        const pastInitialProp = startProp !== '';
                        Object.keys(attVal).forEach((key) => {
                            const value = attVal[key];
                            if (pastInitialProp) {
                                prop = startProp + key.replace(hyphenForCamelCase, _upperCase).replace(/^([a-z])/, _upperCase);
                            } else {
                                prop = startProp + key.replace(hyphenForCamelCase, _upperCase);
                            }
                            if (value === null || typeof value !== 'object') {
                                if (value != null) {
                                    elem.dataset[prop] = value;
                                }
                                prop = startProp;
                                return;
                            }
                            recurse(value, prop);
                        });
                    };
                    recurse(attVal, '');
                    break;
                // Todo: Disable this by default unless configuration explicitly allows (for security)
                } case 'innerHTML':
                    if (attVal != null) {
                        elem.innerHTML = attVal;
                    }
                    break;
                case 'htmlFor': case 'for':
                    if (elStr === 'label') {
                        if (attVal != null) {
                            elem.htmlFor = attVal;
                        }
                        break;
                    }
                    elem.setAttribute(att, attVal);
                    break;
                case 'xmlns':
                    // Already handled
                    break;
                default:
                    if (att.match(/^on/)) {
                        elem[att] = attVal;
                        // _addEvent(elem, att.slice(2), attVal, false); // This worked, but perhaps the user wishes only one event
                        break;
                    }
                    if (att === 'style') {
                        if (attVal == null) {
                            break;
                        }
                        if (typeof attVal === 'object') {
                            for (const p2 in attVal) {
                                if (attVal.hasOwnProperty(p2) && attVal[p2] != null) {
                                    // Todo: Handle aggregate properties like "border"
                                    if (p2 === 'float') {
                                        elem.style.cssFloat = attVal[p2];
                                        elem.style.styleFloat = attVal[p2]; // Harmless though we could make conditional on older IE instead
                                    } else {
                                        elem.style[p2.replace(hyphenForCamelCase, _upperCase)] = attVal[p2];
                                    }
                                }
                            }
                            break;
                        }
                        // setAttribute unfortunately erases any existing styles
                        elem.setAttribute(att, attVal);
                        /*
                        // The following reorders which is troublesome for serialization, e.g., as used in our testing
                        if (elem.style.cssText !== undefined) {
                            elem.style.cssText += attVal;
                        } else { // Opera
                            elem.style += attVal;
                        }
                        */
                        break;
                    }
                    elem.setAttribute(att, attVal);
                    break;
                }
            }
        }
    }
    const nodes = [];
    let elStr;
    let opts;
    let isRoot = false;
    if (_getType(args[0]) === 'object' &&
        Object.keys(args[0]).some((key) => possibleOptions.includes(key))) {
        opts = args[0];
        if (opts.state !== 'child') {
            isRoot = true;
            opts.state = 'child';
        }
        if (opts.$map && !opts.$map.root && opts.$map.root !== false) {
            opts.$map = {root: opts.$map};
        }
        args = args.slice(1);
    }
    const argc = args.length;
    const defaultMap = opts && opts.$map && opts.$map.root;
    const setMap = (dataVal) => {
        let map, obj;
        // Boolean indicating use of default map and object
        if (dataVal === true) {
            [map, obj] = defaultMap;
        } else if (Array.isArray(dataVal)) {
            // Array of strings mapping to default
            if (typeof dataVal[0] === 'string') {
                dataVal.forEach((dVal) => {
                    setMap(opts.$map[dVal]);
                });
            // Array of Map and non-map data object
            } else {
                map = dataVal[0] || defaultMap[0];
                obj = dataVal[1] || defaultMap[1];
            }
        // Map
        } else if ((/^\[object (?:Weak)?Map\]$/).test([].toString.call(dataVal))) {
            map = dataVal;
            obj = defaultMap[1];
        // Non-map data object
        } else {
            map = defaultMap[0];
            obj = dataVal;
        }
        map.set(elem, obj);
    };
    for (let i = 0; i < argc; i++) {
        let arg = args[i];
        switch (_getType(arg)) {
        case 'null': // null always indicates a place-holder (only needed for last argument if want array returned)
            if (i === argc - 1) {
                _applyAnyStylesheet(nodes[0]); // We have to execute any stylesheets even if not appending or otherwise IE will never apply them
                // Todo: Fix to allow application of stylesheets of style tags within fragments?
                return nodes.length <= 1 ? nodes[0] : nodes.reduce(_fragReducer, doc.createDocumentFragment()); // nodes;
            }
            break;
        case 'string': // Strings indicate elements
            switch (arg) {
            case '!':
                nodes[nodes.length] = doc.createComment(args[++i]);
                break;
            case '?':
                arg = args[++i];
                let procValue = args[++i];
                const val = procValue;
                if (typeof val === 'object') {
                    procValue = [];
                    for (const p in val) {
                        if (val.hasOwnProperty(p)) {
                            procValue.push(p + '=' + '"' + val[p].replace(/"/g, '\\"') + '"');
                        }
                    }
                    procValue = procValue.join(' ');
                }
                // Firefox allows instructions with ">" in this method, but not if placed directly!
                try {
                    nodes[nodes.length] = doc.createProcessingInstruction(arg, procValue);
                } catch (e) { // Getting NotSupportedError in IE, so we try to imitate a processing instruction with a comment
                    // innerHTML didn't work
                    // var elContainer = doc.createElement('div');
                    // elContainer.innerHTML = '<?' + doc.createTextNode(arg + ' ' + procValue).nodeValue + '?>';
                    // nodes[nodes.length] = elContainer.innerHTML;
                    // Todo: any other way to resolve? Just use XML?
                    nodes[nodes.length] = doc.createComment('?' + arg + ' ' + procValue + '?');
                }
                break;
            // Browsers don't support doc.createEntityReference, so we just use this as a convenience
            case '&':
                nodes[nodes.length] = _createSafeReference('entity', '', args[++i]);
                break;
            case '#': // // Decimal character reference - ['#', '01234'] // &#01234; // probably easier to use JavaScript Unicode escapes
                nodes[nodes.length] = _createSafeReference('decimal', arg, String(args[++i]));
                break;
            case '#x': // Hex character reference - ['#x', '123a'] // &#x123a; // probably easier to use JavaScript Unicode escapes
                nodes[nodes.length] = _createSafeReference('hexadecimal', arg, args[++i]);
                break;
            case '![':
                // '![', ['escaped <&> text'] // <![CDATA[escaped <&> text]]>
                // CDATA valid in XML only, so we'll just treat as text for mutual compatibility
                // Todo: config (or detection via some kind of doc.documentType property?) of whether in XML
                try {
                    nodes[nodes.length] = doc.createCDATASection(args[++i]);
                } catch (e2) {
                    nodes[nodes.length] = doc.createTextNode(args[i]); // i already incremented
                }
                break;
            case '':
                nodes[nodes.length] = doc.createDocumentFragment();
                break;
            default: { // An element
                elStr = arg;
                const atts = args[i + 1];
                // Todo: Fix this to depend on XML/config, not availability of methods
                if (_getType(atts) === 'object' && atts.is) {
                    const {is} = atts;
                    if (doc.createElementNS) {
                        elem = doc.createElementNS(NS_HTML, elStr, {is});
                    } else {
                        elem = doc.createElement(elStr, {is});
                    }
                } else {
                    if (doc.createElementNS) {
                        elem = doc.createElementNS(NS_HTML, elStr);
                    } else {
                        elem = doc.createElement(elStr);
                    }
                }
                nodes[nodes.length] = elem; // Add to parent
                break;
            }
            }
            break;
        case 'object': // Non-DOM-element objects indicate attribute-value pairs
            const atts = arg;

            if (atts.xmlns !== undefined) { // We handle this here, as otherwise may lose events, etc.
                // As namespace of element already set as XHTML, we need to change the namespace
                // elem.setAttribute('xmlns', atts.xmlns); // Doesn't work
                // Can't set namespaceURI dynamically, renameNode() is not supported, and setAttribute() doesn't work to change the namespace, so we resort to this hack
                let replacer;
                if (typeof atts.xmlns === 'object') {
                    replacer = _replaceDefiner(atts.xmlns);
                } else {
                    replacer = ' xmlns="' + atts.xmlns + '"';
                }
                // try {
                // Also fix DOMParser to work with text/html
                elem = nodes[nodes.length - 1] = new DOMParser().parseFromString(
                    new XmlSerializer().serializeToString(elem)
                        // Mozilla adds XHTML namespace
                        .replace(' xmlns="' + NS_HTML + '"', replacer),
                    'application/xml'
                ).documentElement;
                // }catch(e) {alert(elem.outerHTML);throw e;}
            }
            const orderedArr = atts.$a ? atts.$a.map(_copyOrderedAtts) : [atts];
            orderedArr.forEach(_checkAtts);
            break;
        case 'fragment':
        case 'element':
            /*
            1) Last element always the parent (put null if don't want parent and want to return array) unless only atts and children (no other elements)
            2) Individual elements (DOM elements or sequences of string[/object/array]) get added to parent first-in, first-added
            */
            if (i === 0) { // Allow wrapping of element
                elem = arg;
            }
            if (i === argc - 1 || (i === argc - 2 && args[i + 1] === null)) { // parent
                const elsl = nodes.length;
                for (let k = 0; k < elsl; k++) {
                    _appendNode(arg, nodes[k]);
                }
                // Todo: Apply stylesheets if any style tags were added elsewhere besides the first element?
                _applyAnyStylesheet(nodes[0]); // We have to execute any stylesheets even if not appending or otherwise IE will never apply them
            } else {
                nodes[nodes.length] = arg;
            }
            break;
        case 'array': // Arrays or arrays of arrays indicate child nodes
            const child = arg;
            const cl = child.length;
            for (let j = 0; j < cl; j++) { // Go through children array container to handle elements
                const childContent = child[j];
                const childContentType = typeof childContent;
                if (childContent === undefined) {
                    throw String('Parent array:' + JSON.stringify(args) + '; child: ' + child + '; index:' + j);
                }
                switch (childContentType) {
                // Todo: determine whether null or function should have special handling or be converted to text
                case 'string': case 'number': case 'boolean':
                    _appendNode(elem, doc.createTextNode(childContent));
                    break;
                default:
                    if (Array.isArray(childContent)) { // Arrays representing child elements
                        _appendNode(elem, _optsOrUndefinedJML(opts, ...childContent));
                    } else if (childContent['#']) { // Fragment
                        _appendNode(elem, _optsOrUndefinedJML(opts, childContent['#']));
                    } else { // Single DOM element children
                        _appendNode(elem, childContent);
                    }
                    break;
                }
            }
            break;
        }
    }
    const ret = nodes[0] || elem;
    if (opts && isRoot && opts.$map && opts.$map.root) {
        setMap(true);
    }
    return ret;
};

/**
* Converts a DOM object or a string of HTML into a Jamilih object (or string)
* @param {string|HTMLElement} [dom=document.documentElement] Defaults to converting the current document.
* @param {object} [config={stringOutput:false}] Configuration object
* @param {boolean} [config.stringOutput=false] Whether to output the Jamilih object as a string.
* @returns {array|string} Array containing the elements which represent a Jamilih object, or,
                            if `stringOutput` is true, it will be the stringified version of
                            such an object
*/
jml.toJML = function (dom, config) {
    config = config || {stringOutput: false};
    if (typeof dom === 'string') {
        dom = new DOMParser().parseFromString(dom, 'text/html'); // todo: Give option for XML once implemented and change JSDoc to allow for Element
    }

    const prohibitHTMLOnly = true;

    const ret = [];
    let parent = ret;
    let parentIdx = 0;

    function invalidStateError () { // These are probably only necessary if working with text/html
        function DOMException () { return this; }
        if (prohibitHTMLOnly) {
            // INVALID_STATE_ERR per section 9.3 XHTML 5: http://www.w3.org/TR/html5/the-xhtml-syntax.html
            // Since we can't instantiate without this (at least in Mozilla), this mimicks at least (good idea?)
            const e = new DOMException();
            e.code = 11;
            throw e;
        }
    }

    function addExternalID (obj, node) {
        if (node.systemId.includes('"') && node.systemId.includes("'")) {
            invalidStateError();
        }
        const publicId = node.publicId;
        const systemId = node.systemId;
        if (systemId) {
            obj.systemId = systemId;
        }
        if (publicId) {
            obj.publicId = publicId;
        }
    }

    function set (val) {
        parent[parentIdx] = val;
        parentIdx++;
    }
    function setChildren () {
        set([]);
        parent = parent[parentIdx - 1];
        parentIdx = 0;
    }
    function setObj (prop1, prop2) {
        parent = parent[parentIdx - 1][prop1];
        parentIdx = 0;
        if (prop2) {
            parent = parent[prop2];
        }
    }

    function parseDOM (node, namespaces) {
        // namespaces = clone(namespaces) || {}; // Ensure we're working with a copy, so different levels in the hierarchy can treat it differently

        /*
        if ((node.prefix && node.prefix.includes(':')) || (node.localName && node.localName.includes(':'))) {
            invalidStateError();
        }
        */

        const type = node.nodeType;
        namespaces = Object.assign({}, namespaces);

        const xmlChars = /([\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD]|[\uD800-\uDBFF][\uDC00-\uDFFF])*$/;
        if ([2, 3, 4, 7, 8].includes(type) && !xmlChars.test(node.nodeValue)) {
            invalidStateError();
        }

        let children, start, tmpParent, tmpParentIdx;
        function setTemp () {
            tmpParent = parent;
            tmpParentIdx = parentIdx;
        }
        function resetTemp () {
            parent = tmpParent;
            parentIdx = tmpParentIdx;
            parentIdx++; // Increment index in parent container of this element
        }
        switch (type) {
        case 1: // ELEMENT
            setTemp();
            const nodeName = node.nodeName.toLowerCase(); // Todo: for XML, should not lower-case

            setChildren(); // Build child array since elements are, except at the top level, encapsulated in arrays
            set(nodeName);

            start = {};
            let hasNamespaceDeclaration = false;

            if (namespaces[node.prefix || ''] !== node.namespaceURI) {
                namespaces[node.prefix || ''] = node.namespaceURI;
                if (node.prefix) {
                    start['xmlns:' + node.prefix] = node.namespaceURI;
                } else if (node.namespaceURI) {
                    start.xmlns = node.namespaceURI;
                }
                hasNamespaceDeclaration = true;
            }
            if (node.attributes.length) {
                set(Array.from(node.attributes).reduce(function (obj, att) {
                    obj[att.name] = att.value; // Attr.nodeName and Attr.nodeValue are deprecated as of DOM4 as Attr no longer inherits from Node, so we can safely use name and value
                    return obj;
                }, start));
            } else if (hasNamespaceDeclaration) {
                set(start);
            }

            children = node.childNodes;
            if (children.length) {
                setChildren(); // Element children array container
                Array.from(children).forEach(function (childNode) {
                    parseDOM(childNode, namespaces);
                });
            }
            resetTemp();
            break;
        case 2: // ATTRIBUTE (should only get here if passing in an attribute node)
            set({$attribute: [node.namespaceURI, node.name, node.value]});
            break;
        case 3: // TEXT
            if (config.stripWhitespace && (/^\s+$/).test(node.nodeValue)) {
                return;
            }
            set(node.nodeValue);
            break;
        case 4: // CDATA
            if (node.nodeValue.includes(']]' + '>')) {
                invalidStateError();
            }
            set(['![', node.nodeValue]);
            break;
        case 5: // ENTITY REFERENCE (probably not used in browsers since already resolved)
            set(['&', node.nodeName]);
            break;
        case 6: // ENTITY (would need to pass in directly)
            setTemp();
            start = {};
            if (node.xmlEncoding || node.xmlVersion) { // an external entity file?
                start.$ENTITY = {name: node.nodeName, version: node.xmlVersion, encoding: node.xmlEncoding};
            } else {
                start.$ENTITY = {name: node.nodeName};
                if (node.publicId || node.systemId) { // External Entity?
                    addExternalID(start.$ENTITY, node);
                    if (node.notationName) {
                        start.$ENTITY.NDATA = node.notationName;
                    }
                }
            }
            set(start);
            children = node.childNodes;
            if (children.length) {
                start.$ENTITY.childNodes = [];
                // Set position to $ENTITY's childNodes array children
                setObj('$ENTITY', 'childNodes');

                Array.from(children).forEach(function (childNode) {
                    parseDOM(childNode, namespaces);
                });
            }
            resetTemp();
            break;
        case 7: // PROCESSING INSTRUCTION
            if (/^xml$/i.test(node.target)) {
                invalidStateError();
            }
            if (node.target.includes('?>')) {
                invalidStateError();
            }
            if (node.target.includes(':')) {
                invalidStateError();
            }
            if (node.data.includes('?>')) {
                invalidStateError();
            }
            set(['?', node.target, node.data]); // Todo: Could give option to attempt to convert value back into object if has pseudo-attributes
            break;
        case 8: // COMMENT
            if (node.nodeValue.includes('--') ||
                (node.nodeValue.length && node.nodeValue.lastIndexOf('-') === node.nodeValue.length - 1)) {
                invalidStateError();
            }
            set(['!', node.nodeValue]);
            break;
        case 9: // DOCUMENT
            setTemp();
            const docObj = {$document: {childNodes: []}};

            if (config.xmlDeclaration) {
                docObj.$document.xmlDeclaration = {version: doc.xmlVersion, encoding: doc.xmlEncoding, standAlone: doc.xmlStandalone};
            }

            set(docObj); // doc.implementation.createHTMLDocument

            // Set position to fragment's array children
            setObj('$document', 'childNodes');

            children = node.childNodes;
            if (!children.length) {
                invalidStateError();
            }
            // set({$xmlDocument: []}); // doc.implementation.createDocument // Todo: use this conditionally

            Array.from(children).forEach(function (childNode) { // Can't just do documentElement as there may be doctype, comments, etc.
                // No need for setChildren, as we have already built the container array
                parseDOM(childNode, namespaces);
            });
            resetTemp();
            break;
        case 10: // DOCUMENT TYPE
            setTemp();

            // Can create directly by doc.implementation.createDocumentType
            start = {$DOCTYPE: {name: node.name}};
            if (node.internalSubset) {
                start.internalSubset = node.internalSubset;
            }
            const pubIdChar = /^(\u0020|\u000D|\u000A|[a-zA-Z0-9]|[-'()+,./:=?;!*#@$_%])*$/;
            if (!pubIdChar.test(node.publicId)) {
                invalidStateError();
            }
            addExternalID(start.$DOCTYPE, node);
            // Fit in internal subset along with entities?: probably don't need as these would only differ if from DTD, and we're not rebuilding the DTD
            set(start); // Auto-generate the internalSubset instead? Avoid entities/notations in favor of array to preserve order?

            const entities = node.entities; // Currently deprecated
            if (entities && entities.length) {
                start.$DOCTYPE.entities = [];
                setObj('$DOCTYPE', 'entities');
                Array.from(entities).forEach(function (entity) {
                    parseDOM(entity, namespaces);
                });
                // Reset for notations
                parent = tmpParent;
                parentIdx = tmpParentIdx + 1;
            }

            const notations = node.notations; // Currently deprecated
            if (notations && notations.length) {
                start.$DOCTYPE.notations = [];
                setObj('$DOCTYPE', 'notations');
                Array.from(notations).forEach(function (notation) {
                    parseDOM(notation, namespaces);
                });
            }
            resetTemp();
            break;
        case 11: // DOCUMENT FRAGMENT
            setTemp();

            set({'#': []});

            // Set position to fragment's array children
            setObj('#');

            children = node.childNodes;
            Array.from(children).forEach(function (childNode) {
                // No need for setChildren, as we have already built the container array
                parseDOM(childNode, namespaces);
            });

            resetTemp();
            break;
        case 12: // NOTATION
            start = {$NOTATION: {name: node.nodeName}};
            addExternalID(start.$NOTATION, node, true);
            set(start);
            break;
        default:
            throw new TypeError('Not an XML type');
        }
    }

    parseDOM(dom, {});

    if (config.stringOutput) {
        return JSON.stringify(ret[0]);
    }
    return ret[0];
};
jml.toJMLString = function (dom, config) {
    return jml.toJML(dom, Object.assign(config || {}, {stringOutput: true}));
};
jml.toDOM = function (...args) { // Alias for jml()
    return jml(...args);
};
jml.toHTML = function (...args) { // Todo: Replace this with version of jml() that directly builds a string
    const ret = jml(...args);
    // Todo: deal with serialization of properties like 'selected', 'checked', 'value', 'defaultValue', 'for', 'dataset', 'on*', 'style'! (i.e., need to build a string ourselves)
    return ret.outerHTML;
};
jml.toDOMString = function (...args) { // Alias for jml.toHTML for parity with jml.toJMLString
    return jml.toHTML(...args);
};
jml.toXML = function (...args) {
    const ret = jml(...args);
    return new XmlSerializer().serializeToString(ret);
};
jml.toXMLDOMString = function (...args) { // Alias for jml.toXML for parity with jml.toJMLString
    return jml.toXML(...args);
};

class JamilihMap extends Map {
    get (elem) {
        elem = typeof elem === 'string' ? doc.querySelector(elem) : elem;
        return super.get.call(this, elem);
    }
    set (elem, value) {
        elem = typeof elem === 'string' ? doc.querySelector(elem) : elem;
        return super.set.call(this, elem, value);
    }
    invoke (elem, methodName, ...args) {
        elem = typeof elem === 'string' ? doc.querySelector(elem) : elem;
        return this.get(elem)[methodName](elem, ...args);
    }
}
class JamilihWeakMap extends WeakMap {
    get (elem) {
        elem = typeof elem === 'string' ? doc.querySelector(elem) : elem;
        return super.get(elem);
    }
    set (elem, value) {
        elem = typeof elem === 'string' ? doc.querySelector(elem) : elem;
        return super.set(elem, value);
    }
    invoke (elem, methodName, ...args) {
        elem = typeof elem === 'string' ? doc.querySelector(elem) : elem;
        return this.get(elem)[methodName](elem, ...args);
    }
}

jml.Map = JamilihMap;
jml.WeakMap = JamilihWeakMap;

jml.weak = function (obj, ...args) {
    const map = new JamilihWeakMap();
    const elem = jml({$map: [map, obj]}, ...args);
    return [map, elem];
};

jml.strong = function (obj, ...args) {
    const map = new JamilihMap();
    const elem = jml({$map: [map, obj]}, ...args);
    return [map, elem];
};

jml.symbol = jml.sym = jml.for = function (elem, sym) {
    elem = typeof elem === 'string' ? doc.querySelector(elem) : elem;
    return elem[typeof sym === 'symbol' ? sym : Symbol.for(sym)];
};

jml.command = function (elem, symOrMap, methodName, ...args) {
    elem = typeof elem === 'string' ? doc.querySelector(elem) : elem;
    let func;
    if (['symbol', 'string'].includes(typeof symOrMap)) {
        func = jml.sym(elem, symOrMap);
        if (typeof func === 'function') {
            return func(methodName, ...args); // Already has `this` bound to `elem`
        }
        return func[methodName](...args);
    } else {
        func = symOrMap.get(elem);
        if (typeof func === 'function') {
            return func.call(elem, methodName, ...args);
        }
        return func[methodName](elem, ...args);
    }
    // return func[methodName].call(elem, ...args);
};

jml.setWindow = (wind) => {
    win = wind;
};
jml.setDocument = (docum) => {
    doc = docum;
};
jml.setXMLSerializer = (xmls) => {
    XmlSerializer = xmls;
};

jml.getWindow = () => {
    return win;
};
jml.getDocument = () => {
    return doc;
};
jml.getXMLSerializer = () => {
    return XmlSerializer;
};

/* globals require, global */

if (typeof global !== 'undefined') {
    const JSDOM = require('jsdom').JSDOM;
    global.window = new JSDOM('').window;
    global.document = window.document;
    global.DOMParser = window.DOMParser;
    global.Node = window.Node;
    global.XMLSerializer = jml.getXMLSerializer();
}

// const divJamilih = ['div', {'class': 'test', 'xmlns': 'http://www.w3.org/1999/xhtml'}, ['someContent']];
// const html = new DOMParser().parseFromString('<div class="test">someContent</div>', 'text/html');
// const divDOM = html.documentElement.querySelector('.test');

const testCase = {
    // Todo: Add more tests (and harmonize with browser tests)

    // ============================================================================
    'text node': function (test) {
    // ============================================================================
        test.expect(2);
        const expected = document.createTextNode('abc');
        const result = jml({$text: 'abc'});
        test.deepEqual(expected.nodeType, result.nodeType);
        test.deepEqual(expected.nodeValue, result.nodeValue);
        test.done();
        console.log('aaaaa4');
    }
};

/* globals require, global */

if (typeof global !== 'undefined') {
    const JSDOM = require('jsdom').JSDOM;
    global.window = new JSDOM('').window;
    global.document = window.document;
    global.Event = window.Event;
    global.window = document.defaultView;
    global.DOMParser = window.DOMParser;
    global.Node = window.Node;
    global.XMLSerializer = jml.getXMLSerializer();
}

// const divJamilih = ['div', {'class': 'test', 'xmlns': 'http://www.w3.org/1999/xhtml'}, ['someContent']];
// const html = new DOMParser().parseFromString('<div class="test">someContent</div>', 'text/html');
// const divDOM = html.documentElement.querySelector('.test');

const testCase$1 = {
    // ============================================================================
    'jml.toJMLString()': function (test) {
    // ============================================================================
        test.expect(1);
        const br = document.createElement('br');
        const expected = '["br",{"xmlns":"http://www.w3.org/1999/xhtml"}]';
        const result = jml.toJMLString(br);
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'jml.toHTML()': function (test) {
    // ============================================================================
        test.expect(1);
        const expected = '<br>';
        const result = jml.toHTML('br');
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'jml.toXML()': function (test) {
    // ============================================================================
        test.expect(1);
        // Todo: Fix xmldom's XMLSerializer (or wait for jsdom version) to give same result as browser
        const expected = typeof process !== 'undefined' ? '<BR/>' : '<br xmlns="http://www.w3.org/1999/xhtml" />';
        const result = jml.toXML('br');
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'jml.toDOM()': function (test) {
    // ============================================================================
        test.expect(1);
        const expected = jml('br');
        const result = jml.toDOM('br');
        test.deepEqual(expected.nodeName, result.nodeName);
        test.done();
    },
    // ============================================================================
    'jml.toXMLDOMString()': function (test) {
    // ============================================================================
        test.expect(1);
        const expected = jml.toXMLDOMString('br');
        const result = jml.toXML('br');
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'jml.toDOMString()': function (test) {
    // ============================================================================
        test.expect(1);
        const expected = jml.toDOMString('br');
        const result = jml.toHTML('br');
        test.deepEqual(expected, result);
        test.done();
    }
};

/* globals require, global */

if (typeof global !== 'undefined') {
    const JSDOM = require('jsdom').JSDOM;
    global.window = new JSDOM('').window;
    global.document = window.document;
    global.DOMParser = window.DOMParser;
}

const divJamilih = ['div', {'class': 'test', 'xmlns': 'http://www.w3.org/1999/xhtml'}, ['someContent']];
const html$2 = new DOMParser().parseFromString('<div class="test">someContent</div>', 'text/html');
const divDOM = html$2.documentElement.querySelector('.test');

const xml = document.implementation.createDocument('', 'xml', null);

const testCase$2 = {
    // ============================================================================
    'element with text content': function (test) {
    // ============================================================================
        test.expect(1);
        const expected = divJamilih;
        const result = jml.toJML(divDOM);
        test.deepEqual(expected, result);
        test.done();
    },
    /*
    // Todo: Commenting out until https://github.com/tmpvar/jsdom/issues/1641
    // ============================================================================
    'attribute node': function(test) {
    // ============================================================================
        test.expect(2);
        const xlink = ['http://www.w3.org/1999/xlink', 'href', 'http://example.com'];

        const expected = {$attribute: xlink};
        const att = document.createAttributeNS.apply(document, xlink.slice(0, -1));
        att.value = xlink.slice(-1);

        const result = jml.toJML(att);
        test.deepEqual(expected, result);

        xlink[0] = null;
        expected = {$attribute: xlink};
        att = document.createAttribute.apply(document, xlink.slice(1, -1));
        att.value = xlink.slice(-1);

        result = jml.toJML(att);
        test.deepEqual(expected, result);

        test.done();
    },
    */
    // ============================================================================
    'text node': function (test) {
    // ============================================================================
        test.expect(1);
        const expected = 'text node content';

        const result = jml.toJML(document.createTextNode(expected));
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'CDATA section': function (test) {
    // ============================================================================
        const content = 'CDATA <>&\'" content';
        const expected = ['![', content];
        test.expect(1);
        const result = jml.toJML(xml.createCDATASection(content));
        test.deepEqual(expected, result);
        test.done();
    },
    /*
    // Currently removed from spec: https://dom.spec.whatwg.org/#dom-core-changes
    // ============================================================================
    'entity reference': function(test) {
    // ============================================================================
        test.expect(1);
        const expected = ['&', 'anEntity'];

        const result = jml.toJML(document.createEntityReference('anEntity'));
        test.deepEqual(expected, result);
        test.done();
    },
    */
    // ============================================================================
    'entity': function (test) {
    // ============================================================================
        test.expect(1);
        const expected = {$ENTITY: {name: 'copy', childNodes: ['\u00a9']}};

        // xmldom is missing the "doctype" property, and even when we use childNodes, it is missing the "entities" NamedNodeMap (and there is no public DOM method to create entities)
        /*
        const doc = new DOMParser().parseFromString('<!DOCTYPE root [<!ENTITY copy "\u00a9">]><root/>', 'text/xml');
        const result = doc.childNodes[0].entities[0];
        */

        // As per the above, we need to simulate an entity
        const result = jml.toJML({nodeType: 6, nodeName: 'copy', childNodes: [{nodeType: 3, nodeValue: '\u00a9'}]});

        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'processing instruction': function (test) {
    // ============================================================================
        test.expect(1);
        const expected = ['?', 'aTarget', 'a processing instruction'];

        const result = jml.toJML(document.createProcessingInstruction('aTarget', 'a processing instruction'));
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'comment': function (test) {
    // ============================================================================
        test.expect(1);
        const expected = ['!', 'a comment'];

        const result = jml.toJML(document.createComment('a comment'));
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'document': function (test) {
    // ============================================================================
        test.expect(1);
        const expected = {$document: {childNodes: [{$DOCTYPE: {name: 'html'}}, ['html', {xmlns: 'http://www.w3.org/1999/xhtml'}, [['head', [['title', ['a title']]]], ['body']]]]}};
        const doc = document.implementation.createHTMLDocument('a title');
        const result = jml.toJML(doc);
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'document type': function (test) {
    // ============================================================================
        test.expect(1);
        const expected = {$DOCTYPE: {name: 'a-prefix:a-name', publicId: 'a-pub-id', systemId: 'a-sys-id'}};

        const result = jml.toJML(document.implementation.createDocumentType('a-prefix:a-name', 'a-pub-id', 'a-sys-id'));
        test.deepEqual(expected, result);
        test.done();
    },
    // ============================================================================
    'document fragment': function (test) {
    // ============================================================================
        test.expect(1);
        const expected = {'#': [divJamilih]};
        const frag = document.createDocumentFragment();
        frag.appendChild(divDOM.cloneNode(true));
        const result = jml.toJML(frag);
        test.deepEqual(expected, result);
        test.done();
    }
};

nodeunit_1({
    jmlTests: testCase,
    otherMethodsTests: testCase$1,
    toJMLTests: testCase$2
}, {});
