# Upgrade Procedure


## Backup database

```
export NS=""
kubectl exec -ti -n $NS service/patroni-spilo -- /bin/bash

pg_dump -d keystonejs > /tmp/db
```

## Drop the database

Patroni:

```
psql -d keystonejs

drop schema public cascade;
create schema public;
GRANT ALL ON SCHEMA public TO keystonejsuser;
```

## Create tables

Keystonejs:

```
kubectl exec -ti -n $NS service/bcgov-aps-portal-generic-api -c generic-api -- /bin/sh

npm run create-tables
```

## Restore data

Patroni:

```
kubectl exec -ti -n $NS service/patroni-spilo -- /bin/bash

psql -d keystonejs -f /tmp/db
```


# Appendix

```
--
-- Name: Group; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."GatewayGroup" (
    id integer NOT NULL,
    name text NOT NULL,
    "extRefId" text NOT NULL,
    namespace text NOT NULL,
    "updatedBy" integer,
    "createdBy" integer,
    "updatedAt_utc" timestamp without time zone,
    "updatedAt_offset" text,
    "createdAt_utc" timestamp without time zone,
    "createdAt_offset" text
);


ALTER TABLE public."GatewayGroup" OWNER TO keystonejsuser;

--
-- Name: GatewayGroup_id_seq; Type: SEQUENCE; Schema: public; Owner: keystonejsuser
--

CREATE SEQUENCE public."GatewayGroup_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."GatewayGroup_id_seq" OWNER TO keystonejsuser;

--
-- Name: GatewayGroup_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: keystonejsuser
--

ALTER SEQUENCE public."GatewayGroup_id_seq" OWNED BY public."GatewayGroup".id;

SELECT pg_catalog.setval('public."GatewayService_id_seq"', 198, true);

ALTER TABLE ONLY public."GatewayService"
    ADD CONSTRAINT "GatewayService_pkey" PRIMARY KEY (id);

CREATE INDEX gatewayservice_createdby_index ON public."GatewayService" USING btree ("createdBy");


```

