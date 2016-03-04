'use strict';

var Lexer = require('./Lexer'),
		Syntax = require('./Syntax');

class AST {
	constructor() {
		this.lexer = new Lexer();
		this.tokens = null;
	}

	ast(text) {
		this.text = text;
		this.tags = [];
		this.tokens = this.lexer.lex(text);

		return this.program();
	}

	program () {
		var body = [];

		while(this.tokens.length > 0) {
			body.push(this.expressionStatement());
			if(this.tags.length > 0) {
				throw new Error(`unclosed tags -> ${this.tags.join(' -> ')}`);
			}
		}

		return {
			type: Syntax.Program,
			body: body
		}
	}

	expressionStatement() {
		return {
			type: Syntax.ExpressionStatement,
			expression: this.element()
		};
	}

	element() {
		// start of the element
		if(this.expect('<')) {
			let args = [];

			if(this.peek().type !== Lexer.Identifier) {
				throw new Error('impossible');
			}

			// tag name
			let tagName = this.consume().value;
			this.tags.push(tagName);

			args.push({
				type: Syntax.Literal,
				value: tagName
			});

			// attributes
			args.push(this.attributes());

			let elements = [];

			if(!this.peek('</')) {
				while(!this.peek('</') && this.tokens.length > 0) {
					elements.push(this.element());
				}
			}

			// expect for the closing of the tag
			this.consume('</');
			this.consume(tagName);
			this.consume('>');

			this.tags.pop();

			args.push({
				type: Syntax.ArrayExpression,
				elements: elements
			});

			return {
				type: Syntax.CallExpression,
				callee: {
					type: Syntax.Identifier,
					name: 'h'
				},
				arguments: args
			};
		}
	}

	attributes() {
		var props = [];

		while(!this.expect('>')) {
			let prop = {
				key: {
					type: Syntax.Identifier
				},
				value: {
					type: Syntax.Literal
				}
			};

			switch(this.peek().type) {
				case Lexer.Identifier:
					prop.key.name = this.consume().value;
					break;
				case Lexer.StringLiteral:
				case Lexer.NumericLiteral:
					prop.key.name = this.consume().value;
					break;
				default:
					throw new Error('impossible ' + this.peek().value);
			}

			if(this.expect('=')) {
				if(this.peek().type == Lexer.StringLiteral) {
					prop.value.value = this.consume().value;
				} else {
					this.throwError('is unexpected, expecting a string literal');
				}
			}

			props.push(prop);
		}

		return {
			type: Syntax.ObjectExpression,
			properties: props
		};
	}

	peek(e1, e2, e3, e4) {
    return this.peekAhead(0, e1, e2, e3, e4);
  }

	peekToken() {
    if (this.tokens.length === 0) {
      throw new Error('Unexpected end of expression: ' + this.text);
    }

    return this.tokens[0];
  }

	peekAhead(i, e1, e2, e3, e4) {
    if(this.tokens.length > i) {
      var token = this.tokens[i];
      var t = token.value;
      if((t === e1 || t === e2 || t === e3 || t === e4) || (!e1 && !e2 && !e3 && !e4)) {
        return token;
      }
    }
    return false;
  }

	expect(e1, e2, e3, e4) {
    var token = this.peek(e1, e2, e3, e4);
    if(token) {
      this.tokens.shift();
      return token;
    }
    return false;
  }

	throwError(msg, token) {
		throw new Error(`"${token.value}" at ${token.start} ${msg}`);
	}

	consume(e1) {
    if(this.tokens.length === 0) {
      throw new Error('Unexpected end of expression: ' + this.text);
    }

    var token = this.expect(e1);
    if(!token) {
      this.throwError('is unexpected, expecting "' + e1 + '"', this.peek());
    }
    return token;
  }
}

module.exports = AST;
