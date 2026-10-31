'use client';

import * as React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

export interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/90 dark:bg-emerald-950/80',
    error: 'border-red-300 dark:border-red-800 bg-red-50/90 dark:bg-red-950/80',
    warning: 'border-amber-300 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/80',
    info: 'border-sky-300 dark:border-sky-800 bg-sky-50/90 dark:bg-sky-950/80',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full max-w-sm rounded-xl p-3.5 border shadow-elevation-2 flex items-start gap-3 backdrop-blur-md animate-in slide-in-from-top-2 duration-200 ${borders[toast.type]}`}
    >
      <div className="pt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
          {toast.title}
        </h4>
        {toast.description && (
          <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5 leading-normal">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Fermer la notification"
        className="min-h-[48px] min-w-[48px] -mr-2 -mt-2 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
};
