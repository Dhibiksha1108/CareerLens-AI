import React from 'react';
import { Outlet } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7fb] p-4">
      <div className="w-full max-w-md bg-white border border-slate-200/70 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white mb-3 shadow-xs">
            <Leaf className="w-6 h-6 fill-white/20" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            CareerLens
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Intelligent Career Profile Analysis & Growth Platform
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};
