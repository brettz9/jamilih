require('http').createServer(function (req, res) {
    var extra = req.url === '/test/' ? 'index.html' : (req.url === '/test' ? '/index.html'  : '');
    var s = require('fs').createReadStream('.' + req.url + extra);
    s.pipe(res);
    s.on('error', function () {});
}).listen(8083);
console.log('Started server; open http://localhost:8083/test/ in the browser');
