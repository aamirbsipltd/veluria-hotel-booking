// Photos from Unsplash (unsplash.com). Used under Unsplash License.
import type { RateType } from '../types';

type RateTemplate = Omit<RateType, 'search_hash' | 'book_hash' | 'match_hash'> & {
  _id: string;
};

export type MasterHotel = {
  id: string;
  hid: number;
  name: string;
  star_rating: number;
  address: string;
  regionId: number;
  heroPhoto: string;
  images: string[];
  amenity_groups: { group_name: string; amenities: string[] }[];
  check_in_time: string;
  check_out_time: string;
  latitude: number;
  longitude: number;
  description_struct: { title: string; paragraphs: string[] }[];
  rateTemplates: RateTemplate[];
};

function makeRate(
  id: string,
  roomName: string,
  mainName: string,
  beddingType: string,
  dailyPrice: string,
  mealValue: string,
  hasBreakfast: boolean,
  view: number,
  capacity: number,
  bedding: number,
  freeCancelDays: number | null,
  starClass: number
): RateTemplate {
  const showAmount = (parseFloat(dailyPrice) * 3).toFixed(2);
  const freeCancelBefore =
    freeCancelDays !== null
      ? new Date(Date.now() + freeCancelDays * 86400_000).toISOString()
      : null;
  const policies =
    freeCancelDays !== null
      ? [
          {
            start_at: freeCancelBefore!,
            end_at: null,
            amount_charge: showAmount,
            amount_show: showAmount,
          },
        ]
      : [
          {
            start_at: null,
            end_at: null,
            amount_charge: showAmount,
            amount_show: showAmount,
          },
        ];

  return {
    _id: id,
    daily_prices: [dailyPrice, dailyPrice, dailyPrice],
    meal_data: { value: mealValue, has_breakfast: hasBreakfast, no_child_meal: false },
    payment_options: {
      payment_types: [
        {
          type: 'hotel',
          amount: showAmount,
          currency_code: 'USD',
          show_amount: showAmount,
          show_currency_code: 'USD',
          cancellation_penalties: {
            free_cancellation_before: freeCancelBefore,
            policies,
          },
        },
      ],
    },
    rg_ext: {
      class: starClass,
      quality: 2,
      sex: 0,
      bathroom: 1,
      bedding,
      family: 0,
      capacity,
      club: 0,
      bedrooms: 1,
      balcony: 0,
      view,
      floor: 0,
    },
    room_name: roomName,
    room_data_trans: {
      main_name: mainName,
      main_room_type: 'Room',
      bathroom: 'Private bathroom',
      bedding_type: beddingType,
      misc_room_type: null,
    },
    amenities_data: ['Non-smoking rooms', 'Free Wi-Fi', 'Air conditioning'],
    any_residency: true,
    allotment: 5,
  };
}

