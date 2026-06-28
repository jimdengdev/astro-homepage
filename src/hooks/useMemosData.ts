/**
 * Memos data management hook
 * Fetches and processes memos data for the diary view
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchAllMemos } from '@/lib/memos/api';
import type { MemosMemo } from '@/types/memos';

export interface MemosByDate {
  /** ISO date string (YYYY-MM-DD) -> memos for that day */
  [date: string]: MemosMemo[];
}

interface UseMemosDataReturn {
  /** All memos sorted by date */
  memos: MemosMemo[];
  /** Memos grouped by date */
  memosByDate: MemosByDate;
  /** Set of dates that have memos */
  datesWithMemos: Set<string>;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Retry function */
  retry: () => void;
}

export function useMemosData(): UseMemosDataReturn {
  const [memos, setMemos] = useState<MemosMemo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cancelledRef = useRef(false);
  const [trigger, setTrigger] = useState(0);

  const retry = useCallback(() => setTrigger((n) => n + 1), []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: trigger forces re-fetch on retry
  useEffect(() => {
    cancelledRef.current = false;
    setIsLoading(true);
    setError(null);
    setMemos([]);

    async function load() {
      try {
        const data = await fetchAllMemos();
        if (cancelledRef.current) return;
        setMemos(data);
      } catch (err) {
        if (cancelledRef.current) return;
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (!cancelledRef.current) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelledRef.current = true;
    };
  }, [trigger]);

  const filteredMemos = useMemo(() => {
    return memos.filter((memo) => memo.visibility === 'PUBLIC');
  }, [memos]);

  const memosByDate = useMemo(() => {
    const grouped: MemosByDate = {};
    for (const memo of filteredMemos) {
      const date = memo.createTime.split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(memo);
    }
    // Sort each day's memos by time
    for (const date of Object.keys(grouped)) {
      grouped[date].sort((a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime());
    }
    return grouped;
  }, [filteredMemos]);

  const datesWithMemos = useMemo(() => new Set(Object.keys(memosByDate)), [memosByDate]);

  return { memos: filteredMemos, memosByDate, datesWithMemos, isLoading, error, retry };
}
