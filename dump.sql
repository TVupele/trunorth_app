--
-- PostgreSQL database dump
--

--\restrict bkVYoDHkdAx252hQ45dLMjJicCeTcz8IDdT2fr5sUBZXxd51dUD1iWhTHIbmf8S

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Category columns for events and campaigns
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS category character varying(100) DEFAULT 'General';
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS category character varying(100) DEFAULT 'General';

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: emergency_priority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.emergency_priority AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);


--
-- Name: report_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.report_status AS ENUM (
    'submitted',
    'in-progress',
    'resolved'
);


--
-- Name: transaction_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.transaction_status AS ENUM (
    'pending',
    'completed',
    'failed'
);


--
-- Name: transaction_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.transaction_type AS ENUM (
    'top-up',
    'send',
    'receive',
    'payment',
    'booking'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'user',
    'tutor',
    'vendor',
    'admin'
);


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ad_banners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ad_banners (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    type character varying(50) NOT NULL,
    image_url text NOT NULL,
    cta character varying(100) NOT NULL,
    link character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id uuid NOT NULL,
    booking_date timestamp with time zone DEFAULT now() NOT NULL,
    status character varying(50) DEFAULT 'confirmed'::character varying,
    transaction_id uuid
);


--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organizer_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    image_url text,
    goal_amount numeric(15,2) NOT NULL,
    raised_amount numeric(15,2) DEFAULT 0.00 NOT NULL,
    end_date timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    category character varying(100) DEFAULT 'General'
);


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: donations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.donations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    campaign_id uuid NOT NULL,
    amount numeric(15,2) NOT NULL,
    is_anonymous boolean DEFAULT false NOT NULL,
    transaction_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: emergency_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.emergency_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reporter_id uuid NOT NULL,
    type character varying(100) NOT NULL,
    priority public.emergency_priority DEFAULT 'medium'::public.emergency_priority NOT NULL,
    location_description text,
    latitude numeric(9,6),
    longitude numeric(9,6),
    description text,
    status public.report_status DEFAULT 'submitted'::public.report_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    image_url text,
    event_date timestamp with time zone NOT NULL,
    location text,
    ticket_price numeric(10,2),
    total_seats integer,
    available_seats integer,
    category character varying(100) DEFAULT 'General'
);


--
-- Name: pending_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pending_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    request_type character varying(20) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: post_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post_likes (
    user_id uuid NOT NULL,
    post_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    image_url text,
    likes_count integer DEFAULT 0 NOT NULL,
    comments_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: private_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.private_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sender_id uuid NOT NULL,
    receiver_id uuid NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    vendor_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    image_url text,
    price numeric(15,2) NOT NULL,
    currency character varying(3) DEFAULT 'NGN'::character varying NOT NULL,
    category character varying(100),
    stock_quantity integer DEFAULT 0 NOT NULL,
    rating numeric(2,1) DEFAULT 0.0
);


--
-- Name: religious_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.religious_services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(100),
    venue text,
    service_time timestamp with time zone NOT NULL,
    denomination character varying(100),
    capacity integer,
    description text
);


--
-- Name: service_registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_registrations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    service_id uuid NOT NULL,
    registration_time timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wallet_id uuid NOT NULL,
    type public.transaction_type NOT NULL,
    status public.transaction_status DEFAULT 'pending'::public.transaction_status NOT NULL,
    amount numeric(15,2) NOT NULL,
    description text,
    related_user_id uuid,
    related_entity_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT transactions_amount_check CHECK ((amount > (0)::numeric))
);


--
-- Name: travel_packages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.travel_packages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    destination character varying(255) NOT NULL,
    image_url text,
    price numeric(15,2) NOT NULL,
    currency character varying(3) DEFAULT 'NGN'::character varying NOT NULL,
    duration character varying(100),
    description text,
    highlights text[],
    rating numeric(2,1) DEFAULT 0.0,
    is_available boolean DEFAULT true NOT NULL
);


--
-- Name: tutors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tutors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    subjects character varying(255)[],
    hourly_rate numeric(10,2),
    rating numeric(2,1) DEFAULT 0.0,
    experience_level character varying(100),
    is_available boolean DEFAULT true NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    avatar_url text,
    bio text,
    phone_number character varying(50),
    role public.user_role DEFAULT 'user'::public.user_role NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: wallets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wallets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    balance numeric(15,2) DEFAULT 0.00 NOT NULL,
    currency character varying(3) DEFAULT 'NGN'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT wallets_balance_check CHECK ((balance >= (0)::numeric))
);


