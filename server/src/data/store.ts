// =============================================================================
// GridNova In-Memory Data Store & Supabase Repository Adapter
// Conforms to Rules 11, 12, 13, 14, 20, 37, 48, 60, 61
// =============================================================================

import {
  BlockchainTransaction,
  EnergyListing,
  EnergyReading,
  House,
  HouseEnergyState,
  NeighbourhoodState,
  Trade,
  UserProfile,
} from '../types/index.js';
import {
  INITIAL_BLOCKCHAIN_TXS,
  INITIAL_HOUSES,
  INITIAL_LISTINGS,
  INITIAL_PROFILES,
  INITIAL_READINGS,
  INITIAL_TRADES,
} from './seedData.js';
import { simulationEnergySource } from '../services/simulation/EnergyDataSource.js';

export class Store {
  private profiles: Map<string, UserProfile> = new Map();
  private houses: Map<string, House> = new Map();
  private readings: Map<string, EnergyReading[]> = new Map(); // houseId -> readings
  private listings: Map<string, EnergyListing> = new Map();
  private trades: Map<string, Trade> = new Map();
  private blockchainTxs: Map<string, BlockchainTransaction> = new Map();

  public currentHour: number = 14; // Default: 14:00 (Sunny afternoon)
  public isAutoSimulating: boolean = false;

  constructor() {
    this.resetToSeed();
  }

  /**
   * Resets all store data to pristine seed state (Rule 61: Demo Reset)
   */
  public resetToSeed(): void {
    this.profiles.clear();
    this.houses.clear();
    this.readings.clear();
    this.listings.clear();
    this.trades.clear();
    this.blockchainTxs.clear();
    this.currentHour = 14;
    this.isAutoSimulating = false;

    INITIAL_PROFILES.forEach((p) => this.profiles.set(p.id, { ...p }));
    INITIAL_HOUSES.forEach((h) => this.houses.set(h.id, { ...h }));
    INITIAL_READINGS.forEach((r) => {
      const existing = this.readings.get(r.house_id) || [];
      this.readings.set(r.house_id, [{ ...r }, ...existing]);
    });
    INITIAL_LISTINGS.forEach((l) => this.listings.set(l.id, { ...l }));
    INITIAL_TRADES.forEach((t) => this.trades.set(t.id, { ...t }));
    INITIAL_BLOCKCHAIN_TXS.forEach((tx) => this.blockchainTxs.set(tx.transaction_hash, { ...tx }));
  }

  // --- Profiles ---
  public getProfiles(): UserProfile[] {
    return Array.from(this.profiles.values());
  }

  public getProfileById(id: string): UserProfile | undefined {
    return this.profiles.get(id);
  }

  public getProfileByEmail(email: string): UserProfile | undefined {
    return Array.from(this.profiles.values()).find((p) => p.email.toLowerCase() === email.toLowerCase());
  }

  public createProfile(profile: UserProfile): UserProfile {
    this.profiles.set(profile.id, profile);
    return profile;
  }

  public updateWallet(userId: string, deltaAmount: number): UserProfile {
    const p = this.profiles.get(userId);
    if (!p) throw new Error('User not found');
    p.wallet_balance = Math.round((p.wallet_balance + deltaAmount) * 100) / 100;
    this.profiles.set(userId, p);
    return p;
  }

  // --- Houses ---
  public getHouses(): House[] {
    return Array.from(this.houses.values());
  }

  public getHouseById(id: string): House | undefined {
    return this.houses.get(id);
  }

  public getHouseByOwnerId(ownerId: string): House | undefined {
    return Array.from(this.houses.values()).find((h) => h.owner_id === ownerId);
  }

  // --- Energy Readings (Smart Meter) ---
  public getReadingsForHouse(houseId: string): EnergyReading[] {
    return this.readings.get(houseId) || [];
  }

  public getLatestReading(houseId: string): EnergyReading | undefined {
    const list = this.readings.get(houseId);
    return list && list.length > 0 ? list[0] : undefined;
  }

  public recordReading(reading: EnergyReading): void {
    const list = this.readings.get(reading.house_id) || [];
    this.readings.set(reading.house_id, [reading, ...list.slice(0, 49)]); // keep last 50 readings
  }

  // --- Listings ---
  public getListings(statusFilter?: string): EnergyListing[] {
    const all = Array.from(this.listings.values());
    if (statusFilter) {
      return all.filter((l) => l.status === statusFilter);
    }
    return all;
  }

  public getListingById(id: string): EnergyListing | undefined {
    return this.listings.get(id);
  }

  public createListing(listing: EnergyListing): EnergyListing {
    this.listings.set(listing.id, listing);
    return listing;
  }

  public updateListing(id: string, updates: Partial<EnergyListing>): EnergyListing {
    const listing = this.listings.get(id);
    if (!listing) throw new Error('Listing not found');
    const updated = { ...listing, ...updates };
    this.listings.set(id, updated);
    return updated;
  }

