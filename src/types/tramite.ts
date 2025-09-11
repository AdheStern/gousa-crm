// Tipos para el manejo de trámites basados en el schema de GO USA
export interface Tramite {
  id: number;
  clienteId: number;
  usuarioAsignadoId?: string | null;
  tipoTramiteId: number;
  estadoProcesoId: number;
  estadoPagoId: number;
  codigoConfirmacionDs160?: string | null;
  codigoSeguimientoCourier?: string | null;
  visaNumero?: string | null;
  visaFechaEmision?: string | null;
  visaFechaExpiracion?: string | null;
  notas?: string | null;
  fechaCreacion: Date;
  fechaModificacion: Date;
  fechaEliminacion?: Date | null;

  // Relaciones (cuando se incluyan en las queries) - Ajustados para coincidir exactamente con la query
  cliente: {
    id: number;
    nombres: string;
    apellidos: string;
    email: string | null;
    telefonoCelular: string | null;
  } | null;
  usuarioAsignado: {
    id: string;
    nombreCompleto: string;
    email: string;
  } | null;
  tipoTramite: {
    id: number;
    nombreTipo: string;
  } | null;
  estadoProceso: {
    id: number;
    nombreEstado: string;
  } | null;
  estadoPago: {
    id: number;
    nombreEstado: string;
  } | null;
}

export interface CreateTramiteData {
  clienteId: number;
  usuarioAsignadoId?: string;
  tipoTramiteId: number;
  estadoProcesoId: number;
  estadoPagoId: number;
  codigoConfirmacionDs160?: string;
  codigoSeguimientoCourier?: string;
  visaNumero?: string;
  visaFechaEmision?: string;
  visaFechaExpiracion?: string;
  notas?: string;
}

export interface UpdateTramiteData extends Partial<CreateTramiteData> {
  id: number;
}

// Nuevo tipo para filtros de trámites
export interface TramiteFilters {
  clienteId?: number;
  tipoTramiteId?: number;
  estadoProcesoId?: number;
  estadoPagoId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  searchTerm?: string;
}

// Tipos para los catálogos
export interface TipoTramite {
  id: number;
  nombreTipo: string;
}

export interface EstadoProceso {
  id: number;
  nombreEstado: string;
}

export interface EstadoPago {
  id: number;
  nombreEstado: string;
}

// Tipo para el selector de trámites
export interface TramiteForSelect {
  id: number;
  clienteNombres: string | null;
  clienteApellidos: string | null;
  tipoTramite: string | null;
}
