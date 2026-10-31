'use client';

import React, { useState } from 'react';
import { VehicleType, Driver } from '@/types';
import {
  Phone,
  ShieldCheck,
  CheckCircle2,
  X,
  Clock,
  ArrowRight,
  AlertCircle,
  Bike,
  Car,
  HardHat,
  Wind,
  Upload,
  User,
  KeyRound,
} from 'lucide-react';

interface DriverAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (driverData: Partial<Driver>) => void;
  initialMode?: 'LOGIN' | 'SIGNUP';
}

export function DriverAuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'LOGIN',
}: DriverAuthModalProps) {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>(initialMode);
  const [step, setStep] = useState<'PHONE' | 'OTP' | 'VEHICLE' | 'KYC_PROMPT'>('PHONE');

  // Form Fields
  const [phone, setPhone] = useState('0812345678');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('Kinshasa');
  const [vehicleType, setVehicleType] = useState<VehicleType>('MOTO');
  const [vehicleModel, setVehicleModel] = useState('TVS HLX 125 Plus');
  const [vehiclePlate, setVehiclePlate] = useState('KN 1192 MT');
  const [hasHelmet, setHasHelmet] = useState(true);
  const [hasAC, setHasAC] = useState(true);

  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  // Auto-detect DRC Telco
  const getOperatorBadge = (num: string) => {
    const clean = num.replace(/\s+/g, '').replace(/^0/, '');
    if (clean.startsWith('81') || clean.startsWith('82') || clean.startsWith('83')) {
      return { name: 'Vodacom M-Pesa', color: 'bg-red-500 text-white' };
    }
    if (clean.startsWith('97') || clean.startsWith('98') || clean.startsWith('99')) {
      return { name: 'Airtel Money', color: 'bg-red-600 text-white' };
    }
    if (clean.startsWith('84') || clean.startsWith('85') || clean.startsWith('89') || clean.startsWith('80')) {
      return { name: 'Orange Money', color: 'bg-orange-500 text-white' };
    }
    if (clean.startsWith('90') || clean.startsWith('91')) {
      return { name: 'Africell Money', color: 'bg-purple-600 text-white' };
    }
    return null;
  };

  const detectedOp = getOperatorBadge(phone);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('OTP');
    setOtp(['1', '2', '3', '4', '5', '6']); // pre-filled demo code
  };

  const handleVerifyOtp = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (mode === 'SIGNUP') {
        setStep('VEHICLE');
      } else {
        // Login existing driver
        onLoginSuccess({
          name: fullName || (vehicleType === 'MOTO' ? 'Dany "Wewa Rapide" Kazadi' : 'Papitcho Kalonji'),
          phone: `+243${phone.replace(/^0/, '')}`,
          vehicleType,
          vehicleModel,
          vehiclePlate,
          hasPassengerHelmet: vehicleType === 'MOTO' ? hasHelmet : false,
          verificationStatus: 'VERIFIED',
        });
        onClose();
      }
    }, 600);
  };

  const handleCompleteSignup = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess({
      name: fullName || (vehicleType === 'MOTO' ? 'Nouveau Chauffeur Wewa' : 'Nouveau Chauffeur Taxi'),
      phone: `+243${phone.replace(/^0/, '')}`,
      vehicleType,
      vehicleModel,
      vehiclePlate,
      hasPassengerHelmet: vehicleType === 'MOTO' ? hasHelmet : false,
      verificationStatus: 'PENDING', // En attente des documents KYC
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-850 rounded-3xl border border-neutral-200 dark:border-neutral-750 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-750 pb-3">
          <div>
            <h3 className="font-black text-base sm:text-lg text-neutral-900 dark:text-white flex items-center gap-2">
              <span>{mode === 'LOGIN' ? 'Connexion Espace Chauffeur' : 'Inscription Conducteur Partenaire'}</span>
            </h3>
            <p className="text-2xs text-neutral-500 dark:text-neutral-400">
              Transnumerica RDC • Commission solidaire de 10% seulement
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher: Connexion vs Inscription */}
        <div className="grid grid-cols-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs font-black">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setStep('PHONE');
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'LOGIN'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Se Connecter
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('SIGNUP');
              setStep('PHONE');
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'SIGNUP'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Créer un Compte
          </button>
        </div>

        {/* STEP 1: PHONE NUMBER */}
        {step === 'PHONE' && (
          <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
            {mode === 'SIGNUP' && (
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Nom et Prénom officiels (sur votre permis) *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Dany Kazadi Tshimanga"
                  className="w-full min-h-[44px] px-3.5 bg-neutral-50 dark:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 rounded-xl font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
            )}

            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Numéro de téléphone Mobile Money RDC (+243) *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 font-mono font-bold text-neutral-500 text-xs">
                  🇨🇩 +243
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="81 234 5678"
                  className="w-full min-h-[46px] pl-20 pr-24 bg-neutral-50 dark:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 rounded-xl font-mono font-bold text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
                {detectedOp && (
                  <span className={`absolute right-2 text-[10px] font-black px-2 py-0.5 rounded-md ${detectedOp.color}`}>
                    {detectedOp.name}
                  </span>
                )}
              </div>
              <p className="text-3xs text-neutral-500 dark:text-neutral-400 mt-1">
                Ce numéro recevra vos virements de gains journaliers (Vodacom, Airtel, Orange, Africell).
              </p>
            </div>

            {mode === 'SIGNUP' && (
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Ville principale d'opération *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full min-h-[44px] px-3 bg-neutral-50 dark:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 rounded-xl font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="Kinshasa">Kinshasa (Gombe, Victoire, Limete, Kintambo, etc.)</option>
                  <option value="Lubumbashi">Lubumbashi (Centre, Ruashi, Kamalondo, etc.)</option>
                  <option value="Kolwezi">Kolwezi (Lualaba)</option>
                  <option value="Matadi">Matadi (Kongo Central)</option>
                  <option value="Goma">Goma (Nord-Kivu)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full min-h-[46px] rounded-xl bg-primary-900 hover:bg-primary-950 text-white dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-neutral-950 font-black text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <span>Continuer avec le code SMS / WhatsApp</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 'OTP' && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs">
              <span>Code de sécurité à 6 chiffres envoyé au <strong>+243 {phone}</strong></span>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 text-center">
                Saisissez le code de validation *
              </label>
              <div className="flex items-center justify-center gap-2 font-mono">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const next = [...otp];
                      next[idx] = e.target.value.replace(/[^0-9]/g, '');
                      setOtp(next);
                    }}
                    className="w-10 h-12 text-center text-lg font-black bg-neutral-50 dark:bg-neutral-750 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl focus:border-accent-500 focus:outline-none"
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={isVerifying}
              onClick={handleVerifyOtp}
              className="w-full min-h-[46px] rounded-xl bg-primary-900 hover:bg-primary-950 text-white dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-neutral-950 font-black text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
            >
              {isVerifying ? (
                <span>Vérification du code...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmer mon identité</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 3: VEHICLE & SPECIFICATIONS (For Signup) */}
        {step === 'VEHICLE' && (
          <form onSubmit={handleCompleteSignup} className="space-y-4 text-xs">
            <div className="space-y-2">
              <label className="block font-bold text-neutral-700 dark:text-neutral-300">
                Type de Véhicule utilisé *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setVehicleType('MOTO');
                    setVehicleModel('TVS HLX 125 Plus');
                    setVehiclePlate('KN 1192 MT');
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                    vehicleType === 'MOTO'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-950 dark:text-amber-200 border-amber-400 ring-2 ring-amber-400/40'
                      : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  <Bike className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <span className="font-black block text-xs">Moto (Wewa)</span>
                    <span className="text-3xs opacity-80">2 Roues</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVehicleType('CAR');
                    setVehicleModel('Toyota IST Ketch');
                    setVehiclePlate('KN 8291 BG');
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                    vehicleType === 'CAR'
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-950 dark:text-blue-200 border-blue-400 ring-2 ring-blue-400/40'
                      : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  <Car className="w-5 h-5 text-blue-500 shrink-0" />
                  <div>
                    <span className="font-black block text-xs">Voiture (Taxi)</span>
                    <span className="text-3xs opacity-80">4 Places</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Marque & Modèle *
                </label>
                <input
                  type="text"
                  required
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full min-h-[44px] px-3 bg-neutral-50 dark:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 rounded-xl font-bold text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Plaque d'Immatriculation RDC *
                </label>
                <input
                  type="text"
                  required
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  className="w-full min-h-[44px] px-3 font-mono font-black uppercase bg-neutral-50 dark:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Safety Commitment Checklist */}
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-2">
              <span className="font-bold text-xs text-neutral-900 dark:text-white block">
                Engagements de Sécurité Obligatoires :
              </span>
              {vehicleType === 'MOTO' ? (
                <label className="flex items-start gap-2 cursor-pointer text-2xs text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    required
                    checked={hasHelmet}
                    onChange={(e) => setHasHelmet(e.target.checked)}
                    className="mt-0.5 rounded text-accent-500"
                  />
                  <span>
                    Je m'engage à porter un casque homologué et à <strong>fournir un 2ème casque propre</strong> au passager pour chaque course.
                  </span>
                </label>
              ) : (
                <label className="flex items-start gap-2 cursor-pointer text-2xs text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={hasAC}
                    onChange={(e) => setHasAC(e.target.checked)}
                    className="mt-0.5 rounded text-blue-500"
                  />
                  <span>Mon véhicule dispose d'une climatisation fonctionnelle et de ceintures de sécurité à chaque place.</span>
                </label>
              )}
            </div>

            <button
              type="submit"
              className="w-full min-h-[46px] rounded-xl bg-primary-900 hover:bg-primary-950 text-white dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-neutral-950 font-black text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <span>Accéder à mon Cockpit et soumettre mes pièces KYC</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

