CREATE TABLE "packing_catalog_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"key" varchar(96),
	"label" varchar(256) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packing_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(32) NOT NULL,
	"key" varchar(64) NOT NULL,
	"title" varchar(128) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packing_list" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(128) NOT NULL,
	"type" varchar(32) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packing_list_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"list_id" integer NOT NULL,
	"catalog_item_id" integer,
	"category_key" varchar(64),
	"label" varchar(256) NOT NULL,
	"checked" boolean DEFAULT false NOT NULL,
	"source" varchar(16) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"quantity" integer,
	"weight_grams" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "packing_catalog_item" ADD CONSTRAINT "packing_catalog_item_category_id_packing_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."packing_category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packing_list" ADD CONSTRAINT "packing_list_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packing_list_item" ADD CONSTRAINT "packing_list_item_list_id_packing_list_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."packing_list"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packing_list_item" ADD CONSTRAINT "packing_list_item_catalog_item_id_packing_catalog_item_id_fk" FOREIGN KEY ("catalog_item_id") REFERENCES "public"."packing_catalog_item"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "packing_catalog_item_category_idx" ON "packing_catalog_item" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "packing_catalog_item_category_key_unique" ON "packing_catalog_item" USING btree ("category_id","key");--> statement-breakpoint
CREATE INDEX "packing_category_type_idx" ON "packing_category" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "packing_category_type_key_unique" ON "packing_category" USING btree ("type","key");--> statement-breakpoint
CREATE INDEX "packing_list_user_idx" ON "packing_list" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "packing_list_item_list_idx" ON "packing_list_item" USING btree ("list_id");--> statement-breakpoint
CREATE UNIQUE INDEX "packing_list_item_list_catalog_unique" ON "packing_list_item" USING btree ("list_id","catalog_item_id");