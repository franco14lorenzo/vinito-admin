CREATE TYPE "public"."delivery_schedule_status" AS ENUM ('draft', 'active', 'inactive', 'deleted');

CREATE TABLE "public"."delivery_schedules" (
  "id" BIGSERIAL PRIMARY KEY,
  "time_slot" TEXT NOT NULL,
  "from_time" TIME NOT NULL,
  "to_time" TIME NOT NULL,
  "status" "public"."delivery_schedule_status" NOT NULL DEFAULT 'draft',
  "created_by" BIGINT,
  "updated_by" BIGINT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY ("created_by") REFERENCES "public"."admin"("id"),
  FOREIGN KEY ("updated_by") REFERENCES "public"."admin"("id")
);

CREATE TABLE "public"."customers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "surname" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "phone" TEXT NOT NULL,
  "created_by" BIGINT,
  "updated_by" BIGINT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY ("created_by") REFERENCES "public"."admin"("id"),
  FOREIGN KEY ("updated_by") REFERENCES "public"."admin"("id")
);

CREATE TYPE "public"."payment_methods_status" AS ENUM ('draft', 'active', 'inactive', 'deleted');

CREATE TABLE "public"."payment_methods" (
  "id" BIGSERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "status" "public"."payment_methods_status" NOT NULL DEFAULT 'draft',
  "created_by" BIGINT,
  "updated_by" BIGINT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY ("created_by") REFERENCES "public"."admin"("id"),
  FOREIGN KEY ("updated_by") REFERENCES "public"."admin"("id")
);

CREATE TABLE "public"."orders" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "status" "public"."order_state" NOT NULL DEFAULT 'pending',
  "customer_id" UUID NOT NULL,
  "customer_note" TEXT NULL,
  "accommodation_id" UUID NULL,
  "delivery_date" DATE NOT NULL,
  "delivery_schedule_id" BIGINT NOT NULL,
  "payment_method_id" BIGINT NOT NULL,
  "total_amount" NUMERIC(10, 2) NOT NULL,
  "discount_amount" NUMERIC(10, 2) DEFAULT 0.00,
  "shipping_amount" NUMERIC(10, 2) DEFAULT 0.00,
  "tax_amount" NUMERIC(10, 2) DEFAULT 0.00,
  "created_by" BIGINT NULL,
  "updated_by" BIGINT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id"),
  FOREIGN KEY ("accommodation_id") REFERENCES "public"."accommodations"("id"),
  FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id"),
  FOREIGN KEY ("delivery_schedule_id") REFERENCES "public"."delivery_schedules"("id"),
  FOREIGN KEY ("created_by") REFERENCES "public"."admin"("id"),
  FOREIGN KEY ("updated_by") REFERENCES "public"."admin"("id")
);

CREATE TABLE "public"."order_tastings" (
  "order_id" UUID NOT NULL,
  "tasting_id" BIGINT NOT NULL,
  "quantity" INTEGER NOT NULL,
  FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id"),
  FOREIGN KEY ("tasting_id") REFERENCES "public"."tastings"("id"),
  PRIMARY KEY ("order_id", "tasting_id")
);