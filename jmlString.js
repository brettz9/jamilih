/*jslint vars:true*/
/*
// Example
jmlString('div', {'class': 'attVal1', title: 'att<&>Val2'}, [
    'a<&b>c',
    ['input', {type: 'text'}],
    ['span', {
          $on: {click: function (e) {alert(e.target);}},
          dataset: {abc: '5', camelCase: '7'},
          style: {cssFloat: 'right', marginTop: '17px'}
    }]
]);
*/
// <div class="attVal1" title="att&lt;&amp;>Val2">a&lt;&amp;b>c<input type="text" /><span data-abc="5" data-camel-case="7" style="float:right;margin-top:17px;"></span></div>

// Todo: Allow config to add line breaks and levels of indentation
var module;
(function () {'use strict';
    function attValEsc (attVal) {
        return '="' + attVal.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;') + '"';
    }
    function jmlString (elName, atts, children) {
        var el = typeof elName === 'string' ? elName : elName.cloneNode(true).nodeName.toLowerCase();
        
        
        var voidEls = [
            'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img',
            'input', 'keygen', 'link', 'meta', 'param', 'source',
            'track', 'wbr'
        ];
        var selfClosing = voidEls.indexOf(el) > -1;
        
        var elemOpenTag = '<' + el;
        var elemCloseTag = selfClosing ? '' : '</' + el + '>';
        var attContent = '';
        if (atts && Array.isArray(atts)) {
            children = atts;
        }
        else if (atts) {
            Object.keys(atts).forEach(function (att) {
                if (att === 'innerHTML') {return;} // Handle later
                var attVal = atts[att];
                if (typeof attVal === 'object') { // e.g., with att as 'dataset' or 'style' (use cssFloat in place of float on style)
                    if (att === '$on') {
                        return Object.keys(attVal).forEach(function (ev) {
                            var val = attVal[ev];
                            val = (typeof val === 'function') ? [val, false] : val;
                            attContent += ' on' + ev + attValEsc(val[0].toString().replace(/function \((.*?)\) \{/, 'var $1 = event; ').slice(0, -1));
                        });
                    }
                    if (att === 'dataset') {
                        return Object.keys(attVal).forEach(function (prop) {
                            attContent += ' data-' + prop.replace(/([a-z])([A-Z])/g, function (n0, lwr, uppr) {
                                return lwr + '-' + uppr.toLowerCase();
                            }) + attValEsc(attVal[prop]);
                        });
                    }
                    // style
                    attContent += ' ' + att + 
                      attValEsc(Object.keys(attVal).reduce(function (s, prop) {
                        s += (prop === 'cssFloat' ? 'float' : prop.replace(/([a-z])([A-Z])/g, function (n0, lwr, uppr) {
                            return lwr + '-' + uppr.toLowerCase();
                        })) + ':' + attVal[prop] + ';';
                        return s;
                      }, ''));
                    return;
                }
                attContent += ' ' + att + attValEsc(attVal);
            });
        }
        elemOpenTag += attContent + (selfClosing ? ' />' : '>');
        return elemOpenTag + (atts.innerHTML || '') + (children || []).reduce(function (s, child) {
            var childContent;
            if (['string', 'number', 'boolean'].indexOf(typeof child) > -1) {
                childContent = String(child).replace(/&/g, '&amp;').replace(/</g, '&lt;');
            }
            else {
                childContent = jmlString.apply(null, child);
            }
            return s + childContent;
        }, '') + elemCloseTag;
    }
    if (module === undefined) {
        window.jmlString = jmlString;
    }
    else {
        module.exports = jmlString;
    }
}());
