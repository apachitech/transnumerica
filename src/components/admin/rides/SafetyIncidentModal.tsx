'use client';

import React, { useState } from 'react';
import { SafetyIncident, SafetyIncidentStatus } from '@/types';
import {
  ShieldAlert,
  X,
  CheckCircle2,
  Phone,
  MessageSquare,
  AlertTriangle,
  Send,
  Radio,
  FileCheck,
  UserCheck,
  Gauge,
  Battery,
  Volume2,
} from 'lucide-react';

interface SafetyIncidentModalProps {
  incident: SafetyIncident | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedIncident: SafetyIncident) => void;
}

export function SafetyIncidentModal({
  incident,
  isOpen,
  onClose,
  onSuccess,
}: SafetyIncidentModalProps) {
  const [activeTab, setActiveTab] = useState<'WORKFLOW' | 'NOTES'>('WORKFLOW');
  const [newNote, setNewNote] = useState('');
  const [escalateTarget, setEscalateTarget] = useState('PNC Kinshasa - Brigade d’Intervention Rapide');
  const [escalateReason, setEscalateReason] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !incident) return null;

  const handleAcknowledge = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/safety/incidents/${incident.id}/acknowledge`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la prise en charge');
      onSuccess(data.incident);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEscalate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (escalateReason.trim().length < 5) {
      setError('Veuillez préciser le motif d’escalade (min. 5 caractères).');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/safety/incidents/${incident.id}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: escalateTarget, reason: escalateReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l’escalade');
      onSuccess(data.incident);
      setEscalateReason('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resolutionSummary.trim().length < 5) {
      setError('Le compte-rendu de résolution est obligatoire (min. 5 caractères).');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/safety/incidents/${incident.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolutionSummary: resolutionSummary.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la clôture');
      onSuccess(data.incident);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim().length < 2) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/safety/incidents/${incident.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l’ajout de la note');
      onSuccess(data.incident);
      setNewNote('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityBadge = () => {
    switch (incident.severity) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-xs uppercase animate-pulse">CRITIQUE</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded bg-amber-600 text-white font-bold text-xs uppercase">ÉLEVÉE</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-xs uppercase">MOYENNE</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600/20 text-red-400">
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  Centre de Sécurité : Incident {incident.reference}
                </h3>
                {getSeverityBadge()}
              </div>
              <p className="text-xs text-neutral-400">
                Course {incident.rideReference} • {incident.city} • Déclenché le {new Date(incident.createdAt).toLocaleTimeString('fr-FR')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-neutral-800 bg-neutral-950 px-5 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('WORKFLOW')}
            className={`py-2.5 font-bold border-b-2 mr-6 transition ${
              activeTab === 'WORKFLOW'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Workflow d’Intervention (4 étapes)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('NOTES')}
            className={`py-2.5 font-bold border-b-2 transition ${
              activeTab === 'NOTES'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Journal & Notes Enquête ({incident.notes.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Telematics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-400" />
              <div>
                <span className="text-[10px] text-neutral-400 block">Vitesse</span>
                <span className="font-bold text-white">{incident.telemetrics?.speedKmh ?? 0} km/h</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[10px] text-neutral-400 block">Batterie App</span>
                <span className="font-bold text-white">{incident.telemetrics?.batteryLevel ?? 75}%</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-purple-400" />
              <div>
                <span className="text-[10px] text-neutral-400 block">Clip Audio</span>
                <span className="font-bold text-purple-300">
                  {incident.telemetrics?.audioRecordingAvailable ? 'Actif (10s)' : 'Non requis'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[10px] text-neutral-400 block">Agent assigné</span>
                <span className="font-bold text-white truncate max-w-[100px] block">
                  {incident.assignedAdmin || 'Non assigné'}
                </span>
              </div>
            </div>
          </div>

          {/* Location details */}
          <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-xs space-y-1">
            <p className="font-semibold text-neutral-200">Localisation GPS live :</p>
            <p className="text-neutral-400">{incident.location.address}</p>
            <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-neutral-300">
              <span>Passager : <strong className="text-white">{incident.riderName}</strong> ({incident.riderPhone})</span>
              <span>Chauffeur : <strong className="text-white">{incident.driverName}</strong> ({incident.vehiclePlate})</span>
            </div>
          </div>

          {activeTab === 'WORKFLOW' ? (
            <div className="space-y-4">
              {/* Step Progress Tracker */}
              <div className="flex items-center justify-between text-xs py-2 border-y border-neutral-800">
                <div className={`flex items-center gap-1.5 ${incident.status !== 'OPEN' ? 'text-emerald-400 font-bold' : 'text-blue-400 font-bold'}`}>
                  <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">1</span>
                  <span>Prise en charge</span>
                </div>
                <div className={`flex items-center gap-1.5 ${incident.status === 'ESCALATED' || incident.status === 'RESOLVED' ? 'text-emerald-400 font-bold' : 'text-neutral-400'}`}>
                  <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">2</span>
                  <span>Contact</span>
                </div>
                <div className={`flex items-center gap-1.5 ${incident.status === 'ESCALATED' ? 'text-amber-400 font-bold' : incident.status === 'RESOLVED' ? 'text-emerald-400 font-bold' : 'text-neutral-400'}`}>
                  <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">3</span>
                  <span>Escalade</span>
                </div>
                <div className={`flex items-center gap-1.5 ${incident.status === 'RESOLVED' ? 'text-emerald-400 font-bold' : 'text-neutral-400'}`}>
                  <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">4</span>
                  <span>Résolution</span>
                </div>
              </div>

              {/* Step 1: Acknowledge */}
              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-white">Étape 1 : Prise en charge administrative</h4>
                  {incident.status !== 'OPEN' && (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Pris en charge par {incident.assignedAdmin}
                    </span>
                  )}
                </div>
                {incident.status === 'OPEN' ? (
                  <button
                    type="button"
                    onClick={handleAcknowledge}
                    disabled={isSubmitting}
                    className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow"
                  >
                    {isSubmitting ? 'Traitement...' : 'Prendre en charge l’incident (Couper l’alarme sonore)'}
                  </button>
                ) : (
                  <p className="text-xs text-neutral-400">
                    Alerte assignée le {incident.acknowledgedAt ? new Date(incident.acknowledgedAt).toLocaleTimeString('fr-FR') : 'N/A'}.
                  </p>
                )}
              </div>

              {/* Step 2: Contact shortcuts */}
              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2">
                <h4 className="font-bold text-xs text-white">Étape 2 : Communication d’urgence</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <a
                    href={`tel:${incident.riderPhone}`}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Appeler Passager ({incident.riderPhone})</span>
                  </a>
                  <a
                    href={`tel:${incident.driverPhone}`}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-400" />
                    <span>Appeler Chauffeur ({incident.driverPhone})</span>
                  </a>
                </div>
              </div>

              {/* Step 3: Escalade */}
              {incident.status !== 'RESOLVED' && (
                <form onSubmit={handleEscalate} className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-white">Étape 3 : Escalade aux services de secours / Police</h4>
                    {incident.status === 'ESCALATED' && (
                      <span className="text-[10px] text-amber-400 font-semibold">
                        Déjà escaladé vers {incident.escalationTarget}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-neutral-400 mb-1">Cible d'escalade</label>
                      <select
                        value={escalateTarget}
                        onChange={(e) => setEscalateTarget(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded p-1.5 text-xs text-white"
                      >
                        <option value="PNC Kinshasa - Brigade d’Intervention Rapide">PNC Kinshasa - Brigade Rapide</option>
                        <option value="PNC Haut-Katanga - Poste Provincial Lubumbashi">PNC Lubumbashi</option>
                        <option value="PNC Nord-Kivu - Commissariat Provincial Goma">PNC Goma</option>
                        <option value="Samu / Urgences Médicales RDC">Samu / Secours Médicaux</option>
                        <option value="Direction Sécurité & Audit Interne Transnumerica">Direction Sécurité Interne</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-400 mb-1">Motif de l’escalade</label>
                      <input
                        type="text"
                        value={escalateReason}
                        onChange={(e) => setEscalateReason(e.target.value)}
                        placeholder="Ex: Aucune réponse, suspicion d'agression..."
                        className="w-full bg-neutral-900 border border-neutral-700 rounded p-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || escalateReason.trim().length < 5}
                    className="w-full py-1.5 px-3 rounded bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-bold text-xs transition"
                  >
                    Escalader l’incident
                  </button>
                </form>
              )}

              {/* Step 4: Resolution */}
              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2">
                <h4 className="font-bold text-xs text-white">Étape 4 : Clôture & Compte-rendu de résolution</h4>
                {incident.status === 'RESOLVED' ? (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded text-xs text-emerald-300">
                    <p className="font-bold text-emerald-200">Incident résolu et clôturé</p>
                    <p className="mt-1">{incident.resolutionSummary}</p>
                  </div>
                ) : (
                  <form onSubmit={handleResolve} className="space-y-2">
                    <textarea
                      required
                      rows={2}
                      value={resolutionSummary}
                      onChange={(e) => setResolutionSummary(e.target.value)}
                      placeholder="Indiquez la conclusion de l’intervention (ex: contact réussi avec le client, fausse manipulation, intervention policière terminée)..."
                      className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-xs text-white placeholder-neutral-500"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || resolutionSummary.trim().length < 5}
                      className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition shadow"
                    >
                      {isSubmitting ? 'Traitement...' : 'Clôturer Définitivement l’Incident'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            /* Tab NOTES */
            <div className="space-y-3">
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {incident.notes.map((note) => (
                  <div key={note.id} className="p-2.5 rounded bg-neutral-950 border border-neutral-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-neutral-400 text-[10px]">
                      <span className="font-bold text-white">{note.author}</span>
                      <span>{new Date(note.createdAt).toLocaleTimeString('fr-FR')}</span>
                    </div>
                    <p className="text-neutral-300">{note.content}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Ajouter une note d'enquête interne..."
                  className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || newNote.trim().length < 2}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ajouter</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition"
          >
            Fermer la fenêtre
          </button>
        </div>
      </div>
    </div>
  );
}

