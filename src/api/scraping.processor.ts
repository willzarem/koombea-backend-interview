import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Scrape } from './scrapes/scrape.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScrapeContent } from './scrapes/scrape-content.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as DomParser from 'dom-parser';

@Processor('scraping')
export class ScrapingProcessor {
  private readonly logger = new Logger(ScrapingProcessor.name);
  private parser = new DomParser();

  constructor(
    @InjectRepository(ScrapeContent)
    private scrapeContentRepository: Repository<ScrapeContent>,
    private httpService: HttpService,
  ) {}

  @Process('scrape_url')
  async handleScrapeUrl(job: Job<Scrape>) {
    const scrape = job.data;
    try {
      const response = await firstValueFrom(
        this.httpService.get(scrape.url, {}),
      );

      const content = response.data;

      const dom = this.parser.parseFromString(content);

      const links = dom.getElementsByTagName('a');

      const rows: ScrapeContent[] = [];

      for (const link of links) {
        const href = link.getAttribute('href');
        if (href) {
          const linkContent = link.innerHTML.substring(0, 15);
          this.logger.debug(`${href} - ${linkContent}`);
          const content = this.scrapeContentRepository.create({
            url: href,
            name: linkContent,
          });
          rows.push(content);
        }
      }
      this.logger.debug(rows);
      //TODO
    } catch (e) {
      this.logger.error(e);
      this.logger.error(job.data.url);
    }
  }
}
