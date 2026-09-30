import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'green' | 'blue' | 'purple' | 'orange';
  progressPercentage?: number;
  actionText?: string;
  onAction?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'green',
  progressPercentage,
  actionText,
  onAction
}) => {
  const variantStyles = {
    green: {
      bg: 'bg-[#eefcf6]',
      border: 'border-[#d1f7e5]',
      iconBg: 'bg-emerald-500/15 text-emerald-700',
      badgeText: 'text-emerald-700 font-semibold',
      ringColor: '#10b981'
    },
    blue: {
      bg: 'bg-[#eff6ff]',
      border: 'border-[#dbeafe]',
      iconBg: 'bg-blue-500/15 text-blue-700',
      badgeText: 'text-blue-700 font-medium',
      ringColor: '#3b82f6'
    },
    purple: {
      bg: 'bg-[#f5f3ff]',
      border: 'border-[#ede9fe]',
      iconBg: 'bg-purple-500/15 text-purple-700',
      badgeText: 'text-purple-700 font-medium',
      ringColor: '#8b5cf6'
    },
    orange: {
      bg: 'bg-[#fff7ed]',
      border: 'border-[#ffedd5]',
      iconBg: 'bg-orange-500/15 text-orange-700',
      badgeText: 'text-orange-700 font-medium',
      ringColor: '#f97316'
    }
  };

  const style = variantStyles[variant];

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={`p-5 rounded-2xl ${style.bg} border ${style.border} flex flex-col justify-between relative overflow-hidden shadow-2xs`}
    >
      <div className="flex items-start justify-between">
        {progressPercentage !== undefined ? (
          /* Circular Progress Meter */
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="currentColor"
                strokeWidth="4"
                className="text-slate-200/80"
                fill="transparent"
              />
              <motion.circle
                cx="28"
                cy="28"
                r="22"
                stroke={style.ringColor}
                strokeWidth="4"
                strokeDasharray="138"
                initial={{ strokeDashoffset: 138 }}
                animate={{ strokeDashoffset: 138 - (138 * progressPercentage) / 100 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xs font-bold text-slate-800">
              {value}
            </span>
          </div>
        ) : (
          Icon && (
            <div className={`w-10 h-10 rounded-xl ${style.iconBg} flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
          )
        )}

        <div className="text-right flex-1 ml-3">
          <span className="text-xs font-medium text-slate-500 block">
            {title}
          </span>
          {progressPercentage === undefined && (
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight block mt-0.5">
              {value}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 pt-2 flex items-center justify-between border-t border-slate-900/5">
        <span className={`text-[11px] ${style.badgeText}`}>
          {subtitle}
        </span>
        {actionText && (
          <button
            onClick={onAction}
            className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:underline transition-colors"
          >
            {actionText}
          </button>
        )}
      </div>
    </motion.div>
  );
};
