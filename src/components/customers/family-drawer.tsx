"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createFamilia, updateFamilia } from "@/actions/customers";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Family form schema
const familyFormSchema = z.object({
  nombre: z.string().min(1, "El nombre del grupo familiar es requerido"),
  descripcion: z.string().optional(),
});

type FamilyFormData = z.infer<typeof familyFormSchema>;

interface Family {
  id: number;
  nombre: string;
  descripcion: string | null;
  fechaCreacion: Date;
  fechaModificacion: Date;
  fechaEliminacion: Date | null;
}

interface FamilyDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  family?: Family;
  onSuccess: () => void;
}

export function FamilyDrawer({
  open,
  onOpenChange,
  family,
  onSuccess,
}: FamilyDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!family;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FamilyFormData>({
    resolver: zodResolver(familyFormSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
    },
  });

  // Reset form when family changes or drawer opens/closes
  useEffect(() => {
    if (open) {
      if (family) {
        reset({
          nombre: family.nombre,
          descripcion: family.descripcion || "",
        });
      } else {
        reset({
          nombre: "",
          descripcion: "",
        });
      }
    }
  }, [family, open, reset]);

  const onSubmit = async (data: FamilyFormData) => {
    setIsSubmitting(true);
    try {
      let result;

      if (isEditing) {
        result = await updateFamilia({
          id: family.id,
          ...data,
        });
      } else {
        result = await createFamilia(data);
      }

      if (result.success) {
        console.log(
          `✅ Grupo familiar ${
            isEditing ? "actualizado" : "creado"
          } exitosamente`
        );
        onSuccess();
        onOpenChange(false);
        reset();
      } else {
        console.error(
          `❌ Error ${isEditing ? "actualizando" : "creando"} grupo familiar:`,
          result.error
        );
      }
    } catch (error) {
      console.error(`❌ Error inesperado:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Editar Grupo Familiar" : "Crear Nuevo Grupo Familiar"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Modifica la información del grupo familiar."
              : "Completa la información para crear un nuevo grupo familiar."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          {/* Información del Grupo Familiar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Información del Grupo Familiar
              </CardTitle>
              <CardDescription>
                Datos básicos del grupo familiar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Grupo Familiar *</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Familia García López"
                  {...register("nombre")}
                  className={errors.nombre ? "border-red-500" : ""}
                />
                {errors.nombre && (
                  <p className="text-sm text-red-500">
                    {errors.nombre.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Descripción opcional del grupo familiar..."
                  rows={3}
                  {...register("descripcion")}
                />
                {errors.descripcion && (
                  <p className="text-sm text-red-500">
                    {errors.descripcion.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Guardando..."
                : isEditing
                ? "Actualizar Grupo"
                : "Crear Grupo"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
