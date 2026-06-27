import { useTranslation } from '@hooks/useTranslation';
import { Icon } from '@iconify/react';
import type { GalleryPhoto } from '@lib/config/types';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect } from 'react';

interface LightboxProps {
  photos: GalleryPhoto[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Lightbox({ photos, currentIndex, onClose, onNext, onPrev }: LightboxProps) {
  const { t } = useTranslation();
  const currentPhoto = photos[currentIndex];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    },
    [onClose, onNext, onPrev],
  );

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          aria-label={t('image.close')}
        >
          <Icon icon="fa6-solid:xmark" className="h-6 w-6" />
        </button>

        {/* Prev button */}
        {photos.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute top-1/2 left-4 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label={t('image.prev')}
          >
            <Icon icon="fa6-solid:chevron-left" className="h-6 w-6" />
          </button>
        )}

        {/* Next button */}
        {photos.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute top-1/2 right-4 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label={t('image.next')}
          >
            <Icon icon="fa6-solid:chevron-right" className="h-6 w-6" />
          </button>
        )}

        {/* Image */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex max-h-[85vh] max-w-[90vw] flex-col items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={currentPhoto.src}
            alt={currentPhoto.alt ?? ''}
            className="max-h-[80vh] max-w-full rounded-lg object-contain"
          />
          {(currentPhoto.caption || photos.length > 1) && (
            <div className="mt-4 flex flex-col items-center gap-1 text-center text-white">
              {currentPhoto.caption && <p className="text-sm text-white/90">{currentPhoto.caption}</p>}
              {photos.length > 1 && (
                <p className="text-white/60 text-xs">
                  {t('image.counter', { current: currentIndex + 1, total: photos.length })}
                </p>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
