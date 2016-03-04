var assert = require('assert'),
		AST = require('../src/AST'),
		Syntax = require('../src/Syntax');

describe('AST', function() {
	var ast;

	beforeEach(function() {
		ast = new AST();
	});

	it('should read element tag as a call expression of h()', function() {
		assert.deepEqual(ast.ast('<div></div>'), {
			type: Syntax.Program,
			body: [{
				type: Syntax.ExpressionStatement,
				expression: {
					type: Syntax.CallExpression,
					callee: {
						type: Syntax.Identifier,
						name: 'h'
					},
					arguments: [{
						type: Syntax.Literal,
						value: 'div'
					}, {
						type: Syntax.ObjectExpression,
						properties: []
					}, {
						type: Syntax.ArrayExpression,
						elements: []
					}]
				}
			}]
		});
	});

	it('should read element attributes', function() {
		assert.deepEqual(ast.ast(`
			<div someCoolAttr="1" anotherCoolAttribute="I can put whatever I want here">
			</div>
		`), {
			type: Syntax.Program,
			body: [{
				type: Syntax.ExpressionStatement,
				expression: {
					type: Syntax.CallExpression,
					callee: {
						type: Syntax.Identifier,
						name: 'h'
					},
					arguments: [{
						type: Syntax.Literal,
						value: 'div'
					}, {
						type: Syntax.ObjectExpression,
						properties: [{
							key: {
								type: Syntax.Identifier,
								name: 'someCoolAttr'
							},
							value: {
								type: Syntax.Literal,
								value: '1'
							}
						}, {
							key: {
								type: Syntax.Identifier,
								name: 'anotherCoolAttribute'
							},
							value: {
								type: Syntax.Literal,
								value: 'I can put whatever I want here'
							}
						}]
					}, {
						type: Syntax.ArrayExpression,
						elements: []
					}]
				}
			}]
		});
	});

	it('should read the element contents', function() {
		assert.deepEqual(ast.ast(`
			<div>
				<AnotherComponent attribute="user.name"></AnotherComponent>
			</div>
		`), {
			type: Syntax.Program,
			body: [{
				type: Syntax.ExpressionStatement,
				expression: {
					type: Syntax.CallExpression,
					callee: {
						type: Syntax.Identifier,
						name: 'h'
					},
					arguments: [{
						type: Syntax.Literal,
						value: 'div'
					}, {
						type: Syntax.ObjectExpression,
						properties: []
					}, {
						type: Syntax.ArrayExpression,
						elements: [{
							type: Syntax.CallExpression,
							callee: {
								type: Syntax.Identifier,
								name: 'h'
							},
							arguments: [{
								type: Syntax.Literal,
								value: 'AnotherComponent'
							}, {
								type: Syntax.ObjectExpression,
								properties: [{
									key: {
										type: Syntax.Identifier,
										name: 'attribute'
									},
									value: {
										type: Syntax.Literal,
										value: 'user.name'
									}
								}]
							}, {
								type: Syntax.ArrayExpression,
								elements: []
							}]
						}]
					}]
				}
			}]
		});
	});

	it('should throw for unclosed tags', function() {
		assert.throws(function() {
			ast.ast('<span><div></div>');
		});
	});

	it('should throw for previously closed tags', function() {
		assert.throws(function() {
			ast.ast(`
				<span>
					<ul>
						<span><div></div></ul></span>
				</span>
			`);
		});
	});

	it('should throw for unexpected closed tags', function() {
		assert.throws(function() {
			ast.ast('<span></ul></span>');
		});
	});
});
