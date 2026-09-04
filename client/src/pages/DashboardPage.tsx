import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowUpRight, ShieldCheck, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { EnergySummary } from '../components/dashboard/EnergySummary';
import { AIRecommendationCard } from '../components/dashboard/AIRecommendationCard';
import { EnergyChart } from '../components/dashboard/EnergyChart';
import { BuyEnergyModal } from '../components/marketplace/BuyEnergyModal';
import { Button } from '../components/common/Button';
import { EnergyListing, HouseEnergyState, Trade, UserProfile } from '../types';

export const DashboardPage: React.FC<{
  currentUser: UserProfile | null;
  refreshTrigger: number;
  onRefresh: () => void;
}> = ({ currentUser, refreshTrigger, onRefresh }) => {
  const [energyState, setEnergyState] = useState<HouseEnergyState | null>(null);
  const [listings, setListings] = useState<EnergyListing[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [selectedListing, setSelectedListing] = useState<EnergyListing | null>(null);
  const [buyModalOpen, setBuyModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [energy, activeListings, trades] = await Promise.all([
        api.getCurrentEnergy(),
        api.getListings(),
        api.getTrades(),
      ]);
      setEnergyState(energy);
      setListings(activeListings.slice(0, 3));
      setRecentTrades(trades.slice(0, 4));
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser, refreshTrigger]);

  const handleBuyClick = (listing: EnergyListing) => {
    setSelectedListing(listing);
    setBuyModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Energy Overview & Deterministic Stat Cards */}
      <EnergySummary energyState={energyState} />

      {/* 2. Gemini AI Advisory & Recommendation */}
      <AIRecommendationCard refreshTrigger={refreshTrigger} />

      {/* 3. Solar Generation vs Consumption Chart */}
      <EnergyChart houseId={energyState?.house.id} refreshTrigger={refreshTrigger} />

      {/* 4. Two-Column Row: Active Marketplace Preview & Recent Blockchain Trades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Marketplace Preview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Neighbourhood Energy Offers</h3>
                  <p className="text-[11px] text-slate-500">Live P2P clean electricity available</p>
                </div>
              </div>

              <Link
                to="/marketplace"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {listings.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No active listings available in neighbourhood.
              </div>
            ) : (
              <div className="space-y-2.5">
                {listings.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800">{l.seller?.full_name}</div>
                      <div className="text-[11px] text-slate-400">
                        {l.house?.house_name} • {l.remaining_energy_kwh} kWh available
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-900">₹{l.price_per_kwh.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-400">per kWh</div>
                      </div>

                      <Button
                        size="sm"
                        variant="primary"
                        disabled={currentUser?.id === l.seller_id}
                        onClick={() => handleBuyClick(l)}
                      >
                        Buy
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Have excess solar power?</span>
            <Link to="/sell" className="font-bold text-emerald-600 hover:underline flex items-center gap-1">
              <span>List Your Surplus</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Recent Blockchain Trades */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-cyan-100 text-cyan-700 rounded-xl">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Recent Blockchain Settlement</h3>
                  <p className="text-[11px] text-slate-500">Tamper-evident P2P transaction history</p>
                </div>
              </div>

              <Link
                to="/transactions"
                className="text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-1"
              >
                <span>Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentTrades.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No trades recorded yet. Complete a trade to view blockchain record.
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentTrades.map((t) => {
                  const isBuyer = t.buyer_id === currentUser?.id;
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isBuyer ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {isBuyer ? 'Purchased' : 'Sold'}
                          </span>
                          <span>{t.energy_kwh} kWh</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                          {isBuyer ? `From ${t.seller?.full_name}` : `To ${t.buyer?.full_name}`}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-slate-900">₹{t.total_amount.toFixed(2)}</div>
                        <div className="text-[10px] text-emerald-600 font-mono flex items-center gap-0.5 justify-end">
                          <ShieldCheck className="w-3 h-3 text-cyan-600" />
                          <span>Verified</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Network: GridNova Test Network</span>
            <span className="font-mono text-cyan-600">Protocol: P2P-ERC-SIM</span>
          </div>
        </div>

      </div>

      {/* Buy Modal */}
      <BuyEnergyModal
        isOpen={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
        listing={selectedListing}
        currentUser={currentUser}
        onTradeComplete={() => {
          fetchDashboardData();
          onRefresh();
        }}
      />
    </div>
  );
};
