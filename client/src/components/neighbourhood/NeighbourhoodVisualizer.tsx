import React from 'react';
import { Sun, Home, Zap, ArrowRight, ArrowDownRight, ArrowUpRight, Battery } from 'lucide-react';
import { HouseEnergyState, NeighbourhoodState } from '../../types';

interface NeighbourhoodVisualizerProps {
  neighbourhoodState: NeighbourhoodState | null;
  onSelectHouse?: (houseState: HouseEnergyState) => void;
}

export const NeighbourhoodVisualizer: React.FC<NeighbourhoodVisualizerProps> = ({
  neighbourhoodState,
  onSelectHouse,
}) => {
  if (!neighbourhoodState) {
    return (
      <div className="h-96 bg-slate-100 rounded-3xl animate-pulse flex items-center justify-center text-slate-400">
        Loading neighbourhood topology...
      </div>
    );
  }

  const { houses, total_generation_kwh, total_consumption_kwh, net_surplus_kwh, net_deficit_kwh } =
    neighbourhoodState;

  const surplusHouses = houses.filter((h) => h.status === 'surplus');
  const deficitHouses = houses.filter((h) => h.status === 'deficit');
  const balancedHouses = houses.filter((h) => h.status === 'balanced');

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
      {/* Top Neighbourhood Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Decentralized Microgrid Topology
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time peer-to-peer renewable energy routing across {houses.length} residential nodes
          </p>
        </div>

        {/* Global Net Balance Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            <span>Total Gen: {total_generation_kwh} kWh</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
            <span>Total Load: {total_consumption_kwh} kWh</span>
          </div>
        </div>
      </div>

      {/* Interactive Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-700 font-semibold">Prosumer Node (Surplus Solar)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-slate-700 font-semibold">Consumer Node (Energy Deficit)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-slate-700 font-semibold">Balanced Node</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 hidden sm:block">
          ⚡ Dashed lines indicate simulated P2P microgrid power flow
        </div>
      </div>

      {/* Grid of House Nodes (Rule 56 & 57) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {houses.map((houseState) => {
          const { house, owner, latest_reading, status, surplus_kwh, deficit_kwh, available_to_sell_kwh } =
            houseState;
          const isSurplus = status === 'surplus';
          const isDeficit = status === 'deficit';

          const cardBorder = isSurplus
            ? 'border-emerald-300 bg-gradient-to-b from-emerald-50/50 to-white hover:border-emerald-400'
            : isDeficit
            ? 'border-rose-300 bg-gradient-to-b from-rose-50/50 to-white hover:border-rose-400'
            : 'border-amber-300 bg-gradient-to-b from-amber-50/40 to-white hover:border-amber-400';

          const badgeBg = isSurplus
            ? 'bg-emerald-100 text-emerald-800'
            : isDeficit
            ? 'bg-rose-100 text-rose-800'
            : 'bg-amber-100 text-amber-800';

          return (
            <div
              key={house.id}
              onClick={() => onSelectHouse && onSelectHouse(houseState)}
              className={`rounded-2xl border p-4 shadow-2xs transition-all duration-200 hover:shadow-md cursor-pointer ${cardBorder}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isSurplus ? 'bg-emerald-600 text-white' : isDeficit ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">{house.house_name}</h4>
                    <p className="text-[11px] text-slate-400 truncate max-w-[130px]">{owner.full_name}</p>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${badgeBg}`}>
                  {status}
                </span>
              </div>

              {/* Energy Specs */}
              <div className="space-y-1.5 text-xs py-2 border-y border-slate-100">
                <div className="flex justify-between text-slate-500">
                  <span className="flex items-center gap-1">
                    <Sun className="w-3 h-3 text-amber-500" /> Solar:
                  </span>
                  <span className="font-semibold text-slate-800">{latest_reading.generation_kwh} kWh</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span className="flex items-center gap-1">
                    <Home className="w-3 h-3 text-slate-400" /> Load:
                  </span>
                  <span className="font-semibold text-slate-800">{latest_reading.consumption_kwh} kWh</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span className="flex items-center gap-1">
                    <Battery className="w-3 h-3 text-teal-600" /> Battery:
                  </span>
                  <span className="font-semibold text-slate-800">{house.battery_level_kwh} / {house.battery_capacity_kwh} kWh</span>
                </div>
              </div>

              {/* Net Balance Footer */}
              <div className="mt-3 flex items-center justify-between text-xs">
                {isSurplus && (
                  <div className="text-emerald-700 font-bold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>+{surplus_kwh} kWh Surplus</span>
                  </div>
                )}
                {isDeficit && (
                  <div className="text-rose-700 font-bold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-rose-500" />
                    <span>-{deficit_kwh} kWh Deficit</span>
                  </div>
                )}
                {status === 'balanced' && (
                  <div className="text-amber-700 font-semibold">Balanced Grid</div>
                )}

                {available_to_sell_kwh > 0 && (
                  <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                    Selling {available_to_sell_kwh} kWh
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulated Power Transfer Flow Representation (Rule 16 & 56) */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-3 text-xs text-slate-300">
          <span className="font-bold flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-400" />
            Active Simulated P2P Energy Exchange Channels
          </span>
          <span className="text-[11px] text-slate-400 font-mono">Status: Routing Optimal</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {surplusHouses.slice(0, 2).map((sHouse, idx) => {
            const pairedConsumer = deficitHouses[idx] || deficitHouses[0];
            if (!pairedConsumer) return null;
            return (
              <div
                key={sHouse.house.id}
                className="flex items-center justify-between bg-slate-800/80 p-3 rounded-xl border border-slate-700"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold text-emerald-300">{sHouse.house.house_name}</span>
                  <span className="text-slate-500 text-[11px]">({sHouse.surplus_kwh} kWh)</span>
                </div>

                <div className="flex items-center space-x-1 text-slate-400">
                  <span className="text-[10px] font-mono text-emerald-400">transferring</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                </div>

                <div className="flex items-center space-x-2 text-right">
                  <span className="font-bold text-rose-300">{pairedConsumer.house.house_name}</span>
                  <span className="text-slate-500 text-[11px]">(-{pairedConsumer.deficit_kwh} kWh)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
