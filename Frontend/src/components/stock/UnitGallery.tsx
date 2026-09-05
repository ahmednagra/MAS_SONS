import Image from 'next/image';
import type { UnitImage } from '@/types/stock';

export function UnitGallery({ images }: { images: UnitImage[] }) {
  if (!images.length) return null;
  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-paper">
        <Image src={images[0].url} alt="" fill priority sizes="(max-width: 768px) 100vw, 800px" className="object-cover" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.slice(1).map((img) => (
            <div key={img.id} className="relative aspect-[4/3] w-32 flex-none overflow-hidden rounded-sm bg-paper">
              <Image src={img.url} alt="" fill loading="lazy" sizes="128px" className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
