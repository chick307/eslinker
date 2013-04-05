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

describe('utils', function() {
	var utils;

	before(function() {
		utils = require('../lib/utils');
	});

	describe('.unique', function() {
		var data = [
			{
				args: [[0, 1, 2]],
				expected: [0, 1, 2]
			},
			{
				args: [[0, 1, 2], [1, 3]],
				expected: [0, 1, 2, 3]
			},
			{
				args: [[0, 0], [1, 2], [3, 3], [4, 5]],
				expected: [0, 1, 2, 3, 4, 5]
			}
		];

		data.forEach(function(d) {
			it('(' + d.args.map(function(a) {
				return JSON.stringify(a);
			}).join(', ') + ') => ' + JSON.stringify(d.expected), function() {
				var actual = utils.unique.apply(null, d.args).sort();
				assert.deepEqual(actual, d.expected.sort());
			});
		});
	});
});
