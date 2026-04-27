import { z } from 'zod';

export const ChildAge = z.number().int().min(0).max(17);
export const RoomGuests = z.object({
  adults: z.number().int().min(1).max(6),
  children: z.array(ChildAge).max(4),
});

export const EtgEnvelope = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    data: data.nullable(),
    status: z.enum(['ok', 'error']),
    error: z.string().nullable(),
    debug: z.unknown().optional(),
  });

// --- Multicomplete ---
export const MulticompleteRegion = z.object({
  id: z.number().int(),
  name: z.string(),
  country_code: z.string().length(2).nullable(),
  type: z.enum([
    'City',
    'Province (State)',
    'Country',
    'Multi-City (Vicinity)',
    'Neighborhood',
    'Airport',
    'Region',
  ]),
});
export const MulticompleteResponse = z.object({
  regions: z.array(MulticompleteRegion),
  hotels: z.array(z.object({ id: z.string(), hid: z.number(), name: z.string() })),
});

// --- Cancellation ---
export const CancellationPolicyEntry = z.object({
  start_at: z.string().nullable(),
  end_at: z.string().nullable(),
  amount_charge: z.string(),
  amount_show: z.string(),
});
export const CancellationPenalties = z.object({
  free_cancellation_before: z.string().nullable(),
  policies: z.array(CancellationPolicyEntry),
});

// --- Payment ---
export const PaymentType = z.object({
  type: z.enum(['hotel', 'now', 'deposit']),
  amount: z.string(),
  currency_code: z.string().length(3),
  show_amount: z.string(),
  show_currency_code: z.string().length(3),
  by: z.enum(['credit_card']).nullable().optional(),
  is_need_credit_card_data: z.boolean().optional(),
  is_need_cvc: z.boolean().optional(),
  cancellation_penalties: CancellationPenalties,
});
export const PaymentOptions = z.object({ payment_types: z.array(PaymentType).min(1) });

// --- rg_ext ---
export const RgExt = z.object({
  class: z.number().int(),
  quality: z.number().int(),
  sex: z.number().int(),
  bathroom: z.number().int(),
  bedding: z.number().int(),
  family: z.number().int(),
  capacity: z.number().int(),
  club: z.number().int(),
  bedrooms: z.number().int(),
  balcony: z.number().int(),
  view: z.number().int(),
  floor: z.number().int(),
});

// --- Rate ---
export const Rate = z.object({
  search_hash: z.string(),
  book_hash: z.string().optional(),
  match_hash: z.string().optional(),
  daily_prices: z.array(z.string()),
  meal_data: z.object({
    value: z.string(),
    has_breakfast: z.boolean(),
    no_child_meal: z.boolean(),
  }),
  payment_options: PaymentOptions,
  rg_ext: RgExt,
  room_name: z.string(),
  room_data_trans: z.object({
    main_name: z.string(),
    main_room_type: z.string().optional(),
    bathroom: z.string().nullable().optional(),
    bedding_type: z.string(),
    misc_room_type: z.string().nullable().optional(),
    beds: z
      .array(z.object({ bed: z.string(), count: z.union([z.string(), z.number()]) }))
      .optional(),
  }),
  amenities_data: z.array(z.string()),
  any_residency: z.boolean(),
  allotment: z.number().int().min(0),
});

// --- SERP ---
export const SearchByRegionRequest = z.object({
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  residency: z.string().length(2),
  language: z.string().default('en'),
  guests: z.array(RoomGuests).min(1).max(9),
  region_id: z.number().int().positive(),
  currency: z.string().length(3).default('USD'),
  hotels_limit: z.number().int().positive().optional(),
});
export const HotelInRegion = z.object({
  id: z.string(),
  hid: z.number().int(),
  rates: z.array(Rate),
});
export const SearchByRegionResponse = z.object({
  hotels: z.array(HotelInRegion),
  total_hotels: z.number().int().min(0),
});

// --- Hotel page ---
export const HotelpageRequest = z.object({
  id: z.string().optional(),
  hid: z.number().optional(),
  checkin: z.string(),
  checkout: z.string(),
  residency: z.string().length(2),
  language: z.string().default('en'),
  guests: z.array(RoomGuests).min(1).max(9),
  currency: z.string().length(3).default('USD'),
});
export const HotelpageResponse = z.object({
  hotels: z.array(z.object({ id: z.string(), hid: z.number().int(), rates: z.array(Rate) })),
});

// --- Hotel info (static) ---
export const HotelInfoRequest = z.object({ id: z.string() });
export const HotelInfoResponse = z.object({
  id: z.string(),
  hid: z.number(),
  name: z.string(),
  star_rating: z.number().int().min(0).max(5),
  address: z.string(),
  region: z.object({ id: z.number(), name: z.string(), country_code: z.string() }),
  latitude: z.number(),
  longitude: z.number(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  description_struct: z
    .array(z.object({ title: z.string(), paragraphs: z.array(z.string()) }))
    .optional(),
  images: z.array(z.string()),
  amenity_groups: z
    .array(z.object({ group_name: z.string(), amenities: z.array(z.string()) }))
    .optional(),
  check_in_time: z.string().nullable(),
  check_out_time: z.string().nullable(),
});

// --- Prebook ---
export const PrebookResponse = z.object({
  hotels: z.array(z.object({ id: z.string(), hid: z.number(), rates: z.array(Rate) })),
});

// --- Booking form (create) ---
export const BookingFormRequest = z.object({
  partner_order_id: z.string().min(3).max(256),
  book_hash: z.string(),
  language: z.string().default('en'),
  user_ip: z.string(),
});
export const BookingFormResponse = z.object({
  order_id: z.number().int(),
  partner_order_id: z.string(),
  item_id: z.number().int(),
  is_gender_specification_required: z.boolean(),
  payment_types: z.array(PaymentType),
  upsell_data: z.array(z.unknown()),
});

// --- Booking finish (start) ---
export const GuestData = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  is_child: z.boolean().default(false),
  age: z.number().int().min(0).max(17).optional(),
});
export const BookingFinishRequest = z.object({
  partner_order_id: z.string(),
  user: z.object({ email: z.string().email(), phone: z.string() }),
  rooms: z.array(z.object({ guests: z.array(GuestData) })).min(1),
  payment_type: z.object({
    type: z.enum(['hotel', 'now', 'deposit']),
    amount: z.string(),
    currency_code: z.string().length(3),
  }),
  language: z.string().default('en'),
});
export const BookingFinishResponse = z.object({ partner_order_id: z.string() });

// --- Booking status ---
export const BookingStatusResponse = z.object({
  status: z.enum(['init', 'in_progress', 'sent_to_supplier', 'confirmed', 'failed', 'cancelled']),
  partner_order_id: z.string(),
  errors: z.array(z.unknown()).optional(),
});

// Inferred TypeScript types
export type RoomGuestsType = z.infer<typeof RoomGuests>;
export type RateType = z.infer<typeof Rate>;
export type PaymentTypeType = z.infer<typeof PaymentType>;
export type CancellationPenaltiesType = z.infer<typeof CancellationPenalties>;
export type MulticompleteRegionType = z.infer<typeof MulticompleteRegion>;
export type HotelInfoResponseType = z.infer<typeof HotelInfoResponse>;
export type BookingStatusType = z.infer<typeof BookingStatusResponse>['status'];
