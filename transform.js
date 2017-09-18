const path = require('path');
const through2 = require('through2');

function isMatch (file) {
	return /\.css$/.test(file);
}

module.exports = function transform (file, opts) {
	if (!isMatch(file)) return through2();
	
	var cache = opts.map[file];
	var instance = opts.instance;
	var depgraph = opts.depgraph;
	var css = '';
	
	if (!cache) {
		cache = opts.map[file] = {
			css: '',
			src: '',
			deps: [],
		};
	}
	
	function add (chunk, encoding, cb) {
		css += chunk.toString('utf8');
		cb();
	}
	
	function end (cb) {
		instance
			.process(css, { from: file })
			.then(result => {
				cache.css = result.css;
				cache.src = css;
				
				// postcss-modules-resolve-imports
				result.messages
					.filter(m => {
						return m.plugin === 'postcss-modules-resolve-imports' &&
							m.type === 'import';
					})
					.map(m => {
						if (!depgraph.hasNode(file)) {
							depgraph.addNode(m.from, {
								ast: m.ast,
							});
							
							m.dependencies.forEach(dep => {
								depgraph.addDependency(m.from, dep);
							});
						} else {
							depgraph.setNodeData(m.from, {
								ast: m.ast,
							});
						}
						
						cache.deps.push(...m.dependencies);
					});
					
				// make exports from postcss module available
				this.push('module.exports = ' + JSON.stringify(result.root.exports));
				
				// emit dependencies for watchify, to correctly invalidate cache
				// of parent module, when imported file changed
				// > https://github.com/browserify/watchify/
				//   blob/8de59fb6820f24698106afc6f0446f247a2b0c2e/index.js#L92-L96
				cache.deps.forEach(file => this.emit('file', file));
				
				cb(null);
			}, err => cb(err));
	}
	
	return through2(add, end)
};
