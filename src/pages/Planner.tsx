import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BackToDashboard } from '@/components/BackToDashboard';
import { usePartner } from '@/hooks/usePartner';
import { db } from '@/firebase/config';
import { collection, addDoc, deleteDoc, onSnapshot, query, where, doc } from 'firebase/firestore';
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PlannerEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  color: string;
  userId: string;
}

const colorStyles: Record<string, { bg: string; border: string; text: string; subtext: string }> = {
  indigo: { bg: 'bg-indigo-500/20', border: 'border-indigo-500/50', text: 'text-indigo-300', subtext: 'text-indigo-400' },
  emerald: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-300', subtext: 'text-emerald-400' },
  blue: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-300', subtext: 'text-blue-400' },
  orange: { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-300', subtext: 'text-orange-400' },
  red: { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-300', subtext: 'text-red-400' },
};

export function Planner() {
  const { user } = useAuth();
  const { hasPartner, partnerId, partnerName } = usePartner();
  const [dataView, setDataView] = useState<'mine' | 'partner'>('mine');
  const ownerId = dataView === 'partner' ? partnerId : user?.uid;
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  
  const times = Array.from({length: 13}, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`); // 08:00 to 20:00

  useEffect(() => {
    if (!ownerId) { setEvents([]); return; }
    // Fetch all events for the user. For a real production app, you might want to filter by date range.
    const q = query(collection(db, 'plannerEvents'), where('userId', '==', ownerId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as PlannerEvent[];
      setEvents(eventsData);
    });
    return () => unsubscribe();
  }, [ownerId]);

  const addEvent = async (date: Date, time: string = 'All Day') => {
    if (!user || dataView !== 'mine') return;
    const title = window.prompt(`Enter event for ${format(date, 'MMM d, yyyy')} at ${time}:`);
    if (!title?.trim()) return;

    const colors = ['indigo', 'emerald', 'blue', 'orange', 'red'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    await addDoc(collection(db, 'plannerEvents'), {
      title,
      date: format(date, 'yyyy-MM-dd'),
      time,
      color: randomColor,
      userId: user.uid
    });
  };

  const deleteEvent = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (dataView === 'mine' && window.confirm('Delete this event?')) {
      await deleteDoc(doc(db, 'plannerEvents', id));
    }
  };

  const handlePrev = () => {
    if (view === 'daily') setCurrentDate(d => subDays(d, 1));
    else if (view === 'weekly') setCurrentDate(d => subWeeks(d, 1));
    else if (view === 'monthly') setCurrentDate(d => subMonths(d, 1));
  };

  const handleNext = () => {
    if (view === 'daily') setCurrentDate(d => addDays(d, 1));
    else if (view === 'weekly') setCurrentDate(d => addWeeks(d, 1));
    else if (view === 'monthly') setCurrentDate(d => addMonths(d, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Setup Date Arrays based on view
  let activeDays: Date[] = [];
  if (view === 'daily') {
    activeDays = [currentDate];
  } else if (view === 'weekly') {
    activeDays = eachDayOfInterval({ 
      start: startOfWeek(currentDate, { weekStartsOn: 1 }), 
      end: endOfWeek(currentDate, { weekStartsOn: 1 }) 
    });
  }

  // Monthly Calendar logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getHeaderDateText = () => {
    if (view === 'daily') return format(currentDate, 'MMMM d, yyyy');
    if (view === 'weekly') {
      const start = activeDays[0];
      const end = activeDays[6];
      if (isSameMonth(start, end)) return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    }
    return format(currentDate, 'MMMM yyyy');
  };

  return (
    <div className="max-w-6xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-screen flex flex-col">
      <div className="mb-6"><BackToDashboard /></div>
      
      {/* Header and Controls */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Planner</h1>
          <p className="text-muted-foreground">Schedule your sessions and assignments.</p>
        </div>
        
        <div className="flex flex-col items-end gap-4">
          <div className="flex gap-2 bg-secondary p-1 rounded-lg">
            {(['daily', 'weekly', 'monthly'] as const).map(v => (
              <button 
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === v ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          {hasPartner && (
            <div className="flex gap-1 bg-secondary/50 p-1 rounded-lg">
              <button onClick={() => setDataView('mine')} className={`px-3 py-1 text-xs rounded-md ${dataView === 'mine' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>My planner</button>
              <button onClick={() => setDataView('partner')} className={`px-3 py-1 text-xs rounded-md ${dataView === 'partner' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>{partnerName}'s planner</button>
            </div>
          )}
        </div>
      </div>

      {dataView === 'partner' && <p className="text-sm text-muted-foreground mb-4">Viewing {partnerName}'s planner. It is read-only.</p>}

      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-4 bg-card border border-border p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={handleToday} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80">Today</button>
          <div className="flex items-center gap-1 bg-background border border-border rounded-lg overflow-hidden">
            <button onClick={handlePrev} className="p-2 hover:bg-muted transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <div className="w-[1px] h-6 bg-border"></div>
            <button onClick={handleNext} className="p-2 hover:bg-muted transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
        <h2 className="text-xl font-bold">{getHeaderDateText()}</h2>
      </div>

      {/* Planner Grid */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
        
        {view === 'monthly' ? (
          // MONTHLY VIEW
          <div className="flex flex-col h-full">
            <div className="grid grid-cols-7 border-b border-border bg-muted/20">
              {weekDays.map(day => (
                <div key={day} className="p-3 text-center text-xs font-semibold text-muted-foreground border-r border-border last:border-0 uppercase">
                  {day}
                </div>
              ))}
            </div>
            <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-auto">
              {calendarDays.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayEvents = events.filter(e => e.date === dateStr);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div 
                    key={dateStr}
                    onClick={() => dataView === 'mine' && addEvent(day)}
                    className={`border-r border-b border-border p-2 min-h-[100px] cursor-pointer hover:bg-muted/10 transition-colors flex flex-col ${!isCurrentMonth ? 'bg-muted/5 opacity-50' : ''}`}
                  >
                    <div className={`text-xs font-semibold self-end mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1">
                      {dayEvents.map(evt => {
                        const style = colorStyles[evt.color] || colorStyles.indigo;
                        return (
                          <div key={evt.id} className={`text-[10px] px-1.5 py-1 rounded ${style.bg} ${style.text} flex justify-between items-center group`}>
                            <span className="truncate">{evt.time !== 'All Day' ? `${evt.time} ` : ''}{evt.title}</span>
                            {dataView === 'mine' && (
                              <button onClick={(e) => deleteEvent(e, evt.id)} className="opacity-0 group-hover:opacity-100 text-destructive ml-1">✕</button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // DAILY / WEEKLY VIEW
          <div className="flex flex-col h-full">
            <div className="flex border-b border-border bg-muted/20">
              <div className="w-16 flex-shrink-0 border-r border-border"></div>
              <div className={`flex-1 grid ${view === 'daily' ? 'grid-cols-1' : 'grid-cols-7'}`}>
                {activeDays.map(day => {
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div key={day.toString()} className="p-4 text-center border-r border-border last:border-0">
                      <div className={`text-xs font-semibold uppercase ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>{format(day, 'EEE')}</div>
                      <div className={`text-xl font-bold mt-1 mx-auto w-8 h-8 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-primary-foreground' : ''}`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto relative">
              {times.map(time => (
                <div key={time} className="flex border-b border-border min-h-[80px]">
                  <div className="w-16 flex-shrink-0 p-2 text-xs text-muted-foreground text-center border-r border-border bg-muted/5 font-mono flex items-start justify-center pt-3">
                    {time}
                  </div>
                  <div className={`flex-1 grid ${view === 'daily' ? 'grid-cols-1' : 'grid-cols-7'}`}>
                    {activeDays.map(day => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const slotEvent = events.find(e => e.date === dateStr && e.time === time);
                      const style = slotEvent ? (colorStyles[slotEvent.color] || colorStyles.indigo) : null;
                      
                      return (
                        <div 
                          key={`${dateStr}-${time}`}
                          onClick={() => dataView === 'mine' && !slotEvent && addEvent(day, time)}
                          className="border-r border-border last:border-0 relative hover:bg-muted/30 transition-colors cursor-pointer group p-1"
                        >
                          {slotEvent && style && (
                            <div className={`absolute inset-1 ${style.bg} border ${style.border} rounded-md p-2 flex flex-col justify-between shadow-sm z-10`}>
                              <span className={`text-xs font-bold ${style.text} leading-tight line-clamp-2`}>{slotEvent.title}</span>
                              <div className="flex justify-between items-end mt-1">
                                <span className={`text-[10px] ${style.subtext}`}>{time}</span>
                                {dataView === 'mine' && (
                                  <button onClick={(e) => deleteEvent(e, slotEvent.id)} className="text-xs text-destructive hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                                    ✕
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                          {!slotEvent && (
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none">
                              <span className="text-xs text-muted-foreground/50">+</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
