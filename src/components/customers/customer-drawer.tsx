"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
// Ensure the file exists at the specified path, or update the path if necessary
import { CustomerFormComplete } from "./customer-form-complete";
import type { Customer } from "@/types/customer";

interface CustomerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer;
  onSuccess: () => void;
}

export function CustomerDrawer({
  open,
  onOpenChange,
  customer,
  onSuccess,
}: CustomerDrawerProps) {
  const handleSuccess = () => {
    onSuccess();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-4xl">
        <SheetHeader>
          <SheetTitle>
            {customer ? "Editar Cliente" : "Nuevo Cliente"}
          </SheetTitle>
          <SheetDescription>
            {customer
              ? "Actualiza la información del cliente."
              : "Completa los datos para crear un nuevo cliente."}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <CustomerFormComplete
            customer={customer}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
