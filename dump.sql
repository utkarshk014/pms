--
-- PostgreSQL database dump
--

\restrict GeAyErlgnTwYDpZEo90k2GZ3XEvUijaQgXdFiOuAwZ8oKns9N7b0hAagV84eBtD

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

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

ALTER TABLE IF EXISTS ONLY public.vendor_quote_items DROP CONSTRAINT IF EXISTS "vendor_quote_items_vendorId_fkey";
ALTER TABLE IF EXISTS ONLY public.vendor_quote_items DROP CONSTRAINT IF EXISTS "vendor_quote_items_mappingId_fkey";
ALTER TABLE IF EXISTS ONLY public.vendor_quote_items DROP CONSTRAINT IF EXISTS "vendor_quote_items_itemId_fkey";
ALTER TABLE IF EXISTS ONLY public.sw_user_details DROP CONSTRAINT IF EXISTS "sw_user_details_customerId_fkey";
ALTER TABLE IF EXISTS ONLY public.stk_manufacturer DROP CONSTRAINT IF EXISTS "stk_manufacturer_customerId_fkey";
ALTER TABLE IF EXISTS ONLY public.stk_item_master DROP CONSTRAINT IF EXISTS "stk_item_master_manufacturerId_fkey";
ALTER TABLE IF EXISTS ONLY public.stk_item_master DROP CONSTRAINT IF EXISTS "stk_item_master_groupId_fkey";
ALTER TABLE IF EXISTS ONLY public.stk_item_master DROP CONSTRAINT IF EXISTS "stk_item_master_customerId_fkey";
ALTER TABLE IF EXISTS ONLY public.stk_item_master DROP CONSTRAINT IF EXISTS "stk_item_master_categoryId_fkey";
ALTER TABLE IF EXISTS ONLY public.stk_group DROP CONSTRAINT IF EXISTS "stk_group_customerId_fkey";
ALTER TABLE IF EXISTS ONLY public.stk_category DROP CONSTRAINT IF EXISTS "stk_category_customerId_fkey";
ALTER TABLE IF EXISTS ONLY public.rfq_vendor_mapping DROP CONSTRAINT IF EXISTS "rfq_vendor_mapping_vendorId_fkey";
ALTER TABLE IF EXISTS ONLY public.rfq_vendor_mapping DROP CONSTRAINT IF EXISTS "rfq_vendor_mapping_rfqId_fkey";
ALTER TABLE IF EXISTS ONLY public.rfq_master DROP CONSTRAINT IF EXISTS "rfq_master_mrfId_fkey";
ALTER TABLE IF EXISTS ONLY public.po_master DROP CONSTRAINT IF EXISTS "po_master_vendorId_fkey";
ALTER TABLE IF EXISTS ONLY public.po_master DROP CONSTRAINT IF EXISTS "po_master_mrfId_fkey";
ALTER TABLE IF EXISTS ONLY public.payment_details DROP CONSTRAINT IF EXISTS "payment_details_poId_fkey";
ALTER TABLE IF EXISTS ONLY public.otp_store DROP CONSTRAINT IF EXISTS "otp_store_subsidiaryId_fkey";
ALTER TABLE IF EXISTS ONLY public.mst_vendor DROP CONSTRAINT IF EXISTS "mst_vendor_customerId_fkey";
ALTER TABLE IF EXISTS ONLY public.mst_subsidiary DROP CONSTRAINT IF EXISTS "mst_subsidiary_customerId_fkey";
ALTER TABLE IF EXISTS ONLY public.mrf_master DROP CONSTRAINT IF EXISTS "mrf_master_subsidiaryId_fkey";
ALTER TABLE IF EXISTS ONLY public.mrf_master DROP CONSTRAINT IF EXISTS "mrf_master_customerId_fkey";
ALTER TABLE IF EXISTS ONLY public.mrf_items DROP CONSTRAINT IF EXISTS "mrf_items_mrfId_fkey";
ALTER TABLE IF EXISTS ONLY public.mrf_items DROP CONSTRAINT IF EXISTS "mrf_items_itemId_fkey";
ALTER TABLE IF EXISTS ONLY public.goods_inward DROP CONSTRAINT IF EXISTS "goods_inward_subsidiaryId_fkey";
ALTER TABLE IF EXISTS ONLY public.goods_inward DROP CONSTRAINT IF EXISTS "goods_inward_poId_fkey";
DROP INDEX IF EXISTS public.sw_user_details_email_key;
DROP INDEX IF EXISTS public.stk_item_master_code_key;
DROP INDEX IF EXISTS public."rfq_vendor_mapping_secureToken_key";
DROP INDEX IF EXISTS public."rfq_master_rfqNumber_key";
DROP INDEX IF EXISTS public."po_master_poNumber_key";
DROP INDEX IF EXISTS public.mst_subsidiary_code_key;
DROP INDEX IF EXISTS public."mrf_master_mrfNumber_key";
ALTER TABLE IF EXISTS ONLY public.vendor_quote_items DROP CONSTRAINT IF EXISTS vendor_quote_items_pkey;
ALTER TABLE IF EXISTS ONLY public.sw_user_details DROP CONSTRAINT IF EXISTS sw_user_details_pkey;
ALTER TABLE IF EXISTS ONLY public.stk_manufacturer DROP CONSTRAINT IF EXISTS stk_manufacturer_pkey;
ALTER TABLE IF EXISTS ONLY public.stk_item_master DROP CONSTRAINT IF EXISTS stk_item_master_pkey;
ALTER TABLE IF EXISTS ONLY public.stk_group DROP CONSTRAINT IF EXISTS stk_group_pkey;
ALTER TABLE IF EXISTS ONLY public.stk_category DROP CONSTRAINT IF EXISTS stk_category_pkey;
ALTER TABLE IF EXISTS ONLY public.rfq_vendor_mapping DROP CONSTRAINT IF EXISTS rfq_vendor_mapping_pkey;
ALTER TABLE IF EXISTS ONLY public.rfq_master DROP CONSTRAINT IF EXISTS rfq_master_pkey;
ALTER TABLE IF EXISTS ONLY public.po_master DROP CONSTRAINT IF EXISTS po_master_pkey;
ALTER TABLE IF EXISTS ONLY public.payment_details DROP CONSTRAINT IF EXISTS payment_details_pkey;
ALTER TABLE IF EXISTS ONLY public.otp_store DROP CONSTRAINT IF EXISTS otp_store_pkey;
ALTER TABLE IF EXISTS ONLY public.mst_vendor DROP CONSTRAINT IF EXISTS mst_vendor_pkey;
ALTER TABLE IF EXISTS ONLY public.mst_subsidiary DROP CONSTRAINT IF EXISTS mst_subsidiary_pkey;
ALTER TABLE IF EXISTS ONLY public.mst_customer DROP CONSTRAINT IF EXISTS mst_customer_pkey;
ALTER TABLE IF EXISTS ONLY public.mrf_master DROP CONSTRAINT IF EXISTS mrf_master_pkey;
ALTER TABLE IF EXISTS ONLY public.mrf_items DROP CONSTRAINT IF EXISTS mrf_items_pkey;
ALTER TABLE IF EXISTS ONLY public.goods_inward DROP CONSTRAINT IF EXISTS goods_inward_pkey;
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
DROP TABLE IF EXISTS public.vendor_quote_items;
DROP TABLE IF EXISTS public.sw_user_details;
DROP TABLE IF EXISTS public.stk_manufacturer;
DROP TABLE IF EXISTS public.stk_item_master;
DROP TABLE IF EXISTS public.stk_group;
DROP TABLE IF EXISTS public.stk_category;
DROP TABLE IF EXISTS public.rfq_vendor_mapping;
DROP TABLE IF EXISTS public.rfq_master;
DROP TABLE IF EXISTS public.po_master;
DROP TABLE IF EXISTS public.payment_details;
DROP TABLE IF EXISTS public.otp_store;
DROP TABLE IF EXISTS public.mst_vendor;
DROP TABLE IF EXISTS public.mst_subsidiary;
DROP TABLE IF EXISTS public.mst_customer;
DROP TABLE IF EXISTS public.mrf_master;
DROP TABLE IF EXISTS public.mrf_items;
DROP TABLE IF EXISTS public.goods_inward;
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TYPE IF EXISTS public."UserRole";
DROP TYPE IF EXISTS public."RfqStatus";
DROP TYPE IF EXISTS public."PoStatus";
DROP TYPE IF EXISTS public."PaymentStatus";
DROP TYPE IF EXISTS public."MrfStatus";
--
-- Name: MrfStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MrfStatus" AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'APPROVED',
    'REJECTED',
    'RFQ_SENT',
    'PO_ISSUED',
    'CLOSED'
);


