'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SupportTicket,
  SupportAgentWorkload,
  CannedResponse,
  SupportTicketStatus,
  SupportTicketPriority,
  SupportTicketRequesterType,
} from '@/types';
import {
  LifeBuoy,
  Search,
  Filter,
  Download,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  DollarSign,
  BarChart3,
  Star,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { SupportAssignModal } from './SupportAssignModal';
import { SupportResolveRefundModal } from './SupportResolveRefundModal';
import { SupportWorkloadModal } from './SupportWorkloadModal';
import { SupportDetailDrawer } from './SupportDetailDrawer';

export function AdminSupportDashboard() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [workloads, setWorkloads] = useState<SupportAgentWorkload[]>([]);
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [requesterFilter, setRequesterFilter] = useState<string>('ALL');
  const [slaFilter, setSlaFilter] = useState<string>('ALL');

  // Modals & Drawer state
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isWorkloadModalOpen, setIsWorkloadModalOpen] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('query', searchQuery);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (priorityFilter !== 'ALL') params.set('priority', priorityFilter);
      if (requesterFilter !== 'ALL') params.set('requesterType', requesterFilter);
      if (slaFilter !== 'ALL') params.set('slaStatus', slaFilter);

      const res = await fetch(`/api/admin/support/tickets?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, priorityFilter, requesterFilter, slaFilter]);

  const fetchWorkloads = async () => {
    try {
      const res = await fetch('/api/admin/support/workload');
      if (res.ok) {
        const data = await res.json();
        setWorkloads(data.workloads || []);
      }
    } catch {
      // Ignored
    }
  };

  const fetchCanned = async () => {
    try {
      const res = await fetch('/api/admin/support/canned-replies');
      if (res.ok) {
        const data = await res.json();
        setCannedResponses(data.canned || []);
      }
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchWorkloads();
    fetchCanned();
  }, [fetchTickets]);

  const handleTicketUpdated = (updated: SupportTicket) => {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    if (selectedTicket?.id === updated.id) {
      setSelectedTicket(updated);
    }
    fetchWorkloads();
  };

  // KPIs
  const activeCount = useMemo(
    () => tickets.filter((t) => t.status === 'OPEN' || t.status === 'INVESTIGATING').length,
    [tickets]
  );
  const breachedCount = useMemo(
    () => tickets.filter((t) => t.isSlaBreached).length,
    [tickets]
  );
  const disputedTotalCDF = useMemo(
    () =>
      tickets
        .filter((t) => t.amountInDisputeMinor && (t.status === 'OPEN' || t.status === 'INVESTIGATING'))
        .reduce((sum, t) => sum + (t.amountInDisputeMinor || 0) / 100, 0),
    [tickets]
  );
  const csatAvg = useMemo(() => {
    const rated = tickets.filter((t) => typeof t.csatRating === 'number');
    if (rated.length === 0) return 4.8;
    return Number(
      (rated.reduce((sum, t) => sum + (t.csatRating || 0), 0) / rated.length).toFixed(1)
    );
  }, [tickets]);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <LifeBuoy className="w-6 h-6 text-blue-400" />
            Centre de Support & Gestion des Litiges
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Assistance usagers, chauffeurs et partenaires flottes, SLA timers, arbitrage litiges et remboursements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsWorkloadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 transition shadow"
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            <span>Charge des Agents</span>
          </button>

          <a
            href="/api/admin/support/export"
            download
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 transition shadow"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exporter CSV</span>
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 shadow">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Dossiers Actifs</span>
            <LifeBuoy className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white">{activeCount}</p>
          <span className="text-[11px] text-neutral-500">En cours d'investigation</span>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 shadow">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Alertes SLA Dépassé</span>
            <Clock className={`w-4 h-4 ${breachedCount > 0 ? 'text-red-400 animate-pulse' : 'text-neutral-500'}`} />
          </div>
          <p className={`text-2xl font-black ${breachedCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {breachedCount}
          </p>
          <span className="text-[11px] text-neutral-500">Intervention prioritaire</span>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 shadow">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Litiges Financiers Ouverts</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">
            {disputedTotalCDF.toLocaleString('fr-FR')} CDF
          </p>
          <span className="text-[11px] text-neutral-500">Remboursements en attente</span>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 shadow">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Satisfaction Client CSAT</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">★ {csatAvg} <span className="text-xs text-neutral-500 font-normal">/ 5.0</span></p>
          <span className="text-[11px] text-neutral-500">Moyenne des avis résolus</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3 shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher ticket, nom, tél..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={requesterFilter}
              onChange={(e) => setRequesterFilter(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
            >
              <option value="ALL">Tous les Demandeurs</option>
              <option value="USER">Passagers (USER)</option>
              <option value="DRIVER">Chauffeurs / Coursiers (DRIVER)</option>
              <option value="OPERATOR">Opérateurs Flottes (OPERATOR)</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
            >
              <option value="ALL">Tous les Statuts</option>
              <option value="OPEN">Nouveaux (OPEN)</option>
              <option value="INVESTIGATING">En Enquête (INVESTIGATING)</option>
              <option value="RESOLVED">Résolus (RESOLVED)</option>
              <option value="REJECTED">Rejetés (REJECTED)</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
            >
              <option value="ALL">Toutes les Priorités</option>
              <option value="CRITICAL">Critique (CRITICAL)</option>
              <option value="HIGH">Élevée (HIGH)</option>
              <option value="MEDIUM">Moyenne (MEDIUM)</option>
              <option value="LOW">Normale (LOW)</option>
            </select>
          </div>

          <div>
            <select
              value={slaFilter}
              onChange={(e) => setSlaFilter(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
            >
              <option value="ALL">Tous les Délais SLA</option>
              <option value="BREACHED">SLA Dépassé (Non-conforme)</option>
              <option value="ACTIVE">Dans les Délais</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table / List */}
      <div className="rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Boîte de Réception Support ({tickets.length})</span>
          </h2>
          <span className="text-xs text-neutral-400">
            Cliquez sur un ticket pour ouvrir le panneau d'intervention
          </span>
        </div>

        {/* Desktop Table */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
              <tr>
                <th className="p-3">Ticket / Date</th>
                <th className="p-3">Demandeur & Profil</th>
                <th className="p-3">Élément Lié</th>
                <th className="p-3">Sujet & Priorité</th>
                <th className="p-3">SLA & Délai</th>
                <th className="p-3">Agent Assigné</th>
                <th className="p-3">Statut</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-neutral-500 italic">
                    Aucun ticket ne correspond aux critères sélectionnés.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setIsDetailDrawerOpen(true);
                    }}
                    className={`hover:bg-neutral-800/60 cursor-pointer transition ${
                      ticket.isSlaBreached ? 'bg-red-950/15 hover:bg-red-950/25' : ''
                    }`}
                  >
                    <td className="p-3">
                      <span className="font-bold text-white block">{ticket.ticketNumber}</span>
                      <span className="text-[11px] text-neutral-400">
                        {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </td>

                    <td className="p-3">
                      <p className="font-semibold text-white">{ticket.requesterName}</p>
                      <p className="text-[11px] text-neutral-400 font-mono">{ticket.requesterPhone}</p>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 inline-block mt-0.5">
                        {ticket.requesterType} • {ticket.preferredLanguage}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="font-mono text-[11px] font-bold text-blue-400 block">
                        {ticket.linkedReference}
                      </span>
                      <span className="text-[10px] text-neutral-400">{ticket.linkedType}</span>
                    </td>

                    <td className="p-3 max-w-xs">
                      <p className="font-semibold text-white line-clamp-1">{ticket.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          ticket.priority === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-400'
                            : ticket.priority === 'HIGH'
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-neutral-800 text-neutral-300'
                        }`}>
                          {ticket.priority}
                        </span>
                        {ticket.amountInDisputeMinor ? (
                          <span className="text-[10px] text-amber-400 font-semibold">
                            {(ticket.amountInDisputeMinor / 100).toLocaleString('fr-FR')} CDF
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td className="p-3">
                      {ticket.isSlaBreached ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white flex items-center gap-1 w-fit animate-pulse">
                          <Clock className="w-3 h-3" />
                          <span>SLA Dépassé</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{ticket.slaHours}h</span>
                        </span>
                      )}
                    </td>

                    <td className="p-3">
                      {ticket.assignedAgent ? (
                        <p className="text-white font-medium">{ticket.assignedAgent.name}</p>
                      ) : (
                        <span className="text-amber-400 italic text-[11px]">Non assigné</span>
                      )}
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ticket.status === 'OPEN'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : ticket.status === 'INVESTIGATING'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : ticket.status === 'RESOLVED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>

                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setIsDetailDrawerOpen(true);
                        }}
                        className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition"
                      >
                        Gérer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View at 360px */}
        <div id="support-mobile-list" className="md:hidden divide-y divide-neutral-800">
          {tickets.length === 0 ? (
            <p className="p-6 text-center text-xs text-neutral-500 italic">
              Aucun ticket trouvé.
            </p>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => {
                  setSelectedTicket(ticket);
                  setIsDetailDrawerOpen(true);
                }}
                className="p-3.5 space-y-2 cursor-pointer hover:bg-neutral-800/50 transition"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{ticket.ticketNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ticket.status === 'RESOLVED'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : ticket.isSlaBreached
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {ticket.status}
                  </span>
                </div>

                <p className="text-xs font-bold text-neutral-200 line-clamp-1">
                  {ticket.title}
                </p>

                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span>{ticket.requesterName}</span>
                  <span className="font-mono text-blue-400">{ticket.linkedReference}</span>
                </div>

                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-neutral-800/60">
                  <span className="text-neutral-500">
                    Agent : {ticket.assignedAgent?.name || 'Non assigné'}
                  </span>
                  <span className="text-amber-400 font-semibold">{ticket.priority}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals & Drawer */}
      <SupportDetailDrawer
        ticket={selectedTicket}
        cannedResponses={cannedResponses}
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        onOpenAssign={(t) => {
          setSelectedTicket(t);
          setIsAssignModalOpen(true);
        }}
        onOpenResolve={(t) => {
          setSelectedTicket(t);
          setIsResolveModalOpen(true);
        }}
        onTicketUpdated={handleTicketUpdated}
      />

      <SupportAssignModal
        ticket={selectedTicket}
        workloads={workloads}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={handleTicketUpdated}
      />

      <SupportResolveRefundModal
        ticket={selectedTicket}
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        onSuccess={handleTicketUpdated}
      />

      <SupportWorkloadModal
        workloads={workloads}
        isOpen={isWorkloadModalOpen}
        onClose={() => setIsWorkloadModalOpen(false)}
      />
    </div>
  );
}
