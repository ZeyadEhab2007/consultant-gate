
import { DataSource } from 'typeorm';
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  let service: DatabaseService;
  let dataSource: jest.Mocked<DataSource>;

  beforeEach(() => {
    dataSource = {
      isInitialized: false,
      initialize: jest.fn(),
      destroy: jest.fn(),
    } as unknown as jest.Mocked<DataSource>;

    service = new DatabaseService(dataSource);
  });

  it('should wait for initialization before destroying the DataSource', async () => {
    let resolveInitialization!: (value: DataSource) => void;

    dataSource.initialize.mockImplementation(
      () =>
        new Promise<DataSource>((resolve) => {
          resolveInitialization = resolve;
        }),
    );

    dataSource.destroy.mockImplementation(async () => {
      dataSource.isInitialized = false;
    });

    const connectionAttempt = service.connect();
    const shutdown = service.onModuleDestroy();

    expect(dataSource.destroy).not.toHaveBeenCalled();

    dataSource.isInitialized = true;
    resolveInitialization(dataSource);

    await connectionAttempt;
    await shutdown;

    expect(dataSource.destroy).toHaveBeenCalledTimes(1);
  });

  it('should not destroy the DataSource if initialization fails during shutdown', async () => {
    let rejectInitialization!: (error: Error) => void;

    dataSource.initialize.mockImplementation(
      () =>
        new Promise<DataSource>((_, reject) => {
          rejectInitialization = reject;
        }),
    );

    const connectionAttempt = service.connect();
    const shutdown = service.onModuleDestroy();

    rejectInitialization(new Error('Database connection failed'));

    await connectionAttempt;
    await shutdown;

    expect(dataSource.destroy).not.toHaveBeenCalled();
  });

it('should not attempt a new connection after shutdown starts', async () => {
  dataSource.initialize.mockResolvedValue(dataSource);

  await service.onModuleDestroy();

  await service.connect();

  expect(dataSource.initialize).not.toHaveBeenCalled();
});

});
