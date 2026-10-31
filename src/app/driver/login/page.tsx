'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bike,
  Car,
  Bus,
  ShieldCheck,
  Smartphone,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export default function DriverLoginPage() {
  const router = useRouter();
  const [providerType, setProviderType] = useState<'MOTO' | 'CAR' | 'SHUTTLE'>('MOTO');
  const [phone, setPhone] = useState('+243');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError('Veuillez entrer un numéro de téléphone valide en RDC (+243...)');
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
    }, 600);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Code OTP à 4 chiffres requis (ex: 1234)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/driver/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          otp,
          pin: pin || undefined,
          providerType,
          city: 'Kinshasa',
          deviceName: navigator.userAgent.includes('Mobile') ? 'Smartphone Chauffeur' : 'Poste Fixe Chauffeur',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur d’authentification');
      }

      // Check verification status
      if (data.provider.status === 'DRAFT' || data.provider.status === 'INFO_REQUIRED') {
        router.push('/driver/onboarding');
      } else {
        router.push('/driver');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-500/10 border border-accent-500/20 text-accent-400 mb-3 shadow-inner">
            {providerType === 'MOTO' && <Bike className="w-8 h-8" />}
            {providerType === 'CAR' && <Car className="w-8 h-8" />}
            {providerType === 'SHUTTLE' && <Bus className="w-8 h-8" />}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Espace Partenaire Conducteur
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Connexion sécurisée pour Motos Wewa, Taxis et Navettes RDC
          </p>
        </div>

        {/* Provider Type Selection */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-950/60 rounded-2xl border border-neutral-800 mb-6">
          <button
            type="button"
            onClick={() => setProviderType('MOTO')}
            className={`flex flex-col items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-all ${
              providerType === 'MOTO'
                ? 'bg-accent-500 text-neutral-950 shadow-md font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Bike className="w-4 h-4 mb-1" />
            <span>Moto Wewa</span>
          </button>
          <button
            type="button"
            onClick={() => setProviderType('CAR')}
            className={`flex flex-col items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-all ${
              providerType === 'CAR'
                ? 'bg-accent-500 text-neutral-950 shadow-md font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Car className="w-4 h-4 mb-1" />
            <span>Taxi Auto</span>
          </button>
          <button
            type="button"
            onClick={() => setProviderType('SHUTTLE')}
            className={`flex flex-col items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-all ${
              providerType === 'SHUTTLE'
                ? 'bg-accent-500 text-neutral-950 shadow-md font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Bus className="w-4 h-4 mb-1" />
            <span>Navette/Bus</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Numéro Mobile Money (M-Pesa, Airtel, Orange)
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+243810001001"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-accent-500 transition-colors"
                />
              </div>
              <p className="text-2xs text-neutral-500 mt-1.5">
                Utilisez votre numéro de téléphone habituel. Un code OTP par SMS vous sera envoyé.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-accent-500 hover:bg-accent-400 text-neutral-950 font-black rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent-500/20 disabled:opacity-50"
            >
              {loading ? (
                <span>Vérification...</span>
              ) : (
                <>
                  <span>Recevoir le code SMS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
              <span className="text-neutral-400">Numéro : {phone}</span>
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="text-accent-400 font-bold hover:underline"
              >
                Modifier
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Code secret OTP (reçu par SMS)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="1234"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 text-sm tracking-widest font-mono text-center focus:outline-none focus:border-accent-500 transition-colors"
                />
              </div>
              <p className="text-2xs text-neutral-500 mt-1.5">
                Pour ce test sécurisé, saisissez <strong>1234</strong> ou n'importe quel code à 4 chiffres.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Code PIN Chauffeur (Optionnel)
              </label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="****"
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 text-sm text-center tracking-widest font-mono focus:outline-none focus:border-accent-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-accent-500 hover:bg-accent-400 text-neutral-950 font-black rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent-500/20 disabled:opacity-50"
            >
              {loading ? (
                <span>Connexion en cours...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accéder à mon Espace</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Trust Badges */}
        <div className="mt-8 pt-6 border-t border-neutral-800 text-center">
          <div className="inline-flex items-center gap-1.5 text-2xs text-neutral-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sécurité renforcée RDC & KYC obligatoire avant circulation</span>
          </div>
        </div>
      </div>
    </div>
  );
}

