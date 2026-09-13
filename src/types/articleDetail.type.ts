import { Option, some, unwrapOr } from './option.type.js'

export type RawArticleDetail = {
  readonly rawContent: string;
  readonly detailLink: Option<string>;
}

export type ArticleDetail = {
  readonly name: string,
  readonly startDateTime: Option<string>
  readonly registerFrom: Option<string>
  readonly place: Option<string>
  readonly description: Option<string>
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
  (rawContent: RawArticleDetail): ArticleDetail => ({
    name: unwrapOr(extr.extractName(rawContent.rawContent), "No name"),
    startDateTime: extr.extractStartDateTime(rawContent.rawContent),
    registerFrom: extr.extractRegisterFrom(rawContent.rawContent),
    place: extr.extractPlace(rawContent.rawContent),
    description: extr.extractDescription(rawContent.rawContent)
  });

export type StoredArticle = ArticleDetail & {
  /**
  * SHA256 hash of the event's content. Used to ensure idempotency of the script.
  */
  hash: string | null
};