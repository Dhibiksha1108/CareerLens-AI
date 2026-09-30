import React from 'react';
import { NavLink } from 'react-router-dom';
import { navItems } from '../../data/navigation';
import { Leaf, Trees, Mountain } from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/70 flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand Logo Header */}
          <div className="h-16 px-6 flex items-center space-x-2.5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xs">
              <Leaf className="w-4 h-4 fill-white/20" />
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">
              CareerLens
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[#e2f5ec] text-[#065f46] font-semibold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Bottom Illustration & Quote Banner */}
          <div className="m-3 p-4 rounded-2xl bg-gradient-to-b from-teal-50/50 to-emerald-50/70 border border-emerald-100/60 overflow-hidden relative group">
            <div className="flex items-center space-x-2 mb-2 text-emerald-800">
              <Mountain className="w-4 h-4 text-emerald-600" />
              <Trees className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600 font-medium italic relative z-10">
              "A clearer perspective for a brighter career."
            </p>
            {/* Subtle decorative background shape */}
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-emerald-200/30 rounded-full blur-sm" />
          </div>
        </div>
      </aside>
    </>
  );
};
