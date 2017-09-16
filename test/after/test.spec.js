const browserify = require('browserify');
const rawBody = require('raw-body');
const postcssify2 = require('../../index');
const path = require('path');

describe('after', function () {
	var jsStream;
	var cssStream;
	
	beforeEach(() => {
		var bundle = browserify();
		
		bundle.plugin(postcssify2, {
			after: [
				require('postcss-calc'),
			],
		});
		
		bundle.add(path.join(__dirname, 'index.js'));
		bundle.on('css stream', (stream) => { cssStream = stream; });
		jsStream = bundle.bundle();
	});
	
	beforeEach((cb) => {
		rawBody(jsStream, (err, buf) => {
			expect(err).toBeFalsy();
			cb(null);
		});
	});
	
	test('postcss-calc', (cb) => {
		rawBody(cssStream, (err, buf) => {
			expect(err).toBeFalsy();
			expect(buf.toString('utf8')).toMatchSnapshot();
			cb(null);
		});
	});
});

describe('after', function () {
	var jsStream;
	var cssStream;
	
	beforeEach(() => {
		var bundle = browserify();
		
		bundle.plugin(postcssify2, {
			after: [],
		});
		
		bundle.add(path.join(__dirname, 'index.js'));
		bundle.on('css stream', (stream) => { cssStream = stream; });
		jsStream = bundle.bundle();
	});
	
	beforeEach((cb) => {
		rawBody(jsStream, (err, buf) => {
			expect(err).toBeFalsy();
			cb(null);
		});
	});
	
	test('no postcss-calc', (cb) => {
		rawBody(cssStream, (err, buf) => {
			expect(err).toBeFalsy();
			expect(buf.toString('utf8')).toMatchSnapshot();
			cb(null);
		});
	});
});
