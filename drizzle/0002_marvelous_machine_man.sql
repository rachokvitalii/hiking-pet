CREATE TYPE "public"."packing_list_type" AS ENUM('hiking', 'camping', 'bike_ride');--> statement-breakpoint
CREATE TABLE "gear_catalog_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"name" varchar(128) NOT NULL,
	"sort_order" integer NOT NULL,
	"is_default" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gear_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"slug" varchar(128) NOT NULL,
	"sort_order" integer NOT NULL,
	CONSTRAINT "gear_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "packing_list_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"packing_list_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"catalog_item_id" integer,
	"name" varchar(128) NOT NULL,
	"is_checked" boolean DEFAULT false NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"note" text,
	"sort_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packing_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(128) NOT NULL,
	"type" "packing_list_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "packing_catalog_item" CASCADE;--> statement-breakpoint
DROP TABLE "packing_category" CASCADE;--> statement-breakpoint
DROP TABLE "packing_list" CASCADE;--> statement-breakpoint
DROP TABLE "packing_list_item" CASCADE;--> statement-breakpoint
ALTER TABLE "gear_catalog_items" ADD CONSTRAINT "gear_catalog_items_category_id_gear_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."gear_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packing_list_items" ADD CONSTRAINT "packing_list_items_packing_list_id_packing_lists_id_fk" FOREIGN KEY ("packing_list_id") REFERENCES "public"."packing_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packing_list_items" ADD CONSTRAINT "packing_list_items_category_id_gear_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."gear_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packing_list_items" ADD CONSTRAINT "packing_list_items_catalog_item_id_gear_catalog_items_id_fk" FOREIGN KEY ("catalog_item_id") REFERENCES "public"."gear_catalog_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packing_lists" ADD CONSTRAINT "packing_lists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gear_catalog_items_category_id_idx" ON "gear_catalog_items" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "packing_list_items_list_id_idx" ON "packing_list_items" USING btree ("packing_list_id");--> statement-breakpoint
CREATE INDEX "packing_list_items_category_id_idx" ON "packing_list_items" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "packing_lists_user_id_idx" ON "packing_lists" USING btree ("user_id");