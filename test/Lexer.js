var Lexer = require('../src/Lexer'),
		assert = require('assert');

describe('Lexer', function() {
	var lexer;

	beforeEach(function() {
		lexer = new Lexer();
	});

	it('should deal with </ as a specific punctuator', function() {
		assert.deepEqual(lexer.lex('<div></div>'), [
			{type: Lexer.Punctuator, value: '<', start: 0, end: 1},
			{type: Lexer.Identifier, value: 'div', start: 1, end: 4},
			{type: Lexer.Punctuator, value: '>', start: 4, end: 5},
			{type: Lexer.Punctuator, value: '</', start: 5, end: 7},
			{type: Lexer.Identifier, value: 'div', start: 7, end: 10},
			{type: Lexer.Punctuator, value: '>', start: 10, end: 11}
		]);
	});
});
