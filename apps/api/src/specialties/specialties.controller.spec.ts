import { Test, TestingModule } from '@nestjs/testing';
import { SpecialtiesController } from './specialties.controller';
import { SpecialtiesService } from './specialties.service';

describe('SpecialtiesController', () => {
  let controller: SpecialtiesController;

  const specialtiesService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpecialtiesController],
      providers: [
        {
          provide: SpecialtiesService,
          useValue: specialtiesService,
        },
      ],
    }).compile();

    controller = module.get<SpecialtiesController>(SpecialtiesController);
  });

  describe('findAll', () => {
    it('should return specialties from the service', async () => {
      const response = {
        status: 'ok' as const,
        data: [
          {
            id: 'specialty-1',
            name: 'Software Engineering',
            slug: 'software-engineering',
            description: 'Software engineering practices',
          },
        ],
      };

      specialtiesService.findAll.mockResolvedValue(response);

      await expect(controller.findAll()).resolves.toEqual(response);

      expect(specialtiesService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return an empty list when the service has no specialties', async () => {
      const response = {
        status: 'ok' as const,
        data: [],
      };

      specialtiesService.findAll.mockResolvedValue(response);

      await expect(controller.findAll()).resolves.toEqual(response);
    });

    it('should propagate service errors', async () => {
      const error = new Error('Database error');

      specialtiesService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(error);
    });
  });
});
