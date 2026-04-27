import { NextRequest, NextResponse } from 'next/server';
import { renderToStream, type DocumentProps } from '@react-pdf/renderer';
import React from 'react';
import { prisma } from '@/lib/prisma';
import { VoucherDocument } from '@/lib/booking/voucher';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ partnerOrderId: string }> }
) {
  const { partnerOrderId } = await params;

  const booking = await prisma.booking.findUnique({
    where: { partnerOrderId },
    select: {
      hotelName: true,
      checkin: true,
      checkout: true,
      leadGuestFirst: true,
      leadGuestLast: true,
      leadGuestEmail: true,
      totalAmount: true,
      currencyCode: true,
      freeCancelBefore: true,
    },
  });

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  const element = React.createElement(VoucherDocument, {
    data: {
      partnerOrderId,
      hotelName: booking.hotelName,
      checkin: booking.checkin,
      checkout: booking.checkout,
      leadGuestFirst: booking.leadGuestFirst,
      leadGuestLast: booking.leadGuestLast,
      leadGuestEmail: booking.leadGuestEmail,
      totalAmount: booking.totalAmount,
      currencyCode: booking.currencyCode,
      freeCancelBefore: booking.freeCancelBefore,
    },
  }) as unknown as React.ReactElement<DocumentProps>;
  const stream = await renderToStream(element);

  const ref = partnerOrderId.slice(0, 8).toUpperCase();
  return new NextResponse(stream as unknown as ReadableStream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="veluria-booking-${ref}.pdf"`,
    },
  });
}
