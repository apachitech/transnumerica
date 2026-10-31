'use client';

import React, { useState } from 'react';
import {
  X,
  History,
  FileText,
  Sliders,
  Edit,
  Trash2,
  RotateCcw,
  ShieldAlert,
  Clock,
  User,
  CheckCircle,
} from 'lucide-react';

export interface DetailField {
  label: string;
  value: React.ReactNode;
  span?: 1 | 2;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  adminName: string;
  action: string;
  details?: Record<string, any>;
}

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  statusBadge?: React.ReactNode;
  fields: DetailField[];
  auditHistory?: AuditRecord[];
  onEdit?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  isDeleted?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canRestore?: boolean;
  version?: number;
}

export function DetailDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  statusBadge,
  fields,
  auditHistory = [],
  onEdit,
  onDelete,
  onRestore,
  isDeleted = false,
  canEdit = true,
  canDelete = true,
  canRestore = true,
  version,
}: DetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'audit' | 'actions'>('details');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
      {/* Backdrop */}
      <div
        role="presentation"
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0A1A2E] border-l border-white/15 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-start justify-between gap-3 bg-[#081524]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">{title}</h2>
                {statusBadge}
              </div>
              {subtitle && <p className="text-xs text-neutral-400">{subtitle}</p>}
              {version !== undefined && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-2xs font-mono text-neutral-300">
                  <span>Version v{version}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              aria-label="Fermer le panneau latéral"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-white/10 bg-[#071321] px-4 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`py-3 px-3 font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'details'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Détails</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`py-3 px-3 font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'audit'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Audit & Historique ({auditHistory.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('actions')}
              className={`py-3 px-3 font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'actions'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Actions</span>
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {activeTab === 'details' && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                {fields.map((f, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl bg-[#081524] border border-white/10 space-y-1 ${
                      f.span === 2 ? 'col-span-2' : 'col-span-1'
                    }`}
                  >
                    <div className="text-2xs font-black uppercase text-neutral-400 tracking-wider">
                      {f.label}
                    </div>
                    <div className="text-neutral-200 font-medium break-words">
                      {f.value ?? '—'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="space-y-3">
                {auditHistory.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400">
                    Aucun historique d’audit spécifique enregistré pour cet élément.
                  </div>
                ) : (
                  auditHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-[#081524] border border-white/10 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between text-2xs text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{item.timestamp}</span>
                        </span>
                        <span className="font-mono text-neutral-300">{item.action}</span>
                      </div>
                      <div className="flex items-center gap-1 font-bold text-white">
                        <User className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{item.adminName}</span>
                      </div>
                      {item.details && (
                        <pre className="p-2 rounded-lg bg-black/40 text-2xs text-neutral-300 font-mono overflow-x-auto">
                          {JSON.stringify(item.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'actions' && (
              <div className="space-y-3">
                {isDeleted ? (
                  canRestore && onRestore && (
                    <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 space-y-2">
                      <div className="text-xs font-bold text-emerald-200">
                        Élément actuellement archivé dans la corbeille
                      </div>
                      <p className="text-2xs text-neutral-400">
                        Restaurer cet élément le rendra immédiatement actif et visible dans les opérations.
                      </p>
                      <button
                        type="button"
                        onClick={onRestore}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Restaurer l’enregistrement</span>
                      </button>
                    </div>
                  )
                ) : (
                  <>
                    {canEdit && onEdit && (
                      <button
                        type="button"
                        onClick={onEdit}
                        className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black flex items-center justify-center gap-2 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Modifier cet enregistrement</span>
                      </button>
                    )}

                    {canDelete && onDelete && (
                      <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 space-y-2">
                        <div className="text-xs font-bold text-red-200">Zone de suppression douce</div>
                        <p className="text-2xs text-neutral-400">
                          L'archivage déplacera cet élément vers la corbeille avec motif obligatoire et traçabilité d'audit.
                        </p>
                        <button
                          type="button"
                          onClick={onDelete}
                          className="w-full py-2 px-3 rounded-xl bg-red-900/80 hover:bg-red-800 text-red-100 text-xs font-black flex items-center justify-center gap-2 border border-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Archiver dans la corbeille</span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

