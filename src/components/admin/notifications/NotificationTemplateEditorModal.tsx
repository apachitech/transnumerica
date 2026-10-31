'use client';

import React, { useState, useEffect } from 'react';
import {
  NotificationTemplate,
  NotificationChannel,
  SupportedLanguage,
  NotificationCategory,
} from '@/types';
import {
  X,
  Smartphone,
  MessageSquare,
  Bell,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Eye,
  Save,
  Layers,
} from 'lucide-react';
import { renderNotificationVariables } from '@/lib/server/notifications-store';

interface NotificationTemplateEditorModalProps {
  template: NotificationTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (saved: NotificationTemplate) => void;
  onTestSend?: (template: NotificationTemplate) => void;
}

const LANGUAGES: { code: SupportedLanguage; label: string; badge: string }[] = [
  { code: 'fr', label: 'Français (Référence)', badge: 'FR' },
  { code: 'en', label: 'English', badge: 'EN' },
  { code: 'ln', label: 'Lingála', badge: 'LN' },
  { code: 'sw', label: 'Kiswahili', badge: 'SW' },
];

const CHANNELS: { code: NotificationChannel; label: string; icon: React.ElementType }[] = [
  { code: 'SMS', label: 'SMS GSM', icon: Smartphone },
  { code: 'WHATSAPP', label: 'WhatsApp Business', icon: MessageSquare },
  { code: 'PUSH', label: 'Push Mobile PWA', icon: Bell },
  { code: 'EMAIL', label: 'Email Transactionnel', icon: Mail },
];

