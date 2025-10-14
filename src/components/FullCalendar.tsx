'use client';

import { cn } from '@/lib/utils';
import { PropsWithAsChild } from '@/types/utils';
import {
  Active,
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  Over,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Slot } from '@radix-ui/react-slot';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getMonth,
  isPast,
  isSameDay,
  isSameMonth,
  isToday,
  setMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  ComponentProps,
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { twJoin } from 'tailwind-merge';
import { LiteralUnion, Merge } from 'type-fest';
import { Button } from './ui/button';
import { ScrollArea, ScrollBar } from './ui/scroll-area';

type DraggableData = { event: Event };
type DroppableData = {
  date: Date;
  disabled: boolean;
};

function getDraggableData(active: Active) {
  return active.data.current as DraggableData | undefined;
}
function getDroppableData(over: Over) {
  return over.data.current as DroppableData | undefined;
}

const WEEK_DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CalendarContext = createContext<{
  current: Date;
  setCurrent: Dispatch<SetStateAction<Date>>;
  selected: Date | null;
  setSelected: Dispatch<SetStateAction<Date | null>>;
  handleGoNext: () => void;
  handleGoPrev: () => void;
} | null>(null);

const useCalendarContext = () => {
  const ctx = useContext(CalendarContext);
  if (!ctx)
    throw new Error(
      'useCalendarContext must be inside CalendarContextProvider'
    );
  return ctx;
};

export type Event = { id: string; title: string; date: Date };

const FullCalendar = (props: ComponentProps<'div'>) => {
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);

  const handleGoNext = useCallback(
    () => setCurrent(addMonths(current, 1)),
    [current]
  );
  const handleGoPrev = useCallback(
    () => setCurrent(subMonths(current, 1)),
    [current]
  );

  return (
    <CalendarContext.Provider
      value={{
        current,
        setCurrent,
        selected,
        setSelected,
        handleGoNext,
        handleGoPrev,
      }}
    >
      <div
        {...props}
        className={cn(
          'flex flex-col gap-2 bg-secondary p-2 rounded-md',
          props.className
        )}
      />
    </CalendarContext.Provider>
  );
};

const FullCalendarDayCell = ({
  className,
  date,
  disabled = false,
  switchToMonthOnClick = true,
  children,
  ...props
}: ComponentProps<'div'> & {
  date: Date;
  disabled?: boolean;
  switchToMonthOnClick?: boolean;
}) => {
  const { selected, current, setCurrent, setSelected } = useCalendarContext();
  const _isSameMonth = isSameMonth(current, date);

  const handleClick = () => {
    if (disabled) return;
    if (!_isSameMonth && switchToMonthOnClick) {
      const month = getMonth(date);
      setCurrent((current) => setMonth(current, month));
    }
    setSelected(date);
  };

  const id = date.toString();

  const { setNodeRef } = useDroppable({
    id,
    data: {
      date,
      disabled,
    } satisfies DroppableData,
  });

  return (
    <div
      {...props}
      id={id}
      ref={setNodeRef}
      onClick={handleClick}
      className={cn(
        'p-2 bg-background flex flex-col aspect-square rounded text-xs md:text-sm overflow-hidden',
        _isSameMonth
          ? 'dark:text-white text-neutral-950'
          : 'text-muted-foreground line-pattern bg-center',
        isToday(date) && 'bg-primary/10',
        selected && isSameDay(selected, date) && 'border-primary border',
        disabled &&
          'dark:bg-zinc-800 cursor-not-allowed dark:text-zinc-700 bg-zinc-200 text-zinc-400',
        className
      )}
    >
      <span
        className={twJoin(
          'shrink-0',
          isToday(date) &&
            'bg-primary text-primary-foreground size-5 flex items-center justify-center rounded-full'
        )}
      >
        {date.getDate()}
      </span>
      <div className="flex flex-1 min-w-0 overflow-y-auto [&>*]:shrink-0 flex-col gap-1 mt-2">
        {children}
      </div>
    </div>
  );
};

const FullCalendarNextMonthBtn = ({
  children,
  ...props
}: ComponentProps<typeof Button>) => {
  const { handleGoNext } = useCalendarContext();

  return (
    <Button
      size="icon"
      variant="outline"
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        if (e.isDefaultPrevented() || props.disabled) return;
        handleGoNext();
      }}
    >
      {children ?? <ChevronRight />}
    </Button>
  );
};

const FullCalendarPrevMonthBtn = ({
  children,
  ...props
}: ComponentProps<typeof Button>) => {
  const { handleGoPrev } = useCalendarContext();
  return (
    <Button
      size="icon"
      variant="outline"
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        if (e.isDefaultPrevented() || props.disabled) return;
        handleGoPrev();
      }}
    >
      {children ?? <ChevronLeft />}
    </Button>
  );
};

const FullCalendarHeader = (props: ComponentProps<'div'>) => {
  return (
    <div
      {...props}
      className={cn('flex items-center justify-between', props.className)}
    />
  );
};

