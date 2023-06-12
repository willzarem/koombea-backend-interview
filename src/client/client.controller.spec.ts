import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ClientController } from './client.controller';

describe('ClientController', () => {
  let app: INestApplication;
  let controller;
  const baseUrl = 'http://127.0.0.1:3000';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientController],
    }).compile();

    app = module.createNestApplication();
    controller = module.get(ClientController);
    await app.init();
  });

  it('Should return void when calling renderIndex', () => {
    expect(controller.renderIndex()).toEqual(undefined);
  });
  it('/ (GET)', () => {
    return request
      .agent(baseUrl)
      .get('/client/')
      .expect(200)
      .expect(new RegExp(`<title>Login Page<\\/title>`, 'gi'));
  });

  it('Should return void when calling renderSignUp', () => {
    expect(controller.renderSignUp()).toEqual(undefined);
  });
  it('/signup (GET)', () => {
    return request
      .agent(baseUrl)
      .get('/client/signup')
      .expect(200)
      .expect(new RegExp(`<title>SignUp Page<\\/title>`, 'gi'));
  });

  it('Should return void when calling renderScrapes', () => {
    expect(controller.renderScrapes()).toEqual(undefined);
  });
  it('/scrapes (GET)', () => {
    return request
      .agent(baseUrl)
      .get('/client/scrapes')
      .expect(200)
      .expect(new RegExp(`<title>Scraper Page<\\/title>`, 'gi'));
  });

  it('Should return void when calling renderScrapeDetail', () => {
    const id = '';
    expect(controller.renderScrapeDetail(id)).toEqual({ id });
  });
  it('/scrapes/:id (GET)', () => {
    const id = 'testId';
    return request
      .agent(baseUrl)
      .get(`/client/scrapes/${id}`)
      .expect(200)
      .expect(new RegExp(`<title>Scraper Detail Page | ${id}<\\/title>`, 'gi'));
  });

  afterEach(async () => {
    await app.close();
  });
});
