import anyTest, { TestInterface } from 'ava';

import { PostingModeTokens, TxnLineModeTokens } from '../../lib/lexer/tokens';
import HLedgerParser from '../../lib/parser';
import { MockLexer, simplifyCst } from '../utils';

const test = anyTest as TestInterface<{ lexer: MockLexer }>;

test.before((t) => {
  t.context = {
    lexer: new MockLexer()
  };
});

test('parses a pending status indicator', (t) => {
  t.context.lexer.addToken(PostingModeTokens.PostingStatusIndicator, '!');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.statusIndicator()),
    {
      PostingStatusIndicator: 1
    },
    '<statusIndicator> ! (posting status)'
  );
});

test('parses a cleared status indicator', (t) => {
  t.context.lexer.addToken(TxnLineModeTokens.TxnStatusIndicator, '*');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.statusIndicator()),
    {
      TxnStatusIndicator: 1
    },
    '<statusIndicator> * (transaction status)'
  );
});
