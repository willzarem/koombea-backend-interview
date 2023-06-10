import { IsNumberString, IsOptional } from 'class-validator';

export class GetScrapesFilterDto {
  @IsOptional()
  @IsNumberString()
  page: number;
}
