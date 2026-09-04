import React from 'react';
import { Sun, Home, Zap, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { HouseEnergyState } from '../../types';

interface EnergySummaryProps {
  energyState: HouseEnergyState | null;
}

export const EnergySummary: React.FC<EnergySummaryProps> = ({ energyState }) => {
  if (!energyState) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
        ))}
      </div>
    );
  }

  const { latest_reading, surplus_kwh, deficit_kwh, available_to_sell_kwh, status, house } = energyState;
  const isSurplus = status === 'surplus';
  const isDeficit = status === 'deficit';

  return (
    <div className="space-y-4">
      {/* House Name & Address banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white px-5 py-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 font-bold">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{house.house_name}</h2>
            <p className="text-xs text-slate-500">{house.address_label} • {house.solar_capacity_kw} kW Solar Array</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isSurplus && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Surplus Power Active (+{surplus_kwh} kWh)
            </span>
          )}
          {isDeficit && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              Energy Deficit (-{deficit_kwh} kWh)
            </span>
          )}
          {status === 'balanced' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              Grid Balanced (0.0 kWh)
            </span>
          )}
        </div>
      </div>

      {/* 4 Stat Cards (Rule 57 & 58) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Energy */}
        <StatCard
          title="Net Energy Balance"
          value={latest_reading.net_energy_kwh > 0 ? `+${latest_reading.net_energy_kwh}` : latest_reading.net_energy_kwh}
          unit="kWh"
          subtitle={isSurplus ? 'Clean energy available to export' : isDeficit ? 'Demand exceeds solar output' : 'Generation equals consumption'}
          icon={Zap}
          variant={isSurplus ? 'surplus' : isDeficit ? 'deficit' : 'neutral'}
          badge={isSurplus ? 'Prosumer' : isDeficit ? 'Consumer' : 'Balanced'}
        />

        {/* Solar Generation */}
        <StatCard
          title="Solar Generation"
          value={latest_reading.generation_kwh}
          unit="kWh"
          subtitle={`${house.solar_capacity_kw} kW Peak Capacity`}
          icon={Sun}
          variant="surplus"
        />

        {/* Household Consumption */}
        <StatCard
          title="Home Consumption"
          value={latest_reading.consumption_kwh}
          unit="kWh"
          subtitle="Real-time household load"
          icon={Home}
          variant="neutral"
        />

        {/* P2P Available to Sell */}
        <StatCard
          title="Available for P2P Sale"
          value={available_to_sell_kwh}
          unit="kWh"
          subtitle={available_to_sell_kwh > 0 ? 'Surplus ready for marketplace' : 'No export surplus available'}
          icon={ArrowUpRight}
          variant={available_to_sell_kwh > 0 ? 'surplus' : 'neutral'}
        />
      </div>
    </div>
  );
};
