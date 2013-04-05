/*
 * (C) 2013 chick307 <chick307@gmail.com>
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */

var fs = require('fs');
var Module = require('./module').Module;
var LinkedModule = require('./linked-module').LinkedModule;


var load = exports.load = function load(path) {
	var source = fs.readFileSync(path, 'utf8');
	if (/\.json$/.test(path))
		source = 'module.exports = ' + source;
	var module = new Module(source, path);
	return module;
};


var loadMain = exports.loadMain = function loadMain(path) {
	var mainModule = load(path);
	var linkedModule = new LinkedModule(mainModule);
	return linkedModule;
};


var autoLink = exports.autoLink = function autoLink(linkedModule, recursive) {
	void function f(module) {
		module.getDeps().forEach(function(dep) {
			if (!/^\.\.?\/|^\.\.?$/.test(dep))
				return;

			var fullPath = module.resolve(dep);
			if (linkedModule.getSubmodules().every(function(submodule) {
				return submodule.getFullPath() !== fullPath;
			})) {
				var submodule = load(fullPath);
				linkedModule.link(submodule);
				if (!!recursive)
					f(submodule);
			}
		});
	}(linkedModule.getMainModule());
};
