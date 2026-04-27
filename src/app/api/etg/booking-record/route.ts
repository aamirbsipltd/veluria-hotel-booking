import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const partnerOrderId = req.nextUrl.searchParams.get('partner_order_id');
  if (!partnerOrderId) {
    return NextResponse.json({ error: 'partner_order_id required' }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { partnerOrderId },
    select: {
      id: true,
      partnerOrderId: true,
      status: true,
      hotelName: true,
      checkin: true,
      checkout: true,
      leadGuestFirst: true,
      leadGuestLast: true,
      leadGuestEmail: true,
      totalAmount: true,
      currencyCode: true,
      cancellationJson: true,
      freeCancelBefore: true,
    },
  });

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  return NextResponse.json(booking);
}
