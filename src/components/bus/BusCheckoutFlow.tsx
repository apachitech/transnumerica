'use client';

import React, { useState, useEffect } from 'react';
import { BusTrip, PaymentMethod } from '@/types';
import { useApp } from '@/lib/store';
import { 
  ShieldCheck, 
  Lock, 
  Smartphone, 
  Banknote, 
  CreditCard,
  AlertTriangle, 
  ArrowLeft, 
  Clock, 
  MessageSquare, 
  RotateCcw, 
  Check, 
  Loader2,
  AlertCircle,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

export type MomoOperatorId = 'MPESA' | 'AIRTEL' | 'ORANGE' | 'AFRICELL';

interface MomoOperator {
  id: MomoOperatorId;
  name: string;
  tagline: string;
  brandColor: string;
  bgLight: string;
  bgDark: string;
  borderActive: string;
  prefixes: string[];
  placeholder: string;
}

const MOMO_OPERATORS: MomoOperator[] = [
  {
    id: 'MPESA',
    name: 'Vodacom M-Pesa',
    tagline: 'Leader RDC (081, 082, 083)',
    brandColor: '#E60000',
    bgLight: 'bg-red-50',
    bgDark: 'dark:bg-red-950/30',
    borderActive: 'border-red-500 ring-red-500/30',
    prefixes: ['081', '082', '083', '81', '82', '83'],
    placeholder: '081 234 5678',
  },
  {
    id: 'AIRTEL',
    name: 'Airtel Money',
    tagline: 'Réseau Airtel (097, 098, 099)',
    brandColor: '#FF0000',
    bgLight: 'bg-red-50',
    bgDark: 'dark:bg-red-950/30',
    borderActive: 'border-red-600 ring-red-600/30',
    prefixes: ['097', '098', '099', '97', '98', '99'],
    placeholder: '097 123 4567',
  },
  {
    id: 'ORANGE',
    name: 'Orange Money',
    tagline: 'Orange RDC (084, 085, 089)',
    brandColor: '#FF7900',
    bgLight: 'bg-orange-50',
    bgDark: 'dark:bg-orange-950/30',
    borderActive: 'border-orange-500 ring-orange-500/30',
    prefixes: ['084', '085', '089', '080', '84', '85', '89', '80'],
    placeholder: '089 987 6543',
  },
  {
    id: 'AFRICELL',
    name: 'Africell Money',
    tagline: 'AfriMoney RDC (090, 091)',
    brandColor: '#93278F',
    bgLight: 'bg-purple-50',
    bgDark: 'dark:bg-purple-950/30',
    borderActive: 'border-purple-600 ring-purple-600/30',
    prefixes: ['090', '091', '90', '91'],
    placeholder: '090 123 4567',
  },
];

interface BusCheckoutFlowProps {
  trip: BusTrip;
  seatNumber: string;
  onBackToSeats: () => void;
  onPaymentSuccess: (bookingData: {
    passengerName: string;
    passengerPhone: string;
    paymentMethod: PaymentMethod;
    momoProvider?: MomoOperatorId;
  }) => void;
}

export function BusCheckoutFlow({
  trip,
  seatNumber,
  onBackToSeats,
  onPaymentSuccess,
}: BusCheckoutFlowProps) {
  const { currentUser, isAuthenticated, openAuthWithNotice, currency, setCurrency, setShowHelpCenterModal } = useApp();

  // Active view: 'FORM' | 'PENDING' | 'FAILURE'
  const [viewState, setViewState] = useState<'FORM' | 'PENDING' | 'FAILURE'>('FORM');

  // Passenger state (prefilled when logged in)
  const [fullName, setFullName] = useState(currentUser?.name || 'Patrick Mwamba');
  const [phoneNumber, setPhoneNumber] = useState(
    currentUser?.phone ? currentUser.phone.replace('+243', '') : '0812345678'
  );
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Payment method selection: 'MOMO' | 'CARD' | 'CASH'
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MOMO');

  // Mobile Money state
  const [selectedMomo, setSelectedMomo] = useState<MomoOperatorId>('MPESA');
  const [momoPhone, setMomoPhone] = useState(
    currentUser?.phone ? currentUser.phone.replace('+243', '') : '0812345678'
  );
  const [momoPhoneError, setMomoPhoneError] = useState<string | null>(null);

  // Bank Card state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(currentUser?.name?.toUpperCase() || 'PATRICK MWAMBA');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardErrors, setCardErrors] = useState<{ number?: string; holder?: string; expiry?: string; cvv?: string }>({});

  // Pending state (USSD or 3D Secure)
  const [countdown, setCountdown] = useState<number>(90);
  const [pollingStep, setPollingStep] = useState<number>(1);
  const [resendNotification, setResendNotification] = useState<boolean>(false);

  // Price computations
  const priceMinor = currency === 'USD' ? trip.priceMinorUSD : trip.priceMinorCDF;
  const fareFormatted = new Intl.NumberFormat('fr-CD', { maximumFractionDigits: 0 }).format(priceMinor / 100);
  const currencySymbol = currency === 'USD' ? 'USD' : 'FC';

  // Detect card network
  const getCardBrand = (num: string): 'VISA' | 'MASTERCARD' | 'GENERIC' => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'VISA';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'MASTERCARD';
    return 'GENERIC';
  };

  // Card input formatters
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = clean.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
    if (cardErrors.number) setCardErrors((prev) => ({ ...prev, number: undefined }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, '').slice(0, 4);
    let formatted = clean;
    if (clean.length >= 3) {
      formatted = `${clean.slice(0, 2)}/${clean.slice(2)}`;
    }
    setCardExpiry(formatted);
    if (cardErrors.expiry) setCardErrors((prev) => ({ ...prev, expiry: undefined }));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvv(clean);
    if (cardErrors.cvv) setCardErrors((prev) => ({ ...prev, cvv: undefined }));
  };

  // Format validation for operator phone
  const validateMomoPhone = (val: string, operatorId: MomoOperatorId): boolean => {
    const clean = val.replace(/[\s-+]/g, '');
    const op = MOMO_OPERATORS.find((o) => o.id === operatorId);
    if (!op) return clean.length >= 9;

    const matchesPrefix = op.prefixes.some((p) => clean.startsWith(p));
    if (!matchesPrefix) {
      setMomoPhoneError(`Ce numéro ne correspond pas au réseau ${op.name} (${op.prefixes.slice(0, 3).join(', ')}).`);
      return false;
    }
    if (clean.length < 9 || clean.length > 10) {
      setMomoPhoneError('Le numéro doit comporter 9 ou 10 chiffres.');
      return false;
    }
    setMomoPhoneError(null);
    return true;
  };

  // Validate Card Fields
  const validateCardFields = (): boolean => {
    const errors: { number?: string; holder?: string; expiry?: string; cvv?: string } = {};
    const cleanNum = cardNumber.replace(/\s+/g, '');
    if (cleanNum.length < 16) {
      errors.number = 'Veuillez saisir un numéro de carte à 16 chiffres valide.';
    }

    if (!cardHolder.trim() || cardHolder.trim().length < 3) {
      errors.holder = 'Veuillez saisir le nom figurant sur la carte.';
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
      errors.expiry = 'Date invalide (MM/AA).';
    }

    if (cardCvv.length < 3) {
      errors.cvv = 'CVV à 3 chiffres.';
    }

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submit (Confirmer et Payer)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    // Validate Passenger Name
    if (!fullName.trim() || fullName.trim().length < 3) {
      setFullNameError('Veuillez saisir le nom complet du passager (min. 3 caractères).');
      hasError = true;
    } else {
      setFullNameError(null);
    }

    // Validate Passenger Phone
    const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      setPhoneError('Veuillez entrer un numéro de contact valide à 9 ou 10 chiffres.');
      hasError = true;
    } else {
      setPhoneError(null);
    }

    // Validate Momo Phone if Mobile Money
    if (paymentMethod === 'MOMO') {
      const isMomoValid = validateMomoPhone(momoPhone, selectedMomo);
      if (!isMomoValid) hasError = true;
    }

    // Validate Card if Card
    if (paymentMethod === 'CARD') {
      const isCardValid = validateCardFields();
      if (!isCardValid) hasError = true;
    }

    if (hasError) return;

    // If user is not yet logged in, prompt authentication while preserving full reservation state
    if (!isAuthenticated) {
      openAuthWithNotice(
        `Connexion requise pour confirmer votre billet (${trip.departureCity} ➔ ${trip.arrivalCity}). Votre siège N° ${seatNumber} reste réservé !`,
        () => {
          if (paymentMethod === 'CASH') {
            onPaymentSuccess({
              passengerName: fullName,
              passengerPhone: `+243${phoneNumber.replace(/^0/, '')}`,
              paymentMethod: 'CASH',
            });
          } else {
            setViewState('PENDING');
            setCountdown(90);
            setPollingStep(1);
            setResendNotification(false);
          }
        }
      );
      return;
    }

    // Cash payment directly completes booking without USSD wait
    if (paymentMethod === 'CASH') {
      onPaymentSuccess({
        passengerName: fullName,
        passengerPhone: `+243${phoneNumber.replace(/^0/, '')}`,
        paymentMethod: 'CASH',
      });
      return;
    }

    // Launch Full-Screen Pending State for MOMO or CARD
    setViewState('PENDING');
    setCountdown(90);
    setPollingStep(1);
    setResendNotification(false);
  };

  // Pending countdown & processing simulation
  useEffect(() => {
    if (viewState !== 'PENDING') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setViewState('FAILURE');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Step 1: Initial push / 3DS handshake
    const pollTimer1 = setTimeout(() => {
      setPollingStep(2);
    }, 1100);

    // Step 2: Confirmation & Ticket Issuance (simulated approval)
    const pollTimer2 = setTimeout(() => {
      onPaymentSuccess({
        passengerName: fullName,
        passengerPhone: paymentMethod === 'MOMO' ? `+243${momoPhone.replace(/^0/, '')}` : `+243${phoneNumber.replace(/^0/, '')}`,
        paymentMethod,
        momoProvider: paymentMethod === 'MOMO' ? selectedMomo : undefined,
      });
    }, 2400);

    return () => {
      clearInterval(timer);
      clearTimeout(pollTimer1);
      clearTimeout(pollTimer2);
    };
  }, [viewState, fullName, momoPhone, phoneNumber, paymentMethod, selectedMomo, onPaymentSuccess]);

  // Format mm:ss
  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const activeOperator = MOMO_OPERATORS.find((o) => o.id === selectedMomo) || MOMO_OPERATORS[0];
  const detectedCardBrand = getCardBrand(cardNumber);

  return (
    <div className="w-full max-w-xl mx-auto space-y-5">
      {/* ---------------- 3-STEP FLOW PROGRESS HEADER ---------------- */}
      <div className="bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 rounded-2xl p-4 sm:p-5 shadow-elevation-1 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToSeats}
              className="p-1 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Retour aux sièges"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="font-black text-base text-neutral-900 dark:text-white">
              Récapitulatif & Paiement
            </h2>
          </div>

          <span className="text-[10px] font-black uppercase tracking-wider text-accent-700 dark:text-accent-400 bg-accent-50 dark:bg-accent-950/50 px-2.5 py-1 rounded-full border border-accent-300 dark:border-accent-700">
            Tunnel Sécurisé 3 Étapes
          </span>
        </div>

        {/* 3-Step Visual Breadcrumb */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-750">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
              1
            </div>
            <span className="truncate">Passager</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-primary-900 dark:text-accent-400">
            <div className="w-5 h-5 rounded-full bg-primary-900 dark:bg-accent-500 text-white dark:text-neutral-950 flex items-center justify-center text-[10px] font-black shrink-0">
              2
            </div>
            <span className="truncate">Paiement</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 dark:text-neutral-500">
            <div className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-500 flex items-center justify-center text-[10px] font-black shrink-0">
              3
            </div>
            <span className="truncate">Confirmation</span>
          </div>
        </div>

        {/* Selected Route & Seat Pill */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div>
            <span className="font-black text-neutral-900 dark:text-white block">
              {trip.departureCity} ➔ {trip.arrivalCity}
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {trip.operator.name} • Départ {trip.departureTime}
            </span>
          </div>
          <span className="px-3 py-1 bg-accent-100 dark:bg-accent-950/80 text-accent-900 dark:text-accent-300 font-extrabold text-xs rounded-xl border border-accent-300 dark:border-accent-700">
            Siège N° {seatNumber}
          </span>
        </div>
      </div>

      {/* ---------------- MAIN CHECKOUT FORM (STEPS 1 & 2) ---------------- */}
      {viewState === 'FORM' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* STEP 1: PASSENGER DETAILS CARD */}
          <div className="bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 rounded-2xl p-5 shadow-elevation-1 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-750 pb-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-black text-xs flex items-center justify-center">
                    1
                  </span>
                  <h3 className="font-black text-sm text-neutral-900 dark:text-white">
                    Coordonnées du passager
                  </h3>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 ml-7">
                  Informations inscrites sur le billet officiel
                </p>
              </div>

              {currentUser?.name && (
                <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Pré-rempli ✓
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Full Name */}
              <div>
                <label htmlFor="passenger-fullname" className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Nom et Prénom *
                </label>
                <input
                  id="passenger-fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (fullNameError) setFullNameError(null);
                  }}
                  placeholder="Ex: Patrick Mwamba"
                  className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border text-xs font-semibold bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white transition-all focus:outline-none focus:ring-2 ${
                    fullNameError
                      ? 'border-red-500 focus:ring-red-500/30 bg-red-50/20'
                      : 'border-neutral-200 dark:border-neutral-700 focus:ring-accent-500'
                  }`}
                />
                {fullNameError && (
                  <p className="mt-1 text-[11px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fullNameError}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="passenger-phone" className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Téléphone de contact *
                </label>
                <div className="flex rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-750 focus-within:ring-2 focus-within:ring-accent-500 transition-all">
                  <span className="bg-neutral-100 dark:bg-neutral-750 px-3 py-2.5 text-xs font-black text-neutral-700 dark:text-neutral-300 flex items-center gap-1 shrink-0 border-r border-neutral-200 dark:border-neutral-700">
                    <span>🇨🇩</span>
                    <span>+243</span>
                  </span>
                  <input
                    id="passenger-phone"
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (phoneError) setPhoneError(null);
                    }}
                    placeholder="081 234 5678"
                    className="w-full min-h-[46px] px-3 py-2.5 text-xs font-semibold bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
                {phoneError && (
                  <p className="mt-1 text-[11px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {phoneError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* STEP 2: PAYMENT METHOD (MOBILE MONEY, CARTE BANCAIRE, CASH) */}
          <div className="bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 rounded-2xl p-5 shadow-elevation-1 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-750 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-accent-400 font-black text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="font-black text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Mode de paiement</span>
                </h3>
              </div>

              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-black bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                256-bit SSL
              </span>
            </div>

            {/* 3-Option Payment Selector: Mobile Money, Carte bancaire, Cash */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Option 1: Mobile Money */}
              <button
                type="button"
                onClick={() => setPaymentMethod('MOMO')}
                className={`min-h-[48px] p-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'MOMO'
                    ? 'bg-accent-50 dark:bg-accent-950/50 border-accent-500 text-neutral-950 dark:text-accent-300 ring-2 ring-accent-500/20 shadow-sm'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Mobile Money</span>
              </button>

              {/* Option 2: Carte Bancaire (Visa / Mastercard) */}
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`min-h-[48px] p-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'CARD'
                    ? 'bg-accent-50 dark:bg-accent-950/50 border-accent-500 text-neutral-950 dark:text-accent-300 ring-2 ring-accent-500/20 shadow-sm'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Carte Bancaire</span>
              </button>

              {/* Option 3: Espèces (Cash) */}
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`min-h-[48px] p-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'CASH'
                    ? 'bg-accent-50 dark:bg-accent-950/50 border-accent-500 text-neutral-950 dark:text-accent-300 ring-2 ring-accent-500/20 shadow-sm'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                }`}
              >
                <Banknote className="w-4 h-4 text-amber-600" />
                <span>À l&apos;agence (Cash)</span>
              </button>
            </div>

            {/* ---------------- 2A. MOBILE MONEY OPERATOR CARDS ---------------- */}
            {paymentMethod === 'MOMO' && (
              <div className="space-y-3 pt-1 animate-fade-in">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
                  Opérateurs agréés RDC :
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {MOMO_OPERATORS.map((op) => {
                    const isSelected = selectedMomo === op.id;

                    return (
                      <button
                        key={op.id}
                        type="button"
                        onClick={() => {
                          setSelectedMomo(op.id);
                          if (momoPhone) validateMomoPhone(momoPhone, op.id);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all relative ${
                          isSelected
                            ? `border-2 ${op.borderActive} ${op.bgLight} ${op.bgDark} shadow-sm scale-[1.01]`
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 bg-white dark:bg-neutral-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {/* Stylized Logo Emblem */}
                            <div 
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-black shadow-xs shrink-0"
                              style={{ backgroundColor: op.brandColor }}
                            >
                              {op.id === 'MPESA' && 'M'}
                              {op.id === 'AIRTEL' && 'air'}
                              {op.id === 'ORANGE' && 'O'}
                              {op.id === 'AFRICELL' && 'Afr'}
                            </div>
                            <span className="font-extrabold text-xs text-neutral-900 dark:text-white">
                              {op.name}
                            </span>
                          </div>

                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-accent-500 text-neutral-950 flex items-center justify-center font-black text-[10px]">
                              ✓
                            </div>
                          )}
                        </div>

                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block pl-9">
                          {op.tagline}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Mobile Money Phone Number Input with Operator Validation */}
                <div className="pt-2">
                  <label htmlFor="momo-account-phone" className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Numéro de compte {activeOperator.name} *
                  </label>
                  <div className="flex rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-750 focus-within:ring-2 focus-within:ring-accent-500 transition-all">
                    <span className="bg-neutral-100 dark:bg-neutral-750 px-3 py-2.5 text-xs font-black text-neutral-700 dark:text-neutral-300 flex items-center gap-1 shrink-0 border-r border-neutral-200 dark:border-neutral-750">
                      <span>🇨🇩</span>
                      <span>+243</span>
                    </span>
                    <input
                      id="momo-account-phone"
                      type="tel"
                      required
                      value={momoPhone}
                      onChange={(e) => {
                        setMomoPhone(e.target.value);
                        validateMomoPhone(e.target.value, selectedMomo);
                      }}
                      placeholder={activeOperator.placeholder}
                      className="w-full min-h-[46px] px-3 py-2.5 text-xs font-semibold bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  {momoPhoneError ? (
                    <p className="mt-1 text-[11px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {momoPhoneError}
                    </p>
                  ) : (
                    <p className="mt-1 text-[10px] text-neutral-500 dark:text-neutral-400">
                      Un pop-up USSD sera envoyé sur ce numéro pour confirmer le débit sécurisé.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ---------------- 2B. CARTE BANCAIRE FORM (VISA / MASTERCARD) ---------------- */}
            {paymentMethod === 'CARD' && (
              <div className="space-y-3.5 pt-1 animate-fade-in">
                {/* Accepted Cards Badges */}
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    Cartes acceptées :
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[10px] font-black">
                      VISA
                    </span>
                    <span className="px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-[10px] font-black">
                      Mastercard
                    </span>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold">
                      Rawbank • EquityBCDC • TMB
                    </span>
                  </div>
                </div>

                {/* Card Number */}
                <div>
                  <label htmlFor="card-number-input" className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Numéro de carte bancaire *
                  </label>
                  <div className="relative">
                    <input
                      id="card-number-input"
                      type="text"
                      required
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4000 1234 5678 9010"
                      className={`w-full min-h-[46px] pl-3.5 pr-14 py-2.5 rounded-xl border text-xs font-mono font-bold bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white transition-all focus:outline-none focus:ring-2 ${
                        cardErrors.number
                          ? 'border-red-500 focus:ring-red-500/30 bg-red-50/20'
                          : 'border-neutral-200 dark:border-neutral-750 focus:ring-accent-500'
                      }`}
                    />
                    <div className="absolute right-3 top-3 flex items-center">
                      {detectedCardBrand === 'VISA' && (
                        <span className="text-[10px] font-black text-blue-600 bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                          VISA
                        </span>
                      )}
                      {detectedCardBrand === 'MASTERCARD' && (
                        <span className="text-[10px] font-black text-red-600 bg-red-100 dark:bg-red-950 px-1.5 py-0.5 rounded">
                          MC
                        </span>
                      )}
                      {detectedCardBrand === 'GENERIC' && (
                        <CreditCard className="w-4 h-4 text-neutral-400" />
                      )}
                    </div>
                  </div>
                  {cardErrors.number && (
                    <p className="mt-1 text-[11px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {cardErrors.number}
                    </p>
                  )}
                </div>

                {/* Cardholder Name */}
                <div>
                  <label htmlFor="card-holder-input" className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Nom du porteur (tel qu&apos;indiqué sur la carte) *
                  </label>
                  <input
                    id="card-holder-input"
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => {
                      setCardHolder(e.target.value.toUpperCase());
                      if (cardErrors.holder) setCardErrors((prev) => ({ ...prev, holder: undefined }));
                    }}
                    placeholder="PATRICK MWAMBA"
                    className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border text-xs font-bold tracking-wider uppercase bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white transition-all focus:outline-none focus:ring-2 ${
                      cardErrors.holder
                        ? 'border-red-500 focus:ring-red-500/30 bg-red-50/20'
                        : 'border-neutral-200 dark:border-neutral-750 focus:ring-accent-500'
                    }`}
                  />
                  {cardErrors.holder && (
                    <p className="mt-1 text-[11px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {cardErrors.holder}
                    </p>
                  )}
                </div>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="card-expiry-input" className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Date d&apos;expiration *
                    </label>
                    <input
                      id="card-expiry-input"
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/AA"
                      className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white transition-all focus:outline-none focus:ring-2 ${
                        cardErrors.expiry
                          ? 'border-red-500 focus:ring-red-500/30 bg-red-50/20'
                          : 'border-neutral-200 dark:border-neutral-750 focus:ring-accent-500'
                      }`}
                    />
                    {cardErrors.expiry && (
                      <p className="mt-1 text-[11px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {cardErrors.expiry}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="card-cvv-input" className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Code CVV (3 chiffres) *
                    </label>
                    <div className="relative">
                      <input
                        id="card-cvv-input"
                        type="password"
                        required
                        value={cardCvv}
                        onChange={handleCvvChange}
                        placeholder="123"
                        maxLength={4}
                        className={`w-full min-h-[46px] pl-3.5 pr-8 py-2.5 rounded-xl border text-xs font-mono font-bold bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white transition-all focus:outline-none focus:ring-2 ${
                          cardErrors.cvv
                            ? 'border-red-500 focus:ring-red-500/30 bg-red-50/20'
                            : 'border-neutral-200 dark:border-neutral-750 focus:ring-accent-500'
                        }`}
                      />
                      <Lock className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-3.5" />
                    </div>
                    {cardErrors.cvv && (
                      <p className="mt-1 text-[11px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {cardErrors.cvv}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-[11px] font-semibold">
                    Protégé par <strong>Verified by Visa</strong> & <strong>Mastercard Identity Check</strong> (3D Secure).
                  </span>
                </div>
              </div>
            )}

            {/* ---------------- 2C. CASH EN AGENCE / À BORD ---------------- */}
            {paymentMethod === 'CASH' && (
              <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs space-y-2 animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-neutral-950 flex items-center justify-center font-black">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-xs text-neutral-900 dark:text-white">
                    Paiement en espèces au guichet ou à bord
                  </span>
                </div>
                <p className="text-[11px] text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  Votre place N° <strong>{seatNumber}</strong> est garantie et bloquée. Vous pourrez régler en Francs Congolais ou Dollars au guichet de la compagnie ({trip.departureStation}) au plus tard 2 heures avant le départ, ou directement auprès du chef de bord.
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                  <Check className="w-3.5 h-3.5" />
                  <span>Un bon de réservation avec QR code officiel vous est remis instantanément.</span>
                </div>
              </div>
            )}
          </div>

          {/* ---------------- CLEAR PRICE BREAKDOWN & USD TOGGLE ---------------- */}
          <div className="bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 rounded-2xl p-4 sm:p-5 shadow-elevation-1 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-750 pb-2.5">
              <span className="font-extrabold text-xs text-neutral-900 dark:text-white">
                Détail de la tarification
              </span>

              {/* Currency Toggle Switch */}
              <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-[10px] font-black">
                <button
                  type="button"
                  onClick={() => setCurrency('CDF')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    currency === 'CDF'
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-black'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Franc Congolais (CDF)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    currency === 'USD'
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-black'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Dollar (USD)
                </button>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                <span>Tarif de base (Place N° {seatNumber})</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {fareFormatted} {currencySymbol}
                </span>
              </div>

              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                <span>Mode sélectionné</span>
                <span className="font-extrabold text-neutral-800 dark:text-neutral-200">
                  {paymentMethod === 'MOMO' && `Mobile Money (${activeOperator.name})`}
                  {paymentMethod === 'CARD' && 'Carte Bancaire (Visa/Mastercard)'}
                  {paymentMethod === 'CASH' && 'Espèces au guichet (Cash)'}
                </span>
              </div>

              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                <span>Frais de réservation et émission QR</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  0 {currencySymbol} (Inclus / Offerts)
                </span>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-neutral-100 dark:border-neutral-750 text-sm font-black text-neutral-900 dark:text-white">
                <span>Total net à régler</span>
                <span className="text-base text-primary-900 dark:text-accent-400 font-black">
                  {fareFormatted} {currencySymbol}
                </span>
              </div>
            </div>
          </div>

          {/* ---------------- REFUND & CANCELLATION POLICY SUMMARY ---------------- */}
          <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-850 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                <span className="font-extrabold text-xs text-sky-950 dark:text-sky-200">
                  Politique d&apos;annulation &amp; remboursement garanti
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpCenterModal(true)}
                className="text-[11px] font-bold text-sky-700 dark:text-sky-300 hover:underline inline-flex items-center gap-1"
              >
                <span>Aide</span>
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <ul className="space-y-1.5 text-[11px] text-neutral-600 dark:text-neutral-300">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Annulation 100% gratuite</strong> jusqu&apos;à 24h avant le départ de la gare.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>80% remboursé ou échange gratuit</strong> jusqu&apos;à 2h avant le départ.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Recrédit direct</strong> sur votre compte Mobile Money sous 2 à 4 heures.</span>
              </li>
            </ul>
          </div>

          {/* ---------------- TRUST CUES & 24/7 SUPPORT ---------------- */}
          <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-750 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-[11px] text-neutral-900 dark:text-white block">
                  Paiement 100% sécurisé et garanti
                </span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block">
                  Agrément Banque Centrale du Congo (BCC). Aucun frais caché.
                </span>
              </div>
            </div>

            <a
              href="https://wa.me/243810000000?text=Bonjour%20Transnumerica%2C%20j%27ai%20une%20question%20sur%20mon%20paiement%20bus"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 hover:underline shrink-0 flex items-center gap-1"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Support WhatsApp 24/7</span>
            </a>
          </div>

          {/* ---------------- SUBMIT BUTTON (Preserves 'Confirmer et Payer') ---------------- */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full min-h-[50px] py-3.5 px-6 bg-primary-900 hover:bg-primary-950 dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-neutral-950 text-white font-black text-sm rounded-2xl shadow-elevation-2 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
              <span>{paymentMethod === 'CASH' ? 'Confirmer la réservation (Cash)' : 'Confirmer et Payer'}</span>
              <span className="font-bold text-accent-400 dark:text-neutral-950">
                ({fareFormatted} {currencySymbol})
              </span>
            </button>
          </div>
        </form>
      )}

      {/* ---------------- FULL-SCREEN PENDING USSD / 3D SECURE STATE ---------------- */}
      {viewState === 'PENDING' && (
        <div 
          role="dialog"
          aria-labelledby="pending-ussd-title"
          className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 rounded-3xl p-6 shadow-elevation-3 text-center space-y-5 animate-scale-in">
            {/* Operator Badge & Pulse Animation */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div 
                className="absolute inset-0 rounded-full animate-ping opacity-25"
                style={{ backgroundColor: paymentMethod === 'CARD' ? '#2563EB' : activeOperator.brandColor }}
              />
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg relative z-10"
                style={{ backgroundColor: paymentMethod === 'CARD' ? '#2563EB' : activeOperator.brandColor }}
              >
                {paymentMethod === 'CARD' ? '💳' : '📱'}
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 id="pending-ussd-title" className="text-xl font-black text-neutral-900 dark:text-white">
                {paymentMethod === 'CARD' ? 'Validation 3D Secure en cours' : 'Validez sur votre téléphone'}
              </h2>
              {paymentMethod === 'CARD' ? (
                <>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 font-semibold leading-relaxed">
                    Connexion sécurisée avec votre banque émettrice pour la carte se terminant par{' '}
                    <strong className="text-neutral-900 dark:text-white">
                      •••• {cardNumber.replace(/\s+/g, '').slice(-4) || '4242'}
                    </strong>.
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Veuillez approuver la notification push sur votre application bancaire ou saisir le mot de passe à usage unique (OTP).
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 font-semibold leading-relaxed">
                    Une invite USSD <strong className="text-neutral-900 dark:text-white">{activeOperator.name}</strong> a été envoyée au{' '}
                    <strong className="text-neutral-900 dark:text-white">+243 {momoPhone}</strong>.
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Saisissez votre code PIN secret sur votre écran pour approuver le prélèvement de{' '}
                    <strong className="text-accent-700 dark:text-accent-400">{fareFormatted} {currencySymbol}</strong>.
                  </p>
                </>
              )}
            </div>

            {/* Countdown timer & Polling status */}
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-accent-600 dark:text-accent-400" />
                  <span>Temps restant pour valider</span>
                </span>
                <span className="font-mono text-sm font-black text-neutral-900 dark:text-white">
                  {formatCountdown(countdown)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent-500 transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${(countdown / 90) * 100}%` }}
                />
              </div>

              {/* Polling live feedback */}
              <div className="pt-1 flex items-center justify-center gap-2 text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
                <Loader2 className="w-3 h-3 animate-spin text-accent-500" />
                <span>
                  {paymentMethod === 'CARD'
                    ? (pollingStep === 1 ? 'Authentification 3D Secure auprès du réseau bancaire...' : 'Validation finale du débit...')
                    : (pollingStep === 1 ? 'Attente du déclenchement USSD sur votre carte SIM...' : 'Code PIN en cours de validation par votre opérateur...')}
                </span>
              </div>
            </div>

            {/* Resend notification feedback (for MOMO) */}
            {resendNotification && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Nouvelle invite USSD renvoyée avec succès !</span>
              </div>
            )}

            {/* Resend & Cancel Actions */}
            <div className="space-y-2 pt-1">
              {paymentMethod === 'MOMO' && (
                <button
                  type="button"
                  onClick={() => {
                    setCountdown(90);
                    setPollingStep(1);
                    setResendNotification(true);
                    setTimeout(() => setResendNotification(false), 3000);
                  }}
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-750 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Renvoyer la demande USSD</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setViewState('FORM')}
                className="w-full py-2 text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                Annuler ou changer de moyen de paiement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- FAILURE & RETRY STATE ---------------- */}
      {viewState === 'FAILURE' && (
        <div 
          role="alert"
          className="bg-white dark:bg-neutral-850 border border-red-200 dark:border-red-800 rounded-3xl p-6 shadow-elevation-2 text-center space-y-4 animate-scale-in"
        >
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-black text-neutral-900 dark:text-white">
              Paiement non confirmé
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              Le délai de validation a expiré ou la transaction n&apos;a pas pu être finalisée.
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Aucun montant n&apos;a été débité de votre compte. Vous pouvez réessayer immédiatement ou choisir un autre mode de règlement.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setViewState('PENDING');
                setCountdown(90);
                setPollingStep(1);
              }}
              className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-primary-900 hover:bg-primary-950 dark:bg-primary-500 dark:text-neutral-950 text-white text-xs font-black flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réessayer le paiement</span>
            </button>

            <button
              type="button"
              onClick={() => setViewState('FORM')}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              Changer de moyen de paiement
            </button>

            <a
              href="https://wa.me/243810000000?text=Bonjour%20Transnumerica%2C%20mon%20paiement%20bus%20a%20echoue"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline pt-2"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Contacter l&apos;assistance WhatsApp en direct</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
