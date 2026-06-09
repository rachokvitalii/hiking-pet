CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
ALTER TABLE "routes" ADD COLUMN "embedding" vector(1536);--> statement-breakpoint
ALTER TABLE "routes" ADD COLUMN "embedding_model" varchar(128);--> statement-breakpoint
ALTER TABLE "routes" ADD COLUMN "embedding_source_hash" varchar(64);--> statement-breakpoint
ALTER TABLE "routes" ADD COLUMN "embedding_updated_at" timestamp;
