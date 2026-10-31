'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const WelcomeOnboardingModal = dynamic(
  () => import('@/components/auth/WelcomeOnboardingModal').then((m) => m.WelcomeOnboardingModal),
  { ssr: false }
);

const AuthModal = dynamic(
  () => import('@/components/auth/AuthModal').then((m) => m.AuthModal),
  { ssr: false }
);

const VerifiedBadgeModal = dynamic(
  () => import('@/components/shared/VerifiedBadgeModal').then((m) => m.VerifiedBadgeModal),
  { ssr: false }
);

const HelpCenterModal = dynamic(
  () => import('@/components/shared/HelpCenterModal').then((m) => m.HelpCenterModal),
  { ssr: false }
);

const FloatingWhatsAppSupport = dynamic(
  () => import('@/components/shared/FloatingWhatsAppSupport').then((m) => m.FloatingWhatsAppSupport),
  { ssr: false }
);

export function ClientModals() {
  return (
    <>
      <WelcomeOnboardingModal />
      <AuthModal />
      <VerifiedBadgeModal />
      <HelpCenterModal />
      <FloatingWhatsAppSupport />
    </>
  );
}

