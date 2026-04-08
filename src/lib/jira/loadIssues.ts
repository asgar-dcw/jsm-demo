import type { Issue } from '@/types';

export interface JiraSearchResponse {
  issues: Issue[];
  total: number;
  startAt: number;
  maxResults: number;
  nextPageToken?: string | null;
  isLast?: boolean;
}

/**
 * Loads issues from `/api/jira/search` (Vercel serverless in prod, Vite middleware in dev).
 * Returns `null` when Jira is not configured or the API route is unavailable — use demo seed data.
 * Throws when Jira is configured but the request fails.
 */
export async function fetchJiraIssuesForDashboard(): Promise<JiraSearchResponse | null> {
  const res = await fetch('/api/jira/search');

  if (res.ok) {
    return (await res.json()) as JiraSearchResponse;
  }

  if (res.status === 503) {
    const body = (await res.json().catch(() => null)) as { configured?: boolean } | null;
    if (body?.configured === false) return null;
  }

  if (res.status === 404) {
    return null;
  }

  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  throw new Error(body?.error ?? `Jira request failed (${res.status})`);
}
