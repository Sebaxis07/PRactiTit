import type { EstadoHabitacion } from "@/generated/prisma/enums";
export type { EstadoHabitacion };

export interface HabitacionDTO {
  id: string;
  numero: string;
  capacidad: number;
  precioBase: number;
  estado: EstadoHabitacion;
  createdAt?: Date;
  updatedAt?: Date;
}
