import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowUpRight, Sparkles, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { Button } from '../components/common/Button';
import { HouseEnergyState, PriceRecommendationResult, UserProfile } from '../types';

export const SellPage: React.FC<{
  currentUser: UserProfile | null;
  refreshTrigger: number;
  onRefresh: () => void;
}> = ({ refreshTrigger, onRefresh }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [energyState, setEnergyState] = useState<HouseEnergyState | null>(null);
  const [amountKwh, setAmountKwh] = useState<string>('2.0');
  const [pricePerKwh, setPricePerKwh] = useState<string>('6.50');
  const [aiPrice, setAiPrice] = useState<PriceRecommendationResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if navigated with prefill from AI recommendation
    const state = location.state as { prefillAmount?: number; prefillPrice?: number } | undefined;
    if (state?.prefillAmount) setAmountKwh(state.prefillAmount.toString());
    if (state?.prefillPrice) setPricePerKwh(state.prefillPrice.toFixed(2));
  }, [location]);

  const fetchEnergyAndAI = async () => {
    try {
      const state = await api.getCurrentEnergy();
      setEnergyState(state);

      // Fetch AI price recommendation
      setAiLoading(true);
      const recommendation = await api.getPriceRecommendation();
      setAiPrice(recommendation);
    } catch (err) {
      console.error('Failed to load sell page data:', err);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchEnergyAndAI();
  }, [refreshTrigger]);

  const availableSurplus = energyState?.available_to_sell_kwh || 0;
  const numAmount = parseFloat(amountKwh) || 0;
  const numPrice = parseFloat(pricePerKwh) || 0;
  const expectedRevenue = Math.round(numAmount * numPrice * 100) / 100;

  const isValidAmount = numAmount > 0 && numAmount <= availableSurplus;
  const isValidPrice = numPrice > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidAmount || !isValidPrice) return;

    try {
      setLoading(true);
      setError(null);
      await api.createListing(numAmount, numPrice);
      setSuccess(true);
      onRefresh();
      setTimeout(() => {
        navigate('/marketplace');
      }, 1500);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to create energy listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          List Surplus Renewable Energy
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Make your household solar surplus available for neighbours to buy via verified smart contracts
        </p>
      </div>

      {/* Available Surplus Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-200">
              Verified Unreserved Surplus
            </span>
            <div className="text-3xl font-extrabold mt-1">
              {availableSurplus}{' '}
              <span className="text-sm font-normal text-emerald-100">kWh available</span>
            </div>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
            <Zap className="w-6 h-6 text-amber-300" />
          </div>
        </div>
        <p className="text-xs text-emerald-100 mt-2">
          Calculated by Smart Meter: Total Generation ({energyState?.latest_reading.generation_kwh || 0} kWh) minus Consumption ({energyState?.latest_reading.consumption_kwh || 0} kWh).
        </p>
      </div>

      {/* Gemini AI Pricing Advisor */}
      <div className="bg-violet-50/80 border border-violet-200 rounded-2xl p-4.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-violet-600 text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-900">Gemini AI Dynamic Price Optimizer</span>
          </div>

          {aiPrice && (
            <button
              type="button"
              onClick={() => setPricePerKwh(aiPrice.recommended_price_per_kwh.toFixed(2))}
              className="text-xs font-bold text-violet-700 hover:text-violet-800 underline"
            >
              Apply Suggested Rate
            </button>
          )}
        </div>

        {aiLoading ? (
          <p className="text-xs text-slate-500 italic">Analyzing current microgrid supply & demand...</p>
        ) : aiPrice ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
            <p className="text-slate-600 max-w-md">{aiPrice.reason}</p>
            <div className="font-extrabold text-violet-900 text-sm whitespace-nowrap">
              Suggested: ₹{aiPrice.recommended_price_per_kwh.toFixed(2)}/kWh
            </div>
          </div>
        ) : null}
      </div>

      {/* Main Listing Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
        {/* Quantity Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-800">
              Energy Quantity to Offer (kWh)
            </label>
            {availableSurplus > 0 && (
              <button
                type="button"
                onClick={() => setAmountKwh(availableSurplus.toString())}
                className="text-[11px] font-bold text-emerald-600 hover:underline"
              >
                Use Max ({availableSurplus} kWh)
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="0.1"
              max={availableSurplus}
              value={amountKwh}
              onChange={(e) => setAmountKwh(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. 2.5"
              required
            />
            <span className="absolute right-4 top-2.5 text-xs font-semibold text-slate-400">
              kWh
            </span>
          </div>
          {numAmount > availableSurplus && (
            <p className="text-[11px] text-rose-600 font-semibold mt-1">
              Quantity cannot exceed your verified available surplus ({availableSurplus} kWh).
            </p>
          )}
        </div>

        {/* Price Field */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Tariff Rate per kWh (₹)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-2.5 text-xs font-semibold text-slate-400">
              ₹
            </span>
            <input
              type="number"
              step="0.05"
              min="0.5"
              value={pricePerKwh}
              onChange={(e) => setPricePerKwh(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. 6.50"
              required
            />
            <span className="absolute right-4 top-2.5 text-xs font-semibold text-slate-400">
              / kWh
            </span>
          </div>
        </div>

        {/* Expected Revenue Preview */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">Expected Total Earnings:</span>
          <span className="text-lg font-extrabold text-emerald-700">
            ₹{expectedRevenue.toFixed(2)}
          </span>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Energy listing published successfully! Redirecting to marketplace...</span>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={!isValidAmount || !isValidPrice || availableSurplus <= 0}
          isLoading={loading}
          loadingText="Validating & Publishing Listing..."
        >
          <ArrowUpRight className="w-4 h-4 mr-1.5" />
          <span>Publish Energy Listing on Marketplace</span>
        </Button>
      </form>
    </div>
  );
};
