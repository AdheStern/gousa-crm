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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, AlertCircle } from "lucide-react";
import {
  createCitasCombo,
  getTiposCita,
  getFamilyMembersWithActiveTramites,
  getFamilias,
} from "@/actions/citas";
import type { TipoCita } from "@/types/cita";

// Schema de validación para citas en combo
const citaComboSchema = z.object({
  familiaId: z.number().min(1, "Debe seleccionar un grupo familiar"),
  tipoCitaId: z.number().min(1, "Debe seleccionar un tipo de cita"),
  fechaHoraInicio: z
    .string()
    .min(1, "La fecha y hora de inicio son requeridas"),
  intervalMinutos: z
    .number()
    .min(1, "El intervalo debe ser mayor a 0")
    .max(60, "El intervalo no puede ser mayor a 60 minutos"),
  lugar: z.string().optional(),
  costo: z.string().optional(),
  estadoPagoCita: z.enum(["Pendiente", "Pagado"]).optional(),
  estado: z
    .enum(["Programada", "Completada", "Cancelada", "Reprogramada"])
    .optional(),
  notas: z.string().optional(),
  clientesSeleccionados: z
    .array(z.number())
    .min(1, "Debe seleccionar al menos un cliente"),
});

interface FamilyMember {
  clienteId: number;
  clienteNombres: string;
  clienteApellidos: string;
  tramiteId: number;
  tipoTramite: string;
  estadoProceso: string;
}

interface FamilyComboFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  defaultFechaHora?: string;
}

