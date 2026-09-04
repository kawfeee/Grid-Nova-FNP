import React, { useState } from 'react';
import { ShieldCheck, Zap, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { api } from '../../services/api';
import { EnergyListing, Trade, UserProfile } from '../../types';

interface BuyEnergyModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: EnergyListing | null;
  currentUser: UserProfile | null;
  onTradeComplete: (trade: Trade) => void;
}

export const BuyEnergyModal: React.FC<BuyEnergyModalProps> = ({
  isOpen,
  onClose,
  listing,
  currentUser,
  onTradeComplete,
}) => {
  const [energyKwh, setEnergyKwh] = useState<string>('1.5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedTrade, setCompletedTrade] = useState<Trade | null>(null);

  if (!listing) return null;

  const numericEnergy = parseFloat(energyKwh) || 0;
  const totalCost = Math.round(numericEnergy * listing.price_per_kwh * 100) / 100;
  const buyerBalance = currentUser?.wallet_balance || 0;
  const hasSufficientFunds = buyerBalance >= totalCost;
  const hasSufficientEnergy = numericEnergy > 0 && numericEnergy <= listing.remaining_energy_kwh;
  const isOwnListing = currentUser?.id === listing.seller_id;

  const handleBuy = async () => {
    try {
      setLoading(true);
      setError(null);
      const trade = await api.executeTrade(listing.id, numericEnergy);
      setCompletedTrade(trade);
      onTradeComplete(trade);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Trade execution failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    setCompletedTrade(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleDone}
      title={completedTrade ? 'Trade Executed & Blockchain Verified' : 'Purchase Renewable Energy'}
      subtitle={
        completedTrade
          ? 'Automated Smart Contract settlement confirmed on GridNova Test Network'
          : `From ${listing.seller?.full_name || 'Seller'} • ${listing.house?.house_name || 'House'}`
      }
    >
      {completedTrade ? (
        <div className="space-y-5 text-center">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-lg font-bold text-slate-900">Trade Successful!</h4>
            <p className="text-xs text-slate-500 mt-1">
              You acquired <strong className="text-slate-800 font-bold">{completedTrade.energy_kwh} kWh</strong> for{' '}
              <strong className="text-emerald-700 font-bold">₹{completedTrade.total_amount.toFixed(2)}</strong>.
            </p>
          </div>

          {/* Blockchain Verification Block (Rule 34 & 35) */}
          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-left font-mono text-xs space-y-2 border border-slate-800">
            <div className="flex items-center justify-between text-cyan-400 font-semibold pb-1 border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Mock Blockchain Ledger
              </span>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                Status: Confirmed
              </span>
            </div>
            <div>
              <span className="text-slate-500">Block: </span>
              <span className="text-slate-300 font-bold">#{completedTrade.blockchain_tx?.block_number}</span>
            </div>
            <div className="break-all">
              <span className="text-slate-500">Tx Hash: </span>
              <span className="text-cyan-300">{completedTrade.blockchain_tx?.transaction_hash}</span>
            </div>
            <div>
              <span className="text-slate-500">Network: </span>
              <span className="text-slate-300">{completedTrade.blockchain_tx?.network}</span>
            </div>
          </div>

          <Button variant="primary" className="w-full" onClick={handleDone}>
            Back to Marketplace
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {isOwnListing && (
            <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>You are the owner of this listing. Switch to another demo user to purchase.</span>
            </div>
          )}

          {/* Listing details summary */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Seller Household:</span>
              <span className="font-semibold text-slate-800">{listing.seller?.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Solar Capacity:</span>
              <span className="font-semibold text-slate-800">{listing.house?.solar_capacity_kw} kW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Available Energy:</span>
              <span className="font-semibold text-emerald-700">{listing.remaining_energy_kwh} kWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Unit Tariff:</span>
              <span className="font-bold text-slate-900">₹{listing.price_per_kwh.toFixed(2)}/kWh</span>
            </div>
          </div>

          {/* Input energy amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Purchase Quantity (kWh)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0.1"
                max={listing.remaining_energy_kwh}
                value={energyKwh}
                onChange={(e) => setEnergyKwh(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. 2.0"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400">
                kWh
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Max available: {listing.remaining_energy_kwh} kWh
            </p>
          </div>

          {/* Cost breakdown */}
          <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Estimated Total:</span>
              <span className="text-base font-bold text-emerald-800">₹{totalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Your Wallet Balance:</span>
              <span>₹{buyerBalance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Balance After Trade:</span>
              <span className={hasSufficientFunds ? 'text-slate-700' : 'text-rose-600 font-bold'}>
                ₹{(buyerBalance - totalCost).toFixed(2)}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <Button
              variant="primary"
              className="w-full"
              disabled={!hasSufficientFunds || !hasSufficientEnergy || isOwnListing}
              isLoading={loading}
              loadingText="Simulating Smart Contract & Blockchain Ledger..."
              onClick={handleBuy}
            >
              <Zap className="w-4 h-4 mr-1.5" />
              <span>Confirm & Buy {numericEnergy > 0 ? `${numericEnergy} kWh` : ''}</span>
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
