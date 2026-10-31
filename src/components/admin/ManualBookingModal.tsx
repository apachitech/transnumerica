'use client';

import React, { useState } from 'react';
import { AdminDetailedBooking } from '@/types';
import { Plus, Trash2, Ticket, AlertTriangle, UserCheck } from 'lucide-react';

interface ManualBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBooking: AdminDetailedBooking) => void;
}

const CORRIDORS = [
  {
    code: 'KIN-MAT',
    name: 'Kinshasa ➔ Matadi (RN1)',
    origin: 'Kinshasa',
    dest: 'Matadi',
    station: 'Gare Centrale Kinshasa',
    operatorId: 'op_matadi_express',
    operatorName: 'Matadi Express VIP',
    busPlate: 'KN 8842 BG',
    defaultFare: 35000,
  },
  {
    code: 'LUB-KOL',
    name: 'Lubumbashi ➔ Kolwezi (RN39)',
    origin: 'Lubumbashi',
    dest: 'Kolwezi',
    station: 'Gare Routière Kenya',
    operatorId: 'op_katanga_horizon',
    operatorName: 'Katanga Horizon VIP',
    busPlate: 'LSH 4491 AA',
    defaultFare: 45000,
  },
  {
    code: 'GOM-BUK',
    name: 'Goma ➔ Bukavu (Lac Kivu / Route)',
    origin: 'Goma',
    dest: 'Bukavu',
    station: 'Port Public de Goma',
    operatorId: 'op_kivu_safari',
    operatorName: 'Kivu Safari Express',
    busPlate: 'GOM 1209 BB',
    defaultFare: 28000,
  },
  {
    code: 'KIN-KIK',
    name: 'Kinshasa ➔ Kikwit (RN1 Est)',
    origin: 'Kinshasa',
    dest: 'Kikwit',
    station: 'Gare de Limete Échangeur',
    operatorId: 'op_congo_fleuve',
    operatorName: 'Congo Fleuve Coach',
    busPlate: 'KN 6120 DD',
    defaultFare: 30000,
  },
];

export function ManualBookingModal({
  isOpen,
  onClose,
  onSuccess,
}: ManualBookingModalProps) {
  const [selectedCorridorIndex, setSelectedCorridorIndex] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+243');
  const [customerEmail, setCustomerEmail] = useState('');
  const [departureDate, setDepartureDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [departureTime, setDepartureTime] = useState('06:30');
  const [paymentMethod, setPaymentMethod] = useState<
    'Vodacom M-Pesa' | 'Orange Money' | 'Airtel Money' | 'Espèces (Guichet)' | 'Carte Bancaire'
  >('Espèces (Guichet)');
  const [notes, setNotes] = useState('Réservation effectuée au guichet agence');

  const [passengers, setPassengers] = useState([
    { fullName: '', phone: '', seatNumber: '3A', fareMinor: 3500000 },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const corridor = CORRIDORS[selectedCorridorIndex];

  const handleAddPassenger = () => {
    setPassengers((prev) => [
      ...prev,
      {
        fullName: '',
        phone: customerPhone,
        seatNumber: `${prev.length + 3}B`,
        fareMinor: corridor.defaultFare * 100,
      },
    ]);
  };

  const handleRemovePassenger = (index: number) => {
    if (passengers.length <= 1) return;
    setPassengers((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePassengerChange = (index: number, field: string, value: any) => {
    setPassengers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Nom et numéro de téléphone du client requis.');
      return;
    }
    for (const [i, p] of passengers.entries()) {
      if (!p.fullName.trim() || !p.seatNumber.trim()) {
        setError(`Veuillez renseigner le nom et le siège pour le passager #${i + 1}.`);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || undefined,
          routeId: `route_${corridor.code.toLowerCase()}`,
          corridorCode: corridor.code,
          originCity: corridor.origin,
          destinationCity: corridor.dest,
          boardingStation: corridor.station,
          departureDate,
          departureTime,
          operatorId: corridor.operatorId,
          operatorName: corridor.operatorName,
          busPlateNumber: corridor.busPlate,
          comfortClass: 'VIP',
          passengers: passengers.map((p) => ({
            fullName: p.fullName.trim(),
            phone: p.phone.trim() || customerPhone.trim(),
            seatNumber: p.seatNumber.trim().toUpperCase(),
            fareMinor: corridor.defaultFare * 100,
          })),
          currency: 'CDF',
          paymentMethod,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la création de la réservation');
      } else {
        onSuccess(data.booking);
        onClose();
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const totalCdf = passengers.length * corridor.defaultFare;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl p-5 sm:p-6 space-y-4 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Réservation au Guichet (Pour le compte d'un client)
              </h3>
              <p className="text-xs text-neutral-400">
                Émission manuelle de billet d'autocar en agence
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-500 hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Corridor Selection */}
          <div>
            <label className="block font-semibold text-neutral-300 mb-1">
              Corridor & Ligne Interurbaine :
            </label>
            <select
              value={selectedCorridorIndex}
              onChange={(e) => setSelectedCorridorIndex(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {CORRIDORS.map((c, idx) => (
                <option key={c.code} value={idx}>
                  {c.name} — {c.operatorName} ({c.defaultFare.toLocaleString()} CDF)
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                Date de Départ : *
              </label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full px-2.5 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                Heure de Départ : *
              </label>
              <input
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full px-2.5 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Customer Info */}
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-3">
            <div className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              <span>Contact Acheteur / Demandeur</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  Nom Complet du Client : *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: Dieudonné Mwamba"
                  className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  Téléphone RDC : *
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+243810000000"
                  className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Passengers & Seats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-neutral-200">
                Passagers & Sièges Attribués ({passengers.length}) :
              </label>
              <button
                type="button"
                onClick={handleAddPassenger}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter un passager</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {passengers.map((p, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center gap-2"
                >
                  <span className="text-xs font-bold text-neutral-500 w-5">#{idx + 1}</span>
                  <input
                    type="text"
                    value={p.fullName}
                    onChange={(e) => handlePassengerChange(idx, 'fullName', e.target.value)}
                    placeholder="Nom du voyageur"
                    className="flex-1 px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white"
                  />
                  <input
                    type="text"
                    value={p.seatNumber}
                    onChange={(e) =>
                      handlePassengerChange(idx, 'seatNumber', e.target.value.toUpperCase())
                    }
                    placeholder="Siège"
                    className="w-16 px-2 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white font-mono text-center uppercase"
                  />
                  {passengers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePassenger(idx)}
                      className="p-1.5 text-neutral-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                Mode de Règlement :
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Espèces (Guichet)">Espèces au Guichet</option>
                <option value="Vodacom M-Pesa">Vodacom M-Pesa</option>
                <option value="Orange Money">Orange Money</option>
                <option value="Airtel Money">Airtel Money</option>
                <option value="Carte Bancaire">Carte Bancaire / TPE</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-right">
                <span className="text-[11px] text-neutral-400 block">Total à Encaisser :</span>
                <span className="text-base font-black text-amber-400">
                  {totalCdf.toLocaleString()} CDF
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-lg shadow"
            >
              {loading ? 'Création & Contrôle...' : 'Émettre le Billet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

