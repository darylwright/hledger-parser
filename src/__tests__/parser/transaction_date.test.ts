import anyTest, { TestFn } from 'ava';

import { DateAtStart, EQUALS, SimpleDate } from '../../lib/lexer/tokens';
import HLedgerParser from '../../lib/parser';
import { MockLexer, simplifyCst } from '../utils';

const test = anyTest as TestFn<{ lexer: MockLexer }>;

test.before((t) => {
  t.context = {
    lexer: new MockLexer()
  };
});

test('parses a transaction date', (t) => {
  t.context.lexer.addToken(DateAtStart, '1900/01/01');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.transactionDate()),
    {
      DateAtStart: 1
    },
    '<transactionDate> 1900/01/01'
  );
});

test('parses a transaction date with a posting date', (t) => {
  t.context.lexer
    .addToken(DateAtStart, '1900/01/01')
    .addToken(EQUALS, '=')
    .addToken(SimpleDate, '1901/02/02');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.transactionDate()),
    {
      DateAtStart: 1,
      EQUALS: 1,
      SimpleDate: 1
    },
    '<transactionDate> 1900/01/01=1901/02/02'
  );
});

test('does not parse a transaction date if not at start of line', (t) => {
  t.context.lexer.addToken(SimpleDate, '1900/03/03');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(HLedgerParser.transactionDate(), '<transactionDate!> 1900/03/03');
});

test('does not parse transaction date with empty posting date', (t) => {
  t.context.lexer.addToken(DateAtStart, '1900/03/03').addToken(EQUALS, '=');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(HLedgerParser.transactionDate(), '<transactionDate!> 1900/03/03=');
});

// TODO: There are tests missing for handling smart dates: https://hledger.org/1.30/hledger.html#smart-dates
