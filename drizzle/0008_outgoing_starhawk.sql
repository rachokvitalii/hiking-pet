CREATE TYPE "public"."experience_level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."recommendation_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."season" AS ENUM('spring', 'summer', 'autumn', 'winter');--> statement-breakpoint
CREATE TABLE "route_recommendation_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"recommendation_id" integer NOT NULL,
	"route_id" integer NOT NULL,
	"position" integer NOT NULL,
	"reason" text,
	"score" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "route_recommendations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"status" "recommendation_status" DEFAULT 'pending' NOT NULL,
	"model" varchar(128),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(128) NOT NULL,
	"title" varchar(128) NOT NULL,
	"description" text NOT NULL,
	"region" varchar(128) NOT NULL,
	"type" "trip_type"[] NOT NULL,
	"difficulty" "experience_level" NOT NULL,
	"distance_km" integer NOT NULL,
	"days" integer NOT NULL,
	"elevation_gain" integer NOT NULL,
	"seasons" "season"[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "routes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "route_recommendation_items" ADD CONSTRAINT "route_recommendation_items_recommendation_id_route_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."route_recommendations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_recommendation_items" ADD CONSTRAINT "route_recommendation_items_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_recommendations" ADD CONSTRAINT "route_recommendations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "route_recommendation_items_recommendation_id_idx" ON "route_recommendation_items" USING btree ("recommendation_id");--> statement-breakpoint
CREATE INDEX "route_recommendation_items_route_id_idx" ON "route_recommendation_items" USING btree ("route_id");--> statement-breakpoint
CREATE UNIQUE INDEX "route_recommendation_items_recommendation_route_unique" ON "route_recommendation_items" USING btree ("recommendation_id","route_id");--> statement-breakpoint
CREATE UNIQUE INDEX "route_recommendation_items_recommendation_position_unique" ON "route_recommendation_items" USING btree ("recommendation_id","position");--> statement-breakpoint
CREATE INDEX "route_recommendations_user_id_idx" ON "route_recommendations" USING btree ("user_id");