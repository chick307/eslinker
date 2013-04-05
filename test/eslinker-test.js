/*
 * (C) 2013 chick307 <chick307@gmail.com>
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */

var vm = require('vm');
var path = require('path');
var assert = require('assert');
var escodegen = require('escodegen');

var paths = {
	a: path.join(__dirname, 'assets', 'a.js'),
	b: path.join(__dirname, 'assets', 'b.js'),
	c: path.join(__dirname, 'assets', 'c.js'),
	d: path.join(__dirname, 'assets', 'd.js'),
};

describe('eslinker', function() {
	var eslinker;

	before(function() {
		eslinker = require('../lib/eslinker');
	});

	describe('link(...)', function() {
		var context;

		before(function() {
			var a = eslinker.loadMain(paths.a);
			a.link(eslinker.load(paths.b));
			a.link(eslinker.load(paths.c));
			a.link(eslinker.load(paths.d));
			var ast = a.toJSON();
			var code = escodegen.generate(ast);
			var ctx = vm.createContext({exports: {}});
			vm.runInContext(code, ctx);
			context = ctx;
		});

		it('.a => "a"', function() {
			assert.strictEqual(context.exports.a, "a");
		});

		it('.b => "b"', function() {
			assert.strictEqual(context.exports.b, "b");
		});

		it('.c => "c"', function() {
			assert.strictEqual(context.exports.c, "c");
		});

		it('.d => "d"', function() {
			assert.strictEqual(context.exports.d, "d");
		});
	});

	describe('autoLink(a)', function() {
		var context;

		before(function() {
			var a = eslinker.loadMain(paths.a);
			eslinker.autoLink(a);
			var ast = a.toJSON();
			var code = escodegen.generate(ast);
			var ctx = vm.createContext({
				exports: {},
				require: function(path) {
					assert.strictEqual(path, './d.js');
					return {d: "DDD"}
				}
			});
			vm.runInContext(code, ctx);
			context = ctx;
		});

		it('.a => "a"', function() {
			assert.strictEqual(context.exports.a, "a");
		});

		it('.b => "b"', function() {
			assert.strictEqual(context.exports.b, "b");
		});

		it('.c => "c"', function() {
			assert.strictEqual(context.exports.c, "c");
		});

		it('.d => "d"', function() {
			assert.strictEqual(context.exports.d, "DDD");
		});
	});
});
