'use client';

import React, { useState } from 'react';
import {
  Armchair,
  DoorClosed,
  UserCheck,
  Ban,
  Sparkles,
  Accessibility,
  Save,
  RotateCcw,
  Plus,
  Minus,
} from 'lucide-react';
import { CatalogBusLayout, LayoutCell, LayoutCellType, SeatTier } from '@/types';

interface Props {
  initialLayout?: CatalogBusLayout | null;
  onSave: (layoutData: {
    name: string;
    vehicleTypeId: string;
    rows: number;
    columns: number;
    cells: LayoutCell[];
  }) => void;
  onCancel?: () => void;
}

export function SeatMapEditor({ initialLayout, onSave, onCancel }: Props) {
  const [name, setName] = useState(
    initialLayout?.name || 'Scania Touring 54 Sièges (2x2 VIP + WC)'
  );
  const [vehicleTypeId, setVehicleTypeId] = useState(
    initialLayout?.vehicleTypeId || 'vt-coach54'
  );
  const [rows, setRows] = useState(initialLayout?.rows || 14);
  const [columns, setColumns] = useState(initialLayout?.columns || 4);

  // Default cells initialization if not present
  const initializeDefaultCells = (numRows: number, numCols: number): LayoutCell[] => {
    const list: LayoutCell[] = [];
    // Row 0: Driver & Door
    list.push({ row: 0, col: 0, type: 'DRIVER' });
    list.push({ row: 0, col: 1, type: 'AISLE' });
    if (numCols > 2) list.push({ row: 0, col: 2, type: 'AISLE' });
    if (numCols > 3) list.push({ row: 0, col: 3, type: 'DOOR' });

    for (let r = 1; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        if (c === Math.floor(numCols / 2)) {
          list.push({ row: r, col: c, type: 'AISLE' });
        } else if (r === numRows - 1 && c === numCols - 1) {
          list.push({ row: r, col: c, type: 'TOILET' });
        } else {
          const colLetter = String.fromCharCode(65 + (c > Math.floor(numCols / 2) ? c - 1 : c));
          const isVip = r <= 3;
          const isPmr = r === 1 && c === 0;
          list.push({
            row: r,
            col: c,
            type: 'SEAT',
            seatNumber: `${r}${colLetter}`,
            seatTier: isPmr ? 'PMR' : isVip ? 'VIP' : 'STANDARD',
            isBlocked: false,
          });
        }
      }
    }
    return list;
  };

  const [cells, setCells] = useState<LayoutCell[]>(
    initialLayout?.cells || initializeDefaultCells(rows, columns)
  );

  const [selectedTool, setSelectedTool] = useState<
    'STANDARD' | 'VIP' | 'PMR' | 'BLOCKED' | 'AISLE' | 'TOILET' | 'DOOR'
  >('STANDARD');

  // Stats calculation
  const seats = cells.filter((c) => c.type === 'SEAT');
  const vipCount = seats.filter((c) => c.seatTier === 'VIP').length;
  const pmrCount = seats.filter((c) => c.seatTier === 'PMR').length;
  const blockedCount = seats.filter((c) => c.isBlocked).length;
  const standardCount = seats.length - vipCount - pmrCount;

  const handleCellClick = (r: number, c: number) => {
    setCells((prev) => {
      const copy = [...prev];
      const idx = copy.findIndex((cell) => cell.row === r && cell.col === c);

      let newCell: LayoutCell;
      if (selectedTool === 'AISLE') {
        newCell = { row: r, col: c, type: 'AISLE' };
      } else if (selectedTool === 'TOILET') {
        newCell = { row: r, col: c, type: 'TOILET' };
      } else if (selectedTool === 'DOOR') {
        newCell = { row: r, col: c, type: 'DOOR' };
      } else if (selectedTool === 'BLOCKED') {
        newCell = {
          row: r,
          col: c,
          type: 'SEAT',
          seatNumber: `${r}${String.fromCharCode(65 + c)}`,
          seatTier: 'STANDARD',
          isBlocked: true,
          blockReason: 'Condamné / Réservé régulation',
        };
      } else {
        newCell = {
          row: r,
          col: c,
          type: 'SEAT',
          seatNumber: `${r}${String.fromCharCode(65 + c)}`,
          seatTier: selectedTool as SeatTier,
          isBlocked: false,
        };
      }

      if (idx >= 0) {
        copy[idx] = newCell;
      } else {
        copy.push(newCell);
      }
      return copy;
    });
  };

  const handleReset = () => {
    setCells(initializeDefaultCells(rows, columns));
  };

  const handleSaveClick = () => {
    onSave({
      name: name.trim(),
      vehicleTypeId,
      rows,
      columns,
      cells,
    });
  };

  return (
    <div
      data-testid="seat-map-editor"
      className="p-4 sm:p-6 rounded-3xl bg-[#0D1E32] border border-white/10 space-y-5"
    >
      {/* Editor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Armchair className="w-5 h-5 text-brand-primary" />
            Éditeur Visuel de Cabine & Plan de Sièges
          </h3>
          <p className="text-2xs text-neutral-400 mt-0.5">
            Configurez la disposition des rangées, allées, sièges VIP et accès PMR pour la billetterie voyageur.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-neutral-300 text-xs font-semibold"
            >
              Annuler
            </button>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold flex items-center gap-1.5"
            title="Réinitialiser la grille"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réinitialiser
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            className="px-4 py-2 rounded-xl bg-brand-primary text-black font-bold text-xs hover:bg-brand-primary/90 flex items-center gap-1.5 shadow-lg shadow-brand-primary/20"
          >
            <Save className="w-4 h-4" />
            Enregistrer le plan
          </button>
        </div>
      </div>

      {/* Configuration Inputs & KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2">
          <label className="text-3xs uppercase tracking-wider font-bold text-neutral-400 block mb-1">
            Intitulé de la configuration
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder="Ex: Scania Touring 54 Sièges (2x2 VIP + WC)"
          />
        </div>

        <div>
          <label className="text-3xs uppercase tracking-wider font-bold text-neutral-400 block mb-1">
            Catégorie d’Autocar
          </label>
          <select
            value={vehicleTypeId}
            onChange={(e) => setVehicleTypeId(e.target.value)}
            className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="vt-coach54">Autocar Grand Tourisme (54 places)</option>
            <option value="vt-coach60">Autocar Standard (60 places)</option>
            <option value="vt-mini16">Minibus Express HiAce (16 places)</option>
          </select>
        </div>

        {/* Live Counters */}
        <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-around text-center">
          <div>
            <span className="text-3xs text-neutral-400 block uppercase">Total</span>
            <span className="text-lg font-black text-white">{seats.length}</span>
          </div>
          <div>
            <span className="text-3xs text-amber-400 block uppercase">VIP</span>
            <span className="text-lg font-black text-amber-400">{vipCount}</span>
          </div>
          <div>
            <span className="text-3xs text-purple-400 block uppercase">PMR</span>
            <span className="text-lg font-black text-purple-400">{pmrCount}</span>
          </div>
          <div>
            <span className="text-3xs text-rose-400 block uppercase">Bloqués</span>
            <span className="text-lg font-black text-rose-400">{blockedCount}</span>
          </div>
        </div>
      </div>

      {/* Palette Toolbar */}
      <div className="p-3 rounded-2xl bg-[#091522] border border-white/10 flex items-center gap-2 flex-wrap">
        <span className="text-3xs uppercase tracking-wider font-bold text-neutral-400 mr-2">
          Outil actif :
        </span>
        {[
          { id: 'STANDARD', label: 'Siège Standard', icon: Armchair, color: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300' },
          { id: 'VIP', label: 'Siège VIP', icon: Sparkles, color: 'border-amber-500/50 bg-amber-950/40 text-amber-300' },
          { id: 'PMR', label: 'Accès PMR', icon: Accessibility, color: 'border-purple-500/50 bg-purple-950/40 text-purple-300' },
          { id: 'BLOCKED', label: 'Condamné / Bloqué', icon: Ban, color: 'border-rose-500/50 bg-rose-950/40 text-rose-300' },
          { id: 'AISLE', label: 'Allée centrale', icon: Minus, color: 'border-white/20 bg-white/5 text-neutral-400' },
          { id: 'TOILET', label: 'Toilettes (WC)', icon: DoorClosed, color: 'border-blue-500/50 bg-blue-950/40 text-blue-300' },
          { id: 'DOOR', label: 'Porte d’accès', icon: UserCheck, color: 'border-amber-500/50 bg-amber-950/40 text-amber-300' },
        ].map((tool) => {
          const Icon = tool.icon;
          const isSelected = selectedTool === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => setSelectedTool(tool.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                isSelected
                  ? 'ring-2 ring-brand-primary scale-105 shadow-md ' + tool.color
                  : 'bg-white/5 border-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tool.label}
            </button>
          );
        })}
      </div>

      {/* Visual Bus Cabin Canvas */}
      <div className="p-6 rounded-3xl bg-[#060D17] border border-white/10 flex flex-col items-center overflow-x-auto select-none">
        <div className="w-full max-w-sm border-2 border-white/20 rounded-3xl p-4 bg-[#0A1624] relative shadow-2xl">
          {/* Front Cabin Windshield Header */}
          <div className="w-full h-8 rounded-t-2xl bg-gradient-to-b from-brand-primary/20 to-transparent border-b border-white/10 flex items-center justify-center text-3xs font-mono text-brand-primary uppercase tracking-widest mb-4">
            ▲ Avant Autocar (Pare-brise RN1) ▲
          </div>

          {/* Grid Layout */}
          <div className="space-y-2">
            {Array.from({ length: rows }).map((_, r) => (
              <div key={r} className="flex items-center justify-between gap-1.5">
                {Array.from({ length: columns }).map((_, c) => {
                  const cell = cells.find((item) => item.row === r && item.col === c);
                  const isDriver = cell?.type === 'DRIVER';
                  const isDoor = cell?.type === 'DOOR';
                  const isToilet = cell?.type === 'TOILET';
                  const isAisle = cell?.type === 'AISLE';
                  const isSeat = cell?.type === 'SEAT';
                  const isBlocked = cell?.isBlocked;
                  const isVip = cell?.seatTier === 'VIP';
                  const isPmr = cell?.seatTier === 'PMR';

                  if (isDriver) {
                    return (
                      <div
                        key={c}
                        onClick={() => handleCellClick(r, c)}
                        className="w-12 h-10 rounded-xl bg-brand-primary/20 border border-brand-primary/50 text-brand-primary flex items-center justify-center text-3xs font-bold font-mono cursor-pointer"
                        title="Chauffeur"
                      >
                        VOLANT
                      </div>
                    );
                  }

                  if (isDoor) {
                    return (
                      <div
                        key={c}
                        onClick={() => handleCellClick(r, c)}
                        className="w-12 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center text-3xs font-bold cursor-pointer"
                        title="Porte d’accès"
                      >
                        PORTE
                      </div>
                    );
                  }

                  if (isToilet) {
                    return (
                      <div
                        key={c}
                        onClick={() => handleCellClick(r, c)}
                        className="w-12 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 flex items-center justify-center text-3xs font-bold cursor-pointer"
                        title="Toilettes"
                      >
                        WC
                      </div>
                    );
                  }

                  if (isAisle) {
                    return (
                      <div
                        key={c}
                        onClick={() => handleCellClick(r, c)}
                        className="w-8 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
                        title="Allée centrale"
                      >
                        <span className="text-3xs text-neutral-600 font-mono">|</span>
                      </div>
                    );
                  }

                  // Standard / VIP / PMR / Blocked Seat
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleCellClick(r, c)}
                      className={`w-12 h-10 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isBlocked
                          ? 'bg-rose-950/60 border-rose-500/60 text-rose-300 line-through'
                          : isPmr
                          ? 'bg-purple-950/80 border-purple-500/80 text-purple-200 ring-1 ring-purple-400'
                          : isVip
                          ? 'bg-amber-950/80 border-amber-500/80 text-amber-200 ring-1 ring-amber-400'
                          : 'bg-[#0F243A] border-white/20 text-neutral-200 hover:border-brand-primary'
                      }`}
                      title={`Siège ${cell?.seatNumber || `${r}-${c}`}`}
                    >
                      <Armchair className="w-3.5 h-3.5" />
                      <span className="text-3xs font-mono font-bold mt-0.5">
                        {cell?.seatNumber || `${r}${c}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Rear Bus Footer */}
          <div className="w-full h-4 rounded-b-2xl border-t border-white/10 mt-4 flex items-center justify-center text-3xs text-neutral-600 font-mono">
            Moteur Arrière
          </div>
        </div>
      </div>
    </div>
  );
}

