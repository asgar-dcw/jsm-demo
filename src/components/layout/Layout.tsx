import { Navbar } from './Navbar';
import { IssuePanel } from '@/components/issues/IssuePanel';
import { CalendarView } from '@/components/calendar/CalendarView';
import { TimesheetView } from '@/components/timesheets/TimesheetView';
import { BoardView } from '@/components/board/BoardView';
import { ReportsView } from '@/components/reports/ReportsView';
import { ScheduleModal } from '@/components/calendar/ScheduleModal';
import { CreateIssueModal } from '@/components/issues/CreateIssueModal';
import { LogTimeModal } from '@/components/timesheets/LogTimeModal';
import { IssueDetail } from '@/components/issues/IssueDetail';
import { useAppStore } from '@/store/appStore';

export function Layout() {
  const { activeView } = useAppStore();

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {activeView === 'calendar' && (
          <>
            <IssuePanel />
            <CalendarView />
          </>
        )}
        {activeView === 'timesheets' && <TimesheetView />}
        {activeView === 'board' && <BoardView />}
        {activeView === 'reports' && <ReportsView />}
      </div>

      {/* Modals */}
      <ScheduleModal />
      <CreateIssueModal />
      <LogTimeModal />
      <IssueDetail />
    </div>
  );
}
