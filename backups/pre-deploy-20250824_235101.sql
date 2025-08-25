--
-- PostgreSQL database dump
--

\restrict 8Bqze6qHtCFQUmIaw0DtGp3wdWhxwzXKzF4V5JqWalKXDa8EIhIbpLQGCRbQa54

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
-- Name: AppointmentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AppointmentStatus" AS ENUM (
    'SCHEDULED',
    'CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW'
);


ALTER TYPE public."AppointmentStatus" OWNER TO postgres;

--
-- Name: AppointmentType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AppointmentType" AS ENUM (
    'CONSULTATION',
    'EXAM',
    'PROCEDURE',
    'RETURN'
);


ALTER TYPE public."AppointmentType" OWNER TO postgres;

--
-- Name: BankAccountType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BankAccountType" AS ENUM (
    'CHECKING',
    'SAVINGS',
    'INVESTMENT',
    'CASH',
    'CREDIT_CARD',
    'PIX'
);


ALTER TYPE public."BankAccountType" OWNER TO postgres;

--
-- Name: FinancialEntryStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FinancialEntryStatus" AS ENUM (
    'PENDING',
    'PAID',
    'OVERDUE',
    'CANCELLED',
    'PARTIAL'
);


ALTER TYPE public."FinancialEntryStatus" OWNER TO postgres;

--
-- Name: FinancialEntryType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FinancialEntryType" AS ENUM (
    'INCOME',
    'EXPENSE'
);


ALTER TYPE public."FinancialEntryType" OWNER TO postgres;

--
-- Name: NotificationChannel; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationChannel" AS ENUM (
    'WHATSAPP',
    'SMS',
    'EMAIL'
);


ALTER TYPE public."NotificationChannel" OWNER TO postgres;

--
-- Name: NotificationReminderType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationReminderType" AS ENUM (
    'FIRST_REMINDER',
    'SECOND_REMINDER',
    'THIRD_REMINDER',
    'IMMEDIATE'
);


ALTER TYPE public."NotificationReminderType" OWNER TO postgres;

--
-- Name: NotificationStatus; Type: TYPE; Schema: public; Owner: postgres
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


ALTER TYPE public."NotificationStatus" OWNER TO postgres;

--
-- Name: PartnershipType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PartnershipType" AS ENUM (
    'SUBLEASE',
    'PERCENTAGE',
    'PERCENTAGE_WITH_PRODUCTS'
);


ALTER TYPE public."PartnershipType" OWNER TO postgres;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
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


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- Name: ServiceType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ServiceType" AS ENUM (
    'PRODUCT',
    'SERVICE'
);


ALTER TYPE public."ServiceType" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'USER'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.appointments OWNER TO postgres;

--
-- Name: bank_accounts; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.bank_accounts OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: clinic_settings; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.clinic_settings OWNER TO postgres;

--
-- Name: financial_entries; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.financial_entries OWNER TO postgres;

--
-- Name: notification_configuration; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.notification_configuration OWNER TO postgres;

--
-- Name: notification_logs; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.notification_logs OWNER TO postgres;

--
-- Name: notification_schedules; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.notification_schedules OWNER TO postgres;

--
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.notification_templates OWNER TO postgres;

--
-- Name: partner_availability; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.partner_availability OWNER TO postgres;

--
-- Name: partner_blocked_dates; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.partner_blocked_dates OWNER TO postgres;

