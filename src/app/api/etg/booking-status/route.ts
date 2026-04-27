import { NextRequest, NextResponse } from 'next/server';
import { etg } from '@/lib/etg/adapter';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const partnerOrderId = req.nextUrl.searchParams.get('partner_order_id');
  if (!partnerOrderId) {
    return NextResponse.json({ error: 'partner_order_id required' }, { status: 400 });
  }

  try {
    const result = await etg.bookingStatus(partnerOrderId);

    await prisma.booking.update({
      where: { partnerOrderId },
      data: { status: result.status },
    }).catch(() => {
      // Booking may not exist in DB (e.g. after seeding); non-fatal
    });

    return NextResponse.json({ partner_order_id: partnerOrderId, status: result.status });
  } catch (err) {
    console.error('[booking-status] error:', err);
    return NextResponse.json({ error: 'Status check failed' }, { status: 502 });
  }
}
