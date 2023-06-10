import { IsNotEmpty, IsUrl } from 'class-validator';

export class CreateScrapeContentDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsUrl()
  url: string;
}
