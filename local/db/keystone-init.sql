--
-- PostgreSQL database dump
--

-- Dumped from database version 12.2
-- Dumped by pg_dump version 12.2

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: keystonejsuser
--

\c keystonejs;

DROP SCHEMA IF EXISTS public;

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO keystonejsuser;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: keystonejsuser
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AccessRequest; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."AccessRequest" (
    id integer NOT NULL,
    name text NOT NULL,
    communication text,
    "isApproved" boolean,
    "isIssued" boolean,
    "isComplete" boolean,
    credential text,
    controls text NOT NULL,
    "additionalDetails" text,
    requestor integer,
    application integer,
    "productEnvironment" integer,
    "serviceAccess" integer,
    "updatedBy" integer,
    "createdBy" integer,
    "updatedAt_utc" timestamp without time zone,
    "updatedAt_offset" text,
    "createdAt_utc" timestamp without time zone,
    "createdAt_offset" text
);


ALTER TABLE public."AccessRequest" OWNER TO keystonejsuser;

--
-- Name: AccessRequest_id_seq; Type: SEQUENCE; Schema: public; Owner: keystonejsuser
--

CREATE SEQUENCE public."AccessRequest_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."AccessRequest_id_seq" OWNER TO keystonejsuser;

--
-- Name: AccessRequest_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: keystonejsuser
--

ALTER SEQUENCE public."AccessRequest_id_seq" OWNED BY public."AccessRequest".id;


--
-- Name: Activity; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."Activity" (
    id integer NOT NULL,
    "extRefId" text,
    type text NOT NULL,
    name text NOT NULL,
    action text NOT NULL,
    result text,
    message text,
    context text,
    "refId" text NOT NULL,
    namespace text,
    actor integer,
    blob integer,
    "updatedAt_utc" timestamp without time zone,
    "updatedAt_offset" text,
    "createdAt_utc" timestamp without time zone,
    "createdAt_offset" text
);


ALTER TABLE public."Activity" OWNER TO keystonejsuser;

--
-- Name: Activity_id_seq; Type: SEQUENCE; Schema: public; Owner: keystonejsuser
--

CREATE SEQUENCE public."Activity_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Activity_id_seq" OWNER TO keystonejsuser;

--
-- Name: Activity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: keystonejsuser
--

ALTER SEQUENCE public."Activity_id_seq" OWNED BY public."Activity".id;


--
-- Name: Alert; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."Alert" (
    id integer NOT NULL,
    name text NOT NULL,
    state text,
    description text,
    service integer,
    "updatedAt_utc" timestamp without time zone,
    "updatedAt_offset" text,
    "createdAt_utc" timestamp without time zone,
    "createdAt_offset" text
);


ALTER TABLE public."Alert" OWNER TO keystonejsuser;

--
-- Name: Alert_id_seq; Type: SEQUENCE; Schema: public; Owner: keystonejsuser
--

CREATE SEQUENCE public."Alert_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Alert_id_seq" OWNER TO keystonejsuser;

--
-- Name: Alert_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: keystonejsuser
--

ALTER SEQUENCE public."Alert_id_seq" OWNED BY public."Alert".id;


--
-- Name: Application; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."Application" (
    id integer NOT NULL,
    "appId" text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    certificate text,
    organization integer,
    "organizationUnit" integer,
    owner integer,
    "updatedAt_utc" timestamp without time zone,
    "updatedAt_offset" text,
    "createdAt_utc" timestamp without time zone,
    "createdAt_offset" text
);


ALTER TABLE public."Application" OWNER TO keystonejsuser;

--
-- Name: Application_id_seq; Type: SEQUENCE; Schema: public; Owner: keystonejsuser
--

CREATE SEQUENCE public."Application_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Application_id_seq" OWNER TO keystonejsuser;

--
-- Name: Application_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: keystonejsuser
--

ALTER SEQUENCE public."Application_id_seq" OWNED BY public."Application".id;


--
-- Name: Blob; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."Blob" (
    id integer NOT NULL,
    ref text NOT NULL,
    blob text NOT NULL
);


ALTER TABLE public."Blob" OWNER TO keystonejsuser;

--
-- Name: Blob_id_seq; Type: SEQUENCE; Schema: public; Owner: keystonejsuser
--

CREATE SEQUENCE public."Blob_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Blob_id_seq" OWNER TO keystonejsuser;

--
-- Name: Blob_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: keystonejsuser
--

ALTER SEQUENCE public."Blob_id_seq" OWNED BY public."Blob".id;


--
-- Name: Content; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."Content" (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    content text,
    "externalLink" text,
    "githubRepository" text,
    readme text,
    namespace text NOT NULL,
    tags text NOT NULL,
    slug text,
    "order" integer,
    "isComplete" boolean NOT NULL,
    "isPublic" boolean NOT NULL,
    "publishDate_utc" timestamp without time zone,
    "publishDate_offset" text
);


ALTER TABLE public."Content" OWNER TO keystonejsuser;

--
-- Name: Content_id_seq; Type: SEQUENCE; Schema: public; Owner: keystonejsuser
--

CREATE SEQUENCE public."Content_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Content_id_seq" OWNER TO keystonejsuser;

--
-- Name: Content_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: keystonejsuser
--

ALTER SEQUENCE public."Content_id_seq" OWNED BY public."Content".id;


--
-- Name: CredentialIssuer; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."CredentialIssuer" (
    id integer NOT NULL,
    name text NOT NULL,
    namespace text NOT NULL,
    description text,
    flow text NOT NULL,
    "clientRegistration" text,
    mode text NOT NULL,
    "clientAuthenticator" text,
    "authPlugin" text,
    instruction text,
    "environmentDetails" text NOT NULL,
    "oidcDiscoveryUrl" text,
    "initialAccessToken" text,
    "clientMappers" text,
    "clientId" text,
    "clientSecret" text,
    "clientMappers" text,
    "availableScopes" text,
    "clientRoles" text,
    "resourceScopes" text,
    "resourceType" text,
    "resourceAccessScope" text,
    "apiKeyName" text NOT NULL,
    owner integer,
    "updatedBy" integer,
    "createdBy" integer,
    "updatedAt_utc" timestamp without time zone,
    "updatedAt_offset" text,
    "createdAt_utc" timestamp without time zone,
    "createdAt_offset" text
);