// Lisbon (6053839)
const LISBON_HOTELS: MasterHotel[] = [
  {
    id: 't/1001',
    hid: 1001,
    name: 'Bairro Alto Hotel',
    star_rating: 5,
    address: 'Praça Luís de Camões 2, 1200-243 Lisbon',
    regionId: 6053839,
    heroPhoto: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    images: [
      'https://cdn.worldota.net/t/{size}/content/lisbon/bairroalto/1.jpg',
      'https://cdn.worldota.net/t/{size}/content/lisbon/bairroalto/2.jpg',
      'https://cdn.worldota.net/t/{size}/content/lisbon/bairroalto/3.jpg',
      'https://cdn.worldota.net/t/{size}/content/lisbon/bairroalto/4.jpg',
      'https://cdn.worldota.net/t/{size}/content/lisbon/bairroalto/5.jpg',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1024',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1024',
      'https://images.unsplash.com/photo-1455587734955-081b22074882?w=1024',
    ],
    amenity_groups: [
      { group_name: 'General', amenities: ['24-hour front desk', 'Concierge', 'Luggage storage'] },
      { group_name: 'Food & Drink', amenities: ['Restaurant', 'Bar', 'Room service'] },
      { group_name: 'Wellness', amenities: ['Spa', 'Fitness centre'] },
    ],
    check_in_time: '15:00',
    check_out_time: '12:00',
    latitude: 38.7104,
    longitude: -9.1426,
    description_struct: [
      {
        title: 'About',
        paragraphs: [
          'Nestled in the heart of Lisbon\'s historic Bairro Alto neighbourhood, this celebrated boutique hotel blends 18th-century architecture with contemporary luxury.',
          'Guests enjoy sweeping views over the Tagus estuary and the medieval Alfama district.',
        ],
      },
    ],
    rateTemplates: [
      makeRate('1001-r1', 'Deluxe Double Room', 'Deluxe Double', 'Double bed', '320.00', 'RO', false, 1, 2, 5, 7, 5),
      makeRate('1001-r2', 'Superior King Room', 'Superior King', 'King bed', '380.00', 'BB', true, 3, 2, 6, 5, 5),
      makeRate('1001-r3', 'Junior Suite', 'Junior Suite', 'King bed', '520.00', 'BB', true, 3, 2, 6, 3, 5),
      makeRate('1001-r4', 'Deluxe Double Non-refundable', 'Deluxe Double', 'Double bed', '280.00', 'RO', false, 1, 2, 5, null, 5),
    ],
  },
  {
    id: 't/1002',
    hid: 1002,
    name: 'Memmo Alfama Hotel',
    star_rating: 4,
    address: 'Travessa das Merceeiras 27, 1100-348 Lisbon',
    regionId: 6053839,
    heroPhoto: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1024',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1024',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1024',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1024',
    ],
    amenity_groups: [
      { group_name: 'General', amenities: ['24-hour front desk', 'Terrace', 'Free Wi-Fi'] },
      { group_name: 'Food & Drink', amenities: ['Restaurant', 'Bar'] },
    ],
    check_in_time: '15:00',
    check_out_time: '12:00',
    latitude: 38.7127,
    longitude: -9.1329,
    description_struct: [
      {
        title: 'About',
        paragraphs: [
          'Perched on the hillside of Alfama, Lisbon\'s oldest district, Memmo Alfama offers panoramic views over the river and city skyline from its spectacular rooftop terrace.',
        ],
      },
    ],
    rateTemplates: [
      makeRate('1002-r1', 'Standard Double Room', 'Standard Double', 'Double bed', '180.00', 'RO', false, 1, 2, 5, 10, 4),
      makeRate('1002-r2', 'Superior River View', 'Superior Double', 'Double bed', '220.00', 'BB', true, 3, 2, 5, 7, 4),
      makeRate('1002-r3', 'Deluxe Terrace Room', 'Deluxe Double', 'King bed', '260.00', 'BB', true, 3, 2, 6, 5, 4),
    ],
  },
  {
    id: 't/1003',
    hid: 1003,
    name: 'The Independente Suites & Terrace',
    star_rating: 4,
    address: 'Rua de São Pedro de Alcântara 81, 1250-238 Lisbon',
    regionId: 6053839,
    heroPhoto: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1024',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1024',
      'https://images.unsplash.com/photo-1455587734955-081b22074882?w=1024',
    ],
    amenity_groups: [
      { group_name: 'General', amenities: ['Terrace', 'Free Wi-Fi', 'Non-smoking rooms'] },
      { group_name: 'Food & Drink', amenities: ['Restaurant', 'Bar'] },
    ],
    check_in_time: '14:00',
    check_out_time: '11:00',
    latitude: 38.7147,
    longitude: -9.1432,
    description_struct: [
      {
        title: 'About',
        paragraphs: [
          'A stylish boutique hotel housed in a 19th-century palace, offering stunning terrace views across Lisbon.',
        ],
      },
    ],
    rateTemplates: [
      makeRate('1003-r1', 'Classic Double', 'Classic Double', 'Double bed', '140.00', 'RO', false, 1, 2, 5, 14, 4),
      makeRate('1003-r2', 'Suite with Terrace', 'Suite', 'King bed', '200.00', 'BB', true, 3, 2, 6, 7, 4),
      makeRate('1003-r3', 'Classic Non-refundable', 'Classic Double', 'Double bed', '120.00', 'RO', false, 1, 2, 5, null, 4),
    ],
  },
  {
    id: 't/1004',
    hid: 1004,
    name: 'Palácio Belmonte',
    star_rating: 5,
    address: 'Pátio Dom Fradique 14, 1100-624 Lisbon',
    regionId: 6053839,
    heroPhoto: 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
    images: [
      'https://images.unsplash.com/photo-1455587734955-081b22074882?w=1024',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1024',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1024',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1024',
    ],
    amenity_groups: [
      { group_name: 'General', amenities: ['Pool', 'Concierge', '24-hour front desk'] },
      { group_name: 'Food & Drink', amenities: ['Restaurant', 'Bar', 'Room service'] },
      { group_name: 'Wellness', amenities: ['Spa', 'Pool'] },
    ],
    check_in_time: '15:00',
    check_out_time: '12:00',
    latitude: 38.7138,
    longitude: -9.1316,
    description_struct: [
      {
        title: 'About',
        paragraphs: [
          'One of Lisbon\'s most exclusive addresses, this 15th-century palace next to the Castelo de São Jorge houses 10 individually designed suites.',
        ],
      },
    ],
    rateTemplates: [
      makeRate('1004-r1', 'Palace Suite', 'Suite', 'King bed', '650.00', 'BB', true, 3, 2, 6, 10, 5),
      makeRate('1004-r2', 'Deluxe Suite Pool View', 'Deluxe Suite', 'King bed', '780.00', 'BB', true, 3, 2, 6, 7, 5),
      makeRate('1004-r3', 'Palace Suite Non-refundable', 'Suite', 'King bed', '580.00', 'BB', true, 3, 2, 6, null, 5),
    ],
  },
  {
    id: 't/1005',
    hid: 1005,
    name: 'Hotel Lisboa Plaza',
    star_rating: 4,
    address: 'Travessa do Salitre 7, 1269-066 Lisbon',
    regionId: 6053839,
    heroPhoto: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800',
    images: [
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1024',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1024',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1024',
    ],
    amenity_groups: [
      { group_name: 'General', amenities: ['24-hour front desk', 'Free Wi-Fi', 'Lift'] },
      { group_name: 'Food & Drink', amenities: ['Restaurant', 'Bar'] },
    ],
    check_in_time: '14:00',
    check_out_time: '12:00',
    latitude: 38.7192,
    longitude: -9.1449,
    description_struct: [
      {
        title: 'About',
        paragraphs: ['A classic Lisbon hotel combining traditional Portuguese decor with modern comforts in a central location near Avenida da Liberdade.'],
      },
    ],
    rateTemplates: [
      makeRate('1005-r1', 'Standard Double', 'Standard Double', 'Double bed', '110.00', 'RO', false, 0, 2, 5, 14, 4),
      makeRate('1005-r2', 'Superior Double', 'Superior Double', 'Double bed', '130.00', 'BB', true, 1, 2, 5, 7, 4),
      makeRate('1005-r3', 'Standard Twin', 'Standard Twin', 'Twin beds', '115.00', 'RO', false, 0, 2, 3, 10, 4),
      makeRate('1005-r4', 'Budget Non-refundable', 'Standard Double', 'Double bed', '95.00', 'RO', false, 0, 2, 5, null, 4),
    ],
  },
  {
    id: 't/1006',
    hid: 1006,
    name: 'Martinhal Lisbon Chiado',
    star_rating: 5,
    address: 'Rua das Flores 44, 1200-194 Lisbon',
    regionId: 6053839,
    heroPhoto: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1024',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1024',
      'https://images.unsplash.com/photo-1455587734955-081b22074882?w=1024',
    ],
    amenity_groups: [
      { group_name: 'General', amenities: ['Family rooms', 'Kids club', 'Concierge'] },
      { group_name: 'Food & Drink', amenities: ['Restaurant', 'Bar', 'Room service'] },
    ],
    check_in_time: '15:00',
    check_out_time: '12:00',
    latitude: 38.7099,
    longitude: -9.1401,
    description_struct: [
      { title: 'About', paragraphs: ['Family-friendly luxury in the heart of Chiado, Lisbon\'s most elegant shopping and cultural district.'] },
    ],
    rateTemplates: [
      makeRate('1006-r1', 'Studio Apartment', 'Studio', 'Double bed', '200.00', 'RO', false, 1, 3, 5, 10, 5),
      makeRate('1006-r2', 'One Bedroom Apartment', 'Apartment', 'King bed', '280.00', 'RO', false, 1, 4, 6, 7, 5),
    ],
  },
];

