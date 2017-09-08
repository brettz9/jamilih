/* eslint-env node */
require('http').createServer(function (req, res) {
    const extra = req.url === '/test/' ? 'index.html' : (req.url === '/test' ? '/index.html' : '');
    if (req.url.endsWith('.js')) {
        res.setHeader('Content-Type', 'text/javascript');
    } else if (req.url.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
    }
    const s = require('fs').createReadStream('.' + req.url + extra);
    s.pipe(res);
    s.on('error', function () {});
}).listen(8083);
console.log('Started server; open http://localhost:8083/test/ in the browser');
