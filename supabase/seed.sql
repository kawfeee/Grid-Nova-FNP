-- =============================================================================
-- GridNova MVP - Seed Data
-- 8 Neighbourhood Houses (Surplus, Deficit, Balanced), Demo Accounts,
-- Initial Smart Meter Readings, Active Listings, and Blockchain Records
-- =============================================================================

-- Deterministic UUIDs for Demo Accounts
-- Admin
INSERT INTO profiles (id, email, full_name, role, wallet_balance)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin@gridnova.local', 'Ecosystem Admin', 'admin', 50000.00)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- Citizen A (Primary Demo Prosumer - High Surplus)
INSERT INTO profiles (id, email, full_name, role, wallet_balance)
VALUES ('00000000-0000-0000-0000-000000000002', 'citizena@gridnova.local', 'Aarav Sharma (House A)', 'citizen', 8500.00)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- Citizen B (Primary Demo Consumer - Deficit)
INSERT INTO profiles (id, email, full_name, role, wallet_balance)
VALUES ('00000000-0000-0000-0000-000000000003', 'citizenb@gridnova.local', 'Bhavna Patel (House B)', 'citizen', 4200.00)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- Citizens C - H
INSERT INTO profiles (id, email, full_name, role, wallet_balance) VALUES
('00000000-0000-0000-0000-000000000004', 'citizenc@gridnova.local', 'Chirag Sen (House C)', 'citizen', 6100.00),
('00000000-0000-0000-0000-000000000005', 'citizend@gridnova.local', 'Divya Rao (House D)', 'citizen', 7300.00),
('00000000-0000-0000-0000-000000000006', 'citizene@gridnova.local', 'Eshaan Gupta (House E)', 'citizen', 3800.00),
('00000000-0000-0000-0000-000000000007', 'citizenf@gridnova.local', 'Fatima Sheikh (House F)', 'citizen', 3100.00),
('00000000-0000-0000-0000-000000000008', 'citizeng@gridnova.local', 'Gaurav Joshi (House G)', 'citizen', 5000.00),
('00000000-0000-0000-0000-000000000009', 'citizenh@gridnova.local', 'Harini Iyer (House H)', 'citizen', 4600.00)
ON CONFLICT (id) DO NOTHING;

-- Houses
INSERT INTO houses (id, owner_id, house_name, address_label, solar_capacity_kw, battery_capacity_kwh, battery_level_kwh) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Solar Pioneer', '14 Maple Avenue', 6.0, 10.0, 7.5),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'Green Villa', '18 Maple Avenue', 2.5, 8.0, 3.2),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'Eco Haven', '22 Oak Boulevard', 4.5, 10.0, 6.0),
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', 'Sun Crest', '25 Oak Boulevard', 7.0, 12.0, 9.0),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000006', 'Urban Nest', '31 Cedar Lane', 1.5, 5.0, 1.8),
('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000007', 'Shadow Terrace', '35 Cedar Lane', 1.0, 5.0, 1.0),
('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000008', 'Oak Cottage', '42 Willow Way', 3.5, 7.0, 4.0),
('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000009', 'Pine Ridge', '46 Willow Way', 3.0, 7.0, 3.5)
ON CONFLICT (id) DO NOTHING;

-- Initial Smart Meter Energy Readings (Simulated 14:00 Afternoon sun)
-- House A: Gen 5.8, Con 2.0 -> Net +3.8 (Surplus)
-- House B: Gen 1.4, Con 3.5 -> Net -2.1 (Deficit)
-- House C: Gen 4.2, Con 3.0 -> Net +1.2 (Surplus)
-- House D: Gen 6.5, Con 2.0 -> Net +4.5 (Surplus)
-- House E: Gen 1.1, Con 3.2 -> Net -2.1 (Deficit)
-- House F: Gen 0.8, Con 4.0 -> Net -3.2 (Deficit)
-- House G: Gen 2.8, Con 2.8 -> Net  0.0 (Balanced)
-- House H: Gen 2.2, Con 3.0 -> Net -0.8 (Deficit)
INSERT INTO energy_readings (house_id, generation_kwh, consumption_kwh, net_energy_kwh, recorded_at, source) VALUES
('10000000-0000-0000-0000-000000000001', 5.8, 2.0, 3.8, NOW(), 'simulation'),
('10000000-0000-0000-0000-000000000002', 1.4, 3.5, -2.1, NOW(), 'simulation'),
('10000000-0000-0000-0000-000000000003', 4.2, 3.0, 1.2, NOW(), 'simulation'),
('10000000-0000-0000-0000-000000000004', 6.5, 2.0, 4.5, NOW(), 'simulation'),
('10000000-0000-0000-0000-000000000005', 1.1, 3.2, -2.1, NOW(), 'simulation'),
('10000000-0000-0000-0000-000000000006', 0.8, 4.0, -3.2, NOW(), 'simulation'),
('10000000-0000-0000-0000-000000000007', 2.8, 2.8, 0.0, NOW(), 'simulation'),
('10000000-0000-0000-0000-000000000008', 2.2, 3.0, -0.8, NOW(), 'simulation');

-- Seed Active Energy Listings in Marketplace
-- House A lists 3.0 kWh at ₹6.50/kWh
-- House C lists 1.0 kWh at ₹6.20/kWh
-- House D lists 4.0 kWh at ₹6.80/kWh
INSERT INTO energy_listings (id, seller_id, house_id, energy_amount_kwh, remaining_energy_kwh, price_per_kwh, status) VALUES
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 3.0, 3.0, 6.50, 'active'),
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 1.0, 1.0, 6.20, 'active'),
('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000004', 4.0, 4.0, 6.80, 'active')
ON CONFLICT (id) DO NOTHING;

-- Seed a completed trade and mock blockchain transaction for realistic initial history
INSERT INTO trades (id, buyer_id, seller_id, listing_id, energy_kwh, price_per_kwh, total_amount, status, created_at, completed_at)
VALUES (
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003', -- Buyer: Citizen B
    '00000000-0000-0000-0000-000000000002', -- Seller: Citizen A
    '20000000-0000-0000-0000-000000000001',
    2.0,
    6.50,
    13.00,
    'completed',
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '59 minutes'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO blockchain_transactions (trade_id, transaction_hash, block_number, network, transaction_type, status, created_at, confirmed_at)
VALUES (
    '30000000-0000-0000-0000-000000000001',
    '0x8f3a19dc2b7e54c8a164fe904128a301c24719baee43f2a89c92e104d53891bc',
    12842,
    'GridNova Test Network',
    'P2P_ENERGY_TRANSFER',
    'confirmed',
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '59 minutes'
) ON CONFLICT (transaction_hash) DO NOTHING;
