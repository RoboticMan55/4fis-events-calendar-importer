export type RawArticleWithLink = {
  readonly rawContent: string;
  readonly detailLink: string | null;
};

export const asRawArticleWithLink = (
  rawContent: string,
  extractLink: (html: string) => string | null
): RawArticleWithLink => ({
  rawContent,
  detailLink: extractLink(rawContent)
});

export type Article = {
  readonly name: string,
  readonly startDateTime: string | null
  readonly registerFrom: string | null
  readonly place: string | null
};

export type ArticleExtractors = {
  readonly extractName: (html: string) => string,
  readonly extractStartDateTime: (html: string) => string | null,
  readonly extractRegisterFrom: (html: string) => string | null,
  readonly extractPlace: (html: string) => string | null
};

export const asArticle = 
  (extr: ArticleExtractors) => 
  (rawContent: string): Article => ({
    name: extr.extractName(rawContent) ?? "No name",
    startDateTime: extr.extractStartDateTime(rawContent),
    registerFrom: extr.extractRegisterFrom(rawContent),
    place: extr.extractPlace(rawContent)
  });

export type StoredArticle = Article & {
  /**
  * SHA256 hash of the event's content. Used to ensure idempotency of the script.
  */
  hash: string | null
};
