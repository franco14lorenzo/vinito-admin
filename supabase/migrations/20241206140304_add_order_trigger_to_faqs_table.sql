CREATE TABLE IF NOT EXISTS public.faqs_reorder_lock (
    id SERIAL PRIMARY KEY, -- Added primary key
    locked boolean DEFAULT false
);

INSERT INTO public.faqs_reorder_lock (locked)
SELECT false
WHERE NOT EXISTS (SELECT 1 FROM public.faqs_reorder_lock);

CREATE OR REPLACE FUNCTION handle_faqs_order()
RETURNS TRIGGER AS $$
DECLARE
    is_locked boolean;
BEGIN

    SELECT locked INTO is_locked FROM faqs_reorder_lock LIMIT 1;
    IF is_locked THEN
        RETURN NEW;
    END IF;

    UPDATE faqs_reorder_lock SET locked = true WHERE id = 1; -- Added WHERE clause

    BEGIN
        IF (TG_OP = 'INSERT') THEN
            WITH updated_rows AS (
                SELECT id, "order"
                FROM public.faqs
                WHERE "order" >= NEW."order"
                FOR UPDATE
            )
            UPDATE public.faqs
            SET "order" = subq."order" + 1
            FROM (SELECT id, "order" FROM updated_rows) subq
            WHERE public.faqs.id = subq.id;

        ELSIF (TG_OP = 'UPDATE') AND OLD."order" <> NEW."order" THEN
            IF NEW."order" > OLD."order" THEN
                UPDATE public.faqs
                SET "order" = "order" - 1
                WHERE "order" BETWEEN OLD."order" + 1 AND NEW."order"
                AND id <> NEW.id;
            ELSE
                UPDATE public.faqs
                SET "order" = "order" + 1
                WHERE "order" BETWEEN NEW."order" AND OLD."order" - 1
                AND id <> NEW.id;
            END IF;

        ELSIF (TG_OP = 'DELETE') THEN
            UPDATE public.faqs
            SET "order" = "order" - 1
            WHERE "order" > OLD."order";
        END IF;

        UPDATE faqs_reorder_lock SET locked = false WHERE id = 1; -- Added WHERE clause
        RETURN COALESCE(NEW, OLD);
    EXCEPTION WHEN OTHERS THEN
        UPDATE faqs_reorder_lock SET locked = false WHERE id = 1; -- Added WHERE clause
        RAISE;
    END;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_faqs_order ON public.faqs;

CREATE TRIGGER handle_faqs_order
BEFORE INSERT OR UPDATE OR DELETE ON public.faqs
FOR EACH ROW EXECUTE FUNCTION handle_faqs_order();
