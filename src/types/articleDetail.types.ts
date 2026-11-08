import { endOfDay, parseDateDayEnd, parseDateDayStart } from '../utils/index.utils.js';
import { err, isNone, ok, Option, Result, some, unwrapOr } from './index.types.js'

export type RawArticleDetail = {
  readonly rawContent: string;
  readonly detailLink: string;
}

export type ArticleDetail = {
  readonly name: string
  readonly startDateTime: Date
  readonly endDateTime: Date
  readonly registerFrom: Option<Date>
  readonly place: Option<string>
  readonly description: Option<string>
  readonly detailLink: string
  readonly id: string
};

export type ArticleExtractors = {
  readonly extractName: (html: string) => Option<string>;
  readonly extractStartDateTime: (html: string) => Option<string>;
  readonly extractEndDateTime: (html: string) => Option<string>;
  readonly extractRegisterFrom: (html: string) => Option<string>;
  readonly extractPlace: (html: string) => Option<string>;
  readonly extractDescription: (html: string) => Option<string>;
};

export const asArticleDetail = 
  (extr: ArticleExtractors) => 
  (rawContent: RawArticleDetail): Result<ArticleDetail, string> => {
    const html = rawContent.rawContent;

    const nameOpt = extr.extractName(html);
    if (isNone(nameOpt))
      return err("Missing name");

    const startDateTimeOpt = parseDateDayStart(extr.extractStartDateTime(html));
    if (isNone(startDateTimeOpt))
      return err("Invalid start date");
    
    const endDateTime = unwrapOr(
      parseDateDayEnd(extr.extractEndDateTime(html)), 
      endOfDay(startDateTimeOpt.value)
    )

    const buildDescription = (descriptionOpt: Option<string>): string => {
      const link = "<a href=\"" + rawContent.detailLink + "\">" + rawContent.detailLink + "</a>";
      
      if (isNone(descriptionOpt))
        return link;

      return link + "<br><br>" + descriptionOpt.value;
    };

    return ok({
      name: nameOpt.value,
      startDateTime: startDateTimeOpt.value,
      endDateTime: endDateTime,
      registerFrom: parseDateDayStart(extr.extractRegisterFrom(html)),
      place: extr.extractPlace(html),
      description: some(buildDescription(extr.extractDescription(html))),
      detailLink: rawContent.detailLink,
      id: rawContent.detailLink
    });
  }
