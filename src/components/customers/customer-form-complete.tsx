"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  createCustomer,
  updateCustomer,
  getFamilias,
  addClienteToFamilia,
  checkDuplicateCI,
} from "@/actions/customers";
import type { Customer, CreateCustomerData } from "@/types/customer";

// Schema de validación completo con nuevos campos
const customerSchema = z.object({
  motivoRecoleccionDatos: z.string().optional(),
  familiaId: z.string().optional(),
  parentesco: z.string().optional(),

  nombres: z
    .string()
    .min(2, "Los nombres deben tener al menos 2 caracteres")
    .max(100, "Máximo 100 caracteres")
    .regex(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/, "Solo letras y espacios"),

  apellidos: z
    .string()
    .min(2, "Los apellidos deben tener al menos 2 caracteres")
    .max(100, "Máximo 100 caracteres")
    .regex(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/, "Solo letras y espacios"),

  fechaNacimiento: z.string().optional(),
  lugarNacimiento: z.string().max(100, "Máximo 100 caracteres").optional(),
  nacionalidad: z.string().max(50, "Máximo 50 caracteres").optional(),

  numeroCi: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.trim() === "" || /^\d{7,10}$/.test(val),
      "CI: 7-10 dígitos"
    ),

  numeroPasaporte: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.trim() === "" || /^[A-Z0-9]{6,12}$/i.test(val),
      "Pasaporte: 6-12 caracteres"
    ),

  pasaporteFechaEmision: z.string().optional(),
  pasaporteFechaExpiracion: z.string().optional(),
  estadoCivil: z.string().optional(),
  profesion: z.string().max(100, "Máximo 100 caracteres").optional(),

  email: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        val.trim() === "" ||
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val),
      "Email inválido"
    ),

  telefonoCelular: z
    .string()
    .min(7, "Mínimo 7 dígitos")
    .max(15, "Máximo 15 dígitos")
    .regex(/^[\d\s\+\-\(\)]+$/, "Solo números, +, -, (), espacios"),

  facebook: z.string().max(100).optional(),
  instagram: z.string().max(100).optional(),
  direccionDomicilio: z.string().max(200).optional(),
  conyugeNombreCompleto: z.string().max(200).optional(),
  conyugeFechaNacimiento: z.string().optional(),
  conyugeLugarNacimiento: z.string().max(100).optional(),
  matrimonioFechaInicio: z.string().optional(),
  matrimonioFechaFin: z.string().optional(),
  nombrePadre: z.string().max(200).optional(),
  fechaNacimientoPadre: z.string().optional(),
  nombreMadre: z.string().max(200).optional(),
  fechaNacimientoMadre: z.string().optional(),
  lugarTrabajo: z.string().max(150).optional(),
  descripcionTrabajo: z.string().max(500).optional(),
  fechaContratacion: z.string().optional(),
  direccionTrabajo: z.string().max(200).optional(),
  cargoTrabajo: z.string().max(100).optional(),
  telefonoTrabajo: z.string().optional(),
  persepcionSalarial: z.string().optional(),
  fechaInicioTrabajoActual: z.string().optional(),
  referenciaTrabajoAnterior: z.string().max(150).optional(),
  nombreTrabajoAnterior: z.string().max(150).optional(),
  telefonoTrabajoAnterior: z.string().optional(),
  direccionTrabajoAnterior: z.string().max(200).optional(),
  fechaInicioTrabajoAnterior: z.string().optional(),
  lugarEstudio: z.string().max(150).optional(),
  carreraEstudio: z.string().max(150).optional(),
  direccionEstudio: z.string().max(200).optional(),
  telefonoEstudio: z.string().optional(),
  fechaInicioEstudio: z.string().optional(),
  fechaFinEstudio: z.string().optional(),
  fechaTentativaViaje: z.string().optional(),
  nombreContactoUSA: z.string().max(200).optional(),
  direccionContactoUSA: z.string().max(300).optional(),
  telefonoContactoUSA: z.string().optional(),
  emailContactoUSA: z.string().optional(),

  // Nuevos campos
  historicoViajes: z.string().optional(),
  nombrePatrocinador: z.string().max(200).optional(),
  direccionPatrocinador: z.string().max(300).optional(),
  telefonoPatrocinador: z.string().optional(),
  emailPatrocinador: z.string().optional(),
  trabajoPatrocinador: z.string().max(200).optional(),
  fechaInicioTrabajoPatrocinador: z.string().optional(),
  percepcionSalarialPatrocinador: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface Family {
  id: number;
  nombre: string;
  descripcion: string | null;
}

