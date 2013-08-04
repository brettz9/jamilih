/**
* @license MIT, GPL, do whatever you want
* @requires shim: Array.prototype.slice fix {@link https://gist.github.com/brettz9/6093105}
*/
if (!Array.from) {
    Array.from = function (object) {
        'use strict';
        return [].slice.call(object);
    };
}
