'use client';

import React, { useState } from 'react';
import { SupportTicket, SupportAgentWorkload } from '@/types';
import { UserCheck, X, Shield, Clock } from 'lucide-react';

interface SupportAssignModalProps {
  ticket: SupportTicket | null;
  workloads: SupportAgentWorkload[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedTicket: SupportTicket) => void;
}

export function SupportAssignModal({
  ticket,
  workloads,
  isOpen,
  onClose,
  onSuccess,
}: SupportAssignModalProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(
    ticket?.assignedAgent?.id || (workloads[0]?.agentId ?? '')
  );
  const [reason, setReason] = useState('Attribution pour prise en charge et investigation');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId) {
      setError('Veuillez sélectionner un agent de support.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/support/tickets/${ticket.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgentId,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l’attribution de l’agent');
      }

      onSuccess(data.ticket);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2.5 text-blue-400">
            <UserCheck className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-base text-white">
              Assigner un Agent de Support
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="text-xs text-neutral-300">
            Dossier <strong className="text-white">{ticket.ticketNumber}</strong> • {ticket.title} ({ticket.requesterName})
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-xs text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-2">
              Agents disponibles & charge en cours ({workloads.length})
            </label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {workloads.map((agent) => (
                <label
                  key={agent.agentId}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                    selectedAgentId === agent.agentId
                      ? 'bg-blue-950/40 border-blue-500 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="support_agent"
                      value={agent.agentId}
                      checked={selectedAgentId === agent.agentId}
                      onChange={() => setSelectedAgentId(agent.agentId)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-bold text-xs text-white flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-300 text-[10px] flex items-center justify-center font-bold">
                          {agent.avatar}
                        </span>
                        <span>{agent.name}</span>
                      </p>
                      <p className="text-[11px] text-neutral-400">{agent.role}</p>
                    </div>
                  </div>
                  <div className="text-right text-[11px]">
                    <span className="font-semibold text-amber-400">{agent.activeTicketsCount} en cours</span>
                    <p className="text-neutral-500">Note : ★ {agent.csatAverage}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Motif de réassignation ou directive interne
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-xs text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedAgentId}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition shadow"
            >
              {isSubmitting ? 'Attribution...' : 'Confirmer l’Assignation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

