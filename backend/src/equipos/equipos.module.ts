import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipo } from './equipo.entity';
import { EquiposController } from './equipos.controller';
import { EquiposService } from './equipos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Equipo])],
  controllers: [EquiposController],
  providers: [EquiposService],
})
export class EquiposModule {}
