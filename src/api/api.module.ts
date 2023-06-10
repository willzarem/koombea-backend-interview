import { Module } from '@nestjs/common';
import { ScrapesController } from './scrapes/scrapes.controller';
import { ScrapesService } from './scrapes/scrapes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Scrape } from './scrapes/scrape.entity';
import { ScrapeContent } from './scrapes/scrape-content.entity';
import { BullModule } from '@nestjs/bull';
import { ScrapingProcessor } from './scraping.processor';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Scrape, ScrapeContent]),
    BullModule.registerQueue({
      name: 'scraping',
    }),
  ],
  controllers: [ScrapesController],
  providers: [ScrapesService, ScrapingProcessor],
})
export class ApiModule {}
