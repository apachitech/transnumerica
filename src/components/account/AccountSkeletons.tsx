'use client';

import React from 'react';

export function ProfileHeaderSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 rounded-3xl p-6 shadow-sm space-y-4 animate-pulse">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="w-20 h-20 rounded-full bg-neutral-200 dark:bg-neutral-700 shrink-0" />
        <div className="flex-1 space-y-2 text-center sm:text-left w-full">
          <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-700 rounded-lg mx-auto sm:mx-0" />
          <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded-md mx-auto sm:mx-0" />
          <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
            <div className="h-5 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
            <div className="h-5 w-28 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <div className="h-12 bg-neutral-100 dark:bg-neutral-800 rounded-2xl" />
        <div className="h-12 bg-neutral-100 dark:bg-neutral-800 rounded-2xl" />
        <div className="h-12 bg-neutral-100 dark:bg-neutral-800 rounded-2xl" />
      </div>
    </div>
  );
}

export function TripCardsSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 rounded-3xl p-5 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-5 w-36 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
            <div className="h-5 w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
          </div>
          <div className="h-7 w-48 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
          <div className="h-12 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
          <div className="flex items-center justify-between pt-1">
            <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
            <div className="h-8 w-32 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PlacesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 rounded-2xl p-4 space-y-2"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-200 dark:bg-neutral-700 shrink-0" />
            <div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
          </div>
          <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-700 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function PaymentsSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-700 shrink-0" />
            <div className="space-y-1">
              <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
              <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
            </div>
          </div>
          <div className="h-6 w-16 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
        </div>
      ))}
    </div>
  );
}

