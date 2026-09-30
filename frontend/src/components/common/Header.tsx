import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Search, Bell, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
  isMobileOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle, isMobileOpen }) => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/70 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Mobile Menu Button */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={onMobileMenuToggle}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-lg mx-2 sm:mx-0">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search for a job role (e.g. Data Analyst, Software Engineer...)"
            className="w-full pl-10 pr-4 py-2 bg-slate-100/80 border border-slate-200/60 rounded-full text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
          />
        </div>
      </div>

      {/* Header Right Actions */}
      <div className="flex items-center space-x-3 sm:space-x-5">
        {/* Notifications Button */}
        <button
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User Profile Summary */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 text-left focus:outline-none group p-1 rounded-full hover:bg-slate-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-semibold text-xs flex items-center justify-center shadow-xs ring-2 ring-emerald-100">
                {getInitials(user.name || 'User')}
              </div>
              <div className="hidden sm:block leading-tight pr-1">
                <span className="block text-xs font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                  {user.name}
                </span>
                <span className="block text-[11px] text-slate-400 font-medium">
                  {user.targetRoles?.[0] || 'Computer Science • 3rd Year'}
                </span>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 text-xs text-slate-700 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="font-semibold text-slate-800">{user.name}</p>
                  <p className="text-slate-400 text-[11px] truncate">{user.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
