'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Printer,
  ArrowLeft,
  CheckCircle2,
  Clock,
  UserCheck,
  UserX,
  Bus,
  Search,
  Share2,
  ShieldCheck,
} from 'lucide-react';

interface PassengerEntry {
  seat: number;
  ticketRef: string;
  name: string;
  phone: string;
  emergencyPhone: string;
  status: 'EMBARQUE' | 'EN_ATTENTE' | 'ABSENT';
  scannedAt?: string;
}

const MOCK_MANIFEST: PassengerEntry[] = [
  { seat: 1, ticketRef: 'TKT-KIN-MAT-001', name: 'Alain Mwepu', phone: '+243812345678', emergencyPhone: '+243819990001', status: 'EMBARQUE', scannedAt: '06:45' },
  { seat: 2, ticketRef: 'TKT-KIN-MAT-002', name: 'Solange Kalala', phone: '+243823456789', emergencyPhone: '+243829990002', status: 'EMBARQUE', scannedAt: '06:48' },
  { seat: 3, ticketRef: 'TKT-KIN-MAT-003', name: 'Grace Mutombo', phone: '+243894567890', emergencyPhone: '+243899990003', status: 'EN_ATTENTE' },
  { seat: 4, ticketRef: 'TKT-KIN-MAT-004', name: 'Moïse Katumbi', phone: '+243995678901', emergencyPhone: '+243999990004', status: 'EN_ATTENTE' },
  { seat: 5, ticketRef: 'TKT-KIN-MAT-005', name: 'Dorcas Ilunga', phone: '+243856789012', emergencyPhone: '+243859990005', status: 'ABSENT' },
  { seat: 6, ticketRef: 'TKT-KIN-MAT-006', name: 'Hervé Kabongo', phone: '+243977890123', emergencyPhone: '+243979990006', status: 'EMBARQUE', scannedAt: '06:52' },
  { seat: 7, ticketRef: 'TKT-KIN-MAT-007', name: 'Patricia Tshibola', phone: '+243818901234', emergencyPhone: '+243819990007', status: 'EN_ATTENTE' },
  { seat: 8, ticketRef: 'TKT-KIN-MAT-008', name: 'Fiston Mayele', phone: '+243829012345', emergencyPhone: '+243829990008', status: 'EMBARQUE', scannedAt: '06:55' },
];

export default function TripManifestPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = (params?.id as string) || 'TRIP-KIN-MAT-01';

  const [passengers, setPassengers] = useState<PassengerEntry[]>(MOCK_MANIFEST);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleBoarding = (seat: number) => {
    setPassengers((prev) =>
      prev.map((p) => {
        if (p.seat !== seat) return p;
        const nextStatus =
          p.status === 'EN_ATTENTE'
            ? 'EMBARQUE'
            : p.status === 'EMBARQUE'
            ? 'ABSENT'
            : 'EN_ATTENTE';
        return {
          ...p,
          status: nextStatus,
          scannedAt: nextStatus === 'EMBARQUE' ? new Date().toLocaleTimeString('fr-CD', { hour: '2-digit', minute: '2-digit' }) : undefined,
        };
      })
    );
  };

  const filtered = passengers.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ticketRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.seat.toString().includes(searchTerm)
  );

  const boardedCount = passengers.filter((p) => p.status === 'EMBARQUE').length;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-3 sm:p-6 print:bg-white print:text-black">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/driver')}
              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Bus className="w-5 h-5 text-accent-400" />
                <h1 className="text-lg font-black text-white">Manifeste Passagers — Navette Interurbaine</h1>
              </div>
              <p className="text-xs text-neutral-400">
                Ligne : <strong>Kinshasa (Gare Centrale) → Matadi (Port)</strong> • Départ 07:00
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4 text-accent-400" />
              <span>Imprimer / PDF</span>
            </button>
            <button
              onClick={() => router.push('/driver/checkin')}
              className="px-4 py-2 bg-accent-500 hover:bg-accent-400 text-neutral-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md"
            >
              <span>Scanner Billets QR</span>
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-2xl print:border-black print:bg-neutral-100">
          <div>
            <span className="text-2xs text-neutral-400 block font-bold uppercase">Capacité Bus</span>
            <span className="text-base font-black text-white print:text-black">32 Places</span>
          </div>
          <div>
            <span className="text-2xs text-neutral-400 block font-bold uppercase">Embarqués à bord</span>
            <span className="text-base font-black text-emerald-400 print:text-emerald-700">
              {boardedCount} / {passengers.length}
            </span>
          </div>
          <div>
            <span className="text-2xs text-neutral-400 block font-bold uppercase">Contrôle Police Routière</span>
            <span className="text-xs font-bold text-accent-400 flex items-center gap-1 mt-0.5 print:text-black">
              <ShieldCheck className="w-3.5 h-3.5" /> Conforme RDC
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative print:hidden">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, siège ou N° de billet..."
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-accent-500"
          />
        </div>

        {/* Passenger List Table */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden print:border-black">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-bold uppercase text-2xs print:bg-neutral-200 print:text-black">
                <tr>
                  <th className="py-3 px-3 text-center">Siège</th>
                  <th className="py-3 px-3">Billet QR</th>
                  <th className="py-3 px-4">Passager</th>
                  <th className="py-3 px-3">Téléphone</th>
                  <th className="py-3 px-3">Urgence</th>
                  <th className="py-3 px-3 text-center">Statut</th>
                  <th className="py-3 px-3 text-right print:hidden">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 print:divide-black">
                {filtered.map((p) => (
                  <tr key={p.seat} className="hover:bg-neutral-850/50 transition-colors">
                    <td className="py-3 px-3 text-center font-black text-accent-400 print:text-black">
                      #{p.seat}
                    </td>
                    <td className="py-3 px-3 font-mono text-neutral-400 print:text-black">{p.ticketRef}</td>
                    <td className="py-3 px-4 font-bold text-white print:text-black">{p.name}</td>
                    <td className="py-3 px-3 text-neutral-300 print:text-black">{p.phone}</td>
                    <td className="py-3 px-3 text-neutral-400 print:text-black">{p.emergencyPhone}</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-black ${
                          p.status === 'EMBARQUE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : p.status === 'EN_ATTENTE'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {p.status === 'EMBARQUE' && <UserCheck className="w-3 h-3" />}
                        {p.status === 'EN_ATTENTE' && <Clock className="w-3 h-3" />}
                        {p.status === 'ABSENT' && <UserX className="w-3 h-3" />}
                        {p.status === 'EMBARQUE' && `À Bord (${p.scannedAt})`}
                        {p.status === 'EN_ATTENTE' && 'En Attente'}
                        {p.status === 'ABSENT' && 'Absent'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right print:hidden">
                      <button
                        onClick={() => toggleBoarding(p.seat)}
                        className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-2xs font-bold transition-all"
                      >
                        Changer statut
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

