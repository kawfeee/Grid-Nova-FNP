import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Zap,
  LayoutDashboard,
  Activity,
  ShoppingBag,
  ArrowUpRight,
  Network,
  ShieldCheck,
  Wallet,
  Menu,
  X,
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  currentUser: UserProfile | null;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Smart Meter', path: '/energy', icon: Activity },
    { name: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
    { name: 'Sell Energy', path: '/sell', icon: ArrowUpRight },
    { name: 'Neighbourhood', path: '/neighbourhood', icon: Network },
    { name: 'Transactions', path: '/transactions', icon: ShieldCheck },
  ];

  if (currentUser?.role === 'admin') {
    navLinks.push({ name: 'Admin Console', path: '/admin', icon: ShieldCheck });
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Grid<span className="text-emerald-600">Nova</span>
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 -mt-1">
                  P2P Energy Trading
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-emerald-50 text-emerald-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Wallet & Profile Badge */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Wallet Balance (Rule 50) */}
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-medium text-slate-500 uppercase leading-none">Wallet</div>
                <div className="text-xs font-bold text-slate-800">
                  ₹{currentUser?.wallet_balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                </div>
              </div>
            </div>

            {/* Profile Pill */}
            <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                {currentUser?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser?.full_name?.split(' ')[0] || 'User'}
                </div>
                <div className="text-[10px] uppercase font-semibold text-emerald-600 leading-none">
                  {currentUser?.role || 'Citizen'}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
