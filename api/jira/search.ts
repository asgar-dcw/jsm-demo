import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchJiraSearch, isJiraConfigured, type JiraEnv } from '../../server/jira/fetchIssues.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const env: Partial<JiraEnv> = {
    JIRA_BASE_URL: process.env.JIRA_BASE_URL,
    JIRA_EMAIL: process.env.JIRA_EMAIL,
    JIRA_API_TOKEN: process.env.JIRA_API_TOKEN,
    JIRA_DEFAULT_JQL: process.env.JIRA_DEFAULT_JQL,
  };

  if (!isJiraConfigured(env)) {
    res.status(503).json({
      configured: false,
      error: 'Jira is not configured. Set JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN.',
    });
    return;
  }

  const jql = typeof req.query.jql === 'string' ? req.query.jql : undefined;
  const maxResults = req.query.maxResults != null ? Number(req.query.maxResults) : undefined;
  const nextPageToken =
    typeof req.query.nextPageToken === 'string' ? req.query.nextPageToken : undefined;

  try {
    const result = await fetchJiraSearch(env, { jql, maxResults, nextPageToken });
    res.status(200).json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    res.status(502).json({ error: message });
  }
}
