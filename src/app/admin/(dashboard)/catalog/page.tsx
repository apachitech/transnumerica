'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Compass,
  MapPin,
  Route as RouteIcon,
  Calendar,
  Grid,
  Truck,
  Plus,
  Upload,
  Search,
  Trash2,
  RotateCcw,
  Edit,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Sparkles,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import {
  CatalogCity,
  CatalogZone,
  CatalogLandmark,
  CatalogBusStation,
  CatalogRoute,
  CatalogTrip,
  CatalogBusLayout,
  CatalogComfortLevel,
  CatalogAmenity,
  CatalogVehicleType,
  CatalogRecurringSchedule,
  LayoutCell,
} from '@/types';
import { MapPickerModal } from '@/components/admin/catalog/MapPickerModal';
import { StationFormModal } from '@/components/admin/catalog/StationFormModal';
import { StationCsvImportModal } from '@/components/admin/catalog/StationCsvImportModal';
import { RouteFormModal } from '@/components/admin/catalog/RouteFormModal';
import { SeatMapEditor } from '@/components/admin/catalog/SeatMapEditor';
import { TripCalendarView } from '@/components/admin/catalog/TripCalendarView';
import { BulkTripModal } from '@/components/admin/catalog/BulkTripModal';
import { SafeTripActionModal } from '@/components/admin/catalog/SafeTripActionModal';

type CatalogTab = 'STATIONS' | 'ROUTES' | 'TRIPS' | 'LAYOUTS' | 'VEHICLES';

