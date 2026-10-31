'use client';

import React, { useState } from 'react';
import {
  SupportTicket,
  CannedResponse,
  CongoleseLanguage,
  SupportMessageChannel,
} from '@/types';
import {
  X,
  MessageSquare,
  Send,
  Phone,
  Mail,
  Lock,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  Star,
  FileText,
  DollarSign,
  Languages,
} from 'lucide-react';

interface SupportDetailDrawerProps {
  ticket: SupportTicket | null;
  cannedResponses: CannedResponse[];
  isOpen: boolean;
  onClose: () => void;
  onOpenAssign: (ticket: SupportTicket) => void;
  onOpenResolve: (ticket: SupportTicket) => void;
  onTicketUpdated: (ticket: SupportTicket) => void;
}

export function SupportDetailDrawer({
  ticket,
  cannedResponses,
  isOpen,
  onClose,
  onOpenAssign,
  onOpenResolve,
  onTicketUpdated,
}: SupportDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'THREAD' | 'DETAILS'>('THREAD');
  const [channel, setChannel] = useState<SupportMessageChannel>('WHATSAPP');
  const [messageText, setMessageText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<CongoleseLanguage>(
    ticket?.preferredLanguage || 'FR'
  );
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !ticket) return null;

  const handleApplyCanned = (cannedId: string) => {
    const item = cannedResponses.find((c) => c.id === cannedId);
    if (!item) return;

    let text = item.fr;
    if (selectedLanguage === 'LN') text = item.ln;
    else if (selectedLanguage === 'SW') text = item.sw;
    else if (selectedLanguage === 'TSH') text = item.tsh;
    else if (selectedLanguage === 'EN') text = item.en;

    setMessageText(text);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim().length < 2) return;

    setIsSending(true);
    setError(null);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/support/tickets/${ticket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: isInternalNote ? 'INTERNAL_NOTE' : channel,
          content: messageText.trim(),
          isInternal: isInternalNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l’envoi');
      }

      setMessageText('');
      setFeedback(data.message);
      onTicketUpdated(data.ticket);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSending(false);
    }
  };

  const handleEscalate = async () => {
    const reason = prompt(
      'Motif de l’escalade vers le Superviseur Senior N2 (priorité CRITIQUE) :'
    );
    if (!reason || reason.trim().length < 5) return;

    try {
      const res = await fetch(`/api/admin/support/tickets/${ticket.id}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedback(data.message);
      onTicketUpdated(data.ticket);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const getPriorityBadge = () => {
    switch (ticket.priority) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
            CRITIQUE (SLA 1h)
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-orange-500/20 text-orange-400 border border-orange-500/40">
            ÉLEVÉE (SLA 4h)
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            MOYENNE (SLA 12h)
          </span>
        );
      case 'LOW':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-300">
            NORMALE (SLA 24h)
          </span>
        );
    }
  };

  const getStatusBadge = () => {
    switch (ticket.status) {
      case 'OPEN':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">NOUVEAU</span>;
      case 'INVESTIGATING':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">ENQUÊTE EN COURS</span>;
      case 'RESOLVED':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">RÉSOLU</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">REJETÉ</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-40 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div
          id="support-drawer"
          className="w-screen max-w-2xl bg-neutral-900 border-l border-neutral-800 text-white flex flex-col shadow-2xl"
        >
          {/* Drawer Header */}
          <div className="p-5 border-b border-neutral-800 bg-neutral-950 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Ticket {ticket.ticketNumber}
                </h2>
                {getStatusBadge()}
                {getPriorityBadge()}
                {ticket.isSlaBreached && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white animate-pulse flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>SLA DÉPASSÉ</span>
                  </span>
                )}
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-blue-300">
                  {ticket.preferredLanguage}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                {ticket.title} • Demandeur : <span className="text-white font-semibold">{ticket.requesterName}</span> ({ticket.requesterType})
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Linked Entity Card & Financial Dispute Banner */}
          <div className="px-5 py-3 bg-neutral-950/80 border-b border-neutral-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Élément Lié :</span>
              <span className="font-mono font-bold text-blue-400 bg-blue-950/50 px-2 py-0.5 rounded border border-blue-500/30">
                {ticket.linkedType} • {ticket.linkedReference}
              </span>
            </div>
            {ticket.amountInDisputeMinor ? (
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Montant contesté : {(ticket.amountInDisputeMinor / 100).toLocaleString('fr-FR')} {ticket.currency}</span>
              </div>
            ) : null}
          </div>

          {/* Escalation Alert */}
          {ticket.escalatedAt && (
            <div className="px-5 py-2.5 bg-red-950/40 border-b border-red-500/30 text-xs text-red-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>Dossier sous escalade Superviseur N2 : "{ticket.escalatedReason}"</span>
              </span>
              <span className="text-[10px] text-red-400">
                {new Date(ticket.escalatedAt).toLocaleTimeString('fr-FR')}
              </span>
            </div>
          )}

          {feedback && (
            <div className="bg-emerald-600/90 text-white px-4 py-2 text-xs font-semibold text-center">
              {feedback}
            </div>
          )}
          {error && (
            <div className="bg-red-600/90 text-white px-4 py-2 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {/* Tabs Navigation */}
          <div className="flex border-b border-neutral-800 bg-neutral-950 px-5 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('THREAD')}
              className={`py-3 font-semibold border-b-2 mr-5 transition ${
                activeTab === 'THREAD'
                  ? 'border-blue-500 text-white font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Discussion & Réponses ({ticket.messages.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('DETAILS')}
              className={`py-3 font-semibold border-b-2 transition ${
                activeTab === 'DETAILS'
                  ? 'border-blue-500 text-white font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Fiche & Données Audit
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {activeTab === 'THREAD' && (
              <div className="space-y-4">
                {/* Message History */}
                <div className="space-y-3">
                  {ticket.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                        msg.isInternal
                          ? 'bg-amber-950/25 border-amber-500/40 text-amber-200 ml-4'
                          : msg.senderRole === 'CUSTOMER'
                            ? 'bg-neutral-950 border-neutral-800 text-neutral-200 mr-4'
                            : 'bg-blue-950/30 border-blue-500/30 text-white ml-4'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold flex items-center gap-1.5">
                          {msg.isInternal && <Lock className="w-3 h-3 text-amber-400" />}
                          <span>{msg.sender}</span>
                          <span className="text-[10px] text-neutral-400 font-normal">
                            ({msg.channel})
                          </span>
                        </span>
                        <span className="text-neutral-500 text-[10px]">
                          {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  ))}
                </div>

                {/* CSAT Rating if resolved */}
                {ticket.csatRating && (
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">Avis & Satisfaction Client (CSAT)</span>
                      {ticket.csatFeedback && (
                        <p className="text-neutral-400 italic mt-0.5 text-[11px]">
                          "{ticket.csatFeedback}"
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < (ticket.csatRating || 0)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-neutral-700'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-white">{ticket.csatRating}/5</span>
                    </div>
                  </div>
                )}

                {/* Reply Composer Form */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                    {/* Channel selection */}
                    <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
                      <button
                        type="button"
                        onClick={() => {
                          setChannel('WHATSAPP');
                          setIsInternalNote(false);
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                          channel === 'WHATSAPP' && !isInternalNote
                            ? 'bg-emerald-600 text-white'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setChannel('SMS');
                          setIsInternalNote(false);
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                          channel === 'SMS' && !isInternalNote
                            ? 'bg-blue-600 text-white'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        SMS
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setChannel('EMAIL');
                          setIsInternalNote(false);
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                          channel === 'EMAIL' && !isInternalNote
                            ? 'bg-purple-600 text-white'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        Email
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsInternalNote(true)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition ${
                          isInternalNote
                            ? 'bg-amber-600 text-white'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        <Lock className="w-3 h-3" />
                        <span>Note Interne</span>
                      </button>
                    </div>

                    {/* Canned Responses Language Selector */}
                    <div className="flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5 text-blue-400" />
                      <select
                        value={selectedLanguage}
                        onChange={(e) =>
                          setSelectedLanguage(e.target.value as CongoleseLanguage)
                        }
                        className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-[11px] text-white"
                      >
                        <option value="FR">Français</option>
                        <option value="LN">Lingala</option>
                        <option value="SW">Swahili</option>
                        <option value="TSH">Tshiluba</option>
                        <option value="EN">English</option>
                      </select>
                    </div>
                  </div>

                  {/* Canned responses dropdown */}
                  <div>
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleApplyCanned(e.target.value);
                      }}
                      defaultValue=""
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-[11px] text-neutral-300"
                    >
                      <option value="" disabled>
                        ⚡ Insérer une réponse préenregistrée (Modèles en {selectedLanguage})...
                      </option>
                      {cannedResponses.map((c) => (
                        <option key={c.id} value={c.id}>
                          [{c.category}] {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Textarea */}
                  <textarea
                    rows={3}
                    required
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={
                      isInternalNote
                        ? 'Rédiger une note interne (visible uniquement par les modérateurs et superviseurs)...'
                        : `Rédiger votre réponse au client via ${channel}...`
                    }
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] text-neutral-500">
                      {isInternalNote
                        ? '🔒 Cette note sera sauvegardée au journal d’audit.'
                        : `Notification envoyée au ${ticket.requesterPhone}`}
                    </span>
                    <button
                      type="submit"
                      disabled={isSending || messageText.trim().length < 2}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 disabled:opacity-50 transition shadow"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSending ? 'Envoi...' : 'Envoyer la Réponse'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'DETAILS' && (
              <div className="space-y-4 text-xs">
                {/* Requester Profile */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <h3 className="font-bold text-neutral-400 uppercase text-[10px] tracking-wider">
                    Informations du Demandeur
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-neutral-300">
                    <div>
                      <span className="text-neutral-500 block text-[10px]">Nom complet</span>
                      <span className="font-semibold text-white">{ticket.requesterName}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px]">Type de compte</span>
                      <span className="font-semibold text-white">{ticket.requesterType}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px]">Téléphone</span>
                      <span className="font-mono text-emerald-400">{ticket.requesterPhone}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px]">Langue de contact</span>
                      <span className="font-semibold text-white">{ticket.preferredLanguage}</span>
                    </div>
                  </div>
                </div>

                {/* SLA Details */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <h3 className="font-bold text-neutral-400 uppercase text-[10px] tracking-wider">
                    Objectifs & Engagements SLA
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-neutral-300">
                    <div>
                      <span className="text-neutral-500 block text-[10px]">Délai maximal</span>
                      <span className="font-semibold text-white">{ticket.slaHours} heure(s)</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px]">Échéance limite</span>
                      <span className="font-mono text-white">
                        {new Date(ticket.slaDueAt).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px]">Statut SLA</span>
                      <span className={ticket.isSlaBreached ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {ticket.isSlaBreached ? 'DÉPASSÉ (NON-CONFORME)' : 'DANS LES DÉLAIS'}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px]">Agent assigné</span>
                      <span className="font-semibold text-white">
                        {ticket.assignedAgent?.name || 'Non assigné'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Resolution Details if any */}
                {ticket.resolution && (
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                    <h3 className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Détails de Clôture & Remboursement</span>
                    </h3>
                    <div className="space-y-1 text-neutral-300">
                      <p>Code : <strong className="text-white">{ticket.resolution.code}</strong></p>
                      {ticket.resolution.refundReference && (
                        <p className="font-mono text-emerald-400">
                          Réf Remboursement : {ticket.resolution.refundReference} ({(ticket.resolution.refundAmountMinor || 0) / 100} CDF)
                        </p>
                      )}
                      <p className="text-neutral-400 italic">"{ticket.resolution.note}"</p>
                      <p className="text-[10px] text-neutral-500">
                        Validé par {ticket.resolution.resolvedBy} le {new Date(ticket.resolution.resolvedAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenAssign(ticket)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Assigner</span>
              </button>

              <button
                type="button"
                onClick={handleEscalate}
                disabled={ticket.priority === 'CRITICAL'}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white disabled:opacity-40 text-xs font-semibold transition border border-red-500/30"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Escalader N2</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => onOpenResolve(ticket)}
              disabled={ticket.status === 'RESOLVED'}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-xs font-bold text-white transition shadow"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Résoudre / Rembourser</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

