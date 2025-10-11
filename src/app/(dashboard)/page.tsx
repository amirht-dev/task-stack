'use client';

import {
  Event,
  FullCalendar,
  FullCalendarCalendar,
  FullCalendarCurrentValue,
  FullCalendarNextMonthBtn,
  FullCalendarPrevMonthBtn,
} from '@/components/FullCalendar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { addDays } from 'date-fns';
import { useState } from 'react';

const defaultEvents: (Event & { status: string })[] = [
  addDays(new Date(), 1),
  addDays(new Date(), 5),
].map((date, idx) => ({
  id: idx.toString(),
  status: 'todo',
  title: `event ${idx + 1}`,
  date: date,
}));

const Home = () => {
  const [events, setEvents] =
    useState<(Event & { status: string })[]>(defaultEvents);
  return (
    <div className="p-4 container">
      <div className="overflow-auto">
        <div className="w-[2000px] h-[200px] bg-red-100"></div>
      </div>
      <Card>
        <FullCalendar>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-4">
              <FullCalendarPrevMonthBtn />
              <FullCalendarCurrentValue />
              <FullCalendarNextMonthBtn />
            </div>
          </CardHeader>
          <CardContent>
            <FullCalendarCalendar
              disablePast
              events={events}
              onEventsChange={setEvents}
              // renderEvent={(event) => (
              //   <div className="p-1 text-xs bg-red-500 text-white rounded text-nowrap text-ellipsis overflow-hidden">
              //     {event.status}: {event.title}
              //   </div>
              // )}
            />
          </CardContent>
        </FullCalendar>
      </Card>
    </div>
  );
};

export default Home;
