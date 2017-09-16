const path = require('path');
const through2 = require('through2');
const postcss = require('postcss');
const assign = require('object-assign');
const ReadableStream = require('stream').Readable;
const transform = require('./transform');
const DepGraph = require('dependency-graph').DepGraph;


/**
 * Inject into browserify pipeline.
 */
function hook (browserify, opts) {
	var map = opts.map;
	var depgraph = opts.depgraph;
	var instance = opts.instance;
	
	browserify.pipeline
		.get('pack')
		// insert before browser-pack, so we get resolved file names in
		// correct dependency order
		.unshift(through2.obj(function (row, enc, cb) {
			var file = row.file || row.id;
			
			this.push(row);
			cb();
		}, function end (cb) {
			// generate per-module css, and stitch together
			// (highest priority css goes to the bottom)
			var order = depgraph.overallOrder();
			
			var css = order
				.map((file) => {
					var data = depgraph.getNodeData(file);
					var str = '';
					postcss.stringify(data.ast, _str => str += _str);
					return str;
				})
				.join('');
			
			// run 'after' plugins
			opts.instanceAfter
				.process(css, { from: process.cwd() })
				.then((res) => {
					// on each bundle, create a new stream b/c the old one might have ended
					var cssStream = new ReadableStream();
					cssStream._read = function () {};
					browserify.emit('css stream', cssStream);

					// end the output stream
					cssStream.push(res.css);
					cssStream.push(null);
					
					cb(null);
				}, (err) => {
					cb(err);
				});
		}));
}

module.exports = function (browserify, opts) {
	var map = {}; // buffer: file -> css
	
	var plugins = [
		...(opts.before || []),
		
		// icss modules
		require('postcss-icss-values'),
	  require('postcss-icss-selectors')({ mode: 'global' }),
	  require('postcss-icss-composes'),
	  require('postcss-modules-resolve-imports')({}),
	];
	
	var instance = postcss(plugins);
	var instanceAfter = postcss(opts.after || []);
	var depgraph = new DepGraph();
	
	opts = assign(opts, {
		instance: instance,
		instanceAfter: instanceAfter,
		map: map,
		depgraph: depgraph,
	});
	
	browserify.transform(transform, opts);
	
	browserify.on('reset', () => hook(browserify, opts));
	hook(browserify, opts);

	return browserify;  
};
