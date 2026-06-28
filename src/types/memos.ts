/**
 * Memos API type definitions
 * Based on actual Memos v0.22+ API response format
 */

export interface MemosMemo {
  /** Unique resource name (e.g. "memos/ZprXwdyjKFPXK973CBpnbV") */
  name: string;
  /** Memo state */
  state: string;
  /** Creator name (e.g. "users/jammy") */
  creator: string;
  /** Create time (ISO 8601) */
  createTime: string;
  /** Update time (ISO 8601) */
  updateTime: string;
  /** Content of the memo (Markdown) */
  content: string;
  /** Visibility: PUBLIC or PRIVATE */
  visibility: string;
  /** Whether memo is pinned */
  pinned: boolean;
  /** Tags */
  tags?: string[];
  /** Attachments */
  attachments?: unknown[];
  /** Relations to other memos */
  relations?: MemosRelation[];
  /** Reactions */
  reactions?: MemosReaction[];
  /** Computed property */
  property?: MemosProperty;
  /** Text snippet */
  snippet?: string;
}

export interface MemosProperty {
  hasLink: boolean;
  hasTaskList: boolean;
  hasCode: boolean;
  hasIncompleteTasks: boolean;
  /** Extracted title from content */
  title?: string;
}

export interface MemosRelation {
  memo: string;
  relatedMemo: string;
  type: string;
}

export interface MemosReaction {
  name: string;
  creator: string;
  contentId: string;
  reactionType: string;
  createTime: string;
}

export interface MemosListResponse {
  memos: MemosMemo[];
  nextPageToken: string;
}
