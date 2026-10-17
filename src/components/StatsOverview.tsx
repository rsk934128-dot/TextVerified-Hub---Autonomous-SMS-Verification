import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { VerificationSession } from '../types';
import { CheckCircle2, DollarSign, RotateCcw, Activity } from 'lucide-react';

interface StatsOverviewProps {
  sessions: VerificationSession[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ sessions }) => {
  const { t } = useLanguage();

  const total = sessions.length;
  const completed = sessions.filter((s) => s.status === 'Completed').length;
  const refunded = sessions.filter((s) => s.status === 'Cancelled' || s.status === 'TimedOut' || s.autoRefunded).length;
  const totalCost = sessions
    .filter((s) => s.status === 'Completed')
    .reduce((acc, curr) => acc + (curr.cost || 0.5), 0);

  const successRate = total > 0 ? Math.round((completed / total) * 100) : 100;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">{t.statsTotal}</p>
          <p className="text-xl sm:text-2xl font-bold font-mono text-white mt-0.5">{total}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Activity className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">{t.statsSuccess}</p>
          <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-0.5">{successRate}%</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">{t.statsSpent}</p>
          <p className="text-xl sm:text-2xl font-bold font-mono text-cyan-400 mt-0.5">${totalCost.toFixed(2)}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          <DollarSign className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">{t.statsRefunded}</p>
          <p className="text-xl sm:text-2xl font-bold font-mono text-amber-400 mt-0.5">{refunded}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <RotateCcw className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
