import React, { useMemo } from "react";

// Custom Monthly Calendar Widget for scheduler card (Rethemed to light blue palette)
export const CalendarWidget = ({ events }) => {
  const { year, month, todayDate } = useMemo(() => {
    const d = new Date();
    return {
      year: d.getFullYear(),
      month: d.getMonth(),
      todayDate: d.getDate()
    };
  }, []);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // First day of current month
  const firstDay = useMemo(() => new Date(year, month, 1).getDay(), [year, month]);
  // Number of days in current month
  const numDays = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);

  // Map event dates to day numbers for current month/year
  const activeEventDays = useMemo(() => {
    const days = new Set();
    events.forEach(evt => {
      if (evt.status !== 'cancelled' && evt.event_date) {
        const d = new Date(evt.event_date);
        if (d.getFullYear() === year && d.getMonth() === month) {
          days.add(d.getDate());
        }
      }
    });
    return days;
  }, [events, year, month]);

  const daysArr = useMemo(() => {
    const arr = [];
    // Add blank spots for days before the first day of the week
    for (let i = 0; i < firstDay; i++) {
      arr.push(null);
    }
    for (let i = 1; i <= numDays; i++) {
      arr.push(i);
    }
    return arr;
  }, [firstDay, numDays]);

  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="w-full text-slate-800">
      <div className="flex justify-between items-center mb-1.5 md:mb-3">
        <h4 className="text-[11px] md:text-xs font-bold text-slate-500">{monthNames[month]} {year}</h4>
        <span className="text-[8px] md:text-[9px] bg-vayo-blue/15 border border-vayo-blue/30 px-1.5 py-0.5 rounded-full text-vayo-blue font-bold uppercase tracking-wider">
          Events Calendar
        </span>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-0.5 md:gap-1 text-center text-[8px] md:text-[10px] font-bold text-slate-400 mb-0.5 md:mb-1">
        {weekdays.map(d => <div key={d}>{d}</div>)}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-0.5 md:gap-1 text-center text-[10px] md:text-xs">
        {daysArr.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;
          const isToday = day === todayDate;
          const hasEvent = activeEventDays.has(day);

          return (
            <div
              key={`day-${day}`}
              className={`h-5 sm:h-6 md:h-7 flex items-center justify-center rounded-full transition-all ${hasEvent
                ? "bg-vayo-blue text-white font-extrabold shadow-sm scale-105"
                : isToday
                  ? "border border-vayo-light text-vayo-light font-semibold"
                  : "text-slate-500 hover:text-slate-800 hover:bg-vayo-alice"
                }`}
              title={hasEvent ? "Scheduled Event" : undefined}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};
