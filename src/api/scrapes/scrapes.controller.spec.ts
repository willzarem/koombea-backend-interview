import { Test, TestingModule } from '@nestjs/testing';
import { ScrapesController } from './scrapes.controller';
import { ScrapesService } from './scrapes.service';
import { GetScrapesFilterDto } from '../dto/get-scrapes-filter.dto';
import { User } from '../../auth/user.entity';
import { Scrape } from './scrape.entity';
import { AuthGuard } from '@nestjs/passport';
import { CreateScrapeDto } from '../dto/create-scrape.dto';
import { CompleteScrapeDto } from '../dto/complete-scrape.dto';
import { CreateScrapeContentDto } from '../dto/create-scrape-content.dto';
import { ScrapeContent } from './scrape-content.entity';
import { ScrapeStatus } from './scrape-status.enum';

describe('ScrapesController', () => {
  let scrapesController: ScrapesController;
  let scrapesServiceMock: any;

  beforeEach(async () => {
    scrapesServiceMock = {
      getScrapes: jest.fn(),
      getScrapeById: jest.fn(),
      getScrapeContent: jest.fn(),
      createScrape: jest.fn(),
      createScrapeContent: jest.fn(),
      updateScrapeStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScrapesController],
      providers: [
        {
          provide: ScrapesService,
          useValue: scrapesServiceMock,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(jest.fn())
      .compile();

    scrapesController = module.get<ScrapesController>(ScrapesController);
  });

  it('should be defined', () => {
    expect(scrapesController).toBeDefined();
  });

  it('should get scrapes', async () => {
    const filterDto: GetScrapesFilterDto = { page: 0 };
    const user = new User();
    const result: Scrape[] = [];

    scrapesServiceMock.getScrapes.mockResolvedValue(result);

    expect(await scrapesController.getScrapes(filterDto, user)).toEqual(result);
    expect(scrapesServiceMock.getScrapes).toHaveBeenCalledWith(filterDto, user);
  });

  it('should get scrape by id', async () => {
    const id = 'testId';
    const user = new User();
    const result: Scrape = new Scrape();

    scrapesServiceMock.getScrapeById.mockResolvedValue(result);

    expect(await scrapesController.getScrape(id, user)).toEqual(result);
    expect(scrapesServiceMock.getScrapeById).toHaveBeenCalledWith(id, user);
  });

  it('should get scrape content', async () => {
    const scrapeId = 'testScrapeId';
    const user = new User();
    const result: ScrapeContent[] = [];

    scrapesServiceMock.getScrapeContent.mockResolvedValue(result);

    expect(await scrapesController.getScrapesContent(scrapeId, user)).toEqual(
      result,
    );
    expect(scrapesServiceMock.getScrapeContent).toHaveBeenCalledWith(
      scrapeId,
      user,
    );
  });

  it('should create a scrape', async () => {
    const createScrapeDto: CreateScrapeDto = {
      url: 'https://test.com',
      title: 'title',
    };
    const user = new User();
    const result: Scrape = new Scrape();

    scrapesServiceMock.createScrape.mockResolvedValue(result);

    expect(await scrapesController.createScrape(createScrapeDto, user)).toEqual(
      result,
    );
    expect(scrapesServiceMock.createScrape).toHaveBeenCalledWith(
      createScrapeDto,
      user,
    );
  });

  describe('createScrapeContent', () => {
    it('should call scrapesService.createScrapeContent() and return the result', async () => {
      const mockScrapeContent = new ScrapeContent();
      const createScrapeContentDto = new CreateScrapeContentDto();
      const user = new User();
      const scrapeId = '1';

      scrapesServiceMock.createScrapeContent.mockResolvedValue(
        mockScrapeContent,
      );
      const result = await scrapesController.createScrapeContent(
        scrapeId,
        createScrapeContentDto,
        user,
      );

      expect(scrapesServiceMock.createScrapeContent).toHaveBeenCalledWith(
        createScrapeContentDto,
        scrapeId,
        user,
      );
      expect(result).toEqual(mockScrapeContent);
    });
  });

  describe('completeScrapeProcessing', () => {
    it('should call scrapesService.updateScrapeStatus() with proper arguments', async () => {
      const id = '1';
      const completeScrapeDto = new CompleteScrapeDto();
      const user = new User();

      completeScrapeDto.status = ScrapeStatus.DONE;
      completeScrapeDto.linksFound = 5;

      await scrapesController.completeScrapeProcessing(
        id,
        completeScrapeDto,
        user,
      );

      expect(scrapesServiceMock.updateScrapeStatus).toHaveBeenCalledWith(
        id,
        completeScrapeDto.status,
        completeScrapeDto.linksFound,
        user,
      );
    });
  });
});
