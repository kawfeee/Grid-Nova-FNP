-- =============================================================================
-- GridNova MVP - Database Schema Migration
-- Matches TRD Section 7 & PRD Specifications
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('citizen', 'admin')) DEFAULT 'citizen',
    avatar_url TEXT,
    wallet_balance NUMERIC(10, 2) NOT NULL DEFAULT 5000.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Houses Table
CREATE TABLE IF NOT EXISTS houses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    house_name TEXT NOT NULL,
    address_label TEXT NOT NULL,
    solar_capacity_kw NUMERIC(5, 2) NOT NULL DEFAULT 5.0,
    battery_capacity_kwh NUMERIC(5, 2) NOT NULL DEFAULT 10.0,
    battery_level_kwh NUMERIC(5, 2) NOT NULL DEFAULT 5.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Energy Readings Table (Simulated IoT Smart Meter)
CREATE TABLE IF NOT EXISTS energy_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
    generation_kwh NUMERIC(6, 2) NOT NULL,
    consumption_kwh NUMERIC(6, 2) NOT NULL,
    battery_charge_kwh NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    battery_discharge_kwh NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    net_energy_kwh NUMERIC(6, 2) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source TEXT NOT NULL DEFAULT 'simulation'
);

-- 4. Energy Listings Table (P2P Marketplace)
CREATE TABLE IF NOT EXISTS energy_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
    energy_amount_kwh NUMERIC(6, 2) NOT NULL CHECK (energy_amount_kwh > 0),
    remaining_energy_kwh NUMERIC(6, 2) NOT NULL CHECK (remaining_energy_kwh >= 0),
    price_per_kwh NUMERIC(6, 2) NOT NULL CHECK (price_per_kwh > 0),
    status TEXT NOT NULL CHECK (status IN ('active', 'partially_filled', 'completed', 'cancelled', 'expired')) DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

-- 5. Trades Table
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES energy_listings(id) ON DELETE CASCADE,
    energy_kwh NUMERIC(6, 2) NOT NULL CHECK (energy_kwh > 0),
    price_per_kwh NUMERIC(6, 2) NOT NULL CHECK (price_per_kwh > 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount > 0),
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 6. Mock Blockchain Transactions Table
CREATE TABLE IF NOT EXISTS blockchain_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
    transaction_hash TEXT NOT NULL UNIQUE,
    block_number BIGINT NOT NULL,
    network TEXT NOT NULL DEFAULT 'GridNova Test Network',
    transaction_type TEXT NOT NULL DEFAULT 'P2P_ENERGY_TRANSFER',
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'failed')) DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ
);

-- 7. AI Insights Table (Cached Gemini Outputs)
CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    house_id UUID REFERENCES houses(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('energy_forecast', 'trade_recommendation', 'price_recommendation', 'neighbourhood_insight')),
    input_snapshot JSONB NOT NULL,
    result JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour')
);

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('trade', 'energy', 'ai', 'system')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for high performance queries
CREATE INDEX IF NOT EXISTS idx_readings_house_time ON energy_readings(house_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_active ON energy_listings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trades_participants ON trades(buyer_id, seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blockchain_hash ON blockchain_transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_insights_type_house ON ai_insights(house_id, insight_type, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Users can view all profiles in neighborhood, but only edit their own
CREATE POLICY "Profiles are viewable by all users" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Houses: Viewable by all in neighborhood, editable by owner
CREATE POLICY "Houses are viewable by all" ON houses FOR SELECT USING (true);
CREATE POLICY "Owners can update own house" ON houses FOR ALL USING (auth.uid() = owner_id);

-- Energy Readings: Viewable by all (for neighbourhood monitor), insertable by service/owner
CREATE POLICY "Energy readings viewable by all" ON energy_readings FOR SELECT USING (true);
CREATE POLICY "Users can insert readings for own house" ON energy_readings FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM houses WHERE houses.id = energy_readings.house_id AND houses.owner_id = auth.uid())
);

-- Listings: Viewable by all, editable by seller
CREATE POLICY "Listings viewable by all" ON energy_listings FOR SELECT USING (true);
CREATE POLICY "Sellers can manage own listings" ON energy_listings FOR ALL USING (auth.uid() = seller_id);

-- Trades: Visible to buyer, seller, and admin
CREATE POLICY "Users can view trades they participate in" ON trades FOR SELECT USING (
    auth.uid() = buyer_id OR auth.uid() = seller_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Blockchain Transactions: Viewable by all (public ledger verification)
CREATE POLICY "Ledger is transparent and viewable by all" ON blockchain_transactions FOR SELECT USING (true);

-- AI Insights: Viewable by owner and admin
CREATE POLICY "AI insights viewable by user or admin" ON ai_insights FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Notifications: Strictly private to user
CREATE POLICY "Notifications viewable only by recipient" ON notifications FOR ALL USING (auth.uid() = user_id);
