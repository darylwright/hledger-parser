import anyTest, { TestFn } from 'ava';

import {
  ASTERISK_AT_START,
  CommentText,
  HASHTAG_AT_START,
  NEWLINE,
  SEMICOLON_AT_START,
  SemicolonComment
} from '../../lib/lexer/tokens';
import HLedgerParser from '../../lib/parser';
import { MockLexer, simplifyCst } from '../utils';

const test = anyTest as TestFn<{ lexer: MockLexer }>;

test.before((t) => {
  t.context = {
    lexer: new MockLexer()
  };
});

test('parses a semicolon line comment with no content', (t) => {
  t.context.lexer.addToken(SEMICOLON_AT_START, ';').addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.lineComment()),
    {
      SEMICOLON_AT_START: 1,
      NEWLINE: 1
    },
    '<lineComment> ;\\n'
  );
});

test('parses a hashtag line comment with no content', (t) => {
  t.context.lexer.addToken(HASHTAG_AT_START, '#').addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.lineComment()),
    {
      HASHTAG_AT_START: 1,
      NEWLINE: 1
    },
    '<lineComment> #\\n'
  );
});

test('parses an asterisk line comment with no content', (t) => {
  t.context.lexer.addToken(ASTERISK_AT_START, '*').addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.lineComment()),
    {
      ASTERISK_AT_START: 1,
      NEWLINE: 1
    },
    '<lineComment> *\\n'
  );
});

test('parses a semicolon full-line comment', (t) => {
  t.context.lexer
    .addToken(SEMICOLON_AT_START, ';')
    .addToken(CommentText, 'a full-line comment')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.lineComment()),
    {
      SEMICOLON_AT_START: 1,
      CommentText: 1,
      NEWLINE: 1
    },
    '<lineComment> ; a full-line comment\\n'
  );
});

test('parses a hashtag full-line comment', (t) => {
  t.context.lexer
    .addToken(HASHTAG_AT_START, '#')
    .addToken(CommentText, 'a full-line comment')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.lineComment()),
    {
      HASHTAG_AT_START: 1,
      CommentText: 1,
      NEWLINE: 1
    },
    '<lineComment> # a full-line comment\\n'
  );
});

test('parses an asterisk full-line comment', (t) => {
  t.context.lexer
    .addToken(ASTERISK_AT_START, '*')
    .addToken(CommentText, 'a full-line comment')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.lineComment()),
    {
      ASTERISK_AT_START: 1,
      CommentText: 1,
      NEWLINE: 1
    },
    '<lineComment> * a full-line comment\\n'
  );
});

test('does not parse an unterminated empty line comment', (t) => {
  t.context.lexer.addToken(SemicolonComment, ';');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(HLedgerParser.lineComment(), '<lineComment!> ;');
});
