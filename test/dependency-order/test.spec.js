const assert = require('assert');
const browserify = require('browserify');
const rawBody = require('raw-body');
const postcssify = require('../../index');
const path = require('path');

describe('plugin', function () {
	var jsStr;
	var jsStream;
	var cssStr;
	var cssStream;
	
	beforeEach(() => {
		var bundle = browserify();
		
		bundle.plugin(postcssify, {
			before: [],
			after: [
				require('postcss-calc'),
				require('autoprefixer'),
			],
		});
		
		bundle.add(path.join(__dirname, 'lib', 'source.js'));
		bundle.on('css stream', (stream) => { cssStream = stream; });
		
		jsStream = bundle.bundle();
	});
	
	beforeEach((cb) => {
		rawBody(jsStream, (err, buf) => {
			expect(err).toBeFalsy();
			//expect(buf.toString('utf8')).toMatchSnapshot();
			cb(null);
		});
	});
	
	beforeEach((cb) => {
		rawBody(cssStream, (err, buf) => {
			expect(err).toBeFalsy();
			cssStr = buf.toString('utf8');
			expect(cssStr).toMatchSnapshot();
			cb(null);
		});
	});
	
	test('must have correct css order', function () {
		// class order is: c e b a d (low to high priority)
		// required in different order in source.js,
		// but dependencies inside css decide which order
		expect(true).toBe(true);
	});
});
