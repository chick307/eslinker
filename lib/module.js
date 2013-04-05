/*
 * (C) 2013 chick307 <chick307@gmail.com>
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */

var path = require('path');
var esprima = require('esprima');
var resolveSync = require('resolve').sync;
var ast = require('./ast');

var SHEBANG_RE = /^(#![^\n\r]+)[\n\r]?/;


var Module = exports.Module = (function() {
	var ctor = function Module(source, fullPath) {
		if (!(this instanceof ctor))
			throw new TypeError('Constructor cannot be called as a function.');

		this._shebang = null;
		source = source.replace(SHEBANG_RE, function(_, match) {
			this._shebang = match;
			return '';
		}.bind(this));
		this._ast = esprima.parse(source);
		this._fullPath = fullPath;
	};

	var proto = ctor.prototype = {};
	proto.constructor = ctor;

	proto.getAst = function getAst() {
		return this._ast;
	};

	proto.getFullPath = function getFullPath() {
		return this._fullPath;
	};

	proto.getShebang = function getShebang() {
		return this._shebang;
	};

	proto.getDeps = function getDeps() {
		var deps = ast.getDeps(this._ast);
		return deps;
	};

	proto.resolve = function resolve(path_) {
		var fullPath = resolveSync(path_, {
			paths: [],
			extensions: ['.js', '.json'],
			basedir: path.dirname(this.getFullPath())
		});
		return fullPath;
	};

	proto.relative = function relative(fullPath) {
		var path_ = path.relative(path.dirname(this.getFullPath()), fullPath);
		if (!/^\.\.?\//.test(path_))
			path_ = './' + path_;
		return path_;
	};

	return ctor;
}());
