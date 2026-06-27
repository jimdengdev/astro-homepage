import { useTranslation } from '@hooks/useTranslation';
import type { GalleryAlbum } from '@lib/config/types';
import { filterAlbumsByTag, getAlbumTags } from '@lib/gallery';
import { useMemo, useState } from 'react';
import AlbumCard from './AlbumCard';
import TagFilter from './TagFilter';

interface AlbumGridProps {
  albums: GalleryAlbum[];
}

export default function AlbumGrid({ albums }: AlbumGridProps) {
  const { t } = useTranslation();
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const tags = useMemo(() => getAlbumTags(albums), [albums]);
  const filteredAlbums = useMemo(() => filterAlbumsByTag(albums, activeTag), [albums, activeTag]);

  return (
    <div className="flex flex-col gap-6">
      {tags.length > 0 && <TagFilter tags={tags} activeTag={activeTag} onTagChange={setActiveTag} />}

      {filteredAlbums.length > 0 ? (
        <div className="grid grid-cols-3 gap-6 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
          {filteredAlbums.map((album, index) => (
            <AlbumCard key={album.slug} album={album} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl bg-gray-50 text-center dark:bg-gray-800/50">
          <p className="font-medium text-gray-500 text-lg dark:text-gray-400">{t('gallery.noAlbums')}</p>
        </div>
      )}
    </div>
  );
}