ALTER TABLE public."CredentialIssuer" OWNER TO keystonejsuser;

--
-- Name: CredentialIssuer_id_seq; Type: SEQUENCE; Schema: public; Owner: keystonejsuser
--

CREATE SEQUENCE public."CredentialIssuer_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."CredentialIssuer_id_seq" OWNER TO keystonejsuser;

--
-- Name: CredentialIssuer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: keystonejsuser
--

ALTER SEQUENCE public."CredentialIssuer_id_seq" OWNED BY public."CredentialIssuer".id;


--
-- Name: Dataset; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."Dataset" (
    id integer NOT NULL,
    name text NOT NULL,
    sector text,
    license_title text,
    view_audience text,
    download_audience text,
    record_publish_date text,
    security_class text,
    private boolean,
    tags text,
    contacts text,
    organization integer,
    "organizationUnit" integer,
    notes text,
    title text,
    "catalogContent" text,
    "isInCatalog" boolean NOT NULL,
    "extSource" text,
    "extForeignKey" text,
    "extRecordHash" text
);


ALTER TABLE public."Dataset" OWNER TO keystonejsuser;

--
-- Name: Dataset_id_seq; Type: SEQUENCE; Schema: public; Owner: keystonejsuser
--

CREATE SEQUENCE public."Dataset_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Dataset_id_seq" OWNER TO keystonejsuser;

--
-- Name: Dataset_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: keystonejsuser
--

ALTER SEQUENCE public."Dataset_id_seq" OWNED BY public."Dataset".id;


--
-- Name: Environment; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."Environment" (
    id integer NOT NULL,
    "appId" text NOT NULL,
    name text NOT NULL,
    active boolean NOT NULL,
    approval boolean NOT NULL,
    flow text NOT NULL,
    legal integer,
    "credentialIssuer" integer,
    "additionalDetailsToRequest" text,
    product integer
);


ALTER TABLE public."Environment" OWNER TO keystonejsuser;

--
-- Name: Environment_id_seq; Type: SEQUENCE; Schema: public; Owner: keystonejsuser
--

CREATE SEQUENCE public."Environment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Environment_id_seq" OWNER TO keystonejsuser;

--
-- Name: Environment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: keystonejsuser
--

ALTER SEQUENCE public."Environment_id_seq" OWNED BY public."Environment".id;


--
-- Name: GatewayConsumer; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."GatewayConsumer" (
    id integer NOT NULL,
    username text NOT NULL,
    "customId" text,
    "aclGroups" text,
    namespace text,
    tags text,
    "extSource" text NOT NULL,
    "extForeignKey" text NOT NULL,
    "extRecordHash" text NOT NULL,
    "updatedAt_utc" timestamp without time zone,
    "updatedAt_offset" text,
    "createdAt_utc" timestamp without time zone,
    "createdAt_offset" text
);


ALTER TABLE public."GatewayConsumer" OWNER TO keystonejsuser;

--
-- Name: GatewayConsumer_id_seq; Type: SEQUENCE; Schema: public; Owner: keystonejsuser
--

CREATE SEQUENCE public."GatewayConsumer_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."GatewayConsumer_id_seq" OWNER TO keystonejsuser;

--
-- Name: GatewayConsumer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: keystonejsuser
--

ALTER SEQUENCE public."GatewayConsumer_id_seq" OWNED BY public."GatewayConsumer".id;


--
-- Name: GatewayConsumer_plugins_many; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."GatewayConsumer_plugins_many" (
    "GatewayConsumer_left_id" integer NOT NULL,
    "GatewayPlugin_right_id" integer NOT NULL
);


ALTER TABLE public."GatewayConsumer_plugins_many" OWNER TO keystonejsuser;

