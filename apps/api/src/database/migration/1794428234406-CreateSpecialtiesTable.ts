import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSpecialtiesTable1794428234406 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE TABLE specialties (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(150) NOT NULL,
          slug VARCHAR(150) NOT NULL,
          description TEXT,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
         created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
         updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT uq_specialties_slug UNIQUE (slug),
        CONSTRAINT ck_specialties_slug_format
        CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
          )      
            `);

    await queryRunner.query(`
  CREATE UNIQUE INDEX uq_specialties_name_lower
  ON specialties (LOWER(name));
`);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION set_specialties_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_specialties_updated_at
      BEFORE UPDATE ON specialties
      FOR EACH ROW
      EXECUTE FUNCTION set_specialties_updated_at();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_specialties_updated_at ON specialties;
    `);

    await queryRunner.query(`
      DROP FUNCTION IF EXISTS set_specialties_updated_at();
    `);

    await queryRunner.query(`
      DROP TABLE specialties;
    `);
  }
}
