import React from 'react';
import type { Metadata } from 'next';
import { TicketDetailPageClient } from './TicketDetailPageClient';

interface TicketPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TicketPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Billet Électronique #${id} — Carte d’embarquement | Transnumerica`,
    description: `Votre carte d’embarquement officielle Transnumerica. Billet numérique #${id} scannable avec QR code sécurisé hors-ligne.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function TicketPage() {
  return <TicketDetailPageClient />;
}
