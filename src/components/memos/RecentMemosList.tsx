import { useTranslation } from '@hooks/useTranslation';
import { cn } from '@lib/utils';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { MemosMemo } from '@/types/memos';

interface RecentMemosListProps {
  memos: MemosMemo[];
  selectedDate: Date;
  onSelectMemo: (date: Date) => void;
  maxItems?: number;
}

function getMemoPreview(memo: MemosMemo): string {
  const plainText = memo.content
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^>\s*/gm, '')
    .replace(/\n+/g, ' ')
    .trim();
  const firstLine = plainText.split(' ').slice(0, 10).join(' ') || '';
  if (firstLine.length > 22) return `${firstLine.slice(0, 22)}...`;
  return firstLine || '无内容';
}

export function RecentMemosList({ memos, selectedDate, onSelectMemo, maxItems = 5 }: RecentMemosListProps) {
  const { t } = useTranslation();

  const recentMemos = memos.slice(0, maxItems);

  if (recentMemos.length === 0) {
    return <div className="py-4 text-slate-400 text-sm">{t('diary.noRecentMemos')}</div>;
  }

  return (
    <div className="w-full">
      <h3 className="mb-3 font-bold text-slate-400 text-sm tracking-wide dark:text-slate-500">{t('diary.recentRecords')}</h3>
      <div className="relative space-y-0.5 before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-px before:bg-sky-100 dark:before:bg-sky-900/50">
        {recentMemos.map((memo, index) => {
          const date = parseISO(memo.createTime);
          const dateStr = format(date, 'MM/dd', { locale: zhCN });
          const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
          const memoKey = `${memo.name || dateStr}-${index}`;

          return (
            <button
              key={memoKey}
              type="button"
              onClick={() => onSelectMemo(date)}
              className={cn(
                'relative flex w-full items-center gap-2 rounded-lg py-1.5 pr-2 pl-6 text-left text-sm transition-colors',
                isSelected
                  ? 'font-bold text-slate-900 dark:text-slate-100'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100',
              )}
            >
              <span
                className={cn(
                  'absolute left-0 size-2.5 rounded-full border-2 border-background',
                  isSelected ? 'bg-primary' : 'bg-sky-100 dark:bg-sky-800',
                )}
              />
              <span className="shrink-0 text-xs tabular-nums">{dateStr}</span>
              <span className="truncate">{getMemoPreview(memo)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
