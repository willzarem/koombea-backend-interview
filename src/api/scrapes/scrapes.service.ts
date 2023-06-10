import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/auth/user.entity';
import { Scrape } from './scrape.entity';
import { GetScrapesFilterDto } from '../dto/get-scrapes-filter.dto';
import { CreateScrapeDto } from '../dto/create-scrape.dto';
import { ScrapeStatus } from './scrape-status.enum';
import { CreateScrapeContentDto } from '../dto/create-scrape-content.dto';
import { ScrapeContent } from './scrape-content.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class ScrapesService {
  private readonly logger = new Logger('ScrapesService');

  constructor(
    @InjectRepository(Scrape) private scrapeRepository: Repository<Scrape>,
    @InjectRepository(ScrapeContent)
    private scrapeContentRepository: Repository<ScrapeContent>,
    @InjectQueue('scraping') private readonly scrapingQueue: Queue,
  ) {}

  async getScrapes(
    filterDto: GetScrapesFilterDto,
    user: User,
  ): Promise<Scrape[]> {
    const { page } = filterDto;

    const query = this.scrapeRepository.createQueryBuilder();

    query.where({ user });
    query.take(10);

    if (page) {
      query.skip(10 * page);
    }

    try {
      const scrapes = await query.getMany();
      return scrapes;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getScrapeById(id: string, user: User): Promise<Scrape> {
    const found = await this.scrapeRepository.findOne({ where: { id, user } });

    if (!found) {
      throw new NotFoundException(`Scrape with ID "${id}" not found`);
    }

    return found;
  }

  async getScrapeContent(
    scrapeId: string,
    user: User,
  ): Promise<ScrapeContent[]> {
    const scrape = await this.getScrapeById(scrapeId, user);
    return this.scrapeContentRepository.findBy({ scrape });
  }

  async createScrape(createScrapeDto: CreateScrapeDto, user: User) {
    const { title, url } = createScrapeDto;

    const scrape = this.scrapeRepository.create({
      title,
      url,
      linksFound: 0,
      status: ScrapeStatus.PROCESSING,
      user,
    });

    await this.scrapeRepository.save(scrape);

    await this.scrapingQueue.add('scrape_url', scrape);
    this.logger.log(`started queue for ${scrape.id} | ${scrape.url}`);

    return scrape;
  }
  async createScrapeContent(
    createScrapeContentDto: CreateScrapeContentDto,
    scrapeId: string,
    user: User,
  ) {
    const { name, url } = createScrapeContentDto;

    const scrape = await this.getScrapeById(scrapeId, user);

    const scrapeContent = this.scrapeContentRepository.create({
      name,
      url,
      scrape,
    });

    await this.scrapeContentRepository.save(scrapeContent);

    return scrapeContent;
  }
  async updateScrapeStatus(
    id: string,
    status: ScrapeStatus,
    linksFound: number,
    user: User,
  ): Promise<Scrape> {
    const scrape = await this.getScrapeById(id, user);

    scrape.status = status;
    scrape.linksFound = linksFound;

    await this.scrapeRepository.save(scrape);

    return scrape;
  }
}
