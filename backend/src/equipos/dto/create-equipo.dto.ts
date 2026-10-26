import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { EstadoEquipo } from '../equipo.entity';

const trim = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;

export class CreateEquipoDto {
  @Transform(trim)
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  codigoInventario: string;

  @Transform(trim)
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  nombre: string;

  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  tipo: string;

  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  marca: string;

  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  modelo: string;

  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  ubicacion: string;

  @IsEnum(EstadoEquipo)
  estado: EstadoEquipo;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'fechaAdquisicion debe usar YYYY-MM-DD' })
  @IsDateString({ strict: true }, { message: 'fechaAdquisicion debe ser una fecha válida' })
  fechaAdquisicion: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(2000)
  observaciones?: string | null;
}
