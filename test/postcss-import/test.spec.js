const assert = require('assert');
const browserify = require('browserify');
const rawBody = require('raw-body');
const postcssify2 = require('../../index');
const path = require('path');

describe('plugin', function () {
	var jsStr;
	var jsStream;
	var cssStr;
	var cssStream;
	
	beforeEach(function () {
		var bundle = browserify();
		
		bundle.plugin(postcssify2, {
			before: [
				require('postcss-import')(),
			],
		});
		
		bundle.add(path.join(__dirname, 'index.js'));
		bundle.on('css stream', (stream) => { cssStream = stream; });
		
		jsStream = bundle.bundle();
	});
	
	beforeEach((cb) => {
		rawBody(jsStream, (err, buf) => {
			expect(err).toBeFalsy();
			expect(buf.toString('utf8')).toMatchSnapshot();
			cb(null);
		});
	});
	
	beforeEach((cb) => {
		rawBody(cssStream, (err, buf) => {
			expect(err).toBeFalsy();
			expect(buf.toString('utf8')).toMatchSnapshot();
			cb(null);
		});
	});
	
	test('must import file', function () {
		expect(true).toBe(true);
	});
});
