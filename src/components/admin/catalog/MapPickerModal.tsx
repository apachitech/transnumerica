'use client';

import React, { useState } from 'react';
import { X, MapPin, Navigation, Crosshair, Check, Globe } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
  onSelectCoordinates: (coords: { lat: number; lng: number }) => void;
}

const DRC_CITY_PRESETS = [
  { name: 'Kinshasa (Gombe)', lat: -4.3012, lng: 15.3125, province: 'Kinshasa' },
  { name: 'Kinshasa (Masina Pascale)', lat: -4.385, lng: 15.392, province: 'Kinshasa' },
  { name: 'Matadi (Poste Mpozo)', lat: -5.828, lng: 13.485, province: 'Kongo Central' },
  { name: 'Boma (Ville Basse)', lat: -5.85, lng: 13.05, province: 'Kongo Central' },
  { name: 'Lubumbashi (Gare Centrale)', lat: -11.662, lng: 27.481, province: 'Haut-Katanga' },
  { name: 'Kolwezi (Carrefour Mwangeji)', lat: -10.718, lng: 25.472, province: 'Lualaba' },
  { name: 'Goma (Port / Rond-Point BD)', lat: -1.674, lng: 29.2285, province: 'Nord-Kivu' },
  { name: 'Kikwit (Avenue du Marché)', lat: -5.041, lng: 18.816, province: 'Kwilu' },
];

export function MapPickerModal({
  isOpen,
  onClose,
  initialLat = -4.3012,
  initialLng = 15.3125,
  onSelectCoordinates,
}: Props) {
  const [lat, setLat] = useState<number>(initialLat);
  const [lng, setLng] = useState<number>(initialLng);

  if (!isOpen) return null;

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Approximate mapping across RDC bounding box: lat (-13.5 to 5.0), lng (12.0 to 31.0)
    const normX = x / rect.width;
    const normY = y / rect.height;

    const computedLng = +(12.0 + normX * (31.0 - 12.0)).toFixed(4);
    const computedLat = +(5.0 - normY * (5.0 - -13.5)).toFixed(4);

    setLat(computedLat);
    setLng(computedLng);
  };

  const handleConfirm = () => {
    onSelectCoordinates({ lat, lng });
    onClose();
  };

  // Canvas marker percentage
  const pinLeftPct = Math.max(0, Math.min(100, ((lng - 12.0) / (31.0 - 12.0)) * 100));
  const pinTopPct = Math.max(0, Math.min(100, ((5.0 - lat) / (5.0 - -13.5)) * 100));

  return (
    <div
      data-testid="map-picker-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto"
    >
      <div className="w-full max-w-2xl bg-[#0D1E32] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#091522] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Sélecteur de Coordonnées GPS (RDC)
              </h3>
              <p className="text-2xs text-neutral-400">
                Positionnez la gare routière sur le réseau routier national
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

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-3xs uppercase tracking-wider font-bold text-neutral-400 block">
              Préréglages Villes & Pôles de Transport RDC
            </span>
            <div className="flex flex-wrap gap-1.5">
              {DRC_CITY_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setLat(preset.lat);
                    setLng(preset.lng);
                  }}
                  className="px-2.5 py-1 rounded-xl text-3xs font-medium bg-white/5 hover:bg-brand-primary/20 hover:text-brand-primary text-neutral-300 border border-white/5 transition-all"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Stylized DRC Map Canvas */}
          <div
            onClick={handleCanvasClick}
            className="relative w-full h-64 rounded-2xl bg-[#060D17] border border-white/15 overflow-hidden cursor-crosshair select-none group"
            title="Cliquez pour positionner la balise GPS"
          >
            {/* Grid Lines */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, #00F5D4 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Stylized DRC Geographic Landmark Labels */}
            <div className="absolute top-4 left-6 text-3xs font-mono text-neutral-500 pointer-events-none">
              Fleuve Congo / Océan Atlantique (12°E, 5°N)
            </div>
            <div className="absolute bottom-4 right-6 text-3xs font-mono text-neutral-500 pointer-events-none">
              Grands Lacs / Katanga (31°E, -13°S)
            </div>
            <div className="absolute top-1/2 left-8 text-2xs font-bold text-neutral-600 pointer-events-none">
              Kinshasa (RN1)
            </div>
            <div className="absolute bottom-8 right-16 text-2xs font-bold text-neutral-600 pointer-events-none">
              Lubumbashi (RN39)
            </div>

            {/* Pin Marker */}
            <div
              className="absolute -translate-x-1/2 -translate-y-full transition-all duration-150 pointer-events-none"
              style={{ left: `${pinLeftPct}%`, top: `${pinTopPct}%` }}
            >
              <div className="flex flex-col items-center">
                <span className="px-2 py-0.5 rounded-md text-3xs font-mono font-bold bg-brand-primary text-black shadow-lg">
                  {lat.toFixed(4)}, {lng.toFixed(4)}
                </span>
                <div className="w-3 h-3 bg-brand-primary rotate-45 -mt-1 shadow-md" />
              </div>
            </div>

            <div className="absolute bottom-2 left-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-xs text-3xs text-neutral-400 flex items-center gap-1 pointer-events-none">
              <Crosshair className="w-3 h-3 text-brand-primary animate-pulse" />
              Cliquez pour déplacer le repère
            </div>
          </div>

          {/* Coordinate Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-3xs uppercase font-bold text-neutral-400 block mb-1">
                Latitude (°N/°S)
              </label>
              <input
                type="number"
                step="0.0001"
                min="-14"
                max="6"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div>
              <label className="text-3xs uppercase font-bold text-neutral-400 block mb-1">
                Longitude (°E)
              </label>
              <input
                type="number"
                step="0.0001"
                min="11"
                max="32"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#091522] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-neutral-300 text-xs font-semibold"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl bg-brand-primary text-black font-bold text-xs hover:bg-brand-primary/90 flex items-center gap-1.5 shadow-lg shadow-brand-primary/20"
          >
            <Check className="w-4 h-4" />
            Valider la position GPS
          </button>
        </div>
      </div>
    </div>
  );
}

