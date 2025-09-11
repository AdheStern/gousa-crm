"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CitaFormComplete } from "./cita-form-complete";
import { FamilyComboForm } from "./family-combo-form";
import type { Cita } from "@/types/cita";

interface CitaDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cita?: Cita;
  onSuccess: () => void;
  defaultTramiteId?: number;
  defaultFechaHora?: string;
  mode?: "single" | "combo";
}

export function CitaDrawer({
  open,
  onOpenChange,
  cita,
  onSuccess,
  defaultTramiteId,
  defaultFechaHora,
  mode = "single",
}: CitaDrawerProps) {
  const handleSuccess = () => {
    onSuccess();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>
            {mode === "combo"
              ? "Citas en Combo - Grupo Familiar"
              : cita
              ? "Editar Cita"
              : "Nueva Cita"}
          </SheetTitle>
          <SheetDescription>
            {mode === "combo"
              ? "Crea múltiples citas para los miembros de un grupo familiar con horarios consecutivos."
              : cita
              ? "Actualiza la información de la cita."
              : "Completa los datos para agendar una nueva cita."}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          {mode === "combo" ? (
            <FamilyComboForm
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              defaultFechaHora={defaultFechaHora}
            />
          ) : (
            <CitaFormComplete
              cita={cita}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              defaultTramiteId={defaultTramiteId}
              defaultFechaHora={defaultFechaHora}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
