// src/lib/pdfGenerator.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Customer } from "@/types/customer";

// Helper de formato de fecha, ahora más seguro
const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return "N/A";
  try {
    // Si ya es un objeto Date, perfecto. Si es un string, lo convertimos.
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

// Helper para obtener valores de forma segura, devolviendo 'N/A' si es null/undefined
const getValue = (value: string | null | undefined): string => value || "N/A";

// --- NUEVA FUNCIÓN addSection a prueba de fallos ---
const addSection = (
  doc: jsPDF,
  title: string,
  data: [string, any][],
  startY?: number
) => {
  const body = data.filter(
    ([, value]) =>
      value &&
      value.toString().trim() !== "" &&
      value.toString().trim() !== "N/A"
  );

  if (body.length === 0) {
    return; // Si no hay datos en la sección, simplemente no hagas nada y sal de la función.
  }

  autoTable(doc, {
    startY: startY || (doc as any).lastAutoTable.finalY + 8,
    head: [
      [
        {
          content: title,
          styles: { fillColor: [34, 119, 85], textColor: 255 },
        },
      ],
    ],
    body: body,
    theme: "striped",
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60 },
      1: { cellWidth: "auto" },
    },
    didDrawPage: (data) =>
      addFooter(doc, data.pageNumber, doc.internal.getNumberOfPages()),
  });
};

const addFooter = (doc: jsPDF, currentPage: number, totalPages: number) => {
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text(
    `Página ${currentPage} de ${totalPages}`,
    doc.internal.pageSize.getWidth() - 14,
    doc.internal.pageSize.getHeight() - 10,
    { align: "right" }
  );
  doc.text(
    `Ficha de Cliente - GO USA | Generado el: ${new Date().toLocaleDateString(
      "es-ES"
    )}`,
    14,
    doc.internal.pageSize.getHeight() - 10
  );
};

// --- Main PDF Generation Function (ACTUALIZADA) ---
export const generateCustomerPdf = (customer: Customer) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "legal",
  });

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

  const startY = 40;

  // --- SECCIONES DEL PDF (Ahora usando getValue para asegurar que pasamos strings) ---
  addSection(
    doc,
    "MOTIVO DE RECOLECCIÓN DE DATOS",
    [["Motivo", getValue(customer.motivoRecoleccionDatos)]],
    startY
  );
  addSection(doc, "INFORMACIÓN PERSONAL", [
    ["Nombres", getValue(customer.nombres)],
    ["Apellidos", getValue(customer.apellidos)],
    ["Fecha de Nacimiento", formatDate(customer.fechaNacimiento)],
    ["Lugar de Nacimiento", getValue(customer.lugarNacimiento)],
    ["Nacionalidad", getValue(customer.nacionalidad)],
    ["Número de CI", getValue(customer.numeroCi)],
    ["Estado Civil", getValue(customer.estadoCivil)],
    ["Profesión", getValue(customer.profesion)],
  ]);
  addSection(doc, "INFORMACIÓN DE CONTACTO", [
    ["Email", getValue(customer.email)],
    ["Teléfono Celular", getValue(customer.telefonoCelular)],
    ["Facebook", getValue(customer.facebook)],
    ["Instagram", getValue(customer.instagram)],
    ["Dirección Domicilio", getValue(customer.direccionDomicilio)],
  ]);
  addSection(doc, "INFORMACIÓN DE PASAPORTE", [
    ["Número de Pasaporte", getValue(customer.numeroPasaporte)],
    ["Fecha de Emisión", formatDate(customer.pasaporteFechaEmision)],
    ["Fecha de Expiración", formatDate(customer.pasaporteFechaExpiracion)],
  ]);
  addSection(doc, "INFORMACIÓN DEL CÓNYUGE", [
    ["Nombre Completo", getValue(customer.conyugeNombreCompleto)],
    ["Fecha de Nacimiento", formatDate(customer.conyugeFechaNacimiento)],
    ["Lugar de Nacimiento", getValue(customer.conyugeLugarNacimiento)],
    ["Fecha de Matrimonio", formatDate(customer.matrimonioFechaInicio)],
    ["Fecha Fin Matrimonio", formatDate(customer.matrimonioFechaFin)],
  ]);
  addSection(doc, "INFORMACIÓN DE LOS PADRES", [
    ["Nombre del Padre", getValue(customer.nombrePadre)],
    ["Fecha Nacimiento Padre", formatDate(customer.fechaNacimientoPadre)],
    ["Nombre de la Madre", getValue(customer.nombreMadre)],
    ["Fecha Nacimiento Madre", formatDate(customer.fechaNacimientoMadre)],
  ]);
  addSection(doc, "INFORMACIÓN LABORAL ACTUAL", [
    ["Lugar de Trabajo", getValue(customer.lugarTrabajo)],
    ["Cargo", getValue(customer.cargoTrabajo)],
    ["Percepción Salarial", getValue(customer.persepcionSalarial)],
    ["Fecha de Inicio", formatDate(customer.fechaInicioTrabajoActual)],
    ["Dirección del Trabajo", getValue(customer.direccionTrabajo)],
    ["Teléfono del Trabajo", getValue(customer.telefonoTrabajo)],
    ["Descripción del Trabajo", getValue(customer.descripcionTrabajo)],
  ]);
  addSection(doc, "INFORMACIÓN LABORAL ANTERIOR", [
    ["Nombre del Trabajo", getValue(customer.nombreTrabajoAnterior)],
    ["Referencia", getValue(customer.referenciaTrabajoAnterior)],
    ["Fecha de Inicio", formatDate(customer.fechaInicioTrabajoAnterior)],
    ["Dirección", getValue(customer.direccionTrabajoAnterior)],
    ["Teléfono", getValue(customer.telefonoTrabajoAnterior)],
  ]);
  addSection(doc, "INFORMACIÓN DE ESTUDIOS", [
    ["Lugar de Estudio", getValue(customer.lugarEstudio)],
    ["Carrera", getValue(customer.carreraEstudio)],
    ["Fecha de Inicio", formatDate(customer.fechaInicioEstudio)],
    ["Fecha de Fin", formatDate(customer.fechaFinEstudio)],
    ["Dirección", getValue(customer.direccionEstudio)],
    ["Teléfono", getValue(customer.telefonoEstudio)],
  ]);
  addSection(doc, "INFORMACIÓN DE VIAJE Y CONTACTO EN USA", [
    ["Fecha Tentativa de Viaje", formatDate(customer.fechaTentativaViaje)],
    ["Nombre del Contacto", getValue(customer.nombreContactoUSA)],
    ["Dirección del Contacto", getValue(customer.direccionContactoUSA)],
    ["Teléfono del Contacto", getValue(customer.telefonoContactoUSA)],
    ["Email del Contacto", getValue(customer.emailContactoUSA)],
  ]);

  // Si no se dibujó ninguna tabla, el footer no se habrá añadido. Lo añadimos aquí por si acaso.
  if (!(doc as any).lastAutoTable) {
    addFooter(doc, 1, 1);
  }

  doc.save(
    `Ficha-${getValue(customer.nombres)}_${getValue(customer.apellidos)}.pdf`
  );
};
