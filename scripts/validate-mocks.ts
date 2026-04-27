/**
 * Validates every hotel in master-hotels.ts against the ETG Zod schemas.
 * Usage: npx tsx scripts/validate-mocks.ts
 */

import { ALL_HOTELS, type MasterHotel } from '../src/lib/etg/mocks/master-hotels';
import { HotelInRegion, HotelInfoResponse } from '../src/lib/etg/types';

let errors = 0;

function makeSearchHash(hotelId: string, rateId: string) {
  return `sh-${hotelId.replace('/', '-')}-${rateId}`;
}

function makeBookHash(hotelId: string, rateId: string) {
  return `bh-${hotelId.replace('/', '-')}-${rateId}`;
}

function buildHotelInRegion(hotel: MasterHotel) {
  return {
    id: hotel.id,
    hid: hotel.hid,
    rates: hotel.rateTemplates.map((rt) => ({
      ...rt,
      search_hash: makeSearchHash(hotel.id, rt._id),
      book_hash: makeBookHash(hotel.id, rt._id),
      match_hash: makeSearchHash(hotel.id, rt._id),
    })),
  };
}

function buildHotelInfo(hotel: MasterHotel) {
  return {
    id: hotel.id,
    hid: hotel.hid,
    name: hotel.name,
    star_rating: hotel.star_rating,
    address: hotel.address,
    region: { id: hotel.regionId, name: 'Region', country_code: 'us' },
    latitude: hotel.latitude,
    longitude: hotel.longitude,
    phone: null,
    email: null,
    description_struct: hotel.description_struct,
    images: hotel.images,
    amenity_groups: hotel.amenity_groups,
    check_in_time: hotel.check_in_time,
    check_out_time: hotel.check_out_time,
  };
}

console.log(`Validating ${ALL_HOTELS.length} hotels…\n`);

for (const hotel of ALL_HOTELS) {
  // Validate as HotelInRegion (search/hotelpage shape)
  const inRegion = buildHotelInRegion(hotel);
  const r1 = HotelInRegion.safeParse(inRegion);
  if (!r1.success) {
    console.error(`[${hotel.id}] HotelInRegion FAIL:`);
    console.error(JSON.stringify(r1.error.flatten(), null, 2));
    errors++;
  } else {
    console.log(`✓ ${hotel.id} — HotelInRegion OK (${r1.data.rates.length} rates)`);
  }

  // Validate as HotelInfoResponse (static content shape)
  const info = buildHotelInfo(hotel);
  const r2 = HotelInfoResponse.safeParse(info);
  if (!r2.success) {
    console.error(`[${hotel.id}] HotelInfoResponse FAIL:`);
    console.error(JSON.stringify(r2.error.flatten(), null, 2));
    errors++;
  } else {
    console.log(`✓ ${hotel.id} — HotelInfoResponse OK`);
  }
}

if (errors > 0) {
  console.error(`\n${errors} validation error(s). Fix master-hotels.ts before deploying.`);
  process.exit(1);
} else {
  console.log(`\nAll ${ALL_HOTELS.length} hotels valid.\n`);
}