// Tokyo (2395)
const TOKYO_HOTELS: MasterHotel[] = [
  {
    id: 't/2001',
    hid: 2001,
    name: 'Park Hyatt Tokyo',
    star_rating: 5,
    address: '3-7-1-2 Nishi-Shinjuku, Shinjuku, Tokyo 163-1055',
    regionId: 2395,
    heroPhoto: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1024',
      'https://images.unsplash.com/photo-1559508551-44bff1de756b?w=1024',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1024',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1024',
      'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=1024',
    ],
    amenity_groups: [
      { group_name: 'General', amenities: ['Pool', 'Concierge', '24-hour front desk', 'Valet parking'] },
      { group_name: 'Food & Drink', amenities: ['3 restaurants', 'Bar', 'Room service'] },
      { group_name: 'Wellness', amenities: ['Spa', 'Indoor pool', 'Fitness centre'] },
    ],
    check_in_time: '15:00',
    check_out_time: '12:00',
    latitude: 35.6877,
    longitude: 139.6924,
    description_struct: [
      {
        title: 'About',
        paragraphs: [
          'Perched on floors 39–52 of the Shinjuku Park Tower, the Park Hyatt Tokyo offers breathtaking views of the city and Mount Fuji.',
          'Immortalised in the film "Lost in Translation," it remains one of Tokyo\'s most iconic luxury addresses.',
        ],
      },
    ],
    rateTemplates: [
      makeRate('2001-r1', 'Park Deluxe Room', 'Deluxe Room', 'King bed', '680.00', 'RO', false, 3, 2, 6, 7, 5),
      makeRate('2001-r2', 'Park Suite City View', 'Suite', 'King bed', '1100.00', 'BB', true, 3, 2, 6, 5, 5),
      makeRate('2001-r3', 'Park Deluxe Non-refundable', 'Deluxe Room', 'King bed', '600.00', 'RO', false, 3, 2, 6, null, 5),
      makeRate('2001-r4', 'Deluxe Twin', 'Deluxe Twin', 'Twin beds', '720.00', 'BB', true, 3, 2, 3, 7, 5),
    ],
  },
  {
    id: 't/2002',
    hid: 2002,
    name: 'Aman Tokyo',
    star_rating: 5,
    address: 'The Otemachi Tower, 1-5-6 Otemachi, Chiyoda, Tokyo',
    regionId: 2395,
    heroPhoto: 'https://images.unsplash.com/photo-1559508551-44bff1de756b?w=800',
    images: [
      'https://images.unsplash.com/photo-1559508551-44bff1de756b?w=1024',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1024',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1024',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1024',
    ],
    amenity_groups: [
      { group_name: 'General', amenities: ['Concierge', 'Valet parking', 'Private dining'] },
      { group_name: 'Wellness', amenities: ['Spa', 'Indoor pool', 'Yoga studio'] },
    ],
    check_in_time: '15:00',
    check_out_time: '12:00',
    latitude: 35.6869,
    longitude: 139.7669,
    description_struct: [
      { title: 'About', paragraphs: ['Occupying six floors of the Otemachi Tower, Aman Tokyo is one of the largest Aman properties in the world. Japanese minimalism meets world-class service.'] },
    ],
    rateTemplates: [
      makeRate('2002-r1', 'Aman Suite', 'Suite', 'King bed', '1500.00', 'BB', true, 3, 2, 6, 10, 5),
      makeRate('2002-r2', 'Deluxe Room', 'Deluxe Room', 'King bed', '900.00', 'RO', false, 3, 2, 6, 7, 5),
      makeRate('2002-r3', 'Deluxe Non-refundable', 'Deluxe Room', 'King bed', '820.00', 'RO', false, 3, 2, 6, null, 5),
    ],
  },
  {
    id: 't/2003',
    hid: 2003,
    name: 'The Peninsula Tokyo',
    star_rating: 5,
    address: '1-8-1 Yurakucho, Chiyoda, Tokyo 100-0006',
    regionId: 2395,
    heroPhoto: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
    images: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1024',
      'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=1024',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1024',
    ],
    amenity_groups: [
      { group_name: 'General', amenities: ['Pool', 'Concierge', 'Helipad', '24-hour front desk'] },
      { group_name: 'Food & Drink', amenities: ['Multiple restaurants', 'Bar', 'Afternoon tea'] },
    ],
    check_in_time: '15:00',
    check_out_time: '12:00',
    latitude: 35.6748,
    longitude: 139.7617,
    description_struct: [
      { title: 'About', paragraphs: ['Superbly located between the Imperial Palace and Ginza shopping district, The Peninsula Tokyo combines Japanese artistry with Peninsula\'s legendary service tradition.'] },
    ],
    rateTemplates: [
      makeRate('2003-r1', 'Deluxe Room', 'Deluxe Room', 'King bed', '750.00', 'RO', false, 3, 2, 6, 7, 5),
      makeRate('2003-r2', 'Superior Room', 'Superior Room', 'Double bed', '620.00', 'RO', false, 1, 2, 5, 10, 5),
      makeRate('2003-r3', 'Deluxe Non-refundable', 'Deluxe Room', 'King bed', '680.00', 'RO', false, 3, 2, 6, null, 5),
      makeRate('2003-r4', 'Suite', 'Suite', 'King bed', '1200.00', 'BB', true, 3, 2, 6, 5, 5),
    ],
  },
  {
    id: 't/2004',
    hid: 2004,
    name: 'Shinjuku Granbell Hotel',
    star_rating: 3,
    address: '2-14-5 Kabukicho, Shinjuku, Tokyo 160-0021',
    regionId: 2395,
    heroPhoto: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
    images: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1024',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1024',
    ],
    amenity_groups: [
      { group_name: 'General', amenities: ['24-hour front desk', 'Free Wi-Fi', 'Luggage storage'] },
      { group_name: 'Food & Drink', amenities: ['Bar'] },
    ],
    check_in_time: '15:00',
    check_out_time: '11:00',
    latitude: 35.6950,
    longitude: 139.7030,
    description_struct: [
      { title: 'About', paragraphs: ['A design-forward boutique hotel in the heart of Kabukicho, Shinjuku\'s entertainment district. Modern rooms with distinctive artistic themes.'] },
    ],
    rateTemplates: [
      makeRate('2004-r1', 'Standard Double', 'Standard Double', 'Double bed', '120.00', 'RO', false, 0, 2, 5, 14, 3),
      makeRate('2004-r2', 'Superior Twin', 'Superior Twin', 'Twin beds', '140.00', 'RO', false, 0, 2, 3, 10, 3),
      makeRate('2004-r3', 'Budget Non-refundable', 'Standard Double', 'Double bed', '100.00', 'RO', false, 0, 2, 5, null, 3),
    ],
  },
  {
    id: 't/2005',
    hid: 2005,
    name: 'Cerulean Tower Tokyu Hotel',
    star_rating: 4,
    address: '26-1 Sakuragaokacho, Shibuya, Tokyo 150-8512',
    regionId: 2395,
    heroPhoto: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800',
    images: [
      'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=1024',
      'https://images.unsplash.com/photo-1559508551-44bff1de756b?w=1024',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1024',
    ],
    amenity_groups: [
      { group_name: 'General', amenities: ['Pool', 'Concierge', 'Business centre'] },
      { group_name: 'Food & Drink', amenities: ['3 restaurants', 'Bar', 'Room service'] },
    ],
    check_in_time: '14:00',
    check_out_time: '12:00',
    latitude: 35.6574,
    longitude: 139.6985,
    description_struct: [
      { title: 'About', paragraphs: ['Towering over Shibuya, the Cerulean Tower offers spectacular city views and is walking distance from the world\'s busiest pedestrian crossing.'] },
    ],
    rateTemplates: [
      makeRate('2005-r1', 'Superior Room', 'Superior Room', 'Double bed', '280.00', 'RO', false, 3, 2, 5, 10, 4),
      makeRate('2005-r2', 'Deluxe City View', 'Deluxe Room', 'King bed', '340.00', 'BB', true, 3, 2, 6, 7, 4),
      makeRate('2005-r3', 'Standard Non-refundable', 'Standard Room', 'Double bed', '220.00', 'RO', false, 0, 2, 5, null, 4),
    ],
  },
];

