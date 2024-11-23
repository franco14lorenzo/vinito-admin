CREATE TYPE "public"."contact_status" AS ENUM ('unread', 'read', 'answered', 'deleted');

CREATE TABLE "public"."contacts" (
  "id" BIGSERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "message" TEXT NOT NULL,
  "status" "public"."contact_status" DEFAULT 'unread' NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);