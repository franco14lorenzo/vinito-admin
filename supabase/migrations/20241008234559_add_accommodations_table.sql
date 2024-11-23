CREATE TYPE "public"."accommodation_status" AS ENUM (
    'draft',
    'active',
    'inactive',
    'deleted'
);

CREATE TABLE "public"."accommodations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "status" "public"."accommodation_status" DEFAULT 'draft' NOT NULL,
  "qr_code" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "created_by" BIGINT,
  "updated_by" BIGINT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY ("created_by") REFERENCES "public"."admin"("id"),
  FOREIGN KEY ("updated_by") REFERENCES "public"."admin"("id")
);