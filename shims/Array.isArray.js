// Todo: replace with require shim plugin
if (!Array.isArray) {
    Array.isArray = function isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };
}
