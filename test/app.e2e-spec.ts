import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET) should return Hello World!', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/flights (GET) should return flights', async () => {
    const result = await request(app.getHttpServer())
      .get('/flights')
      .expect(200);

    expect(result.body.length).toBeGreaterThanOrEqual(1);
    expect(typeof result.body[0].price).toBe('number');
    expect(typeof result.body[0].id).toBe('string');
    expect(result.body[0].slices.length).toEqual(2);
  });
});
