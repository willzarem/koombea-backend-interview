import { IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateScrapeDto {
  @IsNotEmpty()
  @IsOptional()
  title: string;

  @IsNotEmpty()
  @IsUrl()
  url: string;
}
