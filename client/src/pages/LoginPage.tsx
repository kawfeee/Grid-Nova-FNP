import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ShieldCheck, Sun, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { Button } from '../components/common/Button';
import { UserProfile } from '../types';

export const LoginPage: React.FC<{
  onLogin: (user: UserProfile) => void;
}> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.login(email);
      onLogin(res.user);
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = async (demoEmail: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.login(demoEmail);
      onLogin(res.user);
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white mx-auto shadow-md shadow-emerald-600/30">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign in to Grid<span className="text-emerald-600">Nova</span>
          </h1>
          <p className="text-xs text-slate-500">
            Decentralized AI-driven peer-to-peer renewable energy platform
          </p>
        </div>

        {/* 1-Click Instant Demo Profiles (Rule 60: Demo Mode) */}
        <div className="space-y-2.5">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            — 1-Click Evaluation Profiles —
          </label>

          <button
            type="button"
            onClick={() => handleDemoSelect('citizena@gridnova.local')}
            className="w-full text-left p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 transition flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald-600 text-white">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Citizen A (Aarav Sharma)</div>
                <div className="text-[11px] text-emerald-700">Solar Prosumer • Surplus (+3.8 kWh)</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => handleDemoSelect('citizenb@gridnova.local')}
            className="w-full text-left p-3 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 transition flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-rose-600 text-white">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Citizen B (Bhavna Patel)</div>
                <div className="text-[11px] text-rose-700">Energy Consumer • Deficit (-2.1 kWh)</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-rose-600 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => handleDemoSelect('admin@gridnova.local')}
            className="w-full text-left p-3 rounded-xl border border-slate-300 bg-slate-100/70 hover:bg-slate-200/70 transition flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-slate-800 text-white">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Administrator</div>
                <div className="text-[11px] text-slate-500">Full Neighbourhood Supervisor</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] text-slate-400 uppercase font-semibold absolute">
            Or custom email
          </span>
        </div>

        {/* Custom Email Form */}
        <form onSubmit={handleCustomLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. resident@neighbourhood.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="secondary"
            className="w-full"
            isLoading={loading}
          >
            Continue as Citizen
          </Button>
        </form>
      </div>
    </div>
  );
};
