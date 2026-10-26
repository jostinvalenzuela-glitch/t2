import { PartialType } from '@nestjs/mapped-types';
import { CreateEquipoDto } from './create-equipo.dto';

// PATCH permite omitir campos, pero no anular los obligatorios con null.
export class UpdateEquipoDto extends PartialType(CreateEquipoDto, {
  skipNullProperties: false,
}) {}
