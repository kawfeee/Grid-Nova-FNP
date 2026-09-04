// =============================================================================
// GridNova Seed Data (Matches supabase/seed.sql)
// Conforms to Rule 20, 60, 61 and TRD Section 41
// =============================================================================

import {
  BlockchainTransaction,
  EnergyListing,
  EnergyReading,
  House,
  Trade,
  UserProfile,
} from '../types/index.js';

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@gridnova.local',
    full_name: 'Ecosystem Admin',
    role: 'admin',
    wallet_balance: 50000.0,
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'citizena@gridnova.local',
    full_name: 'Aarav Sharma (House A)',
    role: 'citizen',
    wallet_balance: 8500.0,
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'citizenb@gridnova.local',
    full_name: 'Bhavna Patel (House B)',
    role: 'citizen',
    wallet_balance: 4200.0,
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'citizenc@gridnova.local',
    full_name: 'Chirag Sen (House C)',
    role: 'citizen',
    wallet_balance: 6100.0,
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'citizend@gridnova.local',
    full_name: 'Divya Rao (House D)',
    role: 'citizen',
    wallet_balance: 7300.0,
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    email: 'citizene@gridnova.local',
    full_name: 'Eshaan Gupta (House E)',
    role: 'citizen',
    wallet_balance: 3800.0,
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    email: 'citizenf@gridnova.local',
    full_name: 'Fatima Sheikh (House F)',
    role: 'citizen',
    wallet_balance: 3100.0,
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    email: 'citizeng@gridnova.local',
    full_name: 'Gaurav Joshi (House G)',
    role: 'citizen',
    wallet_balance: 5000.0,
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000009',
    email: 'citizenh@gridnova.local',
    full_name: 'Harini Iyer (House H)',
    role: 'citizen',
    wallet_balance: 4600.0,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_HOUSES: House[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    owner_id: '00000000-0000-0000-0000-000000000002',
    house_name: 'Solar Pioneer',
    address_label: '14 Maple Avenue',
    solar_capacity_kw: 6.0,
    battery_capacity_kwh: 10.0,
    battery_level_kwh: 7.5,
    created_at: new Date().toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    owner_id: '00000000-0000-0000-0000-000000000003',
    house_name: 'Green Villa',
    address_label: '18 Maple Avenue',
    solar_capacity_kw: 2.5,
    battery_capacity_kwh: 8.0,
    battery_level_kwh: 3.2,
    created_at: new Date().toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    owner_id: '00000000-0000-0000-0000-000000000004',
    house_name: 'Eco Haven',
    address_label: '22 Oak Boulevard',
    solar_capacity_kw: 4.5,
    battery_capacity_kwh: 10.0,
    battery_level_kwh: 6.0,
    created_at: new Date().toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    owner_id: '00000000-0000-0000-0000-000000000005',
    house_name: 'Sun Crest',
    address_label: '25 Oak Boulevard',
    solar_capacity_kw: 7.0,
    battery_capacity_kwh: 12.0,
    battery_level_kwh: 9.0,
    created_at: new Date().toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    owner_id: '00000000-0000-0000-0000-000000000006',
    house_name: 'Urban Nest',
    address_label: '31 Cedar Lane',
    solar_capacity_kw: 1.5,
    battery_capacity_kwh: 5.0,
    battery_level_kwh: 1.8,
    created_at: new Date().toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000006',
    owner_id: '00000000-0000-0000-0000-000000000007',
    house_name: 'Shadow Terrace',
    address_label: '35 Cedar Lane',
    solar_capacity_kw: 1.0,
    battery_capacity_kwh: 5.0,
    battery_level_kwh: 1.0,
    created_at: new Date().toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000007',
    owner_id: '00000000-0000-0000-0000-000000000008',
    house_name: 'Oak Cottage',
    address_label: '42 Willow Way',
    solar_capacity_kw: 3.5,
    battery_capacity_kwh: 7.0,
    battery_level_kwh: 4.0,
    created_at: new Date().toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000008',
    owner_id: '00000000-0000-0000-0000-000000000009',
    house_name: 'Pine Ridge',
    address_label: '46 Willow Way',
    solar_capacity_kw: 3.0,
    battery_capacity_kwh: 7.0,
    battery_level_kwh: 3.5,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_READINGS: EnergyReading[] = [
  {
    id: 'read-001',
    house_id: '10000000-0000-0000-0000-000000000001',
    generation_kwh: 5.8,
    consumption_kwh: 2.0,
    battery_charge_kwh: 1.1,
    battery_discharge_kwh: 0.0,
    net_energy_kwh: 3.8, // +3.8 kWh Surplus
    recorded_at: new Date().toISOString(),
    source: 'simulation',
  },
  {
    id: 'read-002',
    house_id: '10000000-0000-0000-0000-000000000002',
    generation_kwh: 1.4,
    consumption_kwh: 3.5,
    battery_charge_kwh: 0.0,
    battery_discharge_kwh: 0.8,
    net_energy_kwh: -2.1, // -2.1 kWh Deficit
    recorded_at: new Date().toISOString(),
    source: 'simulation',
  },
  {
    id: 'read-003',
    house_id: '10000000-0000-0000-0000-000000000003',
    generation_kwh: 4.2,
    consumption_kwh: 3.0,
    battery_charge_kwh: 0.3,
    battery_discharge_kwh: 0.0,
    net_energy_kwh: 1.2, // +1.2 kWh Surplus
    recorded_at: new Date().toISOString(),
    source: 'simulation',
  },
  {
    id: 'read-004',
    house_id: '10000000-0000-0000-0000-000000000004',
    generation_kwh: 6.5,
    consumption_kwh: 2.0,
    battery_charge_kwh: 1.3,
    battery_discharge_kwh: 0.0,
    net_energy_kwh: 4.5, // +4.5 kWh Surplus
    recorded_at: new Date().toISOString(),
    source: 'simulation',
  },
  {
    id: 'read-005',
    house_id: '10000000-0000-0000-0000-000000000005',
    generation_kwh: 1.1,
    consumption_kwh: 3.2,
    battery_charge_kwh: 0.0,
    battery_discharge_kwh: 0.7,
    net_energy_kwh: -2.1, // -2.1 kWh Deficit
    recorded_at: new Date().toISOString(),
    source: 'simulation',
  },
  {
    id: 'read-006',
    house_id: '10000000-0000-0000-0000-000000000006',
    generation_kwh: 0.8,
    consumption_kwh: 4.0,
    battery_charge_kwh: 0.0,
    battery_discharge_kwh: 0.5,
    net_energy_kwh: -3.2, // -3.2 kWh Deficit
    recorded_at: new Date().toISOString(),
    source: 'simulation',
  },
  {
    id: 'read-007',
    house_id: '10000000-0000-0000-0000-000000000007',
    generation_kwh: 2.8,
    consumption_kwh: 2.8,
    battery_charge_kwh: 0.0,
    battery_discharge_kwh: 0.0,
    net_energy_kwh: 0.0, // 0.0 kWh Balanced
    recorded_at: new Date().toISOString(),
    source: 'simulation',
  },
  {
    id: 'read-008',
    house_id: '10000000-0000-0000-0000-000000000008',
    generation_kwh: 2.2,
    consumption_kwh: 3.0,
    battery_charge_kwh: 0.0,
    battery_discharge_kwh: 0.3,
    net_energy_kwh: -0.8, // -0.8 kWh Deficit
    recorded_at: new Date().toISOString(),
    source: 'simulation',
  },
];

export const INITIAL_LISTINGS: EnergyListing[] = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    seller_id: '00000000-0000-0000-0000-000000000002', // Aarav Sharma (House A)
    house_id: '10000000-0000-0000-0000-000000000001',
    energy_amount_kwh: 3.0,
    remaining_energy_kwh: 3.0,
    price_per_kwh: 6.5,
    status: 'active',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    seller: {
      full_name: 'Aarav Sharma (House A)',
      email: 'citizena@gridnova.local',
    },
    house: {
      house_name: 'Solar Pioneer',
      address_label: '14 Maple Avenue',
      solar_capacity_kw: 6.0,
    },
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    seller_id: '00000000-0000-0000-0000-000000000004', // Chirag Sen (House C)
    house_id: '10000000-0000-0000-0000-000000000003',
    energy_amount_kwh: 1.0,
    remaining_energy_kwh: 1.0,
    price_per_kwh: 6.2,
    status: 'active',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    seller: {
      full_name: 'Chirag Sen (House C)',
      email: 'citizenc@gridnova.local',
    },
    house: {
      house_name: 'Eco Haven',
      address_label: '22 Oak Boulevard',
      solar_capacity_kw: 4.5,
    },
  },
  {
    id: '20000000-0000-0000-0000-000000000003',
    seller_id: '00000000-0000-0000-0000-000000000005', // Divya Rao (House D)
    house_id: '10000000-0000-0000-0000-000000000004',
    energy_amount_kwh: 4.0,
    remaining_energy_kwh: 4.0,
    price_per_kwh: 6.8,
    status: 'active',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    seller: {
      full_name: 'Divya Rao (House D)',
      email: 'citizend@gridnova.local',
    },
    house: {
      house_name: 'Sun Crest',
      address_label: '25 Oak Boulevard',
      solar_capacity_kw: 7.0,
    },
  },
];

export const INITIAL_TRADES: Trade[] = [
  {
    id: '30000000-0000-0000-0000-000000000001',
    buyer_id: '00000000-0000-0000-0000-000000000003', // Bhavna Patel
    seller_id: '00000000-0000-0000-0000-000000000002', // Aarav Sharma
    listing_id: '20000000-0000-0000-0000-000000000001',
    energy_kwh: 2.0,
    price_per_kwh: 6.5,
    total_amount: 13.0,
    status: 'completed',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    completed_at: new Date(Date.now() - 3540000).toISOString(),
    buyer: {
      full_name: 'Bhavna Patel (House B)',
      email: 'citizenb@gridnova.local',
    },
    seller: {
      full_name: 'Aarav Sharma (House A)',
      email: 'citizena@gridnova.local',
    },
  },
];

export const INITIAL_BLOCKCHAIN_TXS: BlockchainTransaction[] = [
  {
    id: 'tx-001',
    trade_id: '30000000-0000-0000-0000-000000000001',
    transaction_hash: '0x8f3a19dc2b7e54c8a164fe904128a301c24719baee43f2a89c92e104d53891bc',
    block_number: 12842,
    network: 'GridNova Test Network',
    transaction_type: 'P2P_ENERGY_TRANSFER',
    status: 'confirmed',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    confirmed_at: new Date(Date.now() - 3540000).toISOString(),
  },
];