export function FamilyComboForm({
  onSuccess,
  onCancel,
  defaultFechaHora,
}: FamilyComboFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tiposCita, setTiposCita] = useState<TipoCita[]>([]);
  const [familias, setFamilias] = useState<any[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedClientes, setSelectedClientes] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof citaComboSchema>>({
    resolver: zodResolver(citaComboSchema),
    defaultValues: {
      familiaId: 0,
      tipoCitaId: 0,
      fechaHoraInicio: defaultFechaHora || "",
      intervalMinutos: 5,
      lugar: "",
      costo: "",
      estadoPagoCita: "Pendiente",
      estado: "Programada",
      notas: "",
      clientesSeleccionados: [],
    },
  });

  const watchedValues = watch();

  // Cargar catálogos al montar el componente
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const tiposRes = await getTiposCita();
        if (tiposRes.success) setTiposCita(tiposRes.data || []);

        const familiasRes = await getFamilias();
        if (familiasRes.success) setFamilias(familiasRes.data || []);
      } catch (error) {
        console.error("Error loading catalogs:", error);
      }
    };

    loadCatalogs();
  }, []);

  // Cargar miembros de la familia cuando se selecciona una familia
  useEffect(() => {
    if (watchedValues.familiaId && watchedValues.familiaId > 0) {
      loadFamilyMembers(watchedValues.familiaId);
    } else {
      setFamilyMembers([]);
      setSelectedClientes([]);
    }
  }, [watchedValues.familiaId]);

  const loadFamilyMembers = async (familiaId: number) => {
    try {
      const result = await getFamilyMembersWithActiveTramites(familiaId);
      if (result.success) {
        setFamilyMembers(result.data || []);
        // Seleccionar todos por defecto
        const allClienteIds = (result.data || []).map(
          (member) => member.clienteId
        );
        setSelectedClientes(allClienteIds);
        setValue("clientesSeleccionados", allClienteIds);
      }
    } catch (error) {
      console.error("Error loading family members:", error);
    }
  };

  const handleClienteToggle = (clienteId: number) => {
    const newSelected = selectedClientes.includes(clienteId)
      ? selectedClientes.filter((id) => id !== clienteId)
      : [...selectedClientes, clienteId];

    setSelectedClientes(newSelected);
    setValue("clientesSeleccionados", newSelected);
  };

  const selectAllClientes = () => {
    const allIds = familyMembers.map((member) => member.clienteId);
    setSelectedClientes(allIds);
    setValue("clientesSeleccionados", allIds);
  };

  const deselectAllClientes = () => {
    setSelectedClientes([]);
    setValue("clientesSeleccionados", []);
  };

  // Calcular horarios de las citas
  const calculateAppointmentTimes = () => {
    if (!watchedValues.fechaHoraInicio || selectedClientes.length === 0)
      return [];

    const startTime = new Date(watchedValues.fechaHoraInicio);
    const interval = watchedValues.intervalMinutos || 5;

    return selectedClientes.map((clienteId, index) => {
      const member = familyMembers.find((m) => m.clienteId === clienteId);
      const appointmentTime = new Date(
        startTime.getTime() + index * interval * 60 * 1000
      );

      return {
        clienteId,
        clienteNombre: `${member?.clienteNombres} ${member?.clienteApellidos}`,
        tramiteId: member?.tramiteId,
        fechaHora: appointmentTime,
        tipoTramite: member?.tipoTramite,
      };
    });
  };

  const appointmentTimes = calculateAppointmentTimes();

  const onSubmit = async (data: z.infer<typeof citaComboSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      // Preparar datos para crear múltiples citas
      const citasData = appointmentTimes.map((appointment) => ({
        tramiteId: appointment.tramiteId!,
        tipoCitaId: data.tipoCitaId,
        fechaHora: appointment.fechaHora.toISOString(),
        lugar: data.lugar || undefined,
        costo: data.costo || undefined,
        estadoPagoCita: data.estadoPagoCita || "Pendiente",
        estado: data.estado || "Programada",
        notas: data.notas ? `${data.notas} (Cita familiar)` : "Cita familiar",
      }));

      const result = await createCitasCombo(citasData);

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Error al crear las citas");
      }
    } catch (error) {
      setError("Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">
            Citas en Combo - Grupo Familiar
          </h3>
        </div>

        {/* Selección de Familia */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="familiaId">Grupo Familiar *</Label>
            <Select
              value={watchedValues.familiaId?.toString() || "0"}
              onValueChange={(value) =>
                setValue("familiaId", Number.parseInt(value))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar grupo familiar" />
              </SelectTrigger>
              <SelectContent>
                {familias.map((familia) => (
                  <SelectItem key={familia.id} value={familia.id.toString()}>
                    {familia.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.familiaId && (
              <p className="text-sm text-red-500">{errors.familiaId.message}</p>
            )}
          </div>
        </div>

        {/* Miembros de la Familia */}
        {familyMembers.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Miembros con Trámites Activos
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllClientes}
                  >
                    Seleccionar Todos
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={deselectAllClientes}
                  >
                    Deseleccionar Todos
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {familyMembers.map((member) => (
                <div
                  key={member.clienteId}
                  className="flex items-center space-x-3 p-3 border rounded-lg"
                >
                  <Checkbox
                    checked={selectedClientes.includes(member.clienteId)}
                    onCheckedChange={() =>
                      handleClienteToggle(member.clienteId)
                    }
                  />
                  <div className="flex-1">
                    <div className="font-medium">
                      {member.clienteNombres} {member.clienteApellidos}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {member.tipoTramite} - {member.estadoProceso}
                    </div>
                  </div>
                  <Badge variant="secondary">{member.tipoTramite}</Badge>
                </div>
              ))}
              {errors.clientesSeleccionados && (
                <p className="text-sm text-red-500">
                  {errors.clientesSeleccionados.message}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Configuración de Citas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configuración de las Citas</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipoCitaId">Tipo de Cita *</Label>
              <Select
                value={watchedValues.tipoCitaId?.toString() || "0"}
                onValueChange={(value) =>
                  setValue("tipoCitaId", Number.parseInt(value))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposCita.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id.toString()}>
                      {tipo.nombreTipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipoCitaId && (
                <p className="text-sm text-red-500">
                  {errors.tipoCitaId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaHoraInicio">Fecha y Hora de Inicio *</Label>
              <Input
                id="fechaHoraInicio"
                type="datetime-local"
                {...register("fechaHoraInicio")}
              />
              {errors.fechaHoraInicio && (
                <p className="text-sm text-red-500">
                  {errors.fechaHoraInicio.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="intervalMinutos">Intervalo (minutos) *</Label>
              <Input
                id="intervalMinutos"
                type="number"
                min="1"
                max="60"
                {...register("intervalMinutos", { valueAsNumber: true })}
              />
              {errors.intervalMinutos && (
                <p className="text-sm text-red-500">
                  {errors.intervalMinutos.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lugar">Lugar</Label>
              <Input
                id="lugar"
                {...register("lugar")}
                placeholder="Consulado de Estados Unidos"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costo">Costo por Cita (Bs.)</Label>
              <Input
                id="costo"
                type="number"
                step="0.01"
                {...register("costo")}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estadoPagoCita">Estado de Pago</Label>
              <Select
                value={watchedValues.estadoPagoCita || "Pendiente"}
                onValueChange={(value) =>
                  setValue("estadoPagoCita", value as "Pendiente" | "Pagado")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Pagado">Pagado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado de las Citas</Label>
              <Select
                value={watchedValues.estado || "Programada"}
                onValueChange={(value) =>
                  setValue(
                    "estado",
                    value as
                      | "Programada"
                      | "Completada"
                      | "Cancelada"
                      | "Reprogramada"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Programada">Programada</SelectItem>
                  <SelectItem value="Completada">Completada</SelectItem>
                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                  <SelectItem value="Reprogramada">Reprogramada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Vista Previa de Horarios */}
        {appointmentTimes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Vista Previa de Horarios ({appointmentTimes.length} citas)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {appointmentTimes.map((appointment, index) => (
                  <div
                    key={appointment.clienteId}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded"
                  >
                    <div>
                      <span className="font-medium">
                        {appointment.clienteNombre}
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({appointment.tipoTramite})
                      </span>
                    </div>
                    <Badge variant="outline">
                      {appointment.fechaHora.toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Notas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Notas Adicionales</h3>
          <div className="space-y-2">
            <Label htmlFor="notas">Observaciones</Label>
            <Textarea
              id="notas"
              {...register("notas")}
              placeholder="Notas adicionales para todas las citas..."
              rows={3}
            />
          </div>
        </div>

        {/* Advertencia */}
        {selectedClientes.length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">
                Se crearán {selectedClientes.length} citas:
              </p>
              <p>
                Desde{" "}
                {watchedValues.fechaHoraInicio &&
                  new Date(watchedValues.fechaHoraInicio).toLocaleString(
                    "es-ES"
                  )}{" "}
                con intervalos de {watchedValues.intervalMinutos} minutos.
              </p>
            </div>
          </div>
        )}

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
          <Button
            type="submit"
            disabled={isLoading || selectedClientes.length === 0}
          >
            {isLoading
              ? "Creando Citas..."
              : `Crear ${selectedClientes.length} Citas`}
          </Button>
        </div>
      </form>
    </div>
  );
}
