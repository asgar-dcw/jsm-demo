import { ChevronLeft, ChevronRight } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import { useAppStore } from '@/store/appStore';
import type { CalendarViewType } from '@/types';
import { RefObject } from 'react';

const views: { label: string; value: CalendarViewType }[] = [
  { label: 'Month', value: 'dayGridMonth' },
  { label: 'Week', value: 'timeGridWeek' },
  { label: 'Day', value: 'timeGridDay' },
  { label: 'List', value: 'listWeek' },
];

interface CalendarToolbarProps {
  calendarRef: RefObject<FullCalendar | null>;
}

export function CalendarToolbar({ calendarRef }: CalendarToolbarProps) {
  const { calendarView, setCalendarView } = useAppStore();

  const getApi = () => calendarRef.current?.getApi();

  const goToday = () => getApi()?.today();
  const goPrev = () => getApi()?.prev();
  const goNext = () => getApi()?.next();

  const title = getApi()?.view.title || '';

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
      <div className="flex items-center gap-2">
        <button onClick={goPrev} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <button onClick={goToday} className="px-3 py-1 text-xs font-medium text-foreground rounded-md hover:bg-secondary transition-colors">
          Today
        </button>
        <button onClick={goNext} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
        <h2 className="text-sm font-semibold text-foreground ml-3">{title}</h2>
      </div>

      <div className="flex items-center bg-secondary rounded-lg p-0.5">
        {views.map((v) => (
          <button
            key={v.value}
            onClick={() => {
              setCalendarView(v.value);
              getApi()?.changeView(v.value);
            }}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
              calendarView === v.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
