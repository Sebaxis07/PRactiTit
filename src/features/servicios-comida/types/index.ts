export interface ServicioComidaDTO {
  id: string;
  reservaId: string;
  fechaServicio: Date;
  desayunosCant: number;
  colacionesCant: number;
  cenasCant: number;
  restriccionDietaria?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
