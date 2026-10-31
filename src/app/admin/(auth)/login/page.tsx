'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Smartphone,
  KeyRound,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  Sparkles,
  Wifi,
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('superadmin@transnumerica.cd');
  const [password, setPassword] = useState('Transnumerica@RDC2026!');
  const [totpCode, setTotpCode] = useState('123456');
  const [step, setStep] = useState<'CREDENTIALS' | '2FA'>('CREDENTIALS');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedIp, setDetectedIp] = useState('192.168.43.221');
  const [isIpAllowed, setIsIpAllowed] = useState(true);

  React.useEffect(() => {
    fetch('/api/admin/auth/ip')
      .then((res) => res.json())
      .then((data) => {
        if (data.ip) {
          setDetectedIp(data.ip);
          setIsIpAllowed(data.isRecognized !== false);
        }
      })
      .catch(() => {});
  }, []);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok && !data.requires2FA) {
        setError(data.error || 'Identifiants incorrects.');
        setLoading(false);
        return;
      }

      if (data.requires2FA) {
        setStep('2FA');
        setLoading(false);
        return;
      }

      // If login succeeded directly (e.g. 2FA not required or pre-validated)
      router.push('/admin');
      router.refresh();
    } catch {
      setError('Erreur réseau lors de la communication sécurisée.');
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, totpCode }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Code 2FA invalide.');
        setLoading(false);
        return;
      }

      // Login success
      router.push('/admin');
      router.refresh();
    } catch {
      setError('Erreur réseau lors de la validation du code 2FA.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071321] text-white flex items-center justify-center p-4 selection:bg-amber-500 selection:text-neutral-950">
      <div className="w-full max-w-md bg-[#0D1E32] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        {/* Header with Security Badge */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <ShieldCheck className="w-8 h-8" aria-hidden="true" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-2xs font-black uppercase tracking-widest">
            <Lock className="w-3 h-3" />
            <span>Portail Restreint • Supervision RDC</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Console d'Administration
          </h1>
          <p className="text-xs text-neutral-400">
            Accès strictement réservé aux agents agréés et régulateurs du Ministère des Transports
          </p>
        </div>

        {/* Network & IP Recognition Badge */}
        <div className={`p-3 rounded-2xl border flex items-center justify-between text-2xs animate-in fade-in transition-all ${
          isIpAllowed
            ? 'bg-emerald-950/60 border-emerald-500/40'
            : 'bg-red-950/60 border-red-500/40'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isIpAllowed ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            <div>
              <div className={`font-extrabold flex items-center gap-1.5 ${isIpAllowed ? 'text-emerald-300' : 'text-red-300'}`}>
                <Wifi className="w-3.5 h-3.5 shrink-0" />
                <span>Poste Réseau :</span>
                <span className="font-mono text-white font-bold">{detectedIp}</span>
              </div>
              <span className="text-neutral-400 text-[10px]">
                {isIpAllowed ? 'Adaptateur Wi-Fi • Réseau Sécurisé Reconnu' : 'IP Non Autorisée par la Politique Réseau'}
              </span>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-full font-mono font-black text-[10px] border shrink-0 ${
            isIpAllowed
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-red-500/20 text-red-300 border-red-500/40'
          }`}>
            {isIpAllowed ? 'RECONNU' : 'BLOQUÉ'}
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-2xl bg-red-950/80 border border-red-700/50 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in"
          >
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Credentials Form */}
        {step === 'CREDENTIALS' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="admin-identifier"
                className="text-xs font-bold text-neutral-300 block"
              >
                Identifiant Administrateur (Email ou Téléphone RDC)
              </label>
              <div className="relative">
                <input
                  id="admin-identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="superadmin@transnumerica.cd"
                  className="w-full px-4 py-3 bg-[#081524] border border-white/15 focus:border-amber-400 rounded-2xl text-xs text-white placeholder-neutral-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="text-xs font-bold text-neutral-300 block"
              >
                Mot de Passe Sécurisé
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 bg-[#081524] border border-white/15 focus:border-amber-400 rounded-2xl text-xs text-white placeholder-neutral-500 outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-h-[48px]"
            >
              {loading ? (
                <span>Vérification des identifiants...</span>
              ) : (
                <>
                  <span>Continuer vers l'authentification 2FA</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Mandatory 2FA Form */}
        {step === '2FA' && (
          <form onSubmit={handle2FASubmit} className="space-y-4 animate-in fade-in">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 space-y-1">
              <div className="font-extrabold flex items-center gap-1.5 text-amber-300">
                <KeyRound className="w-4 h-4" />
                <span>Authentification à double facteur (2FA) obligatoire</span>
              </div>
              <p className="text-2xs text-neutral-300 leading-relaxed">
                Saisissez le code temporaire à 6 chiffres généré par votre application d'authentification (Google Authenticator / TOTP) ou votre code SMS de secours.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="admin-totp" className="text-xs font-bold text-neutral-300 block">
                Code TOTP / OTP à 6 chiffres
              </label>
              <input
                id="admin-totp"
                type="text"
                maxLength={6}
                required
                autoFocus
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full px-4 py-3 bg-[#081524] border border-amber-500/50 focus:border-amber-400 rounded-2xl text-center text-xl font-mono tracking-widest text-amber-300 outline-none transition-colors"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('CREDENTIALS')}
                className="w-1/3 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-2xl transition-colors min-h-[48px]"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={loading || totpCode.length < 6}
                className="w-2/3 py-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-h-[48px]"
              >
                {loading ? (
                  <span>Validation 2FA...</span>
                ) : (
                  <>
                    <span>Valider & Accéder</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Security Policy Footnote */}
        <div className="pt-4 border-t border-white/10 text-2xs text-neutral-400 space-y-2 text-center">
          <div className="flex items-center justify-center gap-1.5 text-neutral-300">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Expiration automatique après 30 minutes d'inactivité</span>
          </div>
          <p>
            Toutes les tentatives d'accès font l'objet d'un audit de sécurité consigné dans un journal immuable avec horodatage et adresse IP.
          </p>
        </div>
      </div>
    </div>
  );
}

