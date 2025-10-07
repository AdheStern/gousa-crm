ALTER TABLE "clientes" ADD COLUMN "historico_viajes" text;--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "nombre_patrocinador" varchar(255);--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "direccion_patrocinador" text;--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "telefono_patrocinador" varchar(50);--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "email_patrocinador" varchar(255);--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "trabajo_patrocinador" varchar(255);--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "fecha_inicio_trabajo_patrocinador" date;--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "percepcion_salarial_patrocinador" numeric(10, 2);