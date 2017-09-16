const browserify = require('browserify');
const rawBody = require('raw-body');
const postcssify2 = require('../../index');
const path = require('path');

describe('before', function () {
	var jsStream;
	var cssStream;
	var onFiles = [];
	
	beforeEach(() => {
		var bundle = browserify();
		
		bundle.plugin(postcssify2, {
			before: [
				require('postcss-nested'),
			],
		});
		
		bundle.add(path.join(__dirname, 'index.js'));
		bundle.on('css stream', (stream) => { cssStream = stream; });
		bundle.on('file', (file) => { onFiles.push(file); });
		
		jsStream = bundle.bundle();
	});
	
	beforeEach((cb) => {
		rawBody(jsStream, (err, buf) => {
			expect(err).toBeFalsy();
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
	
	test('nested', () => {
		
	});
});

describe('before', function () {
	var jsStream;
	var cssStream;
	var onFiles = [];
	
	beforeEach(() => {
		var bundle = browserify();
		
		bundle.plugin(postcssify2, {
			before: [],
		});
		
		bundle.add(path.join(__dirname, 'index.js'));
		bundle.on('css stream', (stream) => { cssStream = stream; });
		bundle.on('file', (file) => { onFiles.push(file); });
		
		jsStream = bundle.bundle();
	});
	
	beforeEach((cb) => {
		rawBody(jsStream, (err, buf) => {
			expect(err).toBeFalsy();
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
	
	test('not nested', () => {
		
	});
});
