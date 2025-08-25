--
-- PostgreSQL database dump
--

\restrict bFEAOhkfW0GguafcfZsxvBQz6w4hbFh0CEJH2eb8g4AFwIu56N5lnSFKS2DcC5k

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

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
-- Name: AppointmentStatus; Type: TYPE; Schema: public; Owner: clinica_user
--

CREATE TYPE public."AppointmentStatus" AS ENUM (
    'SCHEDULED',
    'CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW'
);


ALTER TYPE public."AppointmentStatus" OWNER TO clinica_user;

--
-- Name: AppointmentType; Type: TYPE; Schema: public; Owner: clinica_user
--

CREATE TYPE public."AppointmentType" AS ENUM (
    'CONSULTATION',
    'EXAM',
    'PROCEDURE',
    'RETURN'
);


ALTER TYPE public."AppointmentType" OWNER TO clinica_user;

--
-- Name: BankAccountType; Type: TYPE; Schema: public; Owner: clinica_user
--

CREATE TYPE public."BankAccountType" AS ENUM (
    'CHECKING',
    'SAVINGS',
    'INVESTMENT',
    'CASH',
    'CREDIT_CARD',
    'PIX'
);


ALTER TYPE public."BankAccountType" OWNER TO clinica_user;

--
-- Name: FinancialEntryStatus; Type: TYPE; Schema: public; Owner: clinica_user
--

CREATE TYPE public."FinancialEntryStatus" AS ENUM (
    'PENDING',
    'PAID',
    'OVERDUE',
    'CANCELLED',
    'PARTIAL'
);


ALTER TYPE public."FinancialEntryStatus" OWNER TO clinica_user;

--
-- Name: FinancialEntryType; Type: TYPE; Schema: public; Owner: clinica_user
--

CREATE TYPE public."FinancialEntryType" AS ENUM (
    'INCOME',
    'EXPENSE'
);


ALTER TYPE public."FinancialEntryType" OWNER TO clinica_user;

--
-- Name: NotificationChannel; Type: TYPE; Schema: public; Owner: clinica_user
--

CREATE TYPE public."NotificationChannel" AS ENUM (
    'WHATSAPP',
    'SMS',
    'EMAIL'
);


ALTER TYPE public."NotificationChannel" OWNER TO clinica_user;

--
-- Name: NotificationReminderType; Type: TYPE; Schema: public; Owner: clinica_user
--

CREATE TYPE public."NotificationReminderType" AS ENUM (
    'FIRST_REMINDER',
    'SECOND_REMINDER',
    'THIRD_REMINDER',
    'IMMEDIATE'
);


ALTER TYPE public."NotificationReminderType" OWNER TO clinica_user;

--
-- Name: NotificationStatus; Type: TYPE; Schema: public; Owner: clinica_user
--

CREATE TYPE public."NotificationStatus" AS ENUM (
    'PENDING',
    'SENDING',
    'SENT',
    'DELIVERED',
    'READ',
    'FAILED',
    'CANCELLED'
);


ALTER TYPE public."NotificationStatus" OWNER TO clinica_user;

--
-- Name: PartnershipType; Type: TYPE; Schema: public; Owner: clinica_user
--

CREATE TYPE public."PartnershipType" AS ENUM (
    'SUBLEASE',
    'PERCENTAGE',
    'PERCENTAGE_WITH_PRODUCTS'
);


ALTER TYPE public."PartnershipType" OWNER TO clinica_user;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: clinica_user
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'DEBIT_CARD',
    'CREDIT_CARD',
    'PIX',
    'BANK_TRANSFER',
    'CHECK',
    'VOUCHER'
);


ALTER TYPE public."PaymentMethod" OWNER TO clinica_user;

--
-- Name: ServiceType; Type: TYPE; Schema: public; Owner: clinica_user
--

CREATE TYPE public."ServiceType" AS ENUM (
    'PRODUCT',
    'SERVICE'
);