--
-- Name: GatewayGroup; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."GatewayGroup" (
    id integer NOT NULL,
    name text NOT NULL,
    namespace text NOT NULL,
    "extSource" text NOT NULL,
    "extForeignKey" text NOT NULL,
    "extRecordHash" text NOT NULL,
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


--
-- Name: GatewayPlugin; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."GatewayPlugin" (
    id integer NOT NULL,
    name text NOT NULL,
    namespace text,
    tags text NOT NULL,
    config text NOT NULL,
    service integer,
    route integer,
    "extSource" text NOT NULL,
    "extForeignKey" text NOT NULL,
    "extRecordHash" text NOT NULL,
    "updatedAt_utc" timestamp without time zone,
    "updatedAt_offset" text,
    "createdAt_utc" timestamp without time zone,
    "createdAt_offset" text
);


ALTER TABLE public."GatewayPlugin" OWNER TO keystonejsuser;

--
-- Name: GatewayPlugin_id_seq; Type: SEQUENCE; Schema: public; Owner: keystonejsuser
--

CREATE SEQUENCE public."GatewayPlugin_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."GatewayPlugin_id_seq" OWNER TO keystonejsuser;

--
-- Name: GatewayPlugin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: keystonejsuser
--

ALTER SEQUENCE public."GatewayPlugin_id_seq" OWNED BY public."GatewayPlugin".id;


--
-- Name: GatewayRoute; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."GatewayRoute" (
    id integer NOT NULL,
    name text NOT NULL,
    namespace text NOT NULL,
    methods text,
    paths text,
    hosts text NOT NULL,
    tags text NOT NULL,
    service integer,
    "extSource" text NOT NULL,
    "extForeignKey" text NOT NULL,
    "extRecordHash" text NOT NULL,
    "updatedAt_utc" timestamp without time zone,
    "updatedAt_offset" text,
    "createdAt_utc" timestamp without time zone,
    "createdAt_offset" text
);


ALTER TABLE public."GatewayRoute" OWNER TO keystonejsuser;

--
-- Name: GatewayRoute_id_seq; Type: SEQUENCE; Schema: public; Owner: keystonejsuser
--

CREATE SEQUENCE public."GatewayRoute_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."GatewayRoute_id_seq" OWNER TO keystonejsuser;

--
-- Name: GatewayRoute_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: keystonejsuser
--

ALTER SEQUENCE public."GatewayRoute_id_seq" OWNED BY public."GatewayRoute".id;


--
-- Name: GatewayRoute_plugins_many; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."GatewayRoute_plugins_many" (
    "GatewayRoute_left_id" integer NOT NULL,
    "GatewayPlugin_right_id" integer NOT NULL
);


ALTER TABLE public."GatewayRoute_plugins_many" OWNER TO keystonejsuser;

--
-- Name: GatewayService; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."GatewayService" (
    id integer NOT NULL,
    name text NOT NULL,
    namespace text NOT NULL,
    host text NOT NULL,
    tags text NOT NULL,
    environment integer,
    "extSource" text NOT NULL,
    "extForeignKey" text NOT NULL,
    "extRecordHash" text NOT NULL,
    "updatedAt_utc" timestamp without time zone,
    "updatedAt_offset" text,
    "createdAt_utc" timestamp without time zone,
    "createdAt_offset" text
);


ALTER TABLE public."GatewayService" OWNER TO keystonejsuser;

--
-- Name: GatewayService_id_seq; Type: SEQUENCE; Schema: public; Owner: keystonejsuser
--

CREATE SEQUENCE public."GatewayService_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."GatewayService_id_seq" OWNER TO keystonejsuser;

--
-- Name: GatewayService_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: keystonejsuser
--

ALTER SEQUENCE public."GatewayService_id_seq" OWNED BY public."GatewayService".id;


--
-- Name: GatewayService_plugins_many; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."GatewayService_plugins_many" (
    "GatewayService_left_id" integer NOT NULL,
    "GatewayPlugin_right_id" integer NOT NULL
);


ALTER TABLE public."GatewayService_plugins_many" OWNER TO keystonejsuser;

--
-- Name: Legal; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."Legal" (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    link text NOT NULL,
    document text NOT NULL,
    reference text NOT NULL,
    version integer NOT NULL,
    "isActive" boolean NOT NULL,
    "updatedBy" integer,
    "createdBy" integer,
    "updatedAt_utc" timestamp without time zone,
    "updatedAt_offset" text,
    "createdAt_utc" timestamp without time zone,
    "createdAt_offset" text
);


ALTER TABLE public."Legal" OWNER TO keystonejsuser;

--
-- Name: Legal_id_seq; Type: SEQUENCE; Schema: public; Owner: keystonejsuser
--

CREATE SEQUENCE public."Legal_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Legal_id_seq" OWNER TO keystonejsuser;

--
-- Name: Legal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: keystonejsuser
--

ALTER SEQUENCE public."Legal_id_seq" OWNED BY public."Legal".id;


--
-- Name: Metric; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."Metric" (
    id integer NOT NULL,
    name text NOT NULL,
    query text NOT NULL,
    day text NOT NULL,
    metric text NOT NULL,
    "values" text NOT NULL,
    service integer,
    "updatedAt_utc" timestamp without time zone,
    "updatedAt_offset" text,
    "createdAt_utc" timestamp without time zone,
    "createdAt_offset" text
);


ALTER TABLE public."Metric" OWNER TO keystonejsuser;

--
-- Name: Metric_id_seq; Type: SEQUENCE; Schema: public; Owner: keystonejsuser
--

CREATE SEQUENCE public."Metric_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Metric_id_seq" OWNER TO keystonejsuser;

--
-- Name: Metric_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: keystonejsuser
--

ALTER SEQUENCE public."Metric_id_seq" OWNED BY public."Metric".id;


--
-- Name: Organization; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."Organization" (
    id integer NOT NULL,
    name text NOT NULL,
    sector text,
    title text NOT NULL,
    tags text NOT NULL,
    description text,
    "extSource" text NOT NULL,
    "extForeignKey" text NOT NULL,
    "extRecordHash" text NOT NULL
);


ALTER TABLE public."Organization" OWNER TO keystonejsuser;

--
-- Name: OrganizationUnit; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."OrganizationUnit" (
    id integer NOT NULL,
    name text NOT NULL,
    sector text,
    title text NOT NULL,
    tags text NOT NULL,
    description text,
    "extSource" text NOT NULL,
    "extForeignKey" text NOT NULL,
    "extRecordHash" text NOT NULL
);


ALTER TABLE public."OrganizationUnit" OWNER TO keystonejsuser;

--
-- Name: OrganizationUnit_id_seq; Type: SEQUENCE; Schema: public; Owner: keystonejsuser
--

CREATE SEQUENCE public."OrganizationUnit_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."OrganizationUnit_id_seq" OWNER TO keystonejsuser;

--
-- Name: OrganizationUnit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: keystonejsuser
--

ALTER SEQUENCE public."OrganizationUnit_id_seq" OWNED BY public."OrganizationUnit".id;


--
-- Name: Organization_id_seq; Type: SEQUENCE; Schema: public; Owner: keystonejsuser
--

CREATE SEQUENCE public."Organization_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Organization_id_seq" OWNER TO keystonejsuser;

--
-- Name: Organization_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: keystonejsuser
--

ALTER SEQUENCE public."Organization_id_seq" OWNED BY public."Organization".id;


--
-- Name: Organization_orgUnits_many; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."Organization_orgUnits_many" (
    "Organization_left_id" integer NOT NULL,
    "OrganizationUnit_right_id" integer NOT NULL
);


ALTER TABLE public."Organization_orgUnits_many" OWNER TO keystonejsuser;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."Product" (
    id integer NOT NULL,
    "appId" text NOT NULL,
    name text NOT NULL,
    namespace text NOT NULL,
    description text,
    dataset integer,
    organization integer,
    "organizationUnit" integer
);


ALTER TABLE public."Product" OWNER TO keystonejsuser;

--
-- Name: Product_id_seq; Type: SEQUENCE; Schema: public; Owner: keystonejsuser
--

CREATE SEQUENCE public."Product_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Product_id_seq" OWNER TO keystonejsuser;

--
-- Name: Product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: keystonejsuser
--

ALTER SEQUENCE public."Product_id_seq" OWNED BY public."Product".id;


--
-- Name: ServiceAccess; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."ServiceAccess" (
    id integer NOT NULL,
    name text NOT NULL,
    namespace text,
    active boolean NOT NULL,
    "aclEnabled" boolean NOT NULL,
    "consumerType" text NOT NULL,
    "credentialReference" text,
    credential text,
    "clientRoles" text,
    consumer integer,
    application integer,
    "productEnvironment" integer,
    "updatedAt_utc" timestamp without time zone,
    "updatedAt_offset" text,
    "createdAt_utc" timestamp without time zone,
    "createdAt_offset" text,
    CONSTRAINT "ServiceAccess_consumerType_check" CHECK (("consumerType" = ANY (ARRAY['client'::text, 'user'::text])))
);


ALTER TABLE public."ServiceAccess" OWNER TO keystonejsuser;

--
-- Name: ServiceAccess_id_seq; Type: SEQUENCE; Schema: public; Owner: keystonejsuser
--

CREATE SEQUENCE public."ServiceAccess_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ServiceAccess_id_seq" OWNER TO keystonejsuser;

--
-- Name: ServiceAccess_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: keystonejsuser
--

ALTER SEQUENCE public."ServiceAccess_id_seq" OWNED BY public."ServiceAccess".id;


--
-- Name: TemporaryIdentity; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."TemporaryIdentity" (
    id integer NOT NULL,
    jti text,
    sub text,
    name text,
    username text,
    email text,
    "isAdmin" boolean,
    "userId" text,
    namespace text,
    groups text,
    roles text,
    scopes text,
    "updatedAt_utc" timestamp without time zone,
    "updatedAt_offset" text,
    "createdAt_utc" timestamp without time zone,
    "createdAt_offset" text
);


ALTER TABLE public."TemporaryIdentity" OWNER TO keystonejsuser;

--
-- Name: TemporaryIdentity_id_seq; Type: SEQUENCE; Schema: public; Owner: keystonejsuser
--

CREATE SEQUENCE public."TemporaryIdentity_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."TemporaryIdentity_id_seq" OWNER TO keystonejsuser;

--
-- Name: TemporaryIdentity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: keystonejsuser
--

ALTER SEQUENCE public."TemporaryIdentity_id_seq" OWNED BY public."TemporaryIdentity".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: keystonejsuser
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    name text,
    username text,
    email text,
    "isAdmin" boolean,
    password character varying(60),
    "legalsAgreed" text
);


