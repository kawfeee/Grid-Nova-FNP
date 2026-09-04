import React from 'react';
import { Outlet } from 'react-router-dom';
import { SimulationHeader } from '../components/simulation/SimulationHeader';
import { Navbar } from './Navbar';
import { UserProfile } from '../types';

interface AppLayoutProps {
  currentUser: UserProfile | null;
  onUserSwitch: (userId: string) => void;
  refreshTrigger: number;
  onSimulationStateChange: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentUser,
  onUserSwitch,
  onSimulationStateChange,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Simulation Bar */}
      <SimulationHeader
        currentUser={currentUser}
        onUserSwitch={onUserSwitch}
        onStateChange={onSimulationStateChange}
      />

      {/* Main Navigation */}
      <Navbar currentUser={currentUser} />

      {/* Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Footer / Transparency Disclaimer (Rule 16 & 87) */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-bold text-slate-800">GridNova</span> — AI-Driven Blockchain P2P Renewable Energy Trading MVP.
          </div>
          <p className="text-[11px] text-slate-400 max-w-md">
            Energy generation, IoT smart meters, and blockchain verification are simulated digitally to demonstrate decentralized neighbourhood trading.
          </p>
        </div>
      </footer>
    </div>
  );
};
