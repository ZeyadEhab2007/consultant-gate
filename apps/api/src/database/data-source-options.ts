
import path from 'node:path';
import type { DataSourceOptions } from 'typeorm';

interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  nodeEnv?: string;
}

export function buildDataSourceOptions(
  config: DatabaseConfig,
): DataSourceOptions {
  return {
    type: 'postgres',

    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: config.database,

    entities: [
      path.join(__dirname, '..', '**', '*.entity{.ts,.js}'),
    ],

    migrations: [
      path.join(__dirname, 'migration', '*{.ts,.js}'),
    ],

    synchronize: false,
    migrationsRun: false,

    logging:
      config.nodeEnv === 'development'
        ? ['query', 'error']
        : ['error'],
  };
}
