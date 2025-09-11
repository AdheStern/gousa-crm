export interface Customer {
  id: number;
  nombres: string;
  apellidos: string;
  fechaNacimiento?: string | null;
  lugarNacimiento?: string | null;
  nacionalidad?: string | null;
  numeroCi?: string | null;
  numeroPasaporte?: string | null;
  pasaporteFechaEmision?: string | null;
  pasaporteFechaExpiracion?: string | null;
  email?: string | null;
  telefonoCelular?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  direccionDomicilio?: string | null;
  estadoCivil?: string | null;
  profesion?: string | null;
  conyugeNombreCompleto?: string | null;
  conyugeFechaNacimiento?: string | null;
  conyugeLugarNacimiento?: string | null;
  matrimonioFechaInicio?: string | null;
  matrimonioFechaFin?: string | null;
  nombrePadre?: string | null;
  fechaNacimientoPadre?: string | null;
  nombreMadre?: string | null;
  fechaNacimientoMadre?: string | null;
  motivoRecoleccionDatos?: string | null;
  lugarTrabajo?: string | null;
  descripcionTrabajo?: string | null;
  fechaContratacion?: string | null;
  direccionTrabajo?: string | null;
  cargoTrabajo?: string | null;
  telefonoTrabajo?: string | null;
  persepcionSalarial?: string | null;
  referenciaTrabajoAnterior?: string | null;
  nombreTrabajoAnterior?: string | null;
  telefonoTrabajoAnterior?: string | null;
  direccionTrabajoAnterior?: string | null;
  fechaInicioTrabajoAnterior?: string | null;
  fechaInicioTrabajoActual?: string | null;
  lugarEstudio?: string | null;
  carreraEstudio?: string | null;
  direccionEstudio?: string | null;
  telefonoEstudio?: string | null;
  fechaInicioEstudio?: string | null;
  fechaFinEstudio?: string | null;
  fechaTentativaViaje?: string | null;
  nombreContactoUSA?: string | null;
  direccionContactoUSA?: string | null;
  telefonoContactoUSA?: string | null;
  emailContactoUSA?: string | null;
  fechaCreacion: string;
  fechaModificacion?: string | null;
  fechaEliminacion?: string | null;
}

export interface CreateCustomerData {
  nombres: string;
  apellidos: string;
  fechaNacimiento?: string;
  lugarNacimiento?: string;
  nacionalidad?: string;
  numeroCi?: string;
  numeroPasaporte?: string;
  pasaporteFechaEmision?: string;
  pasaporteFechaExpiracion?: string;
  email?: string;
  telefonoCelular?: string;
  facebook?: string;
  instagram?: string;
  direccionDomicilio?: string;
  estadoCivil?: string;
  profesion?: string;
  conyugeNombreCompleto?: string;
  conyugeFechaNacimiento?: string;
  conyugeLugarNacimiento?: string;
  matrimonioFechaInicio?: string;
  matrimonioFechaFin?: string;
  nombrePadre?: string;
  fechaNacimientoPadre?: string;
  nombreMadre?: string;
  fechaNacimientoMadre?: string;
  motivoRecoleccionDatos?: string;
  lugarTrabajo?: string;
  descripcionTrabajo?: string;
  fechaContratacion?: string;
  direccionTrabajo?: string;
  cargoTrabajo?: string;
  telefonoTrabajo?: string;
  persepcionSalarial?: string;
  referenciaTrabajoAnterior?: string;
  nombreTrabajoAnterior?: string;
  telefonoTrabajoAnterior?: string;
  direccionTrabajoAnterior?: string;
  fechaInicioTrabajoAnterior?: string;
  fechaInicioTrabajoActual?: string;
  lugarEstudio?: string;
  carreraEstudio?: string;
  direccionEstudio?: string;
  telefonoEstudio?: string;
  fechaInicioEstudio?: string;
  fechaFinEstudio?: string;
  fechaTentativaViaje?: string;
  nombreContactoUSA?: string;
  direccionContactoUSA?: string;
  telefonoContactoUSA?: string;
  emailContactoUSA?: string;
  crearGrupoFamiliar?: boolean;
  nombreGrupoFamiliar?: string;
  parentesco?: string;
}

export interface UpdateCustomerData extends CreateCustomerData {
  id: number;
}

export interface Familia {
  id: number;
  nombre: string;
  descripcion?: string | null;
  fechaCreacion: string;
  fechaModificacion?: string | null;
  fechaEliminacion?: string | null;
}

export interface FamiliaCliente {
  id: number;
  familiaId: number;
  clienteId: number;
  parentesco?: string | null;
  fechaCreacion: string;
}
