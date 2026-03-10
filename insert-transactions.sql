-- ============================================
-- Run this in your Supabase SQL Editor
-- This adds withdrawal transactions for the registered user
-- ============================================

-- 1. First, update the status constraint to allow 'on_hold'
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_status_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_status_check
    CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'on_hold'));

-- 2. Get the user ID (this gets the first registered user)
-- If you have multiple users, replace the subquery with your specific user ID

-- 3. Insert withdrawal transactions for this month
INSERT INTO transactions (user_id, type, asset_symbol, asset_name, amount, price_per_unit, total_usd, fee_usd, status, created_at)
SELECT
    id as user_id,
    'withdrawal' as type,
    'BTC' as asset_symbol,
    'Bitcoin' as asset_name,
    2.2100 as amount,
    67842.30 as price_per_unit,
    150000.00 as total_usd,
    375.00 as fee_usd,
    'pending' as status,
    '2026-03-02 09:15:00+00' as created_at
FROM profiles LIMIT 1;

INSERT INTO transactions (user_id, type, asset_symbol, asset_name, amount, price_per_unit, total_usd, fee_usd, status, created_at)
SELECT
    id as user_id,
    'withdrawal' as type,
    'ETH' as asset_symbol,
    'Ethereum' as asset_name,
    42.6000 as amount,
    3521.18 as price_per_unit,
    150000.00 as total_usd,
    375.00 as fee_usd,
    'on_hold' as status,
    '2026-03-04 14:32:00+00' as created_at
FROM profiles LIMIT 1;

INSERT INTO transactions (user_id, type, asset_symbol, asset_name, amount, price_per_unit, total_usd, fee_usd, status, created_at)
SELECT
    id as user_id,
    'withdrawal' as type,
    'BTC' as asset_symbol,
    'Bitcoin' as asset_name,
    3.6800 as amount,
    67842.30 as price_per_unit,
    250000.00 as total_usd,
    625.00 as fee_usd,
    'on_hold' as status,
    '2026-03-05 11:47:00+00' as created_at
FROM profiles LIMIT 1;

INSERT INTO transactions (user_id, type, asset_symbol, asset_name, amount, price_per_unit, total_usd, fee_usd, status, created_at)
SELECT
    id as user_id,
    'withdrawal' as type,
    'SOL' as asset_symbol,
    'Solana' as asset_name,
    841.2000 as amount,
    142.65 as price_per_unit,
    120000.00 as total_usd,
    300.00 as fee_usd,
    'on_hold' as status,
    '2026-03-06 16:20:00+00' as created_at
FROM profiles LIMIT 1;

INSERT INTO transactions (user_id, type, asset_symbol, asset_name, amount, price_per_unit, total_usd, fee_usd, status, created_at)
SELECT
    id as user_id,
    'withdrawal' as type,
    'ETH' as asset_symbol,
    'Ethereum' as asset_name,
    25.5600 as amount,
    3521.18 as price_per_unit,
    90000.00 as total_usd,
    225.00 as fee_usd,
    'on_hold' as status,
    '2026-03-07 08:55:00+00' as created_at
FROM profiles LIMIT 1;

INSERT INTO transactions (user_id, type, asset_symbol, asset_name, amount, price_per_unit, total_usd, fee_usd, status, created_at)
SELECT
    id as user_id,
    'withdrawal' as type,
    'BTC' as asset_symbol,
    'Bitcoin' as asset_name,
    1.1800 as amount,
    67842.30 as price_per_unit,
    80000.00 as total_usd,
    200.00 as fee_usd,
    'pending' as status,
    '2026-03-08 13:10:00+00' as created_at
FROM profiles LIMIT 1;

INSERT INTO transactions (user_id, type, asset_symbol, asset_name, amount, price_per_unit, total_usd, fee_usd, status, created_at)
SELECT
    id as user_id,
    'withdrawal' as type,
    'USDT' as asset_symbol,
    'Tether' as asset_name,
    65000.0000 as amount,
    1.00 as price_per_unit,
    65000.00 as total_usd,
    162.50 as fee_usd,
    'on_hold' as status,
    '2026-03-09 10:30:00+00' as created_at
FROM profiles LIMIT 1;

INSERT INTO transactions (user_id, type, asset_symbol, asset_name, amount, price_per_unit, total_usd, fee_usd, status, created_at)
SELECT
    id as user_id,
    'withdrawal' as type,
    'XRP' as asset_symbol,
    'XRP' as asset_name,
    75862.0000 as amount,
    0.58 as price_per_unit,
    44000.00 as total_usd,
    110.00 as fee_usd,
    'on_hold' as status,
    '2026-03-10 07:45:00+00' as created_at
FROM profiles LIMIT 1;
