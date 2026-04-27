import { format } from 'date-fns';
import { differenceInDays } from 'date-fns';

interface VoucherPreviewProps {
  partnerOrderId: string;
  hotelName: string;
  checkin: Date;
  checkout: Date;
  leadGuestFirst: string;
  leadGuestLast: string;
  leadGuestEmail: string;
  totalAmount: string;
  currencyCode: string;
  cancellationJson: string;
  freeCancelBefore: Date | null;
}

export function VoucherPreview({
  partnerOrderId,
  hotelName,
  checkin,
  checkout,
  leadGuestFirst,
  leadGuestLast,
  leadGuestEmail,
  totalAmount,
  currencyCode,
  freeCancelBefore,
}: VoucherPreviewProps) {
  const nights = differenceInDays(checkout, checkin);

  let cancellationText = 'Non-refundable';
  if (freeCancelBefore && freeCancelBefore > new Date()) {
    cancellationText = `Free cancellation until ${format(freeCancelBefore, 'MMM d, yyyy')}`;
  }

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      {/* Header */}
      <div className="bg-indigo-600 text-white px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-xs font-medium uppercase tracking-wide">Veluria</p>
            <h2 className="text-xl font-bold mt-0.5">Booking Confirmation</h2>
          </div>
          <div className="text-right">
            <p className="text-indigo-200 text-xs">Booking ref</p>
            <p className="font-mono text-sm font-semibold">{partnerOrderId.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">
        <Section title="Hotel">
          <Row label="Property" value={hotelName} />
        </Section>

        <Section title="Stay">
          <Row label="Check-in" value={format(checkin, 'EEE, MMM d yyyy')} />
          <Row label="Check-out" value={format(checkout, 'EEE, MMM d yyyy')} />
          <Row label="Duration" value={`${nights} night${nights > 1 ? 's' : ''}`} />
        </Section>

        <Section title="Guest">
          <Row label="Name" value={`${leadGuestFirst} ${leadGuestLast}`} />
          <Row label="Email" value={leadGuestEmail} />
        </Section>

        <Section title="Payment">
          <Row label="Total" value={`${currencyCode} ${totalAmount}`} />
          <Row label="Payment" value="Pay at hotel" />
          <Row label="Cancellation" value={cancellationText} />
        </Section>

        <div className="text-center pt-2 border-t border-dashed border-gray-200">
          <p className="text-xs text-gray-400">Present this confirmation at check-in</p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}
