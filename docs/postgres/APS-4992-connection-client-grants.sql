-- APS-4992 expansion migration.
-- Apply before deploying code that reads or writes ConnectionClientGrant.
-- Safe to run repeatedly. Data backfill is a separate, dry-run-first step.

BEGIN;

CREATE SEQUENCE IF NOT EXISTS public."ConnectionClientGrant_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE IF NOT EXISTS public."ConnectionClientGrant" (
    id integer NOT NULL DEFAULT nextval(
      'public."ConnectionClientGrant_id_seq"'::regclass
    ),
    connection integer NOT NULL,
    "integrationId" text NOT NULL,
    "oauthClientId" text NOT NULL,
    "submissionId" text,
    "requesterDetails" text NOT NULL DEFAULT '{}',
    scopes text NOT NULL DEFAULT '[]',
    status text NOT NULL DEFAULT 'pending',
    slug text,
    "updatedAt_utc" timestamp without time zone,
    "updatedAt_offset" text,
    "createdAt_utc" timestamp without time zone,
    "createdAt_offset" text
);

ALTER SEQUENCE public."ConnectionClientGrant_id_seq"
  OWNED BY public."ConnectionClientGrant".id;

-- The migration may be applied by a database administrator (as it is in the
-- local Docker environment), while the application connects as keystonejsuser.
ALTER TABLE public."ConnectionClientGrant" OWNER TO keystonejsuser;
ALTER SEQUENCE public."ConnectionClientGrant_id_seq" OWNER TO keystonejsuser;


DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ConnectionClientGrant_pkey'
  ) THEN
    ALTER TABLE ONLY public."ConnectionClientGrant"
      ADD CONSTRAINT "ConnectionClientGrant_pkey" PRIMARY KEY (id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'connectionclientgrant_connection_client_unique'
  ) THEN
    ALTER TABLE ONLY public."ConnectionClientGrant"
      ADD CONSTRAINT connectionclientgrant_connection_client_unique
      UNIQUE (connection, "integrationId", "oauthClientId");
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'connectionclientgrant_slug_unique'
  ) THEN
    ALTER TABLE ONLY public."ConnectionClientGrant"
      ADD CONSTRAINT connectionclientgrant_slug_unique UNIQUE (slug);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'connectionclientgrant_status_check'
  ) THEN
    ALTER TABLE ONLY public."ConnectionClientGrant"
      ADD CONSTRAINT connectionclientgrant_status_check
      CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'connectionclientgrant_connection_foreign'
  ) THEN
    ALTER TABLE ONLY public."ConnectionClientGrant"
      ADD CONSTRAINT connectionclientgrant_connection_foreign
      FOREIGN KEY (connection) REFERENCES public."ConnectionRequest"(id)
      ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS connectionclientgrant_connection_index
  ON public."ConnectionClientGrant" USING btree (connection);

COMMIT;
