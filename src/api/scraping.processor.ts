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
import { ScrapeStatus } from './scrapes/scrape-status.enum';

@Processor('scraping')
export class ScrapingProcessor {
  private readonly logger = new Logger(ScrapingProcessor.name);
  private parser = new DomParser();

  constructor(
    @InjectRepository(ScrapeContent)
    private scrapeContentRepository: Repository<ScrapeContent>,
    @InjectRepository(Scrape)
    private scrapeRepository: Repository<Scrape>,
    private httpService: HttpService,
  ) {}

  @Process('scrape_url')
  async handleScrapeUrl(job: Job<Scrape>) {
    const scrape = job.data;
    let title = scrape.title;
    try {
      this.logger.log(`Starting processing of ${scrape.url}`);
      const response = await firstValueFrom(
        this.httpService.get(scrape.url, {}),
      );

      const content = response.data;

      const dom = this.parser.parseFromString(content);

      if (!scrape.title) {
        title = dom.getElementsByTagName('title').shift().textContent;
      }

      const links = dom.getElementsByTagName('a');

      const query = this.scrapeContentRepository.createQueryBuilder().insert();

      const rows = [];

      for (const link of links) {
        const href = link.getAttribute('href');
        if (href) {
          const linkContent = link.innerHTML.substring(0, 25);
          this.logger.debug(`${href} - ${linkContent}`);
          const content = this.scrapeContentRepository.create({
            url: href,
            name: linkContent,
            scrape,
          });
          rows.push(content);
        }
      }

      const result = await query.values(rows).execute();

      await this.scrapeRepository.update(
        { id: scrape.id },
        {
          linksFound: result.identifiers.length,
          status: ScrapeStatus.DONE,
          title,
        },
      );
      this.logger.log(
        `Processing completed | ${links.length / result.identifiers.length}`,
      );
    } catch (e) {
      this.logger.error(e);
      this.logger.error(job.data.url);
      await this.scrapeRepository.update(
        { id: scrape.id },
        { linksFound: 0, status: ScrapeStatus.ERROR, title },
      );
    }
  }
}
