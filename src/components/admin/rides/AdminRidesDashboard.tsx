'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AdminRide,
  OnlineDriver,
  SafetyIncident,
} from '@/types';
import {
  Search,
  Filter,
  Car,
  Bike,
  Shield,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Download,
  Users,
  Compass,
  Radio,
  FileSpreadsheet,
  AlertOctagon,
  Clock,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { SafetyBanner } from './SafetyBanner';
import { RideLiveMap } from './RideLiveMap';
import { RideDetailDrawer } from './RideDetailDrawer';
import { RideForceCancelModal } from './RideForceCancelModal';
import { RideReassignModal } from './RideReassignModal';
import { RideAdjustFareModal } from './RideAdjustFareModal';
import { SafetyIncidentModal } from './SafetyIncidentModal';

export function AdminRidesDashboard() {
  const [activeTab, setActiveTab] = useState<'OPERATIONS' | 'SAFETY' | 'DRIVERS'>('OPERATIONS');

  // Filter States
  const [cityFilter, setCityFilter] = useState<string>('ALL');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data States
  const [rides, setRides] = useState<AdminRide[]>([]);
  const [drivers, setDrivers] = useState<OnlineDriver[]>([]);
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Selected Entities & Modals
  const [selectedRide, setSelectedRide] = useState<AdminRide | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  const [cancelModalRide, setCancelModalRide] = useState<AdminRide | null>(null);
  const [reassignModalRide, setReassignModalRide] = useState<AdminRide | null>(null);
  const [adjustFareModalRide, setAdjustFareModalRide] = useState<AdminRide | null>(null);

  const [activeIncident, setActiveIncident] = useState<SafetyIncident | null>(null);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

  // Fetch all operations data
  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (cityFilter !== 'ALL') params.set('city', cityFilter);
      if (serviceTypeFilter !== 'ALL') params.set('serviceType', serviceTypeFilter);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/admin/rides?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRides(data.rides || []);
        setDrivers(data.drivers || []);
        setIncidents(data.incidents || []);
      }
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  }, [cityFilter, serviceTypeFilter, statusFilter, searchQuery]);

  // Initial load and filter change trigger
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time SSE stream with graceful polling fallback
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;

    try {
      eventSource = new EventSource('/api/admin/rides/stream');

      eventSource.addEventListener('safety_alert', (e) => {
        try {
          const alert = JSON.parse(e.data);
          setIncidents((prev) => [alert, ...prev.filter((i) => i.id !== alert.id)]);
          fetchData();
        } catch {
          // Ignored
        }
      });

      eventSource.addEventListener('ride_updated', (e) => {
        try {
          const updatedRide = JSON.parse(e.data);
          setRides((prev) =>
            prev.map((r) => (r.id === updatedRide.id ? updatedRide : r))
          );
          if (selectedRide?.id === updatedRide.id) {
            setSelectedRide(updatedRide);
          }
        } catch {
          // Ignored
        }
      });

      eventSource.addEventListener('incident_updated', (e) => {
        try {
          const updatedInc = JSON.parse(e.data);
          setIncidents((prev) =>
            prev.map((i) => (i.id === updatedInc.id ? updatedInc : i))
          );
          if (activeIncident?.id === updatedInc.id) {
            setActiveIncident(updatedInc);
          }
        } catch {
          // Ignored
        }
      });

      eventSource.onerror = () => {
        // SSE error, activate fallback polling every 4s
        if (!fallbackInterval) {
          fallbackInterval = setInterval(fetchData, 4000);
        }
      };
    } catch {
      // Fallback
      fallbackInterval = setInterval(fetchData, 4000);
    }

    return () => {
      if (eventSource) eventSource.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [fetchData, selectedRide?.id, activeIncident?.id]);

  // Open incident handler
  const handleOpenIncident = (incident: SafetyIncident) => {
    setActiveIncident(incident);
    setIsIncidentModalOpen(true);
  };

  const handleOpenIncidentById = (incidentId: string) => {
    const inc = incidents.find((i) => i.id === incidentId);
    if (inc) {
      handleOpenIncident(inc);
    }
  };

  // KPI Calculations
  const activeRidesCount = useMemo(
    () => rides.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'ARRIVING' || r.status === 'SEARCHING').length,
    [rides]
  );
  const onlineDriversCount = useMemo(
    () => drivers.filter((d) => d.status === 'ONLINE' || d.status === 'BUSY').length,
    [drivers]
  );
  const openAlertsCount = useMemo(
    () => incidents.filter((i) => i.status === 'OPEN').length,
    [incidents]
  );
  const criticalSosCount = useMemo(
    () => incidents.filter((i) => i.status === 'OPEN' && i.type === 'SOS_TRIGGERED').length,
    [incidents]
  );

  return (
    <div className="space-y-5">
      {/* Persistent Safety Banner */}
      <SafetyBanner incidents={incidents} onOpenIncident={handleOpenIncident} />

      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-emerald-400" />
            Opérations Courses & Vigilance Sécurité
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Supervision temps réel, régulation des chauffeurs et centre d’intervention d'urgence RDC
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/admin/safety/export"
            download
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 transition shadow"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Exporter Rapport Sécurité</span>
          </a>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Active Rides */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 shadow">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Courses en Direct</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{activeRidesCount}</p>
          <span className="text-[11px] text-neutral-500">Kinshasa, Lubumbashi, Goma</span>
        </div>

        {/* Online Drivers */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 shadow">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Chauffeurs Connectés</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{onlineDriversCount}</p>
          <span className="text-[11px] text-emerald-400 font-medium">Flotte active géo-localisée</span>
        </div>

        {/* Open Safety Incidents */}
        <div className={`p-4 rounded-xl border shadow ${
          criticalSosCount > 0
            ? 'bg-red-950/40 border-red-500/50 text-red-200'
            : 'bg-neutral-900 border-neutral-800'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={criticalSosCount > 0 ? 'text-red-400 font-bold' : 'text-neutral-400'}>
              Alertes SOS Ouvertes
            </span>
            <ShieldAlert className={`w-4 h-4 ${criticalSosCount > 0 ? 'text-red-500 animate-bounce' : 'text-neutral-400'}`} />
          </div>
          <p className={`text-2xl font-black mt-1 ${criticalSosCount > 0 ? 'text-red-400' : 'text-white'}`}>
            {openAlertsCount}
          </p>
          <span className="text-[11px] text-neutral-400">
            {criticalSosCount > 0 ? `${criticalSosCount} critique(s) en attente` : 'Situation sous contrôle'}
          </span>
        </div>

        {/* Average Response Time */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 shadow">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Temps Réponse Intervention</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">&lt; 45s</p>
          <span className="text-[11px] text-neutral-500">Prise en charge régulateur</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 bg-neutral-900/60 rounded-t-xl px-4 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('OPERATIONS')}
          className={`py-3.5 border-b-2 mr-6 transition flex items-center gap-2 ${
            activeTab === 'OPERATIONS'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Radio className="w-4 h-4 text-blue-400" />
          <span>Opérations & Radar Live ({rides.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SAFETY')}
          className={`py-3.5 border-b-2 mr-6 transition flex items-center gap-2 ${
            activeTab === 'SAFETY'
              ? 'border-red-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-red-500" />
          <span>Centre de Sécurité & Incidents ({incidents.length})</span>
          {openAlertsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white font-black">
              {openAlertsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DRIVERS')}
          className={`py-3.5 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'DRIVERS'
              ? 'border-emerald-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Flotte Chauffeurs ({drivers.length})</span>
        </button>
      </div>

      {/* Multi-filter Toolbar */}
      <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Réf, Passager, Chauffeur, Plaque..."
            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* City Filter */}
        <div>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
          >
            <option value="ALL">Toutes les Villes</option>
            <option value="Kinshasa">Kinshasa</option>
            <option value="Lubumbashi">Lubumbashi</option>
            <option value="Goma">Goma</option>
          </select>
        </div>

        {/* Service Type Filter */}
        <div>
          <select
            value={serviceTypeFilter}
            onChange={(e) => setServiceTypeFilter(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
          >
            <option value="ALL">Tous Types de Véhicules</option>
            <option value="TAXI">Taxi Voiture</option>
            <option value="MOTO">Moto Express (Wewa)</option>
            <option value="VIP">VIP Berline / SUV</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
          >
            <option value="ALL">Tous les Statuts</option>
            <option value="EMERGENCY">⚠️ Alertes & Urgences Uniquement</option>
            <option value="IN_PROGRESS">En Cours</option>
            <option value="ARRIVING">En Approche</option>
            <option value="SEARCHING">En Recherche</option>
            <option value="COMPLETED">Terminées</option>
            <option value="CANCELLED">Annulées</option>
          </select>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'OPERATIONS' && (
        <div className="space-y-5">
          {/* Live Map Canvas */}
          <RideLiveMap
            rides={rides}
            drivers={drivers}
            selectedCity={cityFilter}
            selectedRideId={selectedRide?.id}
            onSelectRide={(ride) => {
              setSelectedRide(ride);
              setIsDetailDrawerOpen(true);
            }}
          />

          {/* Table of Active Rides */}
          <div className="rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Flux des Courses en Cours ({rides.length})</span>
              </h2>
              <span className="text-xs text-neutral-400">
                Cliquez sur une ligne pour ouvrir le tiroir de régulation
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                  <tr>
                    <th className="p-3">Course / Ville</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Passager</th>
                    <th className="p-3">Chauffeur & Plaque</th>
                    <th className="p-3">Statut & PIN</th>
                    <th className="p-3 text-right">Tarif</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {rides.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-500 italic">
                        Aucune course ne correspond aux filtres sélectionnés.
                      </td>
                    </tr>
                  ) : (
                    rides.map((ride) => (
                      <tr
                        key={ride.id}
                        onClick={() => {
                          setSelectedRide(ride);
                          setIsDetailDrawerOpen(true);
                        }}
                        className={`hover:bg-neutral-800/60 cursor-pointer transition ${
                          ride.hasSosAlert
                            ? 'bg-red-950/20 hover:bg-red-950/30'
                            : selectedRide?.id === ride.id
                              ? 'bg-blue-950/30'
                              : ''
                        }`}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{ride.reference}</span>
                            {ride.hasSosAlert && (
                              <span className="px-1.5 py-0.2 rounded bg-red-600 text-white font-black text-[9px] animate-pulse">
                                SOS
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-neutral-400">{ride.city}</span>
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-1.5 font-semibold text-white">
                            {ride.serviceType === 'MOTO' ? (
                              <Bike className="w-3.5 h-3.5 text-amber-400" />
                            ) : ride.serviceType === 'VIP' ? (
                              <Shield className="w-3.5 h-3.5 text-purple-400" />
                            ) : (
                              <Car className="w-3.5 h-3.5 text-blue-400" />
                            )}
                            <span>{ride.serviceType}</span>
                          </div>
                        </td>

                        <td className="p-3">
                          <p className="font-semibold text-white">{ride.riderName}</p>
                          <p className="text-[11px] text-neutral-400">{ride.riderPhone}</p>
                        </td>

                        <td className="p-3">
                          {ride.driverName ? (
                            <div>
                              <p className="font-semibold text-white">{ride.driverName}</p>
                              <p className="text-[11px] text-amber-400 font-mono">{ride.vehiclePlate}</p>
                            </div>
                          ) : (
                            <span className="text-neutral-500 italic">Recherche en cours...</span>
                          )}
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ride.status === 'IN_PROGRESS'
                                ? 'bg-blue-500/20 text-blue-400'
                                : ride.status === 'ARRIVING'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : ride.status === 'COMPLETED'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-neutral-800 text-neutral-400'
                            }`}>
                              {ride.status}
                            </span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                              ride.tripPinVerified
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}>
                              PIN {ride.tripPin}
                            </span>
                          </div>
                        </td>

                        <td className="p-3 text-right">
                          <p className="font-bold text-white">
                            {(ride.fareMinor / 100).toLocaleString('fr-FR')} {ride.currency}
                          </p>
                          <span className="text-[10px] text-neutral-400">{ride.paymentMethod}</span>
                        </td>

                        <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRide(ride);
                                setIsDetailDrawerOpen(true);
                              }}
                              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition"
                            >
                              Détail
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Safety Center Tab */}
      {activeTab === 'SAFETY' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <span>Registre des Incidents de Sécurité & SOS ({incidents.length})</span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Workflow d’intervention en 4 étapes : Prise en charge, Contact, Escalade et Résolution
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                  <tr>
                    <th className="p-3">Réf / Date</th>
                    <th className="p-3">Type & Gravité</th>
                    <th className="p-3">Course / Ville</th>
                    <th className="p-3">Passager & Chauffeur</th>
                    <th className="p-3">Statut Workflow</th>
                    <th className="p-3">Agent</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {incidents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-500 italic">
                        Aucun incident de sécurité enregistré.
                      </td>
                    </tr>
                  ) : (
                    incidents.map((inc) => (
                      <tr
                        key={inc.id}
                        onClick={() => handleOpenIncident(inc)}
                        className={`hover:bg-neutral-800/60 cursor-pointer transition ${
                          inc.status === 'OPEN' && inc.type === 'SOS_TRIGGERED'
                            ? 'bg-red-950/30'
                            : ''
                        }`}
                      >
                        <td className="p-3">
                          <span className="font-bold text-white block">{inc.reference}</span>
                          <span className="text-[10px] text-neutral-400">
                            {new Date(inc.createdAt).toLocaleString('fr-FR')}
                          </span>
                        </td>

                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold block w-fit mb-1 ${
                            inc.severity === 'CRITICAL'
                              ? 'bg-red-600 text-white animate-pulse'
                              : inc.severity === 'HIGH'
                                ? 'bg-amber-600 text-white'
                                : 'bg-blue-600 text-white'
                          }`}>
                            {inc.type}
                          </span>
                          <span className="text-[10px] text-neutral-400">{inc.triggerSource}</span>
                        </td>

                        <td className="p-3">
                          <span className="font-semibold text-white block">{inc.rideReference}</span>
                          <span className="text-[11px] text-neutral-400">{inc.city}</span>
                        </td>

                        <td className="p-3">
                          <p className="font-semibold text-white">{inc.riderName}</p>
                          <p className="text-[11px] text-neutral-400">
                            Chauffeur: {inc.driverName} ({inc.vehiclePlate})
                          </p>
                        </td>

                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inc.status === 'OPEN'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : inc.status === 'ACKNOWLEDGED'
                                ? 'bg-blue-500/20 text-blue-400'
                                : inc.status === 'ESCALATED'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {inc.status}
                          </span>
                        </td>

                        <td className="p-3">
                          <span className="text-xs text-neutral-300">
                            {inc.assignedAdmin || 'Non assigné'}
                          </span>
                        </td>

                        <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleOpenIncident(inc)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition"
                          >
                            Gérer
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Drivers Fleet Tab */}
      {activeTab === 'DRIVERS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {drivers.map((driver) => (
            <div
              key={driver.id}
              className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3 shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    driver.status === 'ONLINE'
                      ? 'bg-emerald-500 animate-ping'
                      : driver.status === 'BUSY'
                        ? 'bg-amber-500'
                        : 'bg-neutral-600'
                  }`} />
                  <span className="font-bold text-xs text-white uppercase">{driver.status}</span>
                </div>
                <span className="text-xs font-bold text-emerald-400">★ {driver.rating}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-800 text-white font-bold flex items-center justify-center">
                  {driver.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-xs text-white">{driver.name}</h3>
                  <p className="text-[11px] text-neutral-400">{driver.phone} • {driver.city}</p>
                </div>
              </div>

              <div className="p-2.5 rounded bg-neutral-950 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Véhicule :</span>
                  <span className="font-semibold text-white">{driver.vehicleModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Plaque :</span>
                  <span className="font-mono text-amber-400 font-bold">{driver.vehiclePlate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals & Detail Drawer */}
      <RideDetailDrawer
        ride={selectedRide}
        drivers={drivers}
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        onOpenCancel={(ride) => setCancelModalRide(ride)}
        onOpenReassign={(ride) => setReassignModalRide(ride)}
        onOpenAdjustFare={(ride) => setAdjustFareModalRide(ride)}
        onOpenIncident={handleOpenIncidentById}
        onRideUpdated={(updated) => {
          setSelectedRide(updated);
          fetchData();
        }}
      />

      <RideForceCancelModal
        ride={cancelModalRide}
        isOpen={!!cancelModalRide}
        onClose={() => setCancelModalRide(null)}
        onSuccess={(updated) => {
          setSelectedRide(updated);
          fetchData();
        }}
      />

      <RideReassignModal
        ride={reassignModalRide}
        drivers={drivers}
        isOpen={!!reassignModalRide}
        onClose={() => setReassignModalRide(null)}
        onSuccess={(updated) => {
          setSelectedRide(updated);
          fetchData();
        }}
      />

      <RideAdjustFareModal
        ride={adjustFareModalRide}
        isOpen={!!adjustFareModalRide}
        onClose={() => setAdjustFareModalRide(null)}
        onSuccess={(updated) => {
          setSelectedRide(updated);
          fetchData();
        }}
      />

      <SafetyIncidentModal
        incident={activeIncident}
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        onSuccess={(updated) => {
          setActiveIncident(updated);
          fetchData();
        }}
      />
    </div>
  );
}

