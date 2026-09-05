// =============================================================================
// GridNova Trading Engine
// Conforms to Rules 11, 12, 34, 35, 36, 46, 47, 48, 49, 50 and TRD Section 14, 16
// =============================================================================

import { store } from '../../data/store.js';
import { mockBlockchainService } from '../blockchain/BlockchainService.js';
import { Trade } from '../../types/index.js';

export interface ExecuteTradeParams {
  buyerId: string;
  listingId: string;
  energyKwh: number;
}

export class TradingService {
  /**
   * Executes an end-to-end P2P energy purchase with Smart Contract validation
   * and Mock Blockchain ledger recording.
   */
  public async executeTrade(params: ExecuteTradeParams): Promise<Trade> {
    const { buyerId, listingId, energyKwh } = params;

    // 1. Fetch authoritative models from backend store (Rule 47: Never trust frontend)
    const listing = store.getListingById(listingId);
    if (!listing) {
      throw new Error('Listing not found');
    }

    const buyer = store.getProfileById(buyerId);
    if (!buyer) {
      throw new Error('Buyer profile not found');
    }

    const seller = store.getProfileById(listing.seller_id);
    if (!seller) {
      throw new Error('Seller profile not found');
    }

    // 2. Mock Smart Contract Validation (Rule 36)
    const validation = mockBlockchainService.validateSmartContract({
      listing,
      buyer,
      requestedEnergyKwh: energyKwh,
    });

    if (!validation.valid) {
      throw new Error(validation.error || 'Smart contract rejected trade validation');
    }

    // 3. Deterministic financial arithmetic (Rule 49 & 50)
    const roundedEnergy = Math.round(energyKwh * 100) / 100;
    const totalAmount = Math.round(roundedEnergy * listing.price_per_kwh * 100) / 100;

    // 4. Atomic balance updates (Buyer, Seller, Listing)
    store.updateWallet(buyer.id, -totalAmount);
    store.updateWallet(seller.id, totalAmount);

    const newRemainingEnergy = Math.round((listing.remaining_energy_kwh - roundedEnergy) * 100) / 100;
    const newStatus = newRemainingEnergy <= 0.01 ? 'completed' : 'partially_filled';
    store.updateListing(listing.id, {
      remaining_energy_kwh: Math.max(0, newRemainingEnergy),
      status: newStatus,
    });

    // 5. Transfer physical/simulated energy: Seller's net energy reduces, Buyer's net energy increases
    store.adjustHouseNetEnergy(listing.house_id, -roundedEnergy);

    const buyerHouse = store.getHouseByOwnerId(buyer.id);
    if (buyerHouse) {
      store.adjustHouseNetEnergy(buyerHouse.id, roundedEnergy);
    }

    // 6. Create Trade record
    const tradeId = crypto.randomUUID();
    const trade: Trade = {
      id: tradeId,
      buyer_id: buyer.id,
      seller_id: seller.id,
      listing_id: listing.id,
      energy_kwh: roundedEnergy,
      price_per_kwh: listing.price_per_kwh,
      total_amount: totalAmount,
      status: 'completed',
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      buyer: {
        full_name: buyer.full_name,
        email: buyer.email,
      },
      seller: {
        full_name: seller.full_name,
        email: seller.email,
      },
    };

    store.createTrade(trade);

    // 6. Mock Blockchain transaction creation & block assignment (Rule 34 & 35)
    const blockchainTx = await mockBlockchainService.createTransaction(trade.id);
    store.recordBlockchainTx(blockchainTx);

    trade.blockchain_tx = blockchainTx;
    return trade;
  }
}

export const tradingService = new TradingService();