--
-- Name: partner_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.partner_services (
    id text NOT NULL,
    "partnerId" text NOT NULL,
    "productServiceId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.partner_services OWNER TO postgres;

--
-- Name: partners; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.partners OWNER TO postgres;

--
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.patients OWNER TO postgres;

--
-- Name: product_service_rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_service_rooms (
    id text NOT NULL,
    "productServiceId" text NOT NULL,
    "roomId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.product_service_rooms OWNER TO postgres;

--
-- Name: product_services; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.product_services OWNER TO postgres;

--
-- Name: rooms; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.rooms OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
230fb176-bdee-460c-8dd3-31e962655bdf	f9a2e0287ef29395a8f3829402f7b90b452c031b27058cd46ba5ce26e63b5c5a	2025-08-25 00:13:03.209497+00	20250811201109_init	\N	\N	2025-08-25 00:13:03.146224+00	1
41bc8bce-35b0-4fac-bbac-871bae0ad0d8	0f69ed9b5d22287bb7f872fe42b4d1ceb64710eef9053852db449625c70b9532	2025-08-25 00:13:03.217311+00	20250814201454_add_partner_blocked_dates	\N	\N	2025-08-25 00:13:03.209938+00	1
24fc8b29-c920-442e-a0a9-bebb328c6a77	7f49af00d259752da0bdab0ec2a0d0b903159fc3bcce2f07fafe7895c2d09f36	2025-08-25 00:13:03.227005+00	20250814212423_update_appointment_types	\N	\N	2025-08-25 00:13:03.217826+00	1
8eea239d-4999-4f38-8fb3-d174d3cb4fde	9f6286f2874aee4695fae2471602dd7dffefe2903807bc2b48fc3393ca7a4376	2025-08-25 00:13:03.244111+00	20250817034516_add_notification_system	\N	\N	2025-08-25 00:13:03.227478+00	1
de17dbe0-d652-46d2-859f-38b8de7ec8e2	59d83008b41e1e0ab1c1c627e6abecc19a9b7c871cfa8597eda9fba4101ed96e	2025-08-25 00:13:03.25772+00	20250818014249_add_financial_system	\N	\N	2025-08-25 00:13:03.244588+00	1
06a81d69-9071-446d-85f8-71c82dbcc8bb	4034e4b5841f180e1617c7799d2c43ea5b49bee3d084dd27af4717feeb3e1190	2025-08-25 00:13:03.260503+00	20250821012553_add_encaixe_field	\N	\N	2025-08-25 00:13:03.258181+00	1
b8db14b7-5524-4561-abd1-e1b34cad3f80	3c70f228b1496b3fd1c35d8f5b82846ba19217145d0a54d9fbdff6f3985de62b	2025-08-25 00:13:03.268292+00	20250821171853_add_clinic_settings	\N	\N	2025-08-25 00:13:03.261005+00	1
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (id, "patientId", "partnerId", "productServiceId", "roomId", date, "startTime", "endTime", type, status, observations, "checkIn", "checkOut", "cancellationReason", "createdAt", "updatedAt", "isEncaixe") FROM stdin;
cmeqdgi7b008vkzpt93gbp9mo	cmeqd769k00004cwzfb4lya3k	cmeqd9kfx00024cwz5a87wv43	cmeqdgi1e001lkzpt6mdxvh9h	cmeqdghzf000bkzpte6v303wo	2025-08-26 00:21:28.48	14:00	14:20	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.487	2025-08-25 00:21:28.487	f
cmeqdgi7d008xkzptgeiiysvy	cmeqdghyt0004kzpt40da3xok	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi0x0015kzpt8lfjsh2e	cmeqdghzf000bkzpte6v303wo	2025-08-26 00:21:28.48	13:00	13:45	RETURN	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.49	2025-08-25 00:21:28.49	f
cmeqdgi7g008zkzptd24aduw9	cmeqdghyz0007kzptml41sloi	cmeqd9kfx00024cwz5a87wv43	cmeqdgi0t0013kzpt1pil7fa0	cmeqdghzg000ckzpt3rqux2h5	2025-08-27 00:21:28.48	16:00	16:30	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.492	2025-08-25 00:21:28.492	f
cmeqdgi7k0093kzptxvvjdqs4	cmeqdghyc0000kzpt0zlg6czf	cmeqdgi2p002ukzptiomce8q3	cmeqdgi1c001jkzptf1jr547w	\N	2025-08-27 00:21:28.48	15:30	16:30	PROCEDURE	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.496	2025-08-25 00:21:28.496	f
cmeqdgi7m0095kzptj1nd8fxi	cmeqdghyt0004kzpt40da3xok	cmeqdgi37003bkzptspnnicry	cmeqdgi1e001lkzpt6mdxvh9h	cmeqdghzf000bkzpte6v303wo	2025-08-27 00:21:28.48	16:00	16:20	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.498	2025-08-25 00:21:28.498	f
cmeqdgi7n0097kzptmwv44cvd	cmeqdghyq0003kzptk7kn88fc	cmeqdgi37003bkzptspnnicry	cmeqdgi19001hkzptsoqk4mu5	\N	2025-08-27 00:21:28.48	16:30	17:00	EXAM	SCHEDULED	Primeira consulta	\N	\N	\N	2025-08-25 00:21:28.5	2025-08-25 00:21:28.5	f
cmeqdgi7p0099kzpto02cylrz	cmeqd769k00004cwzfb4lya3k	cmeqdgi37003bkzptspnnicry	cmeqdgi0t0013kzpt1pil7fa0	cmeqdghz9000akzpt91g8uerq	2025-08-28 00:21:28.48	13:00	13:30	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.501	2025-08-25 00:21:28.501	f
cmeqdgi7r009bkzpt9420vv7d	cmeqdghyz0007kzptml41sloi	cmeqdgi3r0049kzpt2jdyq26g	cmeqdgi15001dkzptcfk5s42c	cmeqdghzf000bkzpte6v303wo	2025-08-28 00:21:28.48	14:30	14:45	CONSULTATION	SCHEDULED	Necessário acompanhamento	\N	\N	\N	2025-08-25 00:21:28.503	2025-08-25 00:21:28.503	f
cmeqdgi7u009fkzptnbgvd0cg	cmeqdghyq0003kzptk7kn88fc	cmeqd9kfx00024cwz5a87wv43	cmeqdgi1e001lkzpt6mdxvh9h	cmeqdghzg000ckzpt3rqux2h5	2025-08-28 00:21:28.48	16:30	16:50	RETURN	SCHEDULED	Retorno para avaliação	\N	\N	\N	2025-08-25 00:21:28.507	2025-08-25 00:21:28.507	f
cmeqdgi7w009hkzpt34qs6zsu	cmeqdghyt0004kzpt40da3xok	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi17001fkzpti9wt1as2	\N	2025-08-28 00:21:28.48	09:30	09:55	EXAM	SCHEDULED	Paciente chegou no horário	\N	\N	\N	2025-08-25 00:21:28.508	2025-08-25 00:21:28.508	f
cmeqdgi7x009jkzpt8gw9wgn0	cmeqd769k00004cwzfb4lya3k	cmeqdgi37003bkzptspnnicry	cmeqdgi1c001jkzptf1jr547w	cmeqdghzg000ckzpt3rqux2h5	2025-08-29 00:21:28.48	10:00	11:00	PROCEDURE	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.51	2025-08-25 00:21:28.51	f
cmeqdgi7z009lkzptzxo1yupz	cmeqdghyn0002kzpt56kjppgr	cmeqd9kfx00024cwz5a87wv43	cmeqdgi19001hkzptsoqk4mu5	cmeqdghzg000ckzpt3rqux2h5	2025-08-29 00:21:28.48	10:30	11:00	EXAM	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.511	2025-08-25 00:21:28.511	f
cmeqdgi80009nkzpt0ydnxu5e	cmeqd7sit00014cwz827vzxib	cmeqdgi2p002ukzptiomce8q3	cmeqdgi19001hkzptsoqk4mu5	\N	2025-08-29 00:21:28.48	08:30	09:00	EXAM	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.513	2025-08-25 00:21:28.513	f
cmeqdgi82009pkzpt3meoo59s	cmeqdghyt0004kzpt40da3xok	cmeqdgi2p002ukzptiomce8q3	cmeqdgi15001dkzptcfk5s42c	cmeqdghz9000akzpt91g8uerq	2025-08-29 00:21:28.48	08:00	08:15	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.514	2025-08-25 00:21:28.514	f
cmeqdgi83009rkzptyc9qcmno	cmeqd769k00004cwzfb4lya3k	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi100019kzpta8trwa0s	cmeqdghz9000akzpt91g8uerq	2025-08-29 00:21:28.48	16:00	16:35	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.516	2025-08-25 00:21:28.516	f
cmeqdgi85009tkzptooplck1z	cmeqdghyv0005kzpta2h57t9b	cmeqd9kfx00024cwz5a87wv43	cmeqdgi0t0013kzpt1pil7fa0	cmeqdghzf000bkzpte6v303wo	2025-09-01 00:21:28.48	12:00	12:30	CONSULTATION	SCHEDULED	Necessário acompanhamento	\N	\N	\N	2025-08-25 00:21:28.517	2025-08-25 00:21:28.517	f
cmeqdgi86009vkzptyhsbem5f	cmeqdghyt0004kzpt40da3xok	cmeqdgi37003bkzptspnnicry	cmeqdgi1c001jkzptf1jr547w	cmeqdghzg000ckzpt3rqux2h5	2025-09-01 00:21:28.48	09:30	10:30	PROCEDURE	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.519	2025-08-25 00:21:28.519	f
cmeqdgi88009xkzptn2j0bmir	cmeqdghyv0005kzpta2h57t9b	cmeqdgi2p002ukzptiomce8q3	cmeqdgi1c001jkzptf1jr547w	cmeqdghzg000ckzpt3rqux2h5	2025-09-01 00:21:28.48	14:30	15:30	PROCEDURE	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.521	2025-08-25 00:21:28.521	f
cmeqdgi8a009zkzptharj1u0p	cmeqdghyq0003kzptk7kn88fc	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi1e001lkzpt6mdxvh9h	cmeqdghzg000ckzpt3rqux2h5	2025-09-02 00:21:28.48	16:00	16:20	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.523	2025-08-25 00:21:28.523	f
cmeqdgi8c00a1kzptjp6115lk	cmeqdghyx0006kzptcbsizaes	cmeqdgi37003bkzptspnnicry	cmeqdgi19001hkzptsoqk4mu5	cmeqdghz9000akzpt91g8uerq	2025-09-02 00:21:28.48	12:00	12:30	EXAM	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.524	2025-08-25 00:21:28.524	f
cmeqdgi8d00a3kzptfl9jc45d	cmeqdghyj0001kzpt493kfno2	cmeqdgi3r0049kzpt2jdyq26g	cmeqdgi0t0013kzpt1pil7fa0	cmeqdghzg000ckzpt3rqux2h5	2025-09-02 00:21:28.48	13:30	14:00	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.525	2025-08-25 00:21:28.525	f
cmeqdgi8e00a5kzptet7oqqgy	cmeqdghyv0005kzpta2h57t9b	cmeqdgi3r0049kzpt2jdyq26g	cmeqdgi100019kzpta8trwa0s	\N	2025-09-03 00:21:28.48	12:30	13:05	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.527	2025-08-25 00:21:28.527	f
cmeqdgi8g00a7kzpt85y3dqk5	cmeqdghyt0004kzpt40da3xok	cmeqdgi3r0049kzpt2jdyq26g	cmeqdgi1c001jkzptf1jr547w	cmeqdghzf000bkzpte6v303wo	2025-09-03 00:21:28.48	08:00	09:00	PROCEDURE	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.528	2025-08-25 00:21:28.528	f
cmeqdgi8i00a9kzpt2uicpo0p	cmeqd769k00004cwzfb4lya3k	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi1c001jkzptf1jr547w	cmeqdghz9000akzpt91g8uerq	2025-09-03 00:21:28.48	11:30	12:30	PROCEDURE	SCHEDULED	Paciente chegou no horário	\N	\N	\N	2025-08-25 00:21:28.53	2025-08-25 00:21:28.53	f
cmeqdgi8j00abkzptosq1oxt2	cmeqdghyn0002kzpt56kjppgr	cmeqdgi3r0049kzpt2jdyq26g	cmeqdgi1e001lkzpt6mdxvh9h	\N	2025-09-03 00:21:28.48	14:00	14:20	CONSULTATION	SCHEDULED	Exame de rotina	\N	\N	\N	2025-08-25 00:21:28.531	2025-08-25 00:21:28.531	f
cmeqdgi8l00adkzptfej1x113	cmeqd7sit00014cwz827vzxib	cmeqdgi37003bkzptspnnicry	cmeqdgi19001hkzptsoqk4mu5	cmeqdghz9000akzpt91g8uerq	2025-09-03 00:21:28.48	12:00	12:30	EXAM	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.533	2025-08-25 00:21:28.533	f
cmeqdgi8m00afkzpt569dwvrm	cmeqdghyn0002kzpt56kjppgr	cmeqdgi2p002ukzptiomce8q3	cmeqdgi0t0013kzpt1pil7fa0	cmeqdghz9000akzpt91g8uerq	2025-09-03 00:21:28.48	09:00	09:30	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.535	2025-08-25 00:21:28.535	f
cmeqdgi8o00ahkzpt9llawtxu	cmeqd7sit00014cwz827vzxib	cmeqdgi3r0049kzpt2jdyq26g	cmeqdgi1c001jkzptf1jr547w	cmeqdghzg000ckzpt3rqux2h5	2025-09-03 00:21:28.48	16:30	17:30	PROCEDURE	SCHEDULED	Exame de rotina	\N	\N	\N	2025-08-25 00:21:28.537	2025-08-25 00:21:28.537	f
cmeqdgi8q00ajkzptzdchyysy	cmeqdghyt0004kzpt40da3xok	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi0y0017kzptezkystw6	cmeqdghzf000bkzpte6v303wo	2025-09-04 00:21:28.48	14:00	14:40	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.539	2025-08-25 00:21:28.539	f
cmeqdgi8s00alkzptjytrg8n1	cmeqdghyq0003kzptk7kn88fc	cmeqdgi3r0049kzpt2jdyq26g	cmeqdgi0y0017kzptezkystw6	cmeqdghzf000bkzpte6v303wo	2025-09-04 00:21:28.48	10:30	11:10	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.54	2025-08-25 00:21:28.54	f
cmeqdgi8t00ankzptbss387k4	cmeqdghyn0002kzpt56kjppgr	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi15001dkzptcfk5s42c	cmeqdghzf000bkzpte6v303wo	2025-09-04 00:21:28.48	15:30	15:45	CONSULTATION	SCHEDULED	Primeira consulta	\N	\N	\N	2025-08-25 00:21:28.542	2025-08-25 00:21:28.542	f
cmeqdgi8v00apkzpt0fk8kxqb	cmeqdghyz0007kzptml41sloi	cmeqdgi37003bkzptspnnicry	cmeqdgi1e001lkzpt6mdxvh9h	cmeqdghz9000akzpt91g8uerq	2025-09-04 00:21:28.48	14:30	14:50	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.543	2025-08-25 00:21:28.543	f
cmeqdgi7t009dkzpttmm6011u	cmeqd7sit00014cwz827vzxib	cmeqdgi2p002ukzptiomce8q3	cmeqdgi0t0013kzpt1pil7fa0	cmeqdghzg000ckzpt3rqux2h5	2025-08-27 00:00:00	08:00	08:30	CONSULTATION	SCHEDULED	Necessário acompanhamento	\N	\N	\N	2025-08-25 00:21:28.505	2025-08-25 01:47:34.948	f
cmeqdgi77008tkzptfd72styv	cmeqdghyq0003kzptk7kn88fc	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi100019kzpta8trwa0s	cmeqdghzg000ckzpt3rqux2h5	2025-08-26 00:21:28.48	11:00	11:35	CONSULTATION	SCHEDULED	O paciente pode atrasar.	\N	\N	\N	2025-08-25 00:21:28.484	2025-08-25 01:48:27.224	f
cmeqdgi8x00arkzpttiz58f0q	cmeqd7sit00014cwz827vzxib	cmeqdgi3r0049kzpt2jdyq26g	cmeqdgi0y0017kzptezkystw6	cmeqdghz9000akzpt91g8uerq	2025-09-04 00:21:28.48	08:30	09:10	RETURN	SCHEDULED	Paciente chegou no horário	\N	\N	\N	2025-08-25 00:21:28.545	2025-08-25 00:21:28.545	f
cmeqdgi8z00atkzptomfa46h5	cmeqd769k00004cwzfb4lya3k	cmeqdgi3r0049kzpt2jdyq26g	cmeqdgi1c001jkzptf1jr547w	cmeqdghzg000ckzpt3rqux2h5	2025-09-05 00:21:28.48	16:30	17:30	PROCEDURE	SCHEDULED	Exame de rotina	\N	\N	\N	2025-08-25 00:21:28.548	2025-08-25 00:21:28.548	f
cmeqdgi9100avkzpt3ns1d5np	cmeqdghyj0001kzpt493kfno2	cmeqdgi2p002ukzptiomce8q3	cmeqdgi0y0017kzptezkystw6	cmeqdghz9000akzpt91g8uerq	2025-09-05 00:21:28.48	09:30	10:10	RETURN	SCHEDULED	Exame de rotina	\N	\N	\N	2025-08-25 00:21:28.549	2025-08-25 00:21:28.549	f
cmeqdgi9200axkzptto5dihb7	cmeqdghyj0001kzpt493kfno2	cmeqdgi37003bkzptspnnicry	cmeqdgi1c001jkzptf1jr547w	cmeqdghzf000bkzpte6v303wo	2025-09-05 00:21:28.48	16:00	17:00	PROCEDURE	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.551	2025-08-25 00:21:28.551	f
cmeqdgi9300azkzpt1f269mgv	cmeqdghyn0002kzpt56kjppgr	cmeqdgi2p002ukzptiomce8q3	cmeqdgi12001bkzptpgh703re	\N	2025-09-05 00:21:28.48	13:30	14:00	CONSULTATION	SCHEDULED	Paciente chegou no horário	\N	\N	\N	2025-08-25 00:21:28.552	2025-08-25 00:21:28.552	f
cmeqdgi9600b1kzptvvcd1pmm	cmeqdghyv0005kzpta2h57t9b	cmeqd9kfx00024cwz5a87wv43	cmeqdgi0x0015kzpt8lfjsh2e	cmeqdghzf000bkzpte6v303wo	2025-09-08 00:21:28.48	11:30	12:15	RETURN	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.554	2025-08-25 00:21:28.554	f
cmeqdgi9800b3kzptjsibbiek	cmeqdghyq0003kzptk7kn88fc	cmeqdgi37003bkzptspnnicry	cmeqdgi0t0013kzpt1pil7fa0	cmeqdghzf000bkzpte6v303wo	2025-09-08 00:21:28.48	11:00	11:30	CONSULTATION	SCHEDULED	Necessário acompanhamento	\N	\N	\N	2025-08-25 00:21:28.556	2025-08-25 00:21:28.556	f
cmeqdgi9a00b5kzptks5vct5x	cmeqdghyx0006kzptcbsizaes	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi100019kzpta8trwa0s	\N	2025-09-08 00:21:28.48	15:30	16:05	CONSULTATION	SCHEDULED	Paciente relatou melhora	\N	\N	\N	2025-08-25 00:21:28.558	2025-08-25 00:21:28.558	f
cmeqdgi9b00b7kzpt1qb5a8y6	cmeqdghyv0005kzpta2h57t9b	cmeqdgi2p002ukzptiomce8q3	cmeqdgi0y0017kzptezkystw6	\N	2025-09-08 00:21:28.48	14:30	15:10	CONSULTATION	SCHEDULED	Exame de rotina	\N	\N	\N	2025-08-25 00:21:28.56	2025-08-25 00:21:28.56	f
cmeqdgi9d00b9kzptjjl30tul	cmeqd769k00004cwzfb4lya3k	cmeqdgi37003bkzptspnnicry	cmeqdgi17001fkzpti9wt1as2	cmeqdghzf000bkzpte6v303wo	2025-09-08 00:21:28.48	08:00	08:25	EXAM	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.561	2025-08-25 00:21:28.561	f
cmeqdgi9e00bbkzptorkibur0	cmeqdghyn0002kzpt56kjppgr	cmeqd9kfx00024cwz5a87wv43	cmeqdgi19001hkzptsoqk4mu5	cmeqdghz9000akzpt91g8uerq	2025-09-08 00:21:28.48	10:00	10:30	EXAM	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.563	2025-08-25 00:21:28.563	f
cmeqdgi9g00bdkzptwwjtr5c7	cmeqdghyn0002kzpt56kjppgr	cmeqdgi37003bkzptspnnicry	cmeqdgi100019kzpta8trwa0s	\N	2025-09-09 00:21:28.48	15:30	16:05	RETURN	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.565	2025-08-25 00:21:28.565	f
cmeqdgi9i00bfkzpt71yvn5bt	cmeqdghyx0006kzptcbsizaes	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi0t0013kzpt1pil7fa0	cmeqdghzf000bkzpte6v303wo	2025-09-09 00:21:28.48	11:00	11:30	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.566	2025-08-25 00:21:28.566	f
cmeqdgi9j00bhkzpt9jgiwvz9	cmeqdghyc0000kzpt0zlg6czf	cmeqdgi2p002ukzptiomce8q3	cmeqdgi0t0013kzpt1pil7fa0	cmeqdghzf000bkzpte6v303wo	2025-09-09 00:21:28.48	16:00	16:30	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.568	2025-08-25 00:21:28.568	f
cmeqdgi9l00bjkzptiqd3hu3y	cmeqdghyv0005kzpta2h57t9b	cmeqdgi2p002ukzptiomce8q3	cmeqdgi1e001lkzpt6mdxvh9h	cmeqdghz9000akzpt91g8uerq	2025-09-09 00:21:28.48	13:30	13:50	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.569	2025-08-25 00:21:28.569	f
cmeqdgi9n00blkzpt26br7zmz	cmeqdghyj0001kzpt493kfno2	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi19001hkzptsoqk4mu5	\N	2025-09-09 00:21:28.48	14:00	14:30	EXAM	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.571	2025-08-25 00:21:28.571	f
cmeqdgi9o00bnkzptdkqn4mqy	cmeqdghyj0001kzpt493kfno2	cmeqd9kfx00024cwz5a87wv43	cmeqdgi0t0013kzpt1pil7fa0	\N	2025-09-09 00:21:28.48	11:00	11:30	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.573	2025-08-25 00:21:28.573	f
cmeqdgi9q00bpkzptsde8sxr6	cmeqdghyt0004kzpt40da3xok	cmeqdgi2p002ukzptiomce8q3	cmeqdgi19001hkzptsoqk4mu5	cmeqdghzf000bkzpte6v303wo	2025-09-10 00:21:28.48	10:30	11:00	EXAM	SCHEDULED	Exame de rotina	\N	\N	\N	2025-08-25 00:21:28.574	2025-08-25 00:21:28.574	f
cmeqdgi9r00brkzptpeu1c28p	cmeqdghyq0003kzptk7kn88fc	cmeqd9kfx00024cwz5a87wv43	cmeqdgi15001dkzptcfk5s42c	cmeqdghz9000akzpt91g8uerq	2025-09-10 00:21:28.48	12:30	12:45	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.576	2025-08-25 00:21:28.576	f
cmeqdgi9t00btkzpt972e8h26	cmeqdghyq0003kzptk7kn88fc	cmeqdgi3r0049kzpt2jdyq26g	cmeqdgi17001fkzpti9wt1as2	\N	2025-09-10 00:21:28.48	16:30	16:55	EXAM	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.577	2025-08-25 00:21:28.577	f
cmeqdgi9v00bvkzptry9oyn2g	cmeqdghyv0005kzpta2h57t9b	cmeqd9kfx00024cwz5a87wv43	cmeqdgi12001bkzptpgh703re	cmeqdghz9000akzpt91g8uerq	2025-09-10 00:21:28.48	13:00	13:30	CONSULTATION	SCHEDULED	Necessário acompanhamento	\N	\N	\N	2025-08-25 00:21:28.579	2025-08-25 00:21:28.579	f
cmeqdgi9x00bxkzptr0ra5fo6	cmeqdghyx0006kzptcbsizaes	cmeqdgi37003bkzptspnnicry	cmeqdgi0t0013kzpt1pil7fa0	\N	2025-09-11 00:21:28.48	13:30	14:00	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.581	2025-08-25 00:21:28.581	f
cmeqdgi9y00bzkzptf80bzhvx	cmeqdghyv0005kzpta2h57t9b	cmeqd9kfx00024cwz5a87wv43	cmeqdgi15001dkzptcfk5s42c	\N	2025-09-11 00:21:28.48	09:30	09:45	CONSULTATION	SCHEDULED	Necessário acompanhamento	\N	\N	\N	2025-08-25 00:21:28.582	2025-08-25 00:21:28.582	f
cmeqdgi9z00c1kzpt7tj4obmb	cmeqdghyt0004kzpt40da3xok	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi17001fkzpti9wt1as2	cmeqdghz9000akzpt91g8uerq	2025-09-11 00:21:28.48	09:00	09:25	EXAM	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.584	2025-08-25 00:21:28.584	f
cmeqdgia100c3kzptzt193yr5	cmeqdghyq0003kzptk7kn88fc	cmeqdgi37003bkzptspnnicry	cmeqdgi17001fkzpti9wt1as2	cmeqdghz9000akzpt91g8uerq	2025-09-11 00:21:28.48	10:00	10:25	EXAM	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.585	2025-08-25 00:21:28.585	f
cmeqdgia300c5kzpthjlyspny	cmeqdghyn0002kzpt56kjppgr	cmeqdgi37003bkzptspnnicry	cmeqdgi17001fkzpti9wt1as2	cmeqdghzg000ckzpt3rqux2h5	2025-09-11 00:21:28.48	16:00	16:25	EXAM	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.588	2025-08-25 00:21:28.588	f
cmeqdgia500c7kzpt2ghqstny	cmeqd769k00004cwzfb4lya3k	cmeqdgi37003bkzptspnnicry	cmeqdgi12001bkzptpgh703re	cmeqdghzg000ckzpt3rqux2h5	2025-09-11 00:21:28.48	14:00	14:30	CONSULTATION	SCHEDULED	Primeira consulta	\N	\N	\N	2025-08-25 00:21:28.589	2025-08-25 00:21:28.589	f
cmeqdgia700c9kzpt11zwra73	cmeqd7sit00014cwz827vzxib	cmeqdgi3r0049kzpt2jdyq26g	cmeqdgi15001dkzptcfk5s42c	\N	2025-09-12 00:21:28.48	11:00	11:15	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.591	2025-08-25 00:21:28.591	f
cmeqdgia900cbkzptfg5lojc0	cmeqdghyc0000kzpt0zlg6czf	cmeqdgi2p002ukzptiomce8q3	cmeqdgi12001bkzptpgh703re	cmeqdghzf000bkzpte6v303wo	2025-09-12 00:21:28.48	13:00	13:30	RETURN	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.593	2025-08-25 00:21:28.593	f
cmeqdgiab00cdkzpt2w2yjmy9	cmeqd769k00004cwzfb4lya3k	cmeqdgi2p002ukzptiomce8q3	cmeqdgi17001fkzpti9wt1as2	\N	2025-09-12 00:21:28.48	14:00	14:25	EXAM	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.595	2025-08-25 00:21:28.595	f
cmeqdgiad00cfkzpt46jhe6p4	cmeqdghyt0004kzpt40da3xok	cmeqdgi2p002ukzptiomce8q3	cmeqdgi1e001lkzpt6mdxvh9h	cmeqdghzf000bkzpte6v303wo	2025-09-12 00:21:28.48	14:30	14:50	CONSULTATION	SCHEDULED	Primeira consulta	\N	\N	\N	2025-08-25 00:21:28.597	2025-08-25 00:21:28.597	f
cmeqdgiae00chkzpt9efwezdg	cmeqd769k00004cwzfb4lya3k	cmeqdgi2p002ukzptiomce8q3	cmeqdgi0x0015kzpt8lfjsh2e	\N	2025-09-12 00:21:28.48	11:30	12:15	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.599	2025-08-25 00:21:28.599	f
cmeqdgiag00cjkzptm9jjvf95	cmeqdghyj0001kzpt493kfno2	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi19001hkzptsoqk4mu5	\N	2025-09-12 00:21:28.48	12:30	13:00	EXAM	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.6	2025-08-25 00:21:28.6	f
cmeqdgiai00clkzptysfeqozl	cmeqdghyc0000kzpt0zlg6czf	cmeqdgi37003bkzptspnnicry	cmeqdgi19001hkzptsoqk4mu5	cmeqdghz9000akzpt91g8uerq	2025-09-12 00:21:28.48	15:30	16:00	EXAM	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.602	2025-08-25 00:21:28.602	f
cmeqdgial00cnkzptu5aw8j9b	cmeqdghyt0004kzpt40da3xok	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi1e001lkzpt6mdxvh9h	cmeqdghz9000akzpt91g8uerq	2025-09-12 00:21:28.48	14:00	14:20	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.605	2025-08-25 00:21:28.605	f
cmeqdgian00cpkzptn6efjb8v	cmeqdghyv0005kzpta2h57t9b	cmeqdgi3r0049kzpt2jdyq26g	cmeqdgi0x0015kzpt8lfjsh2e	cmeqdghzg000ckzpt3rqux2h5	2025-09-15 00:21:28.48	13:00	13:45	RETURN	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.607	2025-08-25 00:21:28.607	f
cmeqdgiap00crkzptaewotu37	cmeqdghyj0001kzpt493kfno2	cmeqd9kfx00024cwz5a87wv43	cmeqdgi12001bkzptpgh703re	cmeqdghz9000akzpt91g8uerq	2025-09-15 00:21:28.48	15:30	16:00	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.609	2025-08-25 00:21:28.609	f
cmeqdgiar00ctkzptq9gxjpau	cmeqdghyq0003kzptk7kn88fc	cmeqd9kfx00024cwz5a87wv43	cmeqdgi0x0015kzpt8lfjsh2e	cmeqdghz9000akzpt91g8uerq	2025-09-15 00:21:28.48	10:30	11:15	CONSULTATION	SCHEDULED	Exame de rotina	\N	\N	\N	2025-08-25 00:21:28.611	2025-08-25 00:21:28.611	f
cmeqdgiat00cvkzpt4vnsa590	cmeqdghyv0005kzpta2h57t9b	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi1c001jkzptf1jr547w	\N	2025-09-15 00:21:28.48	08:30	09:30	PROCEDURE	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.613	2025-08-25 00:21:28.613	f
cmeqdgiav00cxkzptc9r9ajig	cmeqd769k00004cwzfb4lya3k	cmeqdgi3r0049kzpt2jdyq26g	cmeqdgi100019kzpta8trwa0s	cmeqdghzg000ckzpt3rqux2h5	2025-09-15 00:21:28.48	14:00	14:35	CONSULTATION	SCHEDULED	Primeira consulta	\N	\N	\N	2025-08-25 00:21:28.615	2025-08-25 00:21:28.615	f
cmeqdgiax00czkzptsrkjnqro	cmeqdghyz0007kzptml41sloi	cmeqd9kfx00024cwz5a87wv43	cmeqdgi19001hkzptsoqk4mu5	\N	2025-09-15 00:21:28.48	09:30	10:00	EXAM	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.617	2025-08-25 00:21:28.617	f
cmeqdgiaz00d1kzptpmask2cb	cmeqd7sit00014cwz827vzxib	cmeqdgi37003bkzptspnnicry	cmeqdgi15001dkzptcfk5s42c	cmeqdghzg000ckzpt3rqux2h5	2025-09-16 00:21:28.48	15:30	15:45	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.619	2025-08-25 00:21:28.619	f
cmeqdgib100d3kzptk4qkh1hg	cmeqdghyn0002kzpt56kjppgr	cmeqdgi3r0049kzpt2jdyq26g	cmeqdgi15001dkzptcfk5s42c	cmeqdghzg000ckzpt3rqux2h5	2025-09-16 00:21:28.48	10:30	10:45	RETURN	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.622	2025-08-25 00:21:28.622	f
cmeqdgib300d5kzptx3owg5fi	cmeqd7sit00014cwz827vzxib	cmeqd9kfx00024cwz5a87wv43	cmeqdgi19001hkzptsoqk4mu5	cmeqdghzg000ckzpt3rqux2h5	2025-09-16 00:21:28.48	10:00	10:30	EXAM	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.624	2025-08-25 00:21:28.624	f
cmeqdgib500d7kzptjqpl7xh0	cmeqdghyt0004kzpt40da3xok	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi1c001jkzptf1jr547w	cmeqdghzf000bkzpte6v303wo	2025-09-16 00:21:28.48	15:30	16:30	PROCEDURE	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.625	2025-08-25 00:21:28.625	f
cmeqdgib700d9kzpt8q752ytt	cmeqdghyn0002kzpt56kjppgr	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi0t0013kzpt1pil7fa0	\N	2025-09-16 00:21:28.48	15:00	15:30	RETURN	SCHEDULED	Retorno para avaliação	\N	\N	\N	2025-08-25 00:21:28.627	2025-08-25 00:21:28.627	f
cmeqdgib900dbkzpt2gp0xhms	cmeqdghyt0004kzpt40da3xok	cmeqdgi37003bkzptspnnicry	cmeqdgi100019kzpta8trwa0s	cmeqdghzg000ckzpt3rqux2h5	2025-09-16 00:21:28.48	08:30	09:05	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.629	2025-08-25 00:21:28.629	f
cmeqdgibb00ddkzpt3pzugtzr	cmeqdghyt0004kzpt40da3xok	cmeqd9kfx00024cwz5a87wv43	cmeqdgi19001hkzptsoqk4mu5	\N	2025-09-17 00:21:28.48	09:30	10:00	EXAM	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.632	2025-08-25 00:21:28.632	f
cmeqdgibd00dfkzpttxes1jg1	cmeqdghyn0002kzpt56kjppgr	cmeqdgi37003bkzptspnnicry	cmeqdgi100019kzpta8trwa0s	cmeqdghzg000ckzpt3rqux2h5	2025-09-17 00:21:28.48	15:30	16:05	RETURN	SCHEDULED	Paciente relatou melhora	\N	\N	\N	2025-08-25 00:21:28.633	2025-08-25 00:21:28.633	f
cmeqdgibf00dhkzptoife24vp	cmeqdghyv0005kzpta2h57t9b	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi19001hkzptsoqk4mu5	cmeqdghz9000akzpt91g8uerq	2025-09-17 00:21:28.48	14:00	14:30	EXAM	SCHEDULED	Retorno para avaliação	\N	\N	\N	2025-08-25 00:21:28.635	2025-08-25 00:21:28.635	f
cmeqdgibh00djkzpt1yiqi3sq	cmeqdghyn0002kzpt56kjppgr	cmeqdgi37003bkzptspnnicry	cmeqdgi0t0013kzpt1pil7fa0	cmeqdghz9000akzpt91g8uerq	2025-09-17 00:21:28.48	11:00	11:30	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.637	2025-08-25 00:21:28.637	f
cmeqdgibj00dlkzptzlqr9f3k	cmeqdghyj0001kzpt493kfno2	cmeqdgi3r0049kzpt2jdyq26g	cmeqdgi100019kzpta8trwa0s	cmeqdghz9000akzpt91g8uerq	2025-09-17 00:21:28.48	14:30	15:05	RETURN	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.639	2025-08-25 00:21:28.639	f
cmeqdgibl00dnkzptq0l6vacq	cmeqdghyc0000kzpt0zlg6czf	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi15001dkzptcfk5s42c	cmeqdghzg000ckzpt3rqux2h5	2025-09-17 00:21:28.48	08:00	08:15	CONSULTATION	SCHEDULED	Retorno para avaliação	\N	\N	\N	2025-08-25 00:21:28.641	2025-08-25 00:21:28.641	f
cmeqdgibm00dpkzptj99fsje4	cmeqd7sit00014cwz827vzxib	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi15001dkzptcfk5s42c	\N	2025-09-18 00:21:28.48	14:30	14:45	CONSULTATION	SCHEDULED	Paciente relatou melhora	\N	\N	\N	2025-08-25 00:21:28.642	2025-08-25 00:21:28.642	f
cmeqdgibo00drkzpthzfuw9px	cmeqd7sit00014cwz827vzxib	cmeqd9kfx00024cwz5a87wv43	cmeqdgi15001dkzptcfk5s42c	cmeqdghzf000bkzpte6v303wo	2025-09-18 00:21:28.48	16:00	16:15	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.644	2025-08-25 00:21:28.644	f
cmeqdgibq00dtkzptwwz4tyna	cmeqdghyq0003kzptk7kn88fc	cmeqd9kfx00024cwz5a87wv43	cmeqdgi17001fkzpti9wt1as2	\N	2025-09-18 00:21:28.48	13:00	13:25	EXAM	SCHEDULED	Exame de rotina	\N	\N	\N	2025-08-25 00:21:28.647	2025-08-25 00:21:28.647	f
cmeqdgibs00dvkzpty8mjrfau	cmeqd769k00004cwzfb4lya3k	cmeqdgi3r0049kzpt2jdyq26g	cmeqdgi0y0017kzptezkystw6	cmeqdghzg000ckzpt3rqux2h5	2025-09-19 00:21:28.48	09:00	09:40	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.648	2025-08-25 00:21:28.648	f
cmeqdgibt00dxkzpt7ei6mgkp	cmeqdghyq0003kzptk7kn88fc	cmeqdgi3r0049kzpt2jdyq26g	cmeqdgi17001fkzpti9wt1as2	\N	2025-09-19 00:21:28.48	08:30	08:55	EXAM	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.65	2025-08-25 00:21:28.65	f
cmeqdgibv00dzkzpt85xmvc2l	cmeqdghyz0007kzptml41sloi	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi17001fkzpti9wt1as2	\N	2025-09-19 00:21:28.48	08:00	08:25	EXAM	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.651	2025-08-25 00:21:28.651	f
cmeqdgibx00e1kzptf45k4k6g	cmeqdghyz0007kzptml41sloi	cmeqdgi3r0049kzpt2jdyq26g	cmeqdgi100019kzpta8trwa0s	cmeqdghzg000ckzpt3rqux2h5	2025-09-19 00:21:28.48	15:30	16:05	CONSULTATION	SCHEDULED	Retorno para avaliação	\N	\N	\N	2025-08-25 00:21:28.654	2025-08-25 00:21:28.654	f
cmeqdgibz00e3kzptc0734gjh	cmeqdghyn0002kzpt56kjppgr	cmeqd9kfx00024cwz5a87wv43	cmeqdgi1e001lkzpt6mdxvh9h	cmeqdghz9000akzpt91g8uerq	2025-09-19 00:21:28.48	11:30	11:50	RETURN	SCHEDULED	Necessário acompanhamento	\N	\N	\N	2025-08-25 00:21:28.656	2025-08-25 00:21:28.656	f
cmeqdgic100e5kzptizu8zmjy	cmeqdghyt0004kzpt40da3xok	cmeqd9kfx00024cwz5a87wv43	cmeqdgi19001hkzptsoqk4mu5	cmeqdghzf000bkzpte6v303wo	2025-09-19 00:21:28.48	15:00	15:30	EXAM	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.657	2025-08-25 00:21:28.657	f
cmeqdgic200e7kzptzbl8b1pq	cmeqdghyq0003kzptk7kn88fc	cmeqd9kfx00024cwz5a87wv43	cmeqdgi1c001jkzptf1jr547w	\N	2025-09-19 00:21:28.48	10:30	11:30	PROCEDURE	SCHEDULED	Exame de rotina	\N	\N	\N	2025-08-25 00:21:28.659	2025-08-25 00:21:28.659	f
cmeqdgic400e9kzpt483dv7xg	cmeqd769k00004cwzfb4lya3k	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi1c001jkzptf1jr547w	cmeqdghzf000bkzpte6v303wo	2025-09-19 00:21:28.48	14:30	15:30	PROCEDURE	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.66	2025-08-25 00:21:28.66	f
cmeqdgic600ebkzpt1yyaziyx	cmeqdghyz0007kzptml41sloi	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi19001hkzptsoqk4mu5	cmeqdghzg000ckzpt3rqux2h5	2025-09-22 00:21:28.48	09:30	10:00	EXAM	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.662	2025-08-25 00:21:28.662	f
cmeqdgic700edkzpt23praf0u	cmeqdghyv0005kzpta2h57t9b	cmeqdgi37003bkzptspnnicry	cmeqdgi19001hkzptsoqk4mu5	cmeqdghzf000bkzpte6v303wo	2025-09-22 00:21:28.48	14:00	14:30	EXAM	SCHEDULED	Paciente relatou melhora	\N	\N	\N	2025-08-25 00:21:28.664	2025-08-25 00:21:28.664	f
cmeqdgic900efkzptf3y9fk8k	cmeqdghyz0007kzptml41sloi	cmeqdgi37003bkzptspnnicry	cmeqdgi0t0013kzpt1pil7fa0	cmeqdghzf000bkzpte6v303wo	2025-09-22 00:21:28.48	14:30	15:00	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.665	2025-08-25 00:21:28.665	f
cmeqdgica00ehkzptiyvp4m0d	cmeqdghyj0001kzpt493kfno2	cmeqdgi37003bkzptspnnicry	cmeqdgi1e001lkzpt6mdxvh9h	cmeqdghz9000akzpt91g8uerq	2025-09-22 00:21:28.48	13:00	13:20	CONSULTATION	SCHEDULED	Retorno para avaliação	\N	\N	\N	2025-08-25 00:21:28.667	2025-08-25 00:21:28.667	f
cmeqdgicb00ejkzptbim7p77q	cmeqdghyc0000kzpt0zlg6czf	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi0t0013kzpt1pil7fa0	cmeqdghzf000bkzpte6v303wo	2025-09-22 00:21:28.48	16:00	16:30	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.668	2025-08-25 00:21:28.668	f
cmeqdgice00elkzptgnhl2wzy	cmeqdghyz0007kzptml41sloi	cmeqdgi3r0049kzpt2jdyq26g	cmeqdgi1c001jkzptf1jr547w	\N	2025-09-22 00:21:28.48	08:30	09:30	PROCEDURE	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.67	2025-08-25 00:21:28.67	f
cmeqdgicg00enkzptcfa9x96f	cmeqdghyj0001kzpt493kfno2	cmeqdgi2p002ukzptiomce8q3	cmeqdgi1c001jkzptf1jr547w	cmeqdghz9000akzpt91g8uerq	2025-09-22 00:21:28.48	15:30	16:30	PROCEDURE	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.672	2025-08-25 00:21:28.672	f
cmeqdgici00epkzptpiqd8omt	cmeqdghyq0003kzptk7kn88fc	cmeqdgi3r0049kzpt2jdyq26g	cmeqdgi100019kzpta8trwa0s	cmeqdghz9000akzpt91g8uerq	2025-09-22 00:21:28.48	13:00	13:35	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.674	2025-08-25 00:21:28.674	f
cmeqdgick00erkzptxwxbmokc	cmeqd7sit00014cwz827vzxib	cmeqd9kfx00024cwz5a87wv43	cmeqdgi0t0013kzpt1pil7fa0	cmeqdghzf000bkzpte6v303wo	2025-09-23 00:21:28.48	10:30	11:00	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.676	2025-08-25 00:21:28.676	f
cmeqdgicm00etkzptsg2ig6em	cmeqdghyx0006kzptcbsizaes	cmeqdgi2p002ukzptiomce8q3	cmeqdgi100019kzpta8trwa0s	cmeqdghz9000akzpt91g8uerq	2025-09-23 00:21:28.48	10:30	11:05	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.679	2025-08-25 00:21:28.679	f
cmeqdgico00evkzptl9r2nzx1	cmeqdghyt0004kzpt40da3xok	cmeqdgi37003bkzptspnnicry	cmeqdgi15001dkzptcfk5s42c	\N	2025-09-23 00:21:28.48	16:00	16:15	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.681	2025-08-25 00:21:28.681	f
cmeqdgicq00exkzptiyt32rws	cmeqd769k00004cwzfb4lya3k	cmeqdgi3r0049kzpt2jdyq26g	cmeqdgi0y0017kzptezkystw6	cmeqdghzf000bkzpte6v303wo	2025-09-23 00:21:28.48	09:30	10:10	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.682	2025-08-25 00:21:28.682	f
cmeqdgics00ezkzptwn8yf6zv	cmeqdghyn0002kzpt56kjppgr	cmeqdgi37003bkzptspnnicry	cmeqdgi12001bkzptpgh703re	cmeqdghzf000bkzpte6v303wo	2025-09-24 00:21:28.48	08:30	09:00	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.684	2025-08-25 00:21:28.684	f
cmeqdgict00f1kzpt2huxlr3c	cmeqdghyt0004kzpt40da3xok	cmeqdgi2p002ukzptiomce8q3	cmeqdgi17001fkzpti9wt1as2	\N	2025-09-24 00:21:28.48	08:30	08:55	EXAM	SCHEDULED	Paciente relatou melhora	\N	\N	\N	2025-08-25 00:21:28.686	2025-08-25 00:21:28.686	f
cmeqdgicw00f3kzptbogk2ry5	cmeqdghyz0007kzptml41sloi	cmeqdgi2p002ukzptiomce8q3	cmeqdgi1e001lkzpt6mdxvh9h	cmeqdghzg000ckzpt3rqux2h5	2025-09-24 00:21:28.48	09:30	09:50	CONSULTATION	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.688	2025-08-25 00:21:28.688	f
cmeqdgicy00f5kzptg1q8aq3u	cmeqdghyn0002kzpt56kjppgr	cmeqdgi37003bkzptspnnicry	cmeqdgi17001fkzpti9wt1as2	\N	2025-09-24 00:21:28.48	13:00	13:25	EXAM	SCHEDULED	\N	\N	\N	\N	2025-08-25 00:21:28.69	2025-08-25 00:21:28.69	f
cmeqdgijl00n2kzpt6is3h00p	cmeqdghyx0006kzptcbsizaes	cmeqd9kfx00024cwz5a87wv43	cmeqdgi0y0017kzptezkystw6	cmeqdghzg000ckzpt3rqux2h5	2025-07-16 14:30:00	2025-07-16T14:30:00.000Z	2025-07-16T15:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Parceiro 1 de Oliveira	2025-07-16 14:30:00	2025-07-16 15:30:00	\N	2025-08-25 00:21:28.93	2025-08-25 00:21:28.93	f
cmeqdgijo00n4kzptx97zda5s	cmeqdghyq0003kzptk7kn88fc	cmeqd9kfx00024cwz5a87wv43	cmeqdgi12001bkzptpgh703re	cmeqdghz9000akzpt91g8uerq	2025-07-22 12:30:00	2025-07-22T12:30:00.000Z	2025-07-22T13:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Parceiro 1 de Oliveira	2025-07-22 12:30:00	2025-07-22 13:30:00	\N	2025-08-25 00:21:28.933	2025-08-25 00:21:28.933	f
cmeqdgijs00n6kzptx5sr9dmh	cmeqd7sit00014cwz827vzxib	cmeqd9kfx00024cwz5a87wv43	cmeqdgi0t0013kzpt1pil7fa0	cmeqdghz9000akzpt91g8uerq	2025-07-02 12:30:00	2025-07-02T12:30:00.000Z	2025-07-02T13:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Parceiro 1 de Oliveira	2025-07-02 12:30:00	2025-07-02 13:30:00	\N	2025-08-25 00:21:28.937	2025-08-25 00:21:28.937	f
cmeqdgijv00n8kzpt00n47e6b	cmeqdghyq0003kzptk7kn88fc	cmeqd9kfx00024cwz5a87wv43	cmeqdgi0y0017kzptezkystw6	cmeqdghzg000ckzpt3rqux2h5	2025-07-05 13:30:00	2025-07-05T13:30:00.000Z	2025-07-05T14:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Parceiro 1 de Oliveira	2025-07-05 13:30:00	2025-07-05 14:30:00	\N	2025-08-25 00:21:28.94	2025-08-25 00:21:28.94	f
cmeqdgijy00nakzpt97t03esz	cmeqdghyz0007kzptml41sloi	cmeqd9kfx00024cwz5a87wv43	cmeqdgi0y0017kzptezkystw6	cmeqdghzg000ckzpt3rqux2h5	2025-07-27 13:30:00	2025-07-27T13:30:00.000Z	2025-07-27T14:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Parceiro 1 de Oliveira	2025-07-27 13:30:00	2025-07-27 14:30:00	\N	2025-08-25 00:21:28.942	2025-08-25 00:21:28.942	f
cmeqdgik100nckzptw0u3agiu	cmeqd7sit00014cwz827vzxib	cmeqd9kfx00024cwz5a87wv43	cmeqdgi0t0013kzpt1pil7fa0	cmeqdghz9000akzpt91g8uerq	2025-07-16 16:30:00	2025-07-16T16:30:00.000Z	2025-07-16T17:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Parceiro 1 de Oliveira	2025-07-16 16:30:00	2025-07-16 17:30:00	\N	2025-08-25 00:21:28.945	2025-08-25 00:21:28.945	f
cmeqdgik400nekzpt2teqrltw	cmeqdghyv0005kzpta2h57t9b	cmeqd9kfx00024cwz5a87wv43	cmeqdgi12001bkzptpgh703re	cmeqdghzg000ckzpt3rqux2h5	2025-07-23 11:00:00	2025-07-23T11:00:00.000Z	2025-07-23T12:00:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Parceiro 1 de Oliveira	2025-07-23 11:00:00	2025-07-23 12:00:00	\N	2025-08-25 00:21:28.948	2025-08-25 00:21:28.948	f
cmeqdgik600ngkzptdeafuixs	cmeqdghyv0005kzpta2h57t9b	cmeqd9kfx00024cwz5a87wv43	cmeqdgi12001bkzptpgh703re	cmeqdghzg000ckzpt3rqux2h5	2025-07-03 15:00:00	2025-07-03T15:00:00.000Z	2025-07-03T16:00:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Parceiro 1 de Oliveira	2025-07-03 15:00:00	2025-07-03 16:00:00	\N	2025-08-25 00:21:28.951	2025-08-25 00:21:28.951	f
cmeqdgika00nikzpticz3g8hd	cmeqdghyv0005kzpta2h57t9b	cmeqd9kfx00024cwz5a87wv43	cmeqdgi0y0017kzptezkystw6	cmeqdghzg000ckzpt3rqux2h5	2025-07-19 13:00:00	2025-07-19T13:00:00.000Z	2025-07-19T14:00:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Parceiro 1 de Oliveira	2025-07-19 13:00:00	2025-07-19 14:00:00	\N	2025-08-25 00:21:28.954	2025-08-25 00:21:28.954	f
cmeqdgikd00nkkzpt92o8x67q	cmeqdghyc0000kzpt0zlg6czf	cmeqd9kfx00024cwz5a87wv43	cmeqdgi0x0015kzpt8lfjsh2e	cmeqdghzf000bkzpte6v303wo	2025-07-24 10:30:00	2025-07-24T10:30:00.000Z	2025-07-24T11:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Parceiro 1 de Oliveira	2025-07-24 10:30:00	2025-07-24 11:30:00	\N	2025-08-25 00:21:28.957	2025-08-25 00:21:28.957	f
cmeqdgikg00nmkzptajzqp5hc	cmeqdghyv0005kzpta2h57t9b	cmeqd9kfx00024cwz5a87wv43	cmeqdgi0t0013kzpt1pil7fa0	cmeqdghzf000bkzpte6v303wo	2025-07-04 16:30:00	2025-07-04T16:30:00.000Z	2025-07-04T17:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Parceiro 1 de Oliveira	2025-07-04 16:30:00	2025-07-04 17:30:00	\N	2025-08-25 00:21:28.96	2025-08-25 00:21:28.96	f
cmeqdgikj00nokzpt9hkx80h1	cmeqd7sit00014cwz827vzxib	cmeqd9kfx00024cwz5a87wv43	cmeqdgi0y0017kzptezkystw6	cmeqdghzg000ckzpt3rqux2h5	2025-07-23 17:00:00	2025-07-23T17:00:00.000Z	2025-07-23T18:00:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Parceiro 1 de Oliveira	2025-07-23 17:00:00	2025-07-23 18:00:00	\N	2025-08-25 00:21:28.964	2025-08-25 00:21:28.964	f
cmeqdgikn00nqkzpt9b8ri5a4	cmeqdghyj0001kzpt493kfno2	cmeqd9kfx00024cwz5a87wv43	cmeqdgi0t0013kzpt1pil7fa0	cmeqdghzf000bkzpte6v303wo	2025-07-23 15:00:00	2025-07-23T15:00:00.000Z	2025-07-23T16:00:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Parceiro 1 de Oliveira	2025-07-23 15:00:00	2025-07-23 16:00:00	\N	2025-08-25 00:21:28.967	2025-08-25 00:21:28.967	f
cmeqdgikr00nskzptkko5vfte	cmeqd7sit00014cwz827vzxib	cmeqd9kfx00024cwz5a87wv43	cmeqdgi0x0015kzpt8lfjsh2e	cmeqdghzg000ckzpt3rqux2h5	2025-07-27 15:30:00	2025-07-27T15:30:00.000Z	2025-07-27T16:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Parceiro 1 de Oliveira	2025-07-27 15:30:00	2025-07-27 16:30:00	\N	2025-08-25 00:21:28.971	2025-08-25 00:21:28.971	f
cmeqdgiku00nukzpt8yy8ln99	cmeqdghyv0005kzpta2h57t9b	cmeqd9kfx00024cwz5a87wv43	cmeqdgi0y0017kzptezkystw6	cmeqdghzf000bkzpte6v303wo	2025-07-13 14:30:00	2025-07-13T14:30:00.000Z	2025-07-13T15:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Parceiro 1 de Oliveira	2025-07-13 14:30:00	2025-07-13 15:30:00	\N	2025-08-25 00:21:28.974	2025-08-25 00:21:28.974	f
cmeqdgikx00nwkzptpixvb68s	cmeqdghyt0004kzpt40da3xok	cmeqd9kfx00024cwz5a87wv43	cmeqdgi12001bkzptpgh703re	cmeqdghzf000bkzpte6v303wo	2025-07-11 15:30:00	2025-07-11T15:30:00.000Z	2025-07-11T16:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Parceiro 1 de Oliveira	2025-07-11 15:30:00	2025-07-11 16:30:00	\N	2025-08-25 00:21:28.977	2025-08-25 00:21:28.977	f
cmeqdgil000nykzptga6uy80q	cmeqdghyt0004kzpt40da3xok	cmeqd9kfx00024cwz5a87wv43	cmeqdgi0t0013kzpt1pil7fa0	cmeqdghzf000bkzpte6v303wo	2025-07-13 11:30:00	2025-07-13T11:30:00.000Z	2025-07-13T12:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Parceiro 1 de Oliveira	2025-07-13 11:30:00	2025-07-13 12:30:00	\N	2025-08-25 00:21:28.98	2025-08-25 00:21:28.98	f
cmeqdgil300o0kzptqd8lozq7	cmeqdghyc0000kzpt0zlg6czf	cmeqd9kfx00024cwz5a87wv43	cmeqdgi0t0013kzpt1pil7fa0	cmeqdghz9000akzpt91g8uerq	2025-07-15 13:30:00	2025-07-15T13:30:00.000Z	2025-07-15T14:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Parceiro 1 de Oliveira	2025-07-15 13:30:00	2025-07-15 14:30:00	\N	2025-08-25 00:21:28.983	2025-08-25 00:21:28.983	f
cmeqdgil900o2kzptzx5xrj27	cmeqdghyz0007kzptml41sloi	cmeqdgi2p002ukzptiomce8q3	cmeqdgi100019kzpta8trwa0s	cmeqdghzf000bkzpte6v303wo	2025-07-17 16:30:00	2025-07-17T16:30:00.000Z	2025-07-17T17:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dr. Ricardo Almeida Silva	2025-07-17 16:30:00	2025-07-17 17:30:00	\N	2025-08-25 00:21:28.989	2025-08-25 00:21:28.989	f
cmeqdgilc00o4kzptz5e4w2vp	cmeqdghyv0005kzpta2h57t9b	cmeqdgi2p002ukzptiomce8q3	cmeqdgi12001bkzptpgh703re	cmeqdghzg000ckzpt3rqux2h5	2025-07-24 15:30:00	2025-07-24T15:30:00.000Z	2025-07-24T16:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dr. Ricardo Almeida Silva	2025-07-24 15:30:00	2025-07-24 16:30:00	\N	2025-08-25 00:21:28.993	2025-08-25 00:21:28.993	f
cmeqdgilg00o6kzpt8o2eu76c	cmeqdghyj0001kzpt493kfno2	cmeqdgi2p002ukzptiomce8q3	cmeqdgi0y0017kzptezkystw6	cmeqdghz9000akzpt91g8uerq	2025-07-22 11:00:00	2025-07-22T11:00:00.000Z	2025-07-22T12:00:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dr. Ricardo Almeida Silva	2025-07-22 11:00:00	2025-07-22 12:00:00	\N	2025-08-25 00:21:28.996	2025-08-25 00:21:28.996	f
cmeqdgilj00o8kzptadf0guiv	cmeqdghyx0006kzptcbsizaes	cmeqdgi2p002ukzptiomce8q3	cmeqdgi0x0015kzpt8lfjsh2e	cmeqdghz9000akzpt91g8uerq	2025-07-12 10:30:00	2025-07-12T10:30:00.000Z	2025-07-12T11:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dr. Ricardo Almeida Silva	2025-07-12 10:30:00	2025-07-12 11:30:00	\N	2025-08-25 00:21:28.999	2025-08-25 00:21:28.999	f
cmeqdgilm00oakzpttkhfnyf2	cmeqdghyn0002kzpt56kjppgr	cmeqdgi2p002ukzptiomce8q3	cmeqdgi0y0017kzptezkystw6	cmeqdghzg000ckzpt3rqux2h5	2025-07-10 10:30:00	2025-07-10T10:30:00.000Z	2025-07-10T11:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dr. Ricardo Almeida Silva	2025-07-10 10:30:00	2025-07-10 11:30:00	\N	2025-08-25 00:21:29.003	2025-08-25 00:21:29.003	f
cmeqdgilq00ockzpt8fr1t29b	cmeqd769k00004cwzfb4lya3k	cmeqdgi2p002ukzptiomce8q3	cmeqdgi12001bkzptpgh703re	cmeqdghzf000bkzpte6v303wo	2025-07-17 16:00:00	2025-07-17T16:00:00.000Z	2025-07-17T17:00:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dr. Ricardo Almeida Silva	2025-07-17 16:00:00	2025-07-17 17:00:00	\N	2025-08-25 00:21:29.006	2025-08-25 00:21:29.006	f
cmeqdgilu00oekzptxtfiidn4	cmeqd769k00004cwzfb4lya3k	cmeqdgi2p002ukzptiomce8q3	cmeqdgi100019kzpta8trwa0s	cmeqdghzf000bkzpte6v303wo	2025-07-03 15:00:00	2025-07-03T15:00:00.000Z	2025-07-03T16:00:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dr. Ricardo Almeida Silva	2025-07-03 15:00:00	2025-07-03 16:00:00	\N	2025-08-25 00:21:29.01	2025-08-25 00:21:29.01	f
cmeqdgilx00ogkzptaay9tjeu	cmeqdghyc0000kzpt0zlg6czf	cmeqdgi2p002ukzptiomce8q3	cmeqdgi12001bkzptpgh703re	cmeqdghzf000bkzpte6v303wo	2025-07-22 16:30:00	2025-07-22T16:30:00.000Z	2025-07-22T17:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dr. Ricardo Almeida Silva	2025-07-22 16:30:00	2025-07-22 17:30:00	\N	2025-08-25 00:21:29.014	2025-08-25 00:21:29.014	f
cmeqdgim000oikzptrixhfhm2	cmeqdghyj0001kzpt493kfno2	cmeqdgi2p002ukzptiomce8q3	cmeqdgi0y0017kzptezkystw6	cmeqdghz9000akzpt91g8uerq	2025-07-25 14:30:00	2025-07-25T14:30:00.000Z	2025-07-25T15:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dr. Ricardo Almeida Silva	2025-07-25 14:30:00	2025-07-25 15:30:00	\N	2025-08-25 00:21:29.016	2025-08-25 00:21:29.016	f
cmeqdgim300okkzptd23u7xty	cmeqdghyj0001kzpt493kfno2	cmeqdgi2p002ukzptiomce8q3	cmeqdgi0y0017kzptezkystw6	cmeqdghzg000ckzpt3rqux2h5	2025-07-04 09:30:00	2025-07-04T09:30:00.000Z	2025-07-04T10:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dr. Ricardo Almeida Silva	2025-07-04 09:30:00	2025-07-04 10:30:00	\N	2025-08-25 00:21:29.019	2025-08-25 00:21:29.019	f
cmeqdgim700omkzptexetsee1	cmeqd7sit00014cwz827vzxib	cmeqdgi2p002ukzptiomce8q3	cmeqdgi0x0015kzpt8lfjsh2e	cmeqdghzf000bkzpte6v303wo	2025-07-08 16:00:00	2025-07-08T16:00:00.000Z	2025-07-08T17:00:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dr. Ricardo Almeida Silva	2025-07-08 16:00:00	2025-07-08 17:00:00	\N	2025-08-25 00:21:29.023	2025-08-25 00:21:29.023	f
cmeqdgimc00ookzptyz7shhnv	cmeqdghyv0005kzpta2h57t9b	cmeqdgi37003bkzptspnnicry	cmeqdgi0y0017kzptezkystw6	cmeqdghzf000bkzpte6v303wo	2025-07-27 14:00:00	2025-07-27T14:00:00.000Z	2025-07-27T15:00:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dra. Mariana Costa Pereira	2025-07-27 14:00:00	2025-07-27 15:00:00	\N	2025-08-25 00:21:29.028	2025-08-25 00:21:29.028	f
cmeqdgimf00oqkzptdwttu9l4	cmeqd7sit00014cwz827vzxib	cmeqdgi37003bkzptspnnicry	cmeqdgi0t0013kzpt1pil7fa0	cmeqdghz9000akzpt91g8uerq	2025-07-14 10:30:00	2025-07-14T10:30:00.000Z	2025-07-14T11:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dra. Mariana Costa Pereira	2025-07-14 10:30:00	2025-07-14 11:30:00	\N	2025-08-25 00:21:29.031	2025-08-25 00:21:29.031	f
cmeqdgimi00oskzpt464pyd86	cmeqdghyt0004kzpt40da3xok	cmeqdgi37003bkzptspnnicry	cmeqdgi0y0017kzptezkystw6	cmeqdghz9000akzpt91g8uerq	2025-07-02 10:00:00	2025-07-02T10:00:00.000Z	2025-07-02T11:00:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dra. Mariana Costa Pereira	2025-07-02 10:00:00	2025-07-02 11:00:00	\N	2025-08-25 00:21:29.034	2025-08-25 00:21:29.034	f
cmeqdgimm00oukzptaf3ndsfz	cmeqdghyc0000kzpt0zlg6czf	cmeqdgi37003bkzptspnnicry	cmeqdgi0y0017kzptezkystw6	cmeqdghzg000ckzpt3rqux2h5	2025-07-17 11:00:00	2025-07-17T11:00:00.000Z	2025-07-17T12:00:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dra. Mariana Costa Pereira	2025-07-17 11:00:00	2025-07-17 12:00:00	\N	2025-08-25 00:21:29.038	2025-08-25 00:21:29.038	f
cmeqdgimp00owkzptqqp8md4b	cmeqdghyt0004kzpt40da3xok	cmeqdgi37003bkzptspnnicry	cmeqdgi0x0015kzpt8lfjsh2e	cmeqdghzg000ckzpt3rqux2h5	2025-07-22 17:30:00	2025-07-22T17:30:00.000Z	2025-07-22T18:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dra. Mariana Costa Pereira	2025-07-22 17:30:00	2025-07-22 18:30:00	\N	2025-08-25 00:21:29.041	2025-08-25 00:21:29.041	f
cmeqdgimr00oykzpt2ddqqbm0	cmeqdghyn0002kzpt56kjppgr	cmeqdgi37003bkzptspnnicry	cmeqdgi0x0015kzpt8lfjsh2e	cmeqdghzf000bkzpte6v303wo	2025-07-16 15:30:00	2025-07-16T15:30:00.000Z	2025-07-16T16:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dra. Mariana Costa Pereira	2025-07-16 15:30:00	2025-07-16 16:30:00	\N	2025-08-25 00:21:29.044	2025-08-25 00:21:29.044	f
cmeqdgimv00p0kzpt54anu95e	cmeqd7sit00014cwz827vzxib	cmeqdgi37003bkzptspnnicry	cmeqdgi0t0013kzpt1pil7fa0	cmeqdghzf000bkzpte6v303wo	2025-07-21 12:00:00	2025-07-21T12:00:00.000Z	2025-07-21T13:00:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dra. Mariana Costa Pereira	2025-07-21 12:00:00	2025-07-21 13:00:00	\N	2025-08-25 00:21:29.047	2025-08-25 00:21:29.047	f
cmeqdgimy00p2kzpt6gzrw9gw	cmeqd769k00004cwzfb4lya3k	cmeqdgi37003bkzptspnnicry	cmeqdgi100019kzpta8trwa0s	cmeqdghz9000akzpt91g8uerq	2025-07-26 16:30:00	2025-07-26T16:30:00.000Z	2025-07-26T17:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dra. Mariana Costa Pereira	2025-07-26 16:30:00	2025-07-26 17:30:00	\N	2025-08-25 00:21:29.05	2025-08-25 00:21:29.05	f
cmeqdgin100p4kzpti7p0mith	cmeqdghyq0003kzptk7kn88fc	cmeqdgi37003bkzptspnnicry	cmeqdgi0x0015kzpt8lfjsh2e	cmeqdghzf000bkzpte6v303wo	2025-07-04 12:00:00	2025-07-04T12:00:00.000Z	2025-07-04T13:00:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dra. Mariana Costa Pereira	2025-07-04 12:00:00	2025-07-04 13:00:00	\N	2025-08-25 00:21:29.054	2025-08-25 00:21:29.054	f
cmeqdgin500p6kzptsx9cn1ck	cmeqdghyv0005kzpta2h57t9b	cmeqdgi37003bkzptspnnicry	cmeqdgi12001bkzptpgh703re	cmeqdghz9000akzpt91g8uerq	2025-07-08 12:30:00	2025-07-08T12:30:00.000Z	2025-07-08T13:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dra. Mariana Costa Pereira	2025-07-08 12:30:00	2025-07-08 13:30:00	\N	2025-08-25 00:21:29.057	2025-08-25 00:21:29.057	f
cmeqdgin800p8kzptc6yzwzlc	cmeqd7sit00014cwz827vzxib	cmeqdgi37003bkzptspnnicry	cmeqdgi100019kzpta8trwa0s	cmeqdghzg000ckzpt3rqux2h5	2025-07-13 16:30:00	2025-07-13T16:30:00.000Z	2025-07-13T17:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dra. Mariana Costa Pereira	2025-07-13 16:30:00	2025-07-13 17:30:00	\N	2025-08-25 00:21:29.06	2025-08-25 00:21:29.06	f
cmeqdginb00pakzptoeras6da	cmeqd769k00004cwzfb4lya3k	cmeqdgi37003bkzptspnnicry	cmeqdgi100019kzpta8trwa0s	cmeqdghzf000bkzpte6v303wo	2025-07-16 16:00:00	2025-07-16T16:00:00.000Z	2025-07-16T17:00:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dra. Mariana Costa Pereira	2025-07-16 16:00:00	2025-07-16 17:00:00	\N	2025-08-25 00:21:29.063	2025-08-25 00:21:29.063	f
cmeqdgine00pckzpti4s90nn1	cmeqd7sit00014cwz827vzxib	cmeqdgi37003bkzptspnnicry	cmeqdgi0y0017kzptezkystw6	cmeqdghzg000ckzpt3rqux2h5	2025-07-24 13:30:00	2025-07-24T13:30:00.000Z	2025-07-24T14:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dra. Mariana Costa Pereira	2025-07-24 13:30:00	2025-07-24 14:30:00	\N	2025-08-25 00:21:29.066	2025-08-25 00:21:29.066	f
cmeqdgini00pekzpt71xjgfgl	cmeqdghyv0005kzpta2h57t9b	cmeqdgi37003bkzptspnnicry	cmeqdgi100019kzpta8trwa0s	cmeqdghzf000bkzpte6v303wo	2025-07-23 09:00:00	2025-07-23T09:00:00.000Z	2025-07-23T10:00:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dra. Mariana Costa Pereira	2025-07-23 09:00:00	2025-07-23 10:00:00	\N	2025-08-25 00:21:29.07	2025-08-25 00:21:29.07	f
cmeqdginl00pgkzpt9doh66r3	cmeqdghyt0004kzpt40da3xok	cmeqdgi37003bkzptspnnicry	cmeqdgi12001bkzptpgh703re	cmeqdghzg000ckzpt3rqux2h5	2025-07-16 09:30:00	2025-07-16T09:30:00.000Z	2025-07-16T10:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dra. Mariana Costa Pereira	2025-07-16 09:30:00	2025-07-16 10:30:00	\N	2025-08-25 00:21:29.073	2025-08-25 00:21:29.073	f
cmeqdginp00pikzptp7dnpsrr	cmeqd7sit00014cwz827vzxib	cmeqdgi37003bkzptspnnicry	cmeqdgi12001bkzptpgh703re	cmeqdghz9000akzpt91g8uerq	2025-07-15 10:30:00	2025-07-15T10:30:00.000Z	2025-07-15T11:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dra. Mariana Costa Pereira	2025-07-15 10:30:00	2025-07-15 11:30:00	\N	2025-08-25 00:21:29.077	2025-08-25 00:21:29.077	f
cmeqdgins00pkkzptregwisgm	cmeqdghyq0003kzptk7kn88fc	cmeqdgi37003bkzptspnnicry	cmeqdgi0y0017kzptezkystw6	cmeqdghzg000ckzpt3rqux2h5	2025-07-19 17:30:00	2025-07-19T17:30:00.000Z	2025-07-19T18:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dra. Mariana Costa Pereira	2025-07-19 17:30:00	2025-07-19 18:30:00	\N	2025-08-25 00:21:29.081	2025-08-25 00:21:29.081	f
cmeqdginv00pmkzptj9jiuh8w	cmeqdghyj0001kzpt493kfno2	cmeqdgi37003bkzptspnnicry	cmeqdgi0x0015kzpt8lfjsh2e	cmeqdghzg000ckzpt3rqux2h5	2025-07-03 11:30:00	2025-07-03T11:30:00.000Z	2025-07-03T12:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dra. Mariana Costa Pereira	2025-07-03 11:30:00	2025-07-03 12:30:00	\N	2025-08-25 00:21:29.084	2025-08-25 00:21:29.084	f
cmeqdgio000pokzptwbykty8h	cmeqdghyv0005kzpta2h57t9b	cmeqdgi37003bkzptspnnicry	cmeqdgi100019kzpta8trwa0s	cmeqdghzf000bkzpte6v303wo	2025-07-11 17:00:00	2025-07-11T17:00:00.000Z	2025-07-11T18:00:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dra. Mariana Costa Pereira	2025-07-11 17:00:00	2025-07-11 18:00:00	\N	2025-08-25 00:21:29.088	2025-08-25 00:21:29.088	f
cmeqdgio400pqkzptiu1pv4ij	cmeqdghyj0001kzpt493kfno2	cmeqdgi37003bkzptspnnicry	cmeqdgi0y0017kzptezkystw6	cmeqdghzg000ckzpt3rqux2h5	2025-07-19 17:30:00	2025-07-19T17:30:00.000Z	2025-07-19T18:30:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dra. Mariana Costa Pereira	2025-07-19 17:30:00	2025-07-19 18:30:00	\N	2025-08-25 00:21:29.092	2025-08-25 00:21:29.092	f
cmeqdgio700pskzpt0luar5lg	cmeqdghyx0006kzptcbsizaes	cmeqdgi37003bkzptspnnicry	cmeqdgi0y0017kzptezkystw6	cmeqdghzf000bkzpte6v303wo	2025-07-05 17:00:00	2025-07-05T17:00:00.000Z	2025-07-05T18:00:00.000Z	CONSULTATION	COMPLETED	Consulta de teste para acerto - Dra. Mariana Costa Pereira	2025-07-05 17:00:00	2025-07-05 18:00:00	\N	2025-08-25 00:21:29.096	2025-08-25 00:21:29.096	f
cmeqdgi7i0091kzpt386i7y04	cmeqdghyv0005kzpta2h57t9b	cmeqdgi3r0049kzpt2jdyq26g	cmeqdgi100019kzpta8trwa0s	cmeqdghzf000bkzpte6v303wo	2025-08-26 00:00:00	08:00	08:35	CONSULTATION	SCHEDULED	Teste de alteração apenas da observação....	\N	\N	\N	2025-08-25 00:21:28.494	2025-08-25 01:36:59.805	f
cmeqgoozi00011o1o8n7ogsip	cmeqdghyj0001kzpt493kfno2	cmeqdgi4z0065kzptt9fjp54z	cmeqdgi1e001lkzpt6mdxvh9h	cmeqdghzf000bkzpte6v303wo	2025-08-27 00:00:00	14:00	14:20	CONSULTATION	SCHEDULED		\N	\N	\N	2025-08-25 01:51:49.373	2025-08-25 01:51:49.373	f
\.


--
-- Data for Name: bank_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_accounts (id, name, bank, "accountType", agency, "accountNumber", "pixKey", "initialBalance", "currentBalance", active, color, description, "createdAt", "updatedAt") FROM stdin;
cmeqdgie000flkzpt12r4s9e2	Cartão de Crédito Empresarial	Itaú	CREDIT_CARD	\N	\N	\N	0.00	0.00	t	#F59E0B	Cartão de crédito para despesas operacionais	2025-08-25 00:21:28.728	2025-08-25 00:21:28.728
cmeqdgie200fmkzptdhjo82ei	Dinheiro em Espécie	Caixa da Clínica	CASH	\N	\N	\N	2000.00	2000.00	t	#22C55E	Dinheiro em espécie para pequenos gastos	2025-08-25 00:21:28.731	2025-08-25 00:21:28.731
cmeqdgidv00fjkzptftx8phox	Conta Corrente Principal - Banco do Brasil	Banco do Brasil	CHECKING	1234-5	12345-6	clinic@essencial.com.br	50000.00	47320.00	t	#FCD34D	Conta principal da clínica para movimentação geral	2025-08-25 00:21:28.723	2025-08-25 00:21:28.75
cmeqdgidy00fkkzpthpu56gud	Conta Poupança - Caixa Econômica	Caixa Econômica Federal	SAVINGS	5678	987654-3	11987654321	25000.00	35701.29	t	#10B981	Conta poupança para reserva de emergência	2025-08-25 00:21:28.726	2025-08-25 00:21:28.922
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, type, description, active, "createdAt", "updatedAt") FROM stdin;
cmeqdghzu000kkzptpg60lwtp	Consultas Médicas	SERVICE	Consultas médicas gerais e especializadas	t	2025-08-25 00:21:28.218	2025-08-25 00:21:28.218
cmeqdghzw000lkzpt8i9r0jm0	Exames Diagnósticos	SERVICE	Exames para diagnóstico e acompanhamento	t	2025-08-25 00:21:28.221	2025-08-25 00:21:28.221
cmeqdghzy000mkzptcd0zc7t5	Procedimentos Cirúrgicos	SERVICE	Pequenos procedimentos e cirurgias ambulatoriais	t	2025-08-25 00:21:28.223	2025-08-25 00:21:28.223
cmeqdgi00000nkzptwg1te0iq	Fisioterapia	SERVICE	Sessões de fisioterapia e reabilitação	t	2025-08-25 00:21:28.224	2025-08-25 00:21:28.224
cmeqdgi01000okzpty6ca2xy2	Psicologia	SERVICE	Consultas e terapias psicológicas	t	2025-08-25 00:21:28.225	2025-08-25 00:21:28.225
cmeqdgi02000pkzptgvgdjlvh	Odontologia	SERVICE	Tratamentos odontológicos diversos	t	2025-08-25 00:21:28.227	2025-08-25 00:21:28.227
cmeqdgi04000qkzpt6vwfp5es	Ginecologia	SERVICE	Consultas e exames ginecológicos	t	2025-08-25 00:21:28.228	2025-08-25 00:21:28.228
cmeqdgi05000rkzptgar5vb1s	Pediatria	SERVICE	Consultas e acompanhamento pediátrico	t	2025-08-25 00:21:28.23	2025-08-25 00:21:28.23
cmeqdgi07000skzpt8cu9tapc	Cardiologia	SERVICE	Consultas e exames cardiológicos	t	2025-08-25 00:21:28.231	2025-08-25 00:21:28.231
cmeqdgi08000tkzpt0jgxarsr	Dermatologia	SERVICE	Consultas e tratamentos dermatológicos	t	2025-08-25 00:21:28.232	2025-08-25 00:21:28.232
cmeqdgi09000ukzptcyjqq27b	Medicamentos	PRODUCT	Medicamentos diversos para venda	t	2025-08-25 00:21:28.234	2025-08-25 00:21:28.234
cmeqdgi0a000vkzpttj5pqtbo	Materiais Médicos	PRODUCT	Materiais e equipamentos médicos	t	2025-08-25 00:21:28.235	2025-08-25 00:21:28.235
cmeqdgi0b000wkzpt9gyieyt7	Suplementos	PRODUCT	Suplementos alimentares e vitaminas	t	2025-08-25 00:21:28.236	2025-08-25 00:21:28.236
cmeqdgi0d000xkzpt8l8dxryp	Cosméticos	PRODUCT	Produtos cosméticos e de beleza	t	2025-08-25 00:21:28.238	2025-08-25 00:21:28.238
cmeqdgi0f000ykzptazqo1lmw	Equipamentos	PRODUCT	Equipamentos médicos e de saúde	t	2025-08-25 00:21:28.239	2025-08-25 00:21:28.239
cmeqdgi0g000zkzpt70wgkt3k	Higiene	PRODUCT	Produtos de higiene pessoal	t	2025-08-25 00:21:28.24	2025-08-25 00:21:28.24
cmeqdgi0h0010kzpt89c28nno	Ortopédicos	PRODUCT	Produtos ortopédicos e de reabilitação	t	2025-08-25 00:21:28.242	2025-08-25 00:21:28.242
cmeqdgi0i0011kzptwr2rfa9s	Descartáveis	PRODUCT	Materiais descartáveis médicos	t	2025-08-25 00:21:28.243	2025-08-25 00:21:28.243
\.


--
-- Data for Name: clinic_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clinic_settings (id, name, hours, "allowWeekendBookings", "advanceBookingDays", "minBookingHours", "maxBookingDays", "allowCancelledMovement", "allowCompletedMovement", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: financial_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.financial_entries (id, "bankAccountId", type, category, subcategory, description, amount, "dueDate", "paidDate", status, "paymentMethod", notes, "referenceId", "referenceType", "partnerId", "patientId", "appointmentId", recurring, "parentEntryId", "createdAt", "updatedAt") FROM stdin;
cmeqdgie400fokzpt8v9h0pp2	cmeqdgidv00fjkzptftx8phox	INCOME	Consultas	Clínica Geral	Consulta - João Silva	150.00	2025-08-20 00:21:28.731	2025-08-20 00:21:28.731	PAID	PIX	Pagamento via PIX no ato da consulta	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.732	2025-08-25 00:21:28.732
cmeqdgie700fqkzptgq4ie7k3	cmeqdgidv00fjkzptftx8phox	INCOME	Exames	Ultrassom	Ultrassom Abdominal - Maria Santos	120.00	2025-08-22 00:21:28.731	2025-08-22 00:21:28.731	PAID	DEBIT_CARD	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.735	2025-08-25 00:21:28.735
cmeqdgie900fskzptekqzikb0	cmeqdgidv00fjkzptftx8phox	INCOME	Procedimentos	Cirurgia	Pequena Cirurgia - Carlos Oliveira	400.00	2025-08-24 00:21:28.731	\N	PENDING	\N	Aguardando pagamento pelo convênio	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.737	2025-08-25 00:21:28.737
cmeqdgieb00fukzptz9trx1nk	cmeqdgidv00fjkzptftx8phox	INCOME	Consultas	Retorno	Retorno - Ana Costa	100.00	2025-08-27 00:21:28.731	\N	PENDING	CASH	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.739	2025-08-25 00:21:28.739
cmeqdgiec00fwkzptjdwfcd72	cmeqdgidv00fjkzptftx8phox	EXPENSE	Pessoal	Salários	Salário - Recepcionista	2500.00	2025-08-15 00:21:28.731	2025-08-15 00:21:28.731	PAID	BANK_TRANSFER	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.74	2025-08-25 00:21:28.74
cmeqdgied00fykzpt3w83jz8a	cmeqdgidv00fjkzptftx8phox	EXPENSE	Infraestrutura	Aluguel	Aluguel do consultório	3500.00	2025-08-30 00:21:28.731	\N	PENDING	\N	Vencimento todo dia 5 do mês	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.741	2025-08-25 00:21:28.741
cmeqdgiee00g0kzptjm8wnggm	cmeqdgidv00fjkzptftx8phox	EXPENSE	Operacional	Materiais Médicos	Compra de seringas e agulhas	450.00	2025-08-23 00:21:28.731	2025-08-23 00:21:28.731	PAID	CREDIT_CARD	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.742	2025-08-25 00:21:28.742
cmeqdgieg00g2kzpt61dofjji	cmeqdgidv00fjkzptftx8phox	EXPENSE	Serviços	Limpeza	Serviço de limpeza semanal	300.00	2025-08-26 00:21:28.731	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.744	2025-08-25 00:21:28.744
cmeqdgiei00g4kzpt2naaviev	cmeqdgidv00fjkzptftx8phox	EXPENSE	Infraestrutura	Energia Elétrica	Conta de luz - CPFL	650.00	2025-08-10 00:21:28.731	\N	PENDING	\N	CONTA VENCIDA - Pagar urgente!	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.746	2025-08-25 00:21:28.746
cmeqdgies00g6kzptpy2fmfha	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Infraestrutura	Aluguel	Aluguel do consultório - Mensal	3500.00	2025-08-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	t	\N	2025-08-25 00:21:28.756	2025-08-25 00:21:28.756
cmeqdgiet00g8kzpt1tt91oeu	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Infraestrutura	Aluguel	Aluguel do consultório - Mensal (2/7)	3500.00	2025-09-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	f	cmeqdgies00g6kzptpy2fmfha	2025-08-25 00:21:28.758	2025-08-25 00:21:28.758
cmeqdgiev00gakzptk41z2x91	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Infraestrutura	Aluguel	Aluguel do consultório - Mensal (3/7)	3500.00	2025-10-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	f	cmeqdgies00g6kzptpy2fmfha	2025-08-25 00:21:28.759	2025-08-25 00:21:28.759
cmeqdgiew00gckzptipbhmjj7	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Infraestrutura	Aluguel	Aluguel do consultório - Mensal (4/7)	3500.00	2025-11-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	f	cmeqdgies00g6kzptpy2fmfha	2025-08-25 00:21:28.76	2025-08-25 00:21:28.76
cmeqdgiex00gekzptdsk8lkha	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Infraestrutura	Aluguel	Aluguel do consultório - Mensal (5/7)	3500.00	2025-12-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	f	cmeqdgies00g6kzptpy2fmfha	2025-08-25 00:21:28.761	2025-08-25 00:21:28.761
cmeqdgiey00ggkzptxkxcp5rf	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Infraestrutura	Aluguel	Aluguel do consultório - Mensal (6/7)	3500.00	2026-01-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	f	cmeqdgies00g6kzptpy2fmfha	2025-08-25 00:21:28.763	2025-08-25 00:21:28.763
cmeqdgiez00gikzptw1oct3oq	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Infraestrutura	Aluguel	Aluguel do consultório - Mensal (7/7)	3500.00	2026-02-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	f	cmeqdgies00g6kzptpy2fmfha	2025-08-25 00:21:28.764	2025-08-25 00:21:28.764
cmeqdgif100gkkzptfj84sj4h	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Pessoal	Salários	Salário Recepcionista - Mensal	2500.00	2025-08-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	t	\N	2025-08-25 00:21:28.765	2025-08-25 00:21:28.765
cmeqdgif100gmkzpt4mdc99vg	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Pessoal	Salários	Salário Recepcionista - Mensal (2/7)	2500.00	2025-09-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	f	cmeqdgif100gkkzptfj84sj4h	2025-08-25 00:21:28.766	2025-08-25 00:21:28.766
cmeqdgif200gokzptbzi77b48	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Pessoal	Salários	Salário Recepcionista - Mensal (3/7)	2500.00	2025-10-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	f	cmeqdgif100gkkzptfj84sj4h	2025-08-25 00:21:28.767	2025-08-25 00:21:28.767
cmeqdgif300gqkzpt9dg7r2gx	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Pessoal	Salários	Salário Recepcionista - Mensal (4/7)	2500.00	2025-11-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	f	cmeqdgif100gkkzptfj84sj4h	2025-08-25 00:21:28.767	2025-08-25 00:21:28.767
cmeqdgif400gskzpt3dle6m9n	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Pessoal	Salários	Salário Recepcionista - Mensal (5/7)	2500.00	2025-12-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	f	cmeqdgif100gkkzptfj84sj4h	2025-08-25 00:21:28.768	2025-08-25 00:21:28.768
cmeqdgif600gukzptesun98y4	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Pessoal	Salários	Salário Recepcionista - Mensal (6/7)	2500.00	2026-01-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	f	cmeqdgif100gkkzptfj84sj4h	2025-08-25 00:21:28.77	2025-08-25 00:21:28.77
cmeqdgif700gwkzptl2hln3i9	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Pessoal	Salários	Salário Recepcionista - Mensal (7/7)	2500.00	2026-02-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	f	cmeqdgif100gkkzptfj84sj4h	2025-08-25 00:21:28.771	2025-08-25 00:21:28.771
cmeqdgif800gykzptu2j4ytwn	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Infraestrutura	Energia Elétrica	Conta de Energia - Mensal	450.00	2025-08-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	t	\N	2025-08-25 00:21:28.772	2025-08-25 00:21:28.772
cmeqdgif900h0kzptucgw2654	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Infraestrutura	Energia Elétrica	Conta de Energia - Mensal (2/7)	450.00	2025-09-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	f	cmeqdgif800gykzptu2j4ytwn	2025-08-25 00:21:28.773	2025-08-25 00:21:28.773
cmeqdgifa00h2kzptknkll8mi	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Infraestrutura	Energia Elétrica	Conta de Energia - Mensal (3/7)	450.00	2025-10-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	f	cmeqdgif800gykzptu2j4ytwn	2025-08-25 00:21:28.774	2025-08-25 00:21:28.774
cmeqdgifa00h4kzptfljh9xxj	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Infraestrutura	Energia Elétrica	Conta de Energia - Mensal (4/7)	450.00	2025-11-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	f	cmeqdgif800gykzptu2j4ytwn	2025-08-25 00:21:28.775	2025-08-25 00:21:28.775
cmeqdgifb00h6kzptslocu2u3	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Infraestrutura	Energia Elétrica	Conta de Energia - Mensal (5/7)	450.00	2025-12-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	f	cmeqdgif800gykzptu2j4ytwn	2025-08-25 00:21:28.776	2025-08-25 00:21:28.776
cmeqdgifc00h8kzptgzeu1dka	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Infraestrutura	Energia Elétrica	Conta de Energia - Mensal (6/7)	450.00	2026-01-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	f	cmeqdgif800gykzptu2j4ytwn	2025-08-25 00:21:28.776	2025-08-25 00:21:28.776
cmeqdgifd00hakzpt9krys8ic	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Infraestrutura	Energia Elétrica	Conta de Energia - Mensal (7/7)	450.00	2026-02-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	f	cmeqdgif800gykzptu2j4ytwn	2025-08-25 00:21:28.777	2025-08-25 00:21:28.777
cmeqdgife00hckzptgl76ahbt	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Serviços	Contabilidade	Honorários Contábeis - Mensal	800.00	2025-08-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	t	\N	2025-08-25 00:21:28.779	2025-08-25 00:21:28.779
cmeqdgiff00hekzptk4d0wk6p	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Serviços	Contabilidade	Honorários Contábeis - Mensal (2/7)	800.00	2025-09-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	f	cmeqdgife00hckzptgl76ahbt	2025-08-25 00:21:28.78	2025-08-25 00:21:28.78
cmeqdgifg00hgkzptu8o0rq36	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Serviços	Contabilidade	Honorários Contábeis - Mensal (3/7)	800.00	2025-10-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	f	cmeqdgife00hckzptgl76ahbt	2025-08-25 00:21:28.781	2025-08-25 00:21:28.781
cmeqdgifh00hikzptzk16msin	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Serviços	Contabilidade	Honorários Contábeis - Mensal (4/7)	800.00	2025-11-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	f	cmeqdgife00hckzptgl76ahbt	2025-08-25 00:21:28.781	2025-08-25 00:21:28.781
cmeqdgifi00hkkzpt48pvt1zi	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Serviços	Contabilidade	Honorários Contábeis - Mensal (5/7)	800.00	2025-12-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	f	cmeqdgife00hckzptgl76ahbt	2025-08-25 00:21:28.782	2025-08-25 00:21:28.782
cmeqdgifj00hmkzptci2r4wfc	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Serviços	Contabilidade	Honorários Contábeis - Mensal (6/7)	800.00	2026-01-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	f	cmeqdgife00hckzptgl76ahbt	2025-08-25 00:21:28.783	2025-08-25 00:21:28.783
cmeqdgifk00hokzptqnjewgbh	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Serviços	Contabilidade	Honorários Contábeis - Mensal (7/7)	800.00	2026-02-05 00:00:00	\N	PENDING	\N	\N	\N	\N	\N	\N	\N	f	cmeqdgife00hckzptgl76ahbt	2025-08-25 00:21:28.784	2025-08-25 00:21:28.784
cmeqdgig900hqkzptfmfys9oq	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Cardiologia	Consulta Cardiológica - Paciente 1	169.69	2025-05-27 00:00:00	2025-05-27 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.809	2025-08-25 00:21:28.809
cmeqdgigb00hskzpt6qodqlov	cmeqdgidy00fkkzpthpu56gud	INCOME	Exames	Ultrassom	Ultrassom - Paciente 2	98.13	2025-05-19 00:00:00	2025-05-19 00:00:00	PAID	DEBIT_CARD	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.811	2025-08-25 00:21:28.811
cmeqdgigc00hukzpttujhvipt	cmeqdgidy00fkkzpthpu56gud	INCOME	Procedimentos	Pequena Cirurgia	Procedimento - Paciente 3	412.45	2025-05-30 00:00:00	2025-05-30 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.812	2025-08-25 00:21:28.812
cmeqdgigd00hwkzpt8ninfnfy	cmeqdgidy00fkkzpthpu56gud	INCOME	Procedimentos	Pequena Cirurgia	Procedimento - Paciente 4	439.97	2025-05-25 00:00:00	2025-05-25 00:00:00	PAID	DEBIT_CARD	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.813	2025-08-25 00:21:28.813
cmeqdgige00hykzptwx1bxt1d	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Clínica Geral	Consulta - Paciente 5	170.87	2025-05-09 00:00:00	2025-05-09 00:00:00	PAID	DEBIT_CARD	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.815	2025-08-25 00:21:28.815
cmeqdgigf00i0kzpt4rvdocvk	cmeqdgidy00fkkzpthpu56gud	INCOME	Vendas	Medicamentos	Venda de Medicamento - Paciente 6	79.25	2025-05-16 00:00:00	2025-05-16 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.815	2025-08-25 00:21:28.815
cmeqdgigg00i2kzptpjaskxnd	cmeqdgidy00fkkzpthpu56gud	INCOME	Procedimentos	Pequena Cirurgia	Procedimento - Paciente 7	390.57	2025-05-16 00:00:00	2025-05-16 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.816	2025-08-25 00:21:28.816
cmeqdgigh00i4kzptzvjo9qm2	cmeqdgidy00fkkzpthpu56gud	INCOME	Procedimentos	Pequena Cirurgia	Procedimento - Paciente 8	435.29	2025-05-28 00:00:00	2025-05-28 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.817	2025-08-25 00:21:28.817
cmeqdgigi00i6kzptpda3ixv4	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Cardiologia	Consulta Cardiológica - Paciente 9	171.53	2025-05-30 00:00:00	2025-05-30 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.818	2025-08-25 00:21:28.818
cmeqdgigj00i8kzptr052p999	cmeqdgidy00fkkzpthpu56gud	INCOME	Exames	Ultrassom	Ultrassom - Paciente 10	107.69	2025-05-06 00:00:00	2025-05-06 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.819	2025-08-25 00:21:28.819
cmeqdgigk00iakzptri19cm0l	cmeqdgidy00fkkzpthpu56gud	INCOME	Vendas	Medicamentos	Venda de Medicamento - Paciente 11	83.26	2025-05-22 00:00:00	2025-05-22 00:00:00	PAID	DEBIT_CARD	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.821	2025-08-25 00:21:28.821
cmeqdgigl00ickzptcovnk59r	cmeqdgidy00fkkzpthpu56gud	INCOME	Procedimentos	Pequena Cirurgia	Procedimento - Paciente 12	423.04	2025-05-26 00:00:00	2025-05-26 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.821	2025-08-25 00:21:28.821
cmeqdgigm00iekzpt9ld9b7sm	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Cardiologia	Consulta Cardiológica - Paciente 13	208.94	2025-05-25 00:00:00	2025-05-25 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.822	2025-08-25 00:21:28.822
cmeqdgign00igkzpt5ct7lnsk	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Clínica Geral	Consulta - Paciente 14	153.39	2025-05-29 00:00:00	2025-05-29 00:00:00	PAID	DEBIT_CARD	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.823	2025-08-25 00:21:28.823
cmeqdgign00iikzptkfhxhh9k	cmeqdgidy00fkkzpthpu56gud	INCOME	Exames	Ultrassom	Ultrassom - Paciente 15	104.23	2025-05-26 00:00:00	2025-05-26 00:00:00	PAID	DEBIT_CARD	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.824	2025-08-25 00:21:28.824
cmeqdgigo00ikkzptro20mjua	cmeqdgidy00fkkzpthpu56gud	INCOME	Vendas	Medicamentos	Venda de Medicamento - Paciente 16	72.30	2025-05-12 00:00:00	2025-05-12 00:00:00	PAID	DEBIT_CARD	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.824	2025-08-25 00:21:28.824
cmeqdgigp00imkzptu7421p52	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Infraestrutura	Manutenção Predial	Manutenção - maio	150.00	2025-05-17 00:00:00	2025-05-17 00:00:00	PAID	BANK_TRANSFER	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.825	2025-08-25 00:21:28.825
cmeqdgigq00iokzpttzv8q66c	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Outras Despesas	Combustível	Combustível - maio	100.00	2025-05-08 00:00:00	2025-05-08 00:00:00	PAID	BANK_TRANSFER	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.826	2025-08-25 00:21:28.826
cmeqdgigr00iqkzpt329fkbe0	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Serviços	Limpeza	Serviço de Limpeza - maio	200.00	2025-05-09 00:00:00	2025-05-09 00:00:00	PAID	BANK_TRANSFER	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.827	2025-08-25 00:21:28.827
cmeqdgigr00iskzptqbrdp347	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Operacional	Materiais Médicos	Compra de Materiais - maio	300.00	2025-05-26 00:00:00	2025-05-26 00:00:00	PAID	BANK_TRANSFER	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.828	2025-08-25 00:21:28.828
cmeqdgigs00iukzpt8qdnbxxt	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Operacional	Materiais Médicos	Compra de Materiais - maio	300.00	2025-05-22 00:00:00	2025-05-22 00:00:00	PAID	BANK_TRANSFER	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.829	2025-08-25 00:21:28.829
cmeqdgigu00iwkzpt0rl8y9wv	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Cardiologia	Consulta Cardiológica - Paciente 1	187.39	2025-06-12 00:00:00	2025-06-12 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.83	2025-08-25 00:21:28.83
cmeqdgigu00iykzpt2vg9iol5	cmeqdgidy00fkkzpthpu56gud	INCOME	Exames	Ultrassom	Ultrassom - Paciente 2	97.79	2025-06-01 00:00:00	2025-06-01 00:00:00	PAID	DEBIT_CARD	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.831	2025-08-25 00:21:28.831
cmeqdgigv00j0kzptfuxgtrem	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Cardiologia	Consulta Cardiológica - Paciente 3	166.18	2025-06-01 00:00:00	2025-06-01 00:00:00	PAID	DEBIT_CARD	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.831	2025-08-25 00:21:28.831
cmeqdgigw00j2kzptiv3timoo	cmeqdgidy00fkkzpthpu56gud	INCOME	Exames	Ultrassom	Ultrassom - Paciente 4	136.93	2025-06-28 00:00:00	2025-06-28 00:00:00	PAID	DEBIT_CARD	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.832	2025-08-25 00:21:28.832
cmeqdgigx00j4kzptmf5ma9ku	cmeqdgidy00fkkzpthpu56gud	INCOME	Exames	Ultrassom	Ultrassom - Paciente 5	108.54	2025-06-06 00:00:00	2025-06-06 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.833	2025-08-25 00:21:28.833
cmeqdgigy00j6kzptzsuxdt5s	cmeqdgidy00fkkzpthpu56gud	INCOME	Procedimentos	Pequena Cirurgia	Procedimento - Paciente 6	383.85	2025-06-26 00:00:00	2025-06-26 00:00:00	PAID	DEBIT_CARD	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.834	2025-08-25 00:21:28.834
cmeqdgigz00j8kzptevit5yq4	cmeqdgidy00fkkzpthpu56gud	INCOME	Vendas	Medicamentos	Venda de Medicamento - Paciente 7	68.30	2025-06-23 00:00:00	2025-06-23 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.835	2025-08-25 00:21:28.835
cmeqdgih000jakzpt3hvr4rlx	cmeqdgidy00fkkzpthpu56gud	INCOME	Procedimentos	Pequena Cirurgia	Procedimento - Paciente 8	361.48	2025-06-26 00:00:00	2025-06-26 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.837	2025-08-25 00:21:28.837
cmeqdgih100jckzptmntj1epe	cmeqdgidy00fkkzpthpu56gud	INCOME	Vendas	Medicamentos	Venda de Medicamento - Paciente 9	68.03	2025-06-04 00:00:00	2025-06-04 00:00:00	PAID	DEBIT_CARD	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.837	2025-08-25 00:21:28.837
cmeqdgih200jekzpt71ycgfc4	cmeqdgidy00fkkzpthpu56gud	INCOME	Procedimentos	Pequena Cirurgia	Procedimento - Paciente 10	445.59	2025-06-23 00:00:00	2025-06-23 00:00:00	PAID	DEBIT_CARD	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.838	2025-08-25 00:21:28.838
cmeqdgih300jgkzpt3rr0xa3m	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Cardiologia	Consulta Cardiológica - Paciente 11	209.31	2025-06-26 00:00:00	2025-06-26 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.839	2025-08-25 00:21:28.839
cmeqdgih300jikzpteesibkmd	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Cardiologia	Consulta Cardiológica - Paciente 12	188.60	2025-06-03 00:00:00	2025-06-03 00:00:00	PAID	DEBIT_CARD	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.84	2025-08-25 00:21:28.84
cmeqdgih400jkkzpt7i37x9xl	cmeqdgidy00fkkzpthpu56gud	INCOME	Exames	Ultrassom	Ultrassom - Paciente 13	103.32	2025-06-26 00:00:00	2025-06-26 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.841	2025-08-25 00:21:28.841
cmeqdgih500jmkzptloutifll	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Clínica Geral	Consulta - Paciente 14	179.34	2025-06-11 00:00:00	2025-06-11 00:00:00	PAID	DEBIT_CARD	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.841	2025-08-25 00:21:28.841
cmeqdgih600jokzptyit2cunw	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Cardiologia	Consulta Cardiológica - Paciente 15	204.00	2025-06-13 00:00:00	2025-06-13 00:00:00	PAID	DEBIT_CARD	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.842	2025-08-25 00:21:28.842
cmeqdgih600jqkzpt5ljbznnl	cmeqdgidy00fkkzpthpu56gud	INCOME	Exames	Ultrassom	Ultrassom - Paciente 16	107.80	2025-06-26 00:00:00	2025-06-26 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.843	2025-08-25 00:21:28.843
cmeqdgih800jskzptzv1xbp30	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Clínica Geral	Consulta - Paciente 17	133.37	2025-06-29 00:00:00	2025-06-29 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.844	2025-08-25 00:21:28.844
cmeqdgih900jukzptkv72uid4	cmeqdgidy00fkkzpthpu56gud	INCOME	Exames	Ultrassom	Ultrassom - Paciente 18	115.88	2025-06-10 00:00:00	2025-06-10 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.845	2025-08-25 00:21:28.845
cmeqdgiha00jwkzpti9qtv80v	cmeqdgidy00fkkzpthpu56gud	INCOME	Procedimentos	Pequena Cirurgia	Procedimento - Paciente 19	411.83	2025-06-07 00:00:00	2025-06-07 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.846	2025-08-25 00:21:28.846
cmeqdgiha00jykzptiqb5e942	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Cardiologia	Consulta Cardiológica - Paciente 20	229.36	2025-06-24 00:00:00	2025-06-24 00:00:00	PAID	DEBIT_CARD	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.847	2025-08-25 00:21:28.847
cmeqdgihb00k0kzptm4ltbnd7	cmeqdgidy00fkkzpthpu56gud	INCOME	Vendas	Medicamentos	Venda de Medicamento - Paciente 21	80.98	2025-06-26 00:00:00	2025-06-26 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.848	2025-08-25 00:21:28.848
cmeqdgihc00k2kzptevp7t1q2	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Outras Despesas	Combustível	Combustível - junho	100.00	2025-06-13 00:00:00	2025-06-13 00:00:00	PAID	BANK_TRANSFER	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.849	2025-08-25 00:21:28.849
cmeqdgihd00k4kzptm77yk72e	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Outras Despesas	Combustível	Combustível - junho	100.00	2025-06-18 00:00:00	2025-06-18 00:00:00	PAID	BANK_TRANSFER	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.85	2025-08-25 00:21:28.85
cmeqdgihe00k6kzptpi3xvkuy	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Serviços	Limpeza	Serviço de Limpeza - junho	200.00	2025-06-05 00:00:00	2025-06-05 00:00:00	PAID	BANK_TRANSFER	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.85	2025-08-25 00:21:28.85
cmeqdgihf00k8kzpthatm5k5j	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Outras Despesas	Combustível	Combustível - junho	100.00	2025-06-05 00:00:00	2025-06-05 00:00:00	PAID	BANK_TRANSFER	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.851	2025-08-25 00:21:28.851
cmeqdgihg00kakzptko9sn1y1	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Infraestrutura	Manutenção Predial	Manutenção - junho	150.00	2025-06-16 00:00:00	2025-06-16 00:00:00	PAID	BANK_TRANSFER	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.852	2025-08-25 00:21:28.852
cmeqdgihh00kckzpt3vucrdm3	cmeqdgidy00fkkzpthpu56gud	INCOME	Procedimentos	Pequena Cirurgia	Procedimento - Paciente 1	379.90	2025-07-02 00:00:00	2025-07-02 00:00:00	PAID	DEBIT_CARD	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.853	2025-08-25 00:21:28.853
cmeqdgihi00kekzptkik49qij	cmeqdgidy00fkkzpthpu56gud	INCOME	Vendas	Medicamentos	Venda de Medicamento - Paciente 2	69.30	2025-07-25 00:00:00	2025-07-25 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.854	2025-08-25 00:21:28.854
cmeqdgihj00kgkzptxqg3r623	cmeqdgidy00fkkzpthpu56gud	INCOME	Exames	Ultrassom	Ultrassom - Paciente 3	102.46	2025-07-01 00:00:00	2025-07-01 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.855	2025-08-25 00:21:28.855
cmeqdgihk00kikzptga914omj	cmeqdgidy00fkkzpthpu56gud	INCOME	Vendas	Medicamentos	Venda de Medicamento - Paciente 4	68.59	2025-07-08 00:00:00	2025-07-08 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.856	2025-08-25 00:21:28.856
cmeqdgihl00kkkzptm7echys4	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Clínica Geral	Consulta - Paciente 5	138.24	2025-07-27 00:00:00	2025-07-27 00:00:00	PAID	DEBIT_CARD	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.857	2025-08-25 00:21:28.857
cmeqdgihm00kmkzptdjgue4qb	cmeqdgidy00fkkzpthpu56gud	INCOME	Procedimentos	Pequena Cirurgia	Procedimento - Paciente 6	457.91	2025-07-23 00:00:00	2025-07-23 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.858	2025-08-25 00:21:28.858
cmeqdgihn00kokzpth6lqgio8	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Cardiologia	Consulta Cardiológica - Paciente 7	194.13	2025-07-25 00:00:00	2025-07-25 00:00:00	PAID	DEBIT_CARD	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.859	2025-08-25 00:21:28.859
cmeqdgihp00kqkzptq03engf5	cmeqdgidy00fkkzpthpu56gud	INCOME	Vendas	Medicamentos	Venda de Medicamento - Paciente 8	75.92	2025-07-16 00:00:00	2025-07-16 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.861	2025-08-25 00:21:28.861
cmeqdgihq00kskzptv21d4o6u	cmeqdgidy00fkkzpthpu56gud	INCOME	Procedimentos	Pequena Cirurgia	Procedimento - Paciente 9	410.17	2025-07-23 00:00:00	2025-07-23 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.863	2025-08-25 00:21:28.863
cmeqdgihs00kukzpt5oof6fa5	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Cardiologia	Consulta Cardiológica - Paciente 10	199.50	2025-07-25 00:00:00	2025-07-25 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.864	2025-08-25 00:21:28.864
cmeqdgiht00kwkzptoleen2rv	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Clínica Geral	Consulta - Paciente 11	157.02	2025-07-16 00:00:00	2025-07-16 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.865	2025-08-25 00:21:28.865
cmeqdgihu00kykzpt7yy225sh	cmeqdgidy00fkkzpthpu56gud	INCOME	Vendas	Medicamentos	Venda de Medicamento - Paciente 12	88.53	2025-07-21 00:00:00	2025-07-21 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.866	2025-08-25 00:21:28.866
cmeqdgihw00l0kzptdx2kodsd	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Clínica Geral	Consulta - Paciente 13	172.93	2025-07-12 00:00:00	2025-07-12 00:00:00	PAID	DEBIT_CARD	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.868	2025-08-25 00:21:28.868
cmeqdgihy00l2kzptpbonmiz7	cmeqdgidy00fkkzpthpu56gud	INCOME	Vendas	Medicamentos	Venda de Medicamento - Paciente 14	89.66	2025-07-22 00:00:00	2025-07-22 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.871	2025-08-25 00:21:28.871
cmeqdgii000l4kzptcc3556dl	cmeqdgidy00fkkzpthpu56gud	INCOME	Vendas	Medicamentos	Venda de Medicamento - Paciente 15	71.37	2025-07-11 00:00:00	2025-07-11 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.873	2025-08-25 00:21:28.873
cmeqdgii200l6kzptmqlrijsi	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Cardiologia	Consulta Cardiológica - Paciente 16	231.75	2025-07-11 00:00:00	2025-07-11 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.874	2025-08-25 00:21:28.874
cmeqdgii300l8kzptx8dwt8cr	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Cardiologia	Consulta Cardiológica - Paciente 17	192.74	2025-07-17 00:00:00	2025-07-17 00:00:00	PAID	DEBIT_CARD	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.875	2025-08-25 00:21:28.875
cmeqdgii400lakzpti8p8l1j8	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Clínica Geral	Consulta - Paciente 18	141.84	2025-07-14 00:00:00	2025-07-14 00:00:00	PAID	DEBIT_CARD	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.876	2025-08-25 00:21:28.876
cmeqdgii500lckzpti0cbqzb7	cmeqdgidy00fkkzpthpu56gud	INCOME	Procedimentos	Pequena Cirurgia	Procedimento - Paciente 19	402.82	2025-07-20 00:00:00	2025-07-20 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.877	2025-08-25 00:21:28.877
cmeqdgii600lekzptw1b4xbd0	cmeqdgidy00fkkzpthpu56gud	INCOME	Vendas	Medicamentos	Venda de Medicamento - Paciente 20	70.16	2025-07-03 00:00:00	2025-07-03 00:00:00	PAID	PIX	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.879	2025-08-25 00:21:28.879
cmeqdgii800lgkzptqn17anyg	cmeqdgidy00fkkzpthpu56gud	INCOME	Procedimentos	Pequena Cirurgia	Procedimento - Paciente 21	427.88	2025-07-02 00:00:00	2025-07-02 00:00:00	PAID	DEBIT_CARD	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.88	2025-08-25 00:21:28.88
cmeqdgii900likzptgzn0lri3	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Outras Despesas	Combustível	Combustível - julho	100.00	2025-07-03 00:00:00	2025-07-03 00:00:00	PAID	BANK_TRANSFER	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.881	2025-08-25 00:21:28.881
cmeqdgiia00lkkzptwzib7r3e	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Infraestrutura	Manutenção Predial	Manutenção - julho	150.00	2025-07-30 00:00:00	2025-07-30 00:00:00	PAID	BANK_TRANSFER	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.883	2025-08-25 00:21:28.883
cmeqdgiic00lmkzptgagm3h3y	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Operacional	Materiais Médicos	Compra de Materiais - julho	300.00	2025-07-09 00:00:00	2025-07-09 00:00:00	PAID	BANK_TRANSFER	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.884	2025-08-25 00:21:28.884
cmeqdgiid00lokzptj88nplt1	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Serviços	Limpeza	Serviço de Limpeza - julho	200.00	2025-07-18 00:00:00	2025-07-18 00:00:00	PAID	BANK_TRANSFER	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.885	2025-08-25 00:21:28.885
cmeqdgiif00lqkzptr4jkchff	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Outras Despesas	Combustível	Combustível - julho	100.00	2025-07-13 00:00:00	2025-07-13 00:00:00	PAID	BANK_TRANSFER	\N	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.887	2025-08-25 00:21:28.887
cmeqdgiih00lskzptz4okv7gi	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Odontologia	Tratamento Ortodôntico - João Silva (1/12)	200.00	2025-09-10 00:00:00	2025-09-10 00:00:00	PAID	PIX	\N	\N	installment_plan	\N	\N	\N	t	\N	2025-08-25 00:21:28.889	2025-08-25 00:21:28.889
cmeqdgiij00lukzptlmpf73dp	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Odontologia	Tratamento Ortodôntico - João Silva (2/12)	200.00	2025-10-10 00:00:00	2025-10-10 00:00:00	PAID	PIX	\N	\N	installment_plan	\N	\N	\N	t	\N	2025-08-25 00:21:28.891	2025-08-25 00:21:28.891
cmeqdgiik00lwkzpt00zyw4zl	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Odontologia	Tratamento Ortodôntico - João Silva (3/12)	200.00	2025-11-10 00:00:00	\N	PENDING	\N	\N	\N	installment_plan	\N	\N	\N	t	\N	2025-08-25 00:21:28.892	2025-08-25 00:21:28.892
cmeqdgiil00lykzpt4pa23r5h	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Odontologia	Tratamento Ortodôntico - João Silva (4/12)	200.00	2025-12-10 00:00:00	\N	PENDING	\N	\N	\N	installment_plan	\N	\N	\N	t	\N	2025-08-25 00:21:28.894	2025-08-25 00:21:28.894
cmeqdgiin00m0kzptxvji2osk	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Odontologia	Tratamento Ortodôntico - João Silva (5/12)	200.00	2026-01-10 00:00:00	\N	PENDING	\N	\N	\N	installment_plan	\N	\N	\N	t	\N	2025-08-25 00:21:28.895	2025-08-25 00:21:28.895
cmeqdgiip00m2kzptsnjapxti	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Odontologia	Tratamento Ortodôntico - João Silva (6/12)	200.00	2026-02-10 00:00:00	\N	PENDING	\N	\N	\N	installment_plan	\N	\N	\N	t	\N	2025-08-25 00:21:28.897	2025-08-25 00:21:28.897
cmeqdgiiq00m4kzptki5socu4	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Odontologia	Tratamento Ortodôntico - João Silva (7/12)	200.00	2026-03-10 00:00:00	\N	PENDING	\N	\N	\N	installment_plan	\N	\N	\N	t	\N	2025-08-25 00:21:28.898	2025-08-25 00:21:28.898
cmeqdgiis00m6kzpt4mcp0jsv	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Odontologia	Tratamento Ortodôntico - João Silva (8/12)	200.00	2026-04-10 00:00:00	\N	PENDING	\N	\N	\N	installment_plan	\N	\N	\N	t	\N	2025-08-25 00:21:28.9	2025-08-25 00:21:28.9
cmeqdgiit00m8kzpt66i9e47d	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Odontologia	Tratamento Ortodôntico - João Silva (9/12)	200.00	2026-05-10 00:00:00	\N	PENDING	\N	\N	\N	installment_plan	\N	\N	\N	t	\N	2025-08-25 00:21:28.902	2025-08-25 00:21:28.902
cmeqdgiiv00makzptza38fpql	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Odontologia	Tratamento Ortodôntico - João Silva (10/12)	200.00	2026-06-10 00:00:00	\N	PENDING	\N	\N	\N	installment_plan	\N	\N	\N	t	\N	2025-08-25 00:21:28.903	2025-08-25 00:21:28.903
cmeqdgiiw00mckzpteiyoxbke	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Odontologia	Tratamento Ortodôntico - João Silva (11/12)	200.00	2026-07-10 00:00:00	\N	PENDING	\N	\N	\N	installment_plan	\N	\N	\N	t	\N	2025-08-25 00:21:28.904	2025-08-25 00:21:28.904
cmeqdgiix00mekzpt8fq4lg4g	cmeqdgidy00fkkzpthpu56gud	INCOME	Consultas	Odontologia	Tratamento Ortodôntico - João Silva (12/12)	200.00	2026-08-10 00:00:00	\N	PENDING	\N	\N	\N	installment_plan	\N	\N	\N	t	\N	2025-08-25 00:21:28.905	2025-08-25 00:21:28.905
cmeqdgiiy00mgkzptt0lpo9cz	cmeqdgidy00fkkzpthpu56gud	INCOME	Procedimentos	Fisioterapia	Fisioterapia - Maria Santos (1/6)	300.00	2025-09-10 00:00:00	2025-09-10 00:00:00	PAID	PIX	\N	\N	installment_plan	\N	\N	\N	t	\N	2025-08-25 00:21:28.906	2025-08-25 00:21:28.906
cmeqdgiiz00mikzptcs15vk3y	cmeqdgidy00fkkzpthpu56gud	INCOME	Procedimentos	Fisioterapia	Fisioterapia - Maria Santos (2/6)	300.00	2025-10-10 00:00:00	2025-10-10 00:00:00	PAID	PIX	\N	\N	installment_plan	\N	\N	\N	t	\N	2025-08-25 00:21:28.907	2025-08-25 00:21:28.907
cmeqdgij000mkkzpt7toqk790	cmeqdgidy00fkkzpthpu56gud	INCOME	Procedimentos	Fisioterapia	Fisioterapia - Maria Santos (3/6)	300.00	2025-11-10 00:00:00	\N	PENDING	\N	\N	\N	installment_plan	\N	\N	\N	t	\N	2025-08-25 00:21:28.908	2025-08-25 00:21:28.908
cmeqdgij100mmkzpt4aduy6e8	cmeqdgidy00fkkzpthpu56gud	INCOME	Procedimentos	Fisioterapia	Fisioterapia - Maria Santos (4/6)	300.00	2025-12-10 00:00:00	\N	PENDING	\N	\N	\N	installment_plan	\N	\N	\N	t	\N	2025-08-25 00:21:28.909	2025-08-25 00:21:28.909
cmeqdgij200mokzpt1estnaxv	cmeqdgidy00fkkzpthpu56gud	INCOME	Procedimentos	Fisioterapia	Fisioterapia - Maria Santos (5/6)	300.00	2026-01-10 00:00:00	\N	PENDING	\N	\N	\N	installment_plan	\N	\N	\N	t	\N	2025-08-25 00:21:28.91	2025-08-25 00:21:28.91
cmeqdgij300mqkzptqztnuii3	cmeqdgidy00fkkzpthpu56gud	INCOME	Procedimentos	Fisioterapia	Fisioterapia - Maria Santos (6/6)	300.00	2026-02-10 00:00:00	\N	PENDING	\N	\N	\N	installment_plan	\N	\N	\N	t	\N	2025-08-25 00:21:28.911	2025-08-25 00:21:28.911
cmeqdgij400mskzptvwenz0g7	cmeqdgidy00fkkzpthpu56gud	INCOME	Procedimentos	Estética	Procedimento Estético - Ana Costa (1/3)	300.00	2025-09-10 00:00:00	2025-09-10 00:00:00	PAID	PIX	\N	\N	installment_plan	\N	\N	\N	t	\N	2025-08-25 00:21:28.912	2025-08-25 00:21:28.912
cmeqdgij500mukzptmf8im6mj	cmeqdgidy00fkkzpthpu56gud	INCOME	Procedimentos	Estética	Procedimento Estético - Ana Costa (2/3)	300.00	2025-10-10 00:00:00	2025-10-10 00:00:00	PAID	PIX	\N	\N	installment_plan	\N	\N	\N	t	\N	2025-08-25 00:21:28.914	2025-08-25 00:21:28.914
cmeqdgij600mwkzptvixgkg05	cmeqdgidy00fkkzpthpu56gud	INCOME	Procedimentos	Estética	Procedimento Estético - Ana Costa (3/3)	300.00	2025-11-10 00:00:00	\N	PENDING	\N	\N	\N	installment_plan	\N	\N	\N	t	\N	2025-08-25 00:21:28.915	2025-08-25 00:21:28.915
cmeqdgij800mykzptrysi4f1o	cmeqdgidy00fkkzpthpu56gud	EXPENSE	Impostos e Taxas	Simples Nacional	DAS - Simples Nacional (VENCIDO)	850.00	2025-08-15 00:21:28.755	\N	PENDING	\N	ATENÇÃO: Conta vencida há 10 dias!	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.916	2025-08-25 00:21:28.916
cmeqdgij900n0kzpt57broce9	cmeqdgidy00fkkzpthpu56gud	INCOME	Convênios	Unimed	Repasse Unimed - Dezembro (VENCIDO)	1200.00	2025-08-05 00:21:28.755	\N	PENDING	\N	Entrar em contato com o convênio	\N	\N	\N	\N	\N	f	\N	2025-08-25 00:21:28.917	2025-08-25 00:21:28.917
cmeqdgioc00pukzpt1csk5txr	cmeqdgie000flkzpt12r4s9e2	INCOME	Outras Receitas	Sublocação	Sublocação Dr. André Luiz Fernandes - agosto de 2025	1800.00	2025-08-05 00:00:00	\N	PENDING	\N	Gerado automaticamente para teste de acerto	\N	monthly_sublease	cmeqdgi45004qkzptoocdtoib	\N	\N	f	\N	2025-08-25 00:21:29.1	2025-08-25 00:21:29.1
cmeqdgiof00pwkzptirv79icz	cmeqdgie000flkzpt12r4s9e2	INCOME	Outras Receitas	Sublocação	Sublocação Dra. Juliana Alves Rodrigues - agosto de 2025	3200.00	2025-08-05 00:00:00	\N	PENDING	\N	Gerado automaticamente para teste de acerto	\N	monthly_sublease	cmeqdgi4z0065kzptt9fjp54z	\N	\N	f	\N	2025-08-25 00:21:29.103	2025-08-25 00:21:29.103
cmeqdgioi00pykzptj00gfv0t	cmeqdgie000flkzpt12r4s9e2	INCOME	Outras Receitas	Sublocação	Sublocação Dr. Ricardo Almeida Silva - agosto de 2025	2500.00	2025-08-05 00:00:00	\N	PENDING	\N	Gerado automaticamente para teste de acerto	\N	monthly_sublease	cmeqdgi2p002ukzptiomce8q3	\N	\N	f	\N	2025-08-25 00:21:29.106	2025-08-25 00:21:29.106
\.


--
-- Data for Name: notification_configuration; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_configuration (id, enabled, "defaultChannel", "firstReminderDays", "secondReminderDays", "thirdReminderHours", "whatsappEnabled", "smsEnabled", "emailEnabled", "retryAttempts", "retryIntervalMinutes", "createdAt", "updatedAt") FROM stdin;
cmeqdgid200f6kzptfm92lklh	t	whatsapp	3	1	2	t	t	t	3	30	2025-08-25 00:21:28.694	2025-08-25 00:21:28.694
\.


--
-- Data for Name: notification_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_logs (id, "appointmentId", channel, recipient, content, subject, status, "errorMessage", "providerData", "deliveredAt", "readAt", "sentAt") FROM stdin;
\.


--
-- Data for Name: notification_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_schedules (id, "appointmentId", "templateId", "scheduledFor", status, channel, "retryCount", "lastAttempt", "errorMessage", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: notification_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_templates (id, name, type, channel, subject, content, variables, active, "createdAt", "updatedAt") FROM stdin;
cmeqdgid500f7kzpt0ysbc1cc	Lembrete WhatsApp - 3 dias	FIRST_REMINDER	WHATSAPP	\N	🏥 *{clinica}* \n\nOlá *{paciente}*! \n\n📅 Lembramos que você tem um agendamento marcado:\n\n🔸 *Serviço:* {servico}\n🔸 *Profissional:* {profissional}  \n🔸 *Data:* {data}\n🔸 *Horário:* {hora}\n🔸 *Sala:* {sala}\n\nℹ️ Em caso de dúvidas ou necessidade de reagendamento, entre em contato conosco.\n\n📞 {telefone}\n\nObrigado pela confiança! 💙	"[\\"paciente\\",\\"profissional\\",\\"servico\\",\\"data\\",\\"hora\\",\\"sala\\",\\"clinica\\",\\"telefone\\"]"	t	2025-08-25 00:21:28.698	2025-08-25 00:21:28.698
cmeqdgid900f8kzpt4yzwbkou	Lembrete WhatsApp - 1 dia	SECOND_REMINDER	WHATSAPP	\N	🏥 *{clinica}*\n\nOi *{paciente}*! \n\n⏰ Seu agendamento é *AMANHÃ*:\n\n🔸 *Serviço:* {servico}\n🔸 *Profissional:* {profissional}\n🔸 *Data:* {data}\n🔸 *Horário:* {hora}\n🔸 *Sala:* {sala}\n\n📋 *Lembre-se:*\n• Chegue 15 minutos antes\n• Traga seus documentos\n• Use máscara de proteção\n\n📞 Dúvidas? {telefone}\n\nAté breve! 💙	"[\\"paciente\\",\\"profissional\\",\\"servico\\",\\"data\\",\\"hora\\",\\"sala\\",\\"clinica\\",\\"telefone\\"]"	t	2025-08-25 00:21:28.701	2025-08-25 00:21:28.701
cmeqdgidb00f9kzptafsknoy7	Lembrete WhatsApp - 2 horas	THIRD_REMINDER	WHATSAPP	\N	🏥 *{clinica}*\n\n*{paciente}*, seu horário é HOJE! ⏰\n\n🔸 *Serviço:* {servico}\n🔸 *Profissional:* {profissional}\n🔸 *Horário:* {hora}\n🔸 *Sala:* {sala}\n\n⚠️ *Lembre-se:* Chegue 15 minutos antes do horário.\n\n📍 *Endereço:* {endereco}\n📞 *Contato:* {telefone}\n\nAguardamos você! 💙	"[\\"paciente\\",\\"profissional\\",\\"servico\\",\\"data\\",\\"hora\\",\\"sala\\",\\"clinica\\",\\"endereco\\",\\"telefone\\"]"	t	2025-08-25 00:21:28.703	2025-08-25 00:21:28.703
cmeqdgidd00fakzptjqxeouaq	Notificação WhatsApp - Imediata	IMMEDIATE	WHATSAPP	\N	🏥 *{clinica}*\n\nOlá *{paciente}*,\n\nInformamos sobre seu agendamento:\n\n🔸 *Serviço:* {servico}\n🔸 *Profissional:* {profissional}\n🔸 *Data:* {data}\n🔸 *Horário:* {hora}\n\n📞 Para mais informações: {telefone}\n\nObrigado! 💙	"[\\"paciente\\",\\"profissional\\",\\"servico\\",\\"data\\",\\"hora\\",\\"clinica\\",\\"telefone\\"]"	t	2025-08-25 00:21:28.705	2025-08-25 00:21:28.705
cmeqdgidf00fbkzptuxlintpy	Lembrete SMS - 3 dias	FIRST_REMINDER	SMS	\N	CLINICA ESSENCIAL: Ola {paciente}! Lembrete: voce tem {servico} com {profissional} em {data} as {hora}. Duvidas: {telefone}	"[\\"paciente\\",\\"profissional\\",\\"servico\\",\\"data\\",\\"hora\\",\\"telefone\\"]"	t	2025-08-25 00:21:28.707	2025-08-25 00:21:28.707
cmeqdgidg00fckzptcqpodmff	Lembrete SMS - 1 dia	SECOND_REMINDER	SMS	\N	CLINICA ESSENCIAL: {paciente}, seu agendamento e AMANHA! {servico} com {profissional} as {hora}. Chegue 15min antes. Info: {telefone}	"[\\"paciente\\",\\"profissional\\",\\"servico\\",\\"hora\\",\\"telefone\\"]"	t	2025-08-25 00:21:28.709	2025-08-25 00:21:28.709
cmeqdgidi00fdkzptuv1h6m7u	Lembrete SMS - 2 horas	THIRD_REMINDER	SMS	\N	CLINICA ESSENCIAL: {paciente}, seu horario e HOJE as {hora}! {servico} com {profissional}. Chegue 15min antes. {endereco}	"[\\"paciente\\",\\"profissional\\",\\"servico\\",\\"hora\\",\\"endereco\\"]"	t	2025-08-25 00:21:28.711	2025-08-25 00:21:28.711
cmeqdgidk00fekzptiqzmd14a	Notificação SMS - Imediata	IMMEDIATE	SMS	\N	CLINICA ESSENCIAL: {paciente}, informacao sobre seu agendamento: {servico} com {profissional} em {data} as {hora}. Info: {telefone}	"[\\"paciente\\",\\"profissional\\",\\"servico\\",\\"data\\",\\"hora\\",\\"telefone\\"]"	t	2025-08-25 00:21:28.713	2025-08-25 00:21:28.713
cmeqdgidm00ffkzptytwrdzp6	Lembrete Email - 3 dias	FIRST_REMINDER	EMAIL	Lembrete: Seu agendamento na {clinica}	Olá {paciente},\n\nEsperamos que esteja bem!\n\nEste é um lembrete sobre seu agendamento:\n\n• Serviço: {servico}\n• Profissional: {profissional}\n• Data: {data}\n• Horário: {hora}\n• Sala: {sala}\n\nINFORMAÇÕES IMPORTANTES:\n- Chegue 15 minutos antes do horário agendado\n- Traga um documento de identificação\n- Use máscara de proteção\n\nEm caso de dúvidas ou necessidade de reagendamento, entre em contato conosco através do telefone {telefone}.\n\nAtenciosamente,\nEquipe {clinica}\n\n📍 Endereço: {endereco}\n📞 Telefone: {telefone}	"[\\"paciente\\",\\"profissional\\",\\"servico\\",\\"data\\",\\"hora\\",\\"sala\\",\\"clinica\\",\\"endereco\\",\\"telefone\\"]"	t	2025-08-25 00:21:28.714	2025-08-25 00:21:28.714
cmeqdgidn00fgkzpti7jbu3bm	Lembrete Email - 1 dia	SECOND_REMINDER	EMAIL	AMANHÃ: Seu agendamento na {clinica}	Olá {paciente},\n\nSeu agendamento é AMANHÃ!\n\n• Serviço: {servico}\n• Profissional: {profissional}\n• Data: {data}\n• Horário: {hora}\n• Sala: {sala}\n\nCHECKLIST PARA SUA CONSULTA:\n✓ Chegue 15 minutos antes\n✓ Traga documento de identificação  \n✓ Use máscara de proteção\n✓ Traga exames anteriores (se houver)\n\nAguardamos você!\n\nAtenciosamente,\nEquipe {clinica}\n\n📍 {endereco}\n📞 {telefone}	"[\\"paciente\\",\\"profissional\\",\\"servico\\",\\"data\\",\\"hora\\",\\"sala\\",\\"clinica\\",\\"endereco\\",\\"telefone\\"]"	t	2025-08-25 00:21:28.716	2025-08-25 00:21:28.716
cmeqdgidp00fhkzptfa51ozhr	Lembrete Email - 2 horas	THIRD_REMINDER	EMAIL	HOJE: Seu agendamento em 2 horas - {clinica}	{paciente},\n\nSeu agendamento é HOJE em aproximadamente 2 horas!\n\n• Serviço: {servico}\n• Profissional: {profissional}\n• Horário: {hora}\n• Sala: {sala}\n\n⏰ LEMBRE-SE: Chegue 15 minutos antes do horário.\n\n📍 Endereço: {endereco}\n📞 Telefone: {telefone}\n\nAguardamos você!\n\nEquipe {clinica}	"[\\"paciente\\",\\"profissional\\",\\"servico\\",\\"hora\\",\\"sala\\",\\"clinica\\",\\"endereco\\",\\"telefone\\"]"	t	2025-08-25 00:21:28.718	2025-08-25 00:21:28.718
cmeqdgidr00fikzptmqg2ddvm	Notificação Email - Imediata	IMMEDIATE	EMAIL	Informação sobre seu agendamento - {clinica}	Olá {paciente},\n\nInformamos sobre seu agendamento:\n\n• Serviço: {servico}\n• Profissional: {profissional}\n• Data: {data}\n• Horário: {hora}\n\nPara mais informações, entre em contato conosco.\n\nAtenciosamente,\nEquipe {clinica}\n\n📞 {telefone}	"[\\"paciente\\",\\"profissional\\",\\"servico\\",\\"data\\",\\"hora\\",\\"clinica\\",\\"telefone\\"]"	t	2025-08-25 00:21:28.72	2025-08-25 00:21:28.72
\.


--
-- Data for Name: partner_availability; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partner_availability (id, "partnerId", "dayOfWeek", "startTime", "endTime", "breakStart", "breakEnd", active, "createdAt", "updatedAt") FROM stdin;
cmeqdgi2s002wkzptcuqqm9d2	cmeqdgi2p002ukzptiomce8q3	1	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.324	2025-08-25 00:21:28.324
cmeqdgi2v002ykzptoeow42p7	cmeqdgi2p002ukzptiomce8q3	2	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.327	2025-08-25 00:21:28.327
cmeqdgi2w0030kzpts4t0aom2	cmeqdgi2p002ukzptiomce8q3	3	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.328	2025-08-25 00:21:28.328
cmeqdgi2x0032kzpt3oqfqjik	cmeqdgi2p002ukzptiomce8q3	4	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.329	2025-08-25 00:21:28.329
cmeqdgi2y0034kzpt305kknmn	cmeqdgi2p002ukzptiomce8q3	5	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.33	2025-08-25 00:21:28.33
cmeqdgi38003dkzptsfddfpqw	cmeqdgi37003bkzptspnnicry	1	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.341	2025-08-25 00:21:28.341
cmeqdgi39003fkzptu7s1pipv	cmeqdgi37003bkzptspnnicry	2	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.342	2025-08-25 00:21:28.342
cmeqdgi3a003hkzpt1s9dv796	cmeqdgi37003bkzptspnnicry	3	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.343	2025-08-25 00:21:28.343
cmeqdgi3b003jkzptvua8183u	cmeqdgi37003bkzptspnnicry	4	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.343	2025-08-25 00:21:28.343
cmeqdgi3c003lkzptddbxlkbf	cmeqdgi37003bkzptspnnicry	5	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.344	2025-08-25 00:21:28.344
cmeqdgi3j003ukzpt9f2m4gmj	cmeqdgi3i003skzpt3u1kzabg	1	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.352	2025-08-25 00:21:28.352
cmeqdgi3k003wkzptya28nz82	cmeqdgi3i003skzpt3u1kzabg	2	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.352	2025-08-25 00:21:28.352
cmeqdgi3k003ykzpt1e524m2y	cmeqdgi3i003skzpt3u1kzabg	3	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.353	2025-08-25 00:21:28.353
cmeqdgi3l0040kzpt1ixzz6aa	cmeqdgi3i003skzpt3u1kzabg	4	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.353	2025-08-25 00:21:28.353
cmeqdgi3m0042kzptp48aymb0	cmeqdgi3i003skzpt3u1kzabg	5	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.354	2025-08-25 00:21:28.354
cmeqdgi3t004bkzptvqola7fg	cmeqdgi3r0049kzpt2jdyq26g	1	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.361	2025-08-25 00:21:28.361
cmeqdgi3v004dkzptdy33919y	cmeqdgi3r0049kzpt2jdyq26g	2	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.363	2025-08-25 00:21:28.363
cmeqdgi3x004fkzpt09q4t5jl	cmeqdgi3r0049kzpt2jdyq26g	3	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.365	2025-08-25 00:21:28.365
cmeqdgi3y004hkzptfht0tsn6	cmeqdgi3r0049kzpt2jdyq26g	4	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.366	2025-08-25 00:21:28.366
cmeqdgi3y004jkzptu31hbn16	cmeqdgi3r0049kzpt2jdyq26g	5	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.367	2025-08-25 00:21:28.367
cmeqdgi46004skzpt5yk8jd1g	cmeqdgi45004qkzptoocdtoib	1	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.375	2025-08-25 00:21:28.375
cmeqdgi47004ukzptrk7u1azh	cmeqdgi45004qkzptoocdtoib	2	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.375	2025-08-25 00:21:28.375
cmeqdgi48004wkzpto7z4x4pk	cmeqdgi45004qkzptoocdtoib	3	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.376	2025-08-25 00:21:28.376
cmeqdgi48004ykzptskszq9an	cmeqdgi45004qkzptoocdtoib	4	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.377	2025-08-25 00:21:28.377
cmeqdgi490050kzptrsg6hkni	cmeqdgi45004qkzptoocdtoib	5	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.377	2025-08-25 00:21:28.377
cmeqdgi4g0059kzptdr55vaiy	cmeqdgi4f0057kzptdrdyomrl	1	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.385	2025-08-25 00:21:28.385
cmeqdgi4h005bkzptv5luay3e	cmeqdgi4f0057kzptdrdyomrl	2	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.386	2025-08-25 00:21:28.386
cmeqdgi4i005dkzptdgx5muc6	cmeqdgi4f0057kzptdrdyomrl	3	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.387	2025-08-25 00:21:28.387
cmeqdgi4j005fkzptdjv3up2e	cmeqdgi4f0057kzptdrdyomrl	4	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.387	2025-08-25 00:21:28.387
cmeqdgi4j005hkzpt2e5zsxpo	cmeqdgi4f0057kzptdrdyomrl	5	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.388	2025-08-25 00:21:28.388
cmeqdgi4q005qkzptp6z663gx	cmeqdgi4p005okzptrfyuaa4h	1	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.395	2025-08-25 00:21:28.395
cmeqdgi4r005skzptdb2jfgef	cmeqdgi4p005okzptrfyuaa4h	2	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.395	2025-08-25 00:21:28.395
cmeqdgi4s005ukzpt5vga14ew	cmeqdgi4p005okzptrfyuaa4h	3	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.396	2025-08-25 00:21:28.396
cmeqdgi4s005wkzptc3bl4y4u	cmeqdgi4p005okzptrfyuaa4h	4	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.397	2025-08-25 00:21:28.397
cmeqdgi4t005ykzptfdoysaw3	cmeqdgi4p005okzptrfyuaa4h	5	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.398	2025-08-25 00:21:28.398
cmeqdgi500067kzptaeo6iwbs	cmeqdgi4z0065kzptt9fjp54z	1	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.405	2025-08-25 00:21:28.405
cmeqdgi510069kzpt4okelg5u	cmeqdgi4z0065kzptt9fjp54z	2	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.406	2025-08-25 00:21:28.406
cmeqdgi52006bkzptnue4trlw	cmeqdgi4z0065kzptt9fjp54z	3	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.406	2025-08-25 00:21:28.406
cmeqdgi53006dkzptlzgjel2o	cmeqdgi4z0065kzptt9fjp54z	4	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.407	2025-08-25 00:21:28.407
cmeqdgi53006fkzptev0v5pfl	cmeqdgi4z0065kzptt9fjp54z	5	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.408	2025-08-25 00:21:28.408
cmeqdgi5b006okzpt2bnbmhyl	cmeqdgi5a006mkzptioctz0ny	1	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.415	2025-08-25 00:21:28.415
cmeqdgi5b006qkzptvo5r3u9s	cmeqdgi5a006mkzptioctz0ny	2	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.416	2025-08-25 00:21:28.416
cmeqdgi5c006skzpt26el3eqj	cmeqdgi5a006mkzptioctz0ny	3	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.416	2025-08-25 00:21:28.416
cmeqdgi5d006ukzpt0cs5jgix	cmeqdgi5a006mkzptioctz0ny	4	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.417	2025-08-25 00:21:28.417
cmeqdgi5d006wkzptjjf7ta46	cmeqdgi5a006mkzptioctz0ny	5	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.418	2025-08-25 00:21:28.418
cmeqdgi5l0075kzpt7tn8geeu	cmeqdgi5k0073kzpthmlt5klh	1	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.426	2025-08-25 00:21:28.426
cmeqdgi5m0077kzptk5gykqsj	cmeqdgi5k0073kzpthmlt5klh	2	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.427	2025-08-25 00:21:28.427
cmeqdgi5n0079kzptzhmhxkd5	cmeqdgi5k0073kzpthmlt5klh	3	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.428	2025-08-25 00:21:28.428
cmeqdgi5o007bkzptrr0e1llr	cmeqdgi5k0073kzpthmlt5klh	4	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.428	2025-08-25 00:21:28.428
cmeqdgi5p007dkzptuaeo9lbl	cmeqdgi5k0073kzpthmlt5klh	5	08:00	17:00	12:00	13:00	t	2025-08-25 00:21:28.429	2025-08-25 00:21:28.429
\.


--
-- Data for Name: partner_blocked_dates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partner_blocked_dates (id, "partnerId", "blockedDate", "startTime", "endTime", reason, active, "createdAt", "updatedAt") FROM stdin;
cmeqdgi310036kzptfpr2by4r	cmeqdgi2p002ukzptiomce8q3	2025-09-01	14:00	15:30	Reunião administrativa	t	2025-08-25 00:21:28.334	2025-08-25 00:21:28.334
cmeqdgi340038kzptfauw947w	cmeqdgi2p002ukzptiomce8q3	2025-09-08	\N	\N	Feriado - Dia completo bloqueado	t	2025-08-25 00:21:28.336	2025-08-25 00:21:28.336
cmeqdgi35003akzpt9dvdc17c	cmeqdgi2p002ukzptiomce8q3	2025-09-15	09:00	11:00	Treinamento obrigatório	t	2025-08-25 00:21:28.337	2025-08-25 00:21:28.337
cmeqdgi3d003nkzptd7a3lp6d	cmeqdgi37003bkzptspnnicry	2025-09-01	14:00	15:30	Reunião administrativa	t	2025-08-25 00:21:28.346	2025-08-25 00:21:28.346
cmeqdgi3f003pkzptyeld33ey	cmeqdgi37003bkzptspnnicry	2025-09-08	\N	\N	Feriado - Dia completo bloqueado	t	2025-08-25 00:21:28.348	2025-08-25 00:21:28.348
cmeqdgi3h003rkzptwicpum98	cmeqdgi37003bkzptspnnicry	2025-09-15	09:00	11:00	Treinamento obrigatório	t	2025-08-25 00:21:28.349	2025-08-25 00:21:28.349
cmeqdgi3n0044kzptt97f35ca	cmeqdgi3i003skzpt3u1kzabg	2025-09-01	14:00	15:30	Reunião administrativa	t	2025-08-25 00:21:28.356	2025-08-25 00:21:28.356
cmeqdgi3o0046kzptnp6tedmd	cmeqdgi3i003skzpt3u1kzabg	2025-09-08	\N	\N	Feriado - Dia completo bloqueado	t	2025-08-25 00:21:28.357	2025-08-25 00:21:28.357
cmeqdgi3q0048kzptq5df1uxe	cmeqdgi3i003skzpt3u1kzabg	2025-09-15	09:00	11:00	Treinamento obrigatório	t	2025-08-25 00:21:28.358	2025-08-25 00:21:28.358
cmeqdgi40004lkzpt9kkj3988	cmeqdgi3r0049kzpt2jdyq26g	2025-09-01	14:00	15:30	Reunião administrativa	t	2025-08-25 00:21:28.368	2025-08-25 00:21:28.368
cmeqdgi41004nkzptdsql4uqo	cmeqdgi3r0049kzpt2jdyq26g	2025-09-08	\N	\N	Feriado - Dia completo bloqueado	t	2025-08-25 00:21:28.369	2025-08-25 00:21:28.369
cmeqdgi43004pkzpt5ygdz2vz	cmeqdgi3r0049kzpt2jdyq26g	2025-09-15	09:00	11:00	Treinamento obrigatório	t	2025-08-25 00:21:28.372	2025-08-25 00:21:28.372
cmeqdgi4a0052kzptu84ko7tg	cmeqdgi45004qkzptoocdtoib	2025-09-01	14:00	15:30	Reunião administrativa	t	2025-08-25 00:21:28.379	2025-08-25 00:21:28.379
cmeqdgi4c0054kzptj9fatzkm	cmeqdgi45004qkzptoocdtoib	2025-09-08	\N	\N	Feriado - Dia completo bloqueado	t	2025-08-25 00:21:28.38	2025-08-25 00:21:28.38
cmeqdgi4d0056kzpt7w318br9	cmeqdgi45004qkzptoocdtoib	2025-09-15	09:00	11:00	Treinamento obrigatório	t	2025-08-25 00:21:28.382	2025-08-25 00:21:28.382
cmeqdgi4l005jkzptp1pvustp	cmeqdgi4f0057kzptdrdyomrl	2025-09-01	14:00	15:30	Reunião administrativa	t	2025-08-25 00:21:28.389	2025-08-25 00:21:28.389
cmeqdgi4m005lkzpt2v7kf1si	cmeqdgi4f0057kzptdrdyomrl	2025-09-08	\N	\N	Feriado - Dia completo bloqueado	t	2025-08-25 00:21:28.39	2025-08-25 00:21:28.39
cmeqdgi4n005nkzptooolpax8	cmeqdgi4f0057kzptdrdyomrl	2025-09-15	09:00	11:00	Treinamento obrigatório	t	2025-08-25 00:21:28.392	2025-08-25 00:21:28.392
cmeqdgi4u0060kzptmemhwhem	cmeqdgi4p005okzptrfyuaa4h	2025-09-01	14:00	15:30	Reunião administrativa	t	2025-08-25 00:21:28.399	2025-08-25 00:21:28.399
cmeqdgi4w0062kzpt9vzfchwx	cmeqdgi4p005okzptrfyuaa4h	2025-09-08	\N	\N	Feriado - Dia completo bloqueado	t	2025-08-25 00:21:28.4	2025-08-25 00:21:28.4
cmeqdgi4x0064kzptoplerkdh	cmeqdgi4p005okzptrfyuaa4h	2025-09-15	09:00	11:00	Treinamento obrigatório	t	2025-08-25 00:21:28.402	2025-08-25 00:21:28.402
cmeqdgi55006hkzptdbbwsbw9	cmeqdgi4z0065kzptt9fjp54z	2025-09-01	14:00	15:30	Reunião administrativa	t	2025-08-25 00:21:28.409	2025-08-25 00:21:28.409
cmeqdgi56006jkzpt53bpt75j	cmeqdgi4z0065kzptt9fjp54z	2025-09-08	\N	\N	Feriado - Dia completo bloqueado	t	2025-08-25 00:21:28.411	2025-08-25 00:21:28.411
cmeqdgi58006lkzptg04g6qek	cmeqdgi4z0065kzptt9fjp54z	2025-09-15	09:00	11:00	Treinamento obrigatório	t	2025-08-25 00:21:28.412	2025-08-25 00:21:28.412
cmeqdgi5e006ykzptmenxy038	cmeqdgi5a006mkzptioctz0ny	2025-09-01	14:00	15:30	Reunião administrativa	t	2025-08-25 00:21:28.419	2025-08-25 00:21:28.419
cmeqdgi5g0070kzpt8s64uldl	cmeqdgi5a006mkzptioctz0ny	2025-09-08	\N	\N	Feriado - Dia completo bloqueado	t	2025-08-25 00:21:28.421	2025-08-25 00:21:28.421
cmeqdgi5i0072kzptse8zfa19	cmeqdgi5a006mkzptioctz0ny	2025-09-15	09:00	11:00	Treinamento obrigatório	t	2025-08-25 00:21:28.422	2025-08-25 00:21:28.422
cmeqdgi5q007fkzpte87ygrax	cmeqdgi5k0073kzpthmlt5klh	2025-09-01	14:00	15:30	Reunião administrativa	t	2025-08-25 00:21:28.431	2025-08-25 00:21:28.431
cmeqdgi5r007hkzpt96nmrv4z	cmeqdgi5k0073kzpthmlt5klh	2025-09-08	\N	\N	Feriado - Dia completo bloqueado	t	2025-08-25 00:21:28.432	2025-08-25 00:21:28.432
cmeqdgi5t007jkzpt04n2s2bd	cmeqdgi5k0073kzpthmlt5klh	2025-09-15	09:00	11:00	Treinamento obrigatório	t	2025-08-25 00:21:28.433	2025-08-25 00:21:28.433
\.


--
-- Data for Name: partner_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partner_services (id, "partnerId", "productServiceId", "createdAt") FROM stdin;
cmeqdgi61007lkzptkcbx9ii9	cmeqd9kfx00024cwz5a87wv43	cmeqdgi12001bkzptpgh703re	2025-08-25 00:21:28.441
cmeqdgi63007nkzpt7yetx178	cmeqd9kfx00024cwz5a87wv43	cmeqdgi15001dkzptcfk5s42c	2025-08-25 00:21:28.443
cmeqdgi64007pkzptlq84fnrt	cmeqd9kfx00024cwz5a87wv43	cmeqdgi1e001lkzpt6mdxvh9h	2025-08-25 00:21:28.445
cmeqdgi65007rkzptihfqd8af	cmeqdgi2p002ukzptiomce8q3	cmeqdgi17001fkzpti9wt1as2	2025-08-25 00:21:28.446
cmeqdgi67007tkzptbhfg0u78	cmeqdgi2p002ukzptiomce8q3	cmeqdgi15001dkzptcfk5s42c	2025-08-25 00:21:28.447
cmeqdgi68007vkzpt30k3uhft	cmeqdgi2p002ukzptiomce8q3	cmeqdgi1c001jkzptf1jr547w	2025-08-25 00:21:28.449
cmeqdgi69007xkzpt3ilc3fcw	cmeqdgi2p002ukzptiomce8q3	cmeqdgi0x0015kzpt8lfjsh2e	2025-08-25 00:21:28.45
cmeqdgi6a007zkzptwet7j308	cmeqdgi2p002ukzptiomce8q3	cmeqdgi0t0013kzpt1pil7fa0	2025-08-25 00:21:28.451
cmeqdgi6c0081kzptb4uutntm	cmeqdgi37003bkzptspnnicry	cmeqdgi17001fkzpti9wt1as2	2025-08-25 00:21:28.452
cmeqdgi6e0083kzptplx060at	cmeqdgi37003bkzptspnnicry	cmeqdgi19001hkzptsoqk4mu5	2025-08-25 00:21:28.454
cmeqdgi6g0085kzptnk9dnhax	cmeqdgi37003bkzptspnnicry	cmeqdgi15001dkzptcfk5s42c	2025-08-25 00:21:28.457
cmeqdgi6i0087kzptetx9m6je	cmeqdgi37003bkzptspnnicry	cmeqdgi1c001jkzptf1jr547w	2025-08-25 00:21:28.458
cmeqdgi6k0089kzpt0xblub27	cmeqdgi37003bkzptspnnicry	cmeqdgi0y0017kzptezkystw6	2025-08-25 00:21:28.46
cmeqdgi6m008bkzptq9j78lef	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi17001fkzpti9wt1as2	2025-08-25 00:21:28.462
cmeqdgi6n008dkzptthwih3wr	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi19001hkzptsoqk4mu5	2025-08-25 00:21:28.464
cmeqdgi6p008fkzpt7gt2sjwo	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi12001bkzptpgh703re	2025-08-25 00:21:28.465
cmeqdgi6q008hkzptrybj3xhh	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi0x0015kzpt8lfjsh2e	2025-08-25 00:21:28.467
cmeqdgi6s008jkzptxd0svm26	cmeqdgi3i003skzpt3u1kzabg	cmeqdgi1e001lkzpt6mdxvh9h	2025-08-25 00:21:28.469
cmeqdgi6u008lkzpt6vm5705d	cmeqdgi3r0049kzpt2jdyq26g	cmeqdgi0x0015kzpt8lfjsh2e	2025-08-25 00:21:28.47
cmeqdgi6w008nkzptjkdv8k0x	cmeqdgi3r0049kzpt2jdyq26g	cmeqdgi19001hkzptsoqk4mu5	2025-08-25 00:21:28.472
cmeqdgi6x008pkzptb43776ic	cmeqdgi3r0049kzpt2jdyq26g	cmeqdgi0y0017kzptezkystw6	2025-08-25 00:21:28.473
cmeqdgi6y008rkzptp5kwtuul	cmeqdgi3r0049kzpt2jdyq26g	cmeqdgi0t0013kzpt1pil7fa0	2025-08-25 00:21:28.475
\.


--
-- Data for Name: partners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partners (id, "fullName", document, phone, email, street, number, complement, neighborhood, city, state, "zipCode", bank, agency, account, pix, "partnershipType", "subleaseAmount", "subleasePaymentDay", "percentageAmount", "percentageRate", active, "createdAt", "updatedAt") FROM stdin;
cmeqdgi3i003skzpt3u1kzabg	Dr. Fernando Santos Oliveira	34567890123	11765432109	fernando.oliveira@clinica.com	Rua Oscar Freire	800	\N	Jardins	São Paulo	SP	01426000	Bradesco	3456	78901-2	fernando.oliveira@clinica.com	PERCENTAGE_WITH_PRODUCTS	\N	\N	\N	70.000000000000000000000000000000	t	2025-08-25 00:21:28.351	2025-08-25 00:21:28.351
cmeqdgi3r0049kzpt2jdyq26g	Dra. Carolina Ribeiro Lima	45678901234	11654321098	carolina.lima@clinica.com	Rua Augusta	2000	\N	Consolação	São Paulo	SP	01305000	Santander	4567	89012-3	11654321098	PERCENTAGE	\N	\N	150.000000000000000000000000000000	\N	t	2025-08-25 00:21:28.36	2025-08-25 00:21:28.36
cmeqdgi4f0057kzptdrdyomrl	Dra. Patrícia Moura Santos	67890123456	11432109876	patricia.santos@clinica.com	Avenida Faria Lima	1200	Torre A - Sala 1205	Itaim Bibi	São Paulo	SP	01451000	Nubank	\N	\N	patricia.santos@clinica.com	PERCENTAGE_WITH_PRODUCTS	\N	\N	\N	65.000000000000000000000000000000	t	2025-08-25 00:21:28.383	2025-08-25 00:21:28.383
cmeqdgi4p005okzptrfyuaa4h	Dr. Gabriel Henrique Costa	78901234567	11321098765	gabriel.costa@clinica.com	Rua Pamplona	1000	\N	Jardim Paulista	São Paulo	SP	01405000	Inter	\N	\N	11321098765	PERCENTAGE	\N	\N	100.000000000000000000000000000000	\N	t	2025-08-25 00:21:28.393	2025-08-25 00:21:28.393
cmeqdgi4z0065kzptt9fjp54z	Dra. Juliana Alves Rodrigues	89012345678	11210987654	juliana.rodrigues@clinica.com	Rua Estados Unidos	800	\N	Jardins	São Paulo	SP	01427000	BTG Pactual	6789	01234-5	juliana.rodrigues@clinica.com	SUBLEASE	3200.000000000000000000000000000000	15	\N	\N	t	2025-08-25 00:21:28.403	2025-08-25 00:21:28.403
cmeqdgi5a006mkzptioctz0ny	Dr. Thiago Barbosa Mendes	90123456789	11109876543	thiago.mendes@clinica.com	Rua Teodoro Sampaio	1500	\N	Pinheiros	São Paulo	SP	05405000	Original	\N	\N	thiago.mendes@clinica.com	PERCENTAGE_WITH_PRODUCTS	\N	\N	\N	75.000000000000000000000000000000	t	2025-08-25 00:21:28.414	2025-08-25 00:21:28.414
cmeqdgi5k0073kzpthmlt5klh	Dra. Renata Silva Carvalho	01234567891	11098765432	renata.carvalho@clinica.com	Rua Consolação	2500	Andar 12	Consolação	São Paulo	SP	01301000	C6 Bank	\N	\N	11098765432	PERCENTAGE	\N	\N	140.000000000000000000000000000000	\N	t	2025-08-25 00:21:28.424	2025-08-25 00:21:28.424
cmeqdgi2p002ukzptiomce8q3	Dr. Ricardo Almeida Silva	12345678901	11987654321	ricardo.silva@clinica.com	Rua dos Médicos	100	\N	Centro Médico	São Paulo	SP	01234567	Banco do Brasil	1234	56789-0	ricardo.silva@clinica.com	SUBLEASE	2500.000000000000000000000000000000	5	120.000000000000000000000000000000	\N	t	2025-08-25 00:21:28.321	2025-08-25 00:21:28.984
cmeqdgi37003bkzptspnnicry	Dra. Mariana Costa Pereira	23456789012	11876543210	mariana.pereira@clinica.com	Avenida Paulista	1500	Conjunto 801	Bela Vista	São Paulo	SP	01310100	Itaú	2345	67890-1	11876543210	PERCENTAGE_WITH_PRODUCTS	2500.000000000000000000000000000000	10	\N	60.000000000000000000000000000000	t	2025-08-25 00:21:28.339	2025-08-25 00:21:29.024
cmeqd9kfx00024cwz5a87wv43	Parceiro 1 de Oliveira.0	81636278086	31987034132	parceiro1@alav.cloud												SUBLEASE	300.000000000000000000000000000000	5	\N	60.000000000000000000000000000000	t	2025-08-25 00:16:04.798	2025-08-25 00:22:49.967
cmeqdgi45004qkzptoocdtoib	Dr. André Luiz Fernandes	56789012345	11543210987	andre.fernandes@clinica.com	Rua Haddock Lobo	600		Cerqueira César	São Paulo	SP	01414000	Caixa Econômica Federal	5678	90123-4	andre.fernandes@clinica.com	SUBLEASE	1800.000000000000000000000000000000	5	\N	\N	t	2025-08-25 00:21:28.373	2025-08-25 00:55:34.782
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patients (id, "fullName", cpf, "birthDate", whatsapp, phone, email, street, number, complement, neighborhood, city, state, "zipCode", observations, active, "createdAt", "updatedAt") FROM stdin;
cmeqd769k00004cwzfb4lya3k	Parceiro 1 de Oliveira	33843632057	2000-01-12 00:00:00												t	2025-08-25 00:14:13.113	2025-08-25 00:14:13.113
cmeqd7sit00014cwz827vzxib	Paciente 2 Melo Campos	73796269060	1999-09-01 00:00:00												t	2025-08-25 00:14:41.957	2025-08-25 00:14:41.957
cmeqdghyc0000kzpt0zlg6czf	Maria Silva Santos	12345678901	1985-03-15 00:00:00	11987654321	1134567890	maria.silva@email.com	Rua das Flores	123	Apto 45	Centro	São Paulo	SP	01234567	Paciente com histórico de alergias a medicamentos	t	2025-08-25 00:21:28.164	2025-08-25 00:21:28.164
cmeqdghyj0001kzpt493kfno2	João Carlos Oliveira	23456789012	1978-07-22 00:00:00	11876543210	\N	joao.oliveira@email.com	Avenida Paulista	1000	\N	Bela Vista	São Paulo	SP	01310100	Paciente diabético, requer cuidados especiais	t	2025-08-25 00:21:28.171	2025-08-25 00:21:28.171
cmeqdghyq0003kzptk7kn88fc	Carlos Eduardo Ferreira	45678901234	1965-12-03 00:00:00	11654321098	\N	carlos.ferreira@email.com	Rua Oscar Freire	200	Sala 10	Jardins	São Paulo	SP	01426000	Paciente idoso, necessita acompanhante	t	2025-08-25 00:21:28.178	2025-08-25 00:21:28.178
cmeqdghyt0004kzpt40da3xok	Fernanda Rodrigues Lima	56789012345	1988-05-17 00:00:00	11543210987	\N	fernanda.lima@email.com	Rua Haddock Lobo	300	\N	Cerqueira César	São Paulo	SP	01414000	\N	t	2025-08-25 00:21:28.182	2025-08-25 00:21:28.182
cmeqdghyv0005kzpta2h57t9b	Roberto Almeida Souza	67890123456	1975-09-25 00:00:00	11432109876	1145678901	roberto.souza@email.com	Rua Teodoro Sampaio	800	\N	Pinheiros	São Paulo	SP	05405000	Paciente com mobilidade reduzida	t	2025-08-25 00:21:28.184	2025-08-25 00:21:28.184
cmeqdghyx0006kzptcbsizaes	Juliana Martins Pereira	78901234567	1990-01-12 00:00:00	11321098765	\N	juliana.pereira@email.com	Rua Consolação	1500	Bloco B	Consolação	São Paulo	SP	01301000	\N	t	2025-08-25 00:21:28.186	2025-08-25 00:21:28.186
cmeqdghyz0007kzptml41sloi	Pedro Henrique Silva	89012345678	1982-04-30 00:00:00	11210987654	\N	pedro.silva@email.com	Avenida Faria Lima	2000	\N	Itaim Bibi	São Paulo	SP	01451000	Paciente executivo, prefere horários após 18h	t	2025-08-25 00:21:28.188	2025-08-25 00:21:28.188
cmeqdghz10008kzpt4uv4h019	Luciana Santos Oliveira	90123456789	1987-08-14 00:00:00	11109876543	1156789012	luciana.oliveira@email.com	Rua Pamplona	600	\N	Jardim Paulista	São Paulo	SP	01405000	\N	t	2025-08-25 00:21:28.189	2025-08-25 00:21:28.189
cmeqdghz30009kzpt22ntaxke	Marcos Antonio Costa	01234567890	1970-06-18 00:00:00	11098765432	\N	marcos.costa@email.com	Rua Estados Unidos	400	\N	Jardins	São Paulo	SP	01427000	Paciente com histórico de hipertensão	t	2025-08-25 00:21:28.191	2025-08-25 00:21:28.191
cmeqdghyn0002kzpt56kjppgr	Ana Paula Costa	11111111111	1990-01-01 00:00:00	31999999999	1123456789	ana.costa@email.com	Rua Augusta	500		Consolação	São Paulo	SP	01305000		t	2025-08-25 00:21:28.175	2025-08-25 00:55:06.477
\.


--
-- Data for Name: product_service_rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_service_rooms (id, "productServiceId", "roomId", "createdAt") FROM stdin;
\.


--
-- Data for Name: product_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_services (id, name, type, "categoryId", "internalCode", description, "salePrice", "costPrice", "partnerPrice", "durationMinutes", "availableForBooking", "requiresSpecialPrep", "specialPrepDetails", "stockLevel", "minStockLevel", active, observations, "createdAt", "updatedAt") FROM stdin;
cmeqdgi0t0013kzpt1pil7fa0	Consulta Clínica Geral	SERVICE	cmeqdghzu000kkzptpg60lwtp	CONS001	Consulta médica geral para avaliação e diagnóstico	150.000000000000000000000000000000	50.000000000000000000000000000000	100.000000000000000000000000000000	30	t	f	\N	\N	\N	t	\N	2025-08-25 00:21:28.254	2025-08-25 00:21:28.254
cmeqdgi0x0015kzpt8lfjsh2e	Consulta Cardiológica	SERVICE	cmeqdgi07000skzpt8cu9tapc	CARD001	Consulta especializada em cardiologia	250.000000000000000000000000000000	80.000000000000000000000000000000	170.000000000000000000000000000000	45	t	f	\N	\N	\N	t	\N	2025-08-25 00:21:28.257	2025-08-25 00:21:28.257
cmeqdgi0y0017kzptezkystw6	Consulta Ginecológica	SERVICE	cmeqdgi04000qkzpt6vwfp5es	GINE001	Consulta ginecológica de rotina	200.000000000000000000000000000000	70.000000000000000000000000000000	130.000000000000000000000000000000	40	t	f	\N	\N	\N	t	\N	2025-08-25 00:21:28.259	2025-08-25 00:21:28.259
cmeqdgi100019kzpta8trwa0s	Consulta Pediátrica	SERVICE	cmeqdgi05000rkzptgar5vb1s	PEDI001	Consulta pediátrica para crianças e adolescentes	180.000000000000000000000000000000	60.000000000000000000000000000000	120.000000000000000000000000000000	35	t	f	\N	\N	\N	t	\N	2025-08-25 00:21:28.26	2025-08-25 00:21:28.26
cmeqdgi12001bkzptpgh703re	Consulta Dermatológica	SERVICE	cmeqdgi08000tkzpt0jgxarsr	DERM001	Consulta dermatológica especializada	220.000000000000000000000000000000	75.000000000000000000000000000000	145.000000000000000000000000000000	30	t	f	\N	\N	\N	t	\N	2025-08-25 00:21:28.263	2025-08-25 00:21:28.263
cmeqdgi15001dkzptcfk5s42c	Eletrocardiograma (ECG)	SERVICE	cmeqdghzw000lkzpt8i9r0jm0	ECG001	Exame de eletrocardiograma para avaliação cardíaca	80.000000000000000000000000000000	20.000000000000000000000000000000	60.000000000000000000000000000000	15	t	f	\N	\N	\N	t	\N	2025-08-25 00:21:28.265	2025-08-25 00:21:28.265
cmeqdgi17001fkzpti9wt1as2	Ultrassom Abdominal	SERVICE	cmeqdghzw000lkzpt8i9r0jm0	USG001	Ultrassonografia abdominal completa	120.000000000000000000000000000000	30.000000000000000000000000000000	90.000000000000000000000000000000	25	t	t	Jejum de 8 horas	\N	\N	t	\N	2025-08-25 00:21:28.267	2025-08-25 00:21:28.267
cmeqdgi19001hkzptsoqk4mu5	Ultrassom Obstétrico	SERVICE	cmeqdghzw000lkzpt8i9r0jm0	USG002	Ultrassonografia obstétrica para acompanhamento pré-natal	150.000000000000000000000000000000	40.000000000000000000000000000000	110.000000000000000000000000000000	30	t	f	\N	\N	\N	t	\N	2025-08-25 00:21:28.27	2025-08-25 00:21:28.27
cmeqdgi1c001jkzptf1jr547w	Pequena Cirurgia	SERVICE	cmeqdghzy000mkzptcd0zc7t5	CIR001	Pequenos procedimentos cirúrgicos ambulatoriais	400.000000000000000000000000000000	100.000000000000000000000000000000	300.000000000000000000000000000000	60	t	t	Jejum de 6 horas, acompanhante obrigatório	\N	\N	t	\N	2025-08-25 00:21:28.272	2025-08-25 00:21:28.272
cmeqdgi1e001lkzpt6mdxvh9h	Cauterização	SERVICE	cmeqdghzy000mkzptcd0zc7t5	CAU001	Cauterização de lesões cutâneas	200.000000000000000000000000000000	50.000000000000000000000000000000	150.000000000000000000000000000000	20	t	f	\N	\N	\N	t	\N	2025-08-25 00:21:28.274	2025-08-25 00:21:28.274
cmeqdgi1g001nkzptpt8y97ov	Sessão de Fisioterapia	SERVICE	cmeqdgi00000nkzptwg1te0iq	FISIO001	Sessão individual de fisioterapia	100.000000000000000000000000000000	30.000000000000000000000000000000	70.000000000000000000000000000000	50	t	f	\N	\N	\N	t	\N	2025-08-25 00:21:28.276	2025-08-25 00:21:28.276
cmeqdgi1i001pkzptvj25911t	Fisioterapia RPG	SERVICE	cmeqdgi00000nkzptwg1te0iq	RPG001	Reeducação Postural Global	120.000000000000000000000000000000	35.000000000000000000000000000000	85.000000000000000000000000000000	60	t	f	\N	\N	\N	t	\N	2025-08-25 00:21:28.278	2025-08-25 00:21:28.278
cmeqdgi1k001rkzptluv0a4id	Consulta Psicológica	SERVICE	cmeqdgi01000okzpty6ca2xy2	PSI001	Sessão de psicoterapia individual	150.000000000000000000000000000000	50.000000000000000000000000000000	100.000000000000000000000000000000	50	t	f	\N	\N	\N	t	\N	2025-08-25 00:21:28.28	2025-08-25 00:21:28.28
cmeqdgi1n001tkzptvtrayktt	Terapia de Casal	SERVICE	cmeqdgi01000okzpty6ca2xy2	PSI002	Sessão de terapia para casais	200.000000000000000000000000000000	70.000000000000000000000000000000	130.000000000000000000000000000000	60	t	f	\N	\N	\N	t	\N	2025-08-25 00:21:28.283	2025-08-25 00:21:28.283
cmeqdgi1o001vkzptw4soa38z	Consulta Odontológica	SERVICE	cmeqdgi02000pkzptgvgdjlvh	ODONTO001	Consulta odontológica de rotina	120.000000000000000000000000000000	40.000000000000000000000000000000	80.000000000000000000000000000000	30	t	f	\N	\N	\N	t	\N	2025-08-25 00:21:28.285	2025-08-25 00:21:28.285
cmeqdgi1q001xkzptp1si8bre	Limpeza Dental	SERVICE	cmeqdgi02000pkzptgvgdjlvh	LIMP001	Profilaxia e limpeza dental	100.000000000000000000000000000000	30.000000000000000000000000000000	70.000000000000000000000000000000	45	t	f	\N	\N	\N	t	\N	2025-08-25 00:21:28.287	2025-08-25 00:21:28.287
cmeqdgi1s001zkzpthycsbyit	Dipirona 500mg	PRODUCT	cmeqdgi09000ukzptcyjqq27b	MED001	Analgésico e antitérmico - caixa com 20 comprimidos	15.500000000000000000000000000000	8.000000000000000000000000000000	12.000000000000000000000000000000	\N	t	f	\N	50	10	t	Medicamento de venda livre	2025-08-25 00:21:28.288	2025-08-25 00:21:28.288
cmeqdgi1v0021kzptgsbo3bqv	Paracetamol 750mg	PRODUCT	cmeqdgi09000ukzptcyjqq27b	MED002	Analgésico e antitérmico - caixa com 20 comprimidos	18.900000000000000000000000000000	10.000000000000000000000000000000	15.000000000000000000000000000000	\N	t	f	\N	30	8	t	Medicamento de venda livre	2025-08-25 00:21:28.291	2025-08-25 00:21:28.291
cmeqdgi1x0023kzptu9ce7atp	Ibuprofeno 600mg	PRODUCT	cmeqdgi09000ukzptcyjqq27b	MED003	Anti-inflamatório - caixa com 20 comprimidos	25.800000000000000000000000000000	15.000000000000000000000000000000	20.000000000000000000000000000000	\N	t	f	\N	25	5	t	Medicamento de venda livre	2025-08-25 00:21:28.293	2025-08-25 00:21:28.293
cmeqdgi1z0025kzpt49mxlflt	Seringa Descartável 5ml	PRODUCT	cmeqdgi0a000vkzpttj5pqtbo	MAT001	Seringa descartável estéril 5ml - pacote com 100 unidades	45.000000000000000000000000000000	25.000000000000000000000000000000	35.000000000000000000000000000000	\N	t	f	\N	20	5	t	Material estéril descartável	2025-08-25 00:21:28.295	2025-08-25 00:21:28.295
cmeqdgi210027kzptum5or1vc	Luvas Descartáveis M	PRODUCT	cmeqdgi0i0011kzptwr2rfa9s	DESC001	Luvas de procedimento não cirúrgico - caixa com 100 unidades	35.000000000000000000000000000000	20.000000000000000000000000000000	28.000000000000000000000000000000	\N	t	f	\N	15	3	t	Tamanho M - látex	2025-08-25 00:21:28.298	2025-08-25 00:21:28.298
cmeqdgi230029kzpt7ix67a75	Máscara Cirúrgica	PRODUCT	cmeqdgi0i0011kzptwr2rfa9s	DESC002	Máscara cirúrgica tripla camada - caixa com 50 unidades	25.000000000000000000000000000000	12.000000000000000000000000000000	20.000000000000000000000000000000	\N	t	f	\N	40	10	t	Proteção tripla camada	2025-08-25 00:21:28.299	2025-08-25 00:21:28.299
cmeqdgi24002bkzpt82xie4rs	Vitamina D3 2000UI	PRODUCT	cmeqdgi0b000wkzpt9gyieyt7	SUP001	Suplemento de vitamina D3 - frasco com 60 cápsulas	45.900000000000000000000000000000	25.000000000000000000000000000000	38.000000000000000000000000000000	\N	t	f	\N	35	8	t	Suplemento alimentar	2025-08-25 00:21:28.301	2025-08-25 00:21:28.301
cmeqdgi26002dkzpt01kmwmwb	Ômega 3 1000mg	PRODUCT	cmeqdgi0b000wkzpt9gyieyt7	SUP002	Suplemento de ômega 3 - frasco com 60 cápsulas	55.000000000000000000000000000000	30.000000000000000000000000000000	45.000000000000000000000000000000	\N	t	f	\N	28	6	t	Rico em EPA e DHA	2025-08-25 00:21:28.302	2025-08-25 00:21:28.302
cmeqdgi28002fkzptnhu1vczd	Protetor Solar FPS 60	PRODUCT	cmeqdgi0d000xkzpt8l8dxryp	COSM001	Protetor solar facial FPS 60 - tubo 50g	65.000000000000000000000000000000	35.000000000000000000000000000000	52.000000000000000000000000000000	\N	t	f	\N	22	5	t	Proteção UVA/UVB	2025-08-25 00:21:28.304	2025-08-25 00:21:28.304
cmeqdgi2a002hkzptcxm7gu5r	Hidratante Facial	PRODUCT	cmeqdgi0d000xkzpt8l8dxryp	COSM002	Hidratante facial para pele seca - frasco 100ml	42.900000000000000000000000000000	22.000000000000000000000000000000	35.000000000000000000000000000000	\N	t	f	\N	18	4	t	Para todos os tipos de pele	2025-08-25 00:21:28.306	2025-08-25 00:21:28.306
cmeqdgi2c002jkzptl8x7fbc2	Termômetro Digital	PRODUCT	cmeqdgi0f000ykzptazqo1lmw	EQUIP001	Termômetro digital clínico	25.000000000000000000000000000000	12.000000000000000000000000000000	20.000000000000000000000000000000	\N	t	f	\N	12	3	t	Medição rápida e precisa	2025-08-25 00:21:28.308	2025-08-25 00:21:28.308
cmeqdgi2d002lkzptsheujlia	Oxímetro de Pulso	PRODUCT	cmeqdgi0f000ykzptazqo1lmw	EQUIP002	Oxímetro de pulso digital portátil	85.000000000000000000000000000000	45.000000000000000000000000000000	70.000000000000000000000000000000	\N	t	f	\N	8	2	t	Medição de saturação e frequência cardíaca	2025-08-25 00:21:28.31	2025-08-25 00:21:28.31
cmeqdgi2f002nkzpt6ix20u93	Álcool Gel 70%	PRODUCT	cmeqdgi0g000zkzpt70wgkt3k	HIG001	Álcool gel antisséptico 70% - frasco 500ml	12.900000000000000000000000000000	6.000000000000000000000000000000	10.000000000000000000000000000000	\N	t	f	\N	60	15	t	Antisséptico para as mãos	2025-08-25 00:21:28.312	2025-08-25 00:21:28.312
cmeqdgi2h002pkzptgbmwbbx1	Sabonete Antisséptico	PRODUCT	cmeqdgi0g000zkzpt70wgkt3k	HIG002	Sabonete líquido antisséptico - frasco 250ml	18.500000000000000000000000000000	9.000000000000000000000000000000	15.000000000000000000000000000000	\N	t	f	\N	25	6	t	Para higienização das mãos	2025-08-25 00:21:28.313	2025-08-25 00:21:28.313
cmeqdgi2j002rkzptpasqyps8	Colar Cervical	PRODUCT	cmeqdgi0h0010kzpt89c28nno	ORTO001	Colar cervical ajustável - tamanho único	45.000000000000000000000000000000	25.000000000000000000000000000000	38.000000000000000000000000000000	\N	t	f	\N	10	2	t	Suporte cervical ajustável	2025-08-25 00:21:28.315	2025-08-25 00:21:28.315
cmeqdgi2l002tkzptmtlcb3ko	Joelheira Elástica	PRODUCT	cmeqdgi0h0010kzpt89c28nno	ORTO002	Joelheira elástica com suporte - tamanho M	35.000000000000000000000000000000	18.000000000000000000000000000000	28.000000000000000000000000000000	\N	t	f	\N	15	3	t	Tamanho M - suporte lateral	2025-08-25 00:21:28.317	2025-08-25 00:21:28.317
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rooms (id, name, description, resources, active, "createdAt", "updatedAt") FROM stdin;
cmeqdghzf000bkzpte6v303wo	Consultório 2	Consultório secundário ideal para consultas rápidas	{maca,armário,"luz focal","ar condicionado"}	t	2025-08-25 00:21:28.203	2025-08-25 00:21:28.203
cmeqdghzg000ckzpt3rqux2h5	Sala de Procedimentos	Sala equipada para pequenos procedimentos e curativos	{"maca cirúrgica","armário com medicamentos","luz focal cirúrgica",pia,autoclave,"carrinho de procedimentos","ar condicionado"}	t	2025-08-25 00:21:28.205	2025-08-25 00:21:28.205
cmeqdghzi000dkzptp8l5m2ma	Consultório Pediátrico	Consultório especializado para atendimento infantil	{"maca pediátrica","balança infantil","régua de crescimento",brinquedos,armário,"ar condicionado","decoração infantil"}	t	2025-08-25 00:21:28.206	2025-08-25 00:21:28.206
cmeqdghzk000ekzptw4cth74o	Sala de Fisioterapia	Sala ampla para sessões de fisioterapia e reabilitação	{tatame,"bolas de pilates",therabands,halteres,"maca de fisioterapia",espelho,"ar condicionado","som ambiente"}	t	2025-08-25 00:21:28.208	2025-08-25 00:21:28.208
cmeqdghzl000fkzptoz94j5k4	Consultório Ginecológico	Consultório especializado para consultas ginecológicas	{"maca ginecológica","foco ginecológico","armário com materiais",pia,biombo,"ar condicionado","cadeira para acompanhante"}	t	2025-08-25 00:21:28.209	2025-08-25 00:21:28.209
cmeqdghzm000gkzpt8dw1g9fb	Sala de Exames	Sala para realização de exames complementares	{"maca de exames","equipamento de ultrassom",eletrocardiógrafo,armário,pia,"ar condicionado",computador}	t	2025-08-25 00:21:28.211	2025-08-25 00:21:28.211
cmeqdghzo000hkzpt822njlop	Consultório Psicológico	Ambiente acolhedor para consultas psicológicas	{"poltronas confortáveis","mesa de apoio","ar condicionado","isolamento acústico","decoração relaxante","caixa de lenços"}	t	2025-08-25 00:21:28.213	2025-08-25 00:21:28.213
cmeqdghzq000ikzpt30y6apxb	Sala de Reuniões	Sala para reuniões da equipe e discussão de casos	{"mesa de reunião",cadeiras,projetor,"tela de projeção","ar condicionado","quadro branco",computador}	t	2025-08-25 00:21:28.214	2025-08-25 00:21:28.214
cmeqdghzr000jkzptr2q6nuer	Consultório Odontológico.	Consultório equipado para atendimento odontológico	{"cadeira odontológica","equipo odontológico",compressor,autoclave,pia,"armário com instrumentos","ar condicionado",sugador}	t	2025-08-25 00:21:28.215	2025-08-25 01:52:49.861
cmeqdghz9000akzpt91g8uerq	Consultório 1	Consultório principal com vista para o jardim	{maca,armário,"luz focal",pia,"ar condicionado",computador}	t	2025-08-25 00:21:28.197	2025-08-25 01:53:40.158
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, name, role, active, "createdAt", "updatedAt") FROM stdin;
cmeqd6c5b0000130oe69meayv	admin@clinica.com	$2a$12$5h2Xf2f/mXWkN3MtDsR6g.10fPkMxExyW0qZvoPZt/UFiTKk.EaA6	Administrador	ADMIN	t	2025-08-25 00:13:34.079	2025-08-25 00:13:34.079
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: bank_accounts bank_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: clinic_settings clinic_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinic_settings
    ADD CONSTRAINT clinic_settings_pkey PRIMARY KEY (id);


--
-- Name: financial_entries financial_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_entries
    ADD CONSTRAINT financial_entries_pkey PRIMARY KEY (id);


--
-- Name: notification_configuration notification_configuration_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_configuration
    ADD CONSTRAINT notification_configuration_pkey PRIMARY KEY (id);


--
-- Name: notification_logs notification_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_logs
    ADD CONSTRAINT notification_logs_pkey PRIMARY KEY (id);


--
-- Name: notification_schedules notification_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_schedules
    ADD CONSTRAINT notification_schedules_pkey PRIMARY KEY (id);


--
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- Name: partner_availability partner_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partner_availability
    ADD CONSTRAINT partner_availability_pkey PRIMARY KEY (id);


--
-- Name: partner_blocked_dates partner_blocked_dates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partner_blocked_dates
    ADD CONSTRAINT partner_blocked_dates_pkey PRIMARY KEY (id);


--
-- Name: partner_services partner_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partner_services
    ADD CONSTRAINT partner_services_pkey PRIMARY KEY (id);


--
-- Name: partners partners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_pkey PRIMARY KEY (id);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: product_service_rooms product_service_rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_service_rooms
    ADD CONSTRAINT product_service_rooms_pkey PRIMARY KEY (id);


--
-- Name: product_services product_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_services
    ADD CONSTRAINT product_services_pkey PRIMARY KEY (id);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: partner_blocked_dates_partnerId_blockedDate_startTime_endTi_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "partner_blocked_dates_partnerId_blockedDate_startTime_endTi_key" ON public.partner_blocked_dates USING btree ("partnerId", "blockedDate", "startTime", "endTime");


--
-- Name: partner_services_partnerId_productServiceId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "partner_services_partnerId_productServiceId_key" ON public.partner_services USING btree ("partnerId", "productServiceId");


--
-- Name: partners_document_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX partners_document_key ON public.partners USING btree (document);


--
-- Name: patients_cpf_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX patients_cpf_key ON public.patients USING btree (cpf);


--
-- Name: product_service_rooms_productServiceId_roomId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "product_service_rooms_productServiceId_roomId_key" ON public.product_service_rooms USING btree ("productServiceId", "roomId");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: appointments appointments_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT "appointments_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: appointments appointments_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT "appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: appointments appointments_productServiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT "appointments_productServiceId_fkey" FOREIGN KEY ("productServiceId") REFERENCES public.product_services(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: appointments appointments_roomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT "appointments_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES public.rooms(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: financial_entries financial_entries_appointmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_entries
    ADD CONSTRAINT "financial_entries_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES public.appointments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: financial_entries financial_entries_bankAccountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_entries
    ADD CONSTRAINT "financial_entries_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES public.bank_accounts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: financial_entries financial_entries_parentEntryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_entries
    ADD CONSTRAINT "financial_entries_parentEntryId_fkey" FOREIGN KEY ("parentEntryId") REFERENCES public.financial_entries(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: financial_entries financial_entries_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_entries
    ADD CONSTRAINT "financial_entries_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: financial_entries financial_entries_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_entries
    ADD CONSTRAINT "financial_entries_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: notification_logs notification_logs_appointmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_logs
    ADD CONSTRAINT "notification_logs_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES public.appointments(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notification_schedules notification_schedules_appointmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_schedules
    ADD CONSTRAINT "notification_schedules_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES public.appointments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification_schedules notification_schedules_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_schedules
    ADD CONSTRAINT "notification_schedules_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public.notification_templates(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: partner_availability partner_availability_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partner_availability
    ADD CONSTRAINT "partner_availability_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: partner_blocked_dates partner_blocked_dates_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partner_blocked_dates
    ADD CONSTRAINT "partner_blocked_dates_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: partner_services partner_services_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partner_services
    ADD CONSTRAINT "partner_services_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: partner_services partner_services_productServiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partner_services
    ADD CONSTRAINT "partner_services_productServiceId_fkey" FOREIGN KEY ("productServiceId") REFERENCES public.product_services(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_service_rooms product_service_rooms_productServiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_service_rooms
    ADD CONSTRAINT "product_service_rooms_productServiceId_fkey" FOREIGN KEY ("productServiceId") REFERENCES public.product_services(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_service_rooms product_service_rooms_roomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_service_rooms
    ADD CONSTRAINT "product_service_rooms_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES public.rooms(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_services product_services_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_services
    ADD CONSTRAINT "product_services_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict 8Bqze6qHtCFQUmIaw0DtGp3wdWhxwzXKzF4V5JqWalKXDa8EIhIbpLQGCRbQa54

