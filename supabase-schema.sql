-- ============================================
-- NovoExch Database Schema for Supabase
-- ============================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard → SQL Editor → New Query

-- 1. PROFILES TABLE (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    country TEXT,
    broker_id UUID,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BROKERS TABLE
CREATE TABLE brokers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    title TEXT DEFAULT 'Crypto Broker',
    specialty TEXT,
    experience_years INT DEFAULT 1,
    rating DECIMAL(2,1) DEFAULT 5.0,
    is_available BOOLEAN DEFAULT true,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key to profiles after brokers table exists
ALTER TABLE profiles
    ADD CONSTRAINT fk_broker
    FOREIGN KEY (broker_id) REFERENCES brokers(id);

-- 3. PORTFOLIOS TABLE
CREATE TABLE portfolios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    total_value DECIMAL(18,2) DEFAULT 0,
    total_profit_loss DECIMAL(18,2) DEFAULT 0,
    profit_loss_pct DECIMAL(8,2) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 4. USER ASSETS TABLE
CREATE TABLE user_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    symbol TEXT NOT NULL,
    name TEXT NOT NULL,
    amount DECIMAL(18,8) DEFAULT 0,
    avg_buy_price DECIMAL(18,2) DEFAULT 0,
    current_price DECIMAL(18,2) DEFAULT 0,
    value_usd DECIMAL(18,2) DEFAULT 0,
    change_pct DECIMAL(8,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

-- 5. TRANSACTIONS TABLE
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'swap', 'deposit', 'withdrawal')),
    asset_symbol TEXT,
    asset_name TEXT,
    amount DECIMAL(18,8),
    price_per_unit DECIMAL(18,2),
    total_usd DECIMAL(18,2) NOT NULL,
    fee_usd DECIMAL(18,2) DEFAULT 0,
    swap_to_symbol TEXT,
    swap_to_amount DECIMAL(18,8),
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MARKET PRICES TABLE (for market overview)
CREATE TABLE market_prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symbol TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    price_usd DECIMAL(18,2) NOT NULL,
    change_24h_pct DECIMAL(8,2) DEFAULT 0,
    market_cap DECIMAL(20,2) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- This ensures users can only access their own data

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update only their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Portfolios: users can read only their own
CREATE POLICY "Users can view own portfolio"
    ON portfolios FOR SELECT
    USING (auth.uid() = user_id);

-- User Assets: users can read only their own
CREATE POLICY "Users can view own assets"
    ON user_assets FOR SELECT
    USING (auth.uid() = user_id);

-- Transactions: users can read/insert their own
CREATE POLICY "Users can view own transactions"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Brokers: all authenticated users can view
CREATE POLICY "Authenticated users can view brokers"
    ON brokers FOR SELECT
    USING (auth.role() = 'authenticated');

-- Market prices: everyone can view
CREATE POLICY "Anyone can view market prices"
    ON market_prices FOR SELECT
    USING (true);

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP (TRIGGER)
-- ============================================
-- This automatically creates a profile row when a user signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, email, phone, country)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'country', '')
    );

    -- Create an empty portfolio for the new user
    INSERT INTO public.portfolios (user_id, total_value, total_profit_loss)
    VALUES (NEW.id, 0, 0);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SEED DATA
-- ============================================

-- Insert sample brokers
INSERT INTO brokers (first_name, last_name, title, specialty, experience_years, rating, is_available) VALUES
    ('Sarah', 'Mitchell', 'Senior Crypto Broker', 'BTC, ETH, DeFi', 6, 4.9, true),
    ('James', 'Park', 'Crypto Broker', 'Altcoins, NFTs', 4, 4.7, true),
    ('Elena', 'Rodriguez', 'Senior Crypto Broker', 'OTC, Institutional', 8, 4.8, false),
    ('David', 'Chen', 'Lead Broker', 'BTC, Stablecoins, Yield', 7, 5.0, true);

-- Insert market prices
INSERT INTO market_prices (symbol, name, price_usd, change_24h_pct, market_cap) VALUES
    ('BTC', 'Bitcoin', 67842.30, 5.2, 1330000000000),
    ('ETH', 'Ethereum', 3521.18, 3.8, 423000000000),
    ('SOL', 'Solana', 142.65, 8.1, 63000000000),
    ('ADA', 'Cardano', 0.66, -2.1, 23000000000),
    ('XRP', 'XRP', 0.58, 1.4, 31000000000),
    ('DOT', 'Polkadot', 7.82, -0.9, 10000000000),
    ('USDT', 'Tether', 1.00, 0.0, 95000000000),
    ('USDC', 'USD Coin', 1.00, 0.0, 32000000000);
