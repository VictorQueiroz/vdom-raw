var AST = require('./src/AST'),
		escodegen = require('escodegen');

function parseString(html) {
	var ast = new AST(),
			tree = ast.ast(html);

	for(var i = 0; i < tree.body.length; i++) {
		return escodegen.generate(tree.body[i].expression);
	}
}

console.log(parseString(`<div>
	<span></span>
</div>`));

module.exports = parseString;
