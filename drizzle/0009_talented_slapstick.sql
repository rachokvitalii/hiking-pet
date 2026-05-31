ALTER TABLE "routes" ADD COLUMN "latitude" double precision;--> statement-breakpoint
ALTER TABLE "routes" ADD COLUMN "longitude" double precision;--> statement-breakpoint
UPDATE "routes"
SET
	"latitude" = CASE "slug"
		WHEN 'hoverla-classic' THEN 48.1608
		WHEN 'pip-ivan-loop' THEN 48.0475
		WHEN 'synevyr-lakeside' THEN 48.6167
		WHEN 'gorgany-wild-camp' THEN 48.4596
		WHEN 'bakota-canyon-walk' THEN 48.585
		WHEN 'svydovets-ridge' THEN 48.2353
		WHEN 'kyiv-forest-bike' THEN 50.4477
		WHEN 'dnister-bike-camp' THEN 48.6739
		WHEN 'chornohora-skyline' THEN 48.1203
		WHEN 'lviv-weekend-hike' THEN 49.7956
	END,
	"longitude" = CASE "slug"
		WHEN 'hoverla-classic' THEN 24.5003
		WHEN 'pip-ivan-loop' THEN 24.6272
		WHEN 'synevyr-lakeside' THEN 23.6833
		WHEN 'gorgany-wild-camp' THEN 24.1052
		WHEN 'bakota-canyon-walk' THEN 26.9989
		WHEN 'svydovets-ridge' THEN 24.2442
		WHEN 'kyiv-forest-bike' THEN 30.2283
		WHEN 'dnister-bike-camp' THEN 25.7369
		WHEN 'chornohora-skyline' THEN 24.5475
		WHEN 'lviv-weekend-hike' THEN 24.0636
	END
WHERE "slug" IN (
	'hoverla-classic',
	'pip-ivan-loop',
	'synevyr-lakeside',
	'gorgany-wild-camp',
	'bakota-canyon-walk',
	'svydovets-ridge',
	'kyiv-forest-bike',
	'dnister-bike-camp',
	'chornohora-skyline',
	'lviv-weekend-hike'
);--> statement-breakpoint
ALTER TABLE "routes" ALTER COLUMN "latitude" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "routes" ALTER COLUMN "longitude" SET NOT NULL;
