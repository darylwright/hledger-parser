import {
  AccountDirective,
  AccountName,
  AMOUNT_WS,
  ASTERISK,
  ASTERISK_AT_START,
  AT,
  CommentText,
  CommodityDirective,
  CommodityText,
  DASH,
  DateAtStart,
  DefaultCommodityDirective,
  DOUBLE_WS,
  EQUALS,
  FormatSubdirective,
  HASHTAG_AT_START,
  INDENT,
  InlineCommentTagColon,
  InlineCommentTagComma,
  InlineCommentTagName,
  InlineCommentTagValue,
  InlineCommentText,
  JournalNumber,
  LPAREN,
  MC_NEWLINE,
  Memo,
  MultilineComment,
  MultilineCommentEnd,
  MultilineCommentText,
  MultipleWSPostingMode,
  NEWLINE,
  ParenValue,
  PDirective,
  PDirectiveCommodityText,
  PIPE,
  PLUS,
  PostingStatusIndicator,
  RealAccountName,
  RPAREN,
  SEMICOLON_AT_START,
  SemicolonComment,
  SimpleDate,
  SINGLE_WS,
  Text,
  TxnStatusIndicator,
  VirtualAccountName,
  VirtualBalancedAccountName
} from './tokens';

export const default_mode = [
  DateAtStart,
  AccountDirective,
  PDirective,
  CommodityDirective,
  DefaultCommodityDirective,
  MultilineComment,
  INDENT,
  SEMICOLON_AT_START,
  HASHTAG_AT_START,
  ASTERISK_AT_START,
  NEWLINE
];

// Note: Subdirectives must be listed before RealAccountName
export const indent_mode = [
  SemicolonComment,
  PostingStatusIndicator,
  FormatSubdirective,
  VirtualAccountName,
  VirtualBalancedAccountName,
  RealAccountName
];

export const account_mode = [
  NEWLINE,
  DOUBLE_WS,
  SINGLE_WS,
  SemicolonComment,
  AccountName
];

export const comment_mode = [SINGLE_WS, CommentText, NEWLINE];

export const inline_comment_mode = [
  SINGLE_WS,
  InlineCommentTagColon,
  InlineCommentTagName,
  InlineCommentText,
  NEWLINE
];

export const inline_comment_tag_mode = [
  SINGLE_WS,
  InlineCommentTagValue,
  InlineCommentTagComma,
  NEWLINE
];

export const posting_mode = [
  MultipleWSPostingMode,
  SINGLE_WS,
  PostingStatusIndicator,
  SemicolonComment,
  NEWLINE,
  VirtualAccountName,
  VirtualBalancedAccountName,
  RealAccountName
];

export const posting_amount_mode = [
  SemicolonComment,
  AT,
  LPAREN,
  RPAREN,
  EQUALS,
  ASTERISK,
  JournalNumber,
  AMOUNT_WS,
  CommodityText,
  DASH,
  PLUS,
  NEWLINE
];

export const txn_line_mode = [
  SINGLE_WS,
  NEWLINE,
  EQUALS,
  SimpleDate,
  PIPE,
  ParenValue,
  TxnStatusIndicator,
  SemicolonComment,
  Text
];

export const price_mode = [SINGLE_WS, SimpleDate, PDirectiveCommodityText];

export const price_amounts_mode = [
  AMOUNT_WS,
  NEWLINE,
  JournalNumber,
  CommodityText,
  DASH,
  PLUS
];

export const memo_mode = [SemicolonComment, NEWLINE, Memo];

export const commodity_mode = [
  AMOUNT_WS,
  NEWLINE,
  JournalNumber,
  CommodityText,
  DASH,
  PLUS,
  SemicolonComment
];

export const format_mode = [
  AMOUNT_WS,
  NEWLINE,
  JournalNumber,
  CommodityText,
  DASH,
  PLUS,
  SemicolonComment
];

export const multiline_comment_mode = [
  MC_NEWLINE,
  MultilineCommentEnd,
  MultilineCommentText
];
