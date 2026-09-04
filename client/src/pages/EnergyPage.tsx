import React, { useEffect, useState } from 'react';
import {
  Sun,
  Home,
  Battery,
  Zap,
  Cpu,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { api } from '../services/api';
import { EnergyChart } from '../components/dashboard/EnergyChart';
import { HouseEnergyState, UserProfile } from '../types';

export const EnergyPage: React.FC<{
  currentUser: UserProfile | null;
  refreshTrigger: number;
  onSimulationStateChange: () => void;
}> = ({ refreshTrigger, onSimulationStateChange }) => {
  const [energyState, setEnergyState] = useState<HouseEnergyState | null>(null);
  const [simHour, setSimHour] = useState<number>(14);

  const fetchEnergy = async () => {
    try {
      const state = await api.getCurrentEnergy();
      setEnergyState(state);
      const nState = await api.getSimulationState();
      setSimHour(nState.time_of_day_hour);
    } catch (err) {
      console.error('Failed to fetch energy:', err);
    }
  };

  useEffect(() => {
    fetchEnergy();
  }, [refreshTrigger]);

  const handleHourChange = async (newHour: number) => {
    setSimHour(newHour);
    try {
      await api.setSimulationTime(newHour);
      onSimulationStateChange();
    } catch (err) {
      console.error('Failed to set time:', err);
    }
  };

  if (!energyState) {
    return <div className="py-20 text-center text-slate-400">Loading Smart Meter telemetry...</div>;
  }

  const { house, latest_reading, status, surplus_kwh, deficit_kwh } = energyState;
  const batteryPct = Math.round((house.battery_level_kwh / house.battery_capacity_kwh) * 100);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          IoT Smart Meter & Energy Telemetry
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Simulated IoT hardware collecting real-time solar generation, household load, and battery kinetics
        </p>
      </div>

      {/* Smart Meter Digital Device Display (Rule 17 & TRD Section 11, 32) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Glow behind device */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold tracking-tight">{house.house_name}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-semibold border border-emerald-500/30">
                  SMART-METER ONLINE
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Device SN: GNV-SM-{house.id.substring(0, 8).toUpperCase()} • Address: {house.address_label}
              </p>
            </div>
          </div>

          {/* Meter Status Pill */}
          <div className="flex items-center space-x-2">
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-right">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Frequency</div>
              <div className="text-xs font-bold font-mono text-emerald-400">50.02 Hz • Normal</div>
            </div>
          </div>
        </div>

        {/* Digital Telemetry Readouts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 relative z-10">
          {/* Solar Generation */}
          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/70">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Sun className="w-4 h-4 text-amber-400" />
                Solar Generation
              </span>
              <span className="font-mono text-amber-300 font-bold">{house.solar_capacity_kw} kW Array</span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {latest_reading.generation_kwh}{' '}
              <span className="text-sm font-normal text-slate-400">kWh</span>
            </div>
            <div className="mt-2 flex items-center text-[11px] text-emerald-400 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              <span>Solar arrays operating efficiently</span>
            </div>
          </div>

          {/* Household Consumption */}
          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/70">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Home className="w-4 h-4 text-rose-400" />
                Home Electricity Load
              </span>
              <span className="font-mono text-slate-400">Active</span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {latest_reading.consumption_kwh}{' '}
              <span className="text-sm font-normal text-slate-400">kWh</span>
            </div>
            <div className="mt-2 flex items-center text-[11px] text-slate-400 font-medium">
              <ArrowDownRight className="w-3.5 h-3.5 mr-1 text-slate-500" />
              <span>Base load + appliances</span>
            </div>
          </div>

          {/* Net Flow */}
          <div
            className={`p-5 rounded-2xl border ${
              status === 'surplus'
                ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-100'
                : status === 'deficit'
                ? 'bg-rose-950/40 border-rose-600/50 text-rose-100'
                : 'bg-slate-800/60 border-slate-700 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-2 opacity-80">
              <span className="flex items-center gap-1.5 font-medium">
                <Zap className="w-4 h-4 text-amber-400" />
                Net Power Export/Import
              </span>
              <span className="font-bold uppercase tracking-wider text-[10px]">{status}</span>
            </div>
            <div className="text-3xl font-extrabold font-mono tracking-tight">
              {latest_reading.net_energy_kwh > 0 ? `+${latest_reading.net_energy_kwh}` : latest_reading.net_energy_kwh}{' '}
              <span className="text-sm font-normal opacity-70">kWh</span>
            </div>
            <div className="mt-2 text-[11px] font-medium opacity-90">
              {status === 'surplus'
                ? `Exporting surplus of +${surplus_kwh} kWh to P2P grid`
                : status === 'deficit'
                ? `Importing deficit of -${deficit_kwh} kWh`
                : 'Generation matches consumption'}
            </div>
          </div>
        </div>

        {/* Battery Telemetry Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl">
              <Battery className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">
                Residential Battery Storage (Lithium-Ion)
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Capacity: {house.battery_capacity_kwh} kWh • Level: {house.battery_level_kwh} kWh ({batteryPct}%)
              </p>
            </div>
          </div>

          <div className="w-full sm:w-64">
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, batteryPct))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Time-of-Day Slider (Rule 18 & 19: Time-of-day solar realism) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Simulate Time of Day</h3>
          </div>
          <span className="text-xs font-bold font-mono px-3 py-1 bg-slate-100 rounded-lg text-slate-800">
            {simHour}:00 {simHour >= 6 && simHour <= 18 ? '☀️ Daytime' : '🌙 Nighttime'}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="23"
          value={simHour}
          onChange={(e) => handleHourChange(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />

        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>00:00 (Night)</span>
          <span>06:00 (Dawn)</span>
          <span>12:00 (Peak Noon)</span>
          <span>18:00 (Dusk)</span>
          <span>23:00 (Night)</span>
        </div>

        <p className="text-[11px] text-slate-500 pt-1">
          Adjusting the hour immediately simulates realistic diurnal solar irradiance curves and typical residential consumption spikes.
        </p>
      </div>

      {/* Telemetry Chart */}
      <EnergyChart houseId={house.id} refreshTrigger={refreshTrigger} />
    </div>
  );
};
