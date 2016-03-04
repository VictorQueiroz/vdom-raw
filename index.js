var vm = require('vm'),
		AST = require('./src/AST'),
		escodegen = require('escodegen');

function parseString(html) {
	var ast = new AST(),
			tree = ast.ast(html);

	for(var i = 0; i < tree.body.length; i++) {
		return escodegen.generate(tree.body[i].expression);
	}
}

function compile(html, contextData) {
	var script = new vm.Script(parseString(html)),
			context = new vm.createContext(contextData);

	return script.runInContext(context);
}

module.exports = {
	compile: compile,
	AST: AST
};
