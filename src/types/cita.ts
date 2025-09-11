// Tipos para el manejo de citas basados en el schema de GO USA
export interface Cita {
  id: number;
  tramiteId: number;
  tipoCitaId: number;
  fechaHora: Date;
  lugar?: string | null;
  costo?: string | null; // decimal como string
  estadoPagoCita?: "Pendiente" | "Pagado" | null;
  estado?: "Programada" | "Completada" | "Cancelada" | "Reprogramada" | null;
  notas?: string | null;
  fechaCreacion: Date;
  fechaModificacion: Date;
  fechaEliminacion?: Date | null;

  // Relaciones (cuando se incluyan en las queries)
  tramite: {
    id: number;
    cliente: {
      id: number;
      nombres: string;
      apellidos: string;
      email: string | null;
      telefonoCelular: string | null;
    } | null;
    tipoTramite: {
      id: number;
      nombreTipo: string;
    } | null;
    estadoProceso: {
      id: number;
      nombreEstado: string;
    } | null;
  } | null;
  tipoCita: {
    id: number;
    nombreTipo: string;
  } | null;
}

export interface CreateCitaData {
  tramiteId: number;
  tipoCitaId: number;
  fechaHora: string; // ISO string
  lugar?: string | undefined;
  costo?: string | undefined;
  estadoPagoCita?: "Pendiente" | "Pagado";
  estado?: "Programada" | "Completada" | "Cancelada" | "Reprogramada";
  notas?: string | undefined;
}

export interface UpdateCitaData extends Partial<CreateCitaData> {
  id: number;
}

// Tipos para los catálogos
export interface TipoCita {
  id: number;
  nombreTipo: string;
}

// Tipos para el calendario
export interface CitaCalendario {
  id: number;
  title: string;
  start: Date;
  end: Date;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps: {
    tramiteId: number;
    cliente: string;
    tipoTramite: string;
    tipoCita: string;
    lugar?: string;
    estado: string;
    estadoPago: string;
    notas?: string;
  };
}
