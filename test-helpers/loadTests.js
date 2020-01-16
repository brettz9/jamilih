/* globals mocha, chai */
import {jml, glue, nbsp, $, $$, body} from '../src/jml.js';

mocha.setup('bdd');
mocha.globals(['jml', 'glue', 'nbsp']);

window.jml = jml;
window.glue = glue;
window.nbsp = nbsp;
window.$ = $;
window.$$ = $$;
window.body = body;

window.assert = chai.assert;
window.expect = chai.expect;
