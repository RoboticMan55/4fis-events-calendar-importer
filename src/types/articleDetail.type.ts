export type RawArticleDetail = {
  readonly rawContent: string;
  readonly detailLink: string | null;
}

export type ArticleDetail = {
  readonly name: string,
  readonly startDateTime: string | null
  readonly registerFrom: string | null
  readonly place: string | null
  readonly description: string | null
};

export type ArticleExtractors = {
  readonly extractName: (html: string) => string | null,
  readonly extractStartDateTime: (html: string) => string | null,
  readonly extractRegisterFrom: (html: string) => string | null,
  readonly extractPlace: (html: string) => string | null,
  readonly extractDescription: (html: string) => string | null
};

export const asArticleDetail = 
  (extr: ArticleExtractors) => 
  (rawContent: RawArticleDetail): ArticleDetail => ({
    name: extr.extractName(rawContent.rawContent) ?? "No name",
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