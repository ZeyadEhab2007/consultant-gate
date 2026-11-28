import { Controller, Get } from '@nestjs/common';
import { SpecialtiesService } from './specialties.service';
import { SpecialtiesResponseDto } from './dto/specialties-response.dto';

@Controller('api/specialties')
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Get()
  findAll(): Promise<SpecialtiesResponseDto> {
    return this.specialtiesService.findAll();
  }
}
