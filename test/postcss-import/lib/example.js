require('./example1.css');

require('./example2');

require('./example3.css');

// should only require once
var style = require('./example1.css');

module.exports = style;
