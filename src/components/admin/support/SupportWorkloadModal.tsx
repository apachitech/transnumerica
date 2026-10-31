'use client';

import React from 'react';
import { SupportAgentWorkload } from '@/types';
import { BarChart3, X, Users, AlertCircle, Clock, Star, CheckCircle } from 'lucide-react';

interface SupportWorkloadModalProps {
  workloads: SupportAgentWorkload[];
  isOpen: boolean;
  onClose: () => void;
}

export function SupportWorkloadModal({
  workloads,
  isOpen,
  onClose,
}: SupportWorkloadModalProps) {
  if (!isOpen) return null;

  const totalActive = workloads.reduce((sum, w) => sum + w.activeTicketsCount, 0);
  const totalBreaches = workloads.reduce((sum, w) => sum + w.slaBreachCount, 0);
  const totalResolved = workloads.reduce((sum, w) => sum + w.resolvedTodayCount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2.5 text-blue-400">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-base text-white">
              Supervision de la Charge de Travail des Agents
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Summary Metrics */}
        <div className="p-4 grid grid-cols-3 gap-3 bg-neutral-950 border-b border-neutral-800 text-xs">
          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
            <span className="text-neutral-400 block text-[11px]">Dossiers en Traitement</span>
            <span className="text-lg font-black text-white">{totalActive}</span>
          </div>
          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
            <span className="text-neutral-400 block text-[11px]">Dépassements SLA</span>
            <span className={`text-lg font-black ${totalBreaches > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {totalBreaches}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
            <span className="text-neutral-400 block text-[11px]">Clôturés Aujourd’hui</span>
            <span className="text-lg font-black text-emerald-400">{totalResolved}</span>
          </div>
        </div>

        {/* Agents List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {workloads.map((agent) => (
            <div
              key={agent.agentId}
              className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600/30 text-blue-300 font-bold flex items-center justify-center text-xs">
                    {agent.avatar}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{agent.name}</h4>
                    <p className="text-xs text-neutral-400">{agent.role} • {agent.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>★ {agent.csatAverage}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded bg-neutral-900 border border-neutral-800/80">
                  <span className="text-[10px] text-neutral-400 block">En cours</span>
                  <span className="font-bold text-white">{agent.activeTicketsCount} ticket(s)</span>
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-neutral-800/80">
                  <span className="text-[10px] text-neutral-400 block">Urgents</span>
                  <span className={`font-bold ${agent.urgentTicketsCount > 0 ? 'text-red-400' : 'text-neutral-300'}`}>
                    {agent.urgentTicketsCount}
                  </span>
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-neutral-800/80">
                  <span className="text-[10px] text-neutral-400 block">SLA Dépassé</span>
                  <span className={`font-bold ${agent.slaBreachCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {agent.slaBreachCount}
                  </span>
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-neutral-800/80">
                  <span className="text-[10px] text-neutral-400 block">Temps réponse</span>
                  <span className="font-bold text-neutral-300">~{agent.avgResponseMinutes} min</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