  // --- Trades ---
  public getTrades(): Trade[] {
    return Array.from(this.trades.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getTradesForUser(userId: string): Trade[] {
    return this.getTrades().filter((t) => t.buyer_id === userId || t.seller_id === userId);
  }

  public createTrade(trade: Trade): Trade {
    this.trades.set(trade.id, trade);
    return trade;
  }

  public updateTrade(id: string, updates: Partial<Trade>): Trade {
    const trade = this.trades.get(id);
    if (!trade) throw new Error('Trade not found');
    const updated = { ...trade, ...updates };
    this.trades.set(id, updated);
    return updated;
  }

  // --- Blockchain Transactions ---
  public getBlockchainTransactions(): BlockchainTransaction[] {
    return Array.from(this.blockchainTxs.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getBlockchainTxByHash(hash: string): BlockchainTransaction | undefined {
    return this.blockchainTxs.get(hash);
  }

  public recordBlockchainTx(tx: BlockchainTransaction): void {
    this.blockchainTxs.set(tx.transaction_hash, tx);
  }

  // --- Aggregated Neighbourhood State ---
  public getTimeLabel(hour: number): string {
    const formatted = `${hour.toString().padStart(2, '0')}:00`;
    if (hour >= 5 && hour <= 11) return `${formatted} (Morning)`;
    if (hour >= 12 && hour <= 16) return `${formatted} (Afternoon Peak)`;
    if (hour >= 17 && hour <= 20) return `${formatted} (Evening)`;
    return `${formatted} (Night)`;
  }

  public getHouseEnergyState(houseId: string): HouseEnergyState | null {
    const house = this.houses.get(houseId);
    if (!house) return null;

    const owner = this.profiles.get(house.owner_id);
    if (!owner) return null;

    let reading = this.getLatestReading(houseId);
    if (!reading) {
      // Create initial reading if none
      reading = {
        id: crypto.randomUUID(),
        house_id: house.id,
        generation_kwh: 0,
        consumption_kwh: 2.0,
        battery_charge_kwh: 0,
        battery_discharge_kwh: 0,
        net_energy_kwh: -2.0,
        recorded_at: new Date().toISOString(),
        source: 'simulation',
      };
      this.recordReading(reading);
    }

    const net = reading.net_energy_kwh;
    const status = net > 0.1 ? 'surplus' : net < -0.1 ? 'deficit' : 'balanced';
    const surplus_kwh = Math.max(0, net);
    const deficit_kwh = Math.max(0, -net);

    // Active listings currently created by this house
    const activeListings = Array.from(this.listings.values()).filter(
      (l) => l.house_id === houseId && (l.status === 'active' || l.status === 'partially_filled')
    );
    const active_listings_kwh = activeListings.reduce((sum, l) => sum + l.remaining_energy_kwh, 0);
    const available_to_sell_kwh = Math.max(0, Math.round((surplus_kwh - active_listings_kwh) * 100) / 100);

    return {
      house,
      owner,
      latest_reading: reading,
      status,
      surplus_kwh,
      deficit_kwh,
      active_listings_kwh,
      available_to_sell_kwh,
    };
  }

  public getNeighbourhoodState(): NeighbourhoodState {
    const houseStates: HouseEnergyState[] = [];
    let totalGen = 0;
    let totalCon = 0;
    let totalSurplus = 0;
    let totalDeficit = 0;

    for (const house of this.houses.values()) {
      const state = this.getHouseEnergyState(house.id);
      if (state) {
        houseStates.push(state);
        totalGen += state.latest_reading.generation_kwh;
        totalCon += state.latest_reading.consumption_kwh;
        totalSurplus += state.surplus_kwh;
        totalDeficit += state.deficit_kwh;
      }
    }

    const activeListings = this.getListings('active');
    const totalListedEnergy = activeListings.reduce((sum, l) => sum + l.remaining_energy_kwh, 0);
    const allTrades = this.getTrades();
    const completedTrades = allTrades.filter((t) => t.status === 'completed');
    const totalVolume = completedTrades.reduce((sum, t) => sum + t.total_amount, 0);

    return {
      timestamp: new Date().toISOString(),
      time_of_day_hour: this.currentHour,
      time_label: this.getTimeLabel(this.currentHour),
      total_generation_kwh: Math.round(totalGen * 100) / 100,
      total_consumption_kwh: Math.round(totalCon * 100) / 100,
      net_surplus_kwh: Math.round(totalSurplus * 100) / 100,
      net_deficit_kwh: Math.round(totalDeficit * 100) / 100,
      houses: houseStates,
      active_listings_count: activeListings.length,
      total_energy_listed_kwh: Math.round(totalListedEnergy * 100) / 100,
      total_trades_count: completedTrades.length,
      total_trading_volume_inr: Math.round(totalVolume * 100) / 100,
    };
  }

  /**
   * Advances simulation by 1 interval (e.g. 1 hour) and generates new smart meter readings
   */
  public async stepSimulationInterval(deltaHours: number = 1): Promise<NeighbourhoodState> {
    this.currentHour = (this.currentHour + deltaHours) % 24;

    for (const house of this.houses.values()) {
      const reading = await simulationEnergySource.getReading(house, this.currentHour);
      this.recordReading(reading);

      // Adjust battery level in house
      if (reading.battery_charge_kwh > 0) {
        house.battery_level_kwh = Math.min(
          house.battery_capacity_kwh,
          Math.round((house.battery_level_kwh + reading.battery_charge_kwh) * 100) / 100
        );
      } else if (reading.battery_discharge_kwh > 0) {
        house.battery_level_kwh = Math.max(
          0,
          Math.round((house.battery_level_kwh - reading.battery_discharge_kwh) * 100) / 100
        );
      }
      this.houses.set(house.id, house);
    }

    return this.getNeighbourhoodState();
  }
}

export const store = new Store();
