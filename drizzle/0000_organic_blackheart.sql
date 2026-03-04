CREATE TABLE "user_profile" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"display_name" text,
	"home_region" text,
	"experience_level" text,
	"preferred_hike_type" text,
	"max_daily_km" integer,
	"gear" jsonb
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text,
	"password" text,
	"created_at" timestamp DEFAULT now(),
	"2fa_secret" text,
	"2fa_activated" boolean DEFAULT false,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;