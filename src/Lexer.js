var Token = {
  BooleanLiteral: 1,
  Identifier: 3,
  NullLiteral: 5,
  NumericLiteral: 6,
  Punctuator: 7,
  StringLiteral: 8
};

Lexer.BooleanLiteral = Token.BooleanLiteral;
Lexer.Identifier = Token.Identifier;
Lexer.NullLiteral = Token.NullLiteral;
Lexer.NumericLiteral = Token.NumericLiteral;
Lexer.Punctuator = Token.Punctuator;
Lexer.StringLiteral = Token.StringLiteral;

function Lexer() {
  this.text = null;
  this.index = null;
  this.tokens = null;
  this.curlyStack = null;
}

Lexer.prototype = {
  constructor: Lexer,

  lex: function(text) {
    this.text = text;
    this.index = 0;
    this.tokens = [];
    this.curlyStack = [];

    var cp;

    while(this.index < text.length) {
      cp = this.text.charCodeAt(this.index);

      if(cp === 0x27 || cp === 0x22) {
        this.scanStringLiteral();
      } else if(cp === 0x2E) {
        // Dot (.) U+002E can also start a floating-point number, hence the need
        // to check the next character.
        if(isDecimalDigit(this.text.charCodeAt(this.index + 1))) {
          this.scanNumericLiteral();
        } else {
          this.scanPunctuator();
        }
      } else if(isDecimalDigit(cp)) {
        this.scanNumericLiteral();
      } else if(isIdentifierStart(cp)) {
        this.scanIdentifier();
      } else if(isWhiteSpace(cp) || isLineTerminator(cp)) {
        ++this.index;
      } else {
        this.scanPunctuator();
      }
    }

    return this.tokens;
  },

  getIdentifier: function () {
    var ch,
        start = this.index++;

    while(this.index < this.text.length) {
      ch = this.text.charCodeAt(this.index);

      if(isIdentifierPart(ch)) {
        ++this.index;
      } else {
        break;
      }
    }

    return this.text.slice(start, this.index);
  },

  // ECMA-262 11.6 Names and Keywords
  scanIdentifier: function () {
    var start = this.index,
        type,
        id;

    id = this.getIdentifier();

    // There is no keyword or literal with only one character.
    // Thus, it must be an identifier.
    if(id.length === 1) {
      type = Token.Identifier;
    } else if(id === 'null') {
      id = null;
      type = Token.NullLiteral;
    } else if(id === 'true') {
      id = true;
      type = Token.BooleanLiteral;
    } else if (id === 'false') {
      id = false;
      type = Token.BooleanLiteral;
    } else {
      type = Token.Identifier;
    }

    this.tokens.push({
      type: type,
      value: id,
      start: start,
      end: this.index
    });
  },

  // ECMA-262 11.7 Punctuators
  scanPunctuator: function () {
    var str = this.text[this.index],
    token = {
      type: Token.Punctuator,
      value: '',
      start: this.index,
      end: this.index
    },
    curlyStack = this.curlyStack;

    switch(str) {
			case '=':
      case '>':
        ++this.index;
        break;
			default:
        // 2-character punctuators.
        str = this.text.substr(this.index, 2);
        if (str === '</') {
          this.index += 2;
        } else {
					// 1-character punctuators.
					str = this.text[this.index];
					if (str === '<') {
						++this.index;
					}
				}
    }

    if(this.index === token.start) {
      this.throwUnexpectedToken();
    }

    token.end = this.index;
    token.value = str;

    this.tokens.push(token);
  },

  // ECMA-262 11.8.4 String Literals
  scanStringLiteral: function () {
    var start = this.index,
        quote = this.text[start];

    if(!(quote === '\'' || quote === '"')) {
      throw new Error('String literal must starts with a quote');
    }

    ++this.index; //skip quote

    var ch,
        str = '';

    while(this.index < this.text.length) {
      ch = this.text[this.index++];

      if(quote === ch) {
        quote = '';
        break;
      } else {
        str += ch;
      }
    }

    if(quote !== '') {
      this.index = start;
      this.throwUnexpectedToken();
    }

    this.tokens.push({
      type: Token.StringLiteral,
      value: str,
      start: start,
      end: this.index
    });
  },

  scanNumericLiteral: function () {
    var start = this.index,
        ch = this.text[start];

    if(!(isDecimalDigit(ch.charCodeAt(0)) || (ch === '.'))) {
      throw new Error('Numeric literal must start with a decimal digit or a decimal point');
    }

    var number = '';
    if(ch !== '.') {
      number = this.text[this.index++];
      ch = this.text[this.index];

      while(isDecimalDigit(this.text.charCodeAt(this.index))) {
        number += this.text[this.index++];
      }
      ch = this.text[this.index];
    }

    if(ch === '.') {
      number = this.text[this.index++];
      while(isDecimalDigit(this.text.charCodeAt(this.index))) {
        number += this.text[this.index++];
      }
      ch = this.text[this.index];
    }

    if(isIdentifierStart(this.text.charCodeAt(this.index))) {
      this.throwUnexpectedToken();
    }

    this.tokens.push({
      type: Token.NumericLiteral,
      value: parseFloat(number),
      start: start,
      end: this.index
    });
  },

  throwUnexpectedToken: function () {
    throw new Error('Lexer: Unexpected character ' + this.text[this.index] + ' at ' + this.index);
  }
};

// ECMA-262 11.2 White Space
var tt = [0x1680, 0x180E, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF];
function isWhiteSpace(cp) {
  return (cp === 0x20) || (cp === 0x09) || (cp === 0x0B) || (cp === 0x0C) || (cp === 0xA0) ||
      (cp >= 0x1680 && tt.indexOf(cp) >= 0);
}

function isIdentifierStart(cp) {
  return (cp === 0x24) || (cp === 0x5F) ||  // $ (dollar) and _ (underscore)
      (cp >= 0x41 && cp <= 0x5A) ||         // A..Z
      (cp >= 0x61 && cp <= 0x7A) ||         // a..z
      (cp === 0x5C);                        // \ (backslash)
}

function isIdentifierPart(cp) {
  return (cp === 0x24) || (cp === 0x5F) ||  // $ (dollar) and _ (underscore)
      (cp >= 0x41 && cp <= 0x5A) ||         // A..Z
      (cp >= 0x61 && cp <= 0x7A) ||         // a..z
      (cp >= 0x30 && cp <= 0x39) ||         // 0..9
      (cp === 0x5C);                        // \ (backslash)
}

// ECMA-262 11.3 Line Terminators
function isLineTerminator(cp) {
  return (
		(cp === 0x0A) || (cp === 0x0D) ||
		(cp === 0x2028) || (cp === 0x2029)
	);
}

// ECMA-262 11.8.3 Numeric Literals
function isDecimalDigit(cp) {
  return (cp >= 0x30 && cp <= 0x39);        // 0..9
}

module.exports = Lexer;
