import { Badge } from '@components/ui/badge';
import { useTranslation } from '@hooks/useTranslation';
import { Icon } from '@iconify/react';
import type { GalleryAlbum } from '@lib/config/types';
import { buildAlbumPath } from '@lib/gallery';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface AlbumCardProps {
  album: GalleryAlbum;
  index?: number;
}

export default function AlbumCard({ album, index = 0 }: AlbumCardProps) {
  const { t } = useTranslation();
  const photoCount = album.photos?.length ?? 0;

  return (
    <motion.a
      href={buildAlbumPath(album.slug)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-card transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-card-darker dark:bg-gray-900/60',
      )}
    >
      {/* Cover image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={album.cover}
          alt={album.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {/* Photo count badge */}
        <div className="absolute top-3 right-3 rounded-full bg-black/50 px-2.5 py-1 font-medium text-white text-xs backdrop-blur-sm">
          {t('gallery.photoCount', { count: photoCount })}
        </div>
        {/* Title & meta overlay */}
        <div className="absolute right-0 bottom-0 left-0 p-4 text-white">
          <h3 className="mb-1 font-bold text-xl tracking-wide drop-shadow-md">{album.title}</h3>
          {album.description && <p className="mb-2 line-clamp-2 text-sm text-white/90 drop-shadow">{album.description}</p>}
          <div className="flex flex-wrap items-center gap-3 text-white/80 text-xs">
            {album.date && (
              <span className="flex items-center gap-1">
                <Icon icon="fa6-solid:calendar-days" className="h-3.5 w-3.5" />
                {album.date}
              </span>
            )}
            {album.location && (
              <span className="flex items-center gap-1">
                <Icon icon="fa6-solid:location-dot" className="h-3.5 w-3.5" />
                {album.location}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      {album.tags && album.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 border-gray-100 border-t p-3 dark:border-gray-800">
          {album.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="shrink-0 gap-0.5 whitespace-nowrap border-none px-1 font-bold text-pink-500 text-xs transition-colors duration-300 hover:text-pink-600 dark:text-pink-400"
            >
              <Icon icon="fa6-solid:tags" className="h-3 w-3" />
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </motion.a>
  );
}
