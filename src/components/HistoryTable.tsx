import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { VerificationSession, VerificationStatus } from '../types';
import { 
  History, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Copy, 
  Check, 
  Trash2, 
  Search,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

interface HistoryTableProps {
  sessions: VerificationSession[];
  onDeleteSession?: (id: string) => void;
  onClearAll?: () => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  sessions,
  onDeleteSession,
  onClearAll,
}) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'All' | VerificationStatus>('All');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredSessions = sessions.filter((s) => {
    const matchesFilter = filter === 'All' ? true : s.status === filter;
    const matchesSearch =
      s.targetService.toLowerCase().includes(search.toLowerCase()) ||
      s.phoneNumber.toLowerCase().includes(search.toLowerCase()) ||
      (s.smsCode && s.smsCode.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCsv = () => {
    if (sessions.length === 0) return;
    const headers = ['ID', 'Service', 'Phone Number', 'Status', 'OTP Code', 'Cost', 'Simulated', 'Auto-Refunded', 'Created At'];
    const rows = sessions.map((s) => [
      s.id,
      s.targetService,
      `"${s.phoneNumber}"`,
      s.status,
      s.smsCode || '',
      s.cost,
      s.isSimulated ? 'Yes' : 'No',
      s.autoRefunded ? 'Yes' : 'No',
      s.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `textverified_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            {t.historyTitle}
          </h2>
          <p className="text-xs text-slate-400">
            {sessions.length} total verification events recorded
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {sessions.length > 0 && (
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.exportCsv}</span>
            </button>
          )}
          {onClearAll && sessions.length > 0 && (
            <button
              onClick={onClearAll}
              className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-xs font-medium text-rose-300 border border-rose-800/40 transition flex items-center gap-1 cursor-pointer"
              title="Clear all records"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter and search toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 my-4">
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Completed', 'Pending', 'Cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${
                filter === tab
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab === 'All'
                ? t.filterAll
                : tab === 'Completed'
                ? t.filterCompleted
                : tab === 'Pending'
                ? t.filterPending
                : t.filterCancelled}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {filteredSessions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            {t.noHistory}
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-3">Service</th>
                <th className="py-3 px-3">Number</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">OTP Code</th>
                <th className="py-3 px-3">Cost / Mode</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredSessions.map((session) => {
                const isCompleted = session.status === 'Completed';
                const isRefunded = session.status === 'Cancelled' || session.status === 'TimedOut' || session.autoRefunded;

                return (
                  <tr key={session.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3 font-sans font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 font-normal" />
                        <span>{session.targetService}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-200">
                      {session.phoneNumber}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Completed
                        </span>
                      ) : isRefunded ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-medium">
                          <ShieldCheck className="w-3 h-3" />
                          Auto-Refunded
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[11px] font-medium">
                          <Clock className="w-3 h-3 animate-spin" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {session.smsCode ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-300 text-sm bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                            {session.smsCode}
                          </span>
                          <button
                            onClick={() => handleCopyCode(session.id, session.smsCode!)}
                            className="p-1 text-slate-400 hover:text-emerald-400 transition"
                            title="Copy Code"
                          >
                            {copiedId === session.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      <div>
                        <span className="text-slate-200 font-semibold">${session.cost?.toFixed(2) || '0.50'}</span>
                        <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-sans">
                          {session.isSimulated ? 'Sim' : 'Live'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px] font-sans">
                      {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {onDeleteSession && (
                        <button
                          onClick={() => onDeleteSession(session.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Remove entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
