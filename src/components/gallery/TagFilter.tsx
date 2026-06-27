import { useTranslation } from '@hooks/useTranslation';
import { cn } from '@/lib/utils';

interface TagFilterProps {
  tags: string[];
  activeTag?: string | null;
  onTagChange: (tag: string | null) => void;
}

export default function TagFilter({ tags, activeTag, onTagChange }: TagFilterProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onTagChange(null)}
        className={cn(
          'rounded-full px-3.5 py-1.5 font-medium text-sm transition-all duration-300',
          activeTag == null
            ? 'bg-pink-400 text-white shadow-sm hover:bg-pink-500'
            : 'bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-pink-900/30 dark:hover:text-pink-400',
        )}
      >
        {t('gallery.allTags')}
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onTagChange(tag)}
          className={cn(
            'rounded-full px-3.5 py-1.5 font-medium text-sm transition-all duration-300',
            activeTag === tag
              ? 'bg-pink-400 text-white shadow-sm hover:bg-pink-500'
              : 'bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-pink-900/30 dark:hover:text-pink-400',
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
