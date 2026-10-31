'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AdminDeliveryOrder,
  DeliveryCourier,
  DeliveryPricingTierConfig,
  ProhibitedDeliveryItem,
} from '@/types';
import {
  Package,
  Search,
  Filter,
  Download,
  Settings,
  Bike,
  Car,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  AlertOctagon,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { DeliveryDetailDrawer } from './DeliveryDetailDrawer';
import { DeliveryReassignModal } from './DeliveryReassignModal';
import { DeliveryCancelModal } from './DeliveryCancelModal';
import { DeliveryMarkDeliveredModal } from './DeliveryMarkDeliveredModal';
import { DeliveryFailReturnModal } from './DeliveryFailReturnModal';
import { DeliveryConfigModal } from './DeliveryConfigModal';

export function AdminDeliveriesDashboard() {
  const [deliveries, setDeliveries] = useState<AdminDeliveryOrder[]>([]);
  const [couriers, setCouriers] = useState<DeliveryCourier[]>([]);
  const [pricingTiers, setPricingTiers] = useState<DeliveryPricingTierConfig[]>([]);
  const [prohibitedItems, setProhibitedItems] = useState<ProhibitedDeliveryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter States
  const [cityFilter, setCityFilter] = useState<string>('ALL');
  const [parcelSizeFilter, setParcelSizeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Entities & Modals
  const [selectedDelivery, setSelectedDelivery] = useState<AdminDeliveryOrder | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  const [reassignModalDelivery, setReassignModalDelivery] = useState<AdminDeliveryOrder | null>(null);
  const [cancelModalDelivery, setCancelModalDelivery] = useState<AdminDeliveryOrder | null>(null);
  const [markDeliveredModalDelivery, setMarkDeliveredModalDelivery] = useState<AdminDeliveryOrder | null>(null);
  const [failReturnModalDelivery, setFailReturnModalDelivery] = useState<AdminDeliveryOrder | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (cityFilter !== 'ALL') params.set('city', cityFilter);
      if (parcelSizeFilter !== 'ALL') params.set('parcelSize', parcelSizeFilter);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/admin/deliveries?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDeliveries(data.deliveries || []);
        setCouriers(data.couriers || []);
        setPricingTiers(data.pricingTiers || []);
        setProhibitedItems(data.prohibitedItems || []);
      }
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  }, [cityFilter, parcelSizeFilter, statusFilter, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // KPI Calculations
  const activeDeliveriesCount = useMemo(
    () =>
      deliveries.filter(
        (d) => d.status === 'CREATED' || d.status === 'ASSIGNED' || d.status === 'PICKED_UP' || d.status === 'IN_TRANSIT'
      ).length,
    [deliveries]
  );

  const deliveredCount = useMemo(
    () => deliveries.filter((d) => d.status === 'DELIVERED').length,
    [deliveries]
  );

  const failedOrReturnsCount = useMemo(
    () =>
      deliveries.filter(
        (d) => d.status === 'FAILED_ATTEMPT' || d.status === 'RETURNED_TO_SENDER'
      ).length,
    [deliveries]
  );

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-blue-400" />
            Gestion des Livraisons & Colis Express
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Supervision de la messagerie urbaine, coursiers Wewa, preuves de livraison et articles prohibés RDC
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 transition shadow"
          >
            <Settings className="w-3.5 h-3.5 text-blue-400" />
            <span>Tarifs & Prohibitions</span>
          </button>

          <a
            href="/api/admin/deliveries/export"
            download
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 transition shadow"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exporter CSV</span>
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 shadow">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>En Cours de Livraison</span>
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{activeDeliveriesCount}</p>
          <span className="text-[11px] text-neutral-500">Kinshasa, Lubumbashi, Goma</span>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 shadow">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Livrées avec Succès</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{deliveredCount}</p>
          <span className="text-[11px] text-emerald-400 font-medium">PIN et preuve enregistrés</span>
        </div>

        <div className={`p-4 rounded-xl border shadow ${
          failedOrReturnsCount > 0
            ? 'bg-amber-950/30 border-amber-500/40'
            : 'bg-neutral-900 border-neutral-800'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={failedOrReturnsCount > 0 ? 'text-amber-400 font-bold' : 'text-neutral-400'}>
              Échecs & Retours Expéditeur
            </span>
            <RotateCcw className={`w-4 h-4 ${failedOrReturnsCount > 0 ? 'text-amber-400' : 'text-neutral-400'}`} />
          </div>
          <p className={`text-2xl font-black mt-1 ${failedOrReturnsCount > 0 ? 'text-amber-400' : 'text-white'}`}>
            {failedOrReturnsCount}
          </p>
          <span className="text-[11px] text-neutral-400">À traiter par le régulateur</span>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 shadow">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Flotte Coursiers Actifs</span>
            <Bike className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{couriers.length}</p>
          <span className="text-[11px] text-neutral-500">Motos & Camionnettes express</span>
        </div>
      </div>

      {/* Multi-filter Toolbar */}
      <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Réf, expéditeur, destinataire, PIN..."
            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

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

        <div>
          <select
            value={parcelSizeFilter}
            onChange={(e) => setParcelSizeFilter(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
          >
            <option value="ALL">Tous les Formats de Colis</option>
            <option value="ENVELOPE">Pli / Documents (ENVELOPE)</option>
            <option value="SMALL">Petit Colis (&lt; 5kg)</option>
            <option value="MEDIUM">Colis Moyen (5-15kg)</option>
            <option value="LARGE">Grand Colis (&gt; 15kg)</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white"
          >
            <option value="ALL">Tous les Statuts</option>
            <option value="IN_TRANSIT">En Transit</option>
            <option value="ASSIGNED">Assigné</option>
            <option value="DELIVERED">Livrés</option>
            <option value="FAILED_ATTEMPT">Échecs de Livraison</option>
            <option value="RETURNED_TO_SENDER">Retournés à l'Expéditeur</option>
            <option value="CANCELLED">Annulés</option>
          </select>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Registre des Livraisons Express ({deliveries.length})</span>
          </h2>
          <span className="text-xs text-neutral-400">
            Cliquez sur un colis pour ouvrir le panneau d'intervention
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
              <tr>
                <th className="p-3">Réf / Ville</th>
                <th className="p-3">Format & Contenu</th>
                <th className="p-3">Expéditeur</th>
                <th className="p-3">Destinataire</th>
                <th className="p-3">Coursier & Plaque</th>
                <th className="p-3">Statut & PIN</th>
                <th className="p-3 text-right">Tarif</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-neutral-500 italic">
                    Aucune livraison ne correspond aux critères sélectionnés.
                  </td>
                </tr>
              ) : (
                deliveries.map((delivery) => (
                  <tr
                    key={delivery.id}
                    onClick={() => {
                      setSelectedDelivery(delivery);
                      setIsDetailDrawerOpen(true);
                    }}
                    className={`hover:bg-neutral-800/60 cursor-pointer transition ${
                      delivery.status === 'FAILED_ATTEMPT' || delivery.status === 'RETURNED_TO_SENDER'
                        ? 'bg-amber-950/20 hover:bg-amber-950/30'
                        : selectedDelivery?.id === delivery.id
                          ? 'bg-blue-950/30'
                          : ''
                    }`}
                  >
                    <td className="p-3">
                      <span className="font-bold text-white block">{delivery.reference}</span>
                      <span className="text-[11px] text-neutral-400">{delivery.city}</span>
                    </td>

                    <td className="p-3">
                      <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-bold text-[10px] block w-fit mb-0.5">
                        {delivery.parcelSize}
                      </span>
                      <p className="text-[11px] text-neutral-300 line-clamp-1">
                        {delivery.parcelDescription.content}
                      </p>
                    </td>

                    <td className="p-3">
                      <p className="font-semibold text-white">{delivery.sender.name}</p>
                      <p className="text-[11px] text-neutral-400">{delivery.sender.phone}</p>
                    </td>

                    <td className="p-3">
                      <p className="font-semibold text-white">{delivery.recipient.name}</p>
                      <p className="text-[11px] text-neutral-400">{delivery.recipient.phone}</p>
                    </td>

                    <td className="p-3">
                      {delivery.courier ? (
                        <div>
                          <p className="font-semibold text-white flex items-center gap-1">
                            {delivery.courier.vehicleType === 'MOTO' ? (
                              <Bike className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <Car className="w-3.5 h-3.5 text-blue-400" />
                            )}
                            <span>{delivery.courier.name}</span>
                          </p>
                          <p className="text-[11px] text-amber-400 font-mono">{delivery.courier.vehiclePlate}</p>
                        </div>
                      ) : (
                        <span className="text-neutral-500 italic">En attente d'assignation</span>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          delivery.status === 'DELIVERED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : delivery.status === 'IN_TRANSIT'
                              ? 'bg-blue-500/20 text-blue-400'
                              : delivery.status === 'FAILED_ATTEMPT' || delivery.status === 'RETURNED_TO_SENDER'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {delivery.status}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                          PIN {delivery.deliveryPin}
                        </span>
                      </div>
                    </td>

                    <td className="p-3 text-right">
                      <p className="font-bold text-white">
                        {(delivery.fare.totalFareMinor / 100).toLocaleString('fr-FR')} {delivery.fare.currency}
                      </p>
                      <span className="text-[10px] text-neutral-400">{delivery.fare.paymentMethod}</span>
                    </td>

                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setIsDetailDrawerOpen(true);
                        }}
                        className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition"
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

      {/* Modals & Detail Drawer */}
      <DeliveryDetailDrawer
        delivery={selectedDelivery}
        couriers={couriers}
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        onOpenReassign={(d) => setReassignModalDelivery(d)}
        onOpenCancel={(d) => setCancelModalDelivery(d)}
        onOpenMarkDelivered={(d) => setMarkDeliveredModalDelivery(d)}
        onOpenFailReturn={(d) => setFailReturnModalDelivery(d)}
        onDeliveryUpdated={(updated) => {
          setSelectedDelivery(updated);
          fetchData();
        }}
      />

      <DeliveryReassignModal
        delivery={reassignModalDelivery}
        couriers={couriers}
        isOpen={!!reassignModalDelivery}
        onClose={() => setReassignModalDelivery(null)}
        onSuccess={(updated) => {
          setSelectedDelivery(updated);
          fetchData();
        }}
      />

      <DeliveryCancelModal
        delivery={cancelModalDelivery}
        isOpen={!!cancelModalDelivery}
        onClose={() => setCancelModalDelivery(null)}
        onSuccess={(updated) => {
          setSelectedDelivery(updated);
          fetchData();
        }}
      />

      <DeliveryMarkDeliveredModal
        delivery={markDeliveredModalDelivery}
        isOpen={!!markDeliveredModalDelivery}
        onClose={() => setMarkDeliveredModalDelivery(null)}
        onSuccess={(updated) => {
          setSelectedDelivery(updated);
          fetchData();
        }}
      />

      <DeliveryFailReturnModal
        delivery={failReturnModalDelivery}
        isOpen={!!failReturnModalDelivery}
        onClose={() => setFailReturnModalDelivery(null)}
        onSuccess={(updated) => {
          setSelectedDelivery(updated);
          fetchData();
        }}
      />

      <DeliveryConfigModal
        pricingTiers={pricingTiers}
        prohibitedItems={prohibitedItems}
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onRefresh={fetchData}
      />
    </div>
  );
}

