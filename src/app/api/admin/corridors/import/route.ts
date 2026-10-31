import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyApiAdminAuth, getClientIpAndUa } from '@/lib/server/auth-helpers';
import { corridorsRepository } from '@/lib/server/corridors-store';
import { CreateCorridorSchema } from '@/lib/validations/corridors';

const ImportPayloadSchema = z.object({
  rows: z.array(z.record(z.string(), z.any())).min(1, 'Le fichier CSV ne contient aucune ligne valide'),
  dryRun: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'corridors.import' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = ImportPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Payload invalide',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { rows, dryRun } = parsed.data;
    const { ip } = getClientIpAndUa(req);

    const rowErrors: Array<{ row: number; errors: Record<string, string[]> }> = [];
    const validItems: any[] = [];

    rows.forEach((row, index) => {
      // Map potential CSV header variations (french or english)
      const mapped = {
        code: row.code || row.Code || row['Code Ligne'],
        originCity: row.originCity || row.Origine || row['Ville Origine'] || row.origin,
        destinationCity: row.destinationCity || row.Destination || row['Ville Destination'] || row.destination,
        distanceKm: row.distanceKm || row.Distance || row['Distance (km)'],
        averageDurationHours: row.averageDurationHours || row.Duree || row['Durée Moyenne (h)'] || row.duration,
        basePriceCdf: row.basePriceCdf || row.PrixCDF || row['Tarif Base (CDF)'] || row.priceCdf,
        basePriceUsd: row.basePriceUsd || row.PrixUSD || row['Tarif Base (USD)'] || row.priceUsd,
        status: String(row.status || row.Statut || 'ACTIVE').toUpperCase(),
        operatorCount: row.operatorCount || row.Operateurs || row['Opérateurs'] || 1,
        notes: row.notes || row.Remarques || row.Commentaires || '',
      };

      const result = CreateCorridorSchema.safeParse(mapped);

      if (!result.success) {
        rowErrors.push({
          row: index + 1,
          errors: result.error.flatten().fieldErrors as Record<string, string[]>,
        });
      } else {
        validItems.push(result.data);
      }
    });

    const summary = {
      totalRows: rows.length,
      validRows: validItems.length,
      invalidRows: rowErrors.length,
      rowErrors,
      preview: validItems.slice(0, 5),
    };

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        summary,
      });
    }

    // Execute actual import
    const importedItems: any[] = [];
    for (const item of validItems) {
      const created = await corridorsRepository.create(item, auth.session, ip);
      importedItems.push(created);
    }

    return NextResponse.json({
      success: true,
      dryRun: false,
      importedCount: importedItems.length,
      summary,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
