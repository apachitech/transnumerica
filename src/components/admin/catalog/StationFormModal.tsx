'use client';

import React, { useState } from 'react';
import { X, Building2, MapPin, Save, AlertTriangle, Loader2 } from 'lucide-react';
import { CatalogBusStation, CatalogCity, CatalogZone } from '@/types';
import { MapPickerModal } from './MapPickerModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  station: CatalogBusStation | null;
  cities: CatalogCity[];
  zones: CatalogZone[];
  onSuccess: () => void;
}

export function StationFormModal({
  isOpen,
  onClose,
  station,
  cities,
  zones,
  onSuccess,
}: Props) {
  const [name, setName] = useState(station?.name || '');
  const [code, setCode] = useState(station?.code || '');
  const [cityId, setCityId] = useState(station?.cityId || cities[0]?.id || 'city-kin');
  const [zoneId, setZoneId] = useState(station?.zoneId || '');
  const [address, setAddress] = useState(station?.address || '');
  const [lat, setLat] = useState<number>(station?.coordinates.lat || -4.3012);
  const [lng, setLng] = useState<number>(station?.coordinates.lng || 15.3125);
  const [contactPhone, setContactPhone] = useState(station?.contactPhone || '+243810001000');
  const [counterCount, setCounterCount] = useState<number>(station?.counterCount || 4);

  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredZones = zones.filter((z) => z.cityId === cityId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      cityId,
      zoneId: zoneId || undefined,
      address: address.trim(),
      latitude: lat,
      longitude: lng,
      contactPhone: contactPhone.trim(),
      counterCount: Number(counterCount),
      expectedVersion: station?.version,
    };

    try {
      const url = station
        ? `/api/admin/catalog/stations/${station.id}`
        : '/api/admin/catalog/stations';
      const method = station ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l’enregistrement');

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        data-testid="station-form-modal"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto"
      >
        <div className="w-full max-w-xl bg-[#0D1E32] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8">
          <div className="p-4 sm:p-5 border-b border-white/10 bg-[#091522] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {station ? `Modifier la gare : ${station.name}` : 'Créer une Nouvelle Gare Routière'}
                </h3>
                <p className="text-2xs text-neutral-400">
                  Régulation & homologation des points d’embarquement interurbains
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

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-3xs uppercase tracking-wider font-bold text-neutral-400 block mb-1">
                  Nom officiel de la gare routière / agence *
                </label>
                <input
                  id="st-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Terminal Gare Centrale Gombe"
                  className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="text-3xs uppercase tracking-wider font-bold text-neutral-400 block mb-1">
                  Code Gare Routière (Unique) *
                </label>
                <input
                  id="st-code"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: KIN-GOMBE"
                  className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="text-3xs uppercase tracking-wider font-bold text-neutral-400 block mb-1">
                  Ville d’Implantation *
                </label>
                <select
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value)}
                  className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.province})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-3xs uppercase tracking-wider font-bold text-neutral-400 block mb-1">
                  Commune / Zone
                </label>
                <select
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="">Sélectionner une zone...</option>
                  {filteredZones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-3xs uppercase tracking-wider font-bold text-neutral-400 block mb-1">
                  Nombre de Guichets Billetterie *
                </label>
                <input
                  id="st-counters"
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={counterCount}
                  onChange={(e) => setCounterCount(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-3xs uppercase tracking-wider font-bold text-neutral-400 block mb-1">
                  Adresse Physique & Repères *
                </label>
                <input
                  id="st-address"
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Boulevard du 30 Juin, En face de l’ONATRA"
                  className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="text-3xs uppercase tracking-wider font-bold text-neutral-400 block mb-1">
                  Téléphone Contact Station *
                </label>
                <input
                  id="st-phone"
                  type="text"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              {/* Map Picker trigger */}
              <div>
                <label className="text-3xs uppercase tracking-wider font-bold text-neutral-400 block mb-1">
                  Coordonnées GPS
                </label>
                <button
                  type="button"
                  onClick={() => setIsMapPickerOpen(true)}
                  className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-brand-primary text-xs font-mono font-bold border border-brand-primary/30 flex items-center justify-between"
                >
                  <span className="truncate">
                    {lat.toFixed(4)}, {lng.toFixed(4)}
                  </span>
                  <MapPin className="w-4 h-4 shrink-0 text-brand-primary" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
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
                className="px-5 py-2 rounded-xl bg-brand-primary text-black font-bold text-xs hover:bg-brand-primary/90 flex items-center gap-2 shadow-lg shadow-brand-primary/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Enregistrer la gare
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <MapPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        initialLat={lat}
        initialLng={lng}
        onSelectCoordinates={(coords) => {
          setLat(coords.lat);
          setLng(coords.lng);
        }}
      />
    </>
  );
}

