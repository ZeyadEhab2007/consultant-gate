
import 'reflect-metadata';

import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'node:path';

import { buildDataSourceOptions } from '../../../src/database/data-source-options';

dotenv.config({
  path: path.resolve(__dirname, '../../../../api/.env.test'),
  override: true,
});


const allowedHosts = ['localhost', '127.0.0.1', '::1'];

if (process.env.NODE_ENV !== 'test') {
  throw new Error('Integration tests can only run with NODE_ENV=test');
}

if (process.env.DB_NAME !== 'consultant_gate_test') {
  throw new Error('Tests can only run against consultant_gate_test');
}

if (!allowedHosts.includes(process.env.DB_HOST ?? '')) {
  throw new Error('Integration tests can only run against a local database');
}

export function createTestDataSource() {
  return new DataSource({
    ...buildDataSourceOptions({
      host: process.env.DB_HOST!,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_NAME!,
      nodeEnv: process.env.NODE_ENV,
    }),

    dropSchema: true,
    logging: false,
  });
}
