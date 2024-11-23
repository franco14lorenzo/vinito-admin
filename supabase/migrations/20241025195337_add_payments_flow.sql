CREATE TYPE "public"."payment_status" AS ENUM ('pending', 'completed', 'failed', 'refunded');

CREATE TABLE "public"."payments" (
  "id" BIGSERIAL PRIMARY KEY,
  "order_id" UUID NOT NULL,
  "payment_method_id" INT NOT NULL,
  "amount" NUMERIC NOT NULL,
  "status" payment_status NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "created_by" BIGINT,
  "updated_by" BIGINT,
  FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id"),
  FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id"),
  FOREIGN KEY ("created_by") REFERENCES "public"."admin"("id"),
  FOREIGN KEY ("updated_by") REFERENCES "public"."admin"("id")
);

ALTER TABLE "public"."orders" ADD COLUMN "payment_id" BIGINT REFERENCES "public"."payments"("id");
ALTER TABLE "public"."orders" DROP COLUMN "payment_method_id";

DROP FUNCTION IF EXISTS create_order(
  customer JSONB,
  customer_note TEXT,
  accommodation_id UUID,
  delivery_date DATE,
  delivery_schedule_id INT,
  payment_method_id INT,
  total_amount NUMERIC,
  items JSONB
);

CREATE OR REPLACE FUNCTION create_order(
  customer JSONB,
  customer_note TEXT,
  accommodation_id UUID,
  delivery_date DATE,
  delivery_schedule_id INT,
  payment_method_id INT,
  total_amount NUMERIC,
  items JSONB
)
RETURNS TABLE(order_id UUID, payment_id BIGINT) AS $$
DECLARE
  customer_id UUID;
  order_id UUID;
  payment_id BIGINT;
  item RECORD;
  wine RECORD;
  new_payment_id BIGINT;
BEGIN
  -- Insert customer
  INSERT INTO customers (id, name, surname, email, phone)
  VALUES (gen_random_uuid(), customer->>'name', customer->>'surname', customer->>'email', customer->>'phone')
  RETURNING id INTO customer_id;

  -- Insert order
  INSERT INTO orders (
    id, customer_id, customer_note, accommodation_id, delivery_date,
    delivery_schedule_id, total_amount
  )
  VALUES (
    gen_random_uuid(), customer_id, customer_note, accommodation_id, delivery_date,
    delivery_schedule_id, total_amount
  )
  RETURNING id INTO order_id;

  -- Insert payment with status 'pending' and capture payment_id
  INSERT INTO payments (
    order_id, payment_method_id, amount, status, created_at, updated_at
  )
  VALUES (
    order_id, payment_method_id, total_amount, 'pending', NOW(), NOW()
  )
  RETURNING id INTO new_payment_id;

  -- Update order with payment_id
  UPDATE orders
  SET payment_id = new_payment_id
  WHERE orders.id = order_id;

  -- Insert order items and update stock
  FOR item IN SELECT * FROM jsonb_to_recordset(items) AS (
    id INT, quantity INT
  ) LOOP
    INSERT INTO order_tastings (order_id, tasting_id, quantity)
    VALUES (order_id, item.id, item.quantity);

    UPDATE tastings
    SET stock = stock - item.quantity
    WHERE id = item.id;

    -- Check for insufficient stock
    IF (SELECT stock FROM tastings WHERE id = item.id) < 0 THEN
      RAISE EXCEPTION 'Insufficient stock for item %', item.id;
    END IF;

    -- Update sold column
    UPDATE tastings
    SET sold = sold + item.quantity
    WHERE id = item.id;

    -- Update stock and sold for all associated wines
    FOR wine IN
      SELECT wine_id
      FROM tasting_wines
      WHERE tasting_id = item.id
    LOOP
      UPDATE wines
      SET stock = stock - item.quantity,
          sold = sold + item.quantity
      WHERE wines.id = wine.wine_id;

      -- Check for insufficient stock
      IF (SELECT stock FROM wines WHERE wines.id = wine.wine_id) < 0 THEN
        RAISE EXCEPTION 'Insufficient stock for wine %', wine.wine_id;
      END IF;
    END LOOP;
  END LOOP;

  RETURN QUERY SELECT order_id, new_payment_id;
END;
$$ LANGUAGE plpgsql;

DROP TYPE IF EXISTS payment_type CASCADE;

CREATE TYPE payment_type AS ENUM ('cash_on_delivery', 'bank_transfer');

ALTER TABLE "public"."payment_methods" 
  ADD COLUMN IF NOT EXISTS "type" payment_type DEFAULT 'cash_on_delivery';

CREATE TABLE "public"."settings" (
  "id" BIGSERIAL PRIMARY KEY,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "description" TEXT,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_by" BIGINT,
  FOREIGN KEY ("updated_by") REFERENCES "public"."admin"("id")
);