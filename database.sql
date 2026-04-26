-- TruNorth Super App Database Schema
-- PostgreSQL

-- Extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types for recurring status values
CREATE TYPE user_role AS ENUM ('user', 'tutor', 'vendor', 'admin');
CREATE TYPE transaction_type AS ENUM ('top-up', 'send', 'receive', 'payment', 'booking');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE emergency_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE report_status AS ENUM ('submitted', 'in-progress', 'resolved');

-- =================================================================
-- Core User and Authentication Tables
-- =================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- To be handled by the backend server
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    phone_number VARCHAR(50),
    role user_role DEFAULT 'user' NOT NULL,
    is_verified BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =================================================================
-- Digital Wallet System
-- =================================================================

CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(15, 2) DEFAULT 0.00 NOT NULL CHECK (balance >= 0),
    currency VARCHAR(3) DEFAULT 'NGN' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id),
    type transaction_type NOT NULL,
    status transaction_status DEFAULT 'pending' NOT NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    description TEXT,
    related_user_id UUID REFERENCES users(id), -- For P2P transfers
    related_entity_id UUID, -- For linking to a product, booking, etc.
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =================================================================
-- Social Network Features
-- =================================================================

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    likes_count INT DEFAULT 0 NOT NULL,
    comments_count INT DEFAULT 0 NOT NULL,
    retweets_count INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE post_likes (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE post_retweets (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE private_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =================================================================
-- Service & E-commerce Modules
-- =================================================================

CREATE TABLE travel_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination VARCHAR(255) NOT NULL,
    image_url TEXT,
    price DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NGN' NOT NULL,
    duration VARCHAR(100),
    description TEXT,
    highlights TEXT[],
    rating DECIMAL(2, 1) DEFAULT 0.0,
    is_available BOOLEAN DEFAULT true NOT NULL
);

CREATE TABLE tutors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subjects VARCHAR(255)[],
    hourly_rate DECIMAL(10, 2),
    rating DECIMAL(2, 1) DEFAULT 0.0,
    experience_level VARCHAR(100),
    is_available BOOLEAN DEFAULT true NOT NULL
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES users(id), -- Assuming vendors are users
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    price DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NGN' NOT NULL,
    category VARCHAR(100),
    stock_quantity INT DEFAULT 0 NOT NULL,
    rating DECIMAL(2, 1) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    image_url TEXT,
    event_date TIMESTAMPTZ NOT NULL,
    location TEXT,
    ticket_price DECIMAL(10, 2),
    total_seats INT,
    available_seats INT,
    category VARCHAR(100) DEFAULT 'General',
    description TEXT,
    is_external BOOLEAN DEFAULT false NOT NULL,
    external_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    goal_amount DECIMAL(15, 2) NOT NULL,
    raised_amount DECIMAL(15, 2) DEFAULT 0.00 NOT NULL,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE religious_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100), -- prayer, sermon, study, event
    venue TEXT,
    service_time TIMESTAMPTZ NOT NULL,
    denomination VARCHAR(100),
    capacity INT,
    description TEXT,
    organizer VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =================================================================
-- Pending Requests (Vendor/Tutor Approval)
-- =================================================================

CREATE TABLE pending_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_type VARCHAR(20) NOT NULL, -- 'vendor' or 'tutor'
    status VARCHAR(20) DEFAULT 'pending' NOT NULL, -- pending, approved, rejected
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id, request_type)
);

-- =================================================================
-- Ad Banners (Admin Managed)
-- =================================================================

CREATE TABLE ad_banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- event, education, religious, donation, travel
    image_url TEXT NOT NULL,
    cta VARCHAR(100) NOT NULL,
    link VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    display_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =================================================================
-- Linking & "Action" Tables
-- =================================================================

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    entity_type VARCHAR(50) NOT NULL, -- 'travel', 'event', 'tutoring'
    entity_id UUID NOT NULL,
    booking_date TIMESTAMPTZ DEFAULT now() NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed', -- confirmed, cancelled
    transaction_id UUID REFERENCES transactions(id)
);

CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id), -- can be null for anonymous
    campaign_id UUID NOT NULL REFERENCES campaigns(id),
    amount DECIMAL(15, 2) NOT NULL,
    is_anonymous BOOLEAN DEFAULT false NOT NULL,
    transaction_id UUID REFERENCES transactions(id),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE service_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    service_id UUID NOT NULL REFERENCES religious_services(id),
    registration_time TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id, service_id)
);

CREATE TABLE emergency_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(100) NOT NULL, -- medical, fire, security
    priority emergency_priority DEFAULT 'medium' NOT NULL,
    location_description TEXT,
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    description TEXT,
    status report_status DEFAULT 'submitted' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    resolved_at TIMESTAMPTZ
);

-- =================================================================
-- Indexes for performance
-- =================================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX idx_emergency_reports_reporter_id ON emergency_reports(reporter_id);

-- =================================================================
-- Trigger function to update 'updated_at' timestamps
-- =================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- End of Schema
