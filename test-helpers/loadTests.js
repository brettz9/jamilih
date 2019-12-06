/* globals mocha, chai */
import {jml, glue, nbsp} from '../src/jml.js';

mocha.setup('bdd');
mocha.globals(['jml', 'glue', 'nbsp']);

window.jml = jml;
window.glue = glue;
window.nbsp = nbsp;

window.assert = chai.assert;
