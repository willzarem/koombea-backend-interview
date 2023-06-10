import { Test, TestingModule } from '@nestjs/testing';
import { ScrapesService } from './scrapes.service';

describe('ScrapesService', () => {
  let service: ScrapesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScrapesService],
    }).compile();

    service = module.get<ScrapesService>(ScrapesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
