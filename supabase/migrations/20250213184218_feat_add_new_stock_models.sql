-- Add reserved_stock column to wines
ALTER TABLE "public"."wines"
ADD COLUMN "reserved_stock" INTEGER DEFAULT 0;

-- Create stock movement type enum
CREATE TYPE "public"."stock_movement_type" AS ENUM (
    'entry',
    'out'
);

-- Create wine stock movements table
CREATE TABLE "public"."wine_stock_movements" (
    "id" BIGSERIAL PRIMARY KEY,
    "wine_id" BIGINT NOT NULL REFERENCES "public"."wines"("id"),
    "quantity" INTEGER NOT NULL,
    "type" stock_movement_type NOT NULL,
    "order_id" UUID REFERENCES "public"."orders"("id"),
    "notes" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "created_by" BIGINT REFERENCES "public"."admin"("id"),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_by" BIGINT REFERENCES "public"."admin"("id")
);

-- Create index on wine_id and type for faster queries
CREATE INDEX idx_wine_stock_movements_wine_id ON public.wine_stock_movements USING btree (wine_id);
CREATE INDEX idx_wine_stock_movements_type ON public.wine_stock_movements USING btree (type);
CREATE INDEX idx_wine_stock_movements_order_id ON public.wine_stock_movements USING btree (order_id);
