import { DataSource } from 'typeorm';

import { createTestDataSource } from '../database/helpers/test-data-source';
import { cleanupSpecialties } from '../database/helpers/cleanup';

import { SpecialtiesService } from '../../src/specialties/specialties.service';

describe('Specialties API Integration Tests', () => {
  let dataSource: DataSource;
  let service: SpecialtiesService;

  beforeAll(async () => {
    dataSource = createTestDataSource();

    await dataSource.initialize();
    await dataSource.runMigrations();

    service = new SpecialtiesService(dataSource);
  });

  beforeEach(async () => {
    await cleanupSpecialties(dataSource);
  });

  afterAll(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  async function insertSpecialty(
    name: string,
    slug: string,
    isActive: boolean,
  ) {
    await dataSource.query(
      `
        INSERT INTO specialties (name, slug, description, is_active)
        VALUES ($1, $2, $3, $4);
      `,
      [name, slug, `${name} description`, isActive],
    );
  }

  it('should return only active specialties', async () => {
    await insertSpecialty('Web Development', 'web-development', true);
    await insertSpecialty('Cybersecurity', 'cybersecurity', false);
    await insertSpecialty('Software Engineering', 'software-engineering', true);

    const result = await service.findAll();

    expect(result.status).toBe('ok');
    expect(result.data.map((specialty) => specialty.name)).toEqual([
      'Software Engineering',
      'Web Development',
    ]);
  });

  it('should return specialties with only public fields', async () => {
    await insertSpecialty('Web Development', 'web-development', true);

    const result = await service.findAll();

    expect(Object.keys(result.data[0]).sort()).toEqual([
      'description',
      'id',
      'name',
      'slug',
    ]);
  });

  it('should return an empty array when no active specialties exist', async () => {
    await insertSpecialty('Cybersecurity', 'cybersecurity', false);

    const result = await service.findAll();

    expect(result).toEqual({
      status: 'ok',
      data: [],
    });
  });

  it('should return active specialties in alphabetical order', async () => {
    await insertSpecialty('Web Development', 'web-development', true);
    await insertSpecialty('Cybersecurity', 'cybersecurity', true);
    await insertSpecialty('Software Engineering', 'software-engineering', true);

    const result = await service.findAll();

    expect(result.data.map((specialty) => specialty.name)).toEqual([
      'Cybersecurity',
      'Software Engineering',
      'Web Development',
    ]);
  });
});
