import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Equipo } from './equipo.entity';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { UpdateEquipoDto } from './dto/update-equipo.dto';

@Injectable()
export class EquiposService {
  constructor(
    @InjectRepository(Equipo) private readonly repository: Repository<Equipo>,
  ) {}

  findAll() {
    return this.repository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const equipo = await this.repository.findOneBy({ id });
    if (!equipo)
      throw new NotFoundException(`No existe el equipo con ID ${id}`);
    return equipo;
  }

  async create(dto: CreateEquipoDto) {
    return this.save(this.repository.create(dto));
  }

  async update(id: number, dto: UpdateEquipoDto) {
    const equipo = await this.findOne(id);
    this.repository.merge(equipo, dto);
    return this.save(equipo);
  }

  async remove(id: number) {
    const equipo = await this.findOne(id);
    await this.repository.remove(equipo);
  }

  private async save(equipo: Equipo) {
    try {
      return await this.repository.save(equipo);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException(
          'El código de inventario ya está registrado',
        );
      }
      throw error;
    }
  }
}