interface CustomerFormProps {
  customer?: Customer;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CustomerFormComplete({
  customer,
  onSuccess,
  onCancel,
}: CustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loadingFamilies, setLoadingFamilies] = useState(true);
  const [checkingCI, setCheckingCI] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    mode: "onChange",
    defaultValues: customer
      ? {
          // Valores del cliente existente
          motivoRecoleccionDatos: customer.motivoRecoleccionDatos || "",
          familiaId: "",
          parentesco: "",
          nombres: customer.nombres,
          apellidos: customer.apellidos,
          fechaNacimiento: customer.fechaNacimiento || "",
          lugarNacimiento: customer.lugarNacimiento || "",
          nacionalidad: customer.nacionalidad || "",
          numeroCi: customer.numeroCi || "",
          numeroPasaporte: customer.numeroPasaporte || "",
          pasaporteFechaEmision: customer.pasaporteFechaEmision || "",
          pasaporteFechaExpiracion: customer.pasaporteFechaExpiracion || "",
          email: customer.email || "",
          telefonoCelular: customer.telefonoCelular || "",
          facebook: customer.facebook || "",
          instagram: customer.instagram || "",
          direccionDomicilio: customer.direccionDomicilio || "",
          estadoCivil: customer.estadoCivil || "",
          profesion: customer.profesion || "",
          conyugeNombreCompleto: customer.conyugeNombreCompleto || "",
          conyugeFechaNacimiento: customer.conyugeFechaNacimiento || "",
          conyugeLugarNacimiento: customer.conyugeLugarNacimiento || "",
          matrimonioFechaInicio: customer.matrimonioFechaInicio || "",
          matrimonioFechaFin: customer.matrimonioFechaFin || "",
          nombrePadre: customer.nombrePadre || "",
          fechaNacimientoPadre: customer.fechaNacimientoPadre || "",
          nombreMadre: customer.nombreMadre || "",
          fechaNacimientoMadre: customer.fechaNacimientoMadre || "",
          lugarTrabajo: customer.lugarTrabajo || "",
          descripcionTrabajo: customer.descripcionTrabajo || "",
          fechaContratacion: customer.fechaContratacion || "",
          direccionTrabajo: customer.direccionTrabajo || "",
          cargoTrabajo: customer.cargoTrabajo || "",
          telefonoTrabajo: customer.telefonoTrabajo || "",
          persepcionSalarial: customer.persepcionSalarial || "",
          fechaInicioTrabajoActual: customer.fechaInicioTrabajoActual || "",
          referenciaTrabajoAnterior: customer.referenciaTrabajoAnterior || "",
          nombreTrabajoAnterior: customer.nombreTrabajoAnterior || "",
          telefonoTrabajoAnterior: customer.telefonoTrabajoAnterior || "",
          direccionTrabajoAnterior: customer.direccionTrabajoAnterior || "",
          fechaInicioTrabajoAnterior: customer.fechaInicioTrabajoAnterior || "",
          lugarEstudio: customer.lugarEstudio || "",
          carreraEstudio: customer.carreraEstudio || "",
          direccionEstudio: customer.direccionEstudio || "",
          telefonoEstudio: customer.telefonoEstudio || "",
          fechaInicioEstudio: customer.fechaInicioEstudio || "",
          fechaFinEstudio: customer.fechaFinEstudio || "",
          fechaTentativaViaje: customer.fechaTentativaViaje || "",
          nombreContactoUSA: customer.nombreContactoUSA || "",
          direccionContactoUSA: customer.direccionContactoUSA || "",
          telefonoContactoUSA: customer.telefonoContactoUSA || "",
          emailContactoUSA: customer.emailContactoUSA || "",
          historicoViajes: customer.historicoViajes || "",
          nombrePatrocinador: customer.nombrePatrocinador || "",
          direccionPatrocinador: customer.direccionPatrocinador || "",
          telefonoPatrocinador: customer.telefonoPatrocinador || "",
          emailPatrocinador: customer.emailPatrocinador || "",
          trabajoPatrocinador: customer.trabajoPatrocinador || "",
          fechaInicioTrabajoPatrocinador:
            customer.fechaInicioTrabajoPatrocinador || "",
          percepcionSalarialPatrocinador:
            customer.percepcionSalarialPatrocinador || "",
        }
      : {
          // Valores por defecto para nuevo cliente
          motivoRecoleccionDatos: "",
          familiaId: "",
          parentesco: "",
          nombres: "",
          apellidos: "",
          fechaNacimiento: "",
          lugarNacimiento: "",
          nacionalidad: "Boliviana",
          numeroCi: "",
          numeroPasaporte: "",
          pasaporteFechaEmision: "",
          pasaporteFechaExpiracion: "",
          email: "",
          telefonoCelular: "",
          facebook: "",
          instagram: "",
          direccionDomicilio: "",
          estadoCivil: "",
          profesion: "",
          conyugeNombreCompleto: "",
          conyugeFechaNacimiento: "",
          conyugeLugarNacimiento: "",
          matrimonioFechaInicio: "",
          matrimonioFechaFin: "",
          nombrePadre: "",
          fechaNacimientoPadre: "",
          nombreMadre: "",
          fechaNacimientoMadre: "",
          lugarTrabajo: "",
          descripcionTrabajo: "",
          fechaContratacion: "",
          direccionTrabajo: "",
          cargoTrabajo: "",
          telefonoTrabajo: "",
          persepcionSalarial: "",
          fechaInicioTrabajoActual: "",
          referenciaTrabajoAnterior: "",
          nombreTrabajoAnterior: "",
          telefonoTrabajoAnterior: "",
          direccionTrabajoAnterior: "",
          fechaInicioTrabajoAnterior: "",
          lugarEstudio: "",
          carreraEstudio: "",
          direccionEstudio: "",
          telefonoEstudio: "",
          fechaInicioEstudio: "",
          fechaFinEstudio: "",
          fechaTentativaViaje: "",
          nombreContactoUSA: "",
          direccionContactoUSA: "",
          telefonoContactoUSA: "",
          emailContactoUSA: "",
          historicoViajes: "",
          nombrePatrocinador: "",
          direccionPatrocinador: "",
          telefonoPatrocinador: "",
          emailPatrocinador: "",
          trabajoPatrocinador: "",
          fechaInicioTrabajoPatrocinador: "",
          percepcionSalarialPatrocinador: "",
        },
  });

  const watchedValues = watch();
  const estadoCivilValue = watch("estadoCivil");
  const familiaIdValue = watch("familiaId");
  const numeroCiValue = watch("numeroCi");

  useEffect(() => {
    const loadFamilies = async () => {
      setLoadingFamilies(true);
      try {
        const result = await getFamilias();
        if (result.success) {
          setFamilies(result.data || []);
        } else {
          toast.error("Error al cargar grupos familiares", {
            description: result.error,
          });
        }
      } catch (error) {
        toast.error("Error inesperado", {
          description: "No se pudieron cargar los grupos familiares",
        });
      } finally {
        setLoadingFamilies(false);
      }
    };

    loadFamilies();
  }, []);

  useEffect(() => {
    if (!customer && numeroCiValue && numeroCiValue.trim().length >= 7) {
      const checkCI = async () => {
        setCheckingCI(true);
        try {
          const result = await checkDuplicateCI(numeroCiValue);
          if (result.exists) {
            setError("numeroCi", {
              type: "manual",
              message: `Ya existe: ${result.existingCustomer?.nombres} ${result.existingCustomer?.apellidos}`,
            });
            toast.warning("CI duplicado", {
              description: `Ya registrado con este CI`,
            });
          } else {
            clearErrors("numeroCi");
          }
        } catch (error) {
          console.error("Error checking CI:", error);
        } finally {
          setCheckingCI(false);
        }
      };

      const timeoutId = setTimeout(checkCI, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [numeroCiValue, customer, setError, clearErrors]);

  const onSubmit = async (data: CustomerFormData) => {
    setIsLoading(true);

    try {
      const { familiaId, parentesco, ...customerData } = data;

      const cleanedData = Object.fromEntries(
        Object.entries(customerData).filter(
          ([_, value]) => value !== "" && value !== undefined && value !== null
        )
      ) as unknown as CreateCustomerData;

      let result;
      if (customer) {
        toast.info("Actualizando cliente...");
        result = await updateCustomer({ id: customer.id, ...cleanedData });

        if (result.success) {
          toast.success("Cliente actualizado", {
            description: `${cleanedData.nombres} ${cleanedData.apellidos}`,
          });

          if (familiaId && familiaId !== "0" && parentesco) {
            await addClienteToFamilia({
              familiaId: Number.parseInt(familiaId),
              clienteId: customer.id,
              parentesco: parentesco,
            });
          }

          onSuccess();
        } else {
          toast.error("Error al actualizar", {
            description: result.error,
          });
        }
      } else {
        toast.info("Creando cliente...");
        result = await createCustomer(cleanedData);

        if (result.success) {
          toast.success("Cliente creado", {
            description: `${cleanedData.nombres} ${cleanedData.apellidos}`,
          });

          if (familiaId && familiaId !== "0" && parentesco && result.data) {
            await addClienteToFamilia({
              familiaId: Number.parseInt(familiaId),
              clienteId: result.data.id,
              parentesco: parentesco,
            });
          }

          onSuccess();
        } else {
          toast.error("Error al crear", {
            description: result.error,
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const ErrorMessage = ({ message }: { message?: string }) =>
    message ? (
      <p className="text-sm text-red-500 flex items-center gap-1">
        ⚠️ {message}
      </p>
    ) : null;

  return (
    <div className="max-h-[80vh] overflow-y-auto p-4">
      <form
        onSubmit={handleSubmit(onSubmit, (errors) => {
          const errorCount = Object.keys(errors).length;
          toast.error(
            `${errorCount} ${errorCount === 1 ? "error" : "errores"}`,
            {
              description: "Revisa los campos en rojo",
            }
          );
        })}
        className="space-y-6"
      >
        <Accordion
          type="multiple"
          defaultValue={["item-1", "item-2"]}
          className="w-full"
        >
          {/* Motivo y Grupo Familiar */}
          <AccordionItem value="item-1">
            <AccordionTrigger>📋 Motivo y Grupo Familiar</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="motivoRecoleccionDatos">Motivo</Label>
                <Textarea
                  id="motivoRecoleccionDatos"
                  {...register("motivoRecoleccionDatos")}
                  placeholder="Ej: Trámite de visa de turista..."
                  rows={3}
                  className={
                    errors.motivoRecoleccionDatos ? "border-red-500" : ""
                  }
                />
                <ErrorMessage
                  message={errors.motivoRecoleccionDatos?.message}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="familiaId">Grupo Familiar</Label>
                  <Select
                    value={familiaIdValue || "0"}
                    onValueChange={(value) => setValue("familiaId", value)}
                    disabled={loadingFamilies}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sin grupo</SelectItem>
                      {families.map((family) => (
                        <SelectItem
                          key={family.id}
                          value={family.id.toString()}
                        >
                          {family.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {familiaIdValue && familiaIdValue !== "0" && (
                  <div className="space-y-2">
                    <Label htmlFor="parentesco">Parentesco</Label>
                    <Select
                      value={watchedValues.parentesco || ""}
                      onValueChange={(value) => setValue("parentesco", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Padre">Padre</SelectItem>
                        <SelectItem value="Madre">Madre</SelectItem>
                        <SelectItem value="Hijo/a">Hijo/a</SelectItem>
                        <SelectItem value="Cónyuge">Cónyuge</SelectItem>
                        <SelectItem value="Hermano/a">Hermano/a</SelectItem>
                        <SelectItem value="Abuelo/a">Abuelo/a</SelectItem>
                        <SelectItem value="Nieto/a">Nieto/a</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Información Personal */}
          <AccordionItem value="item-2">
            <AccordionTrigger>👤 Información Personal *</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombres">Nombres *</Label>
                  <Input
                    id="nombres"
                    {...register("nombres")}
                    placeholder="Juan Carlos"
                    className={errors.nombres ? "border-red-500" : ""}
                  />
                  <ErrorMessage message={errors.nombres?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidos">Apellidos *</Label>
                  <Input
                    id="apellidos"
                    {...register("apellidos")}
                    placeholder="Pérez González"
                    className={errors.apellidos ? "border-red-500" : ""}
                  />
                  <ErrorMessage message={errors.apellidos?.message} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha Nacimiento</Label>
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    {...register("fechaNacimiento")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lugarNacimiento">Lugar Nacimiento</Label>
                  <Input
                    id="lugarNacimiento"
                    {...register("lugarNacimiento")}
                    placeholder="La Paz, Bolivia"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nacionalidad">Nacionalidad</Label>
                  <Input
                    id="nacionalidad"
                    {...register("nacionalidad")}
                    placeholder="Boliviana"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numeroCi">CI</Label>
                  <Input
                    id="numeroCi"
                    {...register("numeroCi")}
                    placeholder="12345678"
                    className={
                      errors.numeroCi
                        ? "border-red-500"
                        : checkingCI
                        ? "border-yellow-500"
                        : ""
                    }
                  />
                  {checkingCI && (
                    <p className="text-sm text-yellow-600">Verificando...</p>
                  )}
                  <ErrorMessage message={errors.numeroCi?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estadoCivil">Estado Civil</Label>
                  <Select
                    value={estadoCivilValue}
                    onValueChange={(value) => setValue("estadoCivil", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Soltero/a">Soltero/a</SelectItem>
                      <SelectItem value="Casado/a">Casado/a</SelectItem>
                      <SelectItem value="Divorciado/a">Divorciado/a</SelectItem>
                      <SelectItem value="Viudo/a">Viudo/a</SelectItem>
                      <SelectItem value="Unión Libre">Unión Libre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profesion">Profesión</Label>
                  <Input
                    id="profesion"
                    {...register("profesion")}
                    placeholder="Ingeniero"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Información de Contacto */}
          <AccordionItem value="item-3">
            <AccordionTrigger>📞 Información de Contacto *</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="ejemplo@email.com"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  <ErrorMessage message={errors.email?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefonoCelular">Teléfono *</Label>
                  <Input
                    id="telefonoCelular"
                    {...register("telefonoCelular")}
                    placeholder="+591 70123456"
                    className={errors.telefonoCelular ? "border-red-500" : ""}
                  />
                  <ErrorMessage message={errors.telefonoCelular?.message} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    {...register("facebook")}
                    placeholder="@usuario"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    {...register("instagram")}
                    placeholder="@usuario"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccionDomicilio">Dirección</Label>
                <Textarea
                  id="direccionDomicilio"
                  {...register("direccionDomicilio")}
                  placeholder="Av. Ejemplo #123..."
                  rows={2}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Pasaporte */}
          <AccordionItem value="item-4">
            <AccordionTrigger>🛂 Pasaporte</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="numeroPasaporte">Número</Label>
                <Input
                  id="numeroPasaporte"
                  {...register("numeroPasaporte")}
                  placeholder="A12345678"
                  className={errors.numeroPasaporte ? "border-red-500" : ""}
                />
                <ErrorMessage message={errors.numeroPasaporte?.message} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pasaporteFechaEmision">Fecha Emisión</Label>
                  <Input
                    id="pasaporteFechaEmision"
                    type="date"
                    {...register("pasaporteFechaEmision")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pasaporteFechaExpiracion">
                    Fecha Expiración
                  </Label>
                  <Input
                    id="pasaporteFechaExpiracion"
                    type="date"
                    {...register("pasaporteFechaExpiracion")}
                    className={
                      errors.pasaporteFechaExpiracion ? "border-red-500" : ""
                    }
                  />
                  <ErrorMessage
                    message={errors.pasaporteFechaExpiracion?.message}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Cónyuge */}
          <AccordionItem value="item-5">
            <AccordionTrigger>💑 Información del Cónyuge</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="conyugeNombreCompleto">Nombre Completo</Label>
                <Input
                  id="conyugeNombreCompleto"
                  {...register("conyugeNombreCompleto")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="conyugeFechaNacimiento">
                    Fecha Nacimiento
                  </Label>
                  <Input
                    id="conyugeFechaNacimiento"
                    type="date"
                    {...register("conyugeFechaNacimiento")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conyugeLugarNacimiento">
                    Lugar Nacimiento
                  </Label>
                  <Input
                    id="conyugeLugarNacimiento"
                    {...register("conyugeLugarNacimiento")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="matrimonioFechaInicio">
                    Fecha Matrimonio
                  </Label>
                  <Input
                    id="matrimonioFechaInicio"
                    type="date"
                    {...register("matrimonioFechaInicio")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="matrimonioFechaFin">
                    Fecha Fin Matrimonio
                  </Label>
                  <Input
                    id="matrimonioFechaFin"
                    type="date"
                    {...register("matrimonioFechaFin")}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Padres */}
          <AccordionItem value="item-6">
            <AccordionTrigger>👨‍👩‍👧‍👦 Información de Padres</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombrePadre">Nombre del Padre</Label>
                  <Input id="nombrePadre" {...register("nombrePadre")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaNacimientoPadre">Fecha Nac. Padre</Label>
                  <Input
                    id="fechaNacimientoPadre"
                    type="date"
                    {...register("fechaNacimientoPadre")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombreMadre">Nombre de la Madre</Label>
                  <Input id="nombreMadre" {...register("nombreMadre")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaNacimientoMadre">Fecha Nac. Madre</Label>
                  <Input
                    id="fechaNacimientoMadre"
                    type="date"
                    {...register("fechaNacimientoMadre")}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Trabajo Actual */}
          <AccordionItem value="item-7">
            <AccordionTrigger>💼 Trabajo Actual</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lugarTrabajo">Lugar de Trabajo</Label>
                  <Input id="lugarTrabajo" {...register("lugarTrabajo")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargoTrabajo">Cargo</Label>
                  <Input id="cargoTrabajo" {...register("cargoTrabajo")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcionTrabajo">Descripción</Label>
                <Textarea
                  id="descripcionTrabajo"
                  {...register("descripcionTrabajo")}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaContratacion">F. Contratación</Label>
                  <Input
                    id="fechaContratacion"
                    type="date"
                    {...register("fechaContratacion")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaInicioTrabajoActual">F. Inicio</Label>
                  <Input
                    id="fechaInicioTrabajoActual"
                    type="date"
                    {...register("fechaInicioTrabajoActual")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="persepcionSalarial">Salario</Label>
                  <Input
                    id="persepcionSalarial"
                    {...register("persepcionSalarial")}
                    placeholder="5000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="direccionTrabajo">Dirección</Label>
                  <Input
                    id="direccionTrabajo"
                    {...register("direccionTrabajo")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefonoTrabajo">Teléfono</Label>
                  <Input
                    id="telefonoTrabajo"
                    {...register("telefonoTrabajo")}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Trabajo Anterior */}
          <AccordionItem value="item-8">
            <AccordionTrigger>📋 Trabajo Anterior</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombreTrabajoAnterior">Nombre</Label>
                  <Input
                    id="nombreTrabajoAnterior"
                    {...register("nombreTrabajoAnterior")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referenciaTrabajoAnterior">Referencia</Label>
                  <Input
                    id="referenciaTrabajoAnterior"
                    {...register("referenciaTrabajoAnterior")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="direccionTrabajoAnterior">Dirección</Label>
                  <Input
                    id="direccionTrabajoAnterior"
                    {...register("direccionTrabajoAnterior")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefonoTrabajoAnterior">Teléfono</Label>
                  <Input
                    id="telefonoTrabajoAnterior"
                    {...register("telefonoTrabajoAnterior")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaInicioTrabajoAnterior">Fecha Inicio</Label>
                <Input
                  id="fechaInicioTrabajoAnterior"
                  type="date"
                  {...register("fechaInicioTrabajoAnterior")}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Estudios */}
          <AccordionItem value="item-9">
            <AccordionTrigger>🎓 Estudios</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lugarEstudio">Lugar</Label>
                  <Input id="lugarEstudio" {...register("lugarEstudio")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carreraEstudio">Carrera</Label>
                  <Input id="carreraEstudio" {...register("carreraEstudio")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="direccionEstudio">Dirección</Label>
                  <Input
                    id="direccionEstudio"
                    {...register("direccionEstudio")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefonoEstudio">Teléfono</Label>
                  <Input
                    id="telefonoEstudio"
                    {...register("telefonoEstudio")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaInicioEstudio">F. Inicio</Label>
                  <Input
                    id="fechaInicioEstudio"
                    type="date"
                    {...register("fechaInicioEstudio")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaFinEstudio">F. Fin</Label>
                  <Input
                    id="fechaFinEstudio"
                    type="date"
                    {...register("fechaFinEstudio")}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Información de Viaje */}
          <AccordionItem value="item-10">
            <AccordionTrigger>✈️ Información de Viaje</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="fechaTentativaViaje">Fecha Tentativa</Label>
                <Input
                  id="fechaTentativaViaje"
                  type="date"
                  {...register("fechaTentativaViaje")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="historicoViajes">Histórico de Viajes</Label>
                <Textarea
                  id="historicoViajes"
                  {...register("historicoViajes")}
                  placeholder="Describe viajes anteriores, países visitados, fechas..."
                  rows={3}
                />
              </div>

              <h4 className="font-semibold text-sm">Contacto en USA</h4>
              <div className="space-y-2">
                <Label htmlFor="nombreContactoUSA">Nombre</Label>
                <Input
                  id="nombreContactoUSA"
                  {...register("nombreContactoUSA")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="direccionContactoUSA">Dirección</Label>
                  <Input
                    id="direccionContactoUSA"
                    {...register("direccionContactoUSA")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefonoContactoUSA">Teléfono</Label>
                  <Input
                    id="telefonoContactoUSA"
                    {...register("telefonoContactoUSA")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailContactoUSA">Email</Label>
                <Input
                  id="emailContactoUSA"
                  {...register("emailContactoUSA")}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Información del Patrocinador */}
          <AccordionItem value="item-11">
            <AccordionTrigger>🤝 Información del Patrocinador</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="nombrePatrocinador">
                  Nombre del Patrocinador
                </Label>
                <Input
                  id="nombrePatrocinador"
                  {...register("nombrePatrocinador")}
                  placeholder="Nombre completo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailPatrocinador">Email</Label>
                  <Input
                    id="emailPatrocinador"
                    {...register("emailPatrocinador")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefonoPatrocinador">Teléfono</Label>
                  <Input
                    id="telefonoPatrocinador"
                    {...register("telefonoPatrocinador")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccionPatrocinador">Dirección</Label>
                <Textarea
                  id="direccionPatrocinador"
                  {...register("direccionPatrocinador")}
                  rows={2}
                />
              </div>

              <h4 className="font-semibold text-sm pt-2">
                Información Laboral del Patrocinador
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trabajoPatrocinador">Lugar de Trabajo</Label>
                  <Input
                    id="trabajoPatrocinador"
                    {...register("trabajoPatrocinador")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaInicioTrabajoPatrocinador">
                    Fecha Inicio
                  </Label>
                  <Input
                    id="fechaInicioTrabajoPatrocinador"
                    type="date"
                    {...register("fechaInicioTrabajoPatrocinador")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="percepcionSalarialPatrocinador">
                  Percepción Salarial
                </Label>
                <Input
                  id="percepcionSalarialPatrocinador"
                  {...register("percepcionSalarialPatrocinador")}
                  placeholder="Ej: USD 50,000"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white pb-4 dark:bg-black">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading || checkingCI}>
            {isLoading
              ? "Guardando..."
              : customer
              ? "Actualizar"
              : "Crear Cliente"}
          </Button>
        </div>
      </form>
    </div>
  );
}
