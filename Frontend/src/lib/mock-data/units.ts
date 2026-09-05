// Temporary fixture standing in for searchStockServer() until the backend exists.
import type { Unit } from '@/types/stock';

export const MOCK_UNITS: Unit[] = [
  {
    id: 'prado', slug: '2019-toyota-land-cruiser-prado-tx-l', category: 'vehicle',
    make: 'Toyota', model: 'Land Cruiser Prado TX-L', year: 2019, price: 28500, port: 'Yokohama',
    mileage: 42000, steeringPosition: 'RHD', auctionGrade: '4.5', repairHistory: false,
    chassisNumber: 'TRJ150-0012345', engine: '2.8L Diesel', fuelType: 'Diesel', transmission: 'Automatic',
    description: 'Silver Toyota Land Cruiser Prado TX-L, auction grade 4.5, RHD.',
    images: [{ id: 'prado-1', url: '/mock/prado.jpg' }], status: 'in_stock', updatedAt: '2026-09-01',
  },
  {
    id: 'hiace', slug: '2020-toyota-hiace-super-gl', category: 'vehicle',
    make: 'Toyota', model: 'Hiace Super GL', year: 2020, price: 19800, port: 'Yokohama',
    mileage: 61000, steeringPosition: 'RHD', auctionGrade: '4', repairHistory: false,
    chassisNumber: 'KDH201-0067890', engine: '2.7L Petrol', fuelType: 'Petrol', transmission: 'Automatic',
    description: 'White Toyota HiAce panel van, auction grade 4.0, RHD.',
    images: [{ id: 'hiace-1', url: '/mock/hiace.jpg' }], status: 'in_stock', updatedAt: '2026-09-01',
  },
  {
    id: 'prius', slug: '2020-toyota-prius-s', category: 'vehicle',
    make: 'Toyota', model: 'Prius S', year: 2020, price: 14300, port: 'Yokohama',
    mileage: 29000, steeringPosition: 'RHD', auctionGrade: '4.5', repairHistory: false,
    chassisNumber: 'ZVW51-0034521', engine: '1.8L Hybrid', fuelType: 'Hybrid', transmission: 'CVT',
    description: 'Toyota Prius hybrid sedan, auction grade 4.5, RHD.',
    images: [{ id: 'prius-1', url: '/mock/prius.jpg' }], status: 'in_stock', updatedAt: '2026-09-01',
  },
  {
    id: 'note', slug: '2018-nissan-note-e-power', category: 'vehicle',
    make: 'Nissan', model: 'Note e-Power', year: 2018, price: 9200, port: 'Yokohama',
    mileage: 38000, steeringPosition: 'RHD', auctionGrade: '4', repairHistory: false,
    chassisNumber: 'HE12-0098123', engine: '1.2L Hybrid', fuelType: 'Hybrid', transmission: 'CVT',
    description: 'Nissan Note compact hatchback, auction grade 4.0, RHD.',
    images: [{ id: 'note-1', url: '/mock/note.jpg' }], status: 'in_stock', updatedAt: '2026-09-01',
  },
  {
    id: 'excavator', slug: 'komatsu-pc200-8-excavator', category: 'equipment',
    make: 'Komatsu', model: 'PC200-8 Excavator', year: 2015, price: 46000, port: 'Nagoya',
    hours: 6800, auctionGrade: '4', repairHistory: false, chassisNumber: 'PC200-80-JA12345',
    description: 'Tracked hydraulic excavator, 20t class, auction grade 4.0.',
    images: [{ id: 'excavator-1', url: '/mock/excavator.jpg' }], status: 'in_stock', updatedAt: '2026-09-01',
  },
  {
    id: 'tractor', slug: 'kubota-m7040-tractor', category: 'equipment',
    make: 'Kubota', model: 'M7040 Tractor', year: 2017, price: 18900, port: 'Nagoya',
    hours: 2100, auctionGrade: '4.5', repairHistory: false, chassisNumber: 'M7040-DT-55210',
    description: 'Four-wheel-drive agricultural tractor, auction grade 4.5.',
    images: [{ id: 'tractor-1', url: '/mock/tractor.jpg' }], status: 'in_stock', updatedAt: '2026-09-01',
  },
  {
    id: 'loader', slug: 'komatsu-wa200-wheel-loader', category: 'equipment',
    make: 'Komatsu', model: 'WA200 Wheel Loader', year: 2016, price: 34500, port: 'Nagoya',
    hours: 5200, auctionGrade: '4', repairHistory: false, chassisNumber: 'WA200-6-A88012',
    description: 'Wheel loader with 2.0 m³ bucket, auction grade 4.0.',
    images: [{ id: 'loader-1', url: '/mock/loader.jpg' }], status: 'in_stock', updatedAt: '2026-09-01',
  },
  {
    id: 'forklift', slug: 'toyota-8fd25-forklift', category: 'equipment',
    make: 'Toyota', model: '8FD25 Forklift', year: 2018, price: 14600, port: 'Nagoya',
    hours: 3400, auctionGrade: '4', repairHistory: false, chassisNumber: '8FD25-002391',
    description: 'Counterbalance diesel forklift, 2.5t class, auction grade 4.0.',
    images: [{ id: 'forklift-1', url: '/mock/forklift.jpg' }], status: 'in_stock', updatedAt: '2026-09-01',
  },
];

export const MOCK_STATS = { unitsInStock: 1240, countriesServed: 18, gradeVerifiedPct: 100, shippingPorts: 4 };

export const MOCK_STOCK_SPLIT = { vehicles: 840, equipment: 400 };

export const MOCK_GRADE_DIST: Array<{ grade: string; count: number }> = [
  { grade: '5', count: 62 },
  { grade: '4.5', count: 385 },
  { grade: '4', count: 471 },
  { grade: '3.5', count: 186 },
  { grade: '3', count: 74 },
  { grade: 'R', count: 49 },
  { grade: 'RA', count: 13 },
];

export const MOCK_SHIPPING_LANES: Array<{ port: string; country: string; cx: number; cy: number; transit: string }> = [
  { port: 'Karachi', country: 'Pakistan', cx: 217, cy: 80, transit: '~18 days' },
  { port: 'Jebel Ali', country: 'United Arab Emirates', cx: 161, cy: 80, transit: '~20 days' },
  { port: 'Mombasa', country: 'Kenya', cx: 90, cy: 196, transit: '~24 days' },
  { port: 'Durban', country: 'South Africa', cx: 51, cy: 300, transit: '~30 days' },
];

export const MOCK_TESTIMONIALS: Array<{ quote: string; name: string; location: string }> = [
  { quote: 'The auction sheet matched the car exactly when it arrived in Mombasa. First time I’ve bought sight-unseen and had zero surprises.', name: 'Daniel M.', location: 'Mombasa, Kenya' },
  { quote: 'Ordered an excavator for our site in Gauteng. Grade was accurate, shipping took 5 weeks as quoted, no hidden fees at the port.', name: 'Thandiwe N.', location: 'Durban, South Africa' },
  { quote: 'Quick WhatsApp replies, honest about a scratch I wouldn’t have known about otherwise. Would source through them again.', name: 'Rashid A.', location: 'Jebel Ali, UAE' },
  { quote: 'Family business feel — same person handled my quote from start to bill of lading.', name: 'Bilal K.', location: 'Karachi, Pakistan' },
];
