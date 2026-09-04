// =============================================================================
// GridNova Frontend API Client
// Conforms to Rules 26, 47, 51, 60, 61, 64
// =============================================================================

import {
  BlockchainTransaction,
  EnergyForecastResult,
  EnergyListing,
  EnergyReading,
  House,
  HouseEnergyState,
  NeighbourhoodInsightResult,
  NeighbourhoodState,
  PriceRecommendationResult,
  Trade,
  TradeRecommendationResult,
  UserProfile,
} from '../types';

const API_BASE = '/api';

export class ApiClient {
  private currentUserId: string = '00000000-0000-0000-0000-000000000002'; // Default to Citizen A

  constructor() {
    const saved = localStorage.getItem('gridnova_user_id');
    if (saved) {
      this.currentUserId = saved;
    }
  }

  public setUserId(userId: string): void {
    this.currentUserId = userId;
    localStorage.setItem('gridnova_user_id', userId);
  }

  public getUserId(): string {
    return this.currentUserId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-id': this.currentUserId,
      Authorization: `Bearer ${this.currentUserId}`,
      ...((options.headers as Record<string, string>) || {}),
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const message = data.error?.message || `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return data.data as T;
  }

  // --- Auth ---
  public async getDemoUsers(): Promise<(UserProfile & { tag: string; houseName: string })[]> {
    return this.request('/auth/demo-users');
  }

  public async login(email: string): Promise<{ user: UserProfile; token: string }> {
    const result = await this.request<{ user: UserProfile; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    this.setUserId(result.user.id);
    return result;
  }

  public async getMe(): Promise<{ user: UserProfile; house: House | null; houseEnergyState: HouseEnergyState | null }> {
    return this.request('/me');
  }

  // --- Energy & Smart Meter ---
  public async getCurrentEnergy(): Promise<HouseEnergyState> {
    return this.request('/energy/current');
  }

  public async getEnergyHistory(houseId: string): Promise<EnergyReading[]> {
    return this.request(`/energy/history/${houseId}`);
  }

  // --- Simulation ---
  public async getSimulationState(): Promise<NeighbourhoodState> {
    return this.request('/simulation/state');
  }

  public async stepSimulation(): Promise<NeighbourhoodState> {
    return this.request('/simulation/step', { method: 'POST' });
  }

  public async setSimulationTime(hour: number): Promise<NeighbourhoodState> {
    return this.request('/simulation/time', {
      method: 'POST',
      body: JSON.stringify({ hour }),
    });
  }

  public async resetSimulation(): Promise<NeighbourhoodState> {
    return this.request('/simulation/reset', { method: 'POST' });
  }

  // --- Marketplace Listings ---
  public async getListings(): Promise<EnergyListing[]> {
    return this.request('/listings');
  }

  public async createListing(energyAmountKwh: number, pricePerKwh: number): Promise<EnergyListing> {
    return this.request('/listings', {
      method: 'POST',
      body: JSON.stringify({ energyAmountKwh, pricePerKwh }),
    });
  }

  // --- Trades ---
  public async executeTrade(listingId: string, energyKwh: number): Promise<Trade> {
    return this.request('/trades', {
      method: 'POST',
      body: JSON.stringify({ listingId, energyKwh }),
    });
  }

  public async getTrades(): Promise<Trade[]> {
    return this.request('/trades');
  }

  // --- Mock Blockchain Ledger ---
  public async getBlockchainTransactions(): Promise<BlockchainTransaction[]> {
    return this.request('/blockchain/transactions');
  }

  public async getBlockchainTxByHash(hash: string): Promise<BlockchainTransaction> {
    return this.request(`/blockchain/transactions/${encodeURIComponent(hash)}`);
  }

  // --- Gemini AI Advisory ---
  public async getEnergyForecast(): Promise<EnergyForecastResult> {
    return this.request('/ai/forecast', { method: 'POST' });
  }

  public async getTradeRecommendation(): Promise<TradeRecommendationResult> {
    return this.request('/ai/trade-recommendation', { method: 'POST' });
  }

  public async getPriceRecommendation(): Promise<PriceRecommendationResult> {
    return this.request('/ai/price-recommendation', { method: 'POST' });
  }

  public async getNeighbourhoodInsight(): Promise<NeighbourhoodInsightResult> {
    return this.request('/ai/neighbourhood-insight');
  }

  // --- Admin ---
  public async getAdminDashboard(): Promise<{
    metrics: {
      totalCitizens: number;
      totalHouses: number;
      totalGenerationKwh: number;
      totalConsumptionKwh: number;
      netSurplusKwh: number;
      netDeficitKwh: number;
      activeListingsCount: number;
      completedTradesCount: number;
      totalTradingVolumeInr: number;
    };
    neighbourhoodState: NeighbourhoodState;
    recentTrades: Trade[];
    blockchainLedger: BlockchainTransaction[];
  }> {
    return this.request('/admin/dashboard');
  }
}

export const api = new ApiClient();
