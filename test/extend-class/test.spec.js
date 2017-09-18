const browserify = require('browserify');
const rawBody = require('raw-body');
const postcssify = require('../../index');
const path = require('path');
const util = require('util');
const vm = require('vm');
const assert = require('assert');

describe('extend-class', function () {
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
			expect(buf.toString('utf8')).toMatchSnapshot();
			jsStr = buf.toString('utf8');
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
	
	test('defined', () => {
		const sandbox = {};
		const script = new vm.Script(jsStr);
		const context = new vm.createContext(sandbox);
		script.runInContext(context);
		
		assert(context);
		assert(context.standalone);
		
		expect(context.standalone.button).toBeTruthy();
		expect(context.standalone.extendButton).toBeTruthy();
		
		expect(context.standalone.extendButton)
			.not.toBe(context.standalone.button);
	});
});
