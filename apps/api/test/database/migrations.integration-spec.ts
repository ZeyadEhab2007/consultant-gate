import { DataSource } from 'typeorm';

import { createTestDataSource } from '../database/helpers/test-data-source';

describe('Specialties Migration Integration Tests', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = createTestDataSource();

    await dataSource.initialize();
    await dataSource.runMigrations();
  });

  afterAll(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('should create specialties table', async () => {
    const result = await dataSource.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'specialties';
    `);

    expect(result).toHaveLength(1);
  });

  it('should create all expected columns', async () => {
    const columns = await dataSource.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'specialties';
    `);

    const columnNames = columns.map(
      (column: { column_name: string }) => column.column_name,
    );

    expect(columnNames).toEqual(
      expect.arrayContaining([
        'id',
        'name',
        'slug',
        'description',
        'is_active',
        'created_at',
        'updated_at',
      ]),
    );
  });

  it('should use UUID as the id type', async () => {
    const result = await dataSource.query(`
      SELECT data_type
      FROM information_schema.columns
      WHERE table_name = 'specialties'
      AND column_name = 'id';
    `);

    expect(result[0].data_type).toBe('uuid');
  });

  it('should make description nullable', async () => {
    const result = await dataSource.query(`
      SELECT is_nullable
      FROM information_schema.columns
      WHERE table_name = 'specialties'
      AND column_name = 'description';
    `);

    expect(result[0].is_nullable).toBe('YES');
  });

  it('should make name and slug required', async () => {
    const result = await dataSource.query(`
      SELECT column_name, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'specialties'
      AND column_name IN ('name', 'slug');
    `);

    for (const column of result) {
      expect(column.is_nullable).toBe('NO');
    }
  });
  it('should automatically update updated_at when a specialty is updated', async () => {
    const [specialty] = await dataSource.query(`
    INSERT INTO specialties (name, slug)
    VALUES ('Test Specialty', 'test-specialty')
    RETURNING created_at, updated_at;
  `);

    await dataSource.query('SELECT pg_sleep(0.01);');

    const [updatedRows] = await dataSource.query(`
  UPDATE specialties
  SET name = 'Updated Test Specialty'
  WHERE slug = 'test-specialty'
  RETURNING created_at, updated_at;
`);

    const [updatedSpecialty] = updatedRows;

    console.log('specialty:', specialty);
    console.log('updatedSpecialty:', updatedSpecialty);
    console.log('updatedSpecialty keys:', Object.keys(updatedSpecialty ?? {}));
    expect(updatedSpecialty.updated_at.getTime()).toBeGreaterThan(
      specialty.updated_at.getTime(),
    );

    expect(updatedSpecialty.created_at.getTime()).toBe(
      specialty.created_at.getTime(),
    );
  });
});
