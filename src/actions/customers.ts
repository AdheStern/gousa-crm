"use server";

import { db } from "@/lib/db";
import { clientes, familias, familiaClientes } from "@/lib/db/schema";
import { eq, isNull, or, ilike, and, desc, type SQL } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { CreateCustomerData, UpdateCustomerData } from "@/types/customer";

// Obtener todos los clientes (solo los no eliminados) con búsqueda opcional
export async function getCustomers(searchTerm?: string) {
  try {
    console.log("🔍 Buscando clientes...", { searchTerm });
    console.log("🔗 DATABASE_URL configurada:", !!process.env.DATABASE_URL);

    // Construir array de condiciones
    const conditions: SQL<unknown>[] = [isNull(clientes.fechaEliminacion)];

    // Si hay término de búsqueda, agregar filtros de búsqueda
    if (searchTerm && searchTerm.trim() !== "") {
      const searchPattern = `%${searchTerm.trim()}%`;
      const searchCondition = or(
        ilike(clientes.nombres, searchPattern),
        ilike(clientes.apellidos, searchPattern),
        ilike(clientes.numeroCi, searchPattern),
        ilike(clientes.numeroPasaporte, searchPattern),
        ilike(clientes.email, searchPattern),
        ilike(clientes.motivoRecoleccionDatos, searchPattern)
      );

      // Solo agregar si searchCondition no es undefined
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // Combinar todas las condiciones
    const whereCondition =
      conditions.length === 1 ? conditions[0] : and(...conditions);

    // Ejecutar la query
    const result = await db
      .select()
      .from(clientes)
      .where(whereCondition)
      .orderBy(desc(clientes.fechaCreacion));

    console.log("✅ Clientes encontrados:", result.length);
    if (result.length > 0) {
      console.log("📊 Primer cliente:", {
        id: result[0].id,
        nombres: result[0].nombres,
        apellidos: result[0].apellidos,
        fechaCreacion: result[0].fechaCreacion,
      });
    }
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Error detallado fetching customers:", error);
    console.error(
      "❌ Error stack:",
      error instanceof Error ? error.stack : "No stack available"
    );
    return {
      success: false,
      error: `Error al obtener los clientes: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`,
    };
  }
}

export async function createCustomer(data: CreateCustomerData) {
  try {
    console.log("📝 Creando cliente:", data.nombres, data.apellidos);

    // Convertir strings vacías a null para campos opcionales
    const processedData = {
      ...data,
      fechaNacimiento: data.fechaNacimiento || null,
      lugarNacimiento: data.lugarNacimiento || null,
      nacionalidad: data.nacionalidad || null,
      numeroCi: data.numeroCi || null,
      numeroPasaporte: data.numeroPasaporte || null,
      pasaporteFechaEmision: data.pasaporteFechaEmision || null,
      pasaporteFechaExpiracion: data.pasaporteFechaExpiracion || null,
      email: data.email || null,
      telefonoCelular: data.telefonoCelular || null,
      facebook: data.facebook || null,
      instagram: data.instagram || null,
      direccionDomicilio: data.direccionDomicilio || null,
      estadoCivil: data.estadoCivil || null,
      profesion: data.profesion || null,
      conyugeNombreCompleto: data.conyugeNombreCompleto || null,
      conyugeFechaNacimiento: data.conyugeFechaNacimiento || null,
      conyugeLugarNacimiento: data.conyugeLugarNacimiento || null,
      matrimonioFechaInicio: data.matrimonioFechaInicio || null,
      matrimonioFechaFin: data.matrimonioFechaFin || null,
      nombrePadre: data.nombrePadre || null,
      fechaNacimientoPadre: data.fechaNacimientoPadre || null,
      nombreMadre: data.nombreMadre || null,
      fechaNacimientoMadre: data.fechaNacimientoMadre || null,
      motivoRecoleccionDatos: data.motivoRecoleccionDatos || null,
      lugarTrabajo: data.lugarTrabajo || null,
      descripcionTrabajo: data.descripcionTrabajo || null,
      fechaContratacion: data.fechaContratacion || null,
      direccionTrabajo: data.direccionTrabajo || null,
      cargoTrabajo: data.cargoTrabajo || null,
      telefonoTrabajo: data.telefonoTrabajo || null,
      persepcionSalarial: data.persepcionSalarial || null,
      referenciaTrabajoAnterior: data.referenciaTrabajoAnterior || null,
      nombreTrabajoAnterior: data.nombreTrabajoAnterior || null,
      telefonoTrabajoAnterior: data.telefonoTrabajoAnterior || null,
      direccionTrabajoAnterior: data.direccionTrabajoAnterior || null,
      fechaInicioTrabajoAnterior: data.fechaInicioTrabajoAnterior || null,
      fechaInicioTrabajoActual: data.fechaInicioTrabajoActual || null,
      lugarEstudio: data.lugarEstudio || null,
      carreraEstudio: data.carreraEstudio || null,
      direccionEstudio: data.direccionEstudio || null,
      telefonoEstudio: data.telefonoEstudio || null,
      fechaInicioEstudio: data.fechaInicioEstudio || null,
      fechaFinEstudio: data.fechaFinEstudio || null,
      fechaTentativaViaje: data.fechaTentativaViaje || null,
      nombreContactoUSA: data.nombreContactoUSA || null,
      direccionContactoUSA: data.direccionContactoUSA || null,
      telefonoContactoUSA: data.telefonoContactoUSA || null,
      emailContactoUSA: data.emailContactoUSA || null,
    };

    // Remover campos específicos del grupo familiar del objeto del cliente
    const {
      crearGrupoFamiliar,
      nombreGrupoFamiliar,
      parentesco,
      ...clienteData
    } = processedData;

    const result = await db.insert(clientes).values(clienteData).returning();
    const nuevoCliente = result[0];

    if (
      data.crearGrupoFamiliar &&
      data.nombreGrupoFamiliar &&
      data.parentesco
    ) {
      try {
        // Crear el grupo familiar
        const familiaResult = await db
          .insert(familias)
          .values({
            nombre: data.nombreGrupoFamiliar,
            descripcion: `Grupo familiar creado para ${nuevoCliente.nombres} ${nuevoCliente.apellidos}`,
          })
          .returning();

        const nuevaFamilia = familiaResult[0];

        // Asociar el cliente al grupo familiar
        await db.insert(familiaClientes).values({
          familiaId: nuevaFamilia.id,
          clienteId: nuevoCliente.id,
          parentesco: data.parentesco,
        });

        console.log("✅ Grupo familiar creado:", nuevaFamilia.nombre);
      } catch (familyError) {
        console.error("⚠️ Error creando grupo familiar:", familyError);
        // No fallar la creación del cliente si hay error en el grupo familiar
      }
    }

    console.log("✅ Cliente creado exitosamente:", {
      id: nuevoCliente.id,
      nombres: nuevoCliente.nombres,
      apellidos: nuevoCliente.apellidos,
    });

    revalidatePath("/customers");
    return { success: true, data: nuevoCliente };
  } catch (error) {
    console.error("❌ Error creating customer:", error);
    return {
      success: false,
      error: `Error al crear el cliente: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`,
    };
  }
}

export async function updateCustomer(data: UpdateCustomerData) {
  try {
    console.log("📝 Actualizando cliente:", data.id);

    const {
      id,
      crearGrupoFamiliar,
      nombreGrupoFamiliar,
      parentesco,
      ...updateData
    } = data;

    // Convertir strings vacías a null y agregar fecha de modificación
    const processedData = {
      ...updateData,
      fechaNacimiento: updateData.fechaNacimiento || null,
      lugarNacimiento: updateData.lugarNacimiento || null,
      nacionalidad: updateData.nacionalidad || null,
      numeroCi: updateData.numeroCi || null,
      numeroPasaporte: updateData.numeroPasaporte || null,
      pasaporteFechaEmision: updateData.pasaporteFechaEmision || null,
      pasaporteFechaExpiracion: updateData.pasaporteFechaExpiracion || null,
      email: updateData.email || null,
      telefonoCelular: updateData.telefonoCelular || null,
      facebook: updateData.facebook || null,
      instagram: updateData.instagram || null,
      direccionDomicilio: updateData.direccionDomicilio || null,
      estadoCivil: updateData.estadoCivil || null,
      profesion: updateData.profesion || null,
      conyugeNombreCompleto: updateData.conyugeNombreCompleto || null,
      conyugeFechaNacimiento: updateData.conyugeFechaNacimiento || null,
      conyugeLugarNacimiento: updateData.conyugeLugarNacimiento || null,
      matrimonioFechaInicio: updateData.matrimonioFechaInicio || null,
      matrimonioFechaFin: updateData.matrimonioFechaFin || null,
      nombrePadre: updateData.nombrePadre || null,
      fechaNacimientoPadre: updateData.fechaNacimientoPadre || null,
      nombreMadre: updateData.nombreMadre || null,
      fechaNacimientoMadre: updateData.fechaNacimientoMadre || null,
      motivoRecoleccionDatos: updateData.motivoRecoleccionDatos || null,
      lugarTrabajo: updateData.lugarTrabajo || null,
      descripcionTrabajo: updateData.descripcionTrabajo || null,
      fechaContratacion: updateData.fechaContratacion || null,
      direccionTrabajo: updateData.direccionTrabajo || null,
      cargoTrabajo: updateData.cargoTrabajo || null,
      telefonoTrabajo: updateData.telefonoTrabajo || null,
      persepcionSalarial: updateData.persepcionSalarial || null,
      referenciaTrabajoAnterior: updateData.referenciaTrabajoAnterior || null,
      nombreTrabajoAnterior: updateData.nombreTrabajoAnterior || null,
      telefonoTrabajoAnterior: updateData.telefonoTrabajoAnterior || null,
      direccionTrabajoAnterior: updateData.direccionTrabajoAnterior || null,
      fechaInicioTrabajoAnterior: updateData.fechaInicioTrabajoAnterior || null,
      fechaInicioTrabajoActual: updateData.fechaInicioTrabajoActual || null,
      lugarEstudio: updateData.lugarEstudio || null,
      carreraEstudio: updateData.carreraEstudio || null,
      direccionEstudio: updateData.direccionEstudio || null,
      telefonoEstudio: updateData.telefonoEstudio || null,
      fechaInicioEstudio: updateData.fechaInicioEstudio || null,
      fechaFinEstudio: updateData.fechaFinEstudio || null,
      fechaTentativaViaje: updateData.fechaTentativaViaje || null,
      nombreContactoUSA: updateData.nombreContactoUSA || null,
      direccionContactoUSA: updateData.direccionContactoUSA || null,
      telefonoContactoUSA: updateData.telefonoContactoUSA || null,
      emailContactoUSA: updateData.emailContactoUSA || null,
      fechaModificacion: new Date(),
    };

    const result = await db
      .update(clientes)
      .set(processedData)
      .where(eq(clientes.id, id))
      .returning();

    console.log("✅ Cliente actualizado:", result[0].id);
    revalidatePath("/customers");
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("❌ Error updating customer:", error);
    return {
      success: false,
      error: `Error al actualizar el cliente: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`,
    };
  }
}

// Eliminar un cliente (soft delete)
export async function deleteCustomer(id: number) {
  try {
    console.log("🗑️ Eliminando cliente:", id);

    await db
      .update(clientes)
      .set({
        fechaEliminacion: new Date(),
        fechaModificacion: new Date(),
      })
      .where(eq(clientes.id, id));

    console.log("✅ Cliente eliminado:", id);
    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    console.error("❌ Error deleting customer:", error);
    return {
      success: false,
      error: `Error al eliminar el cliente: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`,
    };
  }
}

// Obtener todas las familias (solo las no eliminadas) con búsqueda opcional
export async function getFamilias(searchTerm?: string) {
  try {
    console.log("🔍 Buscando familias...", { searchTerm });

    // Construir array de condiciones
    const conditions: SQL<unknown>[] = [isNull(familias.fechaEliminacion)];

    // Si hay término de búsqueda, agregar filtros de búsqueda
    if (searchTerm && searchTerm.trim() !== "") {
      const searchPattern = `%${searchTerm.trim()}%`;
      const searchCondition = or(
        ilike(familias.nombre, searchPattern),
        ilike(familias.descripcion, searchPattern)
      );

      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // Combinar todas las condiciones
    const whereCondition =
      conditions.length === 1 ? conditions[0] : and(...conditions);

    const result = await db
      .select()
      .from(familias)
      .where(whereCondition)
      .orderBy(desc(familias.fechaCreacion));

    console.log("✅ Familias encontradas:", result.length);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Error fetching families:", error);
    return {
      success: false,
      error: `Error al obtener las familias: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`,
    };
  }
}

export async function createFamilia(data: {
  nombre: string;
  descripcion?: string;
}) {
  try {
    console.log("📝 Creando familia:", data.nombre);

    const result = await db
      .insert(familias)
      .values({
        nombre: data.nombre,
        descripcion: data.descripcion || null,
      })
      .returning();

    console.log("✅ Familia creada exitosamente:", result[0].id);
    revalidatePath("/customers");
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("❌ Error creating family:", error);
    return {
      success: false,
      error: `Error al crear la familia: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`,
    };
  }
}

export async function updateFamilia(data: {
  id: number;
  nombre: string;
  descripcion?: string;
}) {
  try {
    console.log("📝 Actualizando familia:", data.id);

    const result = await db
      .update(familias)
      .set({
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        fechaModificacion: new Date(),
      })
      .where(eq(familias.id, data.id))
      .returning();

    console.log("✅ Familia actualizada:", result[0].id);
    revalidatePath("/customers");
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("❌ Error updating family:", error);
    return {
      success: false,
      error: `Error al actualizar la familia: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`,
    };
  }
}

export async function deleteFamilia(id: number) {
  try {
    console.log("🗑️ Eliminando familia:", id);

    await db
      .update(familias)
      .set({
        fechaEliminacion: new Date(),
        fechaModificacion: new Date(),
      })
      .where(eq(familias.id, id));

    console.log("✅ Familia eliminada:", id);
    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    console.error("❌ Error deleting family:", error);
    return {
      success: false,
      error: `Error al eliminar la familia: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`,
    };
  }
}

export async function addClienteToFamilia(data: {
  familiaId: number;
  clienteId: number;
  parentesco: string;
}) {
  try {
    console.log("👨‍👩‍👧‍👦 Agregando cliente a familia:", data);

    // Check if relationship already exists
    const existing = await db
      .select()
      .from(familiaClientes)
      .where(
        and(
          eq(familiaClientes.familiaId, data.familiaId),
          eq(familiaClientes.clienteId, data.clienteId)
        )
      );

    if (existing.length > 0) {
      // Update existing relationship
      const result = await db
        .update(familiaClientes)
        .set({
          parentesco: data.parentesco,
        })
        .where(
          and(
            eq(familiaClientes.familiaId, data.familiaId),
            eq(familiaClientes.clienteId, data.clienteId)
          )
        )
        .returning();

      console.log("✅ Relación familiar actualizada:", result[0].id);
      return { success: true, data: result[0] };
    } else {
      // Create new relationship
      const result = await db
        .insert(familiaClientes)
        .values({
          familiaId: data.familiaId,
          clienteId: data.clienteId,
          parentesco: data.parentesco,
        })
        .returning();

      console.log("✅ Cliente agregado a familia:", result[0].id);
      return { success: true, data: result[0] };
    }
  } catch (error) {
    console.error("❌ Error adding client to family:", error);
    return {
      success: false,
      error: `Error al agregar cliente a familia: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`,
    };
  }
}
