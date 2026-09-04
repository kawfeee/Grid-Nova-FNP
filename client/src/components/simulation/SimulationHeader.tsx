import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, FastForward, RotateCcw, UserCheck, Sun, Moon, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { NeighbourhoodState, UserProfile } from '../../types';

interface SimulationHeaderProps {
  onStateChange: () => void;
  currentUser: UserProfile | null;
  onUserSwitch: (userId: string) => void;
}

export const SimulationHeader: React.FC<SimulationHeaderProps> = ({
  onStateChange,
  currentUser,
  onUserSwitch,
}) => {
  const [state, setState] = useState<NeighbourhoodState | null>(null);
  const [demoUsers, setDemoUsers] = useState<(UserProfile & { tag: string; houseName: string })[]>([]);
  const [isAutoRun, setIsAutoRun] = useState(false);
  const [isStepping, setIsStepping] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const autoRunTimerRef = useRef<number | null>(null);

  const fetchState = async () => {
    try {
      const [nState, users] = await Promise.all([
        api.getSimulationState(),
        api.getDemoUsers(),
      ]);
      setState(nState);
      setDemoUsers(users);
    } catch (err) {
      console.error('Failed to load simulation header state:', err);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleStep = async () => {
    try {
      setIsStepping(true);
      const updated = await api.stepSimulation();
      setState(updated);
      onStateChange();
    } catch (err) {
      console.error('Step error:', err);
    } finally {
      setIsStepping(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Reset simulation neighbourhood to original seed state?')) {
      try {
        setIsResetting(true);
        const updated = await api.resetSimulation();
        setState(updated);
        onStateChange();
      } catch (err) {
        console.error('Reset error:', err);
      } finally {
        setIsResetting(false);
      }
    }
  };

  const toggleAutoRun = () => {
    setIsAutoRun((prev) => !prev);
  };

  useEffect(() => {
    if (isAutoRun) {
      autoRunTimerRef.current = window.setInterval(async () => {
        try {
          const updated = await api.stepSimulation();
          setState(updated);
          onStateChange();
        } catch (err) {
          console.error('Auto run error:', err);
        }
      }, 4000);
    } else {
      if (autoRunTimerRef.current) {
        clearInterval(autoRunTimerRef.current);
        autoRunTimerRef.current = null;
      }
    }
    return () => {
      if (autoRunTimerRef.current) {
        clearInterval(autoRunTimerRef.current);
      }
    };
  }, [isAutoRun]);

  const hour = state?.time_of_day_hour ?? 14;
  const isDaytime = hour >= 6 && hour <= 18;

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 px-4 py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Simulation Time & Disclaimer */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700">
            {isDaytime ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
            <span className="font-mono font-bold text-amber-400">
              {state ? state.time_label : '14:00 (Afternoon)'}
            </span>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium text-[11px]">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            IoT & Smart Meter Simulation
          </span>
        </div>

        {/* Center: Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleStep}
            disabled={isStepping || isAutoRun}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 transition disabled:opacity-50 text-slate-200 font-medium"
            title="Advance 1 interval"
          >
            <FastForward className="w-3.5 h-3.5 text-emerald-400" />
            <span>Next Interval</span>
          </button>

          <button
            onClick={toggleAutoRun}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-medium transition ${
              isAutoRun
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            {isAutoRun ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoRun ? 'Pause Auto' : 'Auto Run'}</span>
          </button>

          <button
            onClick={handleReset}
            disabled={isResetting}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/30 hover:text-rose-300 border border-slate-700 transition text-slate-300 font-medium"
            title="Reset Simulation to Initial Seed State (Rule 61)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>

        {/* Right: Quick 1-Click Demo Account Switcher */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 hidden xl:inline">Demo Role:</span>
          <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            {demoUsers.map((u) => {
              const isSelected = currentUser?.id === u.id;
              const shortLabel = u.role === 'admin' ? 'Admin' : u.full_name.split(' ')[0];
              return (
                <button
                  key={u.id}
                  onClick={() => onUserSwitch(u.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  title={`${u.tag} - ${u.email}`}
                >
                  {isSelected && <UserCheck className="w-3 h-3 text-emerald-200" />}
                  {shortLabel}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