// Madrid (2734)
const MADRID_HOTELS: MasterHotel[] = [
  {
    id: 't/3001',
    hid: 3001,
    name: 'Hotel Ritz Madrid',
    star_rating: 5,
    address: 'Plaza de la Lealtad 5, 28014 Madrid',
    regionId: 2734,
    heroPhoto: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1024',
      'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=1024',
      'https://images.unsplash.com/photo-1597211684565-dca64d72bdfe?w=1024',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1024',
    ],
    amenity_groups: [
      { group_name: 'General', amenities: ['Pool', 'Concierge', 'Valet parking', 'Doorman'] },
      { group_name: 'Food & Drink', amenities: ['Grill restaurant', 'Bar', 'Afternoon tea'] },
      { group_name: 'Wellness', amenities: ['Spa', 'Indoor pool', 'Fitness centre'] },
    ],
    check_in_time: '15:00',
    check_out_time: '12:00',
    latitude: 40.4149,
    longitude: -3.6919,
    description_struct: [
      {
        title: 'About',
        paragraphs: [
          'The legendary Hotel Ritz Madrid, a Mandarin Oriental property, is Madrid\'s most iconic grande dame hotel, facing the Prado Museum and Retiro Park.',
          'Built in 1910 at the behest of King Alfonso XIII, it embodies the golden age of European luxury travel.',
        ],
      },
    ],
    rateTemplates: [
      makeRate('3001-r1', 'Deluxe Room', 'Deluxe Room', 'King bed', '580.00', 'RO', false, 1, 2, 6, 7, 5),
      makeRate('3001-r2', 'Superior Room Garden View', 'Superior Room', 'King bed', '650.00', 'BB', true, 3, 2, 6, 5, 5),
      makeRate('3001-r3', 'Junior Suite', 'Junior Suite', 'King bed', '880.00', 'BB', true, 3, 2, 6, 3, 5),
      makeRate('3001-r4', 'Deluxe Non-refundable', 'Deluxe Room', 'King bed', '520.00', 'RO', false, 1, 2, 6, null, 5),
    ],
  },
  {
    id: 't/3002',
    hid: 3002,
    name: 'Gran Hotel Inglés',
    star_rating: 5,
    address: 'Calle de Echegaray 8, 28014 Madrid',
    regionId: 2734,
    heroPhoto: 'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=800',
    images: [
      'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=1024',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1024',
      'https://images.unsplash.com/photo-1597211684565-dca64d72bdfe?w=1024',
    ],
    amenity_groups: [
      { group_name: 'General', amenities: ['Rooftop terrace', 'Concierge', '24-hour front desk'] },
      { group_name: 'Food & Drink', amenities: ['Restaurant', 'Rooftop bar'] },
    ],
    check_in_time: '15:00',
    check_out_time: '12:00',
    latitude: 40.4138,
    longitude: -3.7000,
    description_struct: [
      { title: 'About', paragraphs: ['Madrid\'s oldest hotel (1853), beautifully restored in the heart of the Barrio de las Letras literary quarter. The spectacular rooftop bar overlooks the Madrid skyline.'] },
    ],
    rateTemplates: [
      makeRate('3002-r1', 'Superior Room', 'Superior Room', 'King bed', '320.00', 'RO', false, 1, 2, 6, 10, 5),
      makeRate('3002-r2', 'Deluxe Room', 'Deluxe Room', 'King bed', '380.00', 'BB', true, 1, 2, 6, 7, 5),
      makeRate('3002-r3', 'Standard Non-refundable', 'Standard Room', 'Double bed', '280.00', 'RO', false, 0, 2, 5, null, 5),
    ],
  },
  {
    id: 't/3003',
    hid: 3003,
    name: 'Hyatt Regency Hesperia Madrid',
    star_rating: 5,
    address: 'Paseo de la Castellana 57, 28046 Madrid',
    regionId: 2734,
    heroPhoto: 'https://images.unsplash.com/photo-1597211684565-dca64d72bdfe?w=800',
    images: [
      'https://images.unsplash.com/photo-1597211684565-dca64d72bdfe?w=1024',
      'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=1024',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1024',
    ],
    amenity_groups: [
      { group_name: 'General', amenities: ['Pool', 'Business centre', 'Concierge'] },
      { group_name: 'Food & Drink', amenities: ['Restaurant', 'Bar', 'Room service'] },
    ],
    check_in_time: '15:00',
    check_out_time: '12:00',
    latitude: 40.4377,
    longitude: -3.6899,
    description_struct: [
      { title: 'About', paragraphs: ['A sleek modern tower on Paseo de la Castellana, Madrid\'s grand boulevard, ideal for business and leisure travellers seeking a central base.'] },
    ],
    rateTemplates: [
      makeRate('3003-r1', 'Standard Room', 'Standard Room', 'King bed', '180.00', 'RO', false, 0, 2, 6, 14, 5),
      makeRate('3003-r2', 'Superior Room', 'Superior Room', 'King bed', '210.00', 'BB', true, 1, 2, 6, 10, 5),
      makeRate('3003-r3', 'Budget Non-refundable', 'Standard Room', 'King bed', '160.00', 'RO', false, 0, 2, 6, null, 5),
    ],
  },
  {
    id: 't/3004',
    hid: 3004,
    name: 'NH Collection Madrid Gran Vía',
    star_rating: 4,
    address: 'Gran Vía 21, 28013 Madrid',
    regionId: 2734,
    heroPhoto: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
    images: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1024',
      'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=1024',
    ],
    amenity_groups: [
      { group_name: 'General', amenities: ['24-hour front desk', 'Free Wi-Fi', 'Terrace'] },
      { group_name: 'Food & Drink', amenities: ['Restaurant', 'Bar'] },
    ],
    check_in_time: '14:00',
    check_out_time: '12:00',
    latitude: 40.4200,
    longitude: -3.7027,
    description_struct: [
      { title: 'About', paragraphs: ['Contemporary hotel in a stunning Beaux-Arts building right on Gran Vía, Madrid\'s most iconic boulevard. Rooftop terrace with panoramic city views.'] },
    ],
    rateTemplates: [
      makeRate('3004-r1', 'Superior Room', 'Superior Room', 'Double bed', '150.00', 'RO', false, 0, 2, 5, 14, 4),
      makeRate('3004-r2', 'Deluxe Gran Via View', 'Deluxe Room', 'King bed', '190.00', 'BB', true, 3, 2, 6, 7, 4),
      makeRate('3004-r3', 'Standard Non-refundable', 'Standard Room', 'Double bed', '130.00', 'RO', false, 0, 2, 5, null, 4),
    ],
  },
  {
    id: 't/3005',
    hid: 3005,
    name: 'Room Mate Óscar',
    star_rating: 4,
    address: 'Plaza Pedro Zerolo 12, 28004 Madrid',
    regionId: 2734,
    heroPhoto: 'https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=800',
    images: [
      'https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=1024',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1024',
    ],
    amenity_groups: [
      { group_name: 'General', amenities: ['Rooftop pool', 'Free Wi-Fi', '24-hour front desk'] },
      { group_name: 'Food & Drink', amenities: ['Rooftop bar'] },
    ],
    check_in_time: '14:00',
    check_out_time: '11:00',
    latitude: 40.4227,
    longitude: -3.7007,
    description_struct: [
      { title: 'About', paragraphs: ['A vibrant design hotel in the Chueca neighbourhood with a legendary rooftop pool — one of the most social spots in Madrid.'] },
    ],
    rateTemplates: [
      makeRate('3005-r1', 'Standard Double', 'Standard Double', 'Double bed', '110.00', 'RO', false, 0, 2, 5, 14, 4),
      makeRate('3005-r2', 'Deluxe Double', 'Deluxe Double', 'King bed', '145.00', 'RO', false, 0, 2, 6, 7, 4),
      makeRate('3005-r3', 'Budget Non-refundable', 'Standard Double', 'Double bed', '95.00', 'RO', false, 0, 2, 5, null, 4),
    ],
  },
];

