import React, { useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { EngineLog } from '../services/TextVerifiedEngine';
import { Terminal, Trash2, Copy, Bot, Check } from 'lucide-react';

interface AutonomousLogsProps {
  logs: EngineLog[];
  onClearLogs: () => void;
}

export const AutonomousLogs: React.FC<AutonomousLogsProps> = ({ logs, onClearLogs }) => {
  const { t } = useLanguage();
  const logEndRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 font-mono shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <Bot className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            {t.logsTitle}
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
            Autonomous
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleCopyLogs}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition text-xs flex items-center gap-1"
            title="Copy Logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClearLogs}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
            title={t.clearLogs}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="h-44 sm:h-52 overflow-y-auto space-y-1.5 pr-2 text-xs">
        {logs.length === 0 ? (
          <p className="text-slate-600 italic py-4 text-center">
            Agent idle. Waiting for verification task initiation...
          </p>
        ) : (
          logs.map((log, index) => {
            const colorClass =
              log.level === 'success'
                ? 'text-emerald-400'
                : log.level === 'warn'
                ? 'text-amber-400'
                : log.level === 'error'
                ? 'text-rose-400'
                : 'text-slate-300';

            return (
              <div key={index} className="flex items-start space-x-2 leading-relaxed">
                <span className="text-slate-500 shrink-0 text-[11px] select-none">
                  {log.timestamp}
                </span>
                <span className="text-slate-600 select-none">❯</span>
                <span className={`${colorClass} break-all`}>
                  {log.message}
                </span>
              </div>
            );
          })
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};
