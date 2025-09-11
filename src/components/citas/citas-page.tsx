"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CitaDrawer } from "./cita-drawer";
import { CitasSkeleton } from "./citas-skeleton";
import { CitaStatusBadge } from "./cita-status-badges";
import { CalendarioCitas } from "./calendario-citas";
import { getCitas, deleteCita, getCitasStats } from "@/actions/citas";
import type { Cita } from "@/types/cita";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function CitasPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCita, setEditingCita] = useState<Cita | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [citaToDelete, setCitaToDelete] = useState<Cita | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [defaultTramiteId, setDefaultTramiteId] = useState<
    number | undefined
  >();
  const [defaultFechaHora, setDefaultFechaHora] = useState<
    string | undefined
  >();
  const [comboMode, setComboMode] = useState(false);

  const handleNewComboApointment = (fechaHora?: string) => {
    setEditingCita(undefined);
    setDefaultFechaHora(fechaHora);
    setDefaultTramiteId(undefined);
    setComboMode(true);
    setDrawerOpen(true);
  };

  // Cargar citas y estadísticas
  const loadData = async () => {
    setLoading(true);
    try {
      const [citasResult, statsResult] = await Promise.all([
        getCitas(),
        getCitasStats(),
      ]);

      if (citasResult.success) {
        setCitas(citasResult.data || []);
      }

      if (statsResult.success) {
        setStats(statsResult.data);
      }
    } catch (error) {
      console.error("❌ Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  // Filtrar citas
  const filteredCitas = useMemo(() => {
    let filtered = citas;

    // Filtro por término de búsqueda
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (cita) =>
          cita.tramite?.cliente?.nombres?.toLowerCase().includes(search) ||
          cita.tramite?.cliente?.apellidos?.toLowerCase().includes(search) ||
          cita.tipoCita?.nombreTipo?.toLowerCase().includes(search) ||
          cita.lugar?.toLowerCase().includes(search) ||
          cita.tramite?.tipoTramite?.nombreTipo?.toLowerCase().includes(search)
      );
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((cita) => {
        switch (statusFilter) {
          case "programada":
            return cita.estado?.toLowerCase() === "programada";
          case "completada":
            return cita.estado?.toLowerCase() === "completada";
          case "cancelada":
            return cita.estado?.toLowerCase() === "cancelada";
          case "reprogramada":
            return cita.estado?.toLowerCase() === "reprogramada";
          case "pago_pendiente":
            return cita.estadoPagoCita?.toLowerCase() === "pendiente";
          case "pagado":
            return cita.estadoPagoCita?.toLowerCase() === "pagado";
          default:
            return true;
        }
      });
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
    );
  }, [citas, searchTerm, statusFilter]);

  // Manejar búsqueda
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Manejar creación de nueva cita
  const handleNewCita = (fechaHora?: string, tramiteId?: number) => {
    setEditingCita(undefined);
    setDefaultFechaHora(fechaHora);
    setDefaultTramiteId(tramiteId);
    setComboMode(false);
    setDrawerOpen(true);
  };

  // Manejar edición de cita
  const handleEditCita = (cita: Cita) => {
    setEditingCita(cita);
    setDefaultFechaHora(undefined);
    setDefaultTramiteId(undefined);
    setDrawerOpen(true);
  };

  // Manejar edición desde calendario
  const handleEditCitaFromCalendar = (citaId: number) => {
    const cita = citas.find((c) => c.id === citaId);
    if (cita) {
      handleEditCita(cita);
    }
  };

  // Manejar eliminación de cita
  const handleDeleteCita = (cita: Cita) => {
    setCitaToDelete(cita);
    setDeleteDialogOpen(true);
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (citaToDelete) {
      const result = await deleteCita(citaToDelete.id);
      if (result.success) {
        await loadData();
      }
      setDeleteDialogOpen(false);
      setCitaToDelete(null);
    }
  };

  // Manejar éxito en formulario
  const handleFormSuccess = async () => {
    await loadData();
  };

  // Mostrar skeleton mientras carga
  if (loading) {
    return <CitasSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Citas</h1>
          <p className="text-muted-foreground">
            Gestiona las citas y entrevistas de tus clientes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleNewComboApointment()}>
            <Users className="mr-2 h-4 w-4" />
            Citas en Combo
          </Button>
          <Button onClick={() => handleNewCita()}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cita
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Citas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCitas}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Programadas</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.citasProgramadas}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.citasCompletadas}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pago Pendiente
              </CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.citasPendientesPago}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs para Vista de Lista y Calendario */}
      <Tabs defaultValue="lista" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lista">Vista de Lista</TabsTrigger>
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">
          {/* Filtros y búsqueda */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por cliente, tipo de cita, lugar..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="programada">Programadas</SelectItem>
                <SelectItem value="completada">Completadas</SelectItem>
                <SelectItem value="cancelada">Canceladas</SelectItem>
                <SelectItem value="reprogramada">Reprogramadas</SelectItem>
                <SelectItem value="pagado">Pagadas</SelectItem>
                <SelectItem value="pago_pendiente">Pago Pendiente</SelectItem>
              </SelectContent>
            </Select>
            {(searchTerm || statusFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  handleSearch("");
                  setStatusFilter("all");
                }}
                size="sm"
              >
                Limpiar
              </Button>
            )}
          </div>

          {/* Estadísticas de filtros */}
          <div className="flex items-center text-sm text-muted-foreground">
            <span>
              {searchTerm || statusFilter !== "all"
                ? `${filteredCitas.length} de ${citas.length} citas`
                : `${citas.length} citas en total`}
            </span>
          </div>

          {/* Tabla de citas */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo de Cita</TableHead>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Lugar</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Estado Pago</TableHead>
                  <TableHead className="w-[70px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCitas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchTerm || statusFilter !== "all" ? (
                          <>
                            No se encontraron citas que coincidan con los
                            filtros.{" "}
                            <Button
                              variant="link"
                              onClick={() => {
                                handleSearch("");
                                setStatusFilter("all");
                              }}
                              className="p-0"
                            >
                              Limpiar filtros
                            </Button>
                          </>
                        ) : (
                          <>
                            No hay citas registradas.{" "}
                            <Button
                              variant="link"
                              onClick={() => handleNewCita()}
                              className="p-0"
                            >
                              Crear la primera
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCitas.map((cita) => (
                    <TableRow key={cita.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>
                            {cita.tramite?.cliente?.nombres}{" "}
                            {cita.tramite?.cliente?.apellidos}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {cita.tramite?.tipoTramite?.nombreTipo}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{cita.tipoCita?.nombreTipo || "-"}</TableCell>
                      <TableCell>
                        <div>
                          <div>
                            {format(new Date(cita.fechaHora), "dd/MM/yyyy", {
                              locale: es,
                            })}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(cita.fechaHora), "HH:mm", {
                              locale: es,
                            })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{cita.lugar || "-"}</TableCell>
                      <TableCell>
                        {cita.estado ? (
                          <CitaStatusBadge status={cita.estado} type="estado" />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {cita.estadoPagoCita ? (
                          <CitaStatusBadge
                            status={cita.estadoPagoCita}
                            type="pago"
                          />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditCita(cita)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteCita(cita)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="calendario">
          <CalendarioCitas
            onNewCita={handleNewCita}
            onEditCita={handleEditCitaFromCalendar}
          />
        </TabsContent>
      </Tabs>

      {/* Drawer para crear/editar */}
      <CitaDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        cita={editingCita}
        onSuccess={handleFormSuccess}
        defaultTramiteId={defaultTramiteId}
        defaultFechaHora={defaultFechaHora}
        mode={comboMode ? "combo" : "single"}
      />

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              cita del cliente{" "}
              <strong>
                {citaToDelete?.tramite?.cliente?.nombres}{" "}
                {citaToDelete?.tramite?.cliente?.apellidos}
              </strong>{" "}
              programada para el{" "}
              <strong>
                {citaToDelete &&
                  format(new Date(citaToDelete.fechaHora), "dd/MM/yyyy HH:mm", {
                    locale: es,
                  })}
              </strong>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
