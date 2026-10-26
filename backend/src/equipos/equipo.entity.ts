import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum EstadoEquipo {
  Disponible = 'Disponible',
  EnUso = 'En uso',
  Mantencion = 'Mantención',
  Baja = 'Baja',
}

@Entity('equipos')
export class Equipo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  codigoInventario: string;

  @Column({ length: 120 })
  nombre: string;

  @Column({ length: 60 })
  tipo: string;

  @Column({ length: 80 })
  marca: string;

  @Column({ length: 100 })
  modelo: string;

  @Column({ length: 120 })
  ubicacion: string;

  @Column({ type: 'enum', enum: EstadoEquipo })
  estado: EstadoEquipo;

  @Column({ type: 'date' })
  fechaAdquisicion: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;
}