--
-- Data for Name: ad_banners; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: campaigns; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: donations; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: emergency_reports; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: pending_requests; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: post_likes; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: private_messages; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: religious_services; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: service_registrations; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: travel_packages; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: tutors; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tutors (id, user_id, subjects, hourly_rate, rating, experience_level, is_available) VALUES ('778edc6f-686c-48ad-b86f-02cf3a6b24ac', '35441034-2f6b-45f3-806d-f3f95833c788', '{}', 0.00, 0.0, 'Beginner', true);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users (id, email, password_hash, full_name, avatar_url, bio, phone_number, role, is_verified, created_at, updated_at) VALUES ('7dd87462-e955-4f38-b6ee-e85be086944e', 'tvupele@gmail.com', '$2b$10$Vn74uJxYJHDQk7/XlPTuzuLAuZYM/n2T3LgIgnOrqJB.nHZxjs1Te', 'Tavershima Upele', NULL, NULL, NULL, 'user', false, '2026-03-31 23:17:42.112644+01', '2026-03-31 23:17:42.112644+01');
INSERT INTO public.users (id, email, password_hash, full_name, avatar_url, bio, phone_number, role, is_verified, created_at, updated_at) VALUES ('96532dae-dea1-41b8-98c1-226ff312705f', 'upeletavershima@gmail.com', '$2b$10$cx47nGPJrJ5pIoCLDv0eieBS4/TA1y2/OriWRxI/hfyNTXtTBdXDm', 'Upele George', NULL, NULL, NULL, 'user', false, '2026-04-02 00:06:44.019258+01', '2026-04-02 00:06:44.019258+01');
INSERT INTO public.users (id, email, password_hash, full_name, avatar_url, bio, phone_number, role, is_verified, created_at, updated_at) VALUES ('35441034-2f6b-45f3-806d-f3f95833c788', 'george.upele@miva.edu.ng', '$2b$10$5.t2DdrCkNqd5Ld8pm6ovea/2wq6uC3WKMeIMVlfavabijP2ISoby', 'George Upele', NULL, NULL, NULL, 'admin', false, '2026-04-02 00:49:02.497007+01', '2026-04-02 09:03:29.001045+01');


--
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.wallets (id, user_id, balance, currency, created_at, updated_at) VALUES ('31bcc311-0967-4eac-afce-b2a07902e96f', '35441034-2f6b-45f3-806d-f3f95833c788', 0.00, 'NGN', '2026-04-02 00:49:02.517846+01', '2026-04-02 00:49:02.517846+01');


--
-- Name: ad_banners ad_banners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ad_banners
    ADD CONSTRAINT ad_banners_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: donations donations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_pkey PRIMARY KEY (id);


--
-- Name: emergency_reports emergency_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emergency_reports
    ADD CONSTRAINT emergency_reports_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: pending_requests pending_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_requests
    ADD CONSTRAINT pending_requests_pkey PRIMARY KEY (id);


--
-- Name: pending_requests pending_requests_user_id_request_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_requests
    ADD CONSTRAINT pending_requests_user_id_request_type_key UNIQUE (user_id, request_type);


--
-- Name: post_likes post_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_pkey PRIMARY KEY (user_id, post_id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: private_messages private_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.private_messages
    ADD CONSTRAINT private_messages_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: religious_services religious_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.religious_services
    ADD CONSTRAINT religious_services_pkey PRIMARY KEY (id);


--
-- Name: service_registrations service_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_registrations
    ADD CONSTRAINT service_registrations_pkey PRIMARY KEY (id);


--
-- Name: service_registrations service_registrations_user_id_service_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_registrations
    ADD CONSTRAINT service_registrations_user_id_service_id_key UNIQUE (user_id, service_id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: travel_packages travel_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.travel_packages
    ADD CONSTRAINT travel_packages_pkey PRIMARY KEY (id);


--
-- Name: tutors tutors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutors
    ADD CONSTRAINT tutors_pkey PRIMARY KEY (id);


--
-- Name: tutors tutors_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutors
    ADD CONSTRAINT tutors_user_id_key UNIQUE (user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (id);


--
-- Name: wallets wallets_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_key UNIQUE (user_id);


--
-- Name: idx_bookings_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_user_id ON public.bookings USING btree (user_id);


--
-- Name: idx_comments_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_post_id ON public.comments USING btree (post_id);


--
-- Name: idx_comments_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_user_id ON public.comments USING btree (user_id);


--
-- Name: idx_donations_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_donations_campaign_id ON public.donations USING btree (campaign_id);


--
-- Name: idx_emergency_reports_reporter_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_emergency_reports_reporter_id ON public.emergency_reports USING btree (reporter_id);


--
-- Name: idx_posts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_user_id ON public.posts USING btree (user_id);


--
-- Name: idx_transactions_wallet_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transactions_wallet_id ON public.transactions USING btree (wallet_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: wallets update_wallets_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: bookings bookings_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id);


--
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: campaigns campaigns_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.users(id);


--
-- Name: comments comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: donations donations_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);


--
-- Name: donations donations_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id);


--
-- Name: donations donations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: emergency_reports emergency_reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emergency_reports
    ADD CONSTRAINT emergency_reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id);


--
-- Name: pending_requests pending_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_requests
    ADD CONSTRAINT pending_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: post_likes post_likes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_likes post_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: posts posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: private_messages private_messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.private_messages
    ADD CONSTRAINT private_messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: private_messages private_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.private_messages
    ADD CONSTRAINT private_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: products products_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.users(id);


--
-- Name: service_registrations service_registrations_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_registrations
    ADD CONSTRAINT service_registrations_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.religious_services(id);


--
-- Name: service_registrations service_registrations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_registrations
    ADD CONSTRAINT service_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: transactions transactions_related_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_related_user_id_fkey FOREIGN KEY (related_user_id) REFERENCES public.users(id);


--
-- Name: transactions transactions_wallet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.wallets(id);


--
-- Name: tutors tutors_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutors
    ADD CONSTRAINT tutors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: wallets wallets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

--\unrestrict bkVYoDHkdAx252hQ45dLMjJicCeTcz8IDdT2fr5sUBZXxd51dUD1iWhTHIbmf8S

