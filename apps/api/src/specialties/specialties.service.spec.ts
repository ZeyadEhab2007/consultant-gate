import { DataSource } from 'typeorm';
import { SpecialtiesService } from './specialties.service';

describe('SpecialtiesService', () => {
  let service: SpecialtiesService;

  const queryBuilder = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  const dataSource = {
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
  } as unknown as DataSource;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SpecialtiesService(dataSource);
  });

  describe('findAll', () => {
    it('should return active specialties in the API response format', async () => {
      const specialties = [
        {
          id: 'specialty-1',
          name: 'Software Engineering',
          slug: 'software-engineering',
          description: 'Software engineering practices',
        },
      ];

      queryBuilder.getRawMany.mockResolvedValue(specialties);

      const result = await service.findAll();

      expect(result).toEqual({
        status: 'ok',
        data: specialties,
      });
    });

    it('should filter for active specialties only', async () => {
      queryBuilder.getRawMany.mockResolvedValue([]);

      await service.findAll();

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'specialty.is_active = :isActive',
        { isActive: true },
      );
    });

    it('should select only the public specialty fields', async () => {
      queryBuilder.getRawMany.mockResolvedValue([]);

      await service.findAll();

      expect(queryBuilder.select).toHaveBeenCalledWith([
        'specialty.id',
        'specialty.name',
        'specialty.slug',
        'specialty.description',
      ]);
    });

    it('should order specialties by name ascending', async () => {
      queryBuilder.getRawMany.mockResolvedValue([]);

      await service.findAll();

      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'specialty.name',
        'ASC',
      );
    });

    it('should return an empty data array when no active specialties exist', async () => {
      queryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual({
        status: 'ok',
        data: [],
      });
    });
  });
});
