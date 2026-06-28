import { Icon } from '@iconify/react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { marked } from 'marked';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MemosMemo } from '@/types/memos';

interface DiaryContentProps {
  memos: MemosMemo[];
  selectedDate: Date;
}

function getMemoTitle(memo: MemosMemo): string {
  if (memo.property?.title) return memo.property.title;
  const firstLine =
    memo.content
      .split('\n')[0]
      ?.replace(/^#{1,6}\s+/, '')
      .replace(/^\*\*(.+)\*\*$/, '$1')
      .trim() || '';
  if (firstLine.length > 0) return firstLine;
  const time = format(parseISO(memo.createTime), 'HH:mm');
  const bodyPreview = memo.content
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, 5);
  return `${time} ${bodyPreview || '无题'}`;
}

function getMemoBody(memo: MemosMemo): string {
  const lines = memo.content.split('\n');
  const firstLine = lines[0]?.trim() || '';
  const shouldDropTitle = lines.length > 1 && (firstLine === getMemoTitle(memo) || /^#{1,6}\s+/.test(firstLine));
  return (shouldDropTitle ? lines.slice(1) : lines).join('\n').trim();
}

function formatMemoTime(memo: MemosMemo): string {
  return format(parseISO(memo.createTime), 'HH:mm', { locale: zhCN });
}

export function DiaryContent({ memos, selectedDate }: DiaryContentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const prevMemosRef = useRef(memos);

  useEffect(() => {
    if (memos !== prevMemosRef.current) {
      setCurrentIndex(0);
      prevMemosRef.current = memos;
    }
  }, [memos]);

  const memoCount = memos.length;
  const safeIndex = currentIndex >= memoCount ? 0 : currentIndex;
  const currentMemo = memos[safeIndex] ?? null;

  const handlePrev = useCallback(() => {
    if (memoCount <= 1) return;
    setFlipDirection('prev');
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentIndex((i) => (i > 0 ? i - 1 : memoCount - 1));
      setIsFlipping(false);
    }, 300);
  }, [memoCount]);

  const handleNext = useCallback(() => {
    if (memoCount <= 1) return;
    setFlipDirection('next');
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentIndex((i) => (i < memoCount - 1 ? i + 1 : 0));
      setIsFlipping(false);
    }, 300);
  }, [memoCount]);

  const renderedHtml = useMemo(() => {
    if (!currentMemo) return '';
    const body = getMemoBody(currentMemo);
    if (!body) return '';
    return marked.parse(body, { async: false }) as string;
  }, [currentMemo]);

  const dateStr = format(selectedDate, 'yyyy-MM-dd', { locale: zhCN });
  const title = currentMemo ? getMemoTitle(currentMemo) : '留白';
  const metaText = currentMemo ? `${dateStr} ${formatMemoTime(currentMemo)}` : dateStr;

  return (
    <div className="diary-paper-wrapper relative" style={{ perspective: '1200px' }}>
      <article
        className="diary-paper-card relative flex min-h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/65 p-[clamp(2rem,4vw,3.25rem)] shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_26px_70px_rgba(70,96,130,0.16)] backdrop-blur-2xl transition-transform duration-300 max-[720px]:min-h-[520px] max-[720px]:p-6 dark:border-white/10 dark:bg-slate-900/60"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipping ? (flipDirection === 'next' ? 'rotateY(-90deg)' : 'rotateY(90deg)') : 'rotateY(0deg)',
          transition: 'transform 300ms ease-in-out',
        }}
      >
        {/* Header */}
        <div className="diary-paper-header relative z-1 flex items-center justify-between gap-6 border-border border-b pb-5 max-[720px]:flex-col max-[720px]:items-start">
          <h2 className="diary-paper-title overflow-wrap-anywhere min-w-0 flex-1 font-extrabold text-[clamp(2rem,3vw,2.75rem)] text-slate-950 leading-tight dark:text-slate-50">
            {title}
          </h2>
          <div className="diary-paper-meta flex shrink-0 items-center gap-3 whitespace-nowrap border-primary border-b-[3px] px-1 pb-3 font-bold text-[clamp(0.95rem,1.35vw,1.25rem)] text-slate-500 tracking-[0.08em] max-[720px]:w-full max-[720px]:justify-end max-[720px]:whitespace-normal">
            {memoCount > 1 && (
              <div className="mr-3 flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex size-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-sky-50 hover:text-primary dark:hover:bg-sky-500/10"
                  aria-label="上一条"
                >
                  <Icon icon="ri:arrow-left-s-line" className="size-5" />
                </button>
                <span className="min-w-10 text-center text-xs tabular-nums">
                  {safeIndex + 1}/{memoCount}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex size-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-sky-50 hover:text-primary dark:hover:bg-sky-500/10"
                  aria-label="下一条"
                >
                  <Icon icon="ri:arrow-right-s-line" className="size-5" />
                </button>
              </div>
            )}
            <span>{metaText}</span>
            <Icon icon="ri:sun-fill" className="size-5 text-amber-400" />
          </div>
        </div>

        {/* Content */}
        {currentMemo ? (
          <div
            className="diary-paper-body"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Memos markdown is user-authored content rendered for this local diary view
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        ) : (
          <div className="diary-paper-body diary-paper-empty">
            <p>这一天没有记录什么...</p>
            <p>也许只是静静地过了一天。</p>
            <p>"有时候，什么都不做，也是一种充实。"</p>
          </div>
        )}

        {/* Footer decoration */}
        <div className="mt-auto flex justify-end pt-10">
          <span className="diary-paper-signature">留白</span>
        </div>
      </article>
    </div>
  );
}
