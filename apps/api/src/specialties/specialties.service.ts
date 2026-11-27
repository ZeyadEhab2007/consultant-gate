import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SpecialtiesResponseDto } from './dto/specialties-response.dto';

@Injectable()
export class SpecialtiesService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(): Promise<SpecialtiesResponseDto> {
    const specialties = await this.dataSource
      .createQueryBuilder()
      .select([
        'specialty.id',
        'specialty.name',
        'specialty.slug',
        'specialty.description',
      ])
      .from('specialties', 'specialty')
      .where('specialty.is_active = :isActive', {
        isActive: true,
      })
      .orderBy('specialty.name', 'ASC')
      .getRawMany();

    return {
      status: 'ok',
      data: specialties,
    };
  }
}
