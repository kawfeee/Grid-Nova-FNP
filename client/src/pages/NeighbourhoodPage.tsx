import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { NeighbourhoodVisualizer } from '../components/neighbourhood/NeighbourhoodVisualizer';
import { Modal } from '../components/common/Modal';
import { HouseEnergyState, NeighbourhoodState, UserProfile } from '../types';
import { Sun, Home, Zap, Battery } from 'lucide-react';

export const NeighbourhoodPage: React.FC<{
  currentUser: UserProfile | null;
  refreshTrigger: number;
}> = ({ currentUser, refreshTrigger }) => {
  const [neighbourhoodState, setNeighbourhoodState] = useState<NeighbourhoodState | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<HouseEnergyState | null>(null);

  const fetchNeighbourhood = async () => {
    try {
      const state = await api.getSimulationState();
      setNeighbourhoodState(state);
    } catch (err) {
      console.error('Failed to load neighbourhood:', err);
    }
  };

  useEffect(() => {
    fetchNeighbourhood();
  }, [refreshTrigger]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Neighbourhood Microgrid Visualizer
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Interactive digital twin representing decentralized peer-to-peer solar power routing across the community
        </p>
      </div>

      {/* Main Visualizer */}
      <NeighbourhoodVisualizer
        neighbourhoodState={neighbourhoodState}
        currentUser={currentUser}
        onSelectHouse={(houseState: HouseEnergyState) => setSelectedHouse(houseState)}
      />

      {/* House Inspector Modal */}
      {selectedHouse && (
        <Modal
          isOpen={!!selectedHouse}
          onClose={() => setSelectedHouse(null)}
          title={selectedHouse.house.house_name}
          subtitle={`${selectedHouse.house.address_label} • Owner: ${selectedHouse.owner.full_name}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 flex items-center gap-1 mb-1">
                  <Sun className="w-3.5 h-3.5 text-amber-500" /> Solar Array
                </span>
                <span className="text-base font-bold text-slate-900">
                  {selectedHouse.house.solar_capacity_kw} kW
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 flex items-center gap-1 mb-1">
                  <Battery className="w-3.5 h-3.5 text-teal-600" /> Battery Storage
                </span>
                <span className="text-base font-bold text-slate-900">
                  {selectedHouse.house.battery_level_kwh} / {selectedHouse.house.battery_capacity_kwh} kWh
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 flex items-center gap-1 mb-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" /> Current Generation
                </span>
                <span className="text-base font-bold text-emerald-700">
                  {selectedHouse.latest_reading.generation_kwh} kWh
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 flex items-center gap-1 mb-1">
                  <Home className="w-3.5 h-3.5 text-rose-500" /> Current Load
                </span>
                <span className="text-base font-bold text-rose-700">
                  {selectedHouse.latest_reading.consumption_kwh} kWh
                </span>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center justify-between font-bold ${
                selectedHouse.status === 'surplus'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : selectedHouse.status === 'deficit'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <span>Net Energy Balance:</span>
              <span className="text-sm font-extrabold">
                {selectedHouse.latest_reading.net_energy_kwh > 0 ? `+${selectedHouse.latest_reading.net_energy_kwh}` : selectedHouse.latest_reading.net_energy_kwh} kWh ({selectedHouse.status})
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