ALTER TABLE public."User" OWNER TO keystonejsuser;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: keystonejsuser
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."User_id_seq" OWNER TO keystonejsuser;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: keystonejsuser
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: AccessRequest id; Type: DEFAULT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."AccessRequest" ALTER COLUMN id SET DEFAULT nextval('public."AccessRequest_id_seq"'::regclass);


--
-- Name: Activity id; Type: DEFAULT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Activity" ALTER COLUMN id SET DEFAULT nextval('public."Activity_id_seq"'::regclass);


--
-- Name: Alert id; Type: DEFAULT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Alert" ALTER COLUMN id SET DEFAULT nextval('public."Alert_id_seq"'::regclass);


--
-- Name: Application id; Type: DEFAULT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Application" ALTER COLUMN id SET DEFAULT nextval('public."Application_id_seq"'::regclass);


--
-- Name: Blob id; Type: DEFAULT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Blob" ALTER COLUMN id SET DEFAULT nextval('public."Blob_id_seq"'::regclass);


--
-- Name: Content id; Type: DEFAULT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Content" ALTER COLUMN id SET DEFAULT nextval('public."Content_id_seq"'::regclass);


--
-- Name: CredentialIssuer id; Type: DEFAULT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."CredentialIssuer" ALTER COLUMN id SET DEFAULT nextval('public."CredentialIssuer_id_seq"'::regclass);


--
-- Name: Dataset id; Type: DEFAULT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Dataset" ALTER COLUMN id SET DEFAULT nextval('public."Dataset_id_seq"'::regclass);


--
-- Name: Environment id; Type: DEFAULT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Environment" ALTER COLUMN id SET DEFAULT nextval('public."Environment_id_seq"'::regclass);


--
-- Name: GatewayConsumer id; Type: DEFAULT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayConsumer" ALTER COLUMN id SET DEFAULT nextval('public."GatewayConsumer_id_seq"'::regclass);


--
-- Name: GatewayGroup id; Type: DEFAULT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayGroup" ALTER COLUMN id SET DEFAULT nextval('public."GatewayGroup_id_seq"'::regclass);


--
-- Name: GatewayPlugin id; Type: DEFAULT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayPlugin" ALTER COLUMN id SET DEFAULT nextval('public."GatewayPlugin_id_seq"'::regclass);


--
-- Name: GatewayRoute id; Type: DEFAULT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayRoute" ALTER COLUMN id SET DEFAULT nextval('public."GatewayRoute_id_seq"'::regclass);


--
-- Name: GatewayService id; Type: DEFAULT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayService" ALTER COLUMN id SET DEFAULT nextval('public."GatewayService_id_seq"'::regclass);


