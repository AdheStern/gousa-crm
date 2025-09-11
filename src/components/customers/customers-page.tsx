"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Search,
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
import { CustomerDrawer } from "./customer-drawer";
import { CustomersSkeleton } from "./customers-skeleton";
import { FamilyDrawer } from "./family-drawer";
import {
  getCustomers,
  deleteCustomer,
  getFamilias,
  deleteFamilia,
} from "@/actions/customers";
import type { Customer } from "@/types/customer";

interface Family {
  id: number;
  nombre: string;
  descripcion: string | null;
  fechaCreacion: Date;
  fechaModificacion: Date;
  fechaEliminacion: Date | null;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [familiesLoading, setFamiliesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [familySearchTerm, setFamilySearchTerm] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [familyDrawerOpen, setFamilyDrawerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<
    Customer | undefined
  >();
  const [editingFamily, setEditingFamily] = useState<Family | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [familyDeleteDialogOpen, setFamilyDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null
  );
  const [familyToDelete, setFamilyToDelete] = useState<Family | null>(null);

  const loadFamilies = async (search?: string) => {
    setFamiliesLoading(true);
    try {
      const result = await getFamilias(search);
      if (result.success) {
        setFamilies(result.data || []);
        console.log("👨‍👩‍👧‍👦 Familias cargadas:", result.data?.length || 0);
      } else {
        setFamilies([]);
        console.error("❌ Error loading families:", result.error);
      }
    } catch (error) {
      console.error("❌ Error inesperado:", error);
      setFamilies([]);
    } finally {
      setFamiliesLoading(false);
    }
  };

  // Cargar clientes
  const loadCustomers = async (search?: string) => {
    setLoading(true);
    try {
      const result = await getCustomers(search);
      if (result.success) {
        const formattedCustomers = (result.data || []).map((customer) => ({
          ...customer,
          fechaCreacion: customer.fechaCreacion.toString(),
          fechaModificacion: customer.fechaModificacion.toString(),
          fechaEliminacion: customer.fechaEliminacion?.toString() || null,
        }));
        setCustomers(formattedCustomers);
        console.log("📊 Clientes cargados:", result.data?.length || 0);
      } else {
        setCustomers([]);
        console.error("❌ Error loading customers:", result.error);
      }
    } catch (error) {
      console.error("❌ Error inesperado:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
    loadFamilies();
  }, []);

  // Filtrar clientes en tiempo real (búsqueda del lado del cliente)
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;

    const search = searchTerm.toLowerCase().trim();
    return customers.filter(
      (customer) =>
        customer.nombres.toLowerCase().includes(search) ||
        customer.apellidos.toLowerCase().includes(search) ||
        customer.numeroCi?.toLowerCase().includes(search) ||
        customer.numeroPasaporte?.toLowerCase().includes(search) ||
        customer.email?.toLowerCase().includes(search)
    );
  }, [customers, searchTerm]);

  const filteredFamilies = useMemo(() => {
    if (!familySearchTerm.trim()) return families;

    const search = familySearchTerm.toLowerCase().trim();
    return families.filter(
      (family) =>
        family.nombre.toLowerCase().includes(search) ||
        family.descripcion?.toLowerCase().includes(search)
    );
  }, [families, familySearchTerm]);

  // Manejar búsqueda
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleFamilySearch = (value: string) => {
    setFamilySearchTerm(value);
  };

  // Manejar creación de nuevo cliente
  const handleNewCustomer = () => {
    setEditingCustomer(undefined);
    setDrawerOpen(true);
  };

  const handleNewFamily = () => {
    setEditingFamily(undefined);
    setFamilyDrawerOpen(true);
  };

  // Manejar edición de cliente
  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setDrawerOpen(true);
  };

  const handleEditFamily = (family: Family) => {
    setEditingFamily(family);
    setFamilyDrawerOpen(true);
  };

