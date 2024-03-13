import test from 'ava';

import { runLexerTests } from './utils';

const tests = [
  {
    pattern: 'account Assets:Chequing  ',
    expected: [
      'AccountDirective',
      { AccountName: ['Assets', 'Chequing'] },
      'DOUBLE_WS'
    ],
    title: 'recognize account directive and name with double-space at end'
  },
  {
    pattern: 'account Assets:Chequing\n',
    expected: [
      'AccountDirective',
      { AccountName: ['Assets', 'Chequing'] },
      'NEWLINE'
    ],
    title: 'recognize account directive and name with end of line at end'
  },
  {
    pattern: 'account Assets:Chequing  ; a comment\n',
    expected: [
      'AccountDirective',
      { AccountName: ['Assets', 'Chequing'] },
      'DOUBLE_WS',
      'SemicolonComment',
      'InlineCommentText',
      'NEWLINE'
    ],
    title: 'recognize account directive and name with comment at end'
  },
  {
    pattern: 'account Assets:Chequing  ; a comment with: a tag\n',
    expected: [
      'AccountDirective',
      { AccountName: ['Assets', 'Chequing'] },
      'DOUBLE_WS',
      'SemicolonComment',
      'InlineCommentText',
      'InlineCommentTagName',
      'InlineCommentTagColon',
      'InlineCommentTagValue',
      'NEWLINE'
    ],
    title: 'recognize account directive and name with comment with a tag at end'
  },
  {
    pattern: 'account Assets:Chequing\n    ; a comment\n',
    expected: [
      'AccountDirective',
      { AccountName: ['Assets', 'Chequing'] },
      'NEWLINE',
      'INDENT',
      'SemicolonComment',
      'InlineCommentText',
      'NEWLINE'
    ],
    title: 'recognize account directive and name with comment on the next line'
  },
  {
    pattern: 'account (Assets:Chequing)  ',
    expected: [
      'AccountDirective',
      { AccountName: ['(Assets', 'Chequing)'] },
      'DOUBLE_WS'
    ],
    title:
      'ignore ( and treat it as part of the account name of a real account (hledger bug)'
  },
  {
    pattern: 'account [Assets:Chequing]  ',
    expected: [
      'AccountDirective',
      { AccountName: ['[Assets', 'Chequing]'] },
      'DOUBLE_WS'
    ],
    title:
      'ignore [ and treat it as part of the account name of a real account (hledger bug)'
  }
];

runLexerTests(test, tests);
