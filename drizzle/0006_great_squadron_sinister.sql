ALTER TYPE "public"."packing_list_type" RENAME TO "trip_type";--> statement-breakpoint
ALTER TABLE "user_profile" RENAME COLUMN "preferred_hike_type" TO "preferred_trip_duration";