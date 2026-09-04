// =============================================================================
// GridNova Shared Domain Types (Frontend)
// Conforms to TRD Section 7, 8, 9, 15, 17, 68, 69
// =============================================================================

export type UserRole = 'citizen' | 'admin';

export type EnergyStatus = 'surplus' | 'deficit' | 'balanced';

export type ListingStatus = 'active' | 'partially_filled' | 'completed' | 'cancelled' | 'expired';

export type TradeStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type BlockchainTxStatus = 'pending' | 'confirmed' | 'failed';

export type InsightType =
  | 'energy_forecast'
  | 'trade_recommendation'
  | 'price_recommendation'
  | 'neighbourhood_insight';

export type NotificationType = 'trade' | 'energy' | 'ai' | 'system';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  wallet_balance: number; // in ₹
  created_at: string;
  updated_at?: string;
}

export interface House {
  id: string;
  owner_id: string;
  house_name: string;
  address_label: string;
  solar_capacity_kw: number;
  battery_capacity_kwh: number;
  battery_level_kwh: number;
  created_at: string;
  updated_at?: string;
}

export interface EnergyReading {
  id: string;
  house_id: string;
  generation_kwh: number;
  consumption_kwh: number;
  battery_charge_kwh: number;
  battery_discharge_kwh: number;
  net_energy_kwh: number;
  recorded_at: string;
  source: 'simulation' | 'iot_smart_meter';
}

export interface EnergyListing {
  id: string;
  seller_id: string;
  house_id: string;
  energy_amount_kwh: number;
  remaining_energy_kwh: number;
  price_per_kwh: number;
  status: ListingStatus;
  created_at: string;
  expires_at: string;
  seller?: {
    full_name: string;
    email: string;
  };
  house?: {
    house_name: string;
    address_label: string;
    solar_capacity_kw: number;
  };
}

export interface Trade {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  energy_kwh: number;
  price_per_kwh: number;
  total_amount: number;
  status: TradeStatus;
  created_at: string;
  completed_at?: string;
  buyer?: {
    full_name: string;
    email: string;
  };
  seller?: {
    full_name: string;
    email: string;
  };
  blockchain_tx?: BlockchainTransaction;
}

export interface BlockchainTransaction {
  id: string;
  trade_id: string;
  transaction_hash: string;
  block_number: number;
  network: string;
  transaction_type: string;
  status: BlockchainTxStatus;
  created_at: string;
  confirmed_at?: string;
}

export interface AIInsight<T = unknown> {
  id: string;
  user_id?: string;
  house_id?: string;
  insight_type: InsightType;
  input_snapshot: Record<string, unknown>;
  result: T;
  created_at: string;
  expires_at: string;
}

export interface EnergyForecastResult {
  predicted_generation_kwh: number;
  predicted_consumption_kwh: number;
  expected_surplus_kwh: number;
  confidence: number;
  reasoning: string;
}

export interface TradeRecommendationResult {
  recommendation: 'sell' | 'buy' | 'hold';
  recommended_amount_kwh: number;
  recommended_price_per_kwh: number;
  confidence: number;
  reason: string;
}

export interface PriceRecommendationResult {
  recommended_price_per_kwh: number;
  confidence: number;
  reason: string;
}

export interface NeighbourhoodInsightResult {
  headline: string;
  summary: string;
  key_findings: string[];
  recommended_actions: string[];
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export interface HouseEnergyState {
  house: House;
  owner: UserProfile;
  latest_reading: EnergyReading;
  status: EnergyStatus;
  surplus_kwh: number;
  deficit_kwh: number;
  active_listings_kwh: number;
  available_to_sell_kwh: number;
}

export interface NeighbourhoodState {
  timestamp: string;
  time_of_day_hour: number;
  time_label: string;
  total_generation_kwh: number;
  total_consumption_kwh: number;
  net_surplus_kwh: number;
  net_deficit_kwh: number;
  houses: HouseEnergyState[];
  active_listings_count: number;
  total_energy_listed_kwh: number;
  total_trades_count: number;
  total_trading_volume_inr: number;
}
