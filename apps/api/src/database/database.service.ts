
import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';

import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly retryIntervalMs = 5000;

  private retryInterval: ReturnType<typeof setInterval> | undefined;
  private connectionPromise: Promise<void> | undefined;
  private isShuttingDown = false;

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    await this.connect();

    if (!this.dataSource.isInitialized) {
      this.retryInterval = setInterval(() => {
        void this.connect();
      }, this.retryIntervalMs);
    }
  }

  async connect() {
    if (this.isShuttingDown || this.dataSource.isInitialized) return;

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this.initializeDataSource();

    try {
      await this.connectionPromise;
    } finally {
      this.connectionPromise = undefined;
    }
  }

  private async initializeDataSource() {
    try {
      await this.dataSource.initialize();

      this.logger.log('Database connected successfully');

      if (this.retryInterval) {
        clearInterval(this.retryInterval);
        this.retryInterval = undefined;
      }
    } catch (error) {
      this.logger.warn(
        `Database unavailable because of ${error}. Retrying in ${this.retryIntervalMs / 1000} seconds...`,
      );
    }
  }

  async onModuleDestroy() {
    this.isShuttingDown = true;

    if (this.retryInterval) {
      clearInterval(this.retryInterval);
      this.retryInterval = undefined;
    }

    if (this.connectionPromise) {
      await this.connectionPromise;
    }

    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }
}
