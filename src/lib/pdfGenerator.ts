// src/lib/pdfGenerator.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Customer } from "@/types/customer"; // Asegúrate que la ruta a tu tipo Customer es correcta

// --- Helper Functions ---
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString || dateString.trim() === "") return "N/A";
  try {
    // Si la fecha es YYYY-MM-DD, el constructor de Date funciona correctamente en UTC
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    return "Fecha inválida";
  }
};

const addSection = (
  doc: jsPDF,
  title: string,
  data: [string, any][],
  startY?: number
) => {
  // Filtra las filas que no tienen valor para no saturar el PDF
  const body = data.filter(
    ([, value]) => value && value.toString().trim() !== ""
  );

  // Si no hay datos en la sección, no la imprimas (excepto la principal)
  if (body.length === 0 && title !== "INFORMACIÓN PERSONAL") return;

  autoTable(doc, {
    startY: startY || (doc as any).lastAutoTable.finalY + 8,
    head: [[{ content: title, styles: { fillColor: [34, 119, 85] } }]], // Tono verde oscuro
    body: body,
    theme: "striped",
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60 },
      1: { cellWidth: "auto" },
    },
    didDrawPage: (data) => {
      // Añadir footer en cada página
      addFooter(doc);
    },
  });
};

const addFooter = (doc: jsPDF) => {
  const pageCount = (doc as any).internal.getNumberOfPages();
  doc.setFontSize(9);
  doc.setTextColor(150);

  // Posiciona en la esquina inferior derecha
  doc.text(
    `Página ${doc.internal.pages.length - 1} de ${pageCount}`, // bug de jspdf, se necesita -1 para la pagina actual
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

// --- Main PDF Generation Function ---
export const generateCustomerPdf = (customer: Customer) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "legal", // Tamaño Oficio
  });

  // ======================================================
  //                    CABECERA DEL DOCUMENTO
  // ======================================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("FICHA CONFIDENCIAL DE CLIENTE", 107.5, 20, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(`${customer.nombres} ${customer.apellidos}`, 107.5, 28, {
    align: "center",
  });
  doc.setDrawColor(200);
  doc.line(14, 32, 201.5, 32);

  // ======================================================
  //                    SECCIONES DEL PDF
  // ======================================================
  const startY = 40;

  addSection(
    doc,
    "MOTIVO DE RECOLECCIÓN DE DATOS",
    [["Motivo", customer.motivoRecoleccionDatos]],
    startY
  );

  addSection(doc, "INFORMACIÓN PERSONAL", [
    ["Nombres", customer.nombres],
    ["Apellidos", customer.apellidos],
    ["Fecha de Nacimiento", formatDate(customer.fechaNacimiento)],
    ["Lugar de Nacimiento", customer.lugarNacimiento],
    ["Nacionalidad", customer.nacionalidad],
    ["Número de CI", customer.numeroCi],
    ["Estado Civil", customer.estadoCivil],
    ["Profesión", customer.profesion],
  ]);

  addSection(doc, "INFORMACIÓN DE CONTACTO", [
    ["Email", customer.email],
    ["Teléfono Celular", customer.telefonoCelular],
    ["Facebook", customer.facebook],
    ["Instagram", customer.instagram],
    ["Dirección Domicilio", customer.direccionDomicilio],
  ]);

  addSection(doc, "INFORMACIÓN DE PASAPORTE", [
    ["Número de Pasaporte", customer.numeroPasaporte],
    ["Fecha de Emisión", formatDate(customer.pasaporteFechaEmision)],
    ["Fecha de Expiración", formatDate(customer.pasaporteFechaExpiracion)],
  ]);

  addSection(doc, "INFORMACIÓN DEL CÓNYUGE", [
    ["Nombre Completo", customer.conyugeNombreCompleto],
    ["Fecha de Nacimiento", formatDate(customer.conyugeFechaNacimiento)],
    ["Lugar de Nacimiento", customer.conyugeLugarNacimiento],
    ["Fecha de Matrimonio", formatDate(customer.matrimonioFechaInicio)],
    ["Fecha Fin Matrimonio", formatDate(customer.matrimonioFechaFin)],
  ]);

  addSection(doc, "INFORMACIÓN DE LOS PADRES", [
    ["Nombre del Padre", customer.nombrePadre],
    ["Fecha Nacimiento Padre", formatDate(customer.fechaNacimientoPadre)],
    ["Nombre de la Madre", customer.nombreMadre],
    ["Fecha Nacimiento Madre", formatDate(customer.fechaNacimientoMadre)],
  ]);

  addSection(doc, "INFORMACIÓN LABORAL ACTUAL", [
    ["Lugar de Trabajo", customer.lugarTrabajo],
    ["Cargo", customer.cargoTrabajo],
    ["Percepción Salarial", customer.persepcionSalarial],
    ["Fecha de Inicio", formatDate(customer.fechaInicioTrabajoActual)],
    ["Dirección del Trabajo", customer.direccionTrabajo],
    ["Teléfono del Trabajo", customer.telefonoTrabajo],
    ["Descripción del Trabajo", customer.descripcionTrabajo],
  ]);

  addSection(doc, "INFORMACIÓN LABORAL ANTERIOR", [
    ["Nombre del Trabajo", customer.nombreTrabajoAnterior],
    ["Referencia", customer.referenciaTrabajoAnterior],
    ["Fecha de Inicio", formatDate(customer.fechaInicioTrabajoAnterior)],
    ["Dirección", customer.direccionTrabajoAnterior],
    ["Teléfono", customer.telefonoTrabajoAnterior],
  ]);

  addSection(doc, "INFORMACIÓN DE ESTUDIOS", [
    ["Lugar de Estudio", customer.lugarEstudio],
    ["Carrera", customer.carreraEstudio],
    ["Fecha de Inicio", formatDate(customer.fechaInicioEstudio)],
    ["Fecha de Fin", formatDate(customer.fechaFinEstudio)],
    ["Dirección", customer.direccionEstudio],
    ["Teléfono", customer.telefonoEstudio],
  ]);

  addSection(doc, "INFORMACIÓN DE VIAJE Y CONTACTO EN USA", [
    ["Fecha Tentativa de Viaje", formatDate(customer.fechaTentativaViaje)],
    ["Nombre del Contacto", customer.nombreContactoUSA],
    ["Dirección del Contacto", customer.direccionContactoUSA],
    ["Teléfono del Contacto", customer.telefonoContactoUSA],
    ["Email del Contacto", customer.emailContactoUSA],
  ]);

  // Llamada final para asegurar el footer en la última página
  addFooter(doc);

  // ======================================================
  //                    GUARDAR EL DOCUMENTO
  // ======================================================
  doc.save(`Ficha-${customer.nombres}_${customer.apellidos}.pdf`);
};