export default function AdminCatalogPage() {
  const [activeTab, setActiveTab] = useState<CatalogTab>('STATIONS');

  // Network Reference Data
  const [cities, setCities] = useState<CatalogCity[]>([]);
  const [zones, setZones] = useState<CatalogZone[]>([]);
  const [comfortLevels, setComfortLevels] = useState<CatalogComfortLevel[]>([]);
  const [amenities, setAmenities] = useState<CatalogAmenity[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<CatalogVehicleType[]>([]);
  const [schedules, setSchedules] = useState<CatalogRecurringSchedule[]>([]);

  // Stations State
  const [stations, setStations] = useState<CatalogBusStation[]>([]);
  const [stationsTrash, setStationsTrash] = useState<CatalogBusStation[]>([]);
  const [stationsLoading, setStationsLoading] = useState(true);
  const [stationSearch, setStationSearch] = useState('');
  const [stationCityFilter, setStationCityFilter] = useState('ALL');
  const [isStationTrashView, setIsStationTrashView] = useState(false);

  // Routes State
  const [routes, setRoutes] = useState<CatalogRoute[]>([]);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [routeSearch, setRouteSearch] = useState('');
  const [routeCorridorFilter, setRouteCorridorFilter] = useState('ALL');

  // Trips State
  const [trips, setTrips] = useState<CatalogTrip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripViewMode, setTripViewMode] = useState<'CALENDAR' | 'TABLE'>('CALENDAR');

  // Layouts State
  const [layouts, setLayouts] = useState<CatalogBusLayout[]>([]);
  const [selectedLayoutId, setSelectedLayoutId] = useState<string | null>(null);
  const [isCreatingLayout, setIsCreatingLayout] = useState(false);

  // Modals
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [stationModalData, setStationModalData] = useState<{
    isOpen: boolean;
    station: CatalogBusStation | null;
  }>({ isOpen: false, station: null });
  const [csvImportOpen, setCsvImportOpen] = useState(false);

  const [routeModalData, setRouteModalData] = useState<{
    isOpen: boolean;
    route: CatalogRoute | null;
  }>({ isOpen: false, route: null });

  const [bulkTripModalOpen, setBulkTripModalOpen] = useState(false);
  const [safeTripModalData, setSafeTripModalData] = useState<{
    isOpen: boolean;
    trip: CatalogTrip | null;
  }>({ isOpen: false, trip: null });

  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 5000);
  };

  // 1. Fetch Network Base Reference Data
  const fetchNetworkData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/catalog/network');
      if (res.ok) {
        const data = await res.json();
        setCities(data.cities || []);
        setZones(data.zones || []);
        setComfortLevels(data.comfortLevels || []);
        setAmenities(data.amenities || []);
        setVehicleTypes(data.vehicleTypes || []);
      }
    } catch (err) {
      console.error('Erreur chargement réseau:', err);
    }
  }, []);

  // 2. Fetch Recurring Schedules
  const fetchSchedules = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/catalog/schedules');
      if (res.ok) {
        const data = await res.json();
        setSchedules(data.data || []);
      }
    } catch (err) {
      console.error('Erreur chargement plannings:', err);
    }
  }, []);

  // 3. Fetch Stations
  const fetchStations = useCallback(async () => {
    setStationsLoading(true);
    try {
      const res = await fetch(
        `/api/admin/catalog/stations?search=${encodeURIComponent(
          stationSearch
        )}&cityId=${stationCityFilter}&trash=${isStationTrashView ? 'true' : 'false'}`
      );
      if (res.ok) {
        const data = await res.json();
        if (isStationTrashView) {
          setStationsTrash(data.data || []);
        } else {
          setStations(data.data || []);
        }
      }
    } catch (err) {
      console.error('Erreur chargement gares:', err);
    } finally {
      setStationsLoading(false);
    }
  }, [stationSearch, stationCityFilter, isStationTrashView]);

  // 4. Fetch Routes
  const fetchRoutes = useCallback(async () => {
    setRoutesLoading(true);
    try {
      const res = await fetch(
        `/api/admin/catalog/routes?search=${encodeURIComponent(
          routeSearch
        )}&corridor=${routeCorridorFilter}`
      );
      if (res.ok) {
        const data = await res.json();
        setRoutes(data.data || []);
      }
    } catch (err) {
      console.error('Erreur chargement lignes:', err);
    } finally {
      setRoutesLoading(false);
    }
  }, [routeSearch, routeCorridorFilter]);

  // 5. Fetch Trips
  const fetchTrips = useCallback(async () => {
    setTripsLoading(true);
    try {
      const res = await fetch('/api/admin/catalog/trips');
      if (res.ok) {
        const data = await res.json();
        setTrips(data.data || []);
      }
    } catch (err) {
      console.error('Erreur chargement départs:', err);
    } finally {
      setTripsLoading(false);
    }
  }, []);

  // 6. Fetch Layouts
  const fetchLayouts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/catalog/layouts');
      if (res.ok) {
        const data = await res.json();
        const list = data.data || [];
        setLayouts(list);
        if (list.length > 0 && !selectedLayoutId) {
          setSelectedLayoutId(list[0].id);
        }
      }
    } catch (err) {
      console.error('Erreur chargement plans:', err);
    }
  }, [selectedLayoutId]);

  useEffect(() => {
    fetchNetworkData();
    fetchSchedules();
  }, [fetchNetworkData, fetchSchedules]);

  useEffect(() => {
    if (activeTab === 'STATIONS') fetchStations();
    if (activeTab === 'ROUTES') fetchRoutes();
    if (activeTab === 'TRIPS') fetchTrips();
    if (activeTab === 'LAYOUTS') fetchLayouts();
  }, [activeTab, fetchStations, fetchRoutes, fetchTrips, fetchLayouts]);

  // Soft Delete Station
  const handleDeleteStation = async (station: CatalogBusStation) => {
    const reason = window.prompt(
      `Confirmez-vous la mise à la corbeille de la gare "${station.name}" ? Veuillez saisir un motif :`
    );
    if (!reason || reason.trim().length < 5) {
      alert('Veuillez fournir un motif valable (au moins 5 caractères).');
      return;
    }

    try {
      const res = await fetch(`/api/admin/catalog/stations/${station.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        showNotification('success', `La gare ${station.name} a été déplacée dans la corbeille.`);
        fetchStations();
      } else {
        const err = await res.json();
        showNotification('error', err.error || 'Erreur lors de la suppression.');
      }
    } catch {
      showNotification('error', 'Erreur réseau.');
    }
  };

  // Restore Station
  const handleRestoreStation = async (station: CatalogBusStation) => {
    try {
      const res = await fetch(`/api/admin/catalog/stations/${station.id}/restore`, {
        method: 'POST',
      });
      if (res.ok) {
        showNotification('success', `La gare ${station.name} a été restaurée.`);
        fetchStations();
      } else {
        const err = await res.json();
        showNotification('error', err.error || 'Erreur lors de la restauration.');
      }
    } catch {
      showNotification('error', 'Erreur réseau.');
    }
  };

  // Delete Route
  const handleDeleteRoute = async (route: CatalogRoute) => {
    const reason = window.prompt(
      `Confirmez-vous la désactivation de la ligne "${route.name}" ? Veuillez saisir un motif :`
    );
    if (!reason || reason.trim().length < 5) {
      alert('Veuillez fournir un motif valable (au moins 5 caractères).');
      return;
    }

    try {
      const res = await fetch(`/api/admin/catalog/routes/${route.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        showNotification('success', `La ligne ${route.name} a été désactivée.`);
        fetchRoutes();
      } else {
        const err = await res.json();
        showNotification('error', err.error || 'Erreur lors de la désactivation.');
      }
    } catch {
      showNotification('error', 'Erreur réseau.');
    }
  };

  // Save Layout from Visual Editor
  const handleSaveLayout = async (layoutData: {
    name: string;
    vehicleTypeId: string;
    rows: number;
    columns: number;
    cells: LayoutCell[];
  }) => {
    try {
      const res = await fetch('/api/admin/catalog/layouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(layoutData),
      });

      if (res.ok) {
        const resData = await res.json();
        showNotification('success', `Le plan de cabine "${layoutData.name}" a été enregistré.`);
        await fetchLayouts();
        if (resData.layout?.id) {
          setSelectedLayoutId(resData.layout.id);
        }
        setIsCreatingLayout(false);
      } else {
        const err = await res.json();
        showNotification('error', err.error || 'Erreur enregistrement plan.');
      }
    } catch {
      showNotification('error', 'Erreur réseau.');
    }
  };

  const selectedLayout = layouts.find((l) => l.id === selectedLayoutId) || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Catalogue & Réseau de Transport
            </h1>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              RDC National
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Gestion unifiée des gares routières, corridors, départs récurrents, plans de sièges et normes de véhicules.
          </p>
        </div>

        {/* Global Notifications */}
        {actionMessage && (
          <div
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm shadow-md transition-all ${
              actionMessage.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 text-white'
            }`}
          >
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <span>{actionMessage.text}</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-neutral-200 dark:border-neutral-800">
        <nav className="flex space-x-2 overflow-x-auto pb-px" aria-label="Onglets Catalogue">
          <button
            type="button"
            data-testid="tab-stations"
            onClick={() => setActiveTab('STATIONS')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'STATIONS'
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white'
                : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-700'
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>Gares & Réseau</span>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {stations.length}
            </span>
          </button>

          <button
            type="button"
            data-testid="tab-routes"
            onClick={() => setActiveTab('ROUTES')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'ROUTES'
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white'
                : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-700'
            }`}
          >
            <RouteIcon className="h-4 w-4" />
            <span>Lignes & Corridors</span>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {routes.length}
            </span>
          </button>

          <button
            type="button"
            data-testid="tab-trips"
            onClick={() => setActiveTab('TRIPS')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'TRIPS'
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white'
                : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-700'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Départs & Calendrier</span>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {trips.length}
            </span>
          </button>

          <button
            type="button"
            data-testid="tab-layouts"
            onClick={() => setActiveTab('LAYOUTS')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'LAYOUTS'
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white'
                : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-700'
            }`}
          >
            <Grid className="h-4 w-4" />
            <span>Plans de Sièges</span>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {layouts.length}
            </span>
          </button>

          <button
            type="button"
            data-testid="tab-vehicles"
            onClick={() => setActiveTab('VEHICLES')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'VEHICLES'
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white'
                : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-700'
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>Véhicules & Conforts RDC</span>
          </button>
        </nav>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GARES & RÉSEAU */}
      {/* ========================================================================= */}
      {activeTab === 'STATIONS' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <div className="relative min-w-[240px] flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  data-testid="input-search-stations"
                  placeholder="Rechercher une gare (nom, code, adresse)..."
                  value={stationSearch}
                  onChange={(e) => setStationSearch(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pr-3 pl-9 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-white"
                />
              </div>

              <select
                value={stationCityFilter}
                onChange={(e) => setStationCityFilter(e.target.value)}
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              >
                <option value="ALL">Toutes les villes</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.province})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setIsStationTrashView(!isStationTrashView)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  isStationTrashView
                    ? 'border-amber-500 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                }`}
              >
                <Trash2 className="h-4 w-4" />
                <span>{isStationTrashView ? 'Voir Actives' : 'Corbeille'}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                data-testid="btn-open-map-picker"
                onClick={() => setMapPickerOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              >
                <Compass className="h-4 w-4 text-emerald-600" />
                <span className="hidden sm:inline">Sélecteur</span> GPS
              </button>

              <button
                type="button"
                data-testid="btn-import-stations-csv"
                onClick={() => setCsvImportOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              >
                <Upload className="h-4 w-4 text-blue-600" />
                <span>Importer CSV</span>
              </button>

              <button
                type="button"
                data-testid="btn-add-station"
                onClick={() => setStationModalData({ isOpen: true, station: null })}
                className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
              >
                <Plus className="h-4 w-4" />
                <span>Nouvelle Gare</span>
              </button>
            </div>
          </div>

          {/* Stations Table */}
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            {stationsLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
              </div>
            ) : (isStationTrashView ? stationsTrash : stations).length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <MapPin className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />
                <h3 className="mt-4 text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Aucune gare routière trouvée
                </h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {isStationTrashView
                    ? 'La corbeille des gares est vide.'
                    : 'Créez une nouvelle gare ou importez un fichier CSV de coordonnées.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm" data-testid="table-stations">
                  <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold text-neutral-600 uppercase dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
                    <tr>
                      <th className="px-4 py-3">Code / Nom</th>
                      <th className="px-4 py-3">Ville & Quartier</th>
                      <th className="px-4 py-3">Coordonnées GPS</th>
                      <th className="px-4 py-3">Équipements</th>
                      <th className="px-4 py-3">Statut</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {(isStationTrashView ? stationsTrash : stations).map((st) => (
                      <tr
                        key={st.id}
                        data-testid={`row-station-${st.id}`}
                        className="transition-colors hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50"
                      >
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-neutral-900 dark:text-white">
                            {st.name}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                            <span className="font-mono uppercase font-bold text-neutral-700 dark:text-neutral-300">
                              {st.code}
                            </span>
                            <span>•</span>
                            <span className="truncate max-w-[220px]">{st.address}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-neutral-800 dark:text-neutral-200">
                            {st.cityName}
                          </div>
                          <div className="text-xs text-neutral-500">{st.zoneName || 'Centre-ville'}</div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                          <div>Lat: {st.coordinates.lat.toFixed(4)}</div>
                          <div>Lng: {st.coordinates.lng.toFixed(4)}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {st.facilities?.map((f) => (
                              <span
                                key={f}
                                className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          {st.deletedAt ? (
                            <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                              Supprimée
                            </span>
                          ) : st.isActive ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {st.deletedAt ? (
                              <button
                                type="button"
                                data-testid={`btn-restore-station-${st.id}`}
                                onClick={() => handleRestoreStation(st)}
                                className="inline-flex items-center gap-1 rounded p-1.5 text-xs text-neutral-600 hover:bg-neutral-100 hover:text-emerald-600 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                title="Restaurer la gare"
                              >
                                <RotateCcw className="h-4 w-4" />
                                <span className="hidden sm:inline">Restaurer</span>
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  data-testid={`btn-edit-station-${st.id}`}
                                  onClick={() => setStationModalData({ isOpen: true, station: st })}
                                  className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
                                  title="Modifier"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  data-testid={`btn-delete-station-${st.id}`}
                                  onClick={() => handleDeleteStation(st)}
                                  className="rounded p-1.5 text-neutral-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                                  title="Supprimer (corbeille)"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LIGNES & CORRIDORS */}
      {/* ========================================================================= */}
      {activeTab === 'ROUTES' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <div className="relative min-w-[240px] flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  data-testid="input-search-routes"
                  placeholder="Rechercher une ligne (ex: Kinshasa - Matadi)..."
                  value={routeSearch}
                  onChange={(e) => setRouteSearch(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pr-3 pl-9 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-white"
                />
              </div>

              <select
                value={routeCorridorFilter}
                onChange={(e) => setRouteCorridorFilter(e.target.value)}
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              >
                <option value="ALL">Tous les corridors</option>
                <option value="RN1">RN1 (Kinshasa - Matadi / Kenge)</option>
                <option value="RN2">RN2 (Mbuji-Mayi - Bukavu)</option>
                <option value="RN3">RN3 (Kisangani - Lubutu)</option>
                <option value="KATANGA">Corridor Katanga (Lubumbashi - Kolwezi)</option>
              </select>
            </div>

            <button
              type="button"
              data-testid="btn-add-route"
              onClick={() => setRouteModalData({ isOpen: true, route: null })}
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              <Plus className="h-4 w-4" />
              <span>Créer une Ligne</span>
            </button>
          </div>

          {/* Routes Table */}
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            {routesLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
              </div>
            ) : routes.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <RouteIcon className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />
                <h3 className="mt-4 text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Aucune ligne interurbaine
                </h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Définissez un corridor interurbain reliant deux gares routières homologuées.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm" data-testid="table-routes">
                  <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold text-neutral-600 uppercase dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
                    <tr>
                      <th className="px-4 py-3">Code / Ligne</th>
                      <th className="px-4 py-3">Corridor</th>
                      <th className="px-4 py-3">Distance & Durée</th>
                      <th className="px-4 py-3">Tarif de Base</th>
                      <th className="px-4 py-3">Arrêts</th>
                      <th className="px-4 py-3">Statut</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {routes.map((rt) => (
                      <tr
                        key={rt.id}
                        data-testid={`row-route-${rt.id}`}
                        className="transition-colors hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-neutral-900 dark:text-white">
                              {rt.name}
                            </span>
                            {rt.isExpress && (
                              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                EXPRESS
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-xs text-neutral-500 uppercase">
                            {rt.code}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                            <span>{rt.originStationName}</span>
                            <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
                            <span>{rt.destinationStationName}</span>
                          </div>
                          <div className="text-xs text-neutral-500">
                            {rt.originCityName} → {rt.destinationCityName}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-neutral-800 dark:text-neutral-200">
                            {rt.distanceKm} km
                          </div>
                          <div className="text-xs text-neutral-500">
                            ~{Math.floor(rt.durationMinutes / 60)}h
                            {rt.durationMinutes % 60 > 0 &&
                              ` ${(rt.durationMinutes % 60).toString().padStart(2, '0')}`}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-neutral-900 dark:text-white">
                            {rt.baseFareCDF.toLocaleString('fr-FR')} FC
                          </div>
                          <div className="text-xs text-neutral-500 font-mono">
                            ~${(rt.baseFareCDF / 2850).toFixed(2)} USD
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="rounded bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                            {rt.stops ? rt.stops.length : 0} arrêt(s)
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {rt.isActive ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              data-testid={`btn-edit-route-${rt.id}`}
                              onClick={() => setRouteModalData({ isOpen: true, route: rt })}
                              className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
                              title="Modifier la ligne"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              data-testid={`btn-delete-route-${rt.id}`}
                              onClick={() => handleDeleteRoute(rt)}
                              className="rounded p-1.5 text-neutral-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                              title="Désactiver"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DÉPARTS & CALENDRIER */}
      {/* ========================================================================= */}
      {activeTab === 'TRIPS' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-lg border border-neutral-200 p-1 dark:border-neutral-800">
                <button
                  type="button"
                  data-testid="btn-view-calendar"
                  onClick={() => setTripViewMode('CALENDAR')}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    tripViewMode === 'CALENDAR'
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                      : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
                  }`}
                >
                  Vue Calendrier
                </button>
                <button
                  type="button"
                  data-testid="btn-view-table"
                  onClick={() => setTripViewMode('TABLE')}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    tripViewMode === 'TABLE'
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                      : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
                  }`}
                >
                  Vue Liste
                </button>
              </div>
            </div>

            <button
              type="button"
              data-testid="btn-bulk-generate-trips"
              onClick={() => setBulkTripModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              <Plus className="h-4 w-4" />
              <span>Générer Départs en Masse</span>
            </button>
          </div>

          {/* Calendar View vs Table View */}
          {tripsLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
          ) : tripViewMode === 'CALENDAR' ? (
            <TripCalendarView
              trips={trips}
              onSelectTrip={(trip) => setSafeTripModalData({ isOpen: true, trip })}
              onOpenBulkModal={() => setBulkTripModalOpen(true)}
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm" data-testid="table-trips">
                  <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold text-neutral-600 uppercase dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
                    <tr>
                      <th className="px-4 py-3">Date & Heure</th>
                      <th className="px-4 py-3">Ligne</th>
                      <th className="px-4 py-3">Opérateur</th>
                      <th className="px-4 py-3">Occupation</th>
                      <th className="px-4 py-3">Statut</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {trips.map((tp) => (
                      <tr
                        key={tp.id}
                        data-testid={`row-trip-${tp.id}`}
                        className="transition-colors hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50"
                      >
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-neutral-900 dark:text-white">
                            {new Date(tp.departureDateTime).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="text-xs text-neutral-500">
                            Départ :{' '}
                            {new Date(tp.departureDateTime).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-neutral-800 dark:text-neutral-200">
                            {tp.routeName}
                          </div>
                          <div className="text-xs text-neutral-500 font-mono">{tp.tripRef}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="text-neutral-800 dark:text-neutral-200">
                            {tp.operatorName}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-neutral-900 dark:text-white">
                              {tp.bookedSeats} / {tp.totalSeats} places
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                tp.bookedSeats >= tp.totalSeats
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : tp.bookedSeats > 0
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}
                            >
                              {Math.round((tp.bookedSeats / (tp.totalSeats || 1)) * 100)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              tp.status === 'SCHEDULED'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : tp.status === 'BOARDING'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : tp.status === 'CANCELLED'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300'
                            }`}
                          >
                            {tp.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            data-testid={`btn-manage-trip-${tp.id}`}
                            onClick={() => setSafeTripModalData({ isOpen: true, trip: tp })}
                            className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                          >
                            <span>Gérer Départ</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PLANS DE SIÈGES */}
      {/* ========================================================================= */}
      {activeTab === 'LAYOUTS' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Plan sélectionné :
              </span>
              <select
                data-testid="select-active-layout"
                value={selectedLayoutId || ''}
                onChange={(e) => {
                  setSelectedLayoutId(e.target.value);
                  setIsCreatingLayout(false);
                }}
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              >
                {layouts.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.totalSeats} places • {l.rows}x{l.columns})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              data-testid="btn-create-new-layout"
              onClick={() => {
                setIsCreatingLayout(true);
                setSelectedLayoutId(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              <Plus className="h-4 w-4" />
              <span>Nouveau Modèle de Sièges</span>
            </button>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <SeatMapEditor
              initialLayout={isCreatingLayout ? null : selectedLayout}
              onSave={handleSaveLayout}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: VÉHICULES & CONFORTS RDC */}
      {/* ========================================================================= */}
      {activeTab === 'VEHICLES' && (
        <div className="space-y-8">
          {/* Section 1: Classes de Confort */}
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Classes de Confort Homologuées
              </h2>
              <p className="text-sm text-neutral-500">
                Paliers tarifaires appliqués sur les trajets selon les services à bord.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {comfortLevels.map((lvl) => (
                <div
                  key={lvl.id}
                  className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-neutral-500 uppercase">
                      {lvl.tier}
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      x{lvl.priceMultiplier} Tarif
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-neutral-900 dark:text-white">
                    {lvl.name}
                  </h3>
                  <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
                    {lvl.description}
                  </p>

                  <div className="mt-4 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                    <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Équipements inclus :
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {lvl.amenities?.map((item) => (
                        <span
                          key={item}
                          className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Catégories de Véhicules & Normes RDC */}
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Spécifications Réglementaires Véhicules RDC
              </h2>
              <p className="text-sm text-neutral-500">
                Normes de conformité imposées aux transporteurs : assurance SONAS, contrôle CNPR et limiteurs de vitesse.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {vehicleTypes.map((vt) => (
                <div
                  key={vt.id}
                  className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-neutral-100 px-2 py-0.5 font-mono text-xs font-bold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                      {vt.category}
                    </span>
                    <span className="text-xs font-medium text-neutral-500">
                      {vt.defaultCapacity} places réf.
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-neutral-900 dark:text-white">
                    {vt.name}
                  </h3>

                  <div className="mt-4 space-y-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                    <div className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                      <Shield className="h-3.5 w-3.5 text-blue-600" />
                      <span>
                        SONAS : {vt.regulations.sonasInsuranceRequired ? 'Obligatoire' : 'Optionnelle'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                      <Clock className="h-3.5 w-3.5 text-amber-600" />
                      <span>Limiteur CNPR : {vt.regulations.maxSpeedKmH} km/h max</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>
                        Contrôle technique tous les {vt.regulations.technicalInspectionFrequencyMonths} mois
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Équipements de Bord */}
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Équipements & Services Passagers
              </h2>
              <p className="text-sm text-neutral-500">
                Prestations auditées lors de l&apos;homologation des autocars et des gares routières.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {amenities.map((am) => (
                <div
                  key={am.id}
                  className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-3.5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="mt-0.5 rounded-lg bg-neutral-100 p-2 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {am.name}
                    </div>
                    <div className="text-xs text-neutral-500">{am.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* 1. Map Picker Modal (Direct trigger) */}
      <MapPickerModal
        isOpen={mapPickerOpen}
        onClose={() => setMapPickerOpen(false)}
        initialLat={-4.325}
        initialLng={15.3222}
        onSelectCoordinates={(coords) => {
          showNotification(
            'success',
            `Coordonnées GPS capturées : ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
          );
        }}
      />

      {/* 2. Station Form Modal */}
      {stationModalData.isOpen && (
        <StationFormModal
          isOpen={stationModalData.isOpen}
          onClose={() => setStationModalData({ isOpen: false, station: null })}
          station={stationModalData.station}
          cities={cities}
          zones={zones}
          onSuccess={() => {
            fetchStations();
            showNotification(
              'success',
              stationModalData.station
                ? 'Gare mise à jour avec succès.'
                : 'Nouvelle gare enregistrée.'
            );
          }}
        />
      )}

      {/* 3. CSV Import Modal */}
      <StationCsvImportModal
        isOpen={csvImportOpen}
        onClose={() => setCsvImportOpen(false)}
        onSuccess={() => {
          fetchStations();
          showNotification('success', 'Importation CSV effectuée avec succès.');
        }}
      />

      {/* 4. Route Form Modal */}
      {routeModalData.isOpen && (
        <RouteFormModal
          isOpen={routeModalData.isOpen}
          onClose={() => setRouteModalData({ isOpen: false, route: null })}
          route={routeModalData.route}
          stations={stations}
          onSuccess={() => {
            fetchRoutes();
            showNotification(
              'success',
              routeModalData.route
                ? 'Ligne mise à jour avec succès.'
                : 'Nouvelle ligne créée avec succès.'
            );
          }}
        />
      )}

      {/* 5. Bulk Trip Generation Modal */}
      <BulkTripModal
        isOpen={bulkTripModalOpen}
        onClose={() => setBulkTripModalOpen(false)}
        schedules={schedules}
        onSuccess={() => {
          fetchTrips();
          showNotification('success', 'Départs générés avec succès pour la période.');
        }}
      />

      {/* 6. Safe Trip Action Modal */}
      {safeTripModalData.isOpen && safeTripModalData.trip && (
        <SafeTripActionModal
          isOpen={safeTripModalData.isOpen}
          onClose={() => setSafeTripModalData({ isOpen: false, trip: null })}
          trip={safeTripModalData.trip}
          availableTrips={trips.filter(
            (t) => t.id !== safeTripModalData.trip?.id && t.routeId === safeTripModalData.trip?.routeId
          )}
          onSuccess={() => {
            fetchTrips();
            showNotification('success', 'Action sécurisée sur le départ exécutée.');
          }}
        />
      )}
    </div>
  );
}
