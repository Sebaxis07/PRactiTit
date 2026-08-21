import type { TipoCliente } from "@/generated/prisma/enums";
export type { TipoCliente };

export interface ClienteDTO {
  id: string;
  nombre: string;
  telefono?: string | null;
  rutPasaporte?: string | null;
  tipo: TipoCliente;
  empresa?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
