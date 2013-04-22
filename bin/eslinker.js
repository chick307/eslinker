#!/usr/bin/env node
/*
 * (C) 2013 chick307 <chick307@gmail.com>
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */

var fs = require('fs');
var path = require('path');
var escodegen = require('escodegen');
var ArgumentParser = require('argparse').ArgumentParser;
var pkg = require('../package');
var Module = require('..').Module;
var LinkedModule = require('..').LinkedModule;
var load = require('..').load;
var loadMain = require('..').loadMain;
var autoLink = require('..').autoLink;
var wrap = require('..').wrap;


function main(argv) {
	var args = parseArguments(argv);

	// Load main module.
	var inputFullPath = path.resolve(process.cwd(), args.input);
	var linkedModule = loadMain(inputFullPath);

	// Link submodules.
	args.submodules.forEach(function(path_) {
		var fullPath = path.join(process.cwd(), path_);
		var submodule = load(fullPath);
		linkedModule.link(submodule);
	});

	// Link submodules automatically.
	if (args.autoLink)
		autoLink(linkedModule, true);

	// Get AST.
	var ast = linkedModule.toJSON();
	if (!args.bare)
		ast = wrap(ast);

	// Generate code.
	var result;
	switch (args.outputType) {
		case 'ast':
			result = JSON.stringify(ast);
			break;
		default:
			result = escodegen.generate(ast);
			var shebang = linkedModule.getShebang();
			if (args.shebang && shebang !== null)
				result = shebang + '\n' + result;
			break;
	}

	if (args.output == null) {
		// Write to standard output.
		console.log(result);
	} else {
		// Write to file.
		var outputFullPath = path.resolve(process.cwd(), args.output);
		fs.writeFileSync(outputFullPath, result + '\n', 'utf8');
	}

	process.exit(0);
}


function parseArguments(argv) {
	var parser = new ArgumentParser({
		version: pkg.version,
		addHelp: true,
		description: pkg.description
	});

	parser.addArgument(['input'], {
		action: 'store',
		help: 'Input file.',
		metavar: 'INPUT'
	});

	parser.addArgument(['submodules'], {
		nargs: '*',
		help: 'Submodule files.',
		metavar: 'SUBMODULES'
	});

	parser.addArgument(['-o', '--output'], {
		action: 'store',
		help: 'Output file.',
		dest: 'output'
	});

	parser.addArgument(['-t', '--output-type'], {
		action: 'store',
		defaultValue: 'js',
		choices: ['js', 'ast'],
		help: 'Output type.',
		dest: 'outputType'
	});

	parser.addArgument(['-a', '--auto-link'], {
		action: 'storeTrue',
		help: 'Auto link.',
		dest: 'autoLink'
	});

	parser.addArgument(['-b', '--bare'], {
		action: 'storeTrue',
		help: 'Link without a top-level function wrapper.',
		dest: 'bare'
	});

	parser.addArgument(['-s', '--shebang'], {
		action: 'storeTrue',
		help: 'Keep shebang.',
		dest: 'shebang'
	});

	var args = parser.parseArgs(argv);
	return args;
}


if (process.mainModule === module)
	main(process.argv.slice(2))
