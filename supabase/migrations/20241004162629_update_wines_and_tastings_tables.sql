ALTER TABLE "public"."tastings"
ADD COLUMN "stock" INT DEFAULT 0 NOT NULL,
ADD COLUMN "image" TEXT,
ADD COLUMN "slug" TEXT,
ADD COLUMN "long_description" TEXT;

UPDATE "public"."tastings"
SET "slug" = 'default-slug'
WHERE "slug" IS NULL;

ALTER TABLE "public"."tastings"
ALTER COLUMN "slug" SET NOT NULL;

ALTER TABLE "public"."tastings"
RENAME COLUMN "description" TO "short_description";

ALTER TABLE "public"."wines"
ADD COLUMN "stock" INT,
ADD COLUMN "image" TEXT;