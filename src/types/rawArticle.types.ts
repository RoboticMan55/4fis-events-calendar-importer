import { Option } from './index.types.js'

export type RawArticle = {
  readonly rawContent: string;
  readonly detailLink: Option<string>;
};

export type RawArticleExtractors = {
  readonly extractDetailLink: (html: string) => Option<string>
};

export const asRawArticle = 
  (extr: RawArticleExtractors) =>
  (rawContent: string): RawArticle => ({
    rawContent,
    detailLink: extr.extractDetailLink(rawContent)
  });

