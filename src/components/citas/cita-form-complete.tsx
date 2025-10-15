"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toZonedTime, fromZonedTime, format } from "date-fns-tz";
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
import { Separator } from "@/components/ui/separator";
import {
  createCita,
  updateCita,
  getTiposCita,
  getTramitesForSelect,
} from "@/actions/citas";
import type { Cita, CreateCitaData, TipoCita } from "@/types/cita";

const zonaBolivia = "America/La_Paz";
// Schema de validación
const citaSchema = z.object({
  tramiteId: z.number().min(1, "Debe seleccionar un trámite"),
  tipoCitaId: z.number().min(1, "Debe seleccionar un tipo de cita"),
  fechaHora: z.string().min(1, "La fecha y hora son requeridas"),
  lugar: z.string().optional(),
  costo: z.string().optional(),
  estadoPagoCita: z.enum(["Pendiente", "Pagado"]).optional(),
  estado: z
    .enum(["Programada", "Completada", "Cancelada", "Reprogramada"])
    .optional(),
  notas: z.string().optional(),
});

interface CitaFormProps {
  cita?: Cita;
  onSuccess: () => void;
  onCancel: () => void;
  defaultTramiteId?: number;
  defaultFechaHora?: string;
}

export function CitaFormComplete({
  cita,
  onSuccess,
  onCancel,
  defaultTramiteId,
  defaultFechaHora,
}: CitaFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para los catálogos
  const [tiposCita, setTiposCita] = useState<TipoCita[]>([]);
  const [tramites, setTramites] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateCitaData>({
    resolver: zodResolver(citaSchema),
    defaultValues: cita
      ? {
          tramiteId: cita.tramiteId,
          tipoCitaId: cita.tipoCitaId,
          fechaHora: cita
            ? format(
                toZonedTime(new Date(cita.fechaHora), zonaBolivia),
                "yyyy-MM-dd'T'HH:mm"
              )
            : defaultFechaHora || "",
          lugar: cita.lugar || "",
          costo: cita.costo || "",
          estadoPagoCita: cita.estadoPagoCita || "Pendiente",
          estado: cita.estado || "Programada",
          notas: cita.notas || "",
        }
      : {
          tramiteId: defaultTramiteId || 0,
          tipoCitaId: 0,
          fechaHora: defaultFechaHora || "",
          lugar: "",
          costo: "",
          estadoPagoCita: "Pendiente",
          estado: "Programada",
          notas: "",
        },
  });

  const watchedValues = watch();

  // Cargar catálogos al montar el componente
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [tiposRes, tramitesRes] = await Promise.all([
          getTiposCita(),
          getTramitesForSelect(),
        ]);

        if (tiposRes.success) setTiposCita(tiposRes.data || []);
        if (tramitesRes.success) setTramites(tramitesRes.data || []);
      } catch (error) {
        console.error("Error loading catalogs:", error);
      }
    };

    loadCatalogs();
  }, []);

  const onSubmit = async (data: CreateCitaData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Limpiar campos vacíos
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== "" && value !== 0)
      ) as CreateCitaData;
      if (cleanedData.fechaHora) {
        const localDate = new Date(cleanedData.fechaHora);
        cleanedData.fechaHora = fromZonedTime(
          localDate,
          zonaBolivia
        ).toISOString();
      }
      let result;
      if (cita) {
        result = await updateCita({ id: cita.id, ...cleanedData });
      } else {
        result = await createCita(cleanedData);
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información Básica de la Cita */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Información de la Cita</h3>

          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="tramiteId">Trámite *</Label>
              <Select
                value={watchedValues.tramiteId?.toString() || "0"}
                onValueChange={(value) =>
                  setValue("tramiteId", Number.parseInt(value))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar trámite" />
                </SelectTrigger>
                <SelectContent>
                  {tramites.map((tramite) => (
                    <SelectItem key={tramite.id} value={tramite.id.toString()}>
                      {tramite.clienteNombres} {tramite.clienteApellidos} -{" "}
                      {tramite.tipoTramite}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tramiteId && (
                <p className="text-sm text-red-500">
                  {errors.tramiteId.message}
                </p>
              )}
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaHora">Fecha y Hora *</Label>
              <Input
                id="fechaHora"
                type="datetime-local"
                {...register("fechaHora")}
              />
              {errors.fechaHora && (
                <p className="text-sm text-red-500">
                  {errors.fechaHora.message}
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
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="costo">Costo (Bs.)</Label>
              <Input
                id="costo"
                type="number"
                step="0.01"
                {...register("costo")}
                placeholder="0.00"
              />
            </div>

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
              <Label htmlFor="estado">Estado de la Cita</Label>
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

        <Separator />

        {/* Notas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Notas Adicionales</h3>
          <div className="space-y-2">
            <Label htmlFor="notas">Observaciones</Label>
            <Textarea
              id="notas"
              {...register("notas")}
              placeholder="Notas adicionales sobre la cita..."
              rows={4}
            />
          </div>
        </div>

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
              : cita
              ? "Actualizar Cita"
              : "Crear Cita"}
          </Button>
        </div>
      </form>
    </div>
  );
}
