'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useState } from 'react';
import type { RateType } from '@/lib/etg/types';
import { selectHotelPayment } from '@/lib/etg/payment-selection';

const GuestFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(1, 'Phone is required'),
  comment: z.string().optional(),
});

type FormValues = z.infer<typeof GuestFormSchema>;

interface GuestFormProps {
  partnerOrderId: string;
  bookHash: string;
  rate: RateType;
  hid: number;
  hotelName: string;
  checkin: string;
  checkout: string;
  guests: string;
}

export function GuestForm({
  partnerOrderId,
  bookHash,
  rate,
  hid,
  hotelName,
  checkin,
  checkout,
  guests,
}: GuestFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [phone, setPhone] = useState('');

  const pt = selectHotelPayment(rate);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(GuestFormSchema),
  });

  async function onSubmit(values: FormValues) {
    if (!isValidPhoneNumber(phone)) {
      setServerError('Enter a valid international phone number.');
      return;
    }
    setServerError(null);

    const guestsArr = JSON.parse(guests) as { adults: number; children: number[] }[];
    const rooms = guestsArr.map((r) => ({
      guests: [
        { first_name: values.firstName, last_name: values.lastName, is_child: false },
        ...Array.from({ length: r.adults - 1 }, () => ({
          first_name: 'Guest',
          last_name: values.lastName,
          is_child: false,
        })),
        ...r.children.map((age) => ({
          first_name: 'Child',
          last_name: values.lastName,
          is_child: true,
          age,
        })),
      ],
    }));

    const res = await fetch('/api/etg/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partner_order_id: partnerOrderId,
        book_hash: bookHash,
        hid,
        hotelName,
        checkin,
        checkout,
        totalAmount: pt?.show_amount ?? '0',
        currencyCode: pt?.show_currency_code ?? 'USD',
        cancellationJson: JSON.stringify(pt?.cancellation_penalties ?? {}),
        freeCancelBefore: pt?.cancellation_penalties.free_cancellation_before ?? null,
        user: { email: values.email, phone },
        leadGuestFirst: values.firstName,
        leadGuestLast: values.lastName,
        rooms,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setServerError((data as { error?: string }).error ?? 'Booking failed. Please try again.');
      return;
    }

    router.push(`/confirmation/${partnerOrderId}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <h2 className="text-xl font-semibold text-gray-900">Guest details</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First name" error={errors.firstName?.message}>
          <input
            {...register('firstName')}
            placeholder="John"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </Field>
        <Field label="Last name" error={errors.lastName?.message}>
          <input
            {...register('lastName')}
            placeholder="Doe"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </Field>
      </div>

      <Field label="Email" error={errors.email?.message}>
        <input
          {...register('email')}
          type="email"
          placeholder="john@example.com"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </Field>

      <Field label="Phone number" error={errors.phone?.message}>
        <PhoneInput
          international
          defaultCountry="US"
          value={phone}
          onChange={(val) => {
            setPhone(val ?? '');
            setValue('phone', val ?? '', { shouldValidate: true });
          }}
          className="phone-input-wrapper w-full"
        />
      </Field>

      <Field label="Special requests (optional)" error={undefined}>
        <textarea
          {...register('comment')}
          rows={3}
          placeholder="Any special requests or notes..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </Field>

      {serverError && (
        <p className="text-red-600 text-sm rounded-lg bg-red-50 border border-red-200 px-3 py-2">
          {serverError}
        </p>
      )}

      {pt && (
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Total</span>
            <span className="font-bold text-gray-900">{pt.show_currency_code} {pt.show_amount}</span>
          </div>
          <p className="text-gray-400 text-xs">Pay at hotel • No card required now</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
      >
        {isSubmitting ? 'Confirming booking…' : 'Confirm booking'}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
