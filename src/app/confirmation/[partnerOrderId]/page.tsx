'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

export default function ConfirmationPage({ params }: PageProps) {
  const { partnerOrderId } = use(params);
  const router = useRouter();

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [resolvedStatus, setResolvedStatus] = useState<PollerStatus | null>(null);

  // Load booking from a lightweight status endpoint (reuses booking-status which also updates DB)
  useEffect(() => {
    async function loadBooking() {
      try {
        // Fetch status (which loads from DB via prisma) — we need full booking data
        // Use a dedicated internal fetch to get booking details
        const res = await fetch(`/api/etg/booking-record?partner_order_id=${encodeURIComponent(partnerOrderId)}`);
        if (res.ok) {
          const data = await res.json() as BookingRecord;
          setBooking(data);
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
    // Refresh booking record to get latest status
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        {/* Loading state */}
        {!booking && !loadError && (
          <div className="flex items-center justify-center py-20">
            <span className="animate-spin h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        )}

        {loadError && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-5 text-red-700 text-sm">
            {loadError}
          </div>
        )}

        {booking && (
          <>
            {/* Poller — only when status is non-terminal */}
            {isInProgress && !resolvedStatus && (
              <BookingStatusPoller
                partnerOrderId={partnerOrderId}
                initialStatus={booking.status as PollerStatus}
                onResolved={handlePollerResolved}
              />
            )}

            {/* Confirmed */}
            {isConfirmed && (
              <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-300 px-5 py-4">
                <svg className="w-6 h-6 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-emerald-800 font-semibold">Booking confirmed!</p>
                  <p className="text-emerald-700 text-sm">Check your email for the confirmation details.</p>
                </div>
              </div>
            )}

            {/* Failed */}
            {isFailed && (
              <div className="rounded-xl border border-red-300 bg-red-50 p-5">
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

            {/* Voucher */}
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
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Voucher
              </Link>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            </div>

            {/* CTA */}
            <div className="mt-4 rounded-xl bg-white border border-gray-200 p-6 text-center space-y-3">
              <p className="text-gray-700 font-medium">Explore more destinations</p>
              <p className="text-gray-500 text-sm">Find hotels in Lisbon, Tokyo, Madrid and Dubai.</p>
              <Link
                href="/"
                className="inline-block bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium px-5 py-2 rounded-lg transition-colors"
              >
                Search again
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
