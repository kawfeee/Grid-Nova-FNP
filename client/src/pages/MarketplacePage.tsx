import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Zap, Sun, ShieldCheck, Filter, Search } from 'lucide-react';
import { api } from '../services/api';
import { BuyEnergyModal } from '../components/marketplace/BuyEnergyModal';
import { Button } from '../components/common/Button';
import { EmptyState, LoadingState } from '../components/common/FeedbackStates';
import { EnergyListing, UserProfile } from '../types';

export const MarketplacePage: React.FC<{
  currentUser: UserProfile | null;
  refreshTrigger: number;
  onRefresh: () => void;
}> = ({ currentUser, refreshTrigger, onRefresh }) => {
  const [listings, setListings] = useState<EnergyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'energy_desc'>('price_asc');
  const [selectedListing, setSelectedListing] = useState<EnergyListing | null>(null);
  const [buyModalOpen, setBuyModalOpen] = useState(false);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await api.getListings();
      setListings(data);
    } catch (err) {
      console.error('Failed to fetch marketplace listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [refreshTrigger]);

  const filteredListings = listings
    .filter((l) => {
      const query = searchQuery.toLowerCase();
      return (
        (l.seller?.full_name || '').toLowerCase().includes(query) ||
        (l.house?.house_name || '').toLowerCase().includes(query) ||
        (l.house?.address_label || '').toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price_per_kwh - b.price_per_kwh;
      if (sortBy === 'price_desc') return b.price_per_kwh - a.price_per_kwh;
      if (sortBy === 'energy_desc') return b.remaining_energy_kwh - a.remaining_energy_kwh;
      return 0;
    });

  const totalListedKwh = listings.reduce((sum, l) => sum + l.remaining_energy_kwh, 0);
  const lowestPrice = listings.length > 0 ? Math.min(...listings.map((l) => l.price_per_kwh)) : 0;

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            P2P Renewable Energy Marketplace
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Purchase clean rooftop solar power directly from neighbouring households with instant mock blockchain settlement
          </p>
        </div>

        <Link to="/sell">
          <Button variant="primary" size="md">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            <span>Sell Your Surplus</span>
          </Button>
        </Link>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Available Energy</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {totalListedKwh.toFixed(1)} <span className="text-sm font-normal text-slate-500">kWh</span>
          </div>
          <span className="text-xs text-emerald-600 font-medium">Ready for immediate delivery</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Lowest Tariff</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            ₹{lowestPrice.toFixed(2)} <span className="text-sm font-normal text-slate-500">/ kWh</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">Compared to ₹8.50 utility tariff</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Sellers</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {listings.length} <span className="text-sm font-normal text-slate-500">offers</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">Solar prosumers online</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by seller, house, or street..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 hidden sm:inline">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="price_asc">Price: Lowest first</option>
            <option value="price_desc">Price: Highest first</option>
            <option value="energy_desc">Energy: Most available</option>
          </select>
        </div>
      </div>

      {/* Listing Cards Grid */}
      {loading ? (
        <LoadingState message="Loading available community energy listings..." />
      ) : filteredListings.length === 0 ? (
        <EmptyState
          title="No energy listings found"
          description="There are currently no matching energy listings available in the neighbourhood marketplace."
          actionText="List Your Surplus Energy"
          onAction={() => (window.location.href = '/sell')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredListings.map((listing) => {
            const isOwn = currentUser?.id === listing.seller_id;
            const batchCost = Math.round(listing.remaining_energy_kwh * listing.price_per_kwh * 100) / 100;

            return (
              <div
                key={listing.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{listing.seller?.full_name}</h3>
                      <p className="text-[11px] text-slate-400">
                        {listing.house?.house_name} • {listing.house?.address_label}
                      </p>
                    </div>

                    {isOwn ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        Your Listing
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Verified Clean Power
                      </span>
                    )}
                  </div>

                  {/* Energy & Price Details */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 mb-4 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-emerald-600" />
                        Available Energy:
                      </span>
                      <span className="font-bold text-emerald-700 text-sm">
                        {listing.remaining_energy_kwh} kWh
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        Tariff Rate:
                      </span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        ₹{listing.price_per_kwh.toFixed(2)}/kWh
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                      <span>Full Batch Value:</span>
                      <span className="font-semibold text-slate-700">₹{batchCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-1 text-[11px] text-slate-400 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Smart Contract Ready</span>
                  </div>

                  <Button
                    variant={isOwn ? 'outline' : 'primary'}
                    size="sm"
                    disabled={isOwn}
                    onClick={() => {
                      setSelectedListing(listing);
                      setBuyModalOpen(true);
                    }}
                  >
                    {isOwn ? 'Your Listing' : 'Buy Energy'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Buy Modal */}
      <BuyEnergyModal
        isOpen={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
        listing={selectedListing}
        currentUser={currentUser}
        onTradeComplete={() => {
          fetchListings();
          onRefresh();
        }}
      />
    </div>
  );
};
