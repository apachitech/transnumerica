'use client';

import React, { useState } from 'react';
import { AdminRide, OnlineDriver } from '@/types';
import {
  Car,
  Bike,
  Shield,
  MapPin,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Navigation,
  AlertOctagon,
  Radio,
} from 'lucide-react';

interface RideLiveMapProps {
  rides: AdminRide[];
  drivers: OnlineDriver[];
  selectedCity: string;
  onSelectRide: (ride: AdminRide) => void;
  selectedRideId?: string;
  className?: string;
}

export function RideLiveMap({
  rides,
  drivers,
  selectedCity,
  onSelectRide,
  selectedRideId,
  className = '',
}: RideLiveMapProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showDrivers, setShowDrivers] = useState(true);
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);

  // Filter rides and drivers for the map
  const activeCity = selectedCity === 'ALL' ? 'Kinshasa' : selectedCity;

  const cityRides = rides.filter(
    (r) =>
      r.status !== 'CANCELLED' &&
      r.status !== 'COMPLETED' &&
      (selectedCity === 'ALL' || r.city.toLowerCase() === selectedCity.toLowerCase())
  );

  const cityDrivers = drivers.filter(
    (d) => selectedCity === 'ALL' || d.city.toLowerCase() === selectedCity.toLowerCase()
  );

  // Map coordinates projection for Congolese cities (Normalized 0-100% space)
  const getCityCoordinates = (
    lat: number,
    lng: number,
    city: string
  ): { x: number; y: number } => {
    if (city.toLowerCase().includes('lubumbashi')) {
      // Lubumbashi bounds approx: lat -11.69 to -11.62, lng 27.43 to 27.52
      const x = ((lng - 27.43) / 0.09) * 80 + 10;
      const y = ((-11.62 - lat) / 0.07) * 75 + 12;
      return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
    }

    if (city.toLowerCase().includes('goma')) {
      // Goma bounds approx: lat -1.71 to -1.65, lng 29.20 to 29.26
      const x = ((lng - 29.2) / 0.06) * 80 + 10;
      const y = ((-1.65 - lat) / 0.06) * 75 + 12;
      return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
    }

    // Default Kinshasa: lat -4.42 to -4.28, lng 15.22 to 15.45
    const x = ((lng - 15.22) / 0.23) * 80 + 10;
    const y = ((-4.28 - lat) / 0.14) * 75 + 12;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl select-none min-h-[340px] sm:min-h-[460px] ${className}`}
    >
      {/* Top Map Overlay Info & Controls */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 shadow">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            Radar Opérations • {activeCity}
          </span>
          <span className="text-[10px] text-slate-400 border-l border-slate-700 pl-2">
            {cityRides.length} active(s) • {cityDrivers.length} chauffeur(s)
          </span>
        </div>

        {/* Map Toolbars */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => setShowDrivers(!showDrivers)}
            className={`p-1.5 rounded-md text-xs font-medium border shadow backdrop-blur transition ${
              showDrivers
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Afficher / Masquer les chauffeurs"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.15))}
            className="p-1.5 rounded-md bg-slate-900/90 text-slate-200 border border-slate-700 hover:bg-slate-800 shadow"
            title="Zoom avant"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.15))}
            className="p-1.5 rounded-md bg-slate-900/90 text-slate-200 border border-slate-700 hover:bg-slate-800 shadow"
            title="Zoom arrière"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Map Container with zoom transform */}
      <div
        className="w-full h-full min-h-[340px] sm:min-h-[460px] relative transition-transform duration-300 ease-out"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
      >
        {/* Stylized DR Congo Geographic Background */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.75" />
            </pattern>
            {/* Congo River Flow Graphic */}
            <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Stylized River Path (Fleuve Congo / Lac Kivu) */}
          <path
            d="M 0,35 Q 25,25 45,40 T 80,30 T 100,50 L 100,0 L 0,0 Z"
            fill="url(#riverGrad)"
          />

          {/* Urban Road Arteries (Boulevard du 30 Juin, Lumumba, By-Pass) */}
          <path
            d="M 10,25 L 90,75 M 15,80 L 85,30 M 45,10 L 55,90"
            stroke="#334155"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />
        </svg>

        {/* Landmarks Labels */}
        <div className="absolute top-[18%] left-[18%] text-[10px] font-bold text-slate-500 tracking-wider pointer-events-none uppercase">
          {activeCity === 'Kinshasa' && 'Gombe • Gare Centrale'}
          {activeCity === 'Lubumbashi' && 'Centre-Ville • Gare SNCC'}
          {activeCity === 'Goma' && 'Les Volcans • Lac Kivu'}
        </div>
        <div className="absolute bottom-[20%] right-[16%] text-[10px] font-bold text-slate-500 tracking-wider pointer-events-none uppercase">
          {activeCity === 'Kinshasa' && 'Aéroport Int. N’djili'}
          {activeCity === 'Lubumbashi' && 'Golf Météo • Ruashi'}
          {activeCity === 'Goma' && 'Aéroport de Goma'}
        </div>

        {/* Render Active Rides Traces & Markers */}
        {cityRides.map((ride) => {
          const pickupPos = getCityCoordinates(ride.pickup.lat, ride.pickup.lng, ride.city);
          const dropoffPos = getCityCoordinates(ride.dropoff.lat, ride.dropoff.lng, ride.city);
          const currPos = ride.currentLocation
            ? getCityCoordinates(ride.currentLocation.lat, ride.currentLocation.lng, ride.city)
            : pickupPos;

          const isSelected = selectedRideId === ride.id;
          const isEmergency = ride.hasSosAlert || ride.hasDeviationAlert || ride.hasSpeedAlert;

          return (
            <React.Fragment key={ride.id}>
              {/* Route connecting line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <line
                  x1={`${pickupPos.x}%`}
                  y1={`${pickupPos.y}%`}
                  x2={`${dropoffPos.x}%`}
                  y2={`${dropoffPos.y}%`}
                  stroke={isEmergency ? '#ef4444' : isSelected ? '#3b82f6' : '#64748b'}
                  strokeWidth={isSelected ? 3 : 2}
                  strokeDasharray="5,5"
                  className={isSelected ? 'animate-pulse' : ''}
                />
              </svg>

              {/* Pickup Marker A */}
              <div
                style={{ left: `${pickupPos.x}%`, top: `${pickupPos.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-auto cursor-pointer"
                onClick={() => onSelectRide(ride)}
                title={`Départ: ${ride.pickup.address}`}
              >
                <div className="w-5 h-5 rounded-full bg-emerald-600 border-2 border-white shadow flex items-center justify-center text-[10px] font-black text-white">
                  A
                </div>
              </div>

              {/* Dropoff Marker B */}
              <div
                style={{ left: `${dropoffPos.x}%`, top: `${dropoffPos.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-auto cursor-pointer"
                onClick={() => onSelectRide(ride)}
                title={`Destination: ${ride.dropoff.address}`}
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow flex items-center justify-center text-[10px] font-black text-white">
                  B
                </div>
              </div>

              {/* Current Vehicle Position Marker */}
              <div
                style={{ left: `${currPos.x}%`, top: `${currPos.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto cursor-pointer group"
                onClick={() => onSelectRide(ride)}
              >
                {/* Emergency Pulsing Halo */}
                {isEmergency && (
                  <div className="absolute -inset-2.5 rounded-full bg-red-500/50 animate-ping" />
                )}

                <div
                  className={`relative p-2 rounded-full border-2 shadow-xl transition-transform ${
                    isEmergency
                      ? 'bg-red-600 text-white border-white scale-125 animate-bounce'
                      : isSelected
                        ? 'bg-blue-600 text-white border-white scale-115'
                        : 'bg-slate-900 text-blue-400 border-blue-500 hover:scale-110'
                  }`}
                >
                  {isEmergency ? (
                    <AlertOctagon className="w-4 h-4" />
                  ) : ride.serviceType === 'MOTO' ? (
                    <Bike className="w-4 h-4" />
                  ) : (
                    <Car className="w-4 h-4" />
                  )}
                </div>

                {/* Hover Tooltip Card */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none min-w-[170px]">
                  <div className="bg-slate-900/95 border border-slate-700 text-slate-100 p-2 rounded-lg shadow-xl text-xs space-y-1 backdrop-blur-md">
                    <div className="flex items-center justify-between gap-2 font-bold">
                      <span className="text-blue-400">{ride.reference}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {ride.serviceType}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-1">{ride.riderName}</p>
                    <p className="text-[10px] text-slate-400">
                      Chauffeur : {ride.driverName || 'En attente'} ({ride.vehiclePlate || 'N/A'})
                    </p>
                    {ride.currentLocation?.speedKmh !== undefined && (
                      <p className="text-[10px] text-emerald-400 font-semibold">
                        Vitesse : {ride.currentLocation.speedKmh} km/h
                      </p>
                    )}
                  </div>
                  <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700" />
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {/* Render Online Drivers Markers (if enabled) */}
        {showDrivers &&
          cityDrivers.map((driver) => {
            const pos = getCityCoordinates(
              driver.currentLocation.lat,
              driver.currentLocation.lng,
              driver.city
            );

            // Skip if this driver is already represented by an active ride marker
            if (driver.activeRideId && cityRides.some((r) => r.id === driver.activeRideId)) {
              return null;
            }

            return (
              <div
                key={driver.id}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-15 pointer-events-auto cursor-pointer group"
                title={`${driver.name} • ${driver.vehiclePlate}`}
              >
                <div
                  className={`p-1.5 rounded-full border shadow transition-transform ${
                    driver.status === 'ONLINE'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-500 hover:scale-115'
                      : 'bg-slate-800 text-slate-400 border-slate-600'
                  }`}
                >
                  {driver.vehicleType === 'MOTO' ? (
                    <Bike className="w-3.5 h-3.5" />
                  ) : driver.vehicleType === 'VIP' ? (
                    <Shield className="w-3.5 h-3.5" />
                  ) : (
                    <Car className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Tooltip on Driver Hover */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex flex-col items-center z-30 pointer-events-none min-w-[140px]">
                  <div className="bg-slate-900 border border-slate-700 p-1.5 rounded text-[11px] text-slate-200 shadow">
                    <p className="font-bold text-emerald-400">{driver.name}</p>
                    <p className="text-[10px] text-slate-400">{driver.vehicleModel}</p>
                    <p className="text-[10px] text-slate-300">
                      ★ {driver.rating} • {driver.status === 'ONLINE' ? 'Disponible' : 'Occupé'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Map Legend Overlay at Bottom */}
      <div className="absolute bottom-2.5 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none text-[11px] text-slate-300">
        <div className="flex flex-wrap items-center gap-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 shadow pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Course Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Chauffeur Dispo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-red-400 font-bold">Alerte SOS / Déviation</span>
          </div>
        </div>

        <div className="hidden sm:block text-[10px] text-slate-500">
          Système Télématique Transnumerica GPS v2.4
        </div>
      </div>
    </div>
  );
}

