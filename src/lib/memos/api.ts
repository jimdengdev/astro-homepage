/**
 * Memos API client
 * Docs: https://usememos.com/docs/api/latest
 */

import type { MemosListResponse, MemosMemo } from '@/types/memos';

const MEMOS_TOKEN = import.meta.env.PUBLIC_MEMOS_TOKEN || '';

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (MEMOS_TOKEN) {
    headers.Authorization = `Bearer ${MEMOS_TOKEN}`;
  }
  return headers;
}

/**
 * Fetch all memos from the Memos API (via Vite proxy to avoid CORS)
 * Uses pagination to get all visible memos
 */
export async function fetchAllMemos(): Promise<MemosMemo[]> {
  const allMemos: MemosMemo[] = [];
  let nextPageToken = '';

  do {
    const url = new URL('/api/memos', window.location.origin);
    url.searchParams.set('pageSize', '100');
    if (nextPageToken) {
      url.searchParams.set('pageToken', nextPageToken);
    }

    const res = await fetch(url.toString(), { headers: getHeaders() });
    if (!res.ok) {
      throw new Error(`Memos API error: ${res.status} ${res.statusText}`);
    }

    const data: MemosListResponse = await res.json();
    allMemos.push(...data.memos);
    nextPageToken = data.nextPageToken || '';
  } while (nextPageToken);

  // Sort by createTime descending (newest first)
  return allMemos.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
}
