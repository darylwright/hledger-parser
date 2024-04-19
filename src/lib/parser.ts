import { CstParser, EOF } from 'chevrotain';

import { tokenModeDefinitions } from './lexer';
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
  Text,
  TxnStatusIndicator,
  VirtualAccountName,
  VirtualBalancedAccountName,
  YearDirective,
  YearDirectiveValue
} from './lexer/tokens';

class HLedgerParser extends CstParser {
  constructor() {
    super(tokenModeDefinitions);
    this.performSelfAnalysis();
  }

  public lineComment = this.RULE('lineComment', () => {
    this.OR([
      { ALT: () => this.CONSUME(SEMICOLON_AT_START) },
      { ALT: () => this.CONSUME(HASHTAG_AT_START) },
      { ALT: () => this.CONSUME(ASTERISK_AT_START) }
    ]);
    this.OPTION(() => {
      this.CONSUME(CommentText);
    });
    this.CONSUME(NEWLINE);
  });

  public inlineComment = this.RULE('inlineComment', () => {
    this.CONSUME(SemicolonComment);
    this.MANY(() => this.SUBRULE(this.inlineCommentItem));
  });

  public inlineCommentItem = this.RULE('inlineCommentItem', () => {
    this.OR([
      { ALT: () => this.CONSUME(InlineCommentText) },
      { ALT: () => this.SUBRULE(this.tag) }
    ]);
  });

  public tag = this.RULE('tag', () => {
    this.CONSUME(InlineCommentTagName);
    this.CONSUME(InlineCommentTagColon);
    this.OPTION(() => this.CONSUME(InlineCommentTagValue));
    this.OPTION1(() => this.CONSUME(InlineCommentTagComma));
  });

  public journal = this.RULE('journal', () => {
    this.MANY(() => {
      this.SUBRULE(this.journalItem);
    });
  });