ALTER TYPE public."ServiceType" OWNER TO clinica_user;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: clinica_user
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'USER'
);


ALTER TYPE public."UserRole" OWNER TO clinica_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: clinica_user
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


ALTER TABLE public._prisma_migrations OWNER TO clinica_user;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: clinica_user
--

CREATE TABLE public.appointments (
    id text NOT NULL,
    "patientId" text NOT NULL,
    "partnerId" text NOT NULL,
    "productServiceId" text NOT NULL,
    "roomId" text,
    date timestamp(3) without time zone NOT NULL,
    "startTime" text NOT NULL,
    "endTime" text NOT NULL,
    type public."AppointmentType" DEFAULT 'CONSULTATION'::public."AppointmentType" NOT NULL,
    status public."AppointmentStatus" DEFAULT 'SCHEDULED'::public."AppointmentStatus" NOT NULL,
    observations text,
    "checkIn" timestamp(3) without time zone,
    "checkOut" timestamp(3) without time zone,
    "cancellationReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isEncaixe" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.appointments OWNER TO clinica_user;

--
-- Name: bank_accounts; Type: TABLE; Schema: public; Owner: clinica_user
--

CREATE TABLE public.bank_accounts (
    id text NOT NULL,
    name text NOT NULL,
    bank text NOT NULL,
    "accountType" public."BankAccountType" NOT NULL,
    agency text,
    "accountNumber" text,
    "pixKey" text,
    "initialBalance" numeric(10,2) DEFAULT 0 NOT NULL,
    "currentBalance" numeric(10,2) DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    color text DEFAULT '#3B82F6'::text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.bank_accounts OWNER TO clinica_user;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: clinica_user
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    type public."ServiceType" NOT NULL,
    description text,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.categories OWNER TO clinica_user;

--
-- Name: clinic_settings; Type: TABLE; Schema: public; Owner: clinica_user
--

CREATE TABLE public.clinic_settings (
    id text NOT NULL,
    name text DEFAULT 'Clínica Essencial'::text NOT NULL,
    hours jsonb NOT NULL,
    "allowWeekendBookings" boolean DEFAULT false NOT NULL,
    "advanceBookingDays" integer DEFAULT 30 NOT NULL,
    "minBookingHours" integer DEFAULT 2 NOT NULL,
    "maxBookingDays" integer DEFAULT 60 NOT NULL,
    "allowCancelledMovement" boolean DEFAULT false NOT NULL,
    "allowCompletedMovement" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.clinic_settings OWNER TO clinica_user;

--
-- Name: financial_entries; Type: TABLE; Schema: public; Owner: clinica_user
--

CREATE TABLE public.financial_entries (
    id text NOT NULL,
    "bankAccountId" text NOT NULL,
    type public."FinancialEntryType" NOT NULL,
    category text NOT NULL,
    subcategory text,
    description text NOT NULL,
    amount numeric(10,2) NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "paidDate" timestamp(3) without time zone,
    status public."FinancialEntryStatus" DEFAULT 'PENDING'::public."FinancialEntryStatus" NOT NULL,
    "paymentMethod" public."PaymentMethod",
    notes text,
    "referenceId" text,
    "referenceType" text,
    "partnerId" text,
    "patientId" text,
    "appointmentId" text,
    recurring boolean DEFAULT false NOT NULL,
    "parentEntryId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.financial_entries OWNER TO clinica_user;

--
-- Name: notification_configuration; Type: TABLE; Schema: public; Owner: clinica_user
--

CREATE TABLE public.notification_configuration (
    id text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    "defaultChannel" text DEFAULT 'whatsapp'::text NOT NULL,
    "firstReminderDays" integer DEFAULT 3 NOT NULL,
    "secondReminderDays" integer DEFAULT 1 NOT NULL,
    "thirdReminderHours" integer DEFAULT 2 NOT NULL,
    "whatsappEnabled" boolean DEFAULT true NOT NULL,
    "smsEnabled" boolean DEFAULT true NOT NULL,
    "emailEnabled" boolean DEFAULT true NOT NULL,
    "retryAttempts" integer DEFAULT 3 NOT NULL,
    "retryIntervalMinutes" integer DEFAULT 30 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.notification_configuration OWNER TO clinica_user;

--
-- Name: notification_logs; Type: TABLE; Schema: public; Owner: clinica_user
--

CREATE TABLE public.notification_logs (
    id text NOT NULL,
    "appointmentId" text NOT NULL,
    channel public."NotificationChannel" NOT NULL,
    recipient text NOT NULL,
    content text NOT NULL,
    subject text,
    status public."NotificationStatus" NOT NULL,
    "errorMessage" text,
    "providerData" jsonb,
    "deliveredAt" timestamp(3) without time zone,
    "readAt" timestamp(3) without time zone,
    "sentAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notification_logs OWNER TO clinica_user;

--
-- Name: notification_schedules; Type: TABLE; Schema: public; Owner: clinica_user
--

CREATE TABLE public.notification_schedules (
    id text NOT NULL,
    "appointmentId" text NOT NULL,
    "templateId" text NOT NULL,
    "scheduledFor" timestamp(3) without time zone NOT NULL,
    status public."NotificationStatus" DEFAULT 'PENDING'::public."NotificationStatus" NOT NULL,
    channel public."NotificationChannel" NOT NULL,
    "retryCount" integer DEFAULT 0 NOT NULL,
    "lastAttempt" timestamp(3) without time zone,
    "errorMessage" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.notification_schedules OWNER TO clinica_user;

--
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: clinica_user
--

CREATE TABLE public.notification_templates (
    id text NOT NULL,
    name text NOT NULL,
    type public."NotificationReminderType" NOT NULL,
    channel public."NotificationChannel" NOT NULL,
    subject text,
    content text NOT NULL,
    variables jsonb NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.notification_templates OWNER TO clinica_user;

--
-- Name: partner_availability; Type: TABLE; Schema: public; Owner: clinica_user
--

CREATE TABLE public.partner_availability (
    id text NOT NULL,
    "partnerId" text NOT NULL,
    "dayOfWeek" integer NOT NULL,
    "startTime" text NOT NULL,
    "endTime" text NOT NULL,
    "breakStart" text,
    "breakEnd" text,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.partner_availability OWNER TO clinica_user;

--
-- Name: partner_blocked_dates; Type: TABLE; Schema: public; Owner: clinica_user
--

CREATE TABLE public.partner_blocked_dates (
    id text NOT NULL,
    "partnerId" text NOT NULL,
    "blockedDate" date NOT NULL,
    "startTime" text,
    "endTime" text,
    reason text,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.partner_blocked_dates OWNER TO clinica_user;

--
-- Name: partner_services; Type: TABLE; Schema: public; Owner: clinica_user
--

CREATE TABLE public.partner_services (
    id text NOT NULL,
    "partnerId" text NOT NULL,
    "productServiceId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.partner_services OWNER TO clinica_user;

--
-- Name: partners; Type: TABLE; Schema: public; Owner: clinica_user
--

CREATE TABLE public.partners (
    id text NOT NULL,
    "fullName" text NOT NULL,
    document text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    street text,
    number text,
    complement text,
    neighborhood text,
    city text,
    state text,
    "zipCode" text,
    bank text,
    agency text,
    account text,
    pix text,
    "partnershipType" public."PartnershipType" NOT NULL,
    "subleaseAmount" numeric(65,30),
    "subleasePaymentDay" integer,
    "percentageAmount" numeric(65,30),
    "percentageRate" numeric(65,30),
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.partners OWNER TO clinica_user;

--
-- Name: patients; Type: TABLE; Schema: public; Owner: clinica_user
--

CREATE TABLE public.patients (
    id text NOT NULL,
    "fullName" text NOT NULL,
    cpf text NOT NULL,
    "birthDate" timestamp(3) without time zone NOT NULL,
    whatsapp text,
    phone text,
    email text,
    street text,
    number text,
    complement text,
    neighborhood text,
    city text,
    state text,
    "zipCode" text,
    observations text,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.patients OWNER TO clinica_user;

--
-- Name: product_service_rooms; Type: TABLE; Schema: public; Owner: clinica_user
--

CREATE TABLE public.product_service_rooms (
    id text NOT NULL,
    "productServiceId" text NOT NULL,
    "roomId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.product_service_rooms OWNER TO clinica_user;

--
-- Name: product_services; Type: TABLE; Schema: public; Owner: clinica_user
--

CREATE TABLE public.product_services (
    id text NOT NULL,
    name text NOT NULL,
    type public."ServiceType" NOT NULL,
    "categoryId" text NOT NULL,
    "internalCode" text,
    description text,
    "salePrice" numeric(65,30) NOT NULL,
    "costPrice" numeric(65,30),
    "partnerPrice" numeric(65,30),
    "durationMinutes" integer,
    "availableForBooking" boolean DEFAULT true NOT NULL,
    "requiresSpecialPrep" boolean DEFAULT false NOT NULL,
    "specialPrepDetails" text,
    "stockLevel" integer,
    "minStockLevel" integer,
    active boolean DEFAULT true NOT NULL,
    observations text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_services OWNER TO clinica_user;

--
-- Name: rooms; Type: TABLE; Schema: public; Owner: clinica_user
--

CREATE TABLE public.rooms (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    resources text[],
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.rooms OWNER TO clinica_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: clinica_user
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    role public."UserRole" DEFAULT 'USER'::public."UserRole" NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO clinica_user;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: clinica_user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
dc02bb3d-3053-487c-931f-b9624e4bff45	f9a2e0287ef29395a8f3829402f7b90b452c031b27058cd46ba5ce26e63b5c5a	2025-08-24 14:04:23.622656+00	20250811201109_init	\N	\N	2025-08-24 14:04:23.525397+00	1
a34e5008-c147-4c73-9489-eacdd2d1cb13	0f69ed9b5d22287bb7f872fe42b4d1ceb64710eef9053852db449625c70b9532	2025-08-24 14:04:23.63318+00	20250814201454_add_partner_blocked_dates	\N	\N	2025-08-24 14:04:23.623478+00	1
99ef0b5c-b1fc-43ed-98d3-f85caefb006b	7f49af00d259752da0bdab0ec2a0d0b903159fc3bcce2f07fafe7895c2d09f36	2025-08-24 14:04:23.649512+00	20250814212423_update_appointment_types	\N	\N	2025-08-24 14:04:23.633809+00	1
f2b2e10f-6ec6-425e-968c-db2483299577	9f6286f2874aee4695fae2471602dd7dffefe2903807bc2b48fc3393ca7a4376	2025-08-24 14:04:23.680539+00	20250817034516_add_notification_system	\N	\N	2025-08-24 14:04:23.650408+00	1
e6805e4a-489b-437d-abd7-6c5747f47c71	59d83008b41e1e0ab1c1c627e6abecc19a9b7c871cfa8597eda9fba4101ed96e	2025-08-24 14:04:23.711459+00	20250818014249_add_financial_system	\N	\N	2025-08-24 14:04:23.681594+00	1
e0b9d620-61e9-4fee-b5fa-ecbebdf60a46	4034e4b5841f180e1617c7799d2c43ea5b49bee3d084dd27af4717feeb3e1190	2025-08-24 14:04:23.716653+00	20250821012553_add_encaixe_field	\N	\N	2025-08-24 14:04:23.712971+00	1
bfb741cf-f2f3-407e-ad60-fffe7a1175fe	3c70f228b1496b3fd1c35d8f5b82846ba19217145d0a54d9fbdff6f3985de62b	2025-08-24 14:04:23.728501+00	20250821171853_add_clinic_settings	\N	\N	2025-08-24 14:04:23.717731+00	1
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: clinica_user
--

COPY public.appointments (id, "patientId", "partnerId", "productServiceId", "roomId", date, "startTime", "endTime", type, status, observations, "checkIn", "checkOut", "cancellationReason", "createdAt", "updatedAt", "isEncaixe") FROM stdin;
\.


--
-- Data for Name: bank_accounts; Type: TABLE DATA; Schema: public; Owner: clinica_user
--

COPY public.bank_accounts (id, name, bank, "accountType", agency, "accountNumber", "pixKey", "initialBalance", "currentBalance", active, color, description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: clinica_user
--

COPY public.categories (id, name, type, description, active, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: clinic_settings; Type: TABLE DATA; Schema: public; Owner: clinica_user
--

COPY public.clinic_settings (id, name, hours, "allowWeekendBookings", "advanceBookingDays", "minBookingHours", "maxBookingDays", "allowCancelledMovement", "allowCompletedMovement", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: financial_entries; Type: TABLE DATA; Schema: public; Owner: clinica_user
--

COPY public.financial_entries (id, "bankAccountId", type, category, subcategory, description, amount, "dueDate", "paidDate", status, "paymentMethod", notes, "referenceId", "referenceType", "partnerId", "patientId", "appointmentId", recurring, "parentEntryId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: notification_configuration; Type: TABLE DATA; Schema: public; Owner: clinica_user
--

COPY public.notification_configuration (id, enabled, "defaultChannel", "firstReminderDays", "secondReminderDays", "thirdReminderHours", "whatsappEnabled", "smsEnabled", "emailEnabled", "retryAttempts", "retryIntervalMinutes", "createdAt", "updatedAt") FROM stdin;
cmeprv266000062db0q71cv9c	t	whatsapp	3	1	2	t	t	t	3	30	2025-08-24 14:16:55.998	2025-08-24 14:16:55.998
\.


--
-- Data for Name: notification_logs; Type: TABLE DATA; Schema: public; Owner: clinica_user
--

COPY public.notification_logs (id, "appointmentId", channel, recipient, content, subject, status, "errorMessage", "providerData", "deliveredAt", "readAt", "sentAt") FROM stdin;
\.


--
-- Data for Name: notification_schedules; Type: TABLE DATA; Schema: public; Owner: clinica_user
--

COPY public.notification_schedules (id, "appointmentId", "templateId", "scheduledFor", status, channel, "retryCount", "lastAttempt", "errorMessage", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: notification_templates; Type: TABLE DATA; Schema: public; Owner: clinica_user
--

COPY public.notification_templates (id, name, type, channel, subject, content, variables, active, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: partner_availability; Type: TABLE DATA; Schema: public; Owner: clinica_user
--

COPY public.partner_availability (id, "partnerId", "dayOfWeek", "startTime", "endTime", "breakStart", "breakEnd", active, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: partner_blocked_dates; Type: TABLE DATA; Schema: public; Owner: clinica_user
--

COPY public.partner_blocked_dates (id, "partnerId", "blockedDate", "startTime", "endTime", reason, active, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: partner_services; Type: TABLE DATA; Schema: public; Owner: clinica_user
--

COPY public.partner_services (id, "partnerId", "productServiceId", "createdAt") FROM stdin;
\.


--
-- Data for Name: partners; Type: TABLE DATA; Schema: public; Owner: clinica_user
--

COPY public.partners (id, "fullName", document, phone, email, street, number, complement, neighborhood, city, state, "zipCode", bank, agency, account, pix, "partnershipType", "subleaseAmount", "subleasePaymentDay", "percentageAmount", "percentageRate", active, "createdAt", "updatedAt") FROM stdin;
cmepxym8s0001cu9zfd9lnbix	Parceiro 1 da Silva	88217609012	31987034132	parceiro1@parceiro.com						\N						SUBLEASE	100.000000000000000000000000000000	1	\N	\N	f	2025-08-24 17:07:39.677	2025-08-24 18:48:07.62
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: clinica_user
--

COPY public.patients (id, "fullName", cpf, "birthDate", whatsapp, phone, email, street, number, complement, neighborhood, city, state, "zipCode", observations, active, "createdAt", "updatedAt") FROM stdin;
cmeptenxz0000wxz2snayqazt	Paciente 1 da Silva	33843632057	1970-04-14 00:00:00	31987034132											t	2025-08-24 15:00:10.295	2025-08-24 15:00:10.295
cmeptqqyv0001wxz2d11fqusw	Paciente 2 Melo Campos	93849053059	1991-08-12 00:00:00	31987034132											t	2025-08-24 15:09:34.088	2025-08-24 15:09:34.088
cmepxk6y80000cu9zt6mcbj2l	Paciente 3 de Oliveira	73796269060	2001-06-12 00:00:00												t	2025-08-24 16:56:26.67	2025-08-24 16:56:26.67
\.


--
-- Data for Name: product_service_rooms; Type: TABLE DATA; Schema: public; Owner: clinica_user
--

COPY public.product_service_rooms (id, "productServiceId", "roomId", "createdAt") FROM stdin;
\.


--
-- Data for Name: product_services; Type: TABLE DATA; Schema: public; Owner: clinica_user
--

COPY public.product_services (id, name, type, "categoryId", "internalCode", description, "salePrice", "costPrice", "partnerPrice", "durationMinutes", "availableForBooking", "requiresSpecialPrep", "specialPrepDetails", "stockLevel", "minStockLevel", active, observations, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: clinica_user
--

COPY public.rooms (id, name, description, resources, active, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: clinica_user
--

COPY public.users (id, email, password, name, role, active, "createdAt", "updatedAt") FROM stdin;
cmeprtplv0000hxg7c1vy4bzp	admin@clinica.com	$2a$12$3Umc9MpxBY1eF4AiXQrE4ePBAI4W6FnXQUxGYYHiNYFOdc8tMM9tG	Administrador	ADMIN	t	2025-08-24 14:15:53.059	2025-08-24 14:15:53.059
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: bank_accounts bank_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: clinic_settings clinic_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.clinic_settings
    ADD CONSTRAINT clinic_settings_pkey PRIMARY KEY (id);


--
-- Name: financial_entries financial_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.financial_entries
    ADD CONSTRAINT financial_entries_pkey PRIMARY KEY (id);


--
-- Name: notification_configuration notification_configuration_pkey; Type: CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.notification_configuration
    ADD CONSTRAINT notification_configuration_pkey PRIMARY KEY (id);


--
-- Name: notification_logs notification_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.notification_logs
    ADD CONSTRAINT notification_logs_pkey PRIMARY KEY (id);


--
-- Name: notification_schedules notification_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.notification_schedules
    ADD CONSTRAINT notification_schedules_pkey PRIMARY KEY (id);


--
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- Name: partner_availability partner_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.partner_availability
    ADD CONSTRAINT partner_availability_pkey PRIMARY KEY (id);


--
-- Name: partner_blocked_dates partner_blocked_dates_pkey; Type: CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.partner_blocked_dates
    ADD CONSTRAINT partner_blocked_dates_pkey PRIMARY KEY (id);


--
-- Name: partner_services partner_services_pkey; Type: CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.partner_services
    ADD CONSTRAINT partner_services_pkey PRIMARY KEY (id);


--
-- Name: partners partners_pkey; Type: CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_pkey PRIMARY KEY (id);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: product_service_rooms product_service_rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.product_service_rooms
    ADD CONSTRAINT product_service_rooms_pkey PRIMARY KEY (id);


--
-- Name: product_services product_services_pkey; Type: CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.product_services
    ADD CONSTRAINT product_services_pkey PRIMARY KEY (id);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: partner_blocked_dates_partnerId_blockedDate_startTime_endTi_key; Type: INDEX; Schema: public; Owner: clinica_user
--

CREATE UNIQUE INDEX "partner_blocked_dates_partnerId_blockedDate_startTime_endTi_key" ON public.partner_blocked_dates USING btree ("partnerId", "blockedDate", "startTime", "endTime");


--
-- Name: partner_services_partnerId_productServiceId_key; Type: INDEX; Schema: public; Owner: clinica_user
--

CREATE UNIQUE INDEX "partner_services_partnerId_productServiceId_key" ON public.partner_services USING btree ("partnerId", "productServiceId");


--
-- Name: partners_document_key; Type: INDEX; Schema: public; Owner: clinica_user
--

CREATE UNIQUE INDEX partners_document_key ON public.partners USING btree (document);


--
-- Name: patients_cpf_key; Type: INDEX; Schema: public; Owner: clinica_user
--

CREATE UNIQUE INDEX patients_cpf_key ON public.patients USING btree (cpf);


--
-- Name: product_service_rooms_productServiceId_roomId_key; Type: INDEX; Schema: public; Owner: clinica_user
--

CREATE UNIQUE INDEX "product_service_rooms_productServiceId_roomId_key" ON public.product_service_rooms USING btree ("productServiceId", "roomId");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: clinica_user
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: appointments appointments_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT "appointments_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: appointments appointments_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT "appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: appointments appointments_productServiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT "appointments_productServiceId_fkey" FOREIGN KEY ("productServiceId") REFERENCES public.product_services(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: appointments appointments_roomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT "appointments_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES public.rooms(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: financial_entries financial_entries_appointmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.financial_entries
    ADD CONSTRAINT "financial_entries_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES public.appointments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: financial_entries financial_entries_bankAccountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.financial_entries
    ADD CONSTRAINT "financial_entries_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES public.bank_accounts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: financial_entries financial_entries_parentEntryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.financial_entries
    ADD CONSTRAINT "financial_entries_parentEntryId_fkey" FOREIGN KEY ("parentEntryId") REFERENCES public.financial_entries(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: financial_entries financial_entries_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.financial_entries
    ADD CONSTRAINT "financial_entries_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: financial_entries financial_entries_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.financial_entries
    ADD CONSTRAINT "financial_entries_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: notification_logs notification_logs_appointmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.notification_logs
    ADD CONSTRAINT "notification_logs_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES public.appointments(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notification_schedules notification_schedules_appointmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.notification_schedules
    ADD CONSTRAINT "notification_schedules_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES public.appointments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification_schedules notification_schedules_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.notification_schedules
    ADD CONSTRAINT "notification_schedules_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public.notification_templates(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: partner_availability partner_availability_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.partner_availability
    ADD CONSTRAINT "partner_availability_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: partner_blocked_dates partner_blocked_dates_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.partner_blocked_dates
    ADD CONSTRAINT "partner_blocked_dates_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: partner_services partner_services_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.partner_services
    ADD CONSTRAINT "partner_services_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: partner_services partner_services_productServiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.partner_services
    ADD CONSTRAINT "partner_services_productServiceId_fkey" FOREIGN KEY ("productServiceId") REFERENCES public.product_services(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_service_rooms product_service_rooms_productServiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.product_service_rooms
    ADD CONSTRAINT "product_service_rooms_productServiceId_fkey" FOREIGN KEY ("productServiceId") REFERENCES public.product_services(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_service_rooms product_service_rooms_roomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.product_service_rooms
    ADD CONSTRAINT "product_service_rooms_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES public.rooms(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_services product_services_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinica_user
--

ALTER TABLE ONLY public.product_services
    ADD CONSTRAINT "product_services_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict bFEAOhkfW0GguafcfZsxvBQz6w4hbFh0CEJH2eb8g4AFwIu56N5lnSFKS2DcC5k

