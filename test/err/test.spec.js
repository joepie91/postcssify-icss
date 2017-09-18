const browserify = require('browserify');
const rawBody = require('raw-body');
const postcssify = require('../../index');
const path = require('path');
const util = require('util');

describe('err', function () {
	var jsStream;
	var jsStr;
	var cssStream;
	var onFiles = [];
	
	beforeEach(() => {
		var bundle = browserify({
			// assign toplevel module.exports to window['standalone']
			standalone: 'standalone',
		});
		
		bundle.plugin(postcssify, {
			before: [],
		});
		
		bundle.add(path.join(__dirname, 'index.js'));
		bundle.on('css stream', (stream) => { cssStream = stream; });
		bundle.on('file', (file) => { onFiles.push(file); });
		
		jsStream = bundle.bundle();
	});
	
	test('can\'t resolve', (cb) => {
		rawBody(jsStream, (err, buf) => {
			expect(err.message || String(err)).toEqual(
				expect.stringContaining('Can\'t resolve module path'));
			cb(null);
		});
	});
});
