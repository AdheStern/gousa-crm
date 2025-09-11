"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
} from "@/actions/customers";
import type { Customer, CreateCustomerData } from "@/types/customer";

const customerSchema = z.object({
  // Motivo de recolección (moved to top)
  motivoRecoleccionDatos: z.string().optional(),

  familiaId: z.string().optional(),
  parentesco: z.string().optional(),

  nombres: z.string().min(1, "Los nombres son requeridos"),
  apellidos: z.string().min(1, "Los apellidos son requeridos"),
  fechaNacimiento: z.string().optional(),
  lugarNacimiento: z.string().optional(),
  nacionalidad: z.string().optional(),
  numeroCi: z.string().optional(),
  numeroPasaporte: z.string().optional(),
  pasaporteFechaEmision: z.string().optional(),
  pasaporteFechaExpiracion: z.string().optional(),
  estadoCivil: z.string().optional(),
  profesion: z.string().optional(),

  // Información de contacto
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefonoCelular: z.string().min(1, "El teléfono celular es requerido"),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  direccionDomicilio: z.string().optional(),

  // Información del cónyuge
  conyugeNombreCompleto: z.string().optional(),
  conyugeFechaNacimiento: z.string().optional(),
  conyugeLugarNacimiento: z.string().optional(),
  matrimonioFechaInicio: z.string().optional(),
  matrimonioFechaFin: z.string().optional(),

  // Información de padres
  nombrePadre: z.string().optional(),
  fechaNacimientoPadre: z.string().optional(),
  nombreMadre: z.string().optional(),
  fechaNacimientoMadre: z.string().optional(),

  // Información laboral actual
  lugarTrabajo: z.string().optional(),
  descripcionTrabajo: z.string().optional(),
  fechaContratacion: z.string().optional(),
  direccionTrabajo: z.string().optional(),
  cargoTrabajo: z.string().optional(),
  telefonoTrabajo: z.string().optional(),
  persepcionSalarial: z.string().optional(),
  fechaInicioTrabajoActual: z.string().optional(),

  // Información laboral anterior
  referenciaTrabajoAnterior: z.string().optional(),
  nombreTrabajoAnterior: z.string().optional(),
  telefonoTrabajoAnterior: z.string().optional(),
  direccionTrabajoAnterior: z.string().optional(),
  fechaInicioTrabajoAnterior: z.string().optional(),

  // Información de estudios
  lugarEstudio: z.string().optional(),
  carreraEstudio: z.string().optional(),
  direccionEstudio: z.string().optional(),
  telefonoEstudio: z.string().optional(),
  fechaInicioEstudio: z.string().optional(),
  fechaFinEstudio: z.string().optional(),

  // Información de viaje y contacto en USA
  fechaTentativaViaje: z.string().optional(),
  nombreContactoUSA: z.string().optional(),
  direccionContactoUSA: z.string().optional(),
  telefonoContactoUSA: z.string().optional(),
  emailContactoUSA: z
    .string()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
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
  const [error, setError] = useState<string | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loadingFamilies, setLoadingFamilies] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
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

  useEffect(() => {
    const loadFamilies = async () => {
      setLoadingFamilies(true);
      try {
        const result = await getFamilias();
        if (result.success) {
          setFamilies(result.data || []);
        }
      } catch (error) {
        console.error("Error loading families:", error);
      } finally {
        setLoadingFamilies(false);
      }
    };

    loadFamilies();
  }, []);

  const onSubmit = async (data: CustomerFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { familiaId, parentesco, ...customerData } = data;

      // Limpiar campos vacíos y convertir a CreateCustomerData
      const cleanedData = Object.fromEntries(
        Object.entries(customerData).filter(
          ([_, value]) => value !== "" && value !== undefined && value !== null
        )
      ) as unknown as CreateCustomerData;

      let result;
      if (customer) {
        result = await updateCustomer({ id: customer.id, ...cleanedData });

        if (result.success && familiaId && parentesco) {
          const familyResult = await addClienteToFamilia({
            familiaId: Number.parseInt(familiaId),
            clienteId: customer.id,
            parentesco: parentesco,
          });

          if (!familyResult.success) {
            console.error(
              "Error adding customer to family:",
              familyResult.error
            );
          }
        }
      } else {
        result = await createCustomer(cleanedData);

        if (result.success && familiaId && parentesco && result.data) {
          const familyResult = await addClienteToFamilia({
            familiaId: Number.parseInt(familiaId),
            clienteId: result.data.id,
            parentesco: parentesco,
          });

          if (!familyResult.success) {
            console.error(
              "Error adding customer to family:",
              familyResult.error
            );
          }
        }
      }

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Error al procesar la solicitud");
      }
    } catch (error) {
      setError("Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
              />
              {errors.motivoRecoleccionDatos && (
                <p className="text-sm text-red-500">
                  {errors.motivoRecoleccionDatos.message}
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

              {familiaIdValue && (
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

        {/* Información Personal Básica */}
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
                />
                {errors.nombres && (
                  <p className="text-sm text-red-500">
                    {errors.nombres.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos *</Label>
                <Input
                  id="apellidos"
                  {...register("apellidos")}
                  placeholder="Pérez González"
                />
                {errors.apellidos && (
                  <p className="text-sm text-red-500">
                    {errors.apellidos.message}
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lugarNacimiento">Lugar de Nacimiento</Label>
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
                <Label htmlFor="numeroCi">Número de CI</Label>
                <Input
                  id="numeroCi"
                  {...register("numeroCi")}
                  placeholder="12345678"
                />
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
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de Contacto */}
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
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefonoCelular">Teléfono Celular *</Label>
                <Input
                  id="telefonoCelular"
                  {...register("telefonoCelular")}
                  placeholder="+591 70123456"
                />
                {errors.telefonoCelular && (
                  <p className="text-sm text-red-500">
                    {errors.telefonoCelular.message}
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  {...register("instagram")}
                  placeholder="@usuario.instagram"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccionDomicilio">Dirección de Domicilio</Label>
              <Textarea
                id="direccionDomicilio"
                {...register("direccionDomicilio")}
                placeholder="Av. Ejemplo #123, Zona Central, La Paz"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Información de Pasaporte */}
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
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pasaporteFechaEmision">Fecha de Emisión</Label>
                <Input
                  id="pasaporteFechaEmision"
                  type="date"
                  {...register("pasaporteFechaEmision")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pasaporteFechaExpiracion">
                  Fecha de Expiración
                </Label>
                <Input
                  id="pasaporteFechaExpiracion"
                  type="date"
                  {...register("pasaporteFechaExpiracion")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información Familiar - Cónyuge */}
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
              />
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
                />
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

        {/* Información Familiar - Padres */}
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
                />
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
                />
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

        {/* Información Laboral Actual */}
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargoTrabajo">Cargo</Label>
                <Input
                  id="cargoTrabajo"
                  {...register("cargoTrabajo")}
                  placeholder="Gerente de Ventas"
                />
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
              />
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
                  placeholder="Bs. 5,000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="direccionTrabajo">Dirección del Trabajo</Label>
                <Input
                  id="direccionTrabajo"
                  {...register("direccionTrabajo")}
                  placeholder="Av. Empresarial #456"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefonoTrabajo">Teléfono del Trabajo</Label>
                <Input
                  id="telefonoTrabajo"
                  {...register("telefonoTrabajo")}
                  placeholder="+591 2 2345678"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información Laboral Anterior */}
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="referenciaTrabajoAnterior">Referencia</Label>
                <Input
                  id="referenciaTrabajoAnterior"
                  {...register("referenciaTrabajoAnterior")}
                  placeholder="Juan Supervisor"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="direccionTrabajoAnterior">Dirección</Label>
                <Input
                  id="direccionTrabajoAnterior"
                  {...register("direccionTrabajoAnterior")}
                  placeholder="Calle Antigua #789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefonoTrabajoAnterior">Teléfono</Label>
                <Input
                  id="telefonoTrabajoAnterior"
                  {...register("telefonoTrabajoAnterior")}
                  placeholder="+591 2 3456789"
                />
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

        {/* Información de Estudios */}
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carreraEstudio">Carrera</Label>
                <Input
                  id="carreraEstudio"
                  {...register("carreraEstudio")}
                  placeholder="Ingeniería de Sistemas"
                />
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefonoEstudio">Teléfono</Label>
                <Input
                  id="telefonoEstudio"
                  {...register("telefonoEstudio")}
                  placeholder="+591 2 4567890"
                />
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

        {/* Información de Viaje y Contacto en USA */}
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
              />
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefonoContactoUSA">
                  Teléfono del Contacto
                </Label>
                <Input
                  id="telefonoContactoUSA"
                  {...register("telefonoContactoUSA")}
                  placeholder="+1 555 123 4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailContactoUSA">Email del Contacto</Label>
              <Input
                id="emailContactoUSA"
                type="email"
                {...register("emailContactoUSA")}
                placeholder="john.smith@email.com"
              />
              {errors.emailContactoUSA && (
                <p className="text-sm text-red-500">
                  {errors.emailContactoUSA.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error message */}
        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
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
