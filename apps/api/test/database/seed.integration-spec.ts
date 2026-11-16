import { DataSource } from 'typeorm';

import { createTestDataSource } from '../database/helpers/test-data-source';
import { cleanupSpecialties } from '../database/helpers/cleanup';

import { seedSpecialties } from '../../src/database/seeds/seed-specialties';

describe('Specialties Seed Integration Tests', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = createTestDataSource();

    await dataSource.initialize();
    await dataSource.runMigrations();
  });

  beforeEach(async () => {
    await cleanupSpecialties(dataSource);
  });

  afterAll(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('should insert all specialties', async () => {
    await seedSpecialties(dataSource);

    const result = await dataSource.query(`
      SELECT * FROM specialties
      ORDER BY name;
    `);

    expect(result).toHaveLength(5);
  });

 it('should insert specialties with required fields', async () => {
  await seedSpecialties(dataSource);

  const result = await dataSource.query(`
    SELECT name, slug
    FROM specialties;
  `);

  expect(result.length).toBeGreaterThan(0);

  for (const specialty of result) {
    expect(specialty.name).toBeTruthy();
    expect(specialty.slug).toBeTruthy();
  }
});

  it('should not duplicate records when seeded twice', async () => {
    await seedSpecialties(dataSource);
    await seedSpecialties(dataSource);

    const result = await dataSource.query(`
      SELECT COUNT(*)::int AS count
      FROM specialties;
    `);

    expect(result[0].count).toBe(5);
  });
});
