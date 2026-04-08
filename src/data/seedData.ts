import type { Issue, Schedule, TeamMember, Project, Worklog } from '@/types';

export const seedProject: Project = {
  id: 'proj-001',
  name: 'Mobile App Redesign',
  slug: 'mobile-app-redesign',
  color: '#6366F1',
  description: 'Complete redesign of the mobile application',
};

export const seedTeamMembers: TeamMember[] = [
  { id: 'tm-001', user_id: 'u-001', project_id: 'proj-001', role: 'admin', display_name: 'Arjun S.', avatar_url: '' },
  { id: 'tm-002', user_id: 'u-002', project_id: 'proj-001', role: 'member', display_name: 'Priya M.', avatar_url: '' },
  { id: 'tm-003', user_id: 'u-003', project_id: 'proj-001', role: 'member', display_name: 'Rahul D.', avatar_url: '' },
];

export const seedIssues: Issue[] = [
  { id: 'iss-001', project_id: 'proj-001', title: 'Fix login redirect bug', status: 'in_progress', priority: 'urgent', assignee_id: 'u-001', label: 'bug', story_points: 3, issue_key: 'ISS-001', created_at: '2026-03-28' },
  { id: 'iss-002', project_id: 'proj-001', title: 'Redesign onboarding flow', status: 'todo', priority: 'high', assignee_id: 'u-002', label: 'feature', story_points: 8, issue_key: 'ISS-002', created_at: '2026-03-28' },
  { id: 'iss-003', project_id: 'proj-001', title: 'Add push notifications', status: 'todo', priority: 'high', assignee_id: 'u-003', label: 'feature', story_points: 5, issue_key: 'ISS-003', created_at: '2026-03-29' },
  { id: 'iss-004', project_id: 'proj-001', title: 'Performance audit', status: 'todo', priority: 'medium', assignee_id: 'u-001', label: 'improvement', story_points: 3, issue_key: 'ISS-004', created_at: '2026-03-29' },
  { id: 'iss-005', project_id: 'proj-001', title: 'Update color tokens', status: 'done', priority: 'low', assignee_id: 'u-002', label: 'task', story_points: 1, issue_key: 'ISS-005', created_at: '2026-03-30' },
  { id: 'iss-006', project_id: 'proj-001', title: 'Crash on Android 12', status: 'in_progress', priority: 'urgent', assignee_id: 'u-003', label: 'bug', story_points: 5, issue_key: 'ISS-006', created_at: '2026-03-30' },
  { id: 'iss-007', project_id: 'proj-001', title: 'Dark mode support', status: 'todo', priority: 'medium', assignee_id: 'u-001', label: 'feature', story_points: 5, issue_key: 'ISS-007', created_at: '2026-03-31' },
  { id: 'iss-008', project_id: 'proj-001', title: 'API rate limit handling', status: 'in_review', priority: 'high', assignee_id: 'u-002', label: 'improvement', story_points: 3, issue_key: 'ISS-008', created_at: '2026-03-31' },
  { id: 'iss-009', project_id: 'proj-001', title: 'Accessibility audit', status: 'todo', priority: 'medium', assignee_id: 'u-003', label: 'task', story_points: 2, issue_key: 'ISS-009', created_at: '2026-04-01' },
  { id: 'iss-010', project_id: 'proj-001', title: 'Release v2.0 checklist', status: 'todo', priority: 'high', assignee_id: 'u-001', label: 'task', story_points: 2, issue_key: 'ISS-010', created_at: '2026-04-01' },
];

// Generate schedules for current week
function getWeekDates() {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1);
  return monday;
}

const monday = getWeekDates();
function dayAt(dayOffset: number, hour: number) {
  const d = new Date(monday);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

export const seedSchedules: Schedule[] = [
  { id: 'sch-001', issue_id: 'iss-001', start_time: dayAt(0, 9), end_time: dayAt(0, 11), all_day: false, assignee_id: 'u-001' },
  { id: 'sch-002', issue_id: 'iss-002', start_time: dayAt(1, 10), end_time: dayAt(1, 13), all_day: false, assignee_id: 'u-002' },
  { id: 'sch-003', issue_id: 'iss-003', start_time: dayAt(2, 14), end_time: dayAt(2, 17), all_day: false, assignee_id: 'u-003' },
  { id: 'sch-004', issue_id: 'iss-006', start_time: dayAt(3, 9), end_time: dayAt(3, 12), all_day: false, assignee_id: 'u-003' },
  { id: 'sch-005', issue_id: 'iss-007', start_time: dayAt(4, 13), end_time: dayAt(4, 16), all_day: false, assignee_id: 'u-001' },
];

export const seedWorklogs: Worklog[] = [
  { id: 'wl-001', issue_id: 'iss-001', user_id: 'u-001', logged_hours: 2, log_date: dayAt(0, 0).split('T')[0], description: 'Debugging auth flow' },
  { id: 'wl-002', issue_id: 'iss-001', user_id: 'u-001', logged_hours: 4, log_date: dayAt(1, 0).split('T')[0], description: 'Fixed redirect logic' },
  { id: 'wl-003', issue_id: 'iss-002', user_id: 'u-002', logged_hours: 3, log_date: dayAt(1, 0).split('T')[0], description: 'Wireframing new flow' },
  { id: 'wl-004', issue_id: 'iss-003', user_id: 'u-003', logged_hours: 5, log_date: dayAt(2, 0).split('T')[0], description: 'FCM integration' },
  { id: 'wl-005', issue_id: 'iss-006', user_id: 'u-003', logged_hours: 2, log_date: dayAt(0, 0).split('T')[0], description: 'Reproducing crash' },
  { id: 'wl-006', issue_id: 'iss-006', user_id: 'u-003', logged_hours: 3, log_date: dayAt(3, 0).split('T')[0], description: 'Patching memory leak' },
  { id: 'wl-007', issue_id: 'iss-008', user_id: 'u-002', logged_hours: 2, log_date: dayAt(2, 0).split('T')[0], description: 'Adding retry logic' },
  { id: 'wl-008', issue_id: 'iss-004', user_id: 'u-001', logged_hours: 3, log_date: dayAt(2, 0).split('T')[0], description: 'Lighthouse audit run' },
  { id: 'wl-009', issue_id: 'iss-002', user_id: 'u-002', logged_hours: 4, log_date: dayAt(3, 0).split('T')[0], description: 'Prototyping screens' },
];

// Get scheduled issue IDs
export const scheduledIssueIds = new Set(seedSchedules.map(s => s.issue_id));
