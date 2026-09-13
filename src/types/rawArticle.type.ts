export type RawArticle = {
  readonly rawContent: string;
  readonly detailLink: string | null;
};

export type RawArticleExtractors = {
  readonly extractDetailLink: (html: string) => string | null
};

export const asRawArticle = 
  (extr: RawArticleExtractors) =>
  (rawContent: string): RawArticle => ({
    rawContent,
    detailLink: extr.extractDetailLink(rawContent)
  });