export function NotificationTemplateEditorModal({
  template,
  isOpen,
  onClose,
  onSuccess,
  onTestSend,
}: NotificationTemplateEditorModalProps) {
  const [activeLang, setActiveLang] = useState<SupportedLanguage>('fr');
  const [activeChannel, setActiveChannel] = useState<NotificationChannel>('SMS');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<NotificationCategory>('BOOKINGS');
  const [isEnabled, setIsEnabled] = useState(true);
  const [enabledChannels, setEnabledChannels] = useState<NotificationChannel[]>(['SMS', 'WHATSAPP']);
  const [contentState, setContentState] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description);
      setCategory(template.category);
      setIsEnabled(template.isEnabled);
      setEnabledChannels(template.channels);
      setContentState(JSON.parse(JSON.stringify(template.content)));
      setActiveChannel(template.channels[0] || 'SMS');
    } else {
      setName('');
      setDescription('');
      setCategory('BOOKINGS');
      setIsEnabled(true);
      setEnabledChannels(['SMS', 'WHATSAPP']);
      setContentState({
        fr: { SMS: { body: '' }, WHATSAPP: { body: '' } },
        en: { SMS: { body: '' }, WHATSAPP: { body: '' } },
        ln: { SMS: { body: '' }, WHATSAPP: { body: '' } },
        sw: { SMS: { body: '' }, WHATSAPP: { body: '' } },
      });
      setActiveChannel('SMS');
    }
    setActiveLang('fr');
    setError(null);
  }, [template, isOpen]);

  if (!isOpen) return null;

  const currentChannelContent = contentState[activeLang]?.[activeChannel] || {
    subject: '',
    body: '',
  };

  const handleBodyChange = (text: string) => {
    setContentState((prev: any) => ({
      ...prev,
      [activeLang]: {
        ...(prev[activeLang] || {}),
        [activeChannel]: {
          ...(prev[activeLang]?.[activeChannel] || {}),
          body: text,
        },
      },
    }));
  };

  const handleSubjectChange = (text: string) => {
    setContentState((prev: any) => ({
      ...prev,
      [activeLang]: {
        ...(prev[activeLang] || {}),
        [activeChannel]: {
          ...(prev[activeLang]?.[activeChannel] || {}),
          subject: text,
        },
      },
    }));
  };

  const insertVariable = (varName: string) => {
    const textarea = document.getElementById('templateBodyInput') as HTMLTextAreaElement | null;
    if (!textarea) {
      handleBodyChange(currentChannelContent.body + ` {{${varName}}}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = currentChannelContent.body || '';
    const replacement = `{{${varName}}}`;
    const nextBody = current.substring(0, start) + replacement + current.substring(end);
    handleBodyChange(nextBody);
  };

  const toggleChannelEnabled = (chan: NotificationChannel) => {
    if (enabledChannels.includes(chan)) {
      if (enabledChannels.length === 1) return; // Keep at least one
      setEnabledChannels(enabledChannels.filter((c) => c !== chan));
    } else {
      setEnabledChannels([...enabledChannels, chan]);
    }
  };

  const sampleMockData: Record<string, string | number> = {
    passenger_name: 'Dieudonné Kasavubu',
    ticket_ref: 'TN-2026-90412',
    departure_station: 'Kinshasa Gare Centrale',
    arrival_station: 'Matadi Port',
    departure_time: '07:30',
    seat_number: '14A',
    amount: '45 000',
    currency: 'CDF',
    operator_name: 'Transco SARL',
    tracking_url: 'https://transnumerica.cd/tickets/TN-2026-90412',
    driver_name: 'Patrice Lumumba',
    driver_phone: '+243 810 001 122',
    vehicle_plate: '9845AB01',
    eta_minutes: '7',
    recipient_name: 'Merveille Mbuji',
    tracking_number: 'COLIS-RDC-7741',
    courier_name: 'Express Moto Kin',
    courier_phone: '+243 990 008 899',
    momo_provider: 'Vodacom M-Pesa',
    transaction_ref: 'MPESA-99041288',
    batch_id: 'LOT-S43',
    city_location: 'Kinshasa',
    device_info: 'Chrome Mobile',
    timestamp: '14:20',
    refund_reason: 'Annulation voyage',
    cancellation_reason: 'Panne technique',
  };

  const livePreview = renderNotificationVariables(currentChannelContent.body, sampleMockData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name,
      description,
      category,
      isEnabled,
      channels: enabledChannels,
      variables: template?.variables || [
        'passenger_name',
        'ticket_ref',
        'departure_station',
        'arrival_station',
        'departure_time',
        'seat_number',
        'amount',
        'currency',
        'tracking_url',
      ],
      content: contentState,
      version: template?.version,
    };

    try {
      const url = template
        ? `/api/admin/notifications/templates/${template.id}`
        : '/api/admin/notifications/templates';
      const method = template ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l’enregistrement');
      }

      onSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                {template ? `Édition : ${template.name}` : 'Nouveau Modèle de Notification'}
              </h2>
              <p className="text-xs text-zinc-400">
                Événement : <span className="font-mono text-zinc-300">{template?.event || 'PERSONNALISÉ'}</span> • v{template?.version || 1}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fermer l'éditeur"
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* General Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/80">
            <div>
              <label className="text-xs text-zinc-400 font-medium block mb-1">Nom du modèle</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 font-medium block mb-1">Catégorie Métier</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NotificationCategory)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="BOOKINGS">Billetterie Bus (BOOKINGS)</option>
                <option value="TRIPS">Courses & Trajets (TRIPS)</option>
                <option value="DELIVERY">Colis & Livraisons (DELIVERY)</option>
                <option value="PAYMENTS">Paiements & Payouts (PAYMENTS)</option>
                <option value="SECURITY">Sécurité & Alertes (SECURITY)</option>
                <option value="MARKETING">Marketing & Infos (MARKETING)</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="templateActive"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="rounded bg-zinc-950 border-zinc-700 text-blue-500 focus:ring-0"
              />
              <label htmlFor="templateActive" className="text-xs text-zinc-300 font-medium cursor-pointer">
                Modèle actif sur la plateforme
              </label>
            </div>
          </div>

          {/* Channels Selection */}
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 font-semibold block">Canaux d'émission activés</label>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((ch) => {
                const Icon = ch.icon;
                const isSelected = enabledChannels.includes(ch.code);
                return (
                  <button
                    key={ch.code}
                    type="button"
                    onClick={() => toggleChannelEnabled(ch.code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500/40 text-blue-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{ch.label}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Multilingual Tabs */}
          <div className="flex items-center gap-1 border-b border-zinc-800 overflow-x-auto pb-px">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setActiveLang(l.code)}
                className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeLang === l.code
                    ? 'bg-zinc-800 text-white border-b-2 border-blue-500'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <span className="text-[10px] px-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
                  {l.badge}
                </span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>

          {/* Channel Subtabs */}
          <div className="flex items-center gap-1.5">
            {enabledChannels.map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setActiveChannel(ch)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  activeChannel === ch
                    ? 'bg-zinc-800 text-white font-bold'
                    : 'text-zinc-400 hover:text-white bg-zinc-900/60'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          {/* Main Content Area + Live Preview Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Editor Pane */}
            <div className="space-y-3 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300">
                  Contenu : {activeChannel} ({activeLang.toUpperCase()})
                </span>
                <span className="text-[11px] text-zinc-500">
                  {currentChannelContent.body.length} caractères (
                  {Math.ceil(currentChannelContent.body.length / 160)} SMS)
                </span>
              </div>

              {(activeChannel === 'EMAIL' || activeChannel === 'PUSH' || activeChannel === 'WHATSAPP') && (
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Objet / Titre</label>
                  <input
                    type="text"
                    value={currentChannelContent.subject || ''}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    placeholder="Objet de la notification..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Corps du message</label>
                <textarea
                  id="templateBodyInput"
                  rows={6}
                  value={currentChannelContent.body || ''}
                  onChange={(e) => handleBodyChange(e.target.value)}
                  placeholder="Saisissez le texte du message avec les balises {{variable}}..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white leading-relaxed font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Dynamic Variables Pill Inserter */}
              <div>
                <span className="text-[11px] text-zinc-400 block mb-1.5 font-medium">
                  Variables dynamiques disponibles (cliquer pour insérer) :
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
                  {(
                    template?.variables || [
                      'passenger_name',
                      'ticket_ref',
                      'departure_station',
                      'arrival_station',
                      'departure_time',
                      'seat_number',
                      'amount',
                      'currency',
                      'operator_name',
                      'tracking_url',
                    ]
                  ).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => insertVariable(v)}
                      className="px-2 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-blue-400 font-mono text-[11px] transition"
                    >
                      +{`{{${v}}}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Preview Mockup Frame */}
            <div className="space-y-3 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Aperçu Rendu Destinataire</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  Données simulées
                </span>
              </div>

              {/* Mock Device Bubble */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex-1 flex flex-col justify-center">
                <div className="text-[11px] text-zinc-500 mb-2 font-mono flex items-center justify-between">
                  <span>EXPÉDITEUR : Transnumerica RDC</span>
                  <span>{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {currentChannelContent.subject && (
                  <div className="text-xs font-bold text-white mb-2 pb-1 border-b border-zinc-800">
                    {renderNotificationVariables(currentChannelContent.subject, sampleMockData)}
                  </div>
                )}

                <div className="text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed font-sans bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
                  {livePreview || (
                    <span className="text-zinc-600 italic">Le message apparaîtra ici lors de la saisie...</span>
                  )}
                </div>
              </div>

              {/* Test send shortcut */}
              {template && onTestSend && (
                <button
                  type="button"
                  onClick={() => onTestSend(template)}
                  className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Smartphone className="w-3.5 h-3.5 text-blue-400" /> Tester l'envoi vers un numéro test
                </button>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-medium transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition disabled:opacity-50 shadow-lg shadow-blue-600/20"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Enregistrement...' : 'Enregistrer le modèle'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

