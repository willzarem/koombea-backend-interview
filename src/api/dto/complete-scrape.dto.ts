import { IsEnum, IsNumber } from 'class-validator';
import { ScrapeStatus } from '../scrapes/scrape-status.enum';

export class CompleteScrapeDto {
  @IsEnum(ScrapeStatus)
  status: ScrapeStatus;

  @IsNumber()
  linksFound: number;
}