  // Manejar eliminación de cliente
  const handleDeleteCustomer = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteFamily = (family: Family) => {
    setFamilyToDelete(family);
    setFamilyDeleteDialogOpen(true);
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (customerToDelete) {
      const result = await deleteCustomer(customerToDelete.id);
      if (result.success) {
        await loadCustomers(searchTerm);
      }
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const confirmFamilyDelete = async () => {
    if (familyToDelete) {
      const result = await deleteFamilia(familyToDelete.id);
      if (result.success) {
        await loadFamilies(familySearchTerm);
      }
      setFamilyDeleteDialogOpen(false);
      setFamilyToDelete(null);
    }
  };

  // Manejar éxito en formulario
  const handleFormSuccess = async () => {
    await loadCustomers(searchTerm);
  };

  const handleFamilyFormSuccess = async () => {
    await loadFamilies(familySearchTerm);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Clientes</h1>
          <p className="text-muted-foreground">
            Administra tu base de datos de clientes y grupos familiares para
            trámites de visa
          </p>
        </div>
      </div>

      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="families">Grupos Familiares</TabsTrigger>
        </TabsList>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre, CI, pasaporte o email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              {searchTerm && (
                <Button
                  variant="outline"
                  onClick={() => handleSearch("")}
                  size="sm"
                >
                  Limpiar
                </Button>
              )}
            </div>
            <Button onClick={handleNewCustomer}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </Button>
          </div>

          {/* Estadísticas de clientes */}
          <div className="flex items-center text-sm text-muted-foreground">
            <span>
              {searchTerm
                ? `${filteredCustomers.length} de ${customers.length} clientes`
                : `${customers.length} clientes en total`}
            </span>
          </div>

          {/* Tabla de clientes */}
          {loading ? (
            <CustomersSkeleton />
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre Completo</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>CI/Pasaporte</TableHead>
                    <TableHead>Estado Civil</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Fecha de Creación</TableHead>
                    <TableHead className="w-[70px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {searchTerm ? (
                            <>
                              No se encontraron clientes que coincidan con "
                              {searchTerm}".{" "}
                              <Button
                                variant="link"
                                onClick={() => handleSearch("")}
                                className="p-0"
                              >
                                Limpiar búsqueda
                              </Button>
                            </>
                          ) : (
                            <>
                              No hay clientes registrados.{" "}
                              <Button
                                variant="link"
                                onClick={handleNewCustomer}
                                className="p-0"
                              >
                                Crear el primero
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          {customer.nombres} {customer.apellidos}
                        </TableCell>
                        <TableCell>{customer.email || "-"}</TableCell>
                        <TableCell>{customer.telefonoCelular || "-"}</TableCell>
                        <TableCell>
                          {customer.numeroCi || customer.numeroPasaporte || "-"}
                        </TableCell>
                        <TableCell>{customer.estadoCivil || "-"}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {customer.motivoRecoleccionDatos || "-"}
                        </TableCell>
                        <TableCell>
                          {new Date(customer.fechaCreacion).toLocaleDateString(
                            "es-ES"
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
                                onClick={() => handleEditCustomer(customer)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteCustomer(customer)}
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
          )}
        </TabsContent>

        <TabsContent value="families" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar grupos familiares..."
                  value={familySearchTerm}
                  onChange={(e) => handleFamilySearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              {familySearchTerm && (
                <Button
                  variant="outline"
                  onClick={() => handleFamilySearch("")}
                  size="sm"
                >
                  Limpiar
                </Button>
              )}
            </div>
            <Button onClick={handleNewFamily}>
              <Users className="mr-2 h-4 w-4" />
              Nuevo Grupo Familiar
            </Button>
          </div>

          {/* Estadísticas de familias */}
          <div className="flex items-center text-sm text-muted-foreground">
            <span>
              {familySearchTerm
                ? `${filteredFamilies.length} de ${families.length} grupos familiares`
                : `${families.length} grupos familiares en total`}
            </span>
          </div>

          {/* Tabla de familias */}
          {familiesLoading ? (
            <CustomersSkeleton />
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre del Grupo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Fecha de Creación</TableHead>
                    <TableHead className="w-[70px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFamilies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {familySearchTerm ? (
                            <>
                              No se encontraron grupos familiares que coincidan
                              con "{familySearchTerm}".{" "}
                              <Button
                                variant="link"
                                onClick={() => handleFamilySearch("")}
                                className="p-0"
                              >
                                Limpiar búsqueda
                              </Button>
                            </>
                          ) : (
                            <>
                              No hay grupos familiares registrados.{" "}
                              <Button
                                variant="link"
                                onClick={handleNewFamily}
                                className="p-0"
                              >
                                Crear el primero
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFamilies.map((family) => (
                      <TableRow key={family.id}>
                        <TableCell className="font-medium">
                          {family.nombre}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {family.descripcion || "-"}
                        </TableCell>
                        <TableCell>
                          {new Date(family.fechaCreacion).toLocaleDateString(
                            "es-ES"
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
                                onClick={() => handleEditFamily(family)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteFamily(family)}
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
          )}
        </TabsContent>
      </Tabs>

      {/* Drawer para crear/editar clientes */}
      <CustomerDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        customer={editingCustomer}
        onSuccess={handleFormSuccess}
      />

      <FamilyDrawer
        open={familyDrawerOpen}
        onOpenChange={setFamilyDrawerOpen}
        family={editingFamily}
        onSuccess={handleFamilyFormSuccess}
      />

      {/* Dialog de confirmación para eliminar cliente */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              cliente{" "}
              <strong>
                {customerToDelete?.nombres} {customerToDelete?.apellidos}
              </strong>{" "}
              de la base de datos.
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

      <AlertDialog
        open={familyDeleteDialogOpen}
        onOpenChange={setFamilyDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              grupo familiar <strong>{familyToDelete?.nombre}</strong> de la
              base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmFamilyDelete}
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
