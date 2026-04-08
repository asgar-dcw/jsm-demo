import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Search, Bell, User, Settings, LogOut } from 'lucide-react';
import { performSignOut } from '@/lib/auth';
import { loadProfile } from '@/lib/settingsStorage';
import { useAppStore } from '@/store/appStore';
import type { AppView } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { uniqueProjectsFromIssues } from '@/lib/projectsFromIssues';
import { seedProject } from '@/data/seedData';

const jiraAllProjectsLabel = {
  id: 'jira-all',
  name: 'All Jira projects',
  slug: 'all',
  color: '#6366F1',
  description: 'All projects',
};

const viewTabs: { label: string; value: AppView }[] = [
  { label: 'Calendar', value: 'calendar' },
  { label: 'Timesheets', value: 'timesheets' },
  { label: 'Board', value: 'board' },
  { label: 'Reports', value: 'reports' },
];

export function Navbar() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isSettingsRoute = location.pathname === '/settings';

  const {
    activeView,
    setActiveView,
    activeProject,
    setActiveProject,
    issues,
    searchQuery,
    setSearchQuery,
    filterProjectId,
    setFilterProjectId,
    dataSource,
  } = useAppStore();

  const projects = useMemo(() => uniqueProjectsFromIssues(issues), [issues]);

  const readProfileLabel = useCallback(() => {
    try {
      const p = loadProfile();
      if (p.displayName?.trim()) return p.displayName.trim();
    } catch {
      /* ignore */
    }
    return 'Account';
  }, []);

  const [profileLabel, setProfileLabel] = useState(readProfileLabel);

  useEffect(() => {
    const refresh = () => setProfileLabel(readProfileLabel());
    refresh();
    window.addEventListener('schedulemate-profile-updated', refresh);
    return () => window.removeEventListener('schedulemate-profile-updated', refresh);
  }, [location.pathname, readProfileLabel]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const selectAllProjects = () => {
    setFilterProjectId('all');
    setActiveProject(dataSource === 'jira' ? jiraAllProjectsLabel : seedProject);
  };

  const selectProject = (projectId: string) => {
    const p = projects.find((x) => x.id === projectId);
    if (p) {
      setFilterProjectId(projectId);
      setActiveProject(p);
    }
  };

  const displayName =
    filterProjectId === 'all'
      ? dataSource === 'jira'
        ? 'All Jira projects'
        : seedProject.name
      : projects.find((p) => p.id === filterProjectId)?.name || activeProject?.name || 'Project';

  const displayColor =
    filterProjectId === 'all'
      ? dataSource === 'jira'
        ? '#6366F1'
        : seedProject.color
      : projects.find((p) => p.id === filterProjectId)?.color || '#6366F1';

  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4 shrink-0">
      <Link to="/" className="flex items-center mr-2 shrink-0 min-w-0 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40">
        <img
          src="/DCW-Logo.webp"
          alt="DotcomWeavers"
          className="h-8 sm:h-9 w-auto max-w-[min(200px,40vw)] object-contain object-left"
          width={200}
          height={36}
          decoding="async"
        />
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary hover:bg-accent transition-colors text-sm max-w-[200px] shrink-0"
          >
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: displayColor }} />
            <span className="text-foreground font-medium truncate">{displayName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 max-h-[min(320px,70vh)] overflow-y-auto">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Filter by project</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => selectAllProjects()}
            className={filterProjectId === 'all' ? 'bg-accent' : ''}
          >
            <span className="w-2 h-2 rounded-full mr-2 bg-primary shrink-0" />
            All projects
          </DropdownMenuItem>
          {projects.map((p) => (
            <DropdownMenuItem
              key={p.id}
              onClick={() => selectProject(p.id)}
              className={filterProjectId === p.id ? 'bg-accent' : ''}
            >
              <span className="w-2 h-2 rounded-full mr-2 shrink-0" style={{ backgroundColor: p.color }} />
              <span className="truncate">{p.name}</span>
            </DropdownMenuItem>
          ))}
          {projects.length === 0 && (
            <p className="px-2 py-1.5 text-[10px] text-muted-foreground">Load issues to see projects</p>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1 max-w-md min-w-0 mx-auto">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Search issues (title, key, project)…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-16 py-1.5 text-sm bg-secondary/50 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Search issues"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded bg-background border border-border font-mono text-muted-foreground pointer-events-none hidden sm:inline">
            ⌘K
          </kbd>
        </div>
      </div>

      {!isSettingsRoute && (
        <div className="flex items-center bg-secondary rounded-lg p-0.5 shrink-0">
          {viewTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                if (location.pathname !== '/') navigate('/');
                setActiveView(tab.value);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                activeView === tab.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1 shrink-0 ml-auto sm:ml-0">
        <button type="button" className="relative p-2 rounded-md hover:bg-secondary transition-colors">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center hover:bg-primary/30 transition-colors"
              aria-label="Account menu"
            >
              <User className="w-4 h-4 text-primary" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <span className="text-xs text-muted-foreground block">Signed in as</span>
              <span className="text-sm font-medium text-foreground truncate">{profileLabel}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings" className="cursor-pointer flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => performSignOut(navigate)}
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