--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PARTIAL',
    'PAID'
);


--
-- Name: PoStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PoStatus" AS ENUM (
    'ISSUED',
    'DELIVERED',
    'COMPLETED'
);


--
-- Name: RfqStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RfqStatus" AS ENUM (
    'OPEN',
    'CLOSED'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'STAFF'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: goods_inward; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goods_inward (
    id text NOT NULL,
    "poId" text NOT NULL,
    "subsidiaryId" text NOT NULL,
    "receivedDate" timestamp(3) without time zone NOT NULL,
    remarks text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: mrf_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mrf_items (
    id text NOT NULL,
    "mrfId" text NOT NULL,
    "itemId" text NOT NULL,
    description text,
    qty double precision NOT NULL,
    "expectedRate" double precision DEFAULT 0 NOT NULL,
    "taxPercent" double precision DEFAULT 0 NOT NULL,
    "otherCharges" double precision DEFAULT 0 NOT NULL,
    "totalAmount" double precision DEFAULT 0 NOT NULL
);


--
-- Name: mrf_master; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mrf_master (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "subsidiaryId" text NOT NULL,
    "mrfNumber" text NOT NULL,
    status public."MrfStatus" DEFAULT 'DRAFT'::public."MrfStatus" NOT NULL,
    "totalAmount" double precision DEFAULT 0 NOT NULL,
    remarks text,
    "preferredVendor" text,
    "requiredByDate" timestamp(3) without time zone,
    "rejectedReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "submittedAt" timestamp(3) without time zone,
    "approvedAt" timestamp(3) without time zone,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: mst_customer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mst_customer (
    id text NOT NULL,
    name text NOT NULL,
    address text,
    city text,
    state text,
    country text,
    email text,
    phone text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: mst_subsidiary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mst_subsidiary (
    id text NOT NULL,
    "customerId" text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    address text,
    city text,
    state text,
    mobile text NOT NULL,
    email text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: mst_vendor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mst_vendor (
    id text NOT NULL,
    "customerId" text NOT NULL,
    name text NOT NULL,
    address text,
    "gstNo" text,
    "panNo" text,
    "contactPerson" text,
    mobile text,
    email text,
    "vendorType" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: otp_store; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.otp_store (
    id text NOT NULL,
    mobile text NOT NULL,
    code text NOT NULL,
    "subsidiaryId" text,
    purpose text DEFAULT 'LOGIN'::text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: payment_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_details (
    id text NOT NULL,
    "poId" text NOT NULL,
    "amountPaid" double precision NOT NULL,
    "paymentDate" timestamp(3) without time zone NOT NULL,
    "paymentMode" text,
    "referenceNo" text,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: po_master; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.po_master (
    id text NOT NULL,
    "mrfId" text NOT NULL,
    "vendorId" text NOT NULL,
    "poNumber" text NOT NULL,
    "totalAmount" double precision DEFAULT 0 NOT NULL,
    "deliveryPeriod" text,
    "paymentTerms" text,
    "termsConditions" text,
    status public."PoStatus" DEFAULT 'ISSUED'::public."PoStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: rfq_master; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rfq_master (
    id text NOT NULL,
    "mrfId" text NOT NULL,
    "rfqNumber" text NOT NULL,
    "lastDateSubmission" timestamp(3) without time zone,
    status public."RfqStatus" DEFAULT 'OPEN'::public."RfqStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: rfq_vendor_mapping; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rfq_vendor_mapping (
    id text NOT NULL,
    "rfqId" text NOT NULL,
    "vendorId" text NOT NULL,
    "secureToken" text NOT NULL,
    "tokenExpiresAt" timestamp(3) without time zone,
    "emailSent" boolean DEFAULT false NOT NULL,
    "quoteSubmitted" boolean DEFAULT false NOT NULL,
    "submittedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: stk_category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stk_category (
    id text NOT NULL,
    "customerId" text NOT NULL,
    name text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: stk_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stk_group (
    id text NOT NULL,
    "customerId" text NOT NULL,
    name text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: stk_item_master; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stk_item_master (
    id text NOT NULL,
    "customerId" text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "categoryId" text,
    "groupId" text,
    "manufacturerId" text,
    uom text DEFAULT 'Nos'::text NOT NULL,
    "openingQty" double precision DEFAULT 0 NOT NULL,
    "currentQty" double precision DEFAULT 0 NOT NULL,
    "minLevel" double precision DEFAULT 0 NOT NULL,
    "reorderLevel" double precision DEFAULT 0 NOT NULL,
    "lastPurchaseDate" timestamp(3) without time zone,
    "lastPurchaseRate" double precision,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: stk_manufacturer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stk_manufacturer (
    id text NOT NULL,
    "customerId" text NOT NULL,
    name text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: sw_user_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sw_user_details (
    id text NOT NULL,
    "customerId" text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    mobile text,
    password text NOT NULL,
    role public."UserRole" DEFAULT 'STAFF'::public."UserRole" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isBlocked" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: vendor_quote_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_quote_items (
    id text NOT NULL,
    "rfqId" text NOT NULL,
    "vendorId" text NOT NULL,
    "mappingId" text NOT NULL,
    "itemId" text NOT NULL,
    "technicalDetails" text,
    rate double precision DEFAULT 0 NOT NULL,
    "taxPercent" double precision DEFAULT 0 NOT NULL,
    "otherCharges" double precision DEFAULT 0 NOT NULL,
    "totalAmount" double precision DEFAULT 0 NOT NULL,
    "deliveryDays" integer,
    warranty text,
    terms text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
ac898d75-1075-4c72-972c-268d410377c9	98c6adc48183849d72bc455a4cfd5acb068998818f5a59953761d1e1ac5d6422	2026-03-02 16:56:11.506834+00	20260302165611_init	\N	\N	2026-03-02 16:56:11.434188+00	1
\.


--
-- Data for Name: goods_inward; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.goods_inward (id, "poId", "subsidiaryId", "receivedDate", remarks, "createdAt") FROM stdin;
cmmccivkf0000xxit54mll1bj	cmmcce1a2000bnbit6qx79djl	cmmcbcftu0000e2it3meybr4q	2026-03-04 18:04:11.724	got the items	2026-03-04 18:04:11.727
\.


--
-- Data for Name: mrf_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mrf_items (id, "mrfId", "itemId", description, qty, "expectedRate", "taxPercent", "otherCharges", "totalAmount") FROM stdin;
cmmav65f50002x2itm0hargdr	cmmav65ez0001x2it47ppe61d	cmm9f9y9t000tj0itdcaltl1c	chumma	4	100	0	0	0
cmmav65f50003x2iti6fw4aal	cmmav65ez0001x2it47ppe61d	cmm9f9y9p000rj0itnumc01w9	hehe	4	200	0	0	0
cmmavjjgk0006x2it6kh2rpgj	cmmav78gv0004x2it736dfyrq	cmm9f9y9k000pj0it90hlenpa	\N	2	30000	0	0	0
cmmavjjgk0007x2itsn3keqyw	cmmav78gv0004x2it736dfyrq	cmm9f9y9p000rj0itnumc01w9	\N	1	500	0	0	0
cmmavsg4y0009x2itxjr47bln	cmmavsg4u0008x2ita5p6nfsu	cmm9f9y9n000qj0itv06t4q9i	lets see	2	1000	0	0	2000
cmmcbemc60005e2itx0taui39	cmmcbec2c0002e2itn288xaup	cmm9f9y9p000rj0itnumc01w9	white a4 sheets	2	300	0	0	600
cmmcbemc60006e2it0wjhzhme	cmmcbec2c0002e2itn288xaup	cmm9f9y9k000pj0it90hlenpa	black laptops	10	40000	0	0	400000
cmmcc40nn0001y5itsspll27n	cmmcc40nh0000y5itm5g83hl4	cmm9f9y9p000rj0itnumc01w9	\N	1	100	0	0	100
cmmcc40nn0002y5itk80ik5kx	cmmcc40nh0000y5itm5g83hl4	cmm9f9y9t000tj0itdcaltl1c	\N	8	50	0	0	400
\.


--
-- Data for Name: mrf_master; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mrf_master (id, "customerId", "subsidiaryId", "mrfNumber", status, "totalAmount", remarks, "preferredVendor", "requiredByDate", "rejectedReason", "createdAt", "submittedAt", "approvedAt", "updatedAt") FROM stdin;
cmmav78gv0004x2it736dfyrq	default-customer-id	cmm9f9y8t0002j0itd0ry0ah0	MRF-INST001-0002	REJECTED	0	\N	\N	\N	we do not have the vendors to supply it 	2026-03-03 17:11:28.925	2026-03-03 17:21:14.518	\N	2026-03-03 17:21:38.972
cmmav65ez0001x2it47ppe61d	default-customer-id	cmm9f9y8t0002j0itd0ry0ah0	MRF-INST001-0001	PO_ISSUED	0	\N	\N	\N	\N	2026-03-03 17:10:38.314	2026-03-03 17:11:08.067	2026-03-03 17:20:10.839	2026-03-03 19:12:33.958
cmmavsg4u0008x2ita5p6nfsu	default-customer-id	cmm9f9y8t0002j0itd0ry0ah0	MRF-INST001-0003	RFQ_SENT	2000	lets see	\N	\N	\N	2026-03-03 17:27:58.637	2026-03-03 18:40:12.233	2026-03-03 19:39:59.583	2026-03-03 19:40:07.789
cmmcbec2c0002e2itn288xaup	default-customer-id	cmmcbcftu0000e2it3meybr4q	MRF-INST005-0001	RFQ_SENT	400600	want it by 10th march	\N	\N	\N	2026-03-04 17:32:40.21	2026-03-04 17:49:10.562	2026-03-04 17:54:09.986	2026-03-04 17:54:46.443
cmmcc40nh0000y5itm5g83hl4	default-customer-id	cmmcbcftu0000e2it3meybr4q	MRF-INST005-0002	CLOSED	500	lets see 	\N	\N	\N	2026-03-04 17:52:38.476	2026-03-04 17:52:51.349	2026-03-04 17:57:42.247	2026-03-04 18:04:33.804
\.


--
-- Data for Name: mst_customer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mst_customer (id, name, address, city, state, country, email, phone, "isActive", "createdAt", "updatedAt") FROM stdin;
default-customer-id	Group of Institutions	123 Education Road	Pune	Maharashtra	India	admin@institutions.org	9876543210	t	2026-03-02 16:57:55.169	2026-03-02 16:57:55.169
\.


--
-- Data for Name: mst_subsidiary; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mst_subsidiary (id, "customerId", code, name, address, city, state, mobile, email, "isActive", "createdAt", "updatedAt") FROM stdin;
cmm9f9y8w0003j0itzxjzn3xp	default-customer-id	INST002	Medical College - Main Campus	\N	Mumbai	Maharashtra	9222222222	inst002@institution.edu	t	2026-03-02 16:57:55.616	2026-03-02 16:57:55.616
cmm9f9y8y0004j0itdgejmgtu	default-customer-id	INST003	Law College - East Campus	\N	Nagpur	Maharashtra	9333333333	inst003@institution.edu	t	2026-03-02 16:57:55.617	2026-03-02 16:57:55.617
cmm9f9y8t0002j0itd0ry0ah0	default-customer-id	INST001	Engineering College - South Campus		Pune	Maharashtra	9111111111	inst001@institution.edu	t	2026-03-02 16:57:55.611	2026-03-03 17:02:20.651
cmmcar2im0000frit5rx2umq6	default-customer-id	INST004	New college	Pune	Pune	Maharashtra	1234567890	INST004@gmail.com	t	2026-03-04 17:14:34.75	2026-03-04 17:14:34.75
cmmcbcftu0000e2it3meybr4q	default-customer-id	INST005	New college 5	Pune	Pune	Maharashtra	8495959095	testeverythinginthisworld@gmail.com	t	2026-03-04 17:31:11.778	2026-03-04 17:31:11.778
\.


--
-- Data for Name: mst_vendor; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mst_vendor (id, "customerId", name, address, "gstNo", "panNo", "contactPerson", mobile, email, "vendorType", "isActive", "createdAt", "updatedAt") FROM stdin;
cmm9f9y900005j0itn7ie0exq	default-customer-id	Tech Supplies Pvt Ltd	\N	27AAACT1234F1Z5	\N	Raj Kumar	9400000001	raj@techsupplies.com	GOODS	t	2026-03-02 16:57:55.62	2026-03-02 16:57:55.62
cmm9f9y910006j0itdqsixez9	default-customer-id	Office Mart India	\N	27AABCO5678G1Z2	\N	Priya Sharma	9400000002	priya@officemart.in	GOODS	t	2026-03-02 16:57:55.621	2026-03-02 16:57:55.621
cmm9f9y920007j0itxbuwlkz1	default-customer-id	Infra Services Ltd	\N	\N	\N	Suresh Patil	9400000003	suresh@infraservices.co	SERVICES	t	2026-03-02 16:57:55.622	2026-03-02 16:57:55.622
cmm9f9y930008j0itvkiyx52d	default-customer-id	Lab Equipment Corp	\N	\N	\N	Anita Desai	9400000004	anita@labequip.com	GOODS	t	2026-03-02 16:57:55.623	2026-03-02 16:57:55.623
\.


--
-- Data for Name: otp_store; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.otp_store (id, mobile, code, "subsidiaryId", purpose, "expiresAt", "usedAt", "createdAt") FROM stdin;
cmm9hlzbr000080it56ua1ci2	9111111111	275864	cmm9f9y8t0002j0itd0ry0ah0	LOGIN	2026-03-02 18:08:16.116	2026-03-03 17:02:56.207	2026-03-02 18:03:16.119
cmmauw8ux0000x2itsrahqm58	9111111111	574820	cmm9f9y8t0002j0itd0ry0ah0	LOGIN	2026-03-03 17:07:56.214	2026-03-04 17:24:31.194	2026-03-03 17:02:56.217
cmmcb3uqp0001fritqrdymq5m	9111111111	295664	cmm9f9y8t0002j0itd0ry0ah0	LOGIN	2026-03-04 17:29:31.201	\N	2026-03-04 17:24:31.201
cmmcbcsxa0001e2itf9obtcvu	8495959095	652823	cmmcbcftu0000e2it3meybr4q	LOGIN	2026-03-04 17:36:28.749	2026-03-04 17:31:47.816	2026-03-04 17:31:28.75
cmmcboc1l00006zituok9hgmu	8495959095	777836	\N	MRF_SUBMIT	2026-03-04 17:45:26.744	2026-03-04 17:40:30.131	2026-03-04 17:40:26.745
cmmcboenu00016zit9vfdk2vh	8495959095	914428	\N	MRF_SUBMIT	2026-03-04 17:45:30.138	2026-03-04 17:48:35.197	2026-03-04 17:40:30.138
cmmcbysy000007fitiuhi543w	8495959095	984012	\N	MRF_SUBMIT	2026-03-04 17:53:35.205	2026-03-04 17:48:49.324	2026-03-04 17:48:35.208
cmmcbz3u800017fitdbgl6m5p	8495959095	978120	\N	MRF_SUBMIT	2026-03-04 17:53:49.328	2026-03-04 17:49:10.557	2026-03-04 17:48:49.328
cmmcc42r80003y5itbhp9ap3v	8495959095	276550	\N	MRF_SUBMIT	2026-03-04 17:57:41.203	2026-03-04 17:52:51.346	2026-03-04 17:52:41.204
\.


--
-- Data for Name: payment_details; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_details (id, "poId", "amountPaid", "paymentDate", "paymentMode", "referenceNo", status, "createdAt", "updatedAt") FROM stdin;
cmmb044hk0001r8itsje38ml8	cmmaziy700000r8itp1vfogzt	1557	2026-03-05 00:00:00	NEFT	ekfnerwngo4e	PAID	2026-03-03 19:29:01.88	2026-03-03 19:29:01.88
cmmb04klv0002r8itzwm04uvg	cmmaziy700000r8itp1vfogzt	0.6	2026-03-05 00:00:00	UPI	rggg	PAID	2026-03-03 19:29:22.771	2026-03-03 19:29:22.771
cmmccjclk0001xxitn36vsyjr	cmmcce1a2000bnbit6qx79djl	618.78	2026-03-05 00:00:00	RTGS	1234	PAID	2026-03-04 18:04:33.8	2026-03-04 18:04:33.8
\.


--
-- Data for Name: po_master; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.po_master (id, "mrfId", "vendorId", "poNumber", "totalAmount", "deliveryPeriod", "paymentTerms", "termsConditions", status, "createdAt", "updatedAt") FROM stdin;
cmmaziy700000r8itp1vfogzt	cmmav65ez0001x2it47ppe61d	cmm9f9y930008j0itvkiyx52d	PO-2026-0001	1557.6			\N	COMPLETED	2026-03-03 19:12:33.948	2026-03-03 19:29:22.775
cmmcce1a2000bnbit6qx79djl	cmmcc40nh0000y5itm5g83hl4	cmm9f9y910006j0itdqsixez9	PO-2026-0002	618.78	6 days	2 days	\N	COMPLETED	2026-03-04 18:00:25.85	2026-03-04 18:04:33.802
\.


--
-- Data for Name: rfq_master; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rfq_master (id, "mrfId", "rfqNumber", "lastDateSubmission", status, "createdAt", "updatedAt") FROM stdin;
cmmayl0te000bx2it0dmxo147	cmmav65ez0001x2it47ppe61d	RFQ-2026-0001	2026-03-07 00:00:00	OPEN	2026-03-03 18:46:11.042	2026-03-03 18:46:11.042
cmmb0ieas0003r8it33u5z3yg	cmmavsg4u0008x2ita5p6nfsu	RFQ-2026-0002	2026-03-07 00:00:00	OPEN	2026-03-03 19:40:07.778	2026-03-03 19:40:07.778
cmmcc6rdq0004y5itomrwjlo7	cmmcbec2c0002e2itn288xaup	RFQ-2026-0003	2026-03-09 00:00:00	OPEN	2026-03-04 17:54:46.428	2026-03-04 17:54:46.428
cmmccaph70000nbitvqjkwpmf	cmmcc40nh0000y5itm5g83hl4	RFQ-2026-0004	2026-03-09 00:00:00	OPEN	2026-03-04 17:57:50.586	2026-03-04 17:57:50.586
\.


--
-- Data for Name: rfq_vendor_mapping; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rfq_vendor_mapping (id, "rfqId", "vendorId", "secureToken", "tokenExpiresAt", "emailSent", "quoteSubmitted", "submittedAt", "createdAt") FROM stdin;
cmmayl0ti000gx2it9g3zt8xq	cmmayl0te000bx2it0dmxo147	cmm9f9y910006j0itdqsixez9	cmmayl0ti000hx2it8jy238uk	2026-03-07 00:00:00	f	f	\N	2026-03-03 18:46:11.042
cmmayl0ti000ix2itq2m3i8xq	cmmayl0te000bx2it0dmxo147	cmm9f9y900005j0itn7ie0exq	cmmayl0ti000jx2itott1dden	2026-03-07 00:00:00	f	f	\N	2026-03-03 18:46:11.042
cmmayl0ti000cx2itaaavch7o	cmmayl0te000bx2it0dmxo147	cmm9f9y920007j0itxbuwlkz1	cmmayl0ti000dx2ithun1zkap	2026-03-07 00:00:00	f	t	2026-03-03 18:53:04.718	2026-03-03 18:46:11.042
cmmayl0ti000ex2itvddwfhgd	cmmayl0te000bx2it0dmxo147	cmm9f9y930008j0itvkiyx52d	cmmayl0ti000fx2it1d2i49yl	2026-03-07 00:00:00	f	t	2026-03-03 18:55:56.152	2026-03-03 18:46:11.042
cmmb0ieau0004r8it1dtrju7c	cmmb0ieas0003r8it33u5z3yg	cmm9f9y920007j0itxbuwlkz1	cmmb0ieau0005r8ituqx5l884	2026-03-07 00:00:00	f	f	\N	2026-03-03 19:40:07.778
cmmb0ieau0006r8itzxoftxbs	cmmb0ieas0003r8it33u5z3yg	cmm9f9y930008j0itvkiyx52d	cmmb0ieau0007r8it19b4ka6y	2026-03-07 00:00:00	f	f	\N	2026-03-03 19:40:07.778
cmmcc6rdt0005y5itmaoslj15	cmmcc6rdq0004y5itomrwjlo7	cmm9f9y920007j0itxbuwlkz1	cmmcc6rdt0006y5it8o7xtghz	2026-03-09 00:00:00	f	f	\N	2026-03-04 17:54:46.428
cmmcc6rdt0007y5it35hfp5pt	cmmcc6rdq0004y5itomrwjlo7	cmm9f9y930008j0itvkiyx52d	cmmcc6rdt0008y5itmd43cjtq	2026-03-09 00:00:00	f	f	\N	2026-03-04 17:54:46.428
cmmcc6rdt0009y5ityw3i7zyj	cmmcc6rdq0004y5itomrwjlo7	cmm9f9y910006j0itdqsixez9	cmmcc6rdt000ay5it6vcxbmjc	2026-03-09 00:00:00	f	f	\N	2026-03-04 17:54:46.428
cmmcc6rdt000by5it7l61q43t	cmmcc6rdq0004y5itomrwjlo7	cmm9f9y900005j0itn7ie0exq	cmmcc6rdt000cy5itsbye3tjq	2026-03-09 00:00:00	f	f	\N	2026-03-04 17:54:46.428
cmmccaph80001nbitwi3tvb1r	cmmccaph70000nbitvqjkwpmf	cmm9f9y920007j0itxbuwlkz1	cmmccaph80002nbit59ifk37m	2026-03-09 00:00:00	f	f	\N	2026-03-04 17:57:50.586
cmmccaph80003nbitof72sxz3	cmmccaph70000nbitvqjkwpmf	cmm9f9y930008j0itvkiyx52d	cmmccaph80004nbitvtllesgc	2026-03-09 00:00:00	f	f	\N	2026-03-04 17:57:50.586
cmmccaph80007nbit58qy5mw6	cmmccaph70000nbitvqjkwpmf	cmm9f9y900005j0itn7ie0exq	cmmccaph80008nbitqlmg228k	2026-03-09 00:00:00	f	f	\N	2026-03-04 17:57:50.586
cmmccaph80005nbith7uyc7um	cmmccaph70000nbitvqjkwpmf	cmm9f9y910006j0itdqsixez9	cmmccaph80006nbitrg6ixedl	2026-03-09 00:00:00	f	t	2026-03-04 17:59:38.9	2026-03-04 17:57:50.586
\.


--
-- Data for Name: stk_category; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stk_category (id, "customerId", name, "isActive", "createdAt", "updatedAt") FROM stdin;
cmm9f9y950009j0itc0ybjb15	default-customer-id	Laboratory Equipment	t	2026-03-02 16:57:55.625	2026-03-02 16:57:55.625
cmm9f9y96000aj0it9y399him	default-customer-id	Office Supplies	t	2026-03-02 16:57:55.626	2026-03-02 16:57:55.626
cmm9f9y97000bj0it3k0bweu4	default-customer-id	IT Equipment	t	2026-03-02 16:57:55.627	2026-03-02 16:57:55.627
cmm9f9y97000cj0itywja20cn	default-customer-id	Furniture	t	2026-03-02 16:57:55.627	2026-03-02 16:57:55.627
cmm9f9y98000dj0it2taid54r	default-customer-id	Electrical	t	2026-03-02 16:57:55.628	2026-03-02 16:57:55.628
cmm9f9y99000ej0it2eiy2ohu	default-customer-id	Plumbing	t	2026-03-02 16:57:55.629	2026-03-02 16:57:55.629
\.


--
-- Data for Name: stk_group; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stk_group (id, "customerId", name, "isActive", "createdAt", "updatedAt") FROM stdin;
cmm9f9y9a000fj0itt27p2zqi	default-customer-id	Consumables	t	2026-03-02 16:57:55.63	2026-03-02 16:57:55.63
cmm9f9y9b000gj0itts5x1yuh	default-customer-id	Capital Equipment	t	2026-03-02 16:57:55.63	2026-03-02 16:57:55.63
cmm9f9y9b000hj0it4uad067k	default-customer-id	Tools	t	2026-03-02 16:57:55.631	2026-03-02 16:57:55.631
cmm9f9y9c000ij0itpr1r94w8	default-customer-id	Stationery	t	2026-03-02 16:57:55.632	2026-03-02 16:57:55.632
cmmayesv1000ax2itkm7l29gu	default-customer-id	Metal tools	t	2026-03-03 18:41:20.797	2026-03-03 18:41:20.797
\.


--
-- Data for Name: stk_item_master; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stk_item_master (id, "customerId", code, name, "categoryId", "groupId", "manufacturerId", uom, "openingQty", "currentQty", "minLevel", "reorderLevel", "lastPurchaseDate", "lastPurchaseRate", "isActive", "createdAt", "updatedAt") FROM stdin;
cmm9f9y9k000pj0it90hlenpa	default-customer-id	ITM001	Dell Laptop 15 inch	cmm9f9y97000bj0it3k0bweu4	\N	\N	Nos	5	5	2	4	\N	\N	t	2026-03-02 16:57:55.639	2026-03-02 16:57:55.639
cmm9f9y9n000qj0itv06t4q9i	default-customer-id	ITM002	HP Printer LaserJet	cmm9f9y97000bj0it3k0bweu4	\N	\N	Nos	3	3	1	2	\N	\N	t	2026-03-02 16:57:55.642	2026-03-02 16:57:55.642
cmm9f9y9r000sj0it3q9vy34v	default-customer-id	ITM004	Office Chair Revolving	cmm9f9y97000cj0itywja20cn	\N	\N	Nos	20	20	5	10	\N	\N	t	2026-03-02 16:57:55.646	2026-03-02 16:57:55.646
cmm9f9y9v000uj0itmvil9g6o	default-customer-id	ITM006	LED Bulb 18W	cmm9f9y98000dj0it2taid54r	\N	\N	Nos	200	200	50	80	\N	\N	t	2026-03-02 16:57:55.65	2026-03-02 16:57:55.65
cmm9f9y9p000rj0itnumc01w9	default-customer-id	ITM003	A4 Paper Ream 500 Sheets	cmm9f9y96000aj0it9y399him	\N	\N	Box	50	51	10	20	\N	\N	t	2026-03-02 16:57:55.644	2026-03-04 18:04:11.735
cmm9f9y9t000tj0itdcaltl1c	default-customer-id	ITM005	Beaker 250ml Borosil	cmm9f9y950009j0itc0ybjb15	\N	\N	Nos	100	108	20	40	\N	\N	t	2026-03-02 16:57:55.649	2026-03-04 18:04:11.739
\.


--
-- Data for Name: stk_manufacturer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stk_manufacturer (id, "customerId", name, "isActive", "createdAt", "updatedAt") FROM stdin;
cmm9f9y9d000jj0itsdkesmkb	default-customer-id	Dell	t	2026-03-02 16:57:55.633	2026-03-02 16:57:55.633
cmm9f9y9e000kj0itjlnylo8b	default-customer-id	HP	t	2026-03-02 16:57:55.634	2026-03-02 16:57:55.634
cmm9f9y9e000lj0itqg3yu77u	default-customer-id	Samsung	t	2026-03-02 16:57:55.634	2026-03-02 16:57:55.634
cmm9f9y9f000mj0itm7dh51qo	default-customer-id	Borosil	t	2026-03-02 16:57:55.635	2026-03-02 16:57:55.635
cmm9f9y9g000nj0itfvwlo5wj	default-customer-id	Merck	t	2026-03-02 16:57:55.636	2026-03-02 16:57:55.636
cmm9f9y9h000oj0itwmr1etc0	default-customer-id	Local Brand	t	2026-03-02 16:57:55.637	2026-03-02 16:57:55.637
\.


--
-- Data for Name: sw_user_details; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sw_user_details (id, "customerId", name, email, mobile, password, role, "isActive", "isBlocked", "createdAt", "updatedAt") FROM stdin;
cmm9f9y320000j0it23dltfua	default-customer-id	System Admin	admin@pms.local	9000000001	$2b$12$zibi/B2pjFUOFuqU6tstQOCv6.G3m96SnIrhwhgJQcSrNEk7NEutO	ADMIN	t	f	2026-03-02 16:57:55.403	2026-03-02 16:57:55.403
cmm9f9y8o0001j0ittfmmln4g	default-customer-id	CPT Staff	staff@pms.local	9000000002	$2b$12$.eJ6m10WN5opqSYgzxb2p.87BDoZKJ/P89eF1VHZ9ZmbRzuD7UZuG	STAFF	t	f	2026-03-02 16:57:55.606	2026-03-02 16:57:55.606
\.


--
-- Data for Name: vendor_quote_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vendor_quote_items (id, "rfqId", "vendorId", "mappingId", "itemId", "technicalDetails", rate, "taxPercent", "otherCharges", "totalAmount", "deliveryDays", warranty, terms, "createdAt") FROM stdin;
cmmaytw0j000kx2ito7ftlg52	cmmayl0te000bx2it0dmxo147	cmm9f9y920007j0itxbuwlkz1	cmmayl0ti000cx2itaaavch7o	cmm9f9y9t000tj0itdcaltl1c	packaging will be done	250	18	10	1190	8	1 year 	15 days	2026-03-03 18:53:04.723
cmmaytw0o000lx2ith9547mbu	cmmayl0te000bx2it0dmxo147	cmm9f9y920007j0itxbuwlkz1	cmmayl0ti000cx2itaaavch7o	cmm9f9y9p000rj0itnumc01w9	comes with cover	100	18	10	482	8	1 year 	15 days	2026-03-03 18:53:04.728
cmmayxkam000mx2itfayipnw2	cmmayl0te000bx2it0dmxo147	cmm9f9y930008j0itvkiyx52d	cmmayl0ti000ex2itvddwfhgd	cmm9f9y9t000tj0itdcaltl1c		240	18	0	1132.8	\N	\N	\N	2026-03-03 18:55:56.158
cmmayxkaq000nx2itmfkeba88	cmmayl0te000bx2it0dmxo147	cmm9f9y930008j0itvkiyx52d	cmmayl0ti000ex2itvddwfhgd	cmm9f9y9p000rj0itnumc01w9		90	18	0	424.8	\N	\N	\N	2026-03-03 18:55:56.162
cmmccd1220009nbit5xo4xytn	cmmccaph70000nbitvqjkwpmf	cmm9f9y910006j0itdqsixez9	cmmccaph80005nbith7uyc7um	cmm9f9y9p000rj0itnumc01w9		105	18	2	125.9	6	1 year	2 days	2026-03-04 17:59:38.906
cmmccd126000anbitwud03uei	cmmccaph70000nbitvqjkwpmf	cmm9f9y910006j0itdqsixez9	cmmccaph80005nbith7uyc7um	cmm9f9y9t000tj0itdcaltl1c		52	18	2	492.88	6	1 year	2 days	2026-03-04 17:59:38.91
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: goods_inward goods_inward_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_inward
    ADD CONSTRAINT goods_inward_pkey PRIMARY KEY (id);


--
-- Name: mrf_items mrf_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mrf_items
    ADD CONSTRAINT mrf_items_pkey PRIMARY KEY (id);


--
-- Name: mrf_master mrf_master_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mrf_master
    ADD CONSTRAINT mrf_master_pkey PRIMARY KEY (id);


--
-- Name: mst_customer mst_customer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mst_customer
    ADD CONSTRAINT mst_customer_pkey PRIMARY KEY (id);


--
-- Name: mst_subsidiary mst_subsidiary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mst_subsidiary
    ADD CONSTRAINT mst_subsidiary_pkey PRIMARY KEY (id);


--
-- Name: mst_vendor mst_vendor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mst_vendor
    ADD CONSTRAINT mst_vendor_pkey PRIMARY KEY (id);


--
-- Name: otp_store otp_store_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_store
    ADD CONSTRAINT otp_store_pkey PRIMARY KEY (id);


--
-- Name: payment_details payment_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_details
    ADD CONSTRAINT payment_details_pkey PRIMARY KEY (id);


--
-- Name: po_master po_master_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_master
    ADD CONSTRAINT po_master_pkey PRIMARY KEY (id);


--
-- Name: rfq_master rfq_master_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfq_master
    ADD CONSTRAINT rfq_master_pkey PRIMARY KEY (id);


--
-- Name: rfq_vendor_mapping rfq_vendor_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfq_vendor_mapping
    ADD CONSTRAINT rfq_vendor_mapping_pkey PRIMARY KEY (id);


--
-- Name: stk_category stk_category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stk_category
    ADD CONSTRAINT stk_category_pkey PRIMARY KEY (id);


--
-- Name: stk_group stk_group_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stk_group
    ADD CONSTRAINT stk_group_pkey PRIMARY KEY (id);


--
-- Name: stk_item_master stk_item_master_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stk_item_master
    ADD CONSTRAINT stk_item_master_pkey PRIMARY KEY (id);


--
-- Name: stk_manufacturer stk_manufacturer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stk_manufacturer
    ADD CONSTRAINT stk_manufacturer_pkey PRIMARY KEY (id);


--
-- Name: sw_user_details sw_user_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sw_user_details
    ADD CONSTRAINT sw_user_details_pkey PRIMARY KEY (id);


--
-- Name: vendor_quote_items vendor_quote_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_quote_items
    ADD CONSTRAINT vendor_quote_items_pkey PRIMARY KEY (id);


--
-- Name: mrf_master_mrfNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "mrf_master_mrfNumber_key" ON public.mrf_master USING btree ("mrfNumber");


--
-- Name: mst_subsidiary_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX mst_subsidiary_code_key ON public.mst_subsidiary USING btree (code);


--
-- Name: po_master_poNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "po_master_poNumber_key" ON public.po_master USING btree ("poNumber");


--
-- Name: rfq_master_rfqNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "rfq_master_rfqNumber_key" ON public.rfq_master USING btree ("rfqNumber");


--
-- Name: rfq_vendor_mapping_secureToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "rfq_vendor_mapping_secureToken_key" ON public.rfq_vendor_mapping USING btree ("secureToken");


--
-- Name: stk_item_master_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX stk_item_master_code_key ON public.stk_item_master USING btree (code);


--
-- Name: sw_user_details_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sw_user_details_email_key ON public.sw_user_details USING btree (email);


--
-- Name: goods_inward goods_inward_poId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_inward
    ADD CONSTRAINT "goods_inward_poId_fkey" FOREIGN KEY ("poId") REFERENCES public.po_master(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: goods_inward goods_inward_subsidiaryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_inward
    ADD CONSTRAINT "goods_inward_subsidiaryId_fkey" FOREIGN KEY ("subsidiaryId") REFERENCES public.mst_subsidiary(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: mrf_items mrf_items_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mrf_items
    ADD CONSTRAINT "mrf_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public.stk_item_master(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: mrf_items mrf_items_mrfId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mrf_items
    ADD CONSTRAINT "mrf_items_mrfId_fkey" FOREIGN KEY ("mrfId") REFERENCES public.mrf_master(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: mrf_master mrf_master_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mrf_master
    ADD CONSTRAINT "mrf_master_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.mst_customer(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: mrf_master mrf_master_subsidiaryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mrf_master
    ADD CONSTRAINT "mrf_master_subsidiaryId_fkey" FOREIGN KEY ("subsidiaryId") REFERENCES public.mst_subsidiary(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: mst_subsidiary mst_subsidiary_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mst_subsidiary
    ADD CONSTRAINT "mst_subsidiary_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.mst_customer(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: mst_vendor mst_vendor_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mst_vendor
    ADD CONSTRAINT "mst_vendor_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.mst_customer(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: otp_store otp_store_subsidiaryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_store
    ADD CONSTRAINT "otp_store_subsidiaryId_fkey" FOREIGN KEY ("subsidiaryId") REFERENCES public.mst_subsidiary(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payment_details payment_details_poId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_details
    ADD CONSTRAINT "payment_details_poId_fkey" FOREIGN KEY ("poId") REFERENCES public.po_master(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: po_master po_master_mrfId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_master
    ADD CONSTRAINT "po_master_mrfId_fkey" FOREIGN KEY ("mrfId") REFERENCES public.mrf_master(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: po_master po_master_vendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_master
    ADD CONSTRAINT "po_master_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES public.mst_vendor(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rfq_master rfq_master_mrfId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfq_master
    ADD CONSTRAINT "rfq_master_mrfId_fkey" FOREIGN KEY ("mrfId") REFERENCES public.mrf_master(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rfq_vendor_mapping rfq_vendor_mapping_rfqId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfq_vendor_mapping
    ADD CONSTRAINT "rfq_vendor_mapping_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES public.rfq_master(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rfq_vendor_mapping rfq_vendor_mapping_vendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfq_vendor_mapping
    ADD CONSTRAINT "rfq_vendor_mapping_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES public.mst_vendor(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stk_category stk_category_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stk_category
    ADD CONSTRAINT "stk_category_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.mst_customer(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stk_group stk_group_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stk_group
    ADD CONSTRAINT "stk_group_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.mst_customer(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stk_item_master stk_item_master_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stk_item_master
    ADD CONSTRAINT "stk_item_master_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.stk_category(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stk_item_master stk_item_master_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stk_item_master
    ADD CONSTRAINT "stk_item_master_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.mst_customer(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stk_item_master stk_item_master_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stk_item_master
    ADD CONSTRAINT "stk_item_master_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public.stk_group(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stk_item_master stk_item_master_manufacturerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stk_item_master
    ADD CONSTRAINT "stk_item_master_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES public.stk_manufacturer(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stk_manufacturer stk_manufacturer_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stk_manufacturer
    ADD CONSTRAINT "stk_manufacturer_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.mst_customer(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sw_user_details sw_user_details_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sw_user_details
    ADD CONSTRAINT "sw_user_details_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.mst_customer(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: vendor_quote_items vendor_quote_items_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_quote_items
    ADD CONSTRAINT "vendor_quote_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public.stk_item_master(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: vendor_quote_items vendor_quote_items_mappingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_quote_items
    ADD CONSTRAINT "vendor_quote_items_mappingId_fkey" FOREIGN KEY ("mappingId") REFERENCES public.rfq_vendor_mapping(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: vendor_quote_items vendor_quote_items_vendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_quote_items
    ADD CONSTRAINT "vendor_quote_items_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES public.mst_vendor(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict GeAyErlgnTwYDpZEo90k2GZ3XEvUijaQgXdFiOuAwZ8oKns9N7b0hAagV84eBtD

