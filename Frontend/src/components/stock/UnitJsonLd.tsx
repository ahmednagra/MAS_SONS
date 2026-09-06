import { env } from '@/lib/env';
import type { Unit } from '@/types/stock';

/** schema.org Vehicle/Product structured data — rich results for price, availability, mileage, VIN. */
export function UnitJsonLd({ unit }: { unit: Unit }) {
  const url = `${env.NEXT_PUBLIC_SITE_URL}/stock/${unit.slug}`;
  const availability = unit.status === 'in_stock' ? 'https://schema.org/InStock' : unit.status === 'sold' ? 'https://schema.org/SoldOut' : 'https://schema.org/PreOrder';
  const data = {
    '@context': 'https://schema.org',
    '@type': unit.category === 'vehicle' ? 'Car' : 'Vehicle',
    name: `${unit.year} ${unit.make} ${unit.model}`,
    url,
    image: unit.images.map((i) => i.url),
    description: unit.description,
    brand: { '@type': 'Brand', name: unit.make },
    model: unit.model,
    vehicleModelDate: String(unit.year),
    bodyType: unit.body_type,
    color: unit.color ?? undefined,
    vehicleIdentificationNumber: unit.chassis_number,
    fuelType: unit.fuel_type ?? undefined,
    vehicleTransmission: unit.transmission ?? undefined,
    driveWheelConfiguration: unit.drivetrain ?? undefined,
    steeringPosition: unit.steering_position === 'LHD' ? 'https://schema.org/LeftHandDriving' : unit.steering_position === 'RHD' ? 'https://schema.org/RightHandDriving' : undefined,
    mileageFromOdometer: unit.mileage_km != null ? { '@type': 'QuantitativeValue', value: unit.mileage_km, unitCode: 'KMT' } : undefined,
    vehicleEngine: unit.engine ? { '@type': 'EngineSpecification', name: unit.engine, engineDisplacement: unit.displacement_cc ? { '@type': 'QuantitativeValue', value: unit.displacement_cc, unitCode: 'CMQ' } : undefined } : undefined,
    itemCondition: 'https://schema.org/UsedCondition',
    offers: {
      '@type': 'Offer',
      url,
      price: unit.price_usd,
      priceCurrency: 'USD',
      availability,
      itemCondition: 'https://schema.org/UsedCondition',
      seller: { '@type': 'Organization', name: 'M.A.S & SONS', address: { '@type': 'PostalAddress', addressLocality: 'Shimotsuma', addressRegion: 'Ibaraki', addressCountry: 'JP' } },
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
