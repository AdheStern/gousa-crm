CREATE TABLE "familia_clientes" (
	"id" serial PRIMARY KEY NOT NULL,
	"familia_id" integer NOT NULL,
	"cliente_id" integer NOT NULL,
	"parentesco" varchar(100),
	"fecha_creacion" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "familias" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(255) NOT NULL,
	"descripcion" text,
	"fecha_creacion" timestamp DEFAULT now() NOT NULL,
	"fecha_modificacion" timestamp DEFAULT now() NOT NULL,
	"fecha_eliminacion" timestamp
);
--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "nacionalidad" varchar(100);--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "facebook" varchar(255);--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "instagram" varchar(255);--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "nombre_padre" varchar(255);--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "fecha_nacimiento_padre" date;--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "nombre_madre" varchar(255);--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "fecha_nacimiento_madre" date;--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "lugar_trabajo" varchar(255);--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "descripcion_trabajo" text;--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "fecha_contratacion" date;--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "direccion_trabajo" text;--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "cargo_trabajo" varchar(255);--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "telefono_trabajo" varchar(50);--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "percepcion_salarial" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "referencia_trabajo_anterior" text;--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "nombre_trabajo_anterior" varchar(255);--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "telefono_trabajo_anterior" varchar(50);--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "direccion_trabajo_anterior" text;--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "fecha_inicio_trabajo_anterior" date;--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "fecha_inicio_trabajo_actual" date;--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "lugar_estudio" varchar(255);--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "carrera_estudio" varchar(255);--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "direccion_estudio" text;--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "telefono_estudio" varchar(50);--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "fecha_inicio_estudio" date;--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "fecha_fin_estudio" date;--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "fecha_tentativa_viaje" date;--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "nombre_contacto_usa" varchar(255);--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "direccion_contacto_usa" text;--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "telefono_contacto_usa" varchar(50);--> statement-breakpoint
ALTER TABLE "clientes" ADD COLUMN "email_contacto_usa" varchar(255);--> statement-breakpoint
ALTER TABLE "familia_clientes" ADD CONSTRAINT "familia_clientes_familia_id_familias_id_fk" FOREIGN KEY ("familia_id") REFERENCES "public"."familias"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "familia_clientes" ADD CONSTRAINT "familia_clientes_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE cascade ON UPDATE no action;