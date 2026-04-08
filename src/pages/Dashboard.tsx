import { useEffect } from 'react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';
import { useAppStore } from '@/store/appStore';
import { seedProject, seedIssues, seedSchedules, seedTeamMembers, seedWorklogs } from '@/data/seedData';
import { fetchJiraIssuesForDashboard } from '@/lib/jira/loadIssues';
import type { Project } from '@/types';

const jiraAllProjects: Project = {
  id: 'jira-all',
  name: 'All Jira projects',
  slug: 'all',
  color: '#6366F1',
  description: 'Issues loaded from Jira',
};

const Dashboard = () => {
  const {
    setActiveProject,
    setIssues,
    setSchedules,
    setTeamMembers,
    setWorklogs,
    setDataSource,
    clearFilters,
  } = useAppStore();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchJiraIssuesForDashboard();
        if (cancelled) return;

        if (data) {
          clearFilters();
          setDataSource('jira');
          setActiveProject(jiraAllProjects);
          setIssues(data.issues);
          setSchedules([]);
          setWorklogs([]);
          setTeamMembers([]);
          return;
        }

        setDataSource('demo');
        setActiveProject(seedProject);
        setIssues(seedIssues);
        setSchedules(seedSchedules);
        setTeamMembers(seedTeamMembers);
        setWorklogs(seedWorklogs);
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : 'Failed to load Jira issues';
        toast.error(message);
        setDataSource('demo');
        setActiveProject(seedProject);
        setIssues(seedIssues);
        setSchedules(seedSchedules);
        setTeamMembers(seedTeamMembers);
        setWorklogs(seedWorklogs);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [
    setActiveProject,
    setIssues,
    setSchedules,
    setTeamMembers,
    setWorklogs,
    setDataSource,
    clearFilters,
  ]);

  return <Layout />;
};

export default Dashboard;
