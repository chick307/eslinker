/*
 * (C) 2013 chick307 <chick307@gmail.com>
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var esprima = require('esprima');

describe('ast', function() {
	var ast;

	var files = [
		{
			name: 'a',
			path: './assets/a.js',
			deps: ['./assets/b.js', './assets/c.js'],
			ids: ['exports', 'require', 'a', 'b', 'c', 'd']
		},
		{
			name: 'b',
			path: './assets/b.js',
			deps: [],
			ids: ['exports', 'b']
		},
		{
			name: 'c',
			path: './assets/c.js',
			deps: ['./assets/d.js'],
			ids: ['exports', 'require', 'b', 'c', 'd']
		},
		{
			name: 'd',
			path: './assets/d.js',
			deps: ['./assets/b.js'],
			ids: ['exports', 'require', 'b', 'd']
		}
	];

	before(function() {
		ast = require('../lib/ast');

		files.forEach(function(f) {
			f.fullPath = require.resolve(f.path);
			f.code = fs.readFileSync(f.fullPath, 'utf8');
			f.ast = esprima.parse(f.code);
			f.deps = f.deps.map(function(dep) {
				return require.resolve(dep);
			});
		});
	});

	describe('.getIds', function() {
		files.forEach(function(f) {
			it('(' + f.name  + ') => ' + JSON.stringify(f.ids), function() {
				var expected = f.ids.sort();
				var actual = ast.getIds(f.ast).sort();
				assert.deepEqual(actual, expected);
			});
		});
	})

	describe('.getDeps', function() {
		files.forEach(function(f) {
			it('(' + f.name + ') => ' + JSON.stringify(f.deps), function() {
				var expected = f.deps.sort();
				var actual = ast.getDeps(f.ast).map(function(name) {
					return path.join(path.dirname(f.fullPath), name);
				}).sort();
				assert.deepEqual(actual, expected);
			});
		});
	});

	describe('.getRequiredPath', function() {
		var data = [
			{
				expected: null,
				argument: {
					type: 'Literal',
					value: 1
				}
			},
			{
				expected: 'abc',
				argument: {
					type: 'CallExpression',
					callee: {type: 'Identifier', name: 'require'},
					arguments: [
						{type: 'Literal', value: 'abc'}
					]
				}
			}
		];
		
		data.forEach(function(d) {
			var argumentJson = JSON.stringify(d.argument);
			var expectedJson = JSON.stringify(d.expected);
			it('(' + argumentJson + ') => ' + expectedJson, function() {
				var actual = ast.getRequiredPath(d.argument);
				assert.strictEqual(actual, d.expected);
			});
		});
	});
});
