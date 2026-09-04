import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../../data/store.js';
import { tradingService } from './TradingService.js';
import { mockBlockchainService } from '../blockchain/BlockchainService.js';

describe('GridNova Trading Engine & Mock Blockchain Integration', () => {
  beforeEach(() => {
    store.resetToSeed();
  });

  it('should deterministically calculate net energy (Rule 13 & 14)', () => {
    // House A initial reading: Gen 5.8 kWh, Con 2.0 kWh -> Net +3.8 kWh
    const houseAState = store.getHouseEnergyState('10000000-0000-0000-0000-000000000001');
    expect(houseAState).toBeDefined();
    expect(houseAState?.status).toBe('surplus');
    expect(houseAState?.surplus_kwh).toBe(3.8);
    expect(houseAState?.deficit_kwh).toBe(0);

    // House B initial reading: Gen 1.4 kWh, Con 3.5 kWh -> Net -2.1 kWh
    const houseBState = store.getHouseEnergyState('10000000-0000-0000-0000-000000000002');
    expect(houseBState).toBeDefined();
    expect(houseBState?.status).toBe('deficit');
    expect(houseBState?.deficit_kwh).toBe(2.1);
  });

  it('should validate smart contract rules before allowing a trade (Rule 36)', () => {
    const listing = store.getListingById('20000000-0000-0000-0000-000000000001')!; // House A: 3.0 kWh at ₹6.50
    const buyer = store.getProfileById('00000000-0000-0000-0000-000000000003')!; // Citizen B

    // Valid purchase: 1.5 kWh
    const validCheck = mockBlockchainService.validateSmartContract({
      listing,
      buyer,
      requestedEnergyKwh: 1.5,
    });
    expect(validCheck.valid).toBe(true);

    // Invalid purchase: requesting more energy than available in listing
    const invalidEnergyCheck = mockBlockchainService.validateSmartContract({
      listing,
      buyer,
      requestedEnergyKwh: 10.0,
    });
    expect(invalidEnergyCheck.valid).toBe(false);
    expect(invalidEnergyCheck.error).toContain('Insufficient energy');

    // Invalid purchase: seller cannot buy from their own listing
    const seller = store.getProfileById(listing.seller_id)!;
    const selfPurchaseCheck = mockBlockchainService.validateSmartContract({
      listing,
      buyer: seller,
      requestedEnergyKwh: 1.0,
    });
    expect(selfPurchaseCheck.valid).toBe(false);
    expect(selfPurchaseCheck.error).toContain('Cannot purchase energy from your own listing');
  });

  it('should execute trade atomically, update balances, and generate mock blockchain tx (Rules 34, 48, 49)', async () => {
    const listingId = '20000000-0000-0000-0000-000000000001';
    const buyerId = '00000000-0000-0000-0000-000000000003'; // Citizen B
    const sellerId = '00000000-0000-0000-0000-000000000002'; // Citizen A

    const buyerBefore = store.getProfileById(buyerId)!.wallet_balance;
    const sellerBefore = store.getProfileById(sellerId)!.wallet_balance;

    const trade = await tradingService.executeTrade({
      buyerId,
      listingId,
      energyKwh: 1.5,
    });

    expect(trade.status).toBe('completed');
    expect(trade.energy_kwh).toBe(1.5);
    expect(trade.price_per_kwh).toBe(6.5);
    expect(trade.total_amount).toBe(9.75); // 1.5 * 6.5 = 9.75

    // Financial balance check (Rule 49 & 50)
    const buyerAfter = store.getProfileById(buyerId)!.wallet_balance;
    const sellerAfter = store.getProfileById(sellerId)!.wallet_balance;
    expect(buyerAfter).toBe(Math.round((buyerBefore - 9.75) * 100) / 100);
    expect(sellerAfter).toBe(Math.round((sellerBefore + 9.75) * 100) / 100);

    // Listing remaining energy check
    const updatedListing = store.getListingById(listingId)!;
    expect(updatedListing.remaining_energy_kwh).toBe(1.5);
    expect(updatedListing.status).toBe('partially_filled');

    // Blockchain transaction check (Rule 34)
    expect(trade.blockchain_tx).toBeDefined();
    expect(trade.blockchain_tx?.transaction_hash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(trade.blockchain_tx?.network).toBe('GridNova Test Network');
    expect(trade.blockchain_tx?.block_number).toBeGreaterThan(12840);
  });
});
