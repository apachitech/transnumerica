'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileText,
  Eye,
  MessageSquare,
  Smartphone,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { KycReviewQueueItem, DriverKycDocument } from '@/types';
import { DocumentZoomModal } from './DocumentZoomModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: KycReviewQueueItem | null;
  onSuccess: () => void;
}

export function KycReviewModal({ isOpen, onClose, item, onSuccess }: Props) {
  const [selectedAction, setSelectedAction] = useState<'APPROVE' | 'REJECT' | 'REQUEST_RESUBMISSION'>('APPROVE');
  const [reason, setReason] = useState('');
  const [resubmissionNote, setResubmissionNote] = useState('');
  const [activeChannelPreview, setActiveChannelPreview] = useState<'SMS' | 'WHATSAPP'>('SMS');
  const [inspectingDoc, setInspectingDoc] = useState<DriverKycDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  // Format SLA display
  const isSlaBreached = item.slaStatus === 'BREACHED';
  const isSlaWarning = item.slaStatus === 'WARNING';
  const hoursLeft = Math.floor(Math.max(0, item.slaMinutesRemaining) / 60);
  const minsLeft = Math.max(0, item.slaMinutesRemaining) % 60;

  // Computed notification message preview
  const getSmsPreview = () => {
    if (selectedAction === 'APPROVE') {
      return `Bonjour ${item.applicantName}, votre dossier Transnumerica est validé ! Votre compte chauffeur est activé. Vous pouvez dès à présent démarrer vos courses.`;
    }
    if (selectedAction === 'REJECT') {
      return `Bonjour ${item.applicantName}, votre dossier Transnumerica a été rejeté. Motif : ${reason.trim() || '[Préciser le motif]'}.`;
    }
    return `Bonjour ${item.applicantName}, des pièces complémentaires sont requises pour votre compte Transnumerica : ${resubmissionNote.trim() || '[Préciser les pièces à corriger]'}. Rendez-vous sur votre application.`;
  };

  const getWhatsAppPreview = () => {
    if (selectedAction === 'APPROVE') {
      return `*TRANSNUMERICA RDC — Notification Officielle*\n\nFélicitations *${item.applicantName}* !\n\nVotre dossier chauffeur (*${item.vehiclePlate}*) a été vérifié et approuvé avec succès par la commission de sécurité.\n\nStatut : *ACTIF*\nBadge : *Chauffeur Partenaire Vérifié*\n\nOuvrez l'application chauffeur pour prendre vos premières courses dès maintenant.`;
    }
    if (selectedAction === 'REJECT') {
      return `*TRANSNUMERICA RDC — Notification Officielle*\n\nBonjour *${item.applicantName}*,\n\nAprès examen de vos documents, votre demande d'adhésion en tant que chauffeur a été refusée.\n\n*Motif de rejet :* ${reason.trim() || '[Préciser le motif]'}\n\nPour toute contestation, contactez le support au +243 81 000 0000.`;
    }
    return `*TRANSNUMERICA RDC — Dossier à corriger*\n\nBonjour *${item.applicantName}*,\n\nDes pièces de votre dossier nécessitent une mise à jour avant validation définitive :\n\n*Instructions :* ${resubmissionNote.trim() || '[Préciser les documents demandés]'}\n\nVeuillez téléverser les nouveaux documents dans l'espace chauffeur.`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedAction === 'REJECT' && reason.trim().length < 5) {
      setError('Veuillez renseigner un motif de rejet explicite d’au moins 5 caractères.');
      return;
    }
    if (selectedAction === 'REQUEST_RESUBMISSION' && resubmissionNote.trim().length < 5) {
      setError('Veuillez spécifier clairement les pièces à resoumettre (au moins 5 caractères).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/drivers/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kycId: item.id,
          action: selectedAction,
          reason:
            selectedAction === 'REJECT'
              ? reason.trim()
              : 'Dossier vérifié et validé par la commission de sécurité',
          resubmissionGuidance:
            selectedAction === 'REQUEST_RESUBMISSION' ? resubmissionNote.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la validation de la décision.');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
        <div className="w-full max-w-4xl bg-[#0D1E32] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8">
          {/* Header */}
          <div className="p-5 border-b border-white/10 bg-[#091522] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    Examen Dossier KYC : {item.applicantName}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-2xs font-semibold flex items-center gap-1 border ${
                      isSlaBreached
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : isSlaWarning
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    SLA : {isSlaBreached ? 'DÉPASSÉ' : `${hoursLeft}h ${minsLeft}m`}
                  </span>
                </div>
                <p className="text-2xs text-neutral-400 mt-0.5">
                  ID Dossier: <span className="font-mono text-neutral-300">{item.id}</span> • Véhicule :{' '}
                  <span className="text-white font-medium">{item.vehicleModel}</span> ({item.vehiclePlate}) •{' '}
                  {item.cooperative || 'Indépendant'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-6">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Applicant Quick Recap */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs">
              <div>
                <span className="text-3xs text-neutral-400 uppercase tracking-wider block">Téléphone</span>
                <span className="font-mono text-white font-semibold">{item.phone}</span>
              </div>
              <div>
                <span className="text-3xs text-neutral-400 uppercase tracking-wider block">Catégorie</span>
                <span className="font-semibold text-brand-primary">
                  {item.vehicleType === 'MOTO' ? 'Moto-Express' : 'Taxi Urbain'}
                </span>
              </div>
              <div>
                <span className="text-3xs text-neutral-400 uppercase tracking-wider block">Casque Passager</span>
                <span className={item.hasPassengerHelmet ? 'text-emerald-400 font-medium' : 'text-amber-400'}>
                  {item.hasPassengerHelmet ? 'Fourni & Vérifié' : 'Non déclaré'}
                </span>
              </div>
              <div>
                <span className="text-3xs text-neutral-400 uppercase tracking-wider block">Dépôt Dossier</span>
                <span className="text-neutral-300">{new Date(item.appliedAt).toLocaleDateString('fr-CD')}</span>
              </div>
            </div>

            {/* Documents List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-brand-primary" />
                  Pièces justificatives ({item.documents.length})
                </h3>
                <span className="text-3xs text-neutral-400">
                  Cliquez sur une pièce pour l&apos;examiner avec zoom HD & filigrane
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {item.documents.map((doc) => {
                  const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
                  const isExpiringSoon =
                    doc.expiryDate &&
                    !isExpired &&
                    (new Date(doc.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24) < 30;

                  return (
                    <div
                      key={doc.id}
                      className="p-3 rounded-2xl bg-[#091522] border border-white/10 hover:border-brand-primary/40 transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white truncate">{doc.name}</span>
                          {doc.verified && (
                            <span className="px-1.5 py-0.5 rounded text-3xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Valide
                            </span>
                          )}
                        </div>
                        <p className="text-2xs text-neutral-400 font-mono mt-0.5 truncate">
                          N° {doc.documentNumber}
                        </p>
                        {doc.expiryDate && (
                          <div className="flex items-center gap-1 mt-1 text-3xs">
                            <span className="text-neutral-500">Expire le :</span>
                            <span
                              className={`font-medium ${
                                isExpired
                                  ? 'text-rose-400 font-bold'
                                  : isExpiringSoon
                                  ? 'text-amber-400 font-bold'
                                  : 'text-neutral-300'
                              }`}
                            >
                              {doc.expiryDate} {isExpired ? '(EXPIRÉ)' : isExpiringSoon ? '(< 30j)' : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setInspectingDoc(doc)}
                        className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-brand-primary/20 hover:text-brand-primary text-neutral-300 text-2xs font-semibold flex items-center gap-1 transition-all shrink-0 border border-white/10 group-hover:border-brand-primary/30"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Examiner
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Decision Selector */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                Décision administrative
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedAction('APPROVE')}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                    selectedAction === 'APPROVE'
                      ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                      : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Approuver le dossier
                    </span>
                    {selectedAction === 'APPROVE' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-3xs text-neutral-400">
                    Active le compte, attribue le badge &ldquo;Vérifié&rdquo; et envoie les notifications de bienvenue.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAction('REQUEST_RESUBMISSION')}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                    selectedAction === 'REQUEST_RESUBMISSION'
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-950/40'
                      : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-amber-400" />
                      Demander resoumission
                    </span>
                    {selectedAction === 'REQUEST_RESUBMISSION' && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-3xs text-neutral-400">
                    Invite le chauffeur à recharger une photo plus nette ou un document à jour.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAction('REJECT')}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                    selectedAction === 'REJECT'
                      ? 'bg-rose-500/20 border-rose-500 text-white shadow-lg shadow-rose-950/40'
                      : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-400" />
                      Rejeter définitivement
                    </span>
                    {selectedAction === 'REJECT' && (
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-3xs text-neutral-400">
                    Refuse l&apos;adhésion pour motif non-conforme ou document falsifié.
                  </p>
                </button>
              </div>

              {/* Conditional inputs */}
              {selectedAction === 'REJECT' && (
                <div className="space-y-1.5 animate-in fade-in">
                  <label className="text-2xs font-semibold text-rose-300 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    Motif obligatoire du rejet (consigné dans l&apos;audit log et transmis au chauffeur) *
                  </label>
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ex: Permis de conduire falsifié ou expiré sans justificatif légal..."
                    className="w-full bg-[#091522] border border-rose-500/40 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}

              {selectedAction === 'REQUEST_RESUBMISSION' && (
                <div className="space-y-1.5 animate-in fade-in">
                  <label className="text-2xs font-semibold text-amber-300 flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    Instructions précises pour la resoumission *
                  </label>
                  <textarea
                    rows={2}
                    value={resubmissionNote}
                    onChange={(e) => setResubmissionNote(e.target.value)}
                    placeholder="Ex: La photo de la carte rose est floue et le cachet SONAS est illisible. Merci de téléverser un scan net..."
                    className="w-full bg-[#091522] border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}
            </div>

            {/* Notification Live Preview */}
            <div className="p-4 rounded-2xl bg-[#091522] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-brand-primary" />
                  Aperçu de la notification automatique envoyée au chauffeur
                </span>
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveChannelPreview('SMS')}
                    className={`px-2 py-0.5 rounded-lg text-3xs font-semibold transition-all ${
                      activeChannelPreview === 'SMS'
                        ? 'bg-brand-primary text-black'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    SMS
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveChannelPreview('WHATSAPP')}
                    className={`px-2 py-0.5 rounded-lg text-3xs font-semibold transition-all ${
                      activeChannelPreview === 'WHATSAPP'
                        ? 'bg-emerald-500 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    WhatsApp
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-2xs leading-relaxed text-neutral-200 whitespace-pre-line">
                {activeChannelPreview === 'SMS' ? getSmsPreview() : getWhatsAppPreview()}
              </div>
              <div className="flex items-center gap-2 text-3xs text-neutral-400">
                <Smartphone className="w-3 h-3 text-neutral-400" />
                Destinataire : <span className="text-white font-mono">{item.phone}</span> • Horodatage automatique
                consigné
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-neutral-300 text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  selectedAction === 'APPROVE'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20'
                    : selectedAction === 'REQUEST_RESUBMISSION'
                    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20'
                    : 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Validation en cours...
                  </>
                ) : (
                  <>
                    Confirmer la décision
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Submodal for deep document inspection */}
      {inspectingDoc && (
        <DocumentZoomModal
          isOpen={!!inspectingDoc}
          onClose={() => setInspectingDoc(null)}
          document={inspectingDoc}
          driverName={item.applicantName}
        />
      )}
    </>
  );
}
