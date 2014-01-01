/** @license MIT License (c) copyright 2014 original authors */
/** @author Brian Cavalier */
/** @author John Hann */
var Thenable = require('./Thenable');

module.exports = typeof Promise !== 'undefined' ? Promise : Thenable;
