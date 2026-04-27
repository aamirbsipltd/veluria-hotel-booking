import { MOCK_REGIONS } from './mocks/regions';
import {
  ALL_HOTELS,
  HOTELS_BY_REGION,
  getHotelByHid,
  getHotelById,
  makeSearchHash,
  makeBookHash,
} from './mocks/master-hotels';
import type { MasterHotel } from './mocks/master-hotels';
import { EtgApiError } from './errors';
import type { EtgClient } from './client';
import type { RoomGuestsType, RateType } from './types';
import { selectHotelPayment } from './payment-selection';

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function hotelToRate(hotel: MasterHotel, rateTemplate: MasterHotel['rateTemplates'][0], checkin: string): RateType {
  const searchHash = makeSearchHash(hotel.id, rateTemplate._id, checkin);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, ...rest } = rateTemplate;
  return { ...rest, search_hash: searchHash };
}

function hotelToRateWithBook(hotel: MasterHotel, rateTemplate: MasterHotel['rateTemplates'][0], checkin: string): RateType {
  const searchHash = makeSearchHash(hotel.id, rateTemplate._id, checkin);
  const bookHash = makeBookHash(searchHash);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, ...rest } = rateTemplate;
  return { ...rest, search_hash: searchHash, book_hash: bookHash };
}

export const mockClient: EtgClient = {
  async multicomplete(query: string) {
    const q = query.toLowerCase();
    const regions = MOCK_REGIONS.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.country_code.toLowerCase().includes(q)
    ).slice(0, 5);
    return {
      regions: regions.map(({ flag: _flag, ...r }) => r),
      hotels: [],
    };
  },

  async searchByRegion(params) {
    await delay(200 + Math.random() * 400);
    const hotels = HOTELS_BY_REGION[params.region_id] ?? HOTELS_BY_REGION[6053839];
    return {
      hotels: hotels.map((h) => ({
        id: h.id,
        hid: h.hid,
        rates: h.rateTemplates.map((rt) => hotelToRate(h, rt, params.checkin)),
      })),
      total_hotels: hotels.length,
    };
  },

  async hotelpage(params) {
    await delay(200 + Math.random() * 300);
    const hid = params.hid ?? (params.id ? parseInt(params.id.replace('t/', '')) : undefined);
    const id = params.id;
    const hotel = hid ? getHotelByHid(hid) : id ? getHotelById(id) : undefined;
    if (!hotel) {
      throw new EtgApiError('hotel_not_found', 'Hotel not found in mock data');
    }
    return {
      hotels: [
        {
          id: hotel.id,
          hid: hotel.hid,
          rates: hotel.rateTemplates.map((rt) => hotelToRateWithBook(hotel, rt, params.checkin)),
        },
      ],
    };
  },

  async hotelInfo(id: string) {
    await delay(100 + Math.random() * 200);
    const hotel = getHotelById(id) ?? getHotelByHid(parseInt(id.replace('t/', '')));
    const fallback = ALL_HOTELS[0];
    const h = hotel ?? fallback;
    return {
      id: h.id,
      hid: h.hid,
      name: h.name,
      star_rating: h.star_rating,
      address: h.address,
      region: {
        id: h.regionId,
        name: MOCK_REGIONS.find((r) => r.id === h.regionId)?.name ?? 'Unknown',
        country_code: MOCK_REGIONS.find((r) => r.id === h.regionId)?.country_code ?? 'xx',
      },
      latitude: h.latitude,
      longitude: h.longitude,
      phone: null,
      email: null,
      description_struct: h.description_struct,
      images: h.images,
      amenity_groups: h.amenity_groups,
      check_in_time: h.check_in_time,
      check_out_time: h.check_out_time,
    };
  },

  // simulate is a method arg (NOT module-level state) — safe for concurrent serverless requests
  async prebook(hash: string, simulate?: 'price_changed' | 'sold_out') {
    await delay(300 + Math.random() * 300);

    if (simulate === 'sold_out') {
      throw new EtgApiError('rate_not_found', 'Sold out (simulated)');
    }

    // Find the rate matching this hash
    const allRates = ALL_HOTELS.flatMap((h) =>
      h.rateTemplates.map((rt) => ({ hotel: h, template: rt }))
    );
    const match = allRates.find(({ hotel, template }) => {
      // The hash encodes hotel.id and template._id — match by checking prefix
      const expectedPrefix = `sh-${hotel.id}-${template._id}`.replace(/\//g, '_');
      return hash.startsWith(expectedPrefix);
    });

    const hotel = match?.hotel ?? ALL_HOTELS[0];
    const template = match?.template ?? hotel.rateTemplates[0];
    const searchHash = hash;
    const bookHash = makeBookHash(searchHash);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...rest } = template;
    let rate: RateType = { ...rest, search_hash: searchHash, book_hash: bookHash };

    if (simulate === 'price_changed') {
      const pt = selectHotelPayment(rate);
      if (pt) {
        const higher = (parseFloat(pt.show_amount) * 1.08).toFixed(2);
        rate = {
          ...rate,
          payment_options: {
            payment_types: rate.payment_options.payment_types.map((p) =>
              p.type === 'hotel'
                ? { ...p, show_amount: higher, amount: higher }
                : p
            ),
          },
        };
      }
    }

    return {
      hotels: [{ id: hotel.id, hid: hotel.hid, rates: [rate] }],
    };
  },

  async bookingForm(params) {
    await delay(400 + Math.random() * 300);
    const orderId = 100000 + Math.floor(Math.random() * 9000);
    const itemId = 200000 + Math.floor(Math.random() * 9000);
    return {
      order_id: orderId,
      partner_order_id: params.partner_order_id,
      item_id: itemId,
      is_gender_specification_required: false,
      payment_types: [
        {
          type: 'hotel',
          amount: '0.00',
          currency_code: 'EUR', // ETG sandbox always returns EUR here
          show_amount: '0.00',
          show_currency_code: 'EUR',
          cancellation_penalties: {
            free_cancellation_before: null,
            policies: [],
          },
        },
      ],
      upsell_data: [],
    };
  },

  async bookingFinish(_params) {
    await delay(500 + Math.random() * 400);
    return { partner_order_id: _params.partner_order_id };
  },

  async bookingStatus(partnerOrderId: string) {
    await delay(200 + Math.random() * 200);
    // Simulate progression: first call returns in_progress, subsequent calls confirmed
    // In real usage each call is independent, so we just return confirmed for simplicity
    return {
      status: 'confirmed' as const,
      partner_order_id: partnerOrderId,
    };
  },
};
