"use server";

import { db } from "@/lib/db";
import {
  citas,
  tramites,
  clientes,
  catTiposCita,
  catTiposTramite,
  catEstadosProceso,
  familiaClientes,
  familias,
} from "@/lib/db/schema";
import { eq, isNull, and, desc, gte, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { CreateCitaData, UpdateCitaData, Cita } from "../types/cita";

// Obtener todas las citas con relaciones
export async function getCitas(fechaInicio?: string, fechaFin?: string) {
  try {
    console.log("🔍 Buscando citas...", { fechaInicio, fechaFin });

    // Construir condiciones
    const conditions = [isNull(citas.fechaEliminacion)];

    // Filtros de fecha si se proporcionan
    if (fechaInicio) {
      conditions.push(gte(citas.fechaHora, new Date(fechaInicio)));
    }
    if (fechaFin) {
      conditions.push(lte(citas.fechaHora, new Date(fechaFin)));
    }

    const whereCondition =
      conditions.length === 1 ? conditions[0] : and(...conditions);

    // Query con todas las relaciones
    const rawResult = await db
      .select({
        // Campos de cita
        id: citas.id,
        tramiteId: citas.tramiteId,
        tipoCitaId: citas.tipoCitaId,
        fechaHora: citas.fechaHora,
        lugar: citas.lugar,
        costo: citas.costo,
        estadoPagoCita: citas.estadoPagoCita,
        estado: citas.estado,
        notas: citas.notas,
        fechaCreacion: citas.fechaCreacion,
        fechaModificacion: citas.fechaModificacion,
        fechaEliminacion: citas.fechaEliminacion,
        // Relaciones
        tramiteId_rel: tramites.id,
        clienteId: clientes.id,
        clienteNombres: clientes.nombres,
        clienteApellidos: clientes.apellidos,
        clienteEmail: clientes.email,
        clienteTelefono: clientes.telefonoCelular,
        tipoTramiteId: catTiposTramite.id,
        tipoTramiteNombre: catTiposTramite.nombreTipo,
        estadoProcesoId: catEstadosProceso.id,
        estadoProcesoNombre: catEstadosProceso.nombreEstado,
        tipoCitaId_rel: catTiposCita.id,
        tipoCitaNombre: catTiposCita.nombreTipo,
      })
      .from(citas)
      .leftJoin(tramites, eq(citas.tramiteId, tramites.id))
      .leftJoin(clientes, eq(tramites.clienteId, clientes.id))
      .leftJoin(catTiposTramite, eq(tramites.tipoTramiteId, catTiposTramite.id))
      .leftJoin(
        catEstadosProceso,
        eq(tramites.estadoProcesoId, catEstadosProceso.id)
      )
      .leftJoin(catTiposCita, eq(citas.tipoCitaId, catTiposCita.id))
      .where(whereCondition)
      .orderBy(desc(citas.fechaHora));

    // Transformar el resultado
    const result: Cita[] = rawResult.map((row) => ({
      id: row.id,
      tramiteId: row.tramiteId,
      tipoCitaId: row.tipoCitaId,
      fechaHora: row.fechaHora,
      lugar: row.lugar,
      costo: row.costo,
      estadoPagoCita: row.estadoPagoCita,
      estado: row.estado,
      notas: row.notas,
      fechaCreacion: row.fechaCreacion,
      fechaModificacion: row.fechaModificacion,
      fechaEliminacion: row.fechaEliminacion,
      // Construir objetos de relación
      tramite: row.tramiteId_rel
        ? {
            id: row.tramiteId_rel,
            cliente: row.clienteId
              ? {
                  id: row.clienteId,
                  nombres: row.clienteNombres!,
                  apellidos: row.clienteApellidos!,
                  email: row.clienteEmail,
                  telefonoCelular: row.clienteTelefono,
                }
              : null,
            tipoTramite: row.tipoTramiteId
              ? {
                  id: row.tipoTramiteId,
                  nombreTipo: row.tipoTramiteNombre!,
                }
              : null,
            estadoProceso: row.estadoProcesoId
              ? {
                  id: row.estadoProcesoId,
                  nombreEstado: row.estadoProcesoNombre!,
                }
              : null,
          }
        : null,
      tipoCita: row.tipoCitaId_rel
        ? {
            id: row.tipoCitaId_rel,
            nombreTipo: row.tipoCitaNombre!,
          }
        : null,
    }));

    console.log("✅ Citas encontradas:", result.length);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Error fetching citas:", error);
    return {
      success: false,
      error: `Error al obtener las citas: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`,
    };
  }
}

// Crear una nueva cita
export async function createCita(data: CreateCitaData) {
  try {
    console.log("📝 Creando cita para trámite:", data.tramiteId);

    // Convertir strings vacías a null y procesar datos
    const processedData = {
      ...data,
      fechaHora: new Date(data.fechaHora),
      lugar: data.lugar || null,
      costo: data.costo || null,
      estadoPagoCita: data.estadoPagoCita || "Pendiente",
      estado: data.estado || "Programada",
      notas: data.notas || null,
    };

    const result = await db.insert(citas).values(processedData).returning();

    console.log("✅ Cita creada exitosamente:", result[0].id);

    revalidatePath("/protected/citas");
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("❌ Error creating cita:", error);
    return {
      success: false,
      error: `Error al crear la cita: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`,
    };
  }
}

// Actualizar una cita
export async function updateCita(data: UpdateCitaData) {
  try {
    console.log("📝 Actualizando cita:", data.id);

    const { id, ...updateData } = data;

    // Procesar datos
    const processedData = {
      ...updateData,
      fechaHora: updateData.fechaHora
        ? new Date(updateData.fechaHora)
        : undefined,
      lugar: updateData.lugar || null,
      costo: updateData.costo || null,
      notas: updateData.notas || null,
      fechaModificacion: new Date(),
    };

    // Remover campos undefined
    const cleanedData = Object.fromEntries(
      Object.entries(processedData).filter(([_, value]) => value !== undefined)
    );

    const result = await db
      .update(citas)
      .set(cleanedData)
      .where(eq(citas.id, id))
      .returning();

    console.log("✅ Cita actualizada:", result[0].id);
    revalidatePath("/protected/citas");
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("❌ Error updating cita:", error);
    return {
      success: false,
      error: `Error al actualizar la cita: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`,
    };
  }
}

// Eliminar una cita (soft delete)
export async function deleteCita(id: number) {
  try {
    console.log("🗑️ Eliminando cita:", id);

    await db
      .update(citas)
      .set({
        fechaEliminacion: new Date(),
        fechaModificacion: new Date(),
      })
      .where(eq(citas.id, id));

    console.log("✅ Cita eliminada:", id);
    revalidatePath("/protected/citas");
    return { success: true };
  } catch (error) {
    console.error("❌ Error deleting cita:", error);
    return {
      success: false,
      error: `Error al eliminar la cita: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`,
    };
  }
}

// Obtener tipos de cita para el formulario
export async function getTiposCita() {
  try {
    const result = await db
      .select()
      .from(catTiposCita)
      .orderBy(catTiposCita.nombreTipo);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Error fetching tipos cita:", error);
    return { success: false, error: "Error al obtener tipos de cita" };
  }
}

// Obtener trámites activos para el selector
export async function getTramitesForSelect() {
  try {
    const result = await db
      .select({
        id: tramites.id,
        clienteNombres: clientes.nombres,
        clienteApellidos: clientes.apellidos,
        tipoTramite: catTiposTramite.nombreTipo,
        estadoProceso: catEstadosProceso.nombreEstado,
      })
      .from(tramites)
      .leftJoin(clientes, eq(tramites.clienteId, clientes.id))
      .leftJoin(catTiposTramite, eq(tramites.tipoTramiteId, catTiposTramite.id))
      .leftJoin(
        catEstadosProceso,
        eq(tramites.estadoProcesoId, catEstadosProceso.id)
      )
      .where(
        and(
          isNull(tramites.fechaEliminacion),
          sql`LOWER(${catEstadosProceso.nombreEstado}) NOT LIKE '%completado%'`
        )
      )
      .orderBy(clientes.nombres, clientes.apellidos);

    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Error fetching tramites for select:", error);
    return { success: false, error: "Error al obtener trámites" };
  }
}

// Obtener estadísticas de citas
export async function getCitasStats() {
  try {
    console.log("📊 Obteniendo estadísticas de citas...");

    const [
      totalCitas,
      citasProgramadas,
      citasCompletadas,
      citasPendientesPago,
    ] = await Promise.all([
      // Total de citas activas
      db
        .select({ count: sql<number>`count(*)` })
        .from(citas)
        .where(isNull(citas.fechaEliminacion)),

      // Citas programadas
      db
        .select({ count: sql<number>`count(*)` })
        .from(citas)
        .where(
          and(isNull(citas.fechaEliminacion), eq(citas.estado, "Programada"))
        ),

      // Citas completadas
      db
        .select({ count: sql<number>`count(*)` })
        .from(citas)
        .where(
          and(isNull(citas.fechaEliminacion), eq(citas.estado, "Completada"))
        ),

      // Citas con pago pendiente
      db
        .select({ count: sql<number>`count(*)` })
        .from(citas)
        .where(
          and(
            isNull(citas.fechaEliminacion),
            eq(citas.estadoPagoCita, "Pendiente")
          )
        ),
    ]);

    const stats = {
      totalCitas: totalCitas[0]?.count || 0,
      citasProgramadas: citasProgramadas[0]?.count || 0,
      citasCompletadas: citasCompletadas[0]?.count || 0,
      citasPendientesPago: citasPendientesPago[0]?.count || 0,
    };

    console.log("✅ Estadísticas de citas obtenidas:", stats);
    return { success: true, data: stats };
  } catch (error) {
    console.error("❌ Error fetching citas stats:", error);
    return { success: false, error: "Error al obtener estadísticas de citas" };
  }
}

// Obtener citas para el calendario
export async function getCitasCalendario(
  fechaInicio: string,
  fechaFin: string
) {
  try {
    console.log("📅 Obteniendo citas para calendario...", {
      fechaInicio,
      fechaFin,
    });

    const result = await getCitas(fechaInicio, fechaFin);

    if (!result.success) {
      return result;
    }

    // Transformar para el calendario
    const citasCalendario = (result.data ?? []).map((cita) => ({
      id: cita.id,
      title: `${cita.tramite?.cliente?.nombres} ${cita.tramite?.cliente?.apellidos} - ${cita.tipoCita?.nombreTipo}`,
      start: cita.fechaHora,
      end: new Date(cita.fechaHora.getTime() + 60 * 60 * 1000), // +1 hora por defecto
      backgroundColor: getColorByEstado(cita.estado),
      borderColor: getColorByEstado(cita.estado),
      extendedProps: {
        tramiteId: cita.tramiteId,
        cliente: `${cita.tramite?.cliente?.nombres} ${cita.tramite?.cliente?.apellidos}`,
        tipoTramite: cita.tramite?.tipoTramite?.nombreTipo || "",
        tipoCita: cita.tipoCita?.nombreTipo || "",
        lugar: cita.lugar || "",
        estado: cita.estado || "",
        estadoPago: cita.estadoPagoCita || "",
        notas: cita.notas || "",
      },
    }));

    return { success: true, data: citasCalendario };
  } catch (error) {
    console.error("❌ Error fetching citas calendario:", error);
    return { success: false, error: "Error al obtener citas para calendario" };
  }
}

// Función auxiliar para colores por estado
function getColorByEstado(estado: string | null | undefined): string {
  switch (estado) {
    case "Programada":
      return "#3b82f6"; // blue
    case "Completada":
      return "#10b981"; // green
    case "Cancelada":
      return "#ef4444"; // red
    case "Reprogramada":
      return "#f59e0b"; // yellow
    default:
      return "#6b7280"; // gray
  }
}

// Obtener miembros de familia con trámites activos
export async function getFamilyMembersWithActiveTramites(familiaId: number) {
  try {
    console.log(
      "🔍 Buscando miembros de familia con trámites activos:",
      familiaId
    );

    const result = await db
      .select({
        clienteId: clientes.id,
        clienteNombres: clientes.nombres,
        clienteApellidos: clientes.apellidos,
        tramiteId: tramites.id,
        tipoTramite: catTiposTramite.nombreTipo,
        estadoProceso: catEstadosProceso.nombreEstado,
      })
      .from(familiaClientes)
      .innerJoin(clientes, eq(familiaClientes.clienteId, clientes.id))
      .innerJoin(tramites, eq(clientes.id, tramites.clienteId))
      .innerJoin(
        catTiposTramite,
        eq(tramites.tipoTramiteId, catTiposTramite.id)
      )
      .innerJoin(
        catEstadosProceso,
        eq(tramites.estadoProcesoId, catEstadosProceso.id)
      )
      .where(
        and(
          eq(familiaClientes.familiaId, familiaId),
          isNull(clientes.fechaEliminacion),
          isNull(tramites.fechaEliminacion),
          sql`LOWER(${catEstadosProceso.nombreEstado}) NOT LIKE '%completado%'`
        )
      )
      .orderBy(clientes.nombres, clientes.apellidos);

    console.log("✅ Miembros encontrados:", result.length);
    return { success: true, data: result };
  } catch (error) {
    console.error(
      "❌ Error fetching family members with active tramites:",
      error
    );
    return { success: false, error: "Error al obtener miembros de familia" };
  }
}

// Crear múltiples citas en combo
export async function createCitasCombo(citasData: CreateCitaData[]) {
  try {
    console.log("📝 Creando citas en combo:", citasData.length);

    // Procesar cada cita
    const processedCitas = citasData.map((data) => ({
      ...data,
      fechaHora: new Date(data.fechaHora),
      lugar: data.lugar || null,
      costo: data.costo || null,
      estadoPagoCita: data.estadoPagoCita || "Pendiente",
      estado: data.estado || "Programada",
      notas: data.notas || null,
    }));

    // Insertar todas las citas en una transacción
    const result = await db.insert(citas).values(processedCitas).returning();

    console.log("✅ Citas en combo creadas exitosamente:", result.length);

    revalidatePath("/protected/citas");
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Error creating citas combo:", error);
    return {
      success: false,
      error: `Error al crear las citas en combo: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`,
    };
  }
}

// Obtener familias para el selector
export async function getFamiliasSelector() {
  try {
    const result = await getFamilias();
    return result;
  } catch (error) {
    console.error("❌ Error fetching familias selector:", error);
    return {
      success: false,
      error: "Error al obtener familias para el selector",
    };
  }
}

// Obtener familias para el selector
export async function getFamilias() {
  try {
    console.log("🔍 Buscando familias...");

    const result = await db
      .select({
        id: familias.id,
        nombre: familias.nombre,
        descripcion: familias.descripcion,
        fechaCreacion: familias.fechaCreacion,
        // Contar miembros
        totalMiembros: sql<number>`(
          SELECT COUNT(*) 
          FROM ${familiaClientes} 
          WHERE ${familiaClientes.familiaId} = ${familias.id}
        )`,
      })
      .from(familias)
      .where(isNull(familias.fechaEliminacion))
      .orderBy(familias.nombre);

    console.log("✅ Familias encontradas:", result.length);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Error fetching familias:", error);
    return {
      success: false,
      error: `Error al obtener las familias: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`,
    };
  }
}
