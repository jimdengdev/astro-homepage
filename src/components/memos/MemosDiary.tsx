import { useMemosData } from '@hooks/useMemosData';
import { useTranslation } from '@hooks/useTranslation';
import { format } from 'date-fns';
import { useCallback, useState } from 'react';
import { CalendarPanel } from './CalendarPanel';
import { DiaryContent } from './DiaryContent';
import { RecentMemosList } from './RecentMemosList';

export function MemosDiary() {
  const { t } = useTranslation();
  const { memos, memosByDate, datesWithMemos, isLoading, error, retry } = useMemosData();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleSelectMemo = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayMemos = memosByDate[selectedDateStr] ?? [];

  if (isLoading) {
    return (
      <div className="diary-loading-card flex min-h-[520px] items-center justify-center rounded-[1.75rem] border border-white/70 bg-white/55 shadow-[0_24px_70px_rgba(70,96,130,0.14)] backdrop-blur-2xl">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="diary-loading-card flex min-h-[520px] flex-col items-center justify-center gap-4 rounded-[1.75rem] border border-white/70 bg-white/55 shadow-[0_24px_70px_rgba(70,96,130,0.14)] backdrop-blur-2xl">
        <p className="text-muted-foreground">{t('diary.error')}</p>
        <button
          type="button"
          onClick={retry}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm transition-colors hover:bg-primary/90"
        >
          {t('diary.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="diary-glass-layout grid min-h-[720px] grid-cols-[280px_1fr] items-stretch gap-6 rounded-[1.9rem] border border-white/55 bg-[radial-gradient(circle_at_16%_8%,rgba(224,246,255,0.9),transparent_34%),linear-gradient(135deg,rgba(246,252,255,0.92),rgba(248,250,255,0.68))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_18px_48px_rgba(70,96,130,0.10)] max-[720px]:grid-cols-1 max-[720px]:p-4 dark:border-white/10 dark:bg-slate-900/40">
      {/* Left panel: Calendar + Recent memos */}
      <aside className="diary-glass-card diary-side-card flex min-w-0 flex-col rounded-[1.6rem] border border-white/70 bg-white/60 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_26px_70px_rgba(70,96,130,0.16)] backdrop-blur-2xl max-[720px]:p-5 dark:border-white/10 dark:bg-slate-900/60">
        <div>
          <CalendarPanel selectedDate={selectedDate} onSelectDate={handleSelectDate} datesWithMemos={datesWithMemos} />
        </div>
        <div className="mt-8 px-1">
          <RecentMemosList memos={memos} selectedDate={selectedDate} onSelectMemo={handleSelectMemo} maxItems={5} />
        </div>
      </aside>

      {/* Right panel: Diary content */}
      <section className="min-w-0">
        <DiaryContent memos={dayMemos} selectedDate={selectedDate} />
      </section>
    </div>
  );
}
