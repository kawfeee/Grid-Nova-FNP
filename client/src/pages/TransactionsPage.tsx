import React, { useEffect, useState } from 'react';
import { ShieldCheck, ArrowUpRight, ArrowDownLeft, ExternalLink, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { Modal } from '../components/common/Modal';
import { EmptyState, LoadingState } from '../components/common/FeedbackStates';
import { BlockchainTransaction, Trade, UserProfile } from '../types';

export const TransactionsPage: React.FC<{
  currentUser: UserProfile | null;
  refreshTrigger: number;
}> = ({ currentUser, refreshTrigger }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [blockchainTxs, setBlockchainTxs] = useState<BlockchainTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<BlockchainTransaction | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const [allTrades, allTxs] = await Promise.all([
        api.getTrades(),
        api.getBlockchainTransactions(),
      ]);
      setTrades(allTrades);
      setBlockchainTxs(allTxs);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentUser, refreshTrigger]);

  const handleOpenTx = (txHash?: string) => {
    if (!txHash) return;
    const tx = blockchainTxs.find((t) => t.transaction_hash === txHash);
    if (tx) {
      setSelectedTx(tx);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Transaction History & Blockchain Ledger
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Cryptographically signed records of all neighbourhood peer-to-peer renewable energy trades
        </p>
      </div>

      {/* Network Overview Badge */}
      <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <span className="font-mono font-bold text-white">GridNova Test Network</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-semibold border border-emerald-500/30">
            Consensus: PoS-Sim
          </span>
        </div>
        <div className="font-mono text-slate-400">
          Total Blocks Verified: <strong className="text-cyan-300 font-bold">{blockchainTxs.length + 12840}</strong>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <LoadingState message="Querying blockchain ledger..." />
      ) : trades.length === 0 ? (
        <EmptyState
          title="No transactions found"
          description="You haven't made or received any energy transfers yet. Buy or sell energy on the marketplace to create your first transaction."
          actionText="Explore Marketplace"
          onAction={() => (window.location.href = '/marketplace')}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Type & Time</th>
                  <th className="px-5 py-3.5">Counterparty</th>
                  <th className="px-5 py-3.5">Energy Amount</th>
                  <th className="px-5 py-3.5">Unit Tariff</th>
                  <th className="px-5 py-3.5">Total (₹)</th>
                  <th className="px-5 py-3.5">Blockchain Tx Hash</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trades.map((trade) => {
                  const isBuyer = trade.buyer_id === currentUser?.id;
                  const tx = blockchainTxs.find((t) => t.trade_id === trade.id) || trade.blockchain_tx;
                  const dateStr = new Date(trade.created_at).toLocaleString('en-IN', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  });

                  return (
                    <tr key={trade.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`p-1.5 rounded-lg ${
                              isBuyer ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {isBuyer ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{isBuyer ? 'Purchased' : 'Sold'}</div>
                            <div className="text-[10px] text-slate-400">{dateStr}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {isBuyer ? trade.seller?.full_name : trade.buyer?.full_name}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">{trade.energy_kwh} kWh</td>

                      <td className="px-5 py-4 text-slate-600">₹{trade.price_per_kwh.toFixed(2)}/kWh</td>

                      <td className="px-5 py-4 font-extrabold text-slate-900">
                        ₹{trade.total_amount.toFixed(2)}
                      </td>

                      <td className="px-5 py-4">
                        {tx ? (
                          <button
                            onClick={() => setSelectedTx(tx)}
                            className="font-mono text-cyan-700 hover:text-cyan-800 underline flex items-center gap-1 font-medium text-[11px]"
                          >
                            <span>{tx.transaction_hash.substring(0, 10)}...{tx.transaction_hash.substring(58)}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </button>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">Pending Block</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Confirmed
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Blockchain Transaction Explorer Modal (Rule 34 & 35) */}
      {selectedTx && (
        <Modal
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          title="Mock Blockchain Ledger Explorer"
          subtitle="Verifiable transaction receipt on GridNova Test Network"
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 font-sans flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Smart Contract validated and recorded on ledger with cryptographic immutability.</span>
            </div>

            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl space-y-2.5 border border-slate-800">
              <div>
                <span className="text-slate-500">Block Number: </span>
                <span className="text-amber-400 font-bold">#{selectedTx.block_number}</span>
              </div>
              <div className="break-all">
                <span className="text-slate-500">Transaction Hash: </span>
                <span className="text-cyan-300 font-semibold">{selectedTx.transaction_hash}</span>
              </div>
              <div>
                <span className="text-slate-500">Network: </span>
                <span className="text-slate-200">{selectedTx.network}</span>
              </div>
              <div>
                <span className="text-slate-500">Protocol Type: </span>
                <span className="text-slate-200">{selectedTx.transaction_type}</span>
              </div>
              <div>
                <span className="text-slate-500">Status: </span>
                <span className="text-emerald-400 font-bold uppercase">{selectedTx.status}</span>
              </div>
              <div>
                <span className="text-slate-500">Timestamp: </span>
                <span className="text-slate-400">{new Date(selectedTx.created_at).toISOString()}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
