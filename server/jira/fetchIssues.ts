import type { Issue } from '../../src/types/index';
import { mapJiraSearchIssueToIssue, type JiraSearchIssue } from '../../src/lib/jira/mapJiraIssue.js';

export interface JiraEnv {
  JIRA_BASE_URL: string;
  JIRA_EMAIL: string;
  JIRA_API_TOKEN: string;
  JIRA_DEFAULT_JQL?: string;
}

/** Trim whitespace from env strings (common .env copy/paste issue). */
export function normalizeJiraEnv(env: Partial<JiraEnv>): JiraEnv | null {
  const JIRA_BASE_URL = env.JIRA_BASE_URL?.trim() ?? '';
  const JIRA_EMAIL = env.JIRA_EMAIL?.trim() ?? '';
  const JIRA_API_TOKEN = env.JIRA_API_TOKEN?.trim() ?? '';
  const JIRA_DEFAULT_JQL = env.JIRA_DEFAULT_JQL?.trim();
  if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) return null;
  return {
    JIRA_BASE_URL,
    JIRA_EMAIL,
    JIRA_API_TOKEN,
    ...(JIRA_DEFAULT_JQL ? { JIRA_DEFAULT_JQL } : {}),
  };
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, '');
}

function basicAuthHeader(email: string, token: string): string {
  const pair = `${email}:${token}`;
  if (typeof Buffer !== 'undefined') {
    return `Basic ${Buffer.from(pair, 'utf8').toString('base64')}`;
  }
  return `Basic ${btoa(pair)}`;
}

export interface FetchJiraSearchParams {
  jql?: string;
  maxResults?: number;
  /** Continuation token from a previous /search/jql response. */
  nextPageToken?: string;
}

export interface FetchJiraSearchResult {
  issues: Issue[];
  /** Approximate count for this response (enhanced search does not return global total). */
  total: number;
  startAt: number;
  maxResults: number;
  nextPageToken?: string | null;
  isLast?: boolean;
}

/** Bounded JQL required by /rest/api/3/search/jql (unbounded `ORDER BY` alone is rejected). */
const DEFAULT_JQL = 'project is not EMPTY ORDER BY updated DESC';

const FIELDS = [
  'summary',
  'status',
  'assignee',
  'created',
  'duedate',
  'project',
  'description',
].join(',');

export async function fetchJiraSearch(
  env: Partial<JiraEnv>,
  params: FetchJiraSearchParams = {},
): Promise<FetchJiraSearchResult> {
  const normalized = normalizeJiraEnv(env);
  if (!normalized) {
    throw new Error('Jira env is incomplete');
  }
  const base = normalizeBaseUrl(normalized.JIRA_BASE_URL);
  const jql = (params.jql ?? normalized.JIRA_DEFAULT_JQL ?? DEFAULT_JQL).trim() || DEFAULT_JQL;
  const maxResults = Math.min(100, Math.max(1, params.maxResults ?? 50));

  // Jira Cloud: GET /rest/api/3/search/jql (legacy /rest/api/3/search returns 410 — CHANGE-2046).
  // This API defaults fields to `id` only; request the fields we map in the UI.
  const url = new URL(`${base}/rest/api/3/search/jql`);
  url.searchParams.set('jql', jql);
  url.searchParams.set('maxResults', String(maxResults));
  url.searchParams.set('fields', FIELDS);
  const pageToken = params.nextPageToken?.trim();
  if (pageToken) {
    url.searchParams.set('nextPageToken', pageToken);
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: basicAuthHeader(normalized.JIRA_EMAIL, normalized.JIRA_API_TOKEN),
      Accept: 'application/json',
      // Some gateways reject requests with no User-Agent
      'User-Agent': 'ScheduleMate/1.0 (Jira Cloud integration)',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    let detail = text.slice(0, 1200);
    try {
      const j = JSON.parse(text) as {
        errorMessages?: string[];
        errors?: Record<string, string>;
        message?: string;
      };
      if (j.errorMessages?.length) detail = j.errorMessages.join(' — ');
      else if (j.errors && Object.keys(j.errors).length)
        detail = Object.entries(j.errors)
          .map(([k, v]) => `${k}: ${v}`)
          .join(' — ');
      else if (j.message) detail = j.message;
    } catch {
      /* keep raw snippet */
    }
    const hint =
      res.status === 401
        ? ' Check JIRA_EMAIL matches the Atlassian account that owns JIRA_API_TOKEN, and the token is still valid.'
        : '';
    throw new Error(`Jira API ${res.status}: ${detail}${hint}`);
  }

  const data = (await res.json()) as {
    issues?: JiraSearchIssue[];
    isLast?: boolean;
    nextPageToken?: string | null;
  };

  const issues = (data.issues ?? []).map(mapJiraSearchIssueToIssue);

  return {
    issues,
    total: issues.length,
    startAt: 0,
    maxResults,
    nextPageToken: data.nextPageToken ?? null,
    isLast: data.isLast ?? true,
  };
}

export function isJiraConfigured(env: Partial<JiraEnv>): env is JiraEnv {
  return normalizeJiraEnv(env) !== null;
}
