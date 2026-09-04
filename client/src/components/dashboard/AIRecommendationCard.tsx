import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { TradeRecommendationResult } from '../../types';
import { Button } from '../common/Button';

export const AIRecommendationCard: React.FC<{ refreshTrigger?: number }> = ({ refreshTrigger }) => {
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState<TradeRecommendationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendation = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getTradeRecommendation();
      setRecommendation(res);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'AI insight temporarily unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendation();
  }, [refreshTrigger]);

  const isSell = recommendation?.recommendation === 'sell';
  const isBuy = recommendation?.recommendation === 'buy';

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-violet-50/80 via-white to-indigo-50/40 rounded-2xl border border-violet-200/80 p-5 sm:p-6 shadow-xs">
      {/* Background ambient accent */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-violet-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-violet-600 text-white shadow-xs shadow-violet-600/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Gemini AI Trade Advisor</h3>
            <p className="text-[11px] text-slate-500">Autonomous market intelligence & advisory</p>
          </div>
        </div>

        <button
          onClick={fetchRecommendation}
          disabled={loading}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
          title="Refresh AI recommendation"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-violet-600' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-6 flex flex-col items-center justify-center text-center">
          <Sparkles className="w-6 h-6 text-violet-600 animate-pulse mb-2" />
          <p className="text-xs text-slate-500">Analyzing neighbourhood solar supply & market demand...</p>
        </div>
      ) : error ? (
        <div className="py-3 px-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>AI advisory offline. Standard rules active.</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchRecommendation}>
            Retry
          </Button>
        </div>
      ) : recommendation ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isSell
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : isBuy
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                Recommended: {recommendation.recommendation}
              </span>
              {recommendation.recommended_amount_kwh > 0 && (
                <span className="text-sm font-bold text-slate-800">
                  ~{recommendation.recommended_amount_kwh} kWh
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
              <span>Confidence:</span>
              <span className="font-bold text-violet-700">
                {Math.round(recommendation.confidence * 100)}%
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white/80 p-3.5 rounded-xl border border-violet-100">
            {recommendation.reason}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center space-x-2 text-xs text-slate-600">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>
                Recommended Tariff:{' '}
                <strong className="text-slate-900 font-bold">
                  ₹{recommendation.recommended_price_per_kwh.toFixed(2)}/kWh
                </strong>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {isSell && (
                <Button
                  variant="ai"
                  size="sm"
                  onClick={() =>
                    navigate('/sell', {
                      state: {
                        prefillAmount: recommendation.recommended_amount_kwh,
                        prefillPrice: recommendation.recommended_price_per_kwh,
                      },
                    })
                  }
                >
                  <span>Review & List for Sale</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              )}
              {isBuy && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/marketplace')}
                >
                  <span>Find Available Energy</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              )}
              {!isSell && !isBuy && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/energy')}
                >
                  <span>View Smart Meter Readings</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
