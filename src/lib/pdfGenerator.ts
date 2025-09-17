// src/lib/pdfGenerator.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Customer } from "@/types/customer";

// Helper de formato de fecha, mantenemos la versión robusta
const formatDate = (dateString: string | Date | null | undefined): string => {
  if (
    !dateString ||
    (typeof dateString === "string" && dateString.trim() === "")
  )
    return "-";
  try {
    const date =
      typeof dateString === "string"
        ? new Date(`${dateString}T00:00:00`)
        : dateString;
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    return "Fecha inválida";
  }
};

// Helper para obtener valores, mostrando '-' si está vacío. NUNCA devuelve null o undefined.
const getValue = (value: any): string => (value ? String(value) : "-");

const addFooter = (doc: jsPDF) => {
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() - 14,
      doc.internal.pageSize.getHeight() - 10,
      { align: "right" }
    );
    doc.text(
      `Ficha Confidencial de Cliente - GO USA | Generado: ${new Date().toLocaleString(
        "es-ES"
      )}`,
      14,
      doc.internal.pageSize.getHeight() - 10
    );
  }
};

export const generateCustomerPdf = (customer: Customer) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "legal", // Tamaño Oficio
  });

  let lastY = 0; // Variable para controlar la posición vertical manualmente

  // --- CABECERA ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("FICHA CONFIDENCIAL DE CLIENTE", 107.5, 20, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${getValue(customer.nombres)} ${getValue(customer.apellidos)}`,
    107.5,
    28,
    { align: "center" }
  );
  doc.setDrawColor(200);
  doc.line(14, 32, 201.5, 32);

  lastY = 40; // Posición de inicio después de la cabecera

  // --- FUNCIÓN HELPER INTERNA PARA DIBUJAR TABLAS ---
  const drawTable = (title: string, data: [string, string][]) => {
    autoTable(doc, {
      startY: lastY,
      head: [
        [
          {
            content: title,
            styles: { fillColor: [22, 163, 74], textColor: 255 },
          },
        ],
      ],
      body: data,
      theme: "striped",
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 70 },
        1: { cellWidth: "auto" },
      },
    });
    lastY = (doc as any).lastAutoTable.finalY + 8; // Actualizamos la posición para la siguiente tabla
  };

  // ======================================================
  //                    DIBUJAR TODAS LAS SECCIONES
  // ======================================================
  drawTable("MOTIVO DE RECOLECCIÓN DE DATOS", [
    ["Motivo", getValue(customer.motivoRecoleccionDatos)],
  ]);

  drawTable("INFORMACIÓN PERSONAL", [
    ["Nombres", getValue(customer.nombres)],
    ["Apellidos", getValue(customer.apellidos)],
    ["Fecha de Nacimiento", formatDate(customer.fechaNacimiento)],
    ["Lugar de Nacimiento", getValue(customer.lugarNacimiento)],
    ["Nacionalidad", getValue(customer.nacionalidad)],
    ["Número de CI", getValue(customer.numeroCi)],
    ["Estado Civil", getValue(customer.estadoCivil)],
    ["Profesión", getValue(customer.profesion)],
  ]);

  drawTable("INFORMACIÓN DE CONTACTO", [
    ["Email", getValue(customer.email)],
    ["Teléfono Celular", getValue(customer.telefonoCelular)],
    ["Facebook", getValue(customer.facebook)],
    ["Instagram", getValue(customer.instagram)],
    ["Dirección Domicilio", getValue(customer.direccionDomicilio)],
  ]);

  drawTable("INFORMACIÓN DE PASAPORTE", [
    ["Número de Pasaporte", getValue(customer.numeroPasaporte)],
    ["Fecha de Emisión", formatDate(customer.pasaporteFechaEmision)],
    ["Fecha de Expiración", formatDate(customer.pasaporteFechaExpiracion)],
  ]);

  drawTable("INFORMACIÓN DEL CÓNYUGE", [
    ["Nombre Completo", getValue(customer.conyugeNombreCompleto)],
    ["Fecha de Nacimiento", formatDate(customer.conyugeFechaNacimiento)],
    ["Lugar de Nacimiento", getValue(customer.conyugeLugarNacimiento)],
    ["Fecha de Matrimonio", formatDate(customer.matrimonioFechaInicio)],
    ["Fecha Fin Matrimonio", formatDate(customer.matrimonioFechaFin)],
  ]);

  drawTable("INFORMACIÓN DE LOS PADRES", [
    ["Nombre del Padre", getValue(customer.nombrePadre)],
    ["Fecha Nacimiento Padre", formatDate(customer.fechaNacimientoPadre)],
    ["Nombre de la Madre", getValue(customer.nombreMadre)],
    ["Fecha Nacimiento Madre", formatDate(customer.fechaNacimientoMadre)],
  ]);

  drawTable("INFORMACIÓN LABORAL ACTUAL", [
    ["Lugar de Trabajo", getValue(customer.lugarTrabajo)],
    ["Cargo", getValue(customer.cargoTrabajo)],
    ["Percepción Salarial", getValue(customer.persepcionSalarial)],
    ["Fecha de Inicio", formatDate(customer.fechaInicioTrabajoActual)],
    ["Dirección del Trabajo", getValue(customer.direccionTrabajo)],
    ["Teléfono del Trabajo", getValue(customer.telefonoTrabajo)],
    ["Descripción del Trabajo", getValue(customer.descripcionTrabajo)],
    ["Fecha de Contratación", formatDate(customer.fechaContratacion)], // <-- CAMPO AÑADIDO
  ]);

  drawTable("INFORMACIÓN LABORAL ANTERIOR", [
    ["Nombre del Trabajo", getValue(customer.nombreTrabajoAnterior)],
    ["Referencia", getValue(customer.referenciaTrabajoAnterior)],
    ["Fecha de Inicio", formatDate(customer.fechaInicioTrabajoAnterior)],
    ["Dirección", getValue(customer.direccionTrabajoAnterior)],
    ["Teléfono", getValue(customer.telefonoTrabajoAnterior)],
  ]);

  drawTable("INFORMACIÓN DE ESTUDIOS", [
    ["Lugar de Estudio", getValue(customer.lugarEstudio)],
    ["Carrera", getValue(customer.carreraEstudio)],
    ["Fecha de Inicio", formatDate(customer.fechaInicioEstudio)],
    ["Fecha de Fin", formatDate(customer.fechaFinEstudio)],
    ["Dirección", getValue(customer.direccionEstudio)],
    ["Teléfono", getValue(customer.telefonoEstudio)],
  ]);

  drawTable("INFORMACIÓN DE VIAJE Y CONTACTO EN USA", [
    ["Fecha Tentativa de Viaje", formatDate(customer.fechaTentativaViaje)],
    ["Nombre del Contacto", getValue(customer.nombreContactoUSA)],
    ["Dirección del Contacto", getValue(customer.direccionContactoUSA)],
    ["Teléfono del Contacto", getValue(customer.telefonoContactoUSA)],
    ["Email del Contacto", getValue(customer.emailContactoUSA)],
  ]);

  // --- FOOTER Y GUARDADO ---
  addFooter(doc);
  doc.save(
    `Ficha-${getValue(customer.nombres)}_${getValue(customer.apellidos)}.pdf`
  );
};
