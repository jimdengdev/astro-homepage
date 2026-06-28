import type { GalleryPhoto } from '@lib/config/types';
import { useCallback, useState } from 'react';
import Lightbox from './Lightbox';

interface PhotoGridProps {
  photos: GalleryPhoto[];
}

export default function PhotoGrid({ photos }: PhotoGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const goNext = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return prev < photos.length - 1 ? prev + 1 : 0;
    });
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return prev > 0 ? prev - 1 : photos.length - 1;
    });
  }, [photos.length]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {photos.map((photo, index) => (
          <button
            key={`${photo.src}-${index}`}
            type="button"
            onClick={() => openLightbox(index)}
            className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 dark:bg-gray-800"
          >
            <img
              src={photo.src}
              alt={photo.alt ?? ''}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {photo.caption && (
              <div className="absolute inset-x-0 bottom-0 p-2 pb-2.5 text-center">
                <span className="line-clamp-1 font-medium text-white text-xs shadow-text">{photo.caption}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox photos={photos} currentIndex={lightboxIndex} onClose={closeLightbox} onNext={goNext} onPrev={goPrev} />
      )}
    </>
  );
}
