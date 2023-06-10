import { IsNotEmpty, IsUrl } from 'class-validator';

export class CreateScrapeDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsUrl()
  url: string;
}
