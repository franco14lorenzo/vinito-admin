CREATE TYPE "public"."faq_status" AS ENUM ('draft', 'active', 'inactive', 'deleted');

CREATE SEQUENCE public.faq_order_seq START 1;

CREATE TABLE "public"."faqs" (
  "id" BIGSERIAL PRIMARY KEY,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "status" "public"."faq_status" DEFAULT 'draft' NOT NULL,
  "order" INT NOT NULL DEFAULT nextval('public.faq_order_seq'),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "created_by" BIGINT,
  "updated_by" BIGINT,
  FOREIGN KEY ("created_by") REFERENCES "public"."admin"("id"),
  FOREIGN KEY ("updated_by") REFERENCES "public"."admin"("id")
);