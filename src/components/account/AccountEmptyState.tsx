'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface AccountEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
  className?: string;
}

export function AccountEmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  actionHref,
  onActionClick,
  className = '',
}: AccountEmptyStateProps) {
  return (
    <div
      className={`bg-white dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-750 rounded-3xl p-8 text-center space-y-3.5 shadow-sm ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 mx-auto flex items-center justify-center">
        <Icon className="w-7 h-7" />
      </div>

      <div className="max-w-xs mx-auto space-y-1">
        <h3 className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white">
          {title}
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
          {description}
        </p>
      </div>

      {(actionText && (actionHref || onActionClick)) && (
        <div className="pt-2">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-900 hover:bg-primary-950 dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-neutral-950 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all active:scale-95"
            >
              <span>{actionText}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={onActionClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-900 hover:bg-primary-950 dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-neutral-950 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all active:scale-95"
            >
              <span>{actionText}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

