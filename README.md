browserify postcss plugin
=========================

Compile icss modules using browserify.

Runs ```postcss.process()``` for each ```require('./file.css')```.

The generated css for each require() is collected,
sorted by dependencies and available 
as a stream via ```bundle.on('css stream', (stream) => {})```.
  
This plugin must be installed before ```watchify```.


ICSS plugins
------------

Runs the following plugins, in displayed order

* postcss-icss-values^2.0.0
* postcss-icss-selectors^2.0.0 (global mode)
* postcss-icss-composes^2.0.0
* carlhopf/postcss-modules-resolve-imports^1.3.0
  

API usage
---------

```javascript
const browserify = require('browserify');
const postcssify = require('postcssify-icss');
const rawBody = require('raw-body');

var bundle = browserify();

bundle.on('css stream', function (stream) {
  // consume stream... here's the collected css
  rawBody(stream, (err, buffer) => {
    var css = buffer.toString('utf8');
  });
});

bundle.plugin(postcssify, {
  // run before icss modules processed
  before: [
    require('postcss-mixins'), // must be before nested
    require('postcss-nested'),
  ],
  
  // run after icss compilation, on complete css bundle
  after: [
    require('postcss-calc'),
    require('autoprefixer'),
  ],
});

bundle.add('index.js'));
```

Browserify usage
----------------

example.css

```css
:local .dialog {
  background-color: red;
}

```

index.js

```javascript
const style = require('./example.css');

var html = `
  <div class="${style.dialog}">
    lorem ipsum
  </div>`;
  
document.body.innerHTML = html;
```
