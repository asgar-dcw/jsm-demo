import type { Issue, Project } from '@/types';

/** Stable color from string id (for project dots). */
function colorFromId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return `hsl(${h}, 55%, 45%)`;
}

/** Build project list for filters / navbar from loaded issues. */
export function uniqueProjectsFromIssues(issues: Issue[]): Project[] {
  const seen = new Map<string, Project>();
  for (const i of issues) {
    if (seen.has(i.project_id)) continue;
    const name = i.project_name || i.project_key || 'Project';
    const slug = (i.project_key || i.project_id).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    seen.set(i.project_id, {
      id: i.project_id,
      name,
      slug,
      color: colorFromId(i.project_id),
    });
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}