// Dubai (2011)
const DUBAI_HOTELS: MasterHotel[] = [
  {
    id: 't/4001',
    hid: 4001,
    name: 'Atlantis, The Palm',
    star_rating: 5,
    address: 'Crescent Road, The Palm, Dubai',
    regionId: 2011,
    heroPhoto: 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=800',
    images: [
      'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=1024',
      'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=1024',
      'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1024',
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1024',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1024',
    ],
    amenity_groups: [
      { group_name: 'General', amenities: ['Waterpark', 'Beach', 'Aquarium', 'Concierge'] },
      { group_name: 'Food & Drink', amenities: ['17 restaurants', 'Multiple bars', 'Room service'] },
      { group_name: 'Wellness', amenities: ['Aquaventure Waterpark', 'ShuiQi Spa', 'Fitness centre'] },
    ],
    check_in_time: '15:00',
    check_out_time: '12:00',
    latitude: 25.1304,
    longitude: 55.1177,
    description_struct: [
      {
        title: 'About',
        paragraphs: [
          'Atlantis, The Palm is Dubai\'s iconic resort destination on the tip of The Palm Jumeirah. Home to Aquaventure Waterpark and The Lost Chambers Aquarium.',
          'With 17 restaurants and bars, it offers unparalleled dining experiences alongside spectacular ocean and cityscape views.',
        ],
      },
    ],
    rateTemplates: [
      makeRate('4001-r1', 'Coral King Room', 'Coral King', 'King bed', '450.00', 'BB', true, 3, 2, 6, 7, 5),
      makeRate('4001-r2', 'Ocean King Room', 'Ocean King', 'King bed', '560.00', 'BB', true, 3, 2, 6, 5, 5),
      makeRate('4001-r3', 'Signature Suite', 'Signature Suite', 'King bed', '1200.00', 'BB', true, 3, 2, 6, 3, 5),
      makeRate('4001-r4', 'Coral Non-refundable', 'Coral King', 'King bed', '400.00', 'BB', true, 3, 2, 6, null, 5),
    ],
  },
  {
    id: 't/4002',
    hid: 4002,
    name: 'Burj Al Arab Jumeirah',
    star_rating: 5,
    address: 'Jumeirah St, Dubai',
    regionId: 2011,
    heroPhoto: 'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=800',
    images: [
      'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=1024',
      'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=1024',
      'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1024',
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1024',
    ],
    amenity_groups: [
      { group_name: 'General', amenities: ['Butler service', 'Private beach', 'Helipad', 'Rolls Royce fleet'] },
      { group_name: 'Food & Drink', amenities: ['9 restaurants', 'Underwater restaurant', 'Skyview bar'] },
      { group_name: 'Wellness', amenities: ['Talise Spa', 'Thermal suite', 'Pool'] },
    ],
    check_in_time: '15:00',
    check_out_time: '12:00',
    latitude: 25.1412,
    longitude: 55.1853,
    description_struct: [
      {
        title: 'About',
        paragraphs: [
          'The sail-shaped Burj Al Arab stands on its own artificial island and is considered the world\'s most luxurious hotel.',
          'All 202 suites span two floors, with 24-hour butler service and private chauffeur-driven Rolls Royces.',
        ],
      },
    ],
    rateTemplates: [
      makeRate('4002-r1', 'Deluxe One Bedroom Suite', 'One Bedroom Suite', 'King bed', '2200.00', 'BB', true, 3, 2, 6, 7, 5),
      makeRate('4002-r2', 'Panoramic Suite', 'Panoramic Suite', 'King bed', '3500.00', 'BB', true, 3, 2, 6, 5, 5),
      makeRate('4002-r3', 'Deluxe Non-refundable', 'One Bedroom Suite', 'King bed', '2000.00', 'BB', true, 3, 2, 6, null, 5),
    ],
  },
  {
    id: 't/4003',
    hid: 4003,
    name: 'Four Seasons Resort Dubai at Jumeirah Beach',
    star_rating: 5,
    address: 'Jumeirah Beach Road, Dubai',
    regionId: 2011,
    heroPhoto: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800',
    images: [
      'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1024',
      'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=1024',
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1024',
    ],
    amenity_groups: [
      { group_name: 'General', amenities: ['Private beach', 'Pool', 'Concierge', 'Kids club'] },
      { group_name: 'Food & Drink', amenities: ['5 restaurants', 'Beachside bar', 'Room service'] },
      { group_name: 'Wellness', amenities: ['Spa', 'Fitness centre', '3 pools'] },
    ],
    check_in_time: '15:00',
    check_out_time: '12:00',
    latitude: 25.1972,
    longitude: 55.2330,
    description_struct: [
      { title: 'About', paragraphs: ['A beachfront resort directly on the Arabian Gulf, the Four Seasons Dubai combines Arabian heritage with contemporary design and world-class Four Seasons service.'] },
    ],
    rateTemplates: [
      makeRate('4003-r1', 'Garden View Room', 'Garden View', 'King bed', '520.00', 'BB', true, 1, 2, 6, 10, 5),
      makeRate('4003-r2', 'Sea View Room', 'Sea View', 'King bed', '680.00', 'BB', true, 3, 2, 6, 7, 5),
      makeRate('4003-r3', 'Junior Suite Ocean', 'Junior Suite', 'King bed', '950.00', 'BB', true, 3, 2, 6, 5, 5),
      makeRate('4003-r4', 'Garden Non-refundable', 'Garden View', 'King bed', '460.00', 'BB', true, 1, 2, 6, null, 5),
    ],
  },
  {
    id: 't/4004',
    hid: 4004,
    name: 'Address Downtown Dubai',
    star_rating: 5,
    address: 'Sheikh Mohammed bin Rashid Blvd, Dubai',
    regionId: 2011,
    heroPhoto: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800',
    images: [
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1024',
      'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1024',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1024',
    ],
    amenity_groups: [
      { group_name: 'General', amenities: ['Burj Khalifa views', 'Pool', 'Concierge'] },
      { group_name: 'Food & Drink', amenities: ['Multiple restaurants', 'Rooftop bar', 'Room service'] },
    ],
    check_in_time: '15:00',
    check_out_time: '12:00',
    latitude: 25.1924,
    longitude: 55.2797,
    description_struct: [
      { title: 'About', paragraphs: ['Steps from the Burj Khalifa and Dubai Fountain, Address Downtown is perfectly placed for exploring Dubai\'s most spectacular urban landmark.'] },
    ],
    rateTemplates: [
      makeRate('4004-r1', 'Deluxe City View', 'Deluxe Room', 'King bed', '380.00', 'RO', false, 3, 2, 6, 7, 5),
      makeRate('4004-r2', 'Deluxe Burj View', 'Deluxe Room', 'King bed', '480.00', 'BB', true, 3, 2, 6, 5, 5),
      makeRate('4004-r3', 'Standard Non-refundable', 'Standard Room', 'King bed', '320.00', 'RO', false, 1, 2, 6, null, 5),
    ],
  },
  {
    id: 't/4005',
    hid: 4005,
    name: 'MÖVENPICK Hotel Jumeirah Beach',
    star_rating: 4,
    address: 'Al Mamsha St, Jumeirah Beach Residence, Dubai',
    regionId: 2011,
    heroPhoto: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    images: [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1024',
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1024',
    ],
    amenity_groups: [
      { group_name: 'General', amenities: ['Beach access', 'Pool', 'Free Wi-Fi'] },
      { group_name: 'Food & Drink', amenities: ['Restaurant', 'Bar', 'Room service'] },
    ],
    check_in_time: '14:00',
    check_out_time: '12:00',
    latitude: 25.0777,
    longitude: 55.1302,
    description_struct: [
      { title: 'About', paragraphs: ['A stylish beachfront hotel in the popular Jumeirah Beach Residence (JBR) district, with direct beach access and a rooftop pool.'] },
    ],
    rateTemplates: [
      makeRate('4005-r1', 'Standard Room', 'Standard Room', 'King bed', '180.00', 'RO', false, 0, 2, 6, 14, 4),
      makeRate('4005-r2', 'Deluxe Sea View', 'Deluxe Room', 'King bed', '240.00', 'BB', true, 3, 2, 6, 7, 4),
      makeRate('4005-r3', 'Budget Non-refundable', 'Standard Room', 'King bed', '155.00', 'RO', false, 0, 2, 6, null, 4),
    ],
  },
];

export const ALL_HOTELS: MasterHotel[] = [
  ...LISBON_HOTELS,
  ...TOKYO_HOTELS,
  ...MADRID_HOTELS,
  ...DUBAI_HOTELS,
];

export const HOTELS_BY_REGION: Record<number, MasterHotel[]> = {
  6053839: LISBON_HOTELS,
  2395: TOKYO_HOTELS,
  2734: MADRID_HOTELS,
  2011: DUBAI_HOTELS,
};

export function getHotelByHid(hid: number): MasterHotel | undefined {
  return ALL_HOTELS.find((h) => h.hid === hid);
}

export function getHotelById(id: string): MasterHotel | undefined {
  return ALL_HOTELS.find((h) => h.id === id);
}

export function makeSearchHash(hotelId: string, rateId: string, checkin: string): string {
  return `sh-${hotelId}-${rateId}-${checkin}`.replace(/\//g, '_');
}

export function makeBookHash(searchHash: string): string {
  return `bh-${searchHash.slice(0, 20)}`;
}
