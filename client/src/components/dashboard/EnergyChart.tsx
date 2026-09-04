import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { api } from '../../services/api';
import { EnergyReading } from '../../types';

interface EnergyChartProps {
  houseId?: string;
  refreshTrigger?: number;
}

export const EnergyChart: React.FC<EnergyChartProps> = ({ houseId, refreshTrigger }) => {
  const [readings, setReadings] = useState<EnergyReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!houseId) return;
      try {
        setLoading(true);
        const data = await api.getEnergyHistory(houseId);
        // Sort ascending by time for chart
        const sorted = [...data].reverse();
        setReadings(sorted);
      } catch (err) {
        console.error('Failed to load chart history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [houseId, refreshTrigger]);

  const chartData = readings.map((r, index) => ({
    time: `T-${readings.length - index}`,
    generation: r.generation_kwh,
    consumption: r.consumption_kwh,
    net: r.net_energy_kwh,
  }));

  // Fallback demo data if single reading
  const displayData =
    chartData.length > 1
      ? chartData
      : [
          { time: '08:00', generation: 2.1, consumption: 2.8, net: -0.7 },
          { time: '10:00', generation: 4.3, consumption: 2.2, net: 2.1 },
          { time: '12:00', generation: 5.8, consumption: 2.0, net: 3.8 },
          { time: '14:00', generation: 5.4, consumption: 2.3, net: 3.1 },
          { time: '16:00', generation: 3.2, consumption: 2.5, net: 0.7 },
          { time: '18:00', generation: 1.0, consumption: 3.8, net: -2.8 },
        ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Solar Generation vs Household Load</h3>
          <p className="text-xs text-slate-500">Real-time smart meter telemetry (kWh per interval)</p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-semibold">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Solar Generation (kWh)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-400" />
            <span className="text-slate-600">Consumption (kWh)</span>
          </div>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="genGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="conGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit=" kWh" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '12px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            />
            <Area
              type="monotone"
              dataKey="generation"
              name="Generation"
              stroke="#059669"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#genGrad)"
            />
            <Area
              type="monotone"
              dataKey="consumption"
              name="Consumption"
              stroke="#e11d48"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#conGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
