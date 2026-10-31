import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.resolve(process.cwd(), 'public/downloads/TRANSNUMERICA_GUIDE_UTILISATEUR.pdf');

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Guide book not found' }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="TRANSNUMERICA_GUIDE_UTILISATEUR.pdf"',
      'Content-Length': fileBuffer.length.toString(),
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

