// =============================================================================
// GridNova Mock Blockchain Service
// Conforms to Rules 32, 33, 34, 35, 36 and TRD Sections 15, 16, 47
// =============================================================================

import crypto from 'crypto';
import { BlockchainTransaction, EnergyListing, UserProfile } from '../../types/index.js';

export interface BlockchainService {
  createTransaction(tradeId: string): Promise<BlockchainTransaction>;
  confirmTransaction(txHash: string): Promise<BlockchainTransaction>;
  getTransaction(txHash: string): Promise<BlockchainTransaction | null>;
  getAllTransactions(): Promise<BlockchainTransaction[]>;
  validateSmartContract(params: {
    listing: EnergyListing;
    buyer: UserProfile;
    requestedEnergyKwh: number;
  }): { valid: boolean; error?: string };
}

export class MockBlockchainService implements BlockchainService {
  private transactions: Map<string, BlockchainTransaction> = new Map();
  private currentBlockNumber: number = 12844;
  private readonly networkName: string = 'GridNova Test Network';

  constructor(initialTransactions: BlockchainTransaction[] = []) {
    for (const tx of initialTransactions) {
      this.transactions.set(tx.transaction_hash, tx);
      if (tx.block_number >= this.currentBlockNumber) {
        this.currentBlockNumber = tx.block_number + 1;
      }
    }
  }

  /**
   * Generates a realistic Ethereum-like 256-bit hexadecimal transaction hash: 0x...
   */
  private generateTxHash(seed: string): string {
    const hash = crypto.createHash('sha256')
      .update(seed + Date.now().toString() + Math.random().toString())
      .digest('hex');
    return `0x${hash}`;
  }

  /**
   * Simulates Smart Contract validation logic (Rule 36)
   */
  public validateSmartContract(params: {
    listing: EnergyListing;
    buyer: UserProfile;
    requestedEnergyKwh: number;
  }): { valid: boolean; error?: string } {
    const { listing, buyer, requestedEnergyKwh } = params;

    if (!listing) {
      return { valid: false, error: 'Listing does not exist' };
    }
    if (listing.status !== 'active' && listing.status !== 'partially_filled') {
      return { valid: false, error: `Listing is not active (current status: ${listing.status})` };
    }
    if (requestedEnergyKwh <= 0) {
      return { valid: false, error: 'Requested energy must be strictly greater than 0 kWh' };
    }
    if (requestedEnergyKwh > listing.remaining_energy_kwh) {
      return {
        valid: false,
        error: `Insufficient energy in listing. Requested: ${requestedEnergyKwh} kWh, Available: ${listing.remaining_energy_kwh} kWh`,
      };
    }
    if (buyer.id === listing.seller_id) {
      return { valid: false, error: 'Cannot purchase energy from your own listing' };
    }

    const totalCost = Math.round(requestedEnergyKwh * listing.price_per_kwh * 100) / 100;
    if (buyer.wallet_balance < totalCost) {
      return {
        valid: false,
        error: `Insufficient buyer wallet balance. Required: ₹${totalCost}, Available: ₹${buyer.wallet_balance}`,
      };
    }

    return { valid: true };
  }

  /**
   * Creates a new pending blockchain transaction
   */
  public async createTransaction(tradeId: string): Promise<BlockchainTransaction> {
    const txHash = this.generateTxHash(tradeId);
    const blockNumber = this.currentBlockNumber++;

    const tx: BlockchainTransaction = {
      id: crypto.randomUUID(),
      trade_id: tradeId,
      transaction_hash: txHash,
      block_number: blockNumber,
      network: this.networkName,
      transaction_type: 'P2P_ENERGY_TRANSFER',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    this.transactions.set(txHash, tx);

    // Automatically simulate block confirmation after a short delay (Rule 34 & 35)
    setTimeout(() => {
      this.confirmTransaction(txHash).catch(() => {});
    }, 1500);

    return tx;
  }

  /**
   * Confirms a pending transaction
   */
  public async confirmTransaction(txHash: string): Promise<BlockchainTransaction> {
    const tx = this.transactions.get(txHash);
    if (!tx) {
      throw new Error(`Transaction with hash ${txHash} not found on ${this.networkName}`);
    }

    tx.status = 'confirmed';
    tx.confirmed_at = new Date().toISOString();
    this.transactions.set(txHash, tx);
    return tx;
  }

  public async getTransaction(txHash: string): Promise<BlockchainTransaction | null> {
    return this.transactions.get(txHash) || null;
  }

  public async getAllTransactions(): Promise<BlockchainTransaction[]> {
    return Array.from(this.transactions.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
}

export const mockBlockchainService = new MockBlockchainService();
