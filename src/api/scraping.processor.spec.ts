import { Test, TestingModule } from '@nestjs/testing';
import { ScrapingProcessor } from './scraping.processor';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Scrape } from './scrapes/scrape.entity';
import { ScrapeContent } from './scrapes/scrape-content.entity';
import { ScrapeStatus } from './scrapes/scrape-status.enum';
import { of } from 'rxjs';
import Bull from 'bull';

const execute = jest.fn();

const createQueryBuilder = {
  insert: jest.fn(() => ({
    values: jest.fn(() => ({
      execute,
    })),
  })),
  values: jest.fn().mockReturnThis(),
  execute: jest.fn(),
};
const scrapeContentRepositoryMock = {
  createQueryBuilder: jest.fn(() => createQueryBuilder),
  create: jest.fn(),
};

const scrapeRepositoryMock = {
  update: jest.fn(),
};

const httpServiceMock = {
  get: jest.fn(),
};

describe('ScrapingProcessor', () => {
  let scrapingProcessor: ScrapingProcessor;
  let scrapeContentRepository;
  let scrapeRepository;
  let httpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScrapingProcessor,
        {
          provide: getRepositoryToken(ScrapeContent),
          useValue: scrapeContentRepositoryMock,
        },
        {
          provide: getRepositoryToken(Scrape),
          useValue: scrapeRepositoryMock,
        },
        { provide: HttpService, useValue: httpServiceMock },
      ],
    }).compile();

    scrapingProcessor = module.get<ScrapingProcessor>(ScrapingProcessor);
    scrapeContentRepository = module.get(getRepositoryToken(ScrapeContent));
    scrapeRepository = module.get(getRepositoryToken(Scrape));
    httpService = module.get(HttpService);
  });

  it('should be defined', () => {
    expect(scrapingProcessor).toBeDefined();
  });

  it('should scrape url and update repository', async () => {
    const scrape = new Scrape();
    scrape.id = '1';
    scrape.url = 'https://example.com';
    scrape.title = '';
    scrape.status = ScrapeStatus.PROCESSING;
    const job = {
      data: scrape,
    } as Bull.Job<Scrape>;

    httpService.get.mockReturnValue(
      of({
        data: '<html><head><title>Example</title></head><body><a href="http://test.com">Test</a></body></html>',
      }),
    );

    execute.mockImplementation(() => ({
      identifiers: ['http://test.com'],
    }));

    await scrapingProcessor.handleScrapeUrl(job);

    expect(scrapeContentRepository.create).toHaveBeenCalled();

    expect(scrapeRepository.update).toHaveBeenCalledWith(
      { id: job.data.id },
      {
        linksFound: 1,
        status: ScrapeStatus.DONE,
        title: 'Example',
      },
    );
  });

  it('should handle error and update repository', async () => {
    const scrape = new Scrape();
    scrape.id = '1';
    scrape.url = 'https://example.com';
    scrape.title = '';
    scrape.status = ScrapeStatus.PROCESSING;
    const job = {
      data: scrape,
    } as Bull.Job<Scrape>;

    httpService.get.mockImplementation(() => {
      throw new Error('Request error');
    });

    await scrapingProcessor.handleScrapeUrl(job);

    expect(scrapeRepository.update).toHaveBeenCalledWith(
      { id: job.data.id },
      {
        linksFound: 0,
        status: ScrapeStatus.ERROR,
        title: '',
      },
    );
  });
});