  public journalItem = this.RULE('journalItem', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.transaction) },
      { ALT: () => this.SUBRULE(this.lineComment) },
      { ALT: () => this.SUBRULE(this.priceDirective) },
      { ALT: () => this.SUBRULE(this.accountDirective) },
      { ALT: () => this.SUBRULE(this.commodityDirective) },
      { ALT: () => this.SUBRULE(this.defaultCommodityDirective) },
      { ALT: () => this.SUBRULE(this.multilineComment) },
      { ALT: () => this.SUBRULE(this.yearDirective) },
      { ALT: () => this.CONSUME(NEWLINE) }
    ]);
  });

  public transaction = this.RULE('transaction', () => {
    this.SUBRULE(this.transactionInitLine);
    this.MANY(() => {
      this.SUBRULE(this.transactionContentLine);
    });
  });

  public priceDirective = this.RULE('priceDirective', () => {
    this.CONSUME(PDirective);
    this.CONSUME(SimpleDate);
    this.CONSUME(PDirectiveCommodityText);
    this.SUBRULE(this.amount);
    this.CONSUME(NEWLINE); // TODO: There is support for inline comments prior to NEWLINE.
  });

  public accountDirective = this.RULE('accountDirective', () => {
    this.CONSUME(AccountDirective);
    this.CONSUME(AccountName);
    this.OPTION(() => {
      this.CONSUME(DOUBLE_WS);
      this.SUBRULE(this.inlineComment);
    });
    this.CONSUME(NEWLINE);
    this.MANY(() => {
      this.SUBRULE(this.accountDirectiveContentLine);
    });
  });

  public accountDirectiveContentLine = this.RULE(
    'accountDirectiveContentLine',
    () => {
      this.CONSUME(INDENT);
      // this.OR([
      /* { ALT: () =>  */ this.SUBRULE(this.inlineComment); /*  }, */
      // ]);
      this.CONSUME(NEWLINE);
    }
  );

  public transactionInitLine = this.RULE('transactionInitLine', () => {
    this.SUBRULE(this.transactionDate);
    this.OPTION(() => {
      this.SUBRULE(this.statusIndicator);
    });
    this.OPTION1(() => {
      this.SUBRULE(this.chequeNumber);
    });
    this.OPTION2(() => {
      this.SUBRULE(this.description);
    });
    this.OPTION3(() => {
      this.SUBRULE(this.inlineComment);
    });
    this.CONSUME(NEWLINE);
  });

  public transactionContentLine = this.RULE('transactionContentLine', () => {
    this.CONSUME(INDENT);
    this.OR([
      { ALT: () => this.SUBRULE(this.posting) },
      { ALT: () => this.SUBRULE(this.inlineComment) }
    ]);
    this.CONSUME(NEWLINE);
  });

  public posting = this.RULE('posting', () => {
    this.OPTION(() => {
      this.SUBRULE(this.statusIndicator);
    });
    this.SUBRULE(this.account);
    this.OPTION1(() => {
      this.SUBRULE(this.amount);
    });
    this.OPTION2(() => {
      this.SUBRULE(this.lotPrice);
    });
    this.OPTION3(() => {
      this.SUBRULE(this.assertion);
    });
    this.OPTION4(() => {
      this.SUBRULE(this.inlineComment);
    });
  });

  public transactionDate = this.RULE('transactionDate', () => {
    this.CONSUME(DateAtStart);
    this.OPTION(() => {
      this.CONSUME(EQUALS);
      this.CONSUME(SimpleDate);
    });
  });

  public account = this.RULE('account', () => {
    this.OR([
      { ALT: () => this.CONSUME(RealAccountName) },
      { ALT: () => this.CONSUME(VirtualAccountName) },
      { ALT: () => this.CONSUME(VirtualBalancedAccountName) }
    ]);
  });

  private parseAmount(mandatoryCommodity = false) {
    this.OR([
      {
        ALT: () => {
          this.OR1([
            { ALT: () => this.CONSUME(DASH) },
            { ALT: () => this.CONSUME(PLUS) }
          ]);
          this.OPTION(() => this.CONSUME(AMOUNT_WS));
          this.OR2([
            {
              ALT: () => {
                this.CONSUME(CommodityText);
                this.OPTION1(() => this.CONSUME1(AMOUNT_WS));
                this.CONSUME(JournalNumber);
              }
            },
            {
              ALT: () => {
                this.CONSUME1(JournalNumber);
                if (mandatoryCommodity) {
                  this.OPTION2(() => this.CONSUME2(AMOUNT_WS));
                  this.CONSUME1(CommodityText);
                } else {
                  this.OPTION9(() => {
                    this.OPTION3(() => this.CONSUME7(AMOUNT_WS));
                    this.CONSUME4(CommodityText);
                  });
                }
              }
            }
          ]);
        }
      },
      {
        ALT: () => {
          this.CONSUME2(JournalNumber);
          if (mandatoryCommodity) {
            this.OPTION4(() => this.CONSUME3(AMOUNT_WS));
            this.CONSUME2(CommodityText);
          } else {
            this.OPTION4(() => {
              this.OPTION5(() => this.CONSUME3(AMOUNT_WS));
              this.CONSUME2(CommodityText);
            });
          }
        }
      },
      {
        ALT: () => {
          this.CONSUME3(CommodityText);
          this.OPTION6(() => this.CONSUME4(AMOUNT_WS));
          this.OR3([
            {
              ALT: () => {
                this.CONSUME3(JournalNumber);
              }
            },
            {
              ALT: () => {
                this.OR4([
                  { ALT: () => this.CONSUME1(DASH) },
                  { ALT: () => this.CONSUME1(PLUS) }
                ]);
                this.OPTION7(() => this.CONSUME5(AMOUNT_WS));
                this.CONSUME4(JournalNumber);
              }
            }
          ]);
        }
      }
    ]);
    this.OPTION8(() => this.CONSUME6(AMOUNT_WS));
  }

  public amount = this.RULE('amount', () => {
    this.parseAmount();
  });

  public lotPrice = this.RULE('lotPrice', () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(LPAREN);
          this.CONSUME(AT);
          this.OPTION(() => this.CONSUME1(AT));
          this.CONSUME(RPAREN);
        }
      },
      {
        ALT: () => {
          this.CONSUME2(AT);
          this.OPTION1(() => this.CONSUME3(AT));
        }
      }
    ]);
    this.CONSUME(AMOUNT_WS);
    this.SUBRULE(this.amount);
  });

  public assertion = this.RULE('assertion', () => {
    this.CONSUME(EQUALS);
    this.OPTION(() => {
      this.CONSUME1(EQUALS);
    });
    this.OPTION1(() => {
      this.CONSUME(ASTERISK);
    });
    this.CONSUME(AMOUNT_WS);
    this.SUBRULE(this.amount);
  });

  public statusIndicator = this.RULE('statusIndicator', () => {
    this.OR([
      { ALT: () => this.CONSUME(PostingStatusIndicator) },
      { ALT: () => this.CONSUME(TxnStatusIndicator) }
    ]);
  });

  public chequeNumber = this.RULE('chequeNumber', () => {
    this.CONSUME(ParenValue);
  });

  public description = this.RULE('description', () => {
    this.CONSUME(Text);
    this.OPTION(() => {
      this.CONSUME(PIPE);
      this.CONSUME1(Memo);
    });
  });

  public commodityDirective = this.RULE('commodityDirective', () => {
    this.CONSUME(CommodityDirective);
    this.OR([
      {
        ALT: () => {
          this.SUBRULE(this.commodityAmount);
          this.OPTION({
            GATE: () => this.LA(0).tokenType === AMOUNT_WS,
            DEF: () => this.SUBRULE1(this.inlineComment)
          });
        }
      },
      {
        ALT: () => {
          this.CONSUME(CommodityText);
          this.OPTION1(() => {
            this.CONSUME(AMOUNT_WS);
            this.SUBRULE2(this.inlineComment);
          });
        }
      }
    ]);
    this.CONSUME(NEWLINE);
    this.MANY(() => {
      this.SUBRULE3(this.commodityDirectiveContentLine);
    });
  });

  public commodityAmount = this.RULE('commodityAmount', () => {
    this.parseAmount(true);
  });

  public commodityDirectiveContentLine = this.RULE(
    'commodityDirectiveContentLine',
    () => {
      this.CONSUME(INDENT);
      this.OR([
        {
          ALT: () => {
            this.SUBRULE(this.inlineComment);
            this.CONSUME(NEWLINE);
          }
        },
        {
          ALT: () => {
            this.SUBRULE1(this.formatSubdirective);
            this.OPTION({
              GATE: () => this.LA(0).tokenType === AMOUNT_WS,
              DEF: () => this.SUBRULE1(this.inlineComment)
            });
            this.CONSUME1(NEWLINE);
          }
        }
      ]);
    }
  );

  public formatSubdirective = this.RULE('formatSubdirective', () => {
    this.CONSUME(FormatSubdirective);
    this.SUBRULE(this.commodityAmount);
  });

  public defaultCommodityDirective = this.RULE(
    'defaultCommodityDirective',
    () => {
      this.CONSUME(DefaultCommodityDirective);
      this.SUBRULE(this.commodityAmount);
      this.OPTION1({
        GATE: () => this.LA(0).tokenType === AMOUNT_WS,
        DEF: () => this.SUBRULE2(this.inlineComment)
      });
      this.CONSUME(NEWLINE);
      this.MANY(() => {
        this.SUBRULE1(this.defaultCommodityDirectiveContentLine);
      });
    }
  );

  public defaultCommodityDirectiveContentLine = this.RULE(
    'defaultCommodityDirectiveContentLine',
    () => {
      this.CONSUME(INDENT);
      this.SUBRULE(this.inlineComment);
      this.CONSUME(NEWLINE);
    }
  );

  public multilineComment = this.RULE('multilineComment', () => {
    this.CONSUME(MultilineComment);
    this.CONSUME(MC_NEWLINE);
    this.MANY(() => this.SUBRULE(this.multilineCommentItem));
    this.OPTION({
      GATE: () => this.LA(1).tokenType !== EOF,
      DEF: () => {
        this.CONSUME(MultilineCommentEnd);
        this.CONSUME(NEWLINE);
      }
    });
  });

  public multilineCommentItem = this.RULE('multilineCommentItem', () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(MultilineCommentText);
          this.OR1([
            {
              ALT: () => this.CONSUME(MC_NEWLINE)
            },
            {
              ALT: () => this.CONSUME(EOF)
            }
          ]);
        }
      },
      {
        ALT: () => {
          this.CONSUME1(MC_NEWLINE);
          this.OPTION(() => this.CONSUME1(EOF));
        }
      }
    ]);
  });

  public yearDirective = this.RULE('yearDirective', () => {
    this.CONSUME(YearDirective);
    this.CONSUME(YearDirectiveValue);
    this.OPTION(() => this.SUBRULE(this.inlineComment));
    this.CONSUME(NEWLINE);
    this.MANY(() => {
      this.SUBRULE1(this.yearDirectiveContentLine);
    });
  });

  public yearDirectiveContentLine = this.RULE(
    'yearDirectiveContentLine',
    () => {
      this.CONSUME(INDENT);
      this.SUBRULE(this.inlineComment);
      this.CONSUME(NEWLINE);
    }
  );
}

const ParserInstance = new HLedgerParser();

// TODO: Make this in dev mode only
export const productions = ParserInstance.getGAstProductions();
export const serializedProductions =
  ParserInstance.getSerializedGastProductions();

export default ParserInstance;
