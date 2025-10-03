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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  createCustomer,
  updateCustomer,
  getFamilias,
  addClienteToFamilia,
  checkDuplicateCI,
} from "@/actions/customers";
import type { Customer, CreateCustomerData } from "@/types/customer";

// Schema de validación mejorado
const customerSchema = z
  .object({
    motivoRecoleccionDatos: z.string().optional(),
    familiaId: z.string().optional(),
    parentesco: z.string().optional(),

    nombres: z
      .string()
      .min(2, "Los nombres deben tener al menos 2 caracteres")
      .max(100, "Los nombres no pueden exceder 100 caracteres")
      .regex(
        /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/,
        "Los nombres solo pueden contener letras y espacios"
      ),

    apellidos: z
      .string()
      .min(2, "Los apellidos deben tener al menos 2 caracteres")
      .max(100, "Los apellidos no pueden exceder 100 caracteres")
      .regex(
        /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/,
        "Los apellidos solo pueden contener letras y espacios"
      ),

    fechaNacimiento: z
      .string()
      .optional()
      .refine((date) => {
        if (!date) return true;
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 0 && age <= 120;
      }, "La fecha de nacimiento no es válida"),

    lugarNacimiento: z.string().max(100, "Máximo 100 caracteres").optional(),
    nacionalidad: z.string().max(50, "Máximo 50 caracteres").optional(),

    numeroCi: z
      .string()
      .optional()
      .refine((val) => {
        if (!val || val.trim() === "") return true;
        return /^\d{7,10}$/.test(val);
      }, "El CI debe contener entre 7 y 10 dígitos"),

    numeroPasaporte: z
      .string()
      .optional()
      .refine((val) => {
        if (!val || val.trim() === "") return true;
        return /^[A-Z0-9]{6,12}$/i.test(val);
      }, "El pasaporte debe tener entre 6 y 12 caracteres alfanuméricos"),

    pasaporteFechaEmision: z.string().optional(),
    pasaporteFechaExpiracion: z.string().optional(),
    estadoCivil: z.string().optional(),
    profesion: z.string().max(100, "Máximo 100 caracteres").optional(),

    email: z
      .string()
      .optional()
      .refine((val) => {
        if (!val || val.trim() === "") return true;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(val);
      }, "Ingrese un email válido (ejemplo@dominio.com)"),

    telefonoCelular: z
      .string()
      .min(7, "El teléfono debe tener al menos 7 dígitos")
      .max(15, "El teléfono no puede exceder 15 dígitos")
      .regex(
        /^[\d\s\+\-\(\)]+$/,
        "El teléfono solo puede contener números, espacios, +, - y paréntesis"
      ),

    facebook: z.string().max(100, "Máximo 100 caracteres").optional(),
    instagram: z.string().max(100, "Máximo 100 caracteres").optional(),
    direccionDomicilio: z.string().max(200, "Máximo 200 caracteres").optional(),

    conyugeNombreCompleto: z
      .string()
      .max(200, "Máximo 200 caracteres")
      .optional(),
    conyugeFechaNacimiento: z.string().optional(),
    conyugeLugarNacimiento: z
      .string()
      .max(100, "Máximo 100 caracteres")
      .optional(),
    matrimonioFechaInicio: z.string().optional(),
    matrimonioFechaFin: z.string().optional(),

    nombrePadre: z.string().max(200, "Máximo 200 caracteres").optional(),
    fechaNacimientoPadre: z.string().optional(),
    nombreMadre: z.string().max(200, "Máximo 200 caracteres").optional(),
    fechaNacimientoMadre: z.string().optional(),

    lugarTrabajo: z.string().max(150, "Máximo 150 caracteres").optional(),
    descripcionTrabajo: z.string().max(500, "Máximo 500 caracteres").optional(),
    fechaContratacion: z.string().optional(),
    direccionTrabajo: z.string().max(200, "Máximo 200 caracteres").optional(),
    cargoTrabajo: z.string().max(100, "Máximo 100 caracteres").optional(),
    telefonoTrabajo: z
      .string()
      .optional()
      .refine((val) => {
        if (!val || val.trim() === "") return true;
        return /^[\d\s\+\-\(\)]+$/.test(val);
      }, "Formato de teléfono inválido"),

    persepcionSalarial: z
      .string()
      .optional()
      .refine((val) => {
        if (!val || val.trim() === "") return true;
        return /^\d+(\.\d{1,2})?$/.test(val);
      }, "Ingrese un monto válido (solo números)"),

    fechaInicioTrabajoActual: z.string().optional(),

    referenciaTrabajoAnterior: z
      .string()
      .max(150, "Máximo 150 caracteres")
      .optional(),
    nombreTrabajoAnterior: z
      .string()
      .max(150, "Máximo 150 caracteres")
      .optional(),
    telefonoTrabajoAnterior: z
      .string()
      .optional()
      .refine((val) => {
        if (!val || val.trim() === "") return true;
        return /^[\d\s\+\-\(\)]+$/.test(val);
      }, "Formato de teléfono inválido"),
    direccionTrabajoAnterior: z
      .string()
      .max(200, "Máximo 200 caracteres")
      .optional(),
    fechaInicioTrabajoAnterior: z.string().optional(),

    lugarEstudio: z.string().max(150, "Máximo 150 caracteres").optional(),
    carreraEstudio: z.string().max(150, "Máximo 150 caracteres").optional(),
    direccionEstudio: z.string().max(200, "Máximo 200 caracteres").optional(),
    telefonoEstudio: z
      .string()
      .optional()
      .refine((val) => {
        if (!val || val.trim() === "") return true;
        return /^[\d\s\+\-\(\)]+$/.test(val);
      }, "Formato de teléfono inválido"),
    fechaInicioEstudio: z.string().optional(),
    fechaFinEstudio: z.string().optional(),

    fechaTentativaViaje: z.string().optional(),
    nombreContactoUSA: z.string().max(200, "Máximo 200 caracteres").optional(),
    direccionContactoUSA: z
      .string()
      .max(300, "Máximo 300 caracteres")
      .optional(),
    telefonoContactoUSA: z
      .string()
      .optional()
      .refine((val) => {
        if (!val || val.trim() === "") return true;
        return /^[\d\s\+\-\(\)]+$/.test(val);
      }, "Formato de teléfono inválido"),

    emailContactoUSA: z
      .string()
      .optional()
      .refine((val) => {
        if (!val || val.trim() === "") return true;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(val);
      }, "Ingrese un email válido"),
  })
  .refine(
    (data) => {
      if (data.pasaporteFechaEmision && !data.numeroPasaporte) {
        return false;
      }
      return true;
    },
    {
      message:
        "Si ingresa fecha de emisión, debe ingresar el número de pasaporte",
      path: ["numeroPasaporte"],
    }
  )
  .refine(
    (data) => {
      if (data.pasaporteFechaEmision && data.pasaporteFechaExpiracion) {
        return (
          new Date(data.pasaporteFechaExpiracion) >
          new Date(data.pasaporteFechaEmision)
        );
      }
      return true;
    },
    {
      message:
        "La fecha de expiración debe ser posterior a la fecha de emisión",
      path: ["pasaporteFechaExpiracion"],
    }
  );

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
        }
      : {
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
              message: `Ya existe un cliente con el CI ${numeroCiValue}. Nombres: ${result.existingCustomer?.nombres} ${result.existingCustomer?.apellidos}`,
            });
            toast.warning("CI duplicado", {
              description: `Ya existe un cliente registrado con este CI`,
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
        toast.info("Actualizando cliente", {
          description: "Por favor espera...",
        });

        result = await updateCustomer({ id: customer.id, ...cleanedData });

        if (result.success) {
          toast.success("Cliente actualizado correctamente", {
            description: `${cleanedData.nombres} ${cleanedData.apellidos} ha sido actualizado`,
          });

          if (familiaId && familiaId !== "0" && parentesco) {
            const familyResult = await addClienteToFamilia({
              familiaId: Number.parseInt(familiaId),
              clienteId: customer.id,
              parentesco: parentesco,
            });

            if (familyResult.success) {
              toast.success("Agregado al grupo familiar", {
                description:
                  "El cliente fue agregado correctamente al grupo familiar",
              });
            }
          }

          onSuccess();
        } else {
          toast.error("Error al actualizar cliente", {
            description: result.error || "Ocurrió un error inesperado",
          });
        }
      } else {
        toast.info("Creando cliente", {
          description: "Por favor espera...",
        });

        result = await createCustomer(cleanedData);

        if (result.success) {
          toast.success("Cliente creado exitosamente", {
            description: `${cleanedData.nombres} ${cleanedData.apellidos} ha sido registrado`,
            duration: 4000,
          });

          if (familiaId && familiaId !== "0" && parentesco && result.data) {
            const familyResult = await addClienteToFamilia({
              familiaId: Number.parseInt(familiaId),
              clienteId: result.data.id,
              parentesco: parentesco,
            });

            if (familyResult.success) {
              toast.success("Agregado al grupo familiar", {
                description:
                  "El cliente fue agregado correctamente al grupo familiar",
              });
            }
          }

          onSuccess();
        } else {
          toast.error("Error al crear cliente", {
            description: result.error || "Ocurrió un error inesperado",
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error("Error inesperado:", error);
      toast.error("Error inesperado", {
        description: "Por favor intenta nuevamente o contacta al soporte",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto p-4">
      <form
        onSubmit={handleSubmit(onSubmit, (errors) => {
          const errorCount = Object.keys(errors).length;
          toast.error(
            `Formulario incompleto (${errorCount} ${
              errorCount === 1 ? "error" : "errores"
            })`,
            {
              description: "Por favor revisa los campos marcados en rojo",
            }
          );
        })}
        className="space-y-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Motivo de Recolección de Datos
            </CardTitle>
            <CardDescription>
              Especifica el propósito por el cual se recolectan los datos del
              cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="motivoRecoleccionDatos">Motivo</Label>
              <Textarea
                id="motivoRecoleccionDatos"
                {...register("motivoRecoleccionDatos")}
                placeholder="Ej: Trámite de visa de turista para Estados Unidos, procesamiento de documentos migratorios, etc."
                rows={3}
                className={
                  errors.motivoRecoleccionDatos ? "border-red-500" : ""
                }
              />
              {errors.motivoRecoleccionDatos && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  ⚠️ {errors.motivoRecoleccionDatos.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Grupo Familiar</CardTitle>
            <CardDescription>
              Asigna este cliente a un grupo familiar existente para gestionar
              citas y trámites familiares.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="familiaId">Seleccionar Grupo Familiar</Label>
                <Select
                  value={familiaIdValue || "0"}
                  onValueChange={(value) => setValue("familiaId", value)}
                  disabled={loadingFamilies}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingFamilies
                          ? "Cargando familias..."
                          : "Seleccionar familia (opcional)"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sin grupo familiar</SelectItem>
                    {families.map((family) => (
                      <SelectItem key={family.id} value={family.id.toString()}>
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
                    value={watchedValues.parentesco || "0"}
                    onValueChange={(value) => setValue("parentesco", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar parentesco" />
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información Personal</CardTitle>
            <CardDescription>
              Datos básicos de identificación del cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombres">Nombres *</Label>
                <Input
                  id="nombres"
                  {...register("nombres")}
                  placeholder="Juan Carlos"
                  className={errors.nombres ? "border-red-500" : ""}
                />
                {errors.nombres && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.nombres.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos *</Label>
                <Input
                  id="apellidos"
                  {...register("apellidos")}
                  placeholder="Pérez González"
                  className={errors.apellidos ? "border-red-500" : ""}
                />
                {errors.apellidos && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.apellidos.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  {...register("fechaNacimiento")}
                  className={errors.fechaNacimiento ? "border-red-500" : ""}
                />
                {errors.fechaNacimiento && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.fechaNacimiento.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lugarNacimiento">Lugar de Nacimiento</Label>
                <Input
                  id="lugarNacimiento"
                  {...register("lugarNacimiento")}
                  placeholder="La Paz, Bolivia"
                  className={errors.lugarNacimiento ? "border-red-500" : ""}
                />
                {errors.lugarNacimiento && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.lugarNacimiento.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nacionalidad">Nacionalidad</Label>
                <Input
                  id="nacionalidad"
                  {...register("nacionalidad")}
                  placeholder="Boliviana"
                  className={errors.nacionalidad ? "border-red-500" : ""}
                />
                {errors.nacionalidad && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.nacionalidad.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numeroCi">Número de CI</Label>
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
                  <p className="text-sm text-yellow-600">Verificando CI...</p>
                )}
                {errors.numeroCi && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.numeroCi.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="estadoCivil">Estado Civil</Label>
                <Select
                  value={estadoCivilValue}
                  onValueChange={(value) => setValue("estadoCivil", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado civil" />
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
                  placeholder="Ingeniero de Sistemas"
                  className={errors.profesion ? "border-red-500" : ""}
                />
                {errors.profesion && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.profesion.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información de Contacto</CardTitle>
            <CardDescription>
              Datos de contacto y redes sociales del cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="juan.perez@email.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefonoCelular">Teléfono Celular *</Label>
                <Input
                  id="telefonoCelular"
                  {...register("telefonoCelular")}
                  placeholder="+591 70123456"
                  className={errors.telefonoCelular ? "border-red-500" : ""}
                />
                {errors.telefonoCelular && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.telefonoCelular.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  {...register("facebook")}
                  placeholder="@usuario.facebook"
                  className={errors.facebook ? "border-red-500" : ""}
                />
                {errors.facebook && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.facebook.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  {...register("instagram")}
                  placeholder="@usuario.instagram"
                  className={errors.instagram ? "border-red-500" : ""}
                />
                {errors.instagram && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.instagram.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccionDomicilio">Dirección de Domicilio</Label>
              <Textarea
                id="direccionDomicilio"
                {...register("direccionDomicilio")}
                placeholder="Av. Ejemplo #123, Zona Central, La Paz"
                rows={2}
                className={errors.direccionDomicilio ? "border-red-500" : ""}
              />
              {errors.direccionDomicilio && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  ⚠️ {errors.direccionDomicilio.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información de Pasaporte</CardTitle>
            <CardDescription>Datos del documento de viaje</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="numeroPasaporte">Número de Pasaporte</Label>
              <Input
                id="numeroPasaporte"
                {...register("numeroPasaporte")}
                placeholder="A12345678"
                className={errors.numeroPasaporte ? "border-red-500" : ""}
              />
              {errors.numeroPasaporte && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  ⚠️ {errors.numeroPasaporte.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pasaporteFechaEmision">Fecha de Emisión</Label>
                <Input
                  id="pasaporteFechaEmision"
                  type="date"
                  {...register("pasaporteFechaEmision")}
                  className={
                    errors.pasaporteFechaEmision ? "border-red-500" : ""
                  }
                />
                {errors.pasaporteFechaEmision && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.pasaporteFechaEmision.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pasaporteFechaExpiracion">
                  Fecha de Expiración
                </Label>
                <Input
                  id="pasaporteFechaExpiracion"
                  type="date"
                  {...register("pasaporteFechaExpiracion")}
                  className={
                    errors.pasaporteFechaExpiracion ? "border-red-500" : ""
                  }
                />
                {errors.pasaporteFechaExpiracion && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.pasaporteFechaExpiracion.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información del Cónyuge</CardTitle>
            <CardDescription>Datos del cónyuge (si aplica)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="conyugeNombreCompleto">
                Nombre Completo del Cónyuge
              </Label>
              <Input
                id="conyugeNombreCompleto"
                {...register("conyugeNombreCompleto")}
                placeholder="María Elena Rodríguez"
                className={errors.conyugeNombreCompleto ? "border-red-500" : ""}
              />
              {errors.conyugeNombreCompleto && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  ⚠️ {errors.conyugeNombreCompleto.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="conyugeFechaNacimiento">
                  Fecha de Nacimiento
                </Label>
                <Input
                  id="conyugeFechaNacimiento"
                  type="date"
                  {...register("conyugeFechaNacimiento")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conyugeLugarNacimiento">
                  Lugar de Nacimiento
                </Label>
                <Input
                  id="conyugeLugarNacimiento"
                  {...register("conyugeLugarNacimiento")}
                  placeholder="Cochabamba, Bolivia"
                  className={
                    errors.conyugeLugarNacimiento ? "border-red-500" : ""
                  }
                />
                {errors.conyugeLugarNacimiento && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.conyugeLugarNacimiento.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="matrimonioFechaInicio">
                  Fecha de Matrimonio
                </Label>
                <Input
                  id="matrimonioFechaInicio"
                  type="date"
                  {...register("matrimonioFechaInicio")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="matrimonioFechaFin">
                  Fecha de Fin de Matrimonio
                </Label>
                <Input
                  id="matrimonioFechaFin"
                  type="date"
                  {...register("matrimonioFechaFin")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información de los Padres</CardTitle>
            <CardDescription>Datos de los padres del cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombrePadre">Nombre del Padre</Label>
                <Input
                  id="nombrePadre"
                  {...register("nombrePadre")}
                  placeholder="Carlos Pérez Martínez"
                  className={errors.nombrePadre ? "border-red-500" : ""}
                />
                {errors.nombrePadre && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.nombrePadre.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaNacimientoPadre">
                  Fecha de Nacimiento del Padre
                </Label>
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
                <Input
                  id="nombreMadre"
                  {...register("nombreMadre")}
                  placeholder="Ana González López"
                  className={errors.nombreMadre ? "border-red-500" : ""}
                />
                {errors.nombreMadre && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.nombreMadre.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaNacimientoMadre">
                  Fecha de Nacimiento de la Madre
                </Label>
                <Input
                  id="fechaNacimientoMadre"
                  type="date"
                  {...register("fechaNacimientoMadre")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Información Laboral Actual
            </CardTitle>
            <CardDescription>
              Datos del trabajo actual del cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lugarTrabajo">Lugar de Trabajo</Label>
                <Input
                  id="lugarTrabajo"
                  {...register("lugarTrabajo")}
                  placeholder="Empresa ABC S.A."
                  className={errors.lugarTrabajo ? "border-red-500" : ""}
                />
                {errors.lugarTrabajo && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.lugarTrabajo.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargoTrabajo">Cargo</Label>
                <Input
                  id="cargoTrabajo"
                  {...register("cargoTrabajo")}
                  placeholder="Gerente de Ventas"
                  className={errors.cargoTrabajo ? "border-red-500" : ""}
                />
                {errors.cargoTrabajo && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.cargoTrabajo.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcionTrabajo">
                Descripción del Trabajo
              </Label>
              <Textarea
                id="descripcionTrabajo"
                {...register("descripcionTrabajo")}
                placeholder="Descripción detallada de las funciones y responsabilidades"
                rows={3}
                className={errors.descripcionTrabajo ? "border-red-500" : ""}
              />
              {errors.descripcionTrabajo && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  ⚠️ {errors.descripcionTrabajo.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaContratacion">Fecha de Contratación</Label>
                <Input
                  id="fechaContratacion"
                  type="date"
                  {...register("fechaContratacion")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaInicioTrabajoActual">
                  Fecha de Inicio
                </Label>
                <Input
                  id="fechaInicioTrabajoActual"
                  type="date"
                  {...register("fechaInicioTrabajoActual")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="persepcionSalarial">Percepción Salarial</Label>
                <Input
                  id="persepcionSalarial"
                  {...register("persepcionSalarial")}
                  placeholder="5000"
                  className={errors.persepcionSalarial ? "border-red-500" : ""}
                />
                {errors.persepcionSalarial && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.persepcionSalarial.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="direccionTrabajo">Dirección del Trabajo</Label>
                <Input
                  id="direccionTrabajo"
                  {...register("direccionTrabajo")}
                  placeholder="Av. Empresarial #456"
                  className={errors.direccionTrabajo ? "border-red-500" : ""}
                />
                {errors.direccionTrabajo && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.direccionTrabajo.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefonoTrabajo">Teléfono del Trabajo</Label>
                <Input
                  id="telefonoTrabajo"
                  {...register("telefonoTrabajo")}
                  placeholder="+591 2 2345678"
                  className={errors.telefonoTrabajo ? "border-red-500" : ""}
                />
                {errors.telefonoTrabajo && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.telefonoTrabajo.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Información Laboral Anterior
            </CardTitle>
            <CardDescription>
              Datos del trabajo anterior del cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombreTrabajoAnterior">
                  Nombre del Trabajo Anterior
                </Label>
                <Input
                  id="nombreTrabajoAnterior"
                  {...register("nombreTrabajoAnterior")}
                  placeholder="Empresa XYZ Ltda."
                  className={
                    errors.nombreTrabajoAnterior ? "border-red-500" : ""
                  }
                />
                {errors.nombreTrabajoAnterior && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.nombreTrabajoAnterior.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="referenciaTrabajoAnterior">Referencia</Label>
                <Input
                  id="referenciaTrabajoAnterior"
                  {...register("referenciaTrabajoAnterior")}
                  placeholder="Juan Supervisor"
                  className={
                    errors.referenciaTrabajoAnterior ? "border-red-500" : ""
                  }
                />
                {errors.referenciaTrabajoAnterior && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.referenciaTrabajoAnterior.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="direccionTrabajoAnterior">Dirección</Label>
                <Input
                  id="direccionTrabajoAnterior"
                  {...register("direccionTrabajoAnterior")}
                  placeholder="Calle Antigua #789"
                  className={
                    errors.direccionTrabajoAnterior ? "border-red-500" : ""
                  }
                />
                {errors.direccionTrabajoAnterior && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.direccionTrabajoAnterior.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefonoTrabajoAnterior">Teléfono</Label>
                <Input
                  id="telefonoTrabajoAnterior"
                  {...register("telefonoTrabajoAnterior")}
                  placeholder="+591 2 3456789"
                  className={
                    errors.telefonoTrabajoAnterior ? "border-red-500" : ""
                  }
                />
                {errors.telefonoTrabajoAnterior && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.telefonoTrabajoAnterior.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaInicioTrabajoAnterior">
                Fecha de Inicio
              </Label>
              <Input
                id="fechaInicioTrabajoAnterior"
                type="date"
                {...register("fechaInicioTrabajoAnterior")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información de Estudios</CardTitle>
            <CardDescription>Datos académicos del cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lugarEstudio">Lugar de Estudio</Label>
                <Input
                  id="lugarEstudio"
                  {...register("lugarEstudio")}
                  placeholder="Universidad Mayor de San Andrés"
                  className={errors.lugarEstudio ? "border-red-500" : ""}
                />
                {errors.lugarEstudio && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.lugarEstudio.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="carreraEstudio">Carrera</Label>
                <Input
                  id="carreraEstudio"
                  {...register("carreraEstudio")}
                  placeholder="Ingeniería de Sistemas"
                  className={errors.carreraEstudio ? "border-red-500" : ""}
                />
                {errors.carreraEstudio && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.carreraEstudio.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="direccionEstudio">
                  Dirección del Centro de Estudios
                </Label>
                <Input
                  id="direccionEstudio"
                  {...register("direccionEstudio")}
                  placeholder="Av. Universitaria #123"
                  className={errors.direccionEstudio ? "border-red-500" : ""}
                />
                {errors.direccionEstudio && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.direccionEstudio.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefonoEstudio">Teléfono</Label>
                <Input
                  id="telefonoEstudio"
                  {...register("telefonoEstudio")}
                  placeholder="+591 2 4567890"
                  className={errors.telefonoEstudio ? "border-red-500" : ""}
                />
                {errors.telefonoEstudio && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.telefonoEstudio.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaInicioEstudio">Fecha de Inicio</Label>
                <Input
                  id="fechaInicioEstudio"
                  type="date"
                  {...register("fechaInicioEstudio")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaFinEstudio">Fecha de Fin</Label>
                <Input
                  id="fechaFinEstudio"
                  type="date"
                  {...register("fechaFinEstudio")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Información de Viaje y Contacto en USA
            </CardTitle>
            <CardDescription>
              Datos relacionados al viaje y contactos en Estados Unidos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fechaTentativaViaje">
                Fecha Tentativa de Viaje
              </Label>
              <Input
                id="fechaTentativaViaje"
                type="date"
                {...register("fechaTentativaViaje")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombreContactoUSA">
                Nombre del Contacto en USA
              </Label>
              <Input
                id="nombreContactoUSA"
                {...register("nombreContactoUSA")}
                placeholder="John Smith"
                className={errors.nombreContactoUSA ? "border-red-500" : ""}
              />
              {errors.nombreContactoUSA && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  ⚠️ {errors.nombreContactoUSA.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="direccionContactoUSA">
                  Dirección del Contacto
                </Label>
                <Input
                  id="direccionContactoUSA"
                  {...register("direccionContactoUSA")}
                  placeholder="123 Main St, New York, NY"
                  className={
                    errors.direccionContactoUSA ? "border-red-500" : ""
                  }
                />
                {errors.direccionContactoUSA && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.direccionContactoUSA.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefonoContactoUSA">
                  Teléfono del Contacto
                </Label>
                <Input
                  id="telefonoContactoUSA"
                  {...register("telefonoContactoUSA")}
                  placeholder="+1 555 123 4567"
                  className={errors.telefonoContactoUSA ? "border-red-500" : ""}
                />
                {errors.telefonoContactoUSA && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {errors.telefonoContactoUSA.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailContactoUSA">Email del Contacto</Label>
              <Input
                id="emailContactoUSA"
                type="email"
                {...register("emailContactoUSA")}
                placeholder="john.smith@email.com"
                className={errors.emailContactoUSA ? "border-red-500" : ""}
              />
              {errors.emailContactoUSA && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  ⚠️ {errors.emailContactoUSA.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4 border-t bottom-0 bg-white pb-4">
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
              ? "Actualizar Cliente"
              : "Crear Cliente"}
          </Button>
        </div>
      </form>
    </div>
  );
}
