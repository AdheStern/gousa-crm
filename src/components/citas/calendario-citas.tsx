"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCitasCalendario } from "@/actions/citas";
import type { CitaCalendario } from "@/types/cita";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isSameMonth,
} from "date-fns";
import { es } from "date-fns/locale";

interface CalendarioCitasProps {
  onNewCita: (fecha?: string) => void;
  onEditCita: (citaId: number) => void;
}

export function CalendarioCitas({
  onNewCita,
  onEditCita,
}: CalendarioCitasProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [citas, setCitas] = useState<CitaCalendario[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar citas del mes actual
  const loadCitas = async (fecha: Date) => {
    setLoading(true);
    try {
      const inicio = startOfMonth(fecha);
      const fin = endOfMonth(fecha);

      const result = await getCitasCalendario(
        inicio.toISOString(),
        fin.toISOString()
      );

      if (result.success) {
        setCitas((result.data as CitaCalendario[]) || []);
      }
    } catch (error) {
      console.error("Error loading citas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCitas(currentDate);
  }, [currentDate]);

  // Obtener días del calendario (incluyendo días de meses anteriores y siguientes)
  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    // Obtener el inicio y fin de la semana que contiene el primer y último día del mes
    // Configuramos que la semana comience en domingo (weekStartsOn: 0)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    // Obtener todos los días del calendario
    return eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });
  };

  const diasDelCalendario = getCalendarDays();

  // Obtener citas de un día específico
  const getCitasDelDia = (fecha: Date) => {
    return citas.filter((cita) => isSameDay(new Date(cita.start), fecha));
  };

  // Navegar meses
  const mesAnterior = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const mesSiguiente = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Crear nueva cita en fecha específica
  const handleNuevaCita = (fecha: Date) => {
    const fechaHora = format(fecha, "yyyy-MM-dd'T'09:00");
    onNewCita(fechaHora);
  };

  // Organizar días en semanas (arrays de 7 días)
  const organizarEnSemanas = (dias: Date[]) => {
    const semanas = [];
    for (let i = 0; i < dias.length; i += 7) {
      semanas.push(dias.slice(i, i + 7));
    }
    return semanas;
  };

  const semanas = organizarEnSemanas(diasDelCalendario);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Calendario de Citas</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={mesAnterior}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[150px] text-center">
              {format(currentDate, "MMMM yyyy", { locale: es })}
            </span>
            <Button variant="outline" size="sm" onClick={mesSiguiente}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Cargando calendario...</div>
        ) : (
          <div className="space-y-4">
            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-muted-foreground">
              <div>Dom</div>
              <div>Lun</div>
              <div>Mar</div>
              <div>Mié</div>
              <div>Jue</div>
              <div>Vie</div>
              <div>Sáb</div>
            </div>

            {/* Semanas del calendario */}
            <div className="space-y-2">
              {semanas.map((semana, semanaIndex) => (
                <div key={semanaIndex} className="grid grid-cols-7 gap-2">
                  {semana.map((dia) => {
                    const citasDelDia = getCitasDelDia(dia);
                    const esHoy = isSameDay(dia, new Date());
                    const esMesActual = isSameMonth(dia, currentDate);

                    return (
                      <div
                        key={dia.toISOString()}
                        className={`min-h-[100px] p-2 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                          esHoy ? "bg-primary/10 border-primary" : ""
                        } ${
                          !esMesActual
                            ? "bg-muted/30 text-muted-foreground"
                            : ""
                        }`}
                        onClick={() => handleNuevaCita(dia)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-sm ${
                              esHoy ? "font-bold text-primary" : ""
                            } ${!esMesActual ? "text-muted-foreground" : ""}`}
                          >
                            {format(dia, "d")}
                          </span>
                          {citasDelDia.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {citasDelDia.length}
                            </Badge>
                          )}
                        </div>

                        {/* Citas del día */}
                        <div className="space-y-1">
                          {citasDelDia.slice(0, 2).map((cita) => (
                            <div
                              key={cita.id}
                              className="text-xs p-1 rounded text-white cursor-pointer hover:opacity-80 transition-opacity"
                              style={{ backgroundColor: cita.backgroundColor }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditCita(cita.id);
                              }}
                            >
                              <div className="truncate">
                                {format(new Date(cita.start), "HH:mm")} -{" "}
                                {cita.extendedProps.cliente}
                              </div>
                              <div className="truncate opacity-90">
                                {cita.extendedProps.tipoCita}
                              </div>
                            </div>
                          ))}
                          {citasDelDia.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{citasDelDia.length - 2} más
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Leyenda */}
            <div className="flex flex-wrap gap-4 text-xs pt-4 border-t">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span>Programada</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span>Completada</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                <span>Cancelada</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-yellow-500"></div>
                <span>Reprogramada</span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <div className="w-3 h-3 rounded bg-muted border"></div>
                <span>Días de otros meses</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
