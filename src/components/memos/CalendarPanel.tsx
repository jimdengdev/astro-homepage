import { useTranslation } from '@hooks/useTranslation';
import { Icon } from '@iconify/react';
import { cn } from '@lib/utils';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useCallback, useMemo, useState } from 'react';

interface CalendarPanelProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  datesWithMemos: Set<string>;
}

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function CalendarPanel({ selectedDate, onSelectDate, datesWithMemos }: CalendarPanelProps) {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const handlePrevMonth = useCallback(() => setCurrentMonth((d) => subMonths(d, 1)), []);
  const handleNextMonth = useCallback(() => setCurrentMonth((d) => addMonths(d, 1)), []);
  const handleToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(today);
    onSelectDate(today);
  }, [onSelectDate]);

  return (
    <div className="mx-auto w-full max-w-[300px]">
      {/* Month header */}
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="flex size-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-sky-50 hover:text-primary dark:hover:bg-sky-500/10"
          aria-label={t('pagination.prev')}
        >
          <Icon icon="ri:arrow-left-s-line" className="size-5" />
        </button>
        <span className="font-bold text-lg text-slate-950 tracking-wide dark:text-slate-100">
          {format(currentMonth, 'yyyy年M月', { locale: zhCN })}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="flex size-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-sky-50 hover:text-primary dark:hover:bg-sky-500/10"
          aria-label={t('pagination.next')}
        >
          <Icon icon="ri:arrow-right-s-line" className="size-5" />
        </button>
        <button
          type="button"
          onClick={handleToday}
          className="rounded-full bg-sky-50 px-3 py-1 font-medium text-primary text-xs transition-colors hover:bg-sky-100 dark:bg-sky-500/10 dark:hover:bg-sky-500/20"
        >
          {t('diary.today')}
        </button>
      </div>

      {/* Week headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="py-1.5 text-center font-medium text-slate-400 text-xs dark:text-slate-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-x-1 gap-y-1">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const hasMemo = datesWithMemos.has(dateStr);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(day)}
              className={cn(
                'relative mx-auto flex size-9 flex-col items-center justify-center rounded-xl font-medium text-sm transition-all duration-200',
                !isCurrentMonth && 'text-slate-300 dark:text-slate-600',
                isCurrentMonth && !isSelected && 'text-slate-700 hover:bg-sky-50 dark:text-slate-300 dark:hover:bg-sky-500/10',
                isSelected && 'bg-primary text-white shadow-md shadow-primary/25',
                isTodayDate && !isSelected && 'font-bold text-primary',
              )}
            >
              <span>{format(day, 'd')}</span>
              {hasMemo && !isSelected && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-amber-400" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
