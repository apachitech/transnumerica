'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SafetyIncident } from '@/types';
import { AlertTriangle, Bell, BellOff, Volume2, VolumeX, ShieldAlert, ChevronRight, Activity } from 'lucide-react';

interface SafetyBannerProps {
  incidents: SafetyIncident[];
  onOpenIncident: (incident: SafetyIncident) => void;
}

export function SafetyBanner({ incidents, onOpenIncident }: SafetyBannerProps) {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  const openSosIncidents = incidents.filter(
    (inc) => inc.status === 'OPEN' && inc.type === 'SOS_TRIGGERED'
  );
  const openWarningIncidents = incidents.filter(
    (inc) =>
      inc.status === 'OPEN' &&
      (inc.type === 'ROUTE_DEVIATION' || inc.type === 'SPEED_ANOMALY')
  );

  const hasCriticalAlerts = openSosIncidents.length > 0;
  const hasAnyAlerts = hasCriticalAlerts || openWarningIncidents.length > 0;

  // Sound synthesis via Web Audio API (graceful, no external mp3 assets required)
  const playSiren = () => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          audioContextRef.current = new AudioCtx();
        }
      }

      const ctx = audioContextRef.current;
      if (!ctx || ctx.state === 'suspended') {
        ctx?.resume();
      }

      if (ctx && !oscillatorRef.current) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        // Beep pulsing
        gain.gain.setValueAtTime(0.08, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscillatorRef.current = osc;
        setIsPlaying(true);

        // Modulate frequency
        let high = true;
        const sirenInterval = setInterval(() => {
          if (!oscillatorRef.current || !ctx) {
            clearInterval(sirenInterval);
            return;
          }
          osc.frequency.setValueAtTime(high ? 960 : 640, ctx.currentTime);
          high = !high;
        }, 400);

        // Auto-stop after 10s if not acknowledged
        setTimeout(() => {
          clearInterval(sirenInterval);
          stopSiren();
        }, 10000);
      }
    } catch {
      // Audio not permitted without user interaction
    }
  };

  const stopSiren = () => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
    } catch {
      // Ignored
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    if (hasCriticalAlerts && audioEnabled && !isPlaying) {
      playSiren();
    } else if (!hasCriticalAlerts && isPlaying) {
      stopSiren();
    }
    return () => {
      stopSiren();
    };
  }, [hasCriticalAlerts, audioEnabled]);

  if (!hasAnyAlerts) {
    return null;
  }

  const primaryIncident = openSosIncidents[0] || openWarningIncidents[0];

  return (
    <aside
      aria-label="Bannière d'alerte sécurité"
      className={`relative z-30 w-full px-3 py-2.5 sm:px-4 sm:py-3 transition-colors shadow-lg ${
        hasCriticalAlerts
          ? 'bg-red-600/95 text-white animate-pulse border-b-2 border-red-400'
          : 'bg-amber-600/95 text-white border-b-2 border-amber-400'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-full bg-white/20 shrink-0">
            {hasCriticalAlerts ? (
              <ShieldAlert className="w-5 h-5 text-white animate-bounce" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xs uppercase tracking-wider px-2 py-0.5 rounded bg-black/40">
                {hasCriticalAlerts ? 'URGENCE SOS CRITIQUE' : 'VIGILANCE SÉCURITÉ'}
              </span>
              <span className="text-xs sm:text-sm font-semibold">
                {hasCriticalAlerts
                  ? `${openSosIncidents.length} alerte(s) SOS en cours d'intervention`
                  : `${openWarningIncidents.length} anomalie(s) détectée(s)`}
              </span>
            </div>
            {primaryIncident && (
              <p className="text-xs text-white/90 line-clamp-1 mt-0.5">
                {primaryIncident.riderName} ({primaryIncident.city}) • Course {primaryIncident.rideReference} • {primaryIncident.location.address}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Siren sound control */}
          <button
            type="button"
            onClick={() => {
              const next = !audioEnabled;
              setAudioEnabled(next);
              if (!next) stopSiren();
              else if (hasCriticalAlerts) playSiren();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border transition ${
              audioEnabled
                ? 'bg-white text-red-700 border-white font-bold'
                : 'bg-black/30 text-white/90 border-white/30 hover:bg-black/40'
            }`}
            title={audioEnabled ? 'Désactiver la sirène audio' : 'Activer la sirène audio'}
          >
            {audioEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>Sirène ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Sirène OFF</span>
              </>
            )}
          </button>

          {/* Action button to open incident */}
          {primaryIncident && (
            <button
              type="button"
              onClick={() => onOpenIncident(primaryIncident)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded bg-neutral-950 text-white hover:bg-neutral-900 border border-neutral-700 shadow-sm"
            >
              <span>Prendre en charge</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

