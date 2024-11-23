CREATE TYPE payment_type AS ENUM ('cash', 'non_cash');

ALTER TABLE "public"."payment_methods"
  ADD COLUMN "description" TEXT,
  ADD COLUMN "type" payment_type NOT NULL DEFAULT 'non_cash';

ALTER TABLE "public"."delivery_schedules"
  RENAME COLUMN "time_slot" TO "name";

ALTER TABLE "public"."delivery_schedules"
  RENAME COLUMN "from_time" TO "start_time";

ALTER TABLE "public"."delivery_schedules"
  RENAME COLUMN "to_time" TO "end_time";

ALTER TABLE public.customers
  DROP CONSTRAINT IF EXISTS customers_email_key;


CREATE OR REPLACE FUNCTION create_order(
  customer JSONB,
  customer_note TEXT,
  accommodation_id UUID, -- Changed from INT to UUID
  delivery_date DATE,
  delivery_schedule_id INT,
  payment_method_id INT,
  total_amount NUMERIC,
  items JSONB
)
RETURNS TABLE(order_id UUID) AS $$
DECLARE
  customer_id UUID; -- Changed from INT to UUID
  order_id UUID; -- Changed from INT to UUID
  item RECORD; -- Declare a record variable for the loop
BEGIN
  -- Insert customer
  INSERT INTO customers (id, name, surname, email, phone)
  VALUES (gen_random_uuid(), customer->>'name', customer->>'surname', customer->>'email', customer->>'phone')
  RETURNING id INTO customer_id;

  -- Insert order
  INSERT INTO orders (
    id, customer_id, customer_note, accommodation_id, delivery_date,
    delivery_schedule_id, payment_method_id, total_amount
  )
  VALUES (
    gen_random_uuid(), customer_id, customer_note, accommodation_id, delivery_date,
    delivery_schedule_id, payment_method_id, total_amount
  )
  RETURNING id INTO order_id;

  -- Insert order items and update stock
  FOR item IN SELECT * FROM jsonb_to_recordset(items) AS (
    id INT, quantity INT
  ) LOOP
    INSERT INTO order_tastings (order_id, tasting_id, quantity)
    VALUES (order_id, item.id, item.quantity);

    UPDATE tastings
    SET stock = stock - item.quantity
    WHERE id = item.id;

    IF (SELECT stock FROM tastings WHERE id = item.id) < 0 THEN
      RAISE EXCEPTION 'Insufficient stock for item %', item.id;
    END IF;
  END LOOP;

  RETURN QUERY SELECT order_id;
END;
$$ LANGUAGE plpgsql;