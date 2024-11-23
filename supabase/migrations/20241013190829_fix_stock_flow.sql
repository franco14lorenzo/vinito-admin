-- Add column 'sold' to the 'tastings' table
ALTER TABLE "public"."tastings"
ADD COLUMN "sold" INTEGER DEFAULT 0;

-- Add column 'sold' to the 'wines' table
ALTER TABLE "public"."wines"
ADD COLUMN "sold" INTEGER DEFAULT 0;

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
RETURNS TABLE(order_id UUID) AS $$
DECLARE
  customer_id UUID;
  order_id UUID;
  item RECORD;
  wine RECORD;
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

  RETURN QUERY SELECT order_id;
END;
$$ LANGUAGE plpgsql;