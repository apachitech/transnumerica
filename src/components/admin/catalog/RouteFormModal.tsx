'use client';

import React, { useState, useEffect } from 'react';
import { X, Route as RouteIcon, AlertTriangle, Save, Loader2, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { CatalogRoute, CatalogBusStation, RouteStop } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  route: CatalogRoute | null;
  stations: CatalogBusStation[];
  onSuccess: () => void;
}

export function RouteFormModal({
  isOpen,
  onClose,
  route,
  stations,
  onSuccess,
}: Props) {
  const [name, setName] = useState(route?.name || '');
  const [code, setCode] = useState(route?.code || '');
  const [corridor, setCorridor] = useState(route?.corridor || 'RN1');
  const [originStationId, setOriginStationId] = useState(
    route?.originStationId || stations[0]?.id || ''
  );
  const [destinationStationId, setDestinationStationId] = useState(
    route?.destinationStationId || stations[1]?.id || ''
  );
  const [distanceKm, setDistanceKm] = useState<number>(route?.distanceKm || 350);
  const [durationMinutes, setDurationMinutes] = useState<number>(route?.durationMinutes || 300);
  const [baseFareCDF, setBaseFareCDF] = useState<number>(route?.baseFareCDF || 45000);
  const [vipFareCDF, setVipFareCDF] = useState<number>(route?.vipFareCDF || 60000);
  const [isExpress, setIsExpress] = useState(route?.isExpress || false);
  const [allowDuplicateOverride, setAllowDuplicateOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  const [stops, setStops] = useState<RouteStop[]>(route?.stops || []);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Live duplicate detection
  useEffect(() => {
    if (!originStationId || !destinationStationId) return;
    if (originStationId === destinationStationId) {
      setDuplicateWarning('La gare de départ et d’arrivée doivent être différentes.');
      return;
    }

    const check = async () => {
      try {
        const params = new URLSearchParams({
          originStationId,
          destinationStationId,
        });
        if (route?.id) params.set('excludeRouteId', route.id);

        const res = await fetch(`/api/admin/catalog/routes/check-duplicate?${params.toString()}`);
        const data = await res.json();
        if (data.isDuplicate) {
          setDuplicateWarning(data.warning);
        } else {
          setDuplicateWarning(null);
        }
      } catch {
        // Ignored
      }
    };
    check();
  }, [originStationId, destinationStationId, route?.id]);

  const handleAddStop = () => {
    const unselected = stations.find(
      (s) => s.id !== originStationId && s.id !== destinationStationId && !stops.some((st) => st.stationId === s.id)
    );
    if (!unselected) return;

    setStops((prev) => [
      ...prev,
      {
        id: `stp-${Date.now().toString(36)}`,
        stationId: unselected.id,
        stationName: unselected.name,
        cityName: unselected.cityName,
        sequenceOrder: prev.length + 1,
        distanceKmFromOrigin: Math.round(distanceKm / 2),
        stopDurationMinutes: 15,
      },
    ]);
  };

  const handleRemoveStop = (idx: number) => {
    setStops((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (originStationId === destinationStationId) {
      setError('La gare de départ et la gare de destination doivent être distinctes.');
      return;
    }

    if (duplicateWarning && !isExpress && !allowDuplicateOverride) {
      setError('Ligne en doublon détectée. Cochez la dérogation Express/VIP pour valider.');
      return;
    }

    setLoading(true);
    setError(null);

    const originStation = stations.find((s) => s.id === originStationId);
    const destStation = stations.find((s) => s.id === destinationStationId);

    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      corridor,
      originCityId: originStation?.cityId || 'city-kin',
      originStationId,
      destinationCityId: destStation?.cityId || 'city-mat',
      destinationStationId,
      distanceKm: Number(distanceKm),
      durationMinutes: Number(durationMinutes),
      stops,
      baseFareCDF: Number(baseFareCDF),
      vipFareCDF: vipFareCDF ? Number(vipFareCDF) : undefined,
      isExpress: Boolean(isExpress || allowDuplicateOverride),
      allowDuplicateOverride,
      overrideReason: overrideReason || undefined,
      expectedVersion: route?.version,
    };

    try {
      const url = route ? `/api/admin/catalog/routes/${route.id}` : '/api/admin/catalog/routes';
      const method = route ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l’enregistrement de la ligne');

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="route-form-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto"
    >
      <div className="w-full max-w-2xl bg-[#0D1E32] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8">
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#091522] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              <RouteIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {route ? `Modifier la ligne : ${route.name}` : 'Créer une Nouvelle Ligne Interurbaine'}
              </h3>
              <p className="text-2xs text-neutral-400">
                Corridors nationaux, distances kilométriques et détection automatique des doublons
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

          {/* Duplicate Route Warning Box */}
          {duplicateWarning && (
            <div
              data-testid="duplicate-route-warning"
              className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs space-y-2"
            >
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Détection de Ligne Doublon</span>
              </div>
              <p className="text-3xs text-amber-200/90 leading-relaxed">{duplicateWarning}</p>

              <label className="flex items-start gap-2 pt-1 cursor-pointer">
                <input
                  id="route-override"
                  type="checkbox"
                  checked={allowDuplicateOverride}
                  onChange={(e) => setAllowDuplicateOverride(e.target.checked)}
                  className="mt-0.5 rounded bg-black/40 border-amber-500/50 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-2xs font-bold text-white">
                  Valider en tant que service Express / VIP dérogatoire (Création autorisée)
                </span>
              </label>

              {allowDuplicateOverride && (
                <input
                  id="route-override-reason"
                  type="text"
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Motif de la dérogation (Ex: Service direct de nuit sans arrêt intermédiaire)"
                  className="w-full bg-[#091522] border border-amber-500/30 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none"
                />
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-3xs uppercase tracking-wider font-bold text-neutral-400 block mb-1">
                Intitulé de la ligne *
              </label>
              <input
                id="route-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Kinshasa (Gare Centrale) ↔ Matadi (Mpozo) Direct"
                className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label className="text-3xs uppercase tracking-wider font-bold text-neutral-400 block mb-1">
                Code Ligne (Unique) *
              </label>
              <input
                id="route-code"
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ex: RN1-KM-DIR"
                className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label className="text-3xs uppercase tracking-wider font-bold text-neutral-400 block mb-1">
                Corridor National *
              </label>
              <select
                value={corridor}
                onChange={(e) => setCorridor(e.target.value)}
                className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="RN1">Route Nationale 1 (Kinshasa - Matadi - Kikwit - Lubumbashi)</option>
                <option value="RN2">Route Nationale 2 (Mbuji-Mayi - Bukavu - Goma)</option>
                <option value="RN39">Route Nationale 39 (Kolwezi - Dilolo - Frontière Angola)</option>
                <option value="RN4">Route Nationale 4 (Kisangani - Beni - Kasindi)</option>
              </select>
            </div>

            <div>
              <label className="text-3xs uppercase tracking-wider font-bold text-neutral-400 block mb-1">
                Gare de Départ *
              </label>
              <select
                id="route-origin"
                value={originStationId}
                onChange={(e) => setOriginStationId(e.target.value)}
                className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.cityName} — {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-3xs uppercase tracking-wider font-bold text-neutral-400 block mb-1">
                Gare de Destination *
              </label>
              <select
                id="route-destination"
                value={destinationStationId}
                onChange={(e) => setDestinationStationId(e.target.value)}
                className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.cityName} — {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-3xs uppercase tracking-wider font-bold text-neutral-400 block mb-1">
                Distance Routière (km) *
              </label>
              <input
                id="route-distance"
                type="number"
                min="1"
                required
                value={distanceKm}
                onChange={(e) => setDistanceKm(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label className="text-3xs uppercase tracking-wider font-bold text-neutral-400 block mb-1">
                Durée Estimée (minutes) *
              </label>
              <input
                id="route-duration"
                type="number"
                min="10"
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 10)}
                className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label className="text-3xs uppercase tracking-wider font-bold text-neutral-400 block mb-1">
                Tarif Standard de Base (CDF) *
              </label>
              <input
                id="route-fare"
                type="number"
                min="1000"
                step="500"
                required
                value={baseFareCDF}
                onChange={(e) => setBaseFareCDF(parseInt(e.target.value, 10) || 1000)}
                className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label className="text-3xs uppercase tracking-wider font-bold text-neutral-400 block mb-1">
                Tarif VIP Optionnel (CDF)
              </label>
              <input
                type="number"
                min="1000"
                step="500"
                value={vipFareCDF}
                onChange={(e) => setVipFareCDF(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          {/* Intermediate Stops */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xs uppercase tracking-wider font-bold text-neutral-300">
                Arrêts Intermédiaires & Points d’Escale ({stops.length})
              </span>
              <button
                type="button"
                onClick={handleAddStop}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-brand-primary text-3xs font-bold border border-white/10 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Ajouter un arrêt
              </button>
            </div>

            {stops.map((stp, idx) => (
              <div
                key={stp.id}
                className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2 text-2xs"
              >
                <span className="font-mono font-bold text-brand-primary">#{idx + 1}</span>
                <span className="font-semibold text-white">{stp.stationName}</span>
                <span className="text-3xs text-neutral-400 font-mono">
                  +{stp.distanceKmFromOrigin} km • Escale {stp.stopDurationMinutes} min
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveStop(idx)}
                  className="p-1 rounded-lg hover:bg-rose-500/20 text-neutral-400 hover:text-rose-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
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
              disabled={loading || (Boolean(duplicateWarning) && !allowDuplicateOverride)}
              className="px-5 py-2 rounded-xl bg-brand-primary text-black font-bold text-xs hover:bg-brand-primary/90 flex items-center gap-2 shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Enregistrer la ligne
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
