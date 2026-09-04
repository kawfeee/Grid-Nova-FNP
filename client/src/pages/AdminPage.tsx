import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Sun,
  Activity,
  Zap,
  TrendingUp,
  Sparkles,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { LoadingState } from '../components/common/FeedbackStates';
import {
  BlockchainTransaction,
  HouseEnergyState,
  NeighbourhoodInsightResult,
  NeighbourhoodState,
  Trade,
  UserProfile,
} from '../types';

export const AdminPage: React.FC<{
  currentUser: UserProfile | null;
  refreshTrigger: number;
}> = ({ currentUser, refreshTrigger }) => {
  const [data, setData] = useState<{
    metrics: {
      totalCitizens: number;
      totalHouses: number;
      totalGenerationKwh: number;
      totalConsumptionKwh: number;
      netSurplusKwh: number;
      netDeficitKwh: number;
      activeListingsCount: number;
      completedTradesCount: number;
      totalTradingVolumeInr: number;
    };
    neighbourhoodState: NeighbourhoodState;
    recentTrades: Trade[];
    blockchainLedger: BlockchainTransaction[];
  } | null>(null);

  const [aiInsight, setAiInsight] = useState<NeighbourhoodInsightResult | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [adminRes, insightRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getNeighbourhoodInsight(),
      ]);
      setData(adminRes);
      setAiInsight(insightRes);
    } catch (err: unknown) {
      console.error('Failed to load administrator dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [currentUser, refreshTrigger]);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="p-3 bg-amber-100 text-amber-800 w-12 h-12 rounded-2xl mx-auto flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Administrator Privileges Required</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          You are currently signed in as a citizen. Use the top simulation bar to switch to the <strong>Admin</strong> demo profile.
        </p>
      </div>
    );
  }

  if (loading || !data) {
    return <LoadingState message="Loading administrator system telemetries and blockchain ledger..." />;
  }

  const { metrics, neighbourhoodState, blockchainLedger } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-slate-900 text-cyan-400 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Grid Governance & Ecosystem Admin
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            System-wide renewable energy distribution, P2P trade volumes, and blockchain integrity monitoring
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Audit</span>
        </button>
      </div>

      {/* Global Stat Cards (Rule 59) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Gross Generation"
          value={metrics.totalGenerationKwh}
          unit="kWh"
          subtitle={`${metrics.totalHouses} connected solar nodes`}
          icon={Sun}
          variant="surplus"
        />

        <StatCard
          title="Total Community Load"
          value={metrics.totalConsumptionKwh}
          unit="kWh"
          subtitle={`Net Balance: ${metrics.netSurplusKwh > metrics.netDeficitKwh ? '+' : '-'}${Math.abs(metrics.netSurplusKwh - metrics.netDeficitKwh).toFixed(1)} kWh`}
          icon={Activity}
          variant="neutral"
        />

        <StatCard
          title="Completed P2P Trades"
          value={metrics.completedTradesCount}
          unit="trades"
          subtitle={`${metrics.activeListingsCount} active listings`}
          icon={Zap}
          variant="blockchain"
        />

        <StatCard
          title="Gross Trading Volume"
          value={`₹${metrics.totalTradingVolumeInr.toFixed(2)}`}
          subtitle="Direct citizen-to-citizen settlements"
          icon={TrendingUp}
          variant="neutral"
        />
      </div>

      {/* Gemini AI Neighbourhood Intelligence Report (TRD Section 21) */}
      {aiInsight && (
        <div className="bg-gradient-to-br from-violet-50/80 via-white to-purple-50/50 rounded-2xl border border-violet-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-violet-600 text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Gemini AI Neighbourhood Intelligence Brief
                </h3>
                <p className="text-[11px] text-slate-500">
                  Autonomous macro analysis of community energy balance
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-100 text-violet-800 border border-violet-200">
              Macro Advisory
            </span>
          </div>

          <div className="bg-white/80 p-4 rounded-xl border border-violet-100">
            <h4 className="text-sm font-extrabold text-violet-950 mb-1">{aiInsight.headline}</h4>
            <p className="text-xs text-slate-700 leading-relaxed">{aiInsight.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white/70 p-3.5 rounded-xl border border-violet-100">
              <span className="font-bold text-slate-900 block mb-2">Key Grid Findings:</span>
              <ul className="space-y-1.5 text-slate-600">
                {aiInsight.key_findings.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/70 p-3.5 rounded-xl border border-violet-100">
              <span className="font-bold text-slate-900 block mb-2">Recommended Interventions:</span>
              <ul className="space-y-1.5 text-slate-600">
                {aiInsight.recommended_actions.map((a: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Connected Household Registry Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Residential Nodes Registry</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
              <tr>
                <th className="px-4 py-3">House & Owner</th>
                <th className="px-4 py-3">Solar Array</th>
                <th className="px-4 py-3">Generation</th>
                <th className="px-4 py-3">Consumption</th>
                <th className="px-4 py-3">Net State</th>
                <th className="px-4 py-3">Wallet Balance</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {neighbourhoodState.houses.map((h: HouseEnergyState) => (
                <tr key={h.house.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800">{h.house.house_name}</div>
                    <div className="text-[11px] text-slate-400">{h.owner.full_name} • {h.house.address_label}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{h.house.solar_capacity_kw} kW</td>
                  <td className="px-4 py-3 font-bold text-emerald-600">{h.latest_reading.generation_kwh} kWh</td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{h.latest_reading.consumption_kwh} kWh</td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {h.latest_reading.net_energy_kwh > 0 ? `+${h.latest_reading.net_energy_kwh}` : h.latest_reading.net_energy_kwh} kWh
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                    ₹{h.owner.wallet_balance.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        h.status === 'surplus'
                          ? 'bg-emerald-100 text-emerald-800'
                          : h.status === 'deficit'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blockchain Ledger Auditor Table */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono">Consensus Ledger Audit Stream</h3>
          </div>
          <span className="font-mono text-xs text-slate-400">Network: GridNova Test Network</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="px-4 py-2.5">Block #</th>
                <th className="px-4 py-2.5">Transaction Hash</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Timestamp</th>
                <th className="px-4 py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {blockchainLedger.map((tx) => (
                <tr key={tx.transaction_hash} className="hover:bg-slate-800/40">
                  <td className="px-4 py-2.5 font-bold text-amber-400">#{tx.block_number}</td>
                  <td className="px-4 py-2.5 text-cyan-300 truncate max-w-[240px]">
                    {tx.transaction_hash}
                  </td>
                  <td className="px-4 py-2.5 text-slate-300">{tx.transaction_type}</td>
                  <td className="px-4 py-2.5 text-slate-400">{new Date(tx.created_at).toLocaleTimeString()}</td>
                  <td className="px-4 py-2.5 text-right text-emerald-400 font-bold uppercase">
                    {tx.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
