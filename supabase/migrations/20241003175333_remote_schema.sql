

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."order_state" AS ENUM (
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
);


ALTER TYPE "public"."order_state" OWNER TO "postgres";


CREATE TYPE "public"."tasting_status" AS ENUM (
    'draft',
    'active',
    'inactive',
    'deleted'
);


ALTER TYPE "public"."tasting_status" OWNER TO "postgres";


CREATE TYPE "public"."wine_status" AS ENUM (
    'draft',
    'active',
    'inactive',
    'deleted'
);


ALTER TYPE "public"."wine_status" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "surname" "text" NOT NULL,
    "email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" bigint,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_by" bigint
);


ALTER TABLE "public"."admin" OWNER TO "postgres";


ALTER TABLE "public"."admin" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."admin_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."tasting_wines" (
    "tasting_id" bigint NOT NULL,
    "wine_id" bigint NOT NULL
);


ALTER TABLE "public"."tasting_wines" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tastings" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "pairings" "text",
    "price" numeric(10,2) NOT NULL,
    "status" "public"."tasting_status" DEFAULT 'draft'::"public"."tasting_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" bigint,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_by" bigint
);


ALTER TABLE "public"."tastings" OWNER TO "postgres";


ALTER TABLE "public"."tastings" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."tastings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."wines" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "winery" "text" NOT NULL,
    "year" integer NOT NULL,
    "variety" "text" NOT NULL,
    "volume_ml" integer NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "cost_usd_blue" numeric(10,2) NOT NULL,
    "status" "public"."wine_status" DEFAULT 'draft'::"public"."wine_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" bigint,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_by" bigint
);


ALTER TABLE "public"."wines" OWNER TO "postgres";


ALTER TABLE "public"."wines" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."wines_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."admin"
    ADD CONSTRAINT "admin_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."admin"
    ADD CONSTRAINT "admin_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tasting_wines"
    ADD CONSTRAINT "tasting_wines_pkey" PRIMARY KEY ("tasting_id", "wine_id");



ALTER TABLE ONLY "public"."tastings"
    ADD CONSTRAINT "tastings_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."tastings"
    ADD CONSTRAINT "tastings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wines"
    ADD CONSTRAINT "wines_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_tastings_status" ON "public"."tastings" USING "btree" ("status");



CREATE INDEX "idx_wines_status" ON "public"."wines" USING "btree" ("status");



ALTER TABLE ONLY "public"."tasting_wines"
    ADD CONSTRAINT "tasting_wines_tasting_id_fkey" FOREIGN KEY ("tasting_id") REFERENCES "public"."tastings"("id");



ALTER TABLE ONLY "public"."tasting_wines"
    ADD CONSTRAINT "tasting_wines_wine_id_fkey" FOREIGN KEY ("wine_id") REFERENCES "public"."wines"("id");



ALTER TABLE ONLY "public"."tastings"
    ADD CONSTRAINT "tastings_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."admin"("id");



ALTER TABLE ONLY "public"."wines"
    ADD CONSTRAINT "wines_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."admin"("id");





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



































































































































































































GRANT ALL ON TABLE "public"."admin" TO "anon";
GRANT ALL ON TABLE "public"."admin" TO "authenticated";
GRANT ALL ON TABLE "public"."admin" TO "service_role";



GRANT ALL ON SEQUENCE "public"."admin_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."admin_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."admin_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tasting_wines" TO "anon";
GRANT ALL ON TABLE "public"."tasting_wines" TO "authenticated";
GRANT ALL ON TABLE "public"."tasting_wines" TO "service_role";



GRANT ALL ON TABLE "public"."tastings" TO "anon";
GRANT ALL ON TABLE "public"."tastings" TO "authenticated";
GRANT ALL ON TABLE "public"."tastings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tastings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tastings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tastings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."wines" TO "anon";
GRANT ALL ON TABLE "public"."wines" TO "authenticated";
GRANT ALL ON TABLE "public"."wines" TO "service_role";



GRANT ALL ON SEQUENCE "public"."wines_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."wines_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."wines_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
