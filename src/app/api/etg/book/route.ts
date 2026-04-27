import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { etg } from '@/lib/etg/adapter';
import { EtgApiError } from '@/lib/etg/errors';
import { prisma } from '@/lib/prisma';

const BookBody = z.object({
  partner_order_id: z.string().uuid(),
  book_hash: z.string(),
  hid: z.number().int(),
  hotelName: z.string(),
  checkin: z.string(),
  checkout: z.string(),
  totalAmount: z.string(),
  currencyCode: z.string(),
  cancellationJson: z.string(),
  freeCancelBefore: z.string().nullable().optional(),
  user: z.object({ email: z.string().email(), phone: z.string() }),
  leadGuestFirst: z.string(),
  leadGuestLast: z.string(),
  rooms: z.array(z.object({
    guests: z.array(z.object({
      first_name: z.string(),
      last_name: z.string(),
      is_child: z.boolean().default(false),
      age: z.number().optional(),
    })),
  })).min(1),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = BookBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const {
    partner_order_id,
    book_hash,
    hid,
    hotelName,
    checkin,
    checkout,
    totalAmount,
    currencyCode,
    cancellationJson,
    freeCancelBefore,
    user,
    leadGuestFirst,
    leadGuestLast,
    rooms,
  } = parsed.data;

  const userIp =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1';

  try {
    // Step 1: Create booking form (ETG idempotent via partner_order_id)
    const formResult = await etg.bookingForm({
      partner_order_id,
      book_hash,
      language: 'en',
      user_ip: userIp,
    });

    // Persist booking row
    await prisma.booking.upsert({
      where: { partnerOrderId: partner_order_id },
      create: {
        partnerOrderId: partner_order_id,
        etgOrderId: String(formResult.order_id),
        itemId: String(formResult.item_id),
        status: 'form_created',
        hid,
        hotelName,
        checkin: new Date(checkin),
        checkout: new Date(checkout),
        guestsJson: JSON.stringify(rooms),
        bookHash: book_hash,
        totalAmount,
        currencyCode,
        paymentType: 'hotel',
        leadGuestFirst,
        leadGuestLast,
        leadGuestEmail: user.email,
        leadGuestPhone: user.phone || null,
        cancellationJson,
        freeCancelBefore: freeCancelBefore ? new Date(freeCancelBefore) : null,
        rawFormResponse: JSON.stringify(formResult),
      },
      update: {
        etgOrderId: String(formResult.order_id),
        itemId: String(formResult.item_id),
        status: 'form_created',
        rawFormResponse: JSON.stringify(formResult),
      },
    });

    // Step 2: Finish booking
    const hotelPayment = formResult.payment_types.find((pt) => pt.type === 'hotel');
    const paymentAmount = hotelPayment?.amount ?? '0';
    const paymentCurrency = hotelPayment?.currency_code ?? 'EUR';

    await etg.bookingFinish({
      partner_order_id,
      user,
      rooms,
      payment_type: {
        type: 'hotel',
        amount: paymentAmount,
        currency_code: paymentCurrency,
      },
      language: 'en',
    });

    await prisma.booking.update({
      where: { partnerOrderId: partner_order_id },
      data: { status: 'in_progress' },
    });

    return NextResponse.json({ partner_order_id, status: 'in_progress' });
  } catch (err) {
    if (err instanceof EtgApiError && err.code === 'duplicate_reservation') {
      const existing = await prisma.booking.findUnique({
        where: { partnerOrderId: partner_order_id },
      });
      return NextResponse.json({
        partner_order_id,
        status: existing?.status ?? 'confirmed',
        alreadyComplete: true,
      });
    }
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[book] error:', err);
    return NextResponse.json({ error: 'Booking failed', detail: msg }, { status: 502 });
  }
}
