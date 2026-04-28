'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, Share2, CalendarPlus, Sparkles } from 'lucide-react';
import { BookingStatusPoller } from '@/components/booking-status-poller';
import { VoucherPreview } from '@/components/voucher-preview';

type BookingRecord = {
  id: string;
  partnerOrderId: string;
  status: string;
  hotelName: string;
  checkin: string;
  checkout: string;
  leadGuestFirst: string;
  leadGuestLast: string;
  leadGuestEmail: string;
  totalAmount: string;
  currencyCode: string;
  cancellationJson: string;
  freeCancelBefore: string | null;
};

type PollerStatus = 'in_progress' | 'sent_to_supplier' | 'confirmed' | 'failed' | 'cancelled';

interface PageProps {
  params: Promise<{ partnerOrderId: string }>;
}

function fmtIcsDate(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

function handleAddToCalendar(booking: BookingRecord) {
  const checkinDate = new Date(booking.checkin);
  const checkoutDate = new Date(booking.checkout);
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${fmtIcsDate(checkinDate)}`,
    `DTEND;VALUE=DATE:${fmtIcsDate(checkoutDate)}`,
    `SUMMARY:Stay at ${booking.hotelName}`,
    `DESCRIPTION:Booking ref: ${booking.partnerOrderId}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })),
    download: `veluria-${booking.partnerOrderId.slice(0, 8)}.ics`,
  });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function ConfirmationPage({ params }: PageProps) {
  const { partnerOrderId } = use(params);
  const router = useRouter();

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [resolvedStatus, setResolvedStatus] = useState<PollerStatus | null>(null);

  useEffect(() => {
    async function loadBooking() {
      try {
        const res = await fetch(`/api/etg/booking-record?partner_order_id=${encodeURIComponent(partnerOrderId)}`);
        if (res.ok) {
          setBooking(await res.json() as BookingRecord);
        } else {
          setLoadError('Could not load booking details.');
        }
      } catch {
        setLoadError('Network error loading booking.');
      }
    }
    loadBooking();
  }, [partnerOrderId]);

  const handlePollerResolved = useCallback((status: PollerStatus) => {
    setResolvedStatus(status);
    setBooking((prev) => prev ? { ...prev, status } : prev);
  }, []);

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: 'My booking confirmation', url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => alert('Link copied to clipboard'));
    }
  }

  const isInProgress = booking?.status === 'in_progress' || booking?.status === 'sent_to_supplier';
  const isConfirmed = booking?.status === 'confirmed' || resolvedStatus === 'confirmed';
  const isFailed = booking?.status === 'failed' || booking?.status === 'cancelled' || resolvedStatus === 'failed' || resolvedStatus === 'cancelled';

  const hotelCity = booking?.hotelName?.split(' ')[0] ?? '';

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        {/* Loading */}
        {!booking && !loadError && (
          <div className="flex items-center justify-center py-20">
            <span className="animate-spin h-6 w-6 rounded-full border-2 border-teal-500 border-t-transparent" />
          </div>
        )}

        {loadError && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-red-700 text-sm">
            {loadError}
          </div>
        )}

        {booking && (
          <>
            {/* Poller */}
            {isInProgress && !resolvedStatus && (
              <BookingStatusPoller
                partnerOrderId={partnerOrderId}
                initialStatus={booking.status as PollerStatus}
                onResolved={handlePollerResolved}
              />
            )}

            {/* Confirmed — animated */}
            {isConfirmed && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center py-8 space-y-4"
              >
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mx-auto"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Your stay is confirmed</h1>
                  <p className="text-sm font-mono text-gray-500 mt-1">{partnerOrderId}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Confirmation sent to {booking.leadGuestEmail}
                  </p>
                </div>
              </motion.div>
            )}

            {/* In-progress banner */}
            {isInProgress && !resolvedStatus && (
              <div className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-300 px-5 py-4">
                <span className="animate-spin h-5 w-5 rounded-full border-2 border-amber-400 border-t-transparent shrink-0" />
                <p className="text-amber-800 text-sm font-medium">Confirming your reservation with the hotel…</p>
              </div>
            )}

            {/* Failed */}
            {isFailed && (
              <div className="rounded-2xl border border-red-300 bg-red-50 p-6">
                <p className="text-red-700 font-semibold">Booking failed</p>
                <p className="text-red-600 text-sm mt-1">
                  Your payment was not charged. Please try again or contact support.
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="mt-3 text-sm text-red-600 underline"
                >
                  Search again
                </button>
              </div>
            )}

            {/* Voucher preview */}
            <VoucherPreview
              partnerOrderId={partnerOrderId}
              hotelName={booking.hotelName}
              checkin={new Date(booking.checkin)}
              checkout={new Date(booking.checkout)}
              leadGuestFirst={booking.leadGuestFirst}
              leadGuestLast={booking.leadGuestLast}
              leadGuestEmail={booking.leadGuestEmail}
              totalAmount={booking.totalAmount}
              currencyCode={booking.currencyCode}
              cancellationJson={booking.cancellationJson}
              freeCancelBefore={booking.freeCancelBefore ? new Date(booking.freeCancelBefore) : null}
            />

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/api/voucher/${partnerOrderId}`}
                className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
              >
                <Download className="w-4 h-4" />
                Download voucher
              </Link>
              <button
                onClick={() => handleAddToCalendar(booking)}
                className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
              >
                <CalendarPlus className="w-4 h-4" />
                Add to calendar
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>

            {/* Phase-2 CTA */}
            <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 p-6 flex gap-4 items-start">
              <Sparkles className="w-8 h-8 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Make it a complete trip</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Add tours, transfers, and curated experiences alongside your stay in {hotelCity}.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-800 transition-colors"
                >
                  Browse tours in {hotelCity} →
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
