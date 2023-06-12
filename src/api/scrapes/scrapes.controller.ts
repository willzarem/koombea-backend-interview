import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../../auth/get-user.decorator';
import { User } from '../../auth/user.entity';
import { Scrape } from './scrape.entity';
import { ScrapesService } from './scrapes.service';
import { GetScrapesFilterDto } from '../dto/get-scrapes-filter.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateScrapeDto } from '../dto/create-scrape.dto';
import { CompleteScrapeDto } from '../dto/complete-scrape.dto';
import { CreateScrapeContentDto } from '../dto/create-scrape-content.dto';
import { ScrapeContent } from './scrape-content.entity';

@Controller('scrapes')
@UseGuards(AuthGuard('jwt'))
export class ScrapesController {
  constructor(private scrapesService: ScrapesService) {}

  @Get()
  getScrapes(
    @Query() filterDto: GetScrapesFilterDto,
    @GetUser() user: User,
  ): Promise<Scrape[]> {
    return this.scrapesService.getScrapes(filterDto, user);
  }

  @Get('/:id')
  getScrape(@Param('id') id: string, @GetUser() user: User): Promise<Scrape> {
    return this.scrapesService.getScrapeById(id, user);
  }

  @Get('/:scrapeId/content')
  getScrapesContent(
    @Param('scrapeId') scrapeId: string,
    @GetUser() user: User,
  ): Promise<ScrapeContent[]> {
    return this.scrapesService.getScrapeContent(scrapeId, user);
  }

  @Post()
  createScrape(
    @Body() createScrapeDto: CreateScrapeDto,
    @GetUser() user: User,
  ): Promise<Scrape> {
    return this.scrapesService.createScrape(createScrapeDto, user);
  }

  @Post('/:scrapeId/content')
  createScrapeContent(
    @Param('scrapeId') scrapeId: string,
    @Body() createScrapeContentDto: CreateScrapeContentDto,
    @GetUser() user: User,
  ): Promise<ScrapeContent> {
    return this.scrapesService.createScrapeContent(
      createScrapeContentDto,
      scrapeId,
      user,
    );
  }

  @Patch('/:id/status')
  completeScrapeProcessing(
    @Param('id') id: string,
    @Body() completeScrapeDto: CompleteScrapeDto,
    @GetUser() user: User,
  ) {
    const { status, linksFound } = completeScrapeDto;
    this.scrapesService.updateScrapeStatus(id, status, linksFound, user);
  }
}
