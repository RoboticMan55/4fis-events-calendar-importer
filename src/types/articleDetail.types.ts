import { endOfDay, parseDate } from '../utils/index.utils.js';
import { none, Option, some, unwrapOr } from './index.types.js'

export type RawArticleDetail = {
  readonly rawContent: string;
  readonly detailLink: Option<string>;
}

export type ArticleDetail = {
  readonly name: string,
  readonly startDateTime: Option<Date>
  readonly endDateTime: Option<Date>
  readonly registerFrom: Option<Date>
  readonly place: Option<string>
  readonly description: Option<string>
  readonly detailLink: string
};

export type ArticleExtractors = {
  readonly extractName: (html: string) => Option<string>,
  readonly extractStartDateTime: (html: string) => Option<string>,
  readonly extractRegisterFrom: (html: string) => Option<string>,
  readonly extractPlace: (html: string) => Option<string>,
  readonly extractDescription: (html: string) => Option<string>
};

export const asArticleDetail = 
  (extr: ArticleExtractors) => 
  (rawContent: RawArticleDetail): ArticleDetail => {
    const html = rawContent.rawContent;
    const startDateTimeOpt = parseDate(extr.extractStartDateTime(html));
    
    return {
      name: unwrapOr(extr.extractName(html), "No name"),
      startDateTime: startDateTimeOpt,
      
      endDateTime: startDateTimeOpt.some 
        ? some(endOfDay(startDateTimeOpt.value)) 
        : none(),

      registerFrom: parseDate(extr.extractRegisterFrom(html)),
      place: extr.extractPlace(html),
      description: extr.extractDescription(html),
      detailLink: unwrapOr(rawContent.detailLink, "No link"),
    };
  }

export type StoredArticle = ArticleDetail & {
  /**
  * SHA256 hash of the event's content. Used to ensure idempotency of the script.
  */
  hash: string | null
};