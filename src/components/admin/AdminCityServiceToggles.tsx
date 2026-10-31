'use client';

import React, { useState } from 'react';
import { CityServiceConfig, ServiceType, AdminAuditLogEntry } from '@/types';
import { cityConfigService } from '@/services/city-config';
import {
  Building2,
  AlertTriangle,
  History,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Shield,
  Clock,
  User,
  Plus,
} from 'lucide-react';

interface AdminCityServiceTogglesProps {
  auditLog: AdminAuditLogEntry[];
  onAddAuditEntry: (entry: Omit<AdminAuditLogEntry, 'id'>) => void;
}

export function AdminCityServiceToggles({
  auditLog,
  onAddAuditEntry,
}: AdminCityServiceTogglesProps) {
  const [configs, setConfigs] = useState<CityServiceConfig[]>(cityConfigService.getAll());
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('ALL');
  const [showReasonModalFor, setShowReasonModalFor] = useState<{
    cityId: string;
    cityName: string;
    service: ServiceType;
    currentEnabled: boolean;
  } | null>(null);
  const [toggleReason, setToggleReason] = useState('Arrêté préfectoral ou travaux de voirie');

  const cities = [
    { id: 'ALL', name: 'Toutes les villes' },
    { id: 'kinshasa', name: 'Kinshasa' },
    { id: 'lubumbashi', name: 'Lubumbashi' },
    { id: 'kolwezi', name: 'Kolwezi' },
    { id: 'matadi', name: 'Matadi' },
    { id: 'goma', name: 'Goma' },
  ];

  const filteredConfigs = configs.filter((c) => {
    if (selectedCityFilter === 'ALL') return true;
    return c.cityId.toLowerCase() === selectedCityFilter.toLowerCase();
  });

  const handleToggleClick = (cfg: CityServiceConfig) => {
    // If disabling, open modal for justification reason; if enabling, enable directly with audit note
    if (cfg.enabled) {
      setShowReasonModalFor({
        cityId: cfg.cityId,
        cityName: cfg.cityName,
        service: cfg.service,
        currentEnabled: true,
      });
    } else {
      // Re-activate service
      cityConfigService.toggleService(cfg.cityId, cfg.service, true);
      setConfigs([...cityConfigService.getAll()]);
      onAddAuditEntry({
        timestamp: new Date().toLocaleTimeString('fr-CD', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        adminUser: 'Admin_Kasavubu',
        action: `Réactivation service ${cfg.service.toUpperCase()}`,
        target: `${cfg.cityName} (${cfg.service})`,
        previousState: 'Suspendu',
        newState: 'Actif',
        reason: 'Levée des restrictions municipales ou fin de maintenance.',
      });
    }
  };

  const handleConfirmSuspension = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReasonModalFor) return;

    const { cityId, cityName, service } = showReasonModalFor;
    cityConfigService.toggleService(cityId, service, false, toggleReason);
    setConfigs([...cityConfigService.getAll()]);

    onAddAuditEntry({
      timestamp: new Date().toLocaleTimeString('fr-CD', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      adminUser: 'Admin_Kasavubu',
      action: `Suspension service ${service.toUpperCase()}`,
      target: `${cityName} (${service})`,
      previousState: 'Actif',
      newState: 'Suspendu',
      reason: toggleReason,
    });

    setShowReasonModalFor(null);
  };

  return (
    <div className="space-y-6" data-testid="admin-city-services-section">
      {/* City Services Toggles Box */}
      <div className="bg-white dark:bg-neutral-850 border border-neutral-200/90 dark:border-neutral-750 rounded-3xl p-4 sm:p-6 shadow-elevation-1 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-accent-500" />
              <span>Contrôle &amp; Toggles des Services par Ville</span>
            </h3>
            <p className="text-2xs text-neutral-400 font-medium">
              Activation ou suspension instantanée conforme aux arrêtés provinciaux et municipaux RDC
            </p>
          </div>

          {/* City filter pill strip */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-bold overflow-x-auto">
            {cities.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => setSelectedCityFilter(city.id)}
                className={`px-3 py-1.5 rounded-lg text-center transition-all whitespace-nowrap ${
                  selectedCityFilter === city.id
                    ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-2xs font-extrabold'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles Matrix */}
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
          {filteredConfigs.map((cfg, idx) => (
            <div
              key={`${cfg.cityId}-${cfg.service}-${idx}`}
              className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-neutral-850 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-sm text-neutral-900 dark:text-white">
                    📍 {cfg.cityName}
                  </span>
                  <span className="text-2xs px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 font-mono font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    {cfg.service}
                  </span>
                  {cfg.service === 'moto' && !cfg.enabled && (
                    <span className="text-[10px] bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-bold px-2 py-0.5 rounded-full border border-red-300 dark:border-red-800">
                      Arrêté Municipal Actif
                    </span>
                  )}
                </div>

                {cfg.reasonDisabled && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                    ⚠️ {cfg.reasonDisabled}
                  </p>
                )}

                {cfg.activeFrom && cfg.activeTo && (
                  <span className="text-[11px] text-neutral-400 block font-mono">
                    Plage horaire autorisée : {cfg.activeFrom} - {cfg.activeTo}
                  </span>
                )}
              </div>

              {/* Toggle Switch Button */}
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span
                  className={`text-xs font-black ${
                    cfg.enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {cfg.enabled ? 'ACTIF' : 'SUSPENDU'}
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleClick(cfg)}
                  data-testid={`toggle-service-${cfg.cityId}-${cfg.service}`}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 border ${
                    cfg.enabled
                      ? 'bg-red-50 hover:bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                      : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  }`}
                >
                  {cfg.enabled ? 'Suspendre' : 'Réactiver'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- AUDIT TRAIL LOG ---------------- */}
      <div
        data-testid="admin-audit-trail-section"
        className="bg-white dark:bg-neutral-850 border border-neutral-200/90 dark:border-neutral-750 rounded-3xl p-4 sm:p-6 shadow-elevation-1 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-accent-500" />
              <span>Journal d&apos;Audit Réglementaire ({auditLog.length} entrées)</span>
            </h3>
            <p className="text-2xs text-neutral-400 font-medium">
              Traçabilité immuable de toutes les décisions administratives prises sur la plateforme
            </p>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-extrabold border-b border-neutral-200 dark:border-neutral-800">
                <th scope="col" className="p-3">Horodatage</th>
                <th scope="col" className="p-3">Administrateur</th>
                <th scope="col" className="p-3">Action &amp; Cible</th>
                <th scope="col" className="p-3 text-center">Transition</th>
                <th scope="col" className="p-3">Motif &amp; Référence Légale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium">
              {auditLog.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="p-3 whitespace-nowrap font-mono text-neutral-500">
                    {log.timestamp}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="font-extrabold text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-accent-500" />
                      <span>{log.adminUser}</span>
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="font-bold text-neutral-900 dark:text-white block">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-neutral-400">{log.target}</span>
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold">
                      <span className="text-neutral-400">{log.previousState}</span>
                      <span>➔</span>
                      <span className="text-accent-600 dark:text-accent-400">{log.newState}</span>
                    </span>
                  </td>
                  <td className="p-3 text-neutral-600 dark:text-neutral-300">
                    <span className="text-xs font-semibold">{log.reason}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspension Justification Modal */}
      {showReasonModalFor && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
        >
          <form
            onSubmit={handleConfirmSuspension}
            className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
          >
            <div className="flex items-center gap-2.5 text-red-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="font-black text-base text-neutral-900 dark:text-white">
                Suspension Réglementaire : {showReasonModalFor.cityName} ({showReasonModalFor.service})
              </h4>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Veuillez saisir la justification officielle de suspension. Cette mention apparaîtra directement aux passagers et sera inscrite au journal d&apos;audit.
            </p>

            <div className="space-y-1">
              <label className="text-2xs font-extrabold uppercase text-neutral-400">
                Motif réglementaire :
              </label>
              <textarea
                required
                value={toggleReason}
                onChange={(e) => setToggleReason(e.target.value)}
                rows={3}
                className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setShowReasonModalFor(null)}
                className="px-4 py-2 text-neutral-600 dark:text-neutral-400 text-xs font-bold hover:underline"
              >
                Annuler
              </button>
              <button
                type="submit"
                data-testid="confirm-suspension-btn"
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-xs active:scale-95 transition-all"
              >
                Confirmer la suspension
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

