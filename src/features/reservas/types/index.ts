import { ClienteDTO } from "@/features/clientes/types";
import { HabitacionDTO } from "@/features/habitaciones/types";
import type { EstadoReserva } from "@/generated/prisma/enums";
export type { EstadoReserva };

export interface ReservaDTO {
  id: string;
  clienteId: string;
  habitacionId: string;
  fechaCheckIn: Date;
  fechaCheckOut: Date;
  estado: EstadoReserva;
  cliente?: ClienteDTO;
  habitacion?: HabitacionDTO;
  createdAt?: Date;
  updatedAt?: Date;
}
