'use client';

import React, { useState } from 'react';
import { NotificationTemplate, NotificationChannel, SupportedLanguage } from '@/types';
import { X, Send, Smartphone, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

interface NotificationTestSendModalProps {
  template: NotificationTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onShowFeedback: (msg: string, type?: 'success' | 'error') => void;
}

export function NotificationTestSendModal({
  template,
  isOpen,
  onClose,
  onShowFeedback,
}: NotificationTestSendModalProps) {
  const [recipient, setRecipient] = useState('+243812345678');
  const [channel, setChannel] = useState<NotificationChannel>('SMS');
  const [language, setLanguage] = useState<SupportedLanguage>('fr');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !template) return null;

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/admin/notifications/templates/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          channel,
          language,
          recipient: recipient.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Échec de l’envoi de test');
      }

      setResult(data);
      if (data.isOptedOut) {
        onShowFeedback(
          'Destinataire sur la liste STOP : envoi ignoré conformément au cadre légal.',
          'error'
        );
      } else {
        onShowFeedback(`Message de test (${channel}) expédié avec succès vers ${recipient}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Envoi de Test Unitaire</h3>
              <p className="text-xs text-zinc-400 truncate max-w-xs">{template.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSendTest} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-zinc-400 font-medium block mb-1">
              Canal de test
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {template.channels.map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setChannel(ch)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition ${
                    channel === ch
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-400 font-medium block mb-1">Langue</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="fr">Français (FR)</option>
                <option value="en">English (EN)</option>
                <option value="ln">Lingála (LN)</option>
                <option value="sw">Kiswahili (SW)</option>
              </select>
            </div>

            <div>
              <label className="text-zinc-400 font-medium block mb-1">
                Destinataire ({channel === 'EMAIL' ? 'Email' : 'GSM RDC'})
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
                placeholder="+243..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {result && (
            <div
              className={`p-4 rounded-xl border space-y-2 animate-in fade-in duration-200 ${
                result.isOptedOut
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  {result.isOptedOut ? (
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  <span>Statut : {result.status}</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/40">
                  {result.channel}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed whitespace-pre-wrap bg-black/30 p-2.5 rounded-lg font-mono">
                {result.renderedBody}
              </p>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-zinc-400 hover:text-white transition"
            >
              Fermer
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Expédition...' : 'Envoyer le test'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

