import { Test, TestingModule } from '@nestjs/testing';
import { ScrapesService } from './scrapes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Scrape } from './scrape.entity';
import { ScrapeContent } from './scrape-content.entity';
import { User } from '../../auth/user.entity';
import { GetScrapesFilterDto } from '../dto/get-scrapes-filter.dto';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { getQueueToken } from '@nestjs/bull';
import { CreateScrapeContentDto } from '../dto/create-scrape-content.dto';
import { ScrapeStatus } from './scrape-status.enum';
import { CreateScrapeDto } from '../dto/create-scrape.dto';

const getMany = jest.fn();
const save = jest.fn();
const mockRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save,
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn(),
    take: jest.fn(),
    skip: jest.fn(),
    getMany,
  })),
  findBy: jest.fn(),
});

const add = jest.fn();
const mockQueue = { add };

const QUEUE_NAME = 'scraping';

const mockUser = new User();

describe('ScrapesService', () => {
  let service: ScrapesService;
  let scrapeRepository;
  let scrapeContentRepository;
  let scrapingQueue;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScrapesService,
        { provide: getRepositoryToken(Scrape), useFactory: mockRepository },
        {
          provide: getRepositoryToken(ScrapeContent),
          useFactory: mockRepository,
        },
        {
          provide: getQueueToken(QUEUE_NAME),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<ScrapesService>(ScrapesService);
    scrapeRepository = module.get(getRepositoryToken(Scrape));
    scrapeContentRepository = module.get(getRepositoryToken(ScrapeContent));
    scrapingQueue = module.get(getQueueToken(QUEUE_NAME));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getScrapes', () => {
    it('should get all scrapes', async () => {
      const mockScrapes = [];
      scrapeRepository
        .createQueryBuilder()
        .getMany.mockReturnValue(mockScrapes);

      const filterDto = new GetScrapesFilterDto();
      const result = await service.getScrapes(filterDto, mockUser);

      expect(result).toEqual(mockScrapes);
    });

    it('should throw an InternalServerErrorException', async () => {
      scrapeRepository
        .createQueryBuilder()
        .getMany.mockRejectedValue(new Error());

      const filterDto = new GetScrapesFilterDto();
      await expect(service.getScrapes(filterDto, mockUser)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getScrapeContent', () => {
    it('should get the content of a scrape', async () => {
      const mockContent = [new ScrapeContent()];
      const mockScrape = new Scrape();
      scrapeRepository.findOne.mockResolvedValue(mockScrape);
      scrapeContentRepository.findBy.mockResolvedValue(mockContent);

      const result = await service.getScrapeContent('someId', mockUser);

      expect(result).toEqual(mockContent);
    });

    it('should throw an NotFoundException', async () => {
      scrapeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getScrapeContent('non-existing_id', mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createScrape', () => {
    it('should create a new scrape', async () => {
      const dto = { title: 'someTitle' } as CreateScrapeDto;
      const mockScrape = new Scrape();
      mockScrape.title = dto.title;

      scrapeRepository.create.mockReturnValue(mockScrape);
      jest.spyOn(scrapeRepository, 'create');
      jest.spyOn(scrapeRepository, 'save');
      jest.spyOn(scrapingQueue, 'add');

      const result = await service.createScrape(dto, mockUser);

      expect(scrapeRepository.create).toHaveBeenCalled();
      expect(scrapeRepository.save).toHaveBeenCalled();
      expect(result.title).toEqual(dto.title);
      expect(scrapingQueue.add).toHaveBeenCalledTimes(1);
    });

    it('should throw an NotFoundException', async () => {
      scrapeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getScrapeContent('non-existing_id', mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createScrapeContent', () => {
    it('should create a new scrape content', async () => {
      const dto = new CreateScrapeContentDto();
      const mockContent = new ScrapeContent();
      const mockScrape = new Scrape();
      scrapeRepository.findOne.mockResolvedValue(mockScrape);
      scrapeContentRepository.create.mockResolvedValue(mockContent);

      const result = await service.createScrapeContent(dto, 'someId', mockUser);

      expect(result).toEqual(mockContent);
    });

    it('should throw an NotFoundException', async () => {
      const dto = new CreateScrapeContentDto();
      scrapeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createScrapeContent(dto, 'non-existing_id', mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateScrapeStatus', () => {
    it('should update the status of a scrape', async () => {
      const mockScrape = new Scrape();
      scrapeRepository.findOne.mockResolvedValue(mockScrape);

      jest.spyOn(scrapeContentRepository, 'save');

      await service.updateScrapeStatus(
        'someId',
        ScrapeStatus.DONE,
        1,
        mockUser,
      );

      mockScrape.status = ScrapeStatus.DONE;
      mockScrape.linksFound = 1;

      expect(scrapeContentRepository.save).toHaveBeenCalledWith(mockScrape);
    });

    it('should throw an NotFoundException', async () => {
      const dto = new CreateScrapeContentDto();
      scrapeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createScrapeContent(dto, 'non-existing_id', mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
