import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Leaf,
  Home,
  User,
  FileText,
  Target,
  Bookmark,
  FolderGit2,
  Lightbulb,
  Map,
  BarChart2,
  SlidersHorizontal,
  Search,
  Bell,
  LogOut,
  Menu,
  X,
  Mountain,
  Sparkles,
  FileCheck2,
  BarChart3
} from 'lucide-react';

interface AuthenticatedLayoutProps {
  user: any;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  user,
  onLogout,
  children
}) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigationItems = [
    { label: 'Home', path: '/dashboard', altPaths: ['/', '/home'], icon: Home },
    { label: 'My Profile', path: '/profile', icon: User },
    { label: 'Resume Analysis', path: '/resume', altPaths: ['/resumes'], icon: FileText },
    { label: 'ATS & Readability', path: '/ats-analyzer', altPaths: ['/ats'], icon: FileCheck2 },
    { label: 'Job Match', path: '/job-match', altPaths: ['/jobs', '/match'], icon: Target },
    { label: 'Skills & Evidence', path: '/skills', icon: Bookmark },
    { label: 'Projects', path: '/projects', icon: FolderGit2 },
    { label: 'Recommendations', path: '/recommendations', icon: Lightbulb },
    { label: 'Career Roadmap', path: '/roadmap', icon: Map },
    { label: 'Benchmarking', path: '/benchmarking', icon: BarChart2 },
    { label: 'Career Analytics', path: '/analytics', altPaths: ['/charts', '/skill-charts', '/readiness', '/readiness-visualization'], icon: BarChart3 },
    { label: 'Improvement Simulator', path: '/simulator', icon: SlidersHorizontal }
  ];

  const isItemActive = (item: typeof navigationItems[0]) => {
    if (location.pathname === item.path) return true;
    if (item.altPaths && item.altPaths.includes(location.pathname)) return true;
    if (item.path !== '/' && item.path !== '/dashboard' && location.pathname.startsWith(item.path)) return true;
    return false;
  };

  const displayName = user?.name || 'Dhibiksha';
  const displayRole = (user?.targetRoles && user.targetRoles[0]) || 'Data Analyst';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      {/* Sidebar (Left) */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-white border-r border-slate-200/70 p-4 justify-between min-h-screen fixed top-0 bottom-0 left-0 z-30">
        <div className="space-y-6">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 px-2 py-1">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Leaf className="w-4 h-4 fill-white" />
            </div>
            <span className="font-extrabold text-base text-slate-900 tracking-tight">CareerLens</span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navigationItems.map(item => {
              const Icon = item.icon;
              const active = isItemActive(item);

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs transition ${
                    active
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Quote & Sign Out */}
        <div className="pt-4 space-y-3">
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100/70 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <Mountain className="w-3.5 h-3.5" />
              <Sparkles className="w-3 h-3 text-emerald-500" />
            </div>
            <p className="italic text-slate-600 text-[10px] leading-relaxed">
              "A clearer perspective for a brighter career."
            </p>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 lg:pl-56 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/60 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Search Input */}
            <div className="relative w-96 max-w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search for a job role (e.g. Data Analyst, Software Engineer...)"
                className="w-full pl-9 pr-4 py-2 bg-slate-100/70 border border-slate-200/50 rounded-full text-xs text-slate-700 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-emerald-600 transition"
              />
            </div>
          </div>

          {/* Right Header: Notification + User Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative p-1.5 text-slate-500 hover:text-slate-800 cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
            </div>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200/60">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                {avatarLetter}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">{displayName}</div>
                <div className="text-[11px] text-slate-400 font-medium leading-tight">{displayRole}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex">
            <div className="w-64 bg-white h-full p-4 space-y-4 shadow-xl overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Leaf className="w-4 h-4 fill-white" />
                  </div>
                  <span className="font-extrabold text-sm text-slate-900">CareerLens</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navigationItems.map(item => {
                  const Icon = item.icon;
                  const active = isItemActive(item);

                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs transition ${
                        active
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-600 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-emerald-700' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Content Outlet */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
