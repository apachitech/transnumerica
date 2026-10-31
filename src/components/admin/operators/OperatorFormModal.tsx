'use client';

import React, { useState, useEffect } from 'react';
import { X, Building2, Save, AlertTriangle, Loader2, MapPin, Phone, Mail, FileText } from 'lucide-react';
import { OperatorAccount } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  operator: OperatorAccount | null; // null for create, object for edit
  onSuccess: () => void;
  onConflict?: (serverVersion: number) => void;
}

export function OperatorFormModal({
  isOpen,
  onClose,
  operator,
  onSuccess,
  onConflict,
}: Props) {
  const isEditing = !!operator;

  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [tradeRegisterNumber, setTradeRegisterNumber] = useState('');
  const [nationalIdentification, setNationalIdentification] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [ministryLicense, setMinistryLicense] = useState('');
  const [primaryCity, setPrimaryCity] = useState('Kinshasa');
  const [servicedCitiesInput, setServicedCitiesInput] = useState('Kinshasa, Matadi');
  const [description, setDescription] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactTitle, setContactTitle] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [hotlinePhone, setHotlinePhone] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [commissionRate, setCommissionRate] = useState(10.0);
  const [payoutMethod, setPayoutMethod] = useState<'BANK_TRANSFER' | 'MOBILE_MONEY'>('BANK_TRANSFER');
  const [bankName, setBankName] = useState('Rawbank RDC');
  const [accountNumber, setAccountNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (operator) {
      setName(operator.name);
      setBrandName(operator.brandName);
      setTradeRegisterNumber(operator.tradeRegisterNumber);
      setNationalIdentification(operator.nationalIdentification);
      setTaxNumber(operator.taxNumber);
      setMinistryLicense(operator.ministryLicense);
      setPrimaryCity(operator.primaryCity);
      setServicedCitiesInput(operator.servicedCities.join(', '));
      setDescription(operator.description);
      setContactName(operator.contactPerson.name);
      setContactTitle(operator.contactPerson.title);
      setContactPhone(operator.contactPerson.phone);
      setContactEmail(operator.contactPerson.email);
      setHotlinePhone(operator.hotlinePhone);
      setEmergencyPhone(operator.emergencyPhone);
      setCommissionRate(operator.commissionRate);
      setPayoutMethod(operator.payoutDetails.payoutMethod);
      setBankName(operator.payoutDetails.bankName || 'Rawbank RDC');
      setAccountNumber(operator.payoutDetails.accountNumberMasked || '');
    } else {
      setName('');
      setBrandName('');
      setTradeRegisterNumber('');
      setNationalIdentification('');
      setTaxNumber('');
      setMinistryLicense('');
      setPrimaryCity('Kinshasa');
      setServicedCitiesInput('Kinshasa, Matadi');
      setDescription('');
      setContactName('');
      setContactTitle('Directeur d’Exploitation');
      setContactPhone('+243');
      setContactEmail('');
      setHotlinePhone('+243');
      setEmergencyPhone('+243');
      setCommissionRate(10.0);
      setPayoutMethod('BANK_TRANSFER');
      setBankName('Rawbank RDC');
      setAccountNumber('');
    }
  }, [operator]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const servicedCities = servicedCitiesInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    setLoading(true);

    try {
      if (isEditing) {
        const res = await fetch(`/api/admin/operators/${operator.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            version: operator.version,
            name: name.trim(),
            brandName: brandName.trim(),
            tradeRegisterNumber: tradeRegisterNumber.trim(),
            nationalIdentification: nationalIdentification.trim(),
            taxNumber: taxNumber.trim(),
            ministryLicense: ministryLicense.trim(),
            primaryCity,
            servicedCities,
            description: description.trim(),
            contactPerson: {
              name: contactName.trim(),
              title: contactTitle.trim(),
              phone: contactPhone.trim(),
              email: contactEmail.trim(),
            },
            hotlinePhone: hotlinePhone.trim(),
            emergencyPhone: emergencyPhone.trim(),
            auditReason: 'Mise à jour du profil de l’opérateur depuis le tableau de bord',
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          if (res.status === 409) {
            if (onConflict) onConflict(data.serverVersion || operator.version + 1);
            throw new Error('Conflit de modification (409) : la fiche a été éditée par un autre administrateur.');
          }
          throw new Error(data.error || 'Erreur lors de la mise à jour de l’opérateur');
        }
      } else {
        const res = await fetch('/api/admin/operators', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            brandName: brandName.trim(),
            tradeRegisterNumber: tradeRegisterNumber.trim(),
            nationalIdentification: nationalIdentification.trim(),
            taxNumber: taxNumber.trim(),
            ministryLicense: ministryLicense.trim(),
            primaryCity,
            servicedCities,
            description: description.trim(),
            contactPerson: {
              name: contactName.trim(),
              title: contactTitle.trim(),
              phone: contactPhone.trim(),
              email: contactEmail.trim(),
            },
            hotlinePhone: hotlinePhone.trim(),
            emergencyPhone: emergencyPhone.trim(),
            commissionRate,
            payoutDetails: {
              payoutMethod,
              bankName: payoutMethod === 'BANK_TRANSFER' ? bankName : undefined,
              accountNumber: accountNumber.trim() || '00000000',
              accountHolderName: name.trim(),
              payoutFrequency: 'DAILY',
            },
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Erreur lors de la création de l’opérateur');
        }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0D1E32] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#091522] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {isEditing ? `Modifier : ${operator.brandName}` : 'Enregistrer un nouvel opérateur'}
              </h3>
              <p className="text-2xs text-neutral-400">
                {isEditing
                  ? `ID: ${operator.id} • Version courante: v${operator.version}`
                  : 'Création d’une compagnie de transport agréée'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Entreprise & Registres */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Identité Juridique & Licences RDC
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-2xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Raison sociale légale *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Matadi Express VIP SARL"
                  className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="text-2xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Nom commercial affiché aux voyageurs *
                </label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Ex: Matadi Express"
                  className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-2xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  N° RCCM *
                </label>
                <input
                  type="text"
                  required
                  value={tradeRegisterNumber}
                  onChange={(e) => setTradeRegisterNumber(e.target.value)}
                  placeholder="CD/KIN/RCCM/..."
                  className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="text-2xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Id. Nationale *
                </label>
                <input
                  type="text"
                  required
                  value={nationalIdentification}
                  onChange={(e) => setNationalIdentification(e.target.value)}
                  placeholder="01-83-N48201B"
                  className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="text-2xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  NIF (Numéro d&apos;Impôt) *
                </label>
                <input
                  type="text"
                  required
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  placeholder="A1029384K"
                  className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-2xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Licence Ministère des Transports *
                </label>
                <input
                  type="text"
                  required
                  value={ministryLicense}
                  onChange={(e) => setMinistryLicense(e.target.value)}
                  placeholder="MIN-TRANS-2024-LIC-0012"
                  className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="text-2xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Ville siège principal *
                </label>
                <select
                  value={primaryCity}
                  onChange={(e) => setPrimaryCity(e.target.value)}
                  className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="Kinshasa">Kinshasa</option>
                  <option value="Lubumbashi">Lubumbashi</option>
                  <option value="Goma">Goma</option>
                  <option value="Kolwezi">Kolwezi</option>
                  <option value="Matadi">Matadi</option>
                  <option value="Kikwit">Kikwit</option>
                  <option value="Kananga">Kananga</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-2xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Villes desservies (séparées par une virgule) *
              </label>
              <input
                type="text"
                required
                value={servicedCitiesInput}
                onChange={(e) => setServicedCitiesInput(e.target.value)}
                placeholder="Ex: Kinshasa, Matadi, Boma, Muanda"
                className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label className="text-2xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Description commerciale de la compagnie *
              </label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Présentation des services, classes de confort, gares routières..."
                className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          {/* Section 2: Contacts & Assistance */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Personne Contact & Lignes Directes
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-2xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Nom du représentant légal / contact *
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Ex: Dieudonné Mwamba"
                  className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="text-2xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Fonction / Titre *
                </label>
                <input
                  type="text"
                  required
                  value={contactTitle}
                  onChange={(e) => setContactTitle(e.target.value)}
                  placeholder="Ex: Directeur Général"
                  className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-2xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Téléphone direct *
                </label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+243..."
                  className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="text-2xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Email de contact *
                </label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contact@compagnie.cd"
                  className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-2xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Hotline Guichet / Passagers *
                </label>
                <input
                  type="tel"
                  required
                  value={hotlinePhone}
                  onChange={(e) => setHotlinePhone(e.target.value)}
                  placeholder="+243..."
                  className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="text-2xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Téléphone Urgence 24/7 *
                </label>
                <input
                  type="tel"
                  required
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+243..."
                  className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Commission et Finances (uniquement en création) */}
          {!isEditing && (
            <div className="space-y-3 pt-3 border-t border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Paramètres Financiers Initiaux
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-2xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Taux de commission plateforme (%) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="30"
                    required
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 10)}
                    className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="text-2xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Canal de versement (Payout) *
                  </label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value as any)}
                    className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="BANK_TRANSFER">Virement Bancaire (Rawbank, Equity BCDC, TMB)</option>
                    <option value="MOBILE_MONEY">Mobile Money (M-Pesa, Airtel, Orange)</option>
                  </select>
                </div>
              </div>

              {payoutMethod === 'BANK_TRANSFER' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-2xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Banque partenaire RDC
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    >
                      <option value="Rawbank RDC">Rawbank RDC</option>
                      <option value="Equity BCDC">Equity BCDC</option>
                      <option value="Trust Merchant Bank (TMB)">Trust Merchant Bank (TMB)</option>
                      <option value="FBNBank RDC">FBNBank RDC</option>
                      <option value="Sofibanque">Sofibanque</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-2xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Numéro de compte bancaire
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="00012-00102938491-92"
                      className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-2xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Numéro Mobile Money pour les versements
                  </label>
                  <input
                    type="tel"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="+243 81 000 0000"
                    className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              )}
            </div>
          )}

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
              className="px-5 py-2 rounded-xl bg-brand-primary text-black font-bold text-xs hover:bg-brand-primary/90 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditing ? 'Sauvegarder les modifications' : 'Créer l’opérateur'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

