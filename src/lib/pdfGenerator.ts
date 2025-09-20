import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Customer } from "@/types/customer";

// Extender el tipo jsPDF para incluir autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: typeof autoTable;
    lastAutoTable: any;
  }
}

// Helper Functions
const formatDate = (dateString: string | Date | null | undefined): string => {
  if (
    !dateString ||
    (typeof dateString === "string" && dateString.trim() === "")
  ) {
    return "No especificado";
  }
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    return "Fecha inválida";
  }
};

const getValue = (value: any): string => {
  if (value === null || typeof value === "undefined") return "No especificado";
  const strValue = String(value).trim();
  return strValue === "" ? "No especificado" : strValue;
};

export const generateCustomerPDF = async (customer: Customer) => {
  try {
    console.log(
      "📄 Generando PDF para cliente:",
      customer.nombres,
      customer.apellidos
    );
    console.log("📄 Datos del cliente:", customer);

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "legal", // Tamaño oficio como solicitaste
    });

    let currentY = 20;

    // HEADER
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 138); // Azul oscuro
    doc.text("GO USA CRM", 107.5, currentY, { align: "center" });

    currentY += 8;
    doc.setFontSize(16);
    doc.setTextColor(220, 38, 38); // Rojo
    doc.text("FICHA CONFIDENCIAL DE CLIENTE", 107.5, currentY, {
      align: "center",
    });

    currentY += 8;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `${getValue(customer.nombres)} ${getValue(customer.apellidos)}`,
      107.5,
      currentY,
      { align: "center" }
    );

    currentY += 5;
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Generado el: ${new Date().toLocaleDateString("es-ES")}`,
      107.5,
      currentY,
      { align: "center" }
    );

    currentY += 10;
    doc.setDrawColor(220, 220, 220);
    doc.line(20, currentY, 195, currentY);
    currentY += 10;

    // Función helper para crear tablas
    const createSection = (
      title: string,
      data: [string, string][],
      startY: number
    ) => {
      // Título de la sección
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(30, 58, 138);
      doc.text(title, 20, startY);

      const tableStartY = startY + 5;

      // Configurar autoTable correctamente
      autoTable(doc, {
        startY: tableStartY,
        head: [], // Sin cabeceras
        body: data.map(([key, value]) => [key, value]),
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 3,
          textColor: [60, 60, 60],
        },
        columnStyles: {
          0: {
            fontStyle: "bold",
            cellWidth: 60,
            fillColor: [248, 250, 252], // Gris muy claro
          },
          1: {
            cellWidth: 115,
            fillColor: [255, 255, 255], // Blanco
          },
        },
        margin: { left: 20, right: 20 },
        tableLineColor: [200, 200, 200],
        tableLineWidth: 0.5,
      });

      return (doc as any).lastAutoTable.finalY + 8;
    };

    // MOTIVO DE RECOLECCIÓN
    currentY = createSection(
      "📋 MOTIVO DE RECOLECCIÓN DE DATOS",
      [["Motivo", getValue(customer.motivoRecoleccionDatos)]],
      currentY
    );

    // INFORMACIÓN PERSONAL
    currentY = createSection(
      "👤 INFORMACIÓN PERSONAL",
      [
        ["Nombres", getValue(customer.nombres)],
        ["Apellidos", getValue(customer.apellidos)],
        ["Fecha de Nacimiento", formatDate(customer.fechaNacimiento)],
        ["Lugar de Nacimiento", getValue(customer.lugarNacimiento)],
        ["Nacionalidad", getValue(customer.nacionalidad)],
        ["Número de CI", getValue(customer.numeroCi)],
        ["Estado Civil", getValue(customer.estadoCivil)],
        ["Profesión", getValue(customer.profesion)],
      ],
      currentY
    );

    // INFORMACIÓN DE CONTACTO
    currentY = createSection(
      "📞 INFORMACIÓN DE CONTACTO",
      [
        ["Email", getValue(customer.email)],
        ["Teléfono Celular", getValue(customer.telefonoCelular)],
        ["Facebook", getValue(customer.facebook)],
        ["Instagram", getValue(customer.instagram)],
        ["Dirección Domicilio", getValue(customer.direccionDomicilio)],
      ],
      currentY
    );

    // INFORMACIÓN DE PASAPORTE
    currentY = createSection(
      "🛂 INFORMACIÓN DE PASAPORTE",
      [
        ["Número de Pasaporte", getValue(customer.numeroPasaporte)],
        ["Fecha de Emisión", formatDate(customer.pasaporteFechaEmision)],
        ["Fecha de Expiración", formatDate(customer.pasaporteFechaExpiracion)],
      ],
      currentY
    );

    // INFORMACIÓN DEL CÓNYUGE
    currentY = createSection(
      "💑 INFORMACIÓN DEL CÓNYUGE",
      [
        ["Nombre Completo", getValue(customer.conyugeNombreCompleto)],
        ["Fecha de Nacimiento", formatDate(customer.conyugeFechaNacimiento)],
        ["Lugar de Nacimiento", getValue(customer.conyugeLugarNacimiento)],
        ["Fecha de Matrimonio", formatDate(customer.matrimonioFechaInicio)],
        ["Fecha Fin Matrimonio", formatDate(customer.matrimonioFechaFin)],
      ],
      currentY
    );

    // INFORMACIÓN DE LOS PADRES
    currentY = createSection(
      "👨‍👩‍👧‍👦 INFORMACIÓN DE LOS PADRES",
      [
        ["Nombre del Padre", getValue(customer.nombrePadre)],
        ["Fecha Nacimiento Padre", formatDate(customer.fechaNacimientoPadre)],
        ["Nombre de la Madre", getValue(customer.nombreMadre)],
        ["Fecha Nacimiento Madre", formatDate(customer.fechaNacimientoMadre)],
      ],
      currentY
    );

    // INFORMACIÓN LABORAL ACTUAL
    currentY = createSection(
      "💼 INFORMACIÓN LABORAL ACTUAL",
      [
        ["Lugar de Trabajo", getValue(customer.lugarTrabajo)],
        ["Cargo", getValue(customer.cargoTrabajo)],
        ["Percepción Salarial", getValue(customer.persepcionSalarial)],
        ["Fecha de Inicio", formatDate(customer.fechaInicioTrabajoActual)],
        ["Fecha de Contratación", formatDate(customer.fechaContratacion)],
        ["Dirección del Trabajo", getValue(customer.direccionTrabajo)],
        ["Teléfono del Trabajo", getValue(customer.telefonoTrabajo)],
        ["Descripción del Trabajo", getValue(customer.descripcionTrabajo)],
      ],
      currentY
    );

    // INFORMACIÓN LABORAL ANTERIOR
    currentY = createSection(
      "📋 INFORMACIÓN LABORAL ANTERIOR",
      [
        ["Nombre del Trabajo", getValue(customer.nombreTrabajoAnterior)],
        ["Referencia", getValue(customer.referenciaTrabajoAnterior)],
        ["Fecha de Inicio", formatDate(customer.fechaInicioTrabajoAnterior)],
        ["Dirección", getValue(customer.direccionTrabajoAnterior)],
        ["Teléfono", getValue(customer.telefonoTrabajoAnterior)],
      ],
      currentY
    );

    // INFORMACIÓN DE ESTUDIOS
    currentY = createSection(
      "🎓 INFORMACIÓN DE ESTUDIOS",
      [
        ["Lugar de Estudio", getValue(customer.lugarEstudio)],
        ["Carrera", getValue(customer.carreraEstudio)],
        ["Fecha de Inicio", formatDate(customer.fechaInicioEstudio)],
        ["Fecha de Fin", formatDate(customer.fechaFinEstudio)],
        ["Dirección", getValue(customer.direccionEstudio)],
        ["Teléfono", getValue(customer.telefonoEstudio)],
      ],
      currentY
    );

    // INFORMACIÓN DE VIAJE Y CONTACTO EN USA
    currentY = createSection(
      "✈️ INFORMACIÓN DE VIAJE Y CONTACTO EN USA",
      [
        ["Fecha Tentativa de Viaje", formatDate(customer.fechaTentativaViaje)],
        ["Nombre del Contacto", getValue(customer.nombreContactoUSA)],
        ["Dirección del Contacto", getValue(customer.direccionContactoUSA)],
        ["Teléfono del Contacto", getValue(customer.telefonoContactoUSA)],
        ["Email del Contacto", getValue(customer.emailContactoUSA)],
      ],
      currentY
    );

    // INFORMACIÓN DEL SISTEMA
    createSection(
      "⚙️ INFORMACIÓN DEL SISTEMA",
      [
        ["ID del Cliente", customer.id.toString()],
        ["Fecha de Registro", formatDate(customer.fechaCreacion)],
        ["Última Modificación", formatDate(customer.fechaModificacion)],
      ],
      currentY
    );

    // FOOTER en todas las páginas
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      const footerText = `Ficha Confidencial - GO USA CRM | Generado: ${new Date().toLocaleString(
        "es-ES"
      )}`;
      const pageText = `Página ${i} de ${pageCount}`;

      doc.text(footerText, 20, doc.internal.pageSize.getHeight() - 10);
      doc.text(pageText, 195, doc.internal.pageSize.getHeight() - 10, {
        align: "right",
      });
    }

    // GUARDAR PDF
    const fileName = `Ficha_${getValue(customer.nombres)}_${getValue(
      customer.apellidos
    )}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);

    console.log("✅ PDF generado exitosamente:", fileName);
    return { success: true };
  } catch (error) {
    console.error("❌ Error al generar el PDF:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error desconocido al generar PDF",
    };
  }
};