type FullCalendarCalendarProps<T> = {
  disablePast?: boolean;
  switchToMonthOnSelectDay?: boolean;
  events?: T[];
  onEventsChange?: (events: T[]) => void;
  renderEvent?: (event: T) => ReactNode;
  disabled?: boolean;
  readonly?: boolean;
};

const FullCalendarCalendar = <T extends Event>({
  disablePast = false,
  switchToMonthOnSelectDay = true,
  events = [],
  disabled,
  readonly = false,
  onEventsChange,
  renderEvent,
}: FullCalendarCalendarProps<T>) => {
  const { current } = useCalendarContext();
  const [activeEvent, setActiveEvent] = useState<T | null>(null);

  const days = useMemo(() => {
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(current)),
      end: endOfWeek(endOfMonth(current)),
    });
  }, [current]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 500,
        tolerance: 0,
      },
    })
  );

  const handleDragStart = (e: DragStartEvent) => {
    if (disabled) return;
    setActiveEvent(e.active.data.current?.event);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveEvent(null);

    if (disabled) return;

    const { active, over } = e;
    if (
      !over ||
      over.data.current?.disabled ||
      getDraggableData(active)?.event.date.toString() ===
        getDroppableData(over)?.date.toString()
    )
      return;

    const newEvents = events.map((event) => {
      return {
        ...event,
        date:
          event.id === active.data.current?.event?.id
            ? (over.data.current?.date as Date)
            : event.date,
      };
    });

    onEventsChange?.(newEvents);
  };

  return (
    <ScrollArea className="overflow-hidden">
      <div className="grid grid-cols-7 gap-1 grid-rows-[auto_repeat(5,1fr)] min-w-[854px]">
        {WEEK_DAY_NAMES.map((weekName) => (
          <span
            key={weekName}
            className="py-2 text-xs md:text-sm justify-self-center"
          >
            {weekName}
          </span>
        ))}

        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
          sensors={sensors}
        >
          {days.map((date) => {
            const currentDayTasks = events.filter((event) =>
              isSameDay(event.date, date)
            );

            return (
              <FullCalendarDayCell
                key={date.toString()}
                disabled={disablePast && isPast(date) && !isToday(date)}
                date={date}
                switchToMonthOnClick={switchToMonthOnSelectDay}
              >
                {currentDayTasks.map((event) => (
                  <FullCalendarEventDragWrapper
                    asChild
                    event={event}
                    key={event.id}
                    disabled={disabled}
                    readonly={readonly}
                  >
                    {renderEvent?.(event) ?? (
                      <FullCalendarEvent event={event} />
                    )}
                  </FullCalendarEventDragWrapper>
                ))}
              </FullCalendarDayCell>
            );
          })}
          <DragOverlay className={twJoin(!!activeEvent && 'cursor-grabbing')}>
            {!!activeEvent &&
              (renderEvent?.(activeEvent) ?? (
                <FullCalendarEvent event={activeEvent} />
              ))}
          </DragOverlay>
        </DndContext>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

const FullCalendarCurrentValue = ({
  format: formatString = 'full',
  ...props
}: ComponentProps<'span'> & {
  format?: LiteralUnion<'short' | 'full', string>;
}) => {
  const { current } = useCalendarContext();

  return (
    <span {...props} className={cn('text-sm md:text-base', props.className)}>
      {format(
        current,
        formatString === 'short'
          ? 'MMM YYY'
          : formatString === 'full'
          ? 'MMMM YYY'
          : formatString
      )}
    </span>
  );
};

type FullCalendarEventDragWrapperProps = PropsWithAsChild<
  Merge<
    ComponentProps<'div'>,
    { event: Event; disabled?: boolean; readonly?: boolean }
  >
>;

const FullCalendarEventDragWrapper = ({
  event,
  asChild,
  disabled = false,
  readonly = false,
  ...props
}: FullCalendarEventDragWrapperProps) => {
  const { setNodeRef, listeners, attributes, transform, isDragging } =
    useDraggable({
      id: event.id,
      data: { event } satisfies DraggableData,
      disabled: disabled || readonly,
    });

  if (isDragging) return null;

  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      {...listeners}
      {...attributes}
      {...props}
      ref={setNodeRef}
      data-dragging={isDragging}
      data-disabled={disabled}
      data-readonly={readonly}
      style={{ ...props.style, transform: CSS.Translate.toString(transform) }}
      className={cn(
        isDragging ? 'cursor-grabbing' : 'cursor-grab',
        disabled && 'opacity-50',
        props.className
      )}
    />
  );
};

const FullCalendarEvent = ({
  event,
  ...props
}: ComponentProps<'div'> & { event: Event }) => {
  return (
    <div
      {...props}
      className={cn(
        'bg-primary text-xs text-primary-foreground p-1 rounded text-nowrap text-ellipsis overflow-hidden',
        props.className
      )}
    >
      {event.title}
    </div>
  );
};

export {
  FullCalendar,
  FullCalendarCalendar,
  FullCalendarCurrentValue,
  FullCalendarHeader,
  FullCalendarNextMonthBtn,
  FullCalendarPrevMonthBtn,
};
