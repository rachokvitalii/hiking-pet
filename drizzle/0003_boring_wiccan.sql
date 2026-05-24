CREATE TYPE "public"."gear_category" AS ENUM('bivouac', 'kitchen', 'hygiene', 'gear', 'navigation', 'electronics', 'documents_money', 'other', 'clothing_footwear', 'first_aid', 'food');--> statement-breakpoint
ALTER TABLE "gear_categories" DROP CONSTRAINT "gear_categories_slug_unique";--> statement-breakpoint
ALTER TABLE "gear_categories" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "gear_categories" DROP COLUMN "slug";--> statement-breakpoint
ALTER TABLE "gear_categories" ADD COLUMN "key" "gear_category" NOT NULL;--> statement-breakpoint
ALTER TABLE "gear_categories" ADD CONSTRAINT "gear_categories_key_unique" UNIQUE("key");