--
-- Name: Legal id; Type: DEFAULT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Legal" ALTER COLUMN id SET DEFAULT nextval('public."Legal_id_seq"'::regclass);


--
-- Name: Metric id; Type: DEFAULT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Metric" ALTER COLUMN id SET DEFAULT nextval('public."Metric_id_seq"'::regclass);


--
-- Name: Organization id; Type: DEFAULT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Organization" ALTER COLUMN id SET DEFAULT nextval('public."Organization_id_seq"'::regclass);


--
-- Name: OrganizationUnit id; Type: DEFAULT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."OrganizationUnit" ALTER COLUMN id SET DEFAULT nextval('public."OrganizationUnit_id_seq"'::regclass);


--
-- Name: Product id; Type: DEFAULT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Product" ALTER COLUMN id SET DEFAULT nextval('public."Product_id_seq"'::regclass);


--
-- Name: ServiceAccess id; Type: DEFAULT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."ServiceAccess" ALTER COLUMN id SET DEFAULT nextval('public."ServiceAccess_id_seq"'::regclass);


--
-- Name: TemporaryIdentity id; Type: DEFAULT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."TemporaryIdentity" ALTER COLUMN id SET DEFAULT nextval('public."TemporaryIdentity_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Name: AccessRequest AccessRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."AccessRequest"
    ADD CONSTRAINT "AccessRequest_pkey" PRIMARY KEY (id);


--
-- Name: Activity Activity_pkey; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Activity"
    ADD CONSTRAINT "Activity_pkey" PRIMARY KEY (id);


--
-- Name: Alert Alert_pkey; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Alert"
    ADD CONSTRAINT "Alert_pkey" PRIMARY KEY (id);


--
-- Name: Application Application_pkey; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Application"
    ADD CONSTRAINT "Application_pkey" PRIMARY KEY (id);


--
-- Name: Blob Blob_pkey; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Blob"
    ADD CONSTRAINT "Blob_pkey" PRIMARY KEY (id);


--
-- Name: Content Content_pkey; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Content"
    ADD CONSTRAINT "Content_pkey" PRIMARY KEY (id);


--
-- Name: CredentialIssuer CredentialIssuer_pkey; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."CredentialIssuer"
    ADD CONSTRAINT "CredentialIssuer_pkey" PRIMARY KEY (id);


--
-- Name: Dataset Dataset_pkey; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Dataset"
    ADD CONSTRAINT "Dataset_pkey" PRIMARY KEY (id);


--
-- Name: Environment Environment_pkey; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Environment"
    ADD CONSTRAINT "Environment_pkey" PRIMARY KEY (id);


--
-- Name: GatewayConsumer GatewayConsumer_pkey; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayConsumer"
    ADD CONSTRAINT "GatewayConsumer_pkey" PRIMARY KEY (id);


--
-- Name: GatewayGroup GatewayGroup_pkey; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayGroup"
    ADD CONSTRAINT "GatewayGroup_pkey" PRIMARY KEY (id);


--
-- Name: GatewayPlugin GatewayPlugin_pkey; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayPlugin"
    ADD CONSTRAINT "GatewayPlugin_pkey" PRIMARY KEY (id);


--
-- Name: GatewayRoute GatewayRoute_pkey; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayRoute"
    ADD CONSTRAINT "GatewayRoute_pkey" PRIMARY KEY (id);


--
-- Name: GatewayService GatewayService_pkey; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayService"
    ADD CONSTRAINT "GatewayService_pkey" PRIMARY KEY (id);


--
-- Name: Legal Legal_pkey; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Legal"
    ADD CONSTRAINT "Legal_pkey" PRIMARY KEY (id);


--
-- Name: Metric Metric_pkey; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Metric"
    ADD CONSTRAINT "Metric_pkey" PRIMARY KEY (id);


--
-- Name: OrganizationUnit OrganizationUnit_pkey; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."OrganizationUnit"
    ADD CONSTRAINT "OrganizationUnit_pkey" PRIMARY KEY (id);


--
-- Name: Organization Organization_pkey; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Organization"
    ADD CONSTRAINT "Organization_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: ServiceAccess ServiceAccess_pkey; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."ServiceAccess"
    ADD CONSTRAINT "ServiceAccess_pkey" PRIMARY KEY (id);


--
-- Name: TemporaryIdentity TemporaryIdentity_pkey; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."TemporaryIdentity"
    ADD CONSTRAINT "TemporaryIdentity_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Application application_appid_unique; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Application"
    ADD CONSTRAINT application_appid_unique UNIQUE ("appId");


--
-- Name: Blob blob_ref_unique; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Blob"
    ADD CONSTRAINT blob_ref_unique UNIQUE (ref);


--
-- Name: Content content_slug_unique; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Content"
    ADD CONSTRAINT content_slug_unique UNIQUE (slug);


--
-- Name: CredentialIssuer credentialissuer_name_unique; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."CredentialIssuer"
    ADD CONSTRAINT credentialissuer_name_unique UNIQUE (name);


--
-- Name: Environment environment_appid_unique; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Environment"
    ADD CONSTRAINT environment_appid_unique UNIQUE ("appId");


--
-- Name: GatewayConsumer gatewayconsumer_extforeignkey_unique; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayConsumer"
    ADD CONSTRAINT gatewayconsumer_extforeignkey_unique UNIQUE ("extForeignKey");


--
-- Name: GatewayConsumer gatewayconsumer_username_unique; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayConsumer"
    ADD CONSTRAINT gatewayconsumer_username_unique UNIQUE (username);


--
-- Name: GatewayGroup gatewaygroup_extforeignkey_unique; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayGroup"
    ADD CONSTRAINT gatewaygroup_extforeignkey_unique UNIQUE ("extForeignKey");


--
-- Name: GatewayPlugin gatewayplugin_extforeignkey_unique; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayPlugin"
    ADD CONSTRAINT gatewayplugin_extforeignkey_unique UNIQUE ("extForeignKey");


--
-- Name: GatewayRoute gatewayroute_extforeignkey_unique; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayRoute"
    ADD CONSTRAINT gatewayroute_extforeignkey_unique UNIQUE ("extForeignKey");


--
-- Name: GatewayRoute gatewayroute_name_unique; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayRoute"
    ADD CONSTRAINT gatewayroute_name_unique UNIQUE (name);


--
-- Name: GatewayService gatewayservice_extforeignkey_unique; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayService"
    ADD CONSTRAINT gatewayservice_extforeignkey_unique UNIQUE ("extForeignKey");


--
-- Name: GatewayService gatewayservice_name_unique; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayService"
    ADD CONSTRAINT gatewayservice_name_unique UNIQUE (name);


--
-- Name: Legal legal_reference_unique; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Legal"
    ADD CONSTRAINT legal_reference_unique UNIQUE (reference);


--
-- Name: Organization organization_extforeignkey_unique; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Organization"
    ADD CONSTRAINT organization_extforeignkey_unique UNIQUE ("extForeignKey");


--
-- Name: OrganizationUnit organizationunit_extforeignkey_unique; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."OrganizationUnit"
    ADD CONSTRAINT organizationunit_extforeignkey_unique UNIQUE ("extForeignKey");


--
-- Name: ServiceAccess serviceaccess_name_unique; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."ServiceAccess"
    ADD CONSTRAINT serviceaccess_name_unique UNIQUE (name);


--
-- Name: TemporaryIdentity temporaryidentity_jti_unique; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."TemporaryIdentity"
    ADD CONSTRAINT temporaryidentity_jti_unique UNIQUE (jti);


--
-- Name: User user_username_unique; Type: CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT user_username_unique UNIQUE (username);


--
-- Name: accessrequest_application_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX accessrequest_application_index ON public."AccessRequest" USING btree (application);


--
-- Name: accessrequest_createdby_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX accessrequest_createdby_index ON public."AccessRequest" USING btree ("createdBy");


--
-- Name: accessrequest_productenvironment_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX accessrequest_productenvironment_index ON public."AccessRequest" USING btree ("productEnvironment");


--
-- Name: accessrequest_requestor_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX accessrequest_requestor_index ON public."AccessRequest" USING btree (requestor);


--
-- Name: accessrequest_serviceaccess_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX accessrequest_serviceaccess_index ON public."AccessRequest" USING btree ("serviceAccess");


--
-- Name: accessrequest_updatedby_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX accessrequest_updatedby_index ON public."AccessRequest" USING btree ("updatedBy");


--
-- Name: activity_actor_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX activity_actor_index ON public."Activity" USING btree (actor);


--
-- Name: activity_blob_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX activity_blob_index ON public."Activity" USING btree (blob);


--
-- Name: alert_service_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX alert_service_index ON public."Alert" USING btree (service);


--
-- Name: application_organization_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX application_organization_index ON public."Application" USING btree (organization);


--
-- Name: application_organizationunit_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX application_organizationunit_index ON public."Application" USING btree ("organizationUnit");


--
-- Name: application_owner_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX application_owner_index ON public."Application" USING btree (owner);


--
-- Name: credentialissuer_createdby_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX credentialissuer_createdby_index ON public."CredentialIssuer" USING btree ("createdBy");


--
-- Name: credentialissuer_owner_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX credentialissuer_owner_index ON public."CredentialIssuer" USING btree (owner);


--
-- Name: credentialissuer_updatedby_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX credentialissuer_updatedby_index ON public."CredentialIssuer" USING btree ("updatedBy");


--
-- Name: dataset_organization_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX dataset_organization_index ON public."Dataset" USING btree (organization);


--
-- Name: dataset_organizationunit_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX dataset_organizationunit_index ON public."Dataset" USING btree ("organizationUnit");


--
-- Name: environment_credentialissuer_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX environment_credentialissuer_index ON public."Environment" USING btree ("credentialIssuer");


--
-- Name: environment_legal_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX environment_legal_index ON public."Environment" USING btree (legal);


--
-- Name: environment_product_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX environment_product_index ON public."Environment" USING btree (product);


--
-- Name: gatewayconsumer_plugins_many_gatewayconsumer_left_id_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX gatewayconsumer_plugins_many_gatewayconsumer_left_id_index ON public."GatewayConsumer_plugins_many" USING btree ("GatewayConsumer_left_id");


--
-- Name: gatewayconsumer_plugins_many_gatewayplugin_right_id_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX gatewayconsumer_plugins_many_gatewayplugin_right_id_index ON public."GatewayConsumer_plugins_many" USING btree ("GatewayPlugin_right_id");


--
-- Name: gatewayplugin_route_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX gatewayplugin_route_index ON public."GatewayPlugin" USING btree (route);


--
-- Name: gatewayplugin_service_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX gatewayplugin_service_index ON public."GatewayPlugin" USING btree (service);


--
-- Name: gatewayroute_plugins_many_gatewayplugin_right_id_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX gatewayroute_plugins_many_gatewayplugin_right_id_index ON public."GatewayRoute_plugins_many" USING btree ("GatewayPlugin_right_id");


--
-- Name: gatewayroute_plugins_many_gatewayroute_left_id_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX gatewayroute_plugins_many_gatewayroute_left_id_index ON public."GatewayRoute_plugins_many" USING btree ("GatewayRoute_left_id");


--
-- Name: gatewayroute_service_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX gatewayroute_service_index ON public."GatewayRoute" USING btree (service);


--
-- Name: gatewayservice_environment_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX gatewayservice_environment_index ON public."GatewayService" USING btree (environment);


--
-- Name: gatewayservice_plugins_many_gatewayplugin_right_id_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX gatewayservice_plugins_many_gatewayplugin_right_id_index ON public."GatewayService_plugins_many" USING btree ("GatewayPlugin_right_id");


--
-- Name: gatewayservice_plugins_many_gatewayservice_left_id_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX gatewayservice_plugins_many_gatewayservice_left_id_index ON public."GatewayService_plugins_many" USING btree ("GatewayService_left_id");


--
-- Name: legal_createdby_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX legal_createdby_index ON public."Legal" USING btree ("createdBy");


--
-- Name: legal_updatedby_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX legal_updatedby_index ON public."Legal" USING btree ("updatedBy");


--
-- Name: metric_service_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX metric_service_index ON public."Metric" USING btree (service);


--
-- Name: organization_orgunits_many_organization_left_id_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX organization_orgunits_many_organization_left_id_index ON public."Organization_orgUnits_many" USING btree ("Organization_left_id");


--
-- Name: organization_orgunits_many_organizationunit_right_id_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX organization_orgunits_many_organizationunit_right_id_index ON public."Organization_orgUnits_many" USING btree ("OrganizationUnit_right_id");


--
-- Name: product_dataset_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX product_dataset_index ON public."Product" USING btree (dataset);


--
-- Name: product_organization_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX product_organization_index ON public."Product" USING btree (organization);


--
-- Name: product_organizationunit_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX product_organizationunit_index ON public."Product" USING btree ("organizationUnit");


--
-- Name: serviceaccess_application_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX serviceaccess_application_index ON public."ServiceAccess" USING btree (application);


--
-- Name: serviceaccess_consumer_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX serviceaccess_consumer_index ON public."ServiceAccess" USING btree (consumer);


--
-- Name: serviceaccess_productenvironment_index; Type: INDEX; Schema: public; Owner: keystonejsuser
--

CREATE INDEX serviceaccess_productenvironment_index ON public."ServiceAccess" USING btree ("productEnvironment");


--
-- Name: AccessRequest accessrequest_application_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."AccessRequest"
    ADD CONSTRAINT accessrequest_application_foreign FOREIGN KEY (application) REFERENCES public."Application"(id);


--
-- Name: AccessRequest accessrequest_createdby_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."AccessRequest"
    ADD CONSTRAINT accessrequest_createdby_foreign FOREIGN KEY ("createdBy") REFERENCES public."User"(id);


--
-- Name: AccessRequest accessrequest_productenvironment_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."AccessRequest"
    ADD CONSTRAINT accessrequest_productenvironment_foreign FOREIGN KEY ("productEnvironment") REFERENCES public."Environment"(id);


--
-- Name: AccessRequest accessrequest_requestor_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."AccessRequest"
    ADD CONSTRAINT accessrequest_requestor_foreign FOREIGN KEY (requestor) REFERENCES public."User"(id);


--
-- Name: AccessRequest accessrequest_serviceaccess_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."AccessRequest"
    ADD CONSTRAINT accessrequest_serviceaccess_foreign FOREIGN KEY ("serviceAccess") REFERENCES public."ServiceAccess"(id);


--
-- Name: AccessRequest accessrequest_updatedby_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."AccessRequest"
    ADD CONSTRAINT accessrequest_updatedby_foreign FOREIGN KEY ("updatedBy") REFERENCES public."User"(id);


--
-- Name: Activity activity_actor_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Activity"
    ADD CONSTRAINT activity_actor_foreign FOREIGN KEY (actor) REFERENCES public."User"(id);


--
-- Name: Activity activity_blob_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Activity"
    ADD CONSTRAINT activity_blob_foreign FOREIGN KEY (blob) REFERENCES public."Blob"(id);


--
-- Name: Alert alert_service_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Alert"
    ADD CONSTRAINT alert_service_foreign FOREIGN KEY (service) REFERENCES public."GatewayService"(id);


--
-- Name: Application application_organization_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Application"
    ADD CONSTRAINT application_organization_foreign FOREIGN KEY (organization) REFERENCES public."Organization"(id);


--
-- Name: Application application_organizationunit_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Application"
    ADD CONSTRAINT application_organizationunit_foreign FOREIGN KEY ("organizationUnit") REFERENCES public."OrganizationUnit"(id);


--
-- Name: Application application_owner_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Application"
    ADD CONSTRAINT application_owner_foreign FOREIGN KEY (owner) REFERENCES public."User"(id);


--
-- Name: CredentialIssuer credentialissuer_createdby_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."CredentialIssuer"
    ADD CONSTRAINT credentialissuer_createdby_foreign FOREIGN KEY ("createdBy") REFERENCES public."User"(id);


--
-- Name: CredentialIssuer credentialissuer_owner_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."CredentialIssuer"
    ADD CONSTRAINT credentialissuer_owner_foreign FOREIGN KEY (owner) REFERENCES public."User"(id);


--
-- Name: CredentialIssuer credentialissuer_updatedby_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."CredentialIssuer"
    ADD CONSTRAINT credentialissuer_updatedby_foreign FOREIGN KEY ("updatedBy") REFERENCES public."User"(id);


--
-- Name: Dataset dataset_organization_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Dataset"
    ADD CONSTRAINT dataset_organization_foreign FOREIGN KEY (organization) REFERENCES public."Organization"(id);


--
-- Name: Dataset dataset_organizationunit_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Dataset"
    ADD CONSTRAINT dataset_organizationunit_foreign FOREIGN KEY ("organizationUnit") REFERENCES public."OrganizationUnit"(id);


--
-- Name: Environment environment_credentialissuer_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Environment"
    ADD CONSTRAINT environment_credentialissuer_foreign FOREIGN KEY ("credentialIssuer") REFERENCES public."CredentialIssuer"(id);


--
-- Name: Environment environment_legal_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Environment"
    ADD CONSTRAINT environment_legal_foreign FOREIGN KEY (legal) REFERENCES public."Legal"(id);


--
-- Name: Environment environment_product_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Environment"
    ADD CONSTRAINT environment_product_foreign FOREIGN KEY (product) REFERENCES public."Product"(id);


--
-- Name: GatewayConsumer_plugins_many gatewayconsumer_plugins_many_gatewayconsumer_left_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayConsumer_plugins_many"
    ADD CONSTRAINT gatewayconsumer_plugins_many_gatewayconsumer_left_id_foreign FOREIGN KEY ("GatewayConsumer_left_id") REFERENCES public."GatewayConsumer"(id) ON DELETE CASCADE;


--
-- Name: GatewayConsumer_plugins_many gatewayconsumer_plugins_many_gatewayplugin_right_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayConsumer_plugins_many"
    ADD CONSTRAINT gatewayconsumer_plugins_many_gatewayplugin_right_id_foreign FOREIGN KEY ("GatewayPlugin_right_id") REFERENCES public."GatewayPlugin"(id) ON DELETE CASCADE;


--
-- Name: GatewayPlugin gatewayplugin_route_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayPlugin"
    ADD CONSTRAINT gatewayplugin_route_foreign FOREIGN KEY (route) REFERENCES public."GatewayRoute"(id);


--
-- Name: GatewayPlugin gatewayplugin_service_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayPlugin"
    ADD CONSTRAINT gatewayplugin_service_foreign FOREIGN KEY (service) REFERENCES public."GatewayService"(id);


--
-- Name: GatewayRoute_plugins_many gatewayroute_plugins_many_gatewayplugin_right_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayRoute_plugins_many"
    ADD CONSTRAINT gatewayroute_plugins_many_gatewayplugin_right_id_foreign FOREIGN KEY ("GatewayPlugin_right_id") REFERENCES public."GatewayPlugin"(id) ON DELETE CASCADE;


--
-- Name: GatewayRoute_plugins_many gatewayroute_plugins_many_gatewayroute_left_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayRoute_plugins_many"
    ADD CONSTRAINT gatewayroute_plugins_many_gatewayroute_left_id_foreign FOREIGN KEY ("GatewayRoute_left_id") REFERENCES public."GatewayRoute"(id) ON DELETE CASCADE;


--
-- Name: GatewayRoute gatewayroute_service_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayRoute"
    ADD CONSTRAINT gatewayroute_service_foreign FOREIGN KEY (service) REFERENCES public."GatewayService"(id);


--
-- Name: GatewayService gatewayservice_environment_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayService"
    ADD CONSTRAINT gatewayservice_environment_foreign FOREIGN KEY (environment) REFERENCES public."Environment"(id);


--
-- Name: GatewayService_plugins_many gatewayservice_plugins_many_gatewayplugin_right_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayService_plugins_many"
    ADD CONSTRAINT gatewayservice_plugins_many_gatewayplugin_right_id_foreign FOREIGN KEY ("GatewayPlugin_right_id") REFERENCES public."GatewayPlugin"(id) ON DELETE CASCADE;


--
-- Name: GatewayService_plugins_many gatewayservice_plugins_many_gatewayservice_left_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."GatewayService_plugins_many"
    ADD CONSTRAINT gatewayservice_plugins_many_gatewayservice_left_id_foreign FOREIGN KEY ("GatewayService_left_id") REFERENCES public."GatewayService"(id) ON DELETE CASCADE;


--
-- Name: Legal legal_createdby_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Legal"
    ADD CONSTRAINT legal_createdby_foreign FOREIGN KEY ("createdBy") REFERENCES public."User"(id);


--
-- Name: Legal legal_updatedby_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Legal"
    ADD CONSTRAINT legal_updatedby_foreign FOREIGN KEY ("updatedBy") REFERENCES public."User"(id);


--
-- Name: Metric metric_service_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Metric"
    ADD CONSTRAINT metric_service_foreign FOREIGN KEY (service) REFERENCES public."GatewayService"(id);


--
-- Name: Organization_orgUnits_many organization_orgunits_many_organization_left_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Organization_orgUnits_many"
    ADD CONSTRAINT organization_orgunits_many_organization_left_id_foreign FOREIGN KEY ("Organization_left_id") REFERENCES public."Organization"(id) ON DELETE CASCADE;


--
-- Name: Organization_orgUnits_many organization_orgunits_many_organizationunit_right_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Organization_orgUnits_many"
    ADD CONSTRAINT organization_orgunits_many_organizationunit_right_id_foreign FOREIGN KEY ("OrganizationUnit_right_id") REFERENCES public."OrganizationUnit"(id) ON DELETE CASCADE;


--
-- Name: Product product_dataset_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT product_dataset_foreign FOREIGN KEY (dataset) REFERENCES public."Dataset"(id);


--
-- Name: Product product_organization_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT product_organization_foreign FOREIGN KEY (organization) REFERENCES public."Organization"(id);


--
-- Name: Product product_organizationunit_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT product_organizationunit_foreign FOREIGN KEY ("organizationUnit") REFERENCES public."OrganizationUnit"(id);


--
-- Name: ServiceAccess serviceaccess_application_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."ServiceAccess"
    ADD CONSTRAINT serviceaccess_application_foreign FOREIGN KEY (application) REFERENCES public."Application"(id);


--
-- Name: ServiceAccess serviceaccess_consumer_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."ServiceAccess"
    ADD CONSTRAINT serviceaccess_consumer_foreign FOREIGN KEY (consumer) REFERENCES public."GatewayConsumer"(id);


--
-- Name: ServiceAccess serviceaccess_productenvironment_foreign; Type: FK CONSTRAINT; Schema: public; Owner: keystonejsuser
--

ALTER TABLE ONLY public."ServiceAccess"
    ADD CONSTRAINT serviceaccess_productenvironment_foreign FOREIGN KEY ("productEnvironment") REFERENCES public."Environment"(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: keystonejsuser
--

REVOKE ALL ON SCHEMA public FROM postgres;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO keystonejsuser;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--
