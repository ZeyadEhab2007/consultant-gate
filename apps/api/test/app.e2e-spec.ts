import 'reflect-metadata';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { buildDataSourceOptions } from '../src/database/data-source-options';

describe('API (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeAll(async () => {
    if (
      process.env.NODE_ENV !== 'test' ||
      process.env.DB_NAME !== 'consultant_gate_test'
    ) {
      throw new Error('E2E tests must use consultant_gate_test');
    }

    dataSource = new DataSource({
      ...buildDataSourceOptions({
        host: process.env.DB_HOST!,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME!,
        password: process.env.DB_PASSWORD!,
        database: process.env.DB_NAME!,
        nodeEnv: process.env.NODE_ENV,
      }),
      logging: false,
    });

    await dataSource.initialize();
    await dataSource.runMigrations();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await dataSource.query('TRUNCATE TABLE specialties');
  });

  it('/api/health (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);

    expect(response.body).toEqual({
      status: 'ok',
      service: 'consultant-gate-api',
      timestamp: expect.any(String),
    });
  });

  it('/api/specialties (GET)', async () => {
    await dataSource.query(
      `
        INSERT INTO specialties (name, slug, description, is_active)
        VALUES ($1, $2, $3, $4);
      `,
      ['Cardiology', 'cardiology', 'Heart care', true],
    );

    const response = await request(app.getHttpServer())
      .get('/api/specialties')
      .expect(200);

    expect(response.body.status).toBe('ok');
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toEqual({
      id: expect.any(String),
      name: 'Cardiology',
      slug: 'cardiology',
      description: 'Heart care',
    });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }

    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });
});
