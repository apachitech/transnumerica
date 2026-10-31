'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/lib/store';
import { MapPin, Navigation, Compass, AlertCircle, Shield, Radio } from 'lucide-react';

interface RideMapProps {
  pickupName: string;
  dropoffName: string;
  driverName?: string;
  vehiclePlate?: string;
  vehicleType?: 'CAR' | 'MOTO';
  etaMinutes?: number;
  status?: 'SEARCHING' | 'OFFERED' | 'ARRIVING' | 'IN_PROGRESS' | 'COMPLETED' | string;
  isNight?: boolean;
  className?: string;
}

export function RideMap({
  pickupName,
  dropoffName,
  driverName,
  vehiclePlate,
  vehicleType = 'MOTO',
  etaMinutes = 4,
  status = 'ARRIVING',
  isNight = false,
  className = '',
}: RideMapProps) {
  const { dataSaver } = useApp();
  const [progress, setProgress] = useState(30);

  useEffect(() => {
    // Smooth simulation progression when active
    if (status === 'IN_PROGRESS') {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 40 : prev + 4));
      }, 2500);
      return () => clearInterval(interval);
    } else if (status === 'ARRIVING') {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 60 ? 20 : prev + 5));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const isSearching = status === 'SEARCHING' || status === 'OFFERED';
  const hasHeight = /(?:^|\s)h-(?:\[|\d|full|screen|auto|vh)/.test(className);
  const defaultHeight = hasHeight ? '' : 'h-52 sm:h-60 min-h-[200px]';

  return (
    <div
      className={`relative w-full overflow-hidden bg-slate-900 border border-slate-800 shadow-inner select-none ${defaultHeight} ${className}`}
    >
      {/* Background Stylized Map Canvas */}
      <div className="absolute inset-0 bg-[#0B1524]">
        {/* Street Map Grid & Water Body (Fleuve Congo representation) */}
        <svg
          className="w-full h-full opacity-40"
          preserveAspectRatio="none"
          viewBox="0 0 500 500"
        >
          {/* Congo River Flow */}
          <path
            d="M -20 220 Q 180 180 290 260 T 520 210"
            fill="none"
            stroke="#0284c7"
            strokeWidth="28"
          />
          {/* Major Avenues (Boulevard du 30 Juin, Avenue Kasa-Vubu, etc.) */}
          <path
            d="M 50 -20 Q 200 160 250 520"
            fill="none"
            stroke="#334155"
            strokeWidth="10"
          />
          <path
            d="M -20 120 L 520 120"
            fill="none"
            stroke="#1e293b"
            strokeWidth="6"
          />
          <path
            d="M -20 380 L 520 380"
            fill="none"
            stroke="#1e293b"
            strokeWidth="6"
          />
          <path
            d="M 140 -20 L 140 520"
            fill="none"
            stroke="#1e293b"
            strokeWidth="6"
          />
          <path
            d="M 360 -20 L 360 520"
            fill="none"
            stroke="#1e293b"
            strokeWidth="6"
          />
        </svg>

        {/* Realistic Street Landmark Labels */}
        <div className="absolute top-4 left-6 pointer-events-none opacity-40 text-[10px] font-mono tracking-widest text-slate-400 uppercase">
          Kinshasa • Gombe / Kasa-Vubu
        </div>
        <div className="absolute bottom-6 left-6 pointer-events-none opacity-30 text-[9px] font-mono text-cyan-400">
          ~ Fleuve Congo (Port Fluvial)
        </div>
        <div className="absolute top-1/4 right-8 pointer-events-none opacity-30 text-[9px] font-mono text-slate-400 rotate-12">
          Blvd du 30 Juin
        </div>
      </div>

      {/* ---------------- 1. ANIMATED RADAR OVERLAY (SEARCHING STATE) ---------------- */}
      {isSearching && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Concentric radar pulse rings */}
          <div className="absolute w-72 h-72 rounded-full border border-amber-400/20 animate-ping" />
          <div className="absolute w-52 h-52 rounded-full border border-amber-400/30 animate-pulse" />
          <div className="absolute w-32 h-32 rounded-full border border-amber-400/40" />

          {/* Radar Sweep Rotating Beam */}
          <div className="absolute w-64 h-64 rounded-full border border-amber-500/10 overflow-hidden animate-spin [animation-duration:4s]">
            <div className="w-1/2 h-1/2 bg-gradient-to-br from-amber-400/30 via-amber-400/5 to-transparent rounded-tl-full" />
          </div>

          {/* Nearby Driver Pings */}
          <div className="absolute -translate-x-16 -translate-y-12 animate-pulse">
            <span className="inline-flex items-center justify-center p-1.5 rounded-full bg-slate-800/90 border border-amber-400 text-xs shadow-lg">
              {vehicleType === 'MOTO' ? '🏍️' : '🚗'}
            </span>
          </div>
          <div className="absolute translate-x-20 translate-y-8 animate-pulse [animation-delay:600ms]">
            <span className="inline-flex items-center justify-center p-1.5 rounded-full bg-slate-800/90 border border-amber-400 text-xs shadow-lg">
              {vehicleType === 'MOTO' ? '🏍️' : '🚗'}
            </span>
          </div>
          <div className="absolute translate-x-10 -translate-y-20 animate-pulse [animation-delay:1200ms]">
            <span className="inline-flex items-center justify-center p-1.5 rounded-full bg-slate-800/90 border border-amber-400 text-xs shadow-lg">
              {vehicleType === 'MOTO' ? '🏍️' : '🚗'}
            </span>
          </div>
        </div>
      )}

      {/* ---------------- 2. ROUTE TRACK & VECTOR ---------------- */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <svg className="w-full h-full max-w-lg max-h-72" viewBox="0 0 380 220">
          {/* Route path background glow */}
          <path
            d="M 60 160 C 130 160, 200 80, 310 60"
            fill="none"
            stroke="#0284c7"
            strokeWidth="8"
            className="opacity-30"
          />

          {/* Main animated route track */}
          <path
            d="M 60 160 C 130 160, 200 80, 310 60"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="4"
            strokeDasharray="6 4"
            className="opacity-80"
          />

          {/* Pickup Point (Green Marker) */}
          <g transform="translate(60, 160)">
            <circle r="12" fill="#10B981" className="opacity-25 animate-ping" />
            <circle r="7" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
          </g>

          {/* Dropoff Point (Amber Checkered Destination Marker) */}
          <g transform="translate(310, 60)">
            <circle r="12" fill="#F59E0B" className="opacity-25" />
            <circle r="7" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
          </g>

          {/* Animated Driver Marker (when active or arrived) */}
          {!isSearching && (
            <g
              style={{
                transform: `translate(${60 + (progress / 100) * 250}px, ${
                  160 - (progress / 100) * 100
                }px)`,
                transition: 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <circle r="16" fill="#F59E0B" className="animate-ping opacity-30" />
              <circle r="12" fill="#F59E0B" stroke="#0F172A" strokeWidth="2.5" />
              <text
                y="4.5"
                textAnchor="middle"
                fontSize="11"
                fontWeight="bold"
                fill="#0F172A"
              >
                {vehicleType === 'MOTO' ? '🏍️' : '🚗'}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* ---------------- 3. FLOATING BADGES OVER MAP ---------------- */}
      {/* Pickup & Destination chips top overlay */}
      <div className="absolute top-3 inset-x-3 sm:inset-x-6 flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white text-[11px] font-bold shadow-lg truncate max-w-[55%]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
          <span className="truncate">{pickupName}</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-amber-300 text-[11px] font-bold shadow-lg truncate max-w-[42%] text-right justify-end">
          <span className="truncate">{dropoffName}</span>
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
        </div>
      </div>

      {/* Floating Status / Live ETA Pill */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 pointer-events-none">
        {status === 'AVAILABLE' && (
          <div className="px-3 py-1 rounded-full bg-slate-800/90 text-emerald-400 border border-emerald-400/40 font-bold text-xs shadow-lg flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>Itinéraire calculé • ~{etaMinutes} min d&apos;approche</span>
          </div>
        )}
        {status === 'ARRIVING' && (
          <div className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5 animate-bounce">
            <Navigation className="w-3.5 h-3.5" />
            <span>Chauffeur en route • {etaMinutes} min</span>
          </div>
        )}
        {status === 'IN_PROGRESS' && (
          <div className="px-3 py-1 rounded-full bg-sky-500 text-white font-black text-xs shadow-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>Course en cours vers destination</span>
          </div>
        )}
        {isSearching && (
          <div className="px-3 py-1 rounded-full bg-slate-800/90 text-amber-300 border border-amber-400/40 font-bold text-xs shadow-lg flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Radar de détection actif</span>
          </div>
        )}
      </div>

      {/* Night Overlay */}
      {isNight && (
        <div className="absolute inset-0 bg-indigo-950/40 pointer-events-none" />
      )}
    </div>
  );
}
