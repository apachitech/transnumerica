'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SavedPlace, PlaceIconType } from '@/types';
import { AccountEmptyState } from './AccountEmptyState';
import {
  MapPin,
  Home,
  Briefcase,
  Plane,
  Plus,
  Trash2,
  Navigation,
  X,
  Check,
  Building,
} from 'lucide-react';

const DEFAULT_SAVED_PLACES: SavedPlace[] = [
  {
    id: 'place-home',
    name: 'Domicile',
    address: '12 Avenue Kasa-Vubu, Bandalungwa',
    city: 'Kinshasa',
    icon: 'HOME',
    isPopular: true,
  },
  {
    id: 'place-work',
    name: 'Bureau / Travail',
    address: 'Immeuble Crown Tower, Boulevard du 30 Juin',
    city: 'Kinshasa (Gombe)',
    icon: 'WORK',
    isPopular: true,
  },
  {
    id: 'place-airport',
    name: 'Aéroport N\'djili',
    address: 'Aéroport International de N\'djili',
    city: 'Kinshasa',
    icon: 'AIRPORT',
  },
  {
    id: 'place-station',
    name: 'Gare Routière UPN',
    address: 'Gare Routière UPN / Pompage, Ngaliema',
    city: 'Kinshasa',
    icon: 'STATION',
  },
];

export function AccountSavedPlaces() {
  const router = useRouter();
  const [places, setPlaces] = useState<SavedPlace[]>(DEFAULT_SAVED_PLACES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('Kinshasa');
  const [newIcon, setNewIcon] = useState<PlaceIconType>('HOME');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tn_saved_places');
      if (stored) {
        setPlaces(JSON.parse(stored));
      } else {
        setPlaces(DEFAULT_SAVED_PLACES);
        localStorage.setItem('tn_saved_places', JSON.stringify(DEFAULT_SAVED_PLACES));
      }
    } catch {
      setPlaces(DEFAULT_SAVED_PLACES);
    }
  }, []);

  const savePlacesToStorage = (updated: SavedPlace[]) => {
    setPlaces(updated);
    try {
      localStorage.setItem('tn_saved_places', JSON.stringify(updated));
    } catch {}
  };

  const handleAddPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newAddress.trim()) return;

    const newPlace: SavedPlace = {
      id: `place-${Date.now()}`,
      name: newName.trim(),
      address: newAddress.trim(),
      city: newCity,
      icon: newIcon,
    };

    savePlacesToStorage([...places, newPlace]);
    setNewName('');
    setNewAddress('');
    setShowAddModal(false);
  };

  const handleDeletePlace = (id: string) => {
    savePlacesToStorage(places.filter((p) => p.id !== id));
  };

  const handleGoTo = (place: SavedPlace) => {
    router.push(`/rides?service=moto&dropoff=${encodeURIComponent(place.address + ', ' + place.city)}`);
  };

  const getPlaceIcon = (icon: PlaceIconType) => {
    switch (icon) {
      case 'HOME':
        return <Home className="w-4 h-4 text-amber-500" />;
      case 'WORK':
        return <Briefcase className="w-4 h-4 text-blue-500" />;
      case 'AIRPORT':
        return <Plane className="w-4 h-4 text-emerald-500" />;
      case 'STATION':
        return <Building className="w-4 h-4 text-purple-500" />;
      default:
        return <MapPin className="w-4 h-4 text-rose-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-neutral-900 dark:text-white">
            Adresses &amp; Lieux Fréquents
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Accédez à vos repères quotidiens en 1 clic pour commander un trajet
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-primary-900 hover:bg-primary-950 dark:bg-primary-500 text-white dark:text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter</span>
        </button>
      </div>

      {places.length === 0 ? (
        <AccountEmptyState
          icon={MapPin}
          title="Aucune adresse enregistrée"
          description="Enregistrez votre domicile ou votre lieu de travail pour commander un taxi ou un wewa en 3 tapotements."
          actionText="Ajouter mon domicile"
          onActionClick={() => setShowAddModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {places.map((place) => (
            <div
              key={place.id}
              className="bg-white dark:bg-neutral-850 border border-neutral-200/90 dark:border-neutral-750 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
                    {getPlaceIcon(place.icon)}
                  </div>
                  <div>
                    <span className="font-extrabold text-xs sm:text-sm text-neutral-900 dark:text-white block">
                      {place.name}
                    </span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight block mt-0.5">
                      {place.address}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-medium block">
                      {place.city}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeletePlace(place.id)}
                  aria-label={`Supprimer ${place.name}`}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors opacity-75 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400 font-medium">
                  {place.isPopular ? '★ Fréquent' : 'Enregistré'}
                </span>
                <button
                  type="button"
                  onClick={() => handleGoTo(place)}
                  className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-bold rounded-lg flex items-center gap-1 active:scale-95 transition-all"
                >
                  <Navigation className="w-3 h-3 text-amber-500" />
                  <span>Y aller</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Place Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-place-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <h3 id="add-place-title" className="font-extrabold text-sm text-neutral-900 dark:text-white">
                Ajouter une adresse favorite
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPlace} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Nom du repère (ex: Chez Maman, Salle de sport) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Église Saint-Joseph, Bureau"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Adresse complète ou repère routier *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Croisement Huileries / Av. Kasa-Vubu"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-accent-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Ville
                  </label>
                  <select
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent-400"
                  >
                    <option value="Kinshasa">Kinshasa</option>
                    <option value="Lubumbashi">Lubumbashi</option>
                    <option value="Goma">Goma</option>
                    <option value="Matadi">Matadi</option>
                    <option value="Kolwezi">Kolwezi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Icône
                  </label>
                  <select
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value as PlaceIconType)}
                    className="w-full min-h-[44px] px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent-400"
                  >
                    <option value="HOME">🏠 Domicile</option>
                    <option value="WORK">💼 Travail</option>
                    <option value="AIRPORT">✈️ Aéroport</option>
                    <option value="STATION">🚍 Gare</option>
                    <option value="CUSTOM">📍 Autre</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary-900 hover:bg-primary-950 dark:bg-primary-500 text-white dark:text-neutral-950 font-black rounded-xl shadow-md"
                >
                  Ajouter l&apos;adresse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
