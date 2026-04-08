import { useEffect, useRef, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { CalendarToolbar } from './CalendarToolbar';
import { useAppStore } from '@/store/appStore';
import { PRIORITY_COLORS } from '@/types';
import { toast } from 'sonner';
import { useFilteredIssues } from '@/hooks/useFilteredIssues';
import type { EventClickArg, EventDropArg, EventContentArg } from '@fullcalendar/core';
import type { Issue, TeamMember } from '@/types';

export function CalendarView() {
  const calendarRef = useRef<FullCalendar>(null);
  const {
    calendarView, schedules, issues: allIssues, teamMembers,
    addSchedule, updateSchedule, openScheduleModal,
  } = useAppStore();
  const filteredIssues = useFilteredIssues();
  const filteredIds = useMemo(() => new Set(filteredIssues.map((i) => i.id)), [filteredIssues]);

  // Initialize external draggable
  useEffect(() => {
    const container = document.getElementById('external-events');
    if (!container) return;

    const draggable = new Draggable(container, {
      itemSelector: '.fc-event',
      eventData(eventEl) {
        const raw = eventEl.getAttribute('data-event');
        return raw ? JSON.parse(raw) : {};
      },
    });

    return () => draggable.destroy();
  }, []);

  // Sync calendar view
  useEffect(() => {
    calendarRef.current?.getApi().changeView(calendarView);
  }, [calendarView]);

  const events = useMemo(() => {
    return schedules
      .filter((s) => filteredIds.has(s.issue_id))
      .map((schedule) => {
        const issue = allIssues.find((i) => i.id === schedule.issue_id);
        const assignee =
          teamMembers.find((m) => m.user_id === schedule.assignee_id || m.user_id === issue?.assignee_id) ??
          null;
        return {
          id: schedule.id,
          title: issue?.title || 'Untitled',
          start: schedule.start_time,
          end: schedule.end_time,
          allDay: schedule.all_day,
          backgroundColor: issue ? PRIORITY_COLORS[issue.priority] + '1A' : 'hsl(210, 40%, 96%)',
          borderColor: issue ? PRIORITY_COLORS[issue.priority] : 'hsl(214, 32%, 91%)',
          textColor: 'hsl(222, 47%, 11%)',
          extendedProps: {
            issue,
            assignee,
            assigneeLabel: issue?.assignee_display_name,
            schedule,
            priority: issue?.priority,
          },
        };
      });
  }, [schedules, filteredIds, allIssues, teamMembers]);

  const handleEventDrop = useCallback((info: EventDropArg) => {
    updateSchedule(info.event.id, {
      start_time: info.event.start?.toISOString() || '',
      end_time: info.event.end?.toISOString() || '',
    });
    toast.success('Schedule updated');
  }, [updateSchedule]);

  const handleEventResize = useCallback((info: any) => {
    updateSchedule(info.event.id, {
      start_time: info.event.start?.toISOString() || '',
      end_time: info.event.end?.toISOString() || '',
    });
    toast.success('Schedule updated');
  }, [updateSchedule]);

  const handleExternalDrop = useCallback((info: any) => {
    const issueId = info.draggedEl.getAttribute('data-event');
    if (!issueId) return;
    const parsed = JSON.parse(issueId);
    const newSchedule = {
      id: `sch-${Date.now()}`,
      issue_id: parsed.extendedProps?.issueId || parsed.id,
      start_time: info.date.toISOString(),
      end_time: new Date(info.date.getTime() + 60 * 60 * 1000).toISOString(),
      all_day: info.allDay,
    };
    addSchedule(newSchedule);
    toast.success('Issue scheduled!');
  }, [addSchedule]);

  const handleEventClick = useCallback((info: EventClickArg) => {
    const schedule = info.event.extendedProps.schedule;
    if (schedule) {
      openScheduleModal({ scheduleId: schedule.id, issueId: schedule.issue_id });
    }
  }, [openScheduleModal]);

  const handleDateSelect = useCallback((info: any) => {
    openScheduleModal({ date: info.start });
  }, [openScheduleModal]);

  const renderEventContent = (eventInfo: EventContentArg) => {
    const { issue, assignee, assigneeLabel } = eventInfo.event.extendedProps as {
      issue?: Issue;
      assignee?: TeamMember | null;
      assigneeLabel?: string;
    };
    const priorityColor = issue ? PRIORITY_COLORS[issue.priority] : '#6B7280';
    const initial = assignee?.display_name?.charAt(0) ?? assigneeLabel?.charAt(0) ?? '';

    return (
      <div className="flex items-center gap-1.5 px-1 py-0.5 w-full overflow-hidden">
        <div className="w-1 h-full rounded-full shrink-0 self-stretch min-h-[14px]" style={{ backgroundColor: priorityColor }} />
        <span className="truncate text-[11px] font-medium">{eventInfo.event.title}</span>
        {initial ? (
          <div className="w-4 h-4 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 ml-auto">
            <span className="text-[7px] font-medium text-primary">{initial}</span>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <CalendarToolbar calendarRef={calendarRef} />
      <div className="flex-1 p-4 overflow-auto">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="timeGridWeek"
          headerToolbar={false}
          editable={true}
          droppable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={3}
          weekends={true}
          nowIndicator={true}
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={true}
          eventDisplay="block"
          height="100%"
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5],
            startTime: '09:00',
            endTime: '18:00',
          }}
          events={events}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          drop={handleExternalDrop}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
        />
      </div>
    </div>
  );
}
