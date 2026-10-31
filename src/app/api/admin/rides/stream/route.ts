import { NextRequest } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { rideOperationsEvents } from '@/lib/server/rides-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'rides.read' });
  if (!auth.authorized) {
    return new Response(JSON.stringify({ error: auth.error }), {
      status: auth.status || 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const sendEvent = async (event: string, data: unknown) => {
    try {
      const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      await writer.write(encoder.encode(payload));
    } catch {
      // Stream may be closed
    }
  };

  // Listeners
  const onSafetyAlert = (data: unknown) => sendEvent('safety_alert', data);
  const onRideUpdated = (data: unknown) => sendEvent('ride_updated', data);
  const onIncidentUpdated = (data: unknown) => sendEvent('incident_updated', data);
  const onReset = () => sendEvent('store_reset', { reset: true });

  rideOperationsEvents.on('safety_alert', onSafetyAlert);
  rideOperationsEvents.on('ride_updated', onRideUpdated);
  rideOperationsEvents.on('incident_updated', onIncidentUpdated);
  rideOperationsEvents.on('store_reset', onReset);

  // Send initial connected ping
  sendEvent('connected', { timestamp: new Date().toISOString() });

  // Heartbeat every 15s to keep connection alive
  const heartbeat = setInterval(() => {
    sendEvent('ping', { timestamp: Date.now() });
  }, 15000);

  // Clean up when client disconnects
  req.signal.addEventListener('abort', () => {
    clearInterval(heartbeat);
    rideOperationsEvents.off('safety_alert', onSafetyAlert);
    rideOperationsEvents.off('ride_updated', onRideUpdated);
    rideOperationsEvents.off('incident_updated', onIncidentUpdated);
    rideOperationsEvents.off('store_reset', onReset);
    try {
      writer.close();
    } catch {
      // Ignored
    }
  });

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

