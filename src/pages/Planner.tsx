import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BackToDashboard } from '@/components/BackToDashboard';
import { usePartner } from '@/hooks/usePartner';
import { db } from '@/firebase/config';
import { collection, addDoc, deleteDoc, onSnapshot, query, where, doc } from 'firebase/firestore';

interface PlannerEvent {
  id: string;
  title: string;
  day: string;
  time: string;
  color: string;
}

// Tailwind can't handle dynamic class names like `bg-${color}-500` because it purges them at build time.
// We must map to full static class strings.
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
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const times = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  useEffect(() => {
    if (!ownerId) { setEvents([]); return; }
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

  const addEvent = async (day: string, time: string) => {
    if (!user || dataView !== 'mine') return;
    const title = window.prompt(`Enter event for ${day} at ${time}:`);
    if (!title?.trim()) return;

    const colors = ['indigo', 'emerald', 'blue', 'orange', 'red'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    await addDoc(collection(db, 'plannerEvents'), {
      title,
      day,
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

  const getDateForDay = (dayIndex: number) => {
    const now = new Date();
    const currentDay = now.getDay(); // 0=Sun, 1=Mon...
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset + dayIndex);
    return monday.getDate();
  };

  const todayIndex = (() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1; // Convert to Mon=0 format
  })();

  return (
    <div className="max-w-6xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6"><BackToDashboard /></div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Planner</h1>
          <p className="text-muted-foreground">Schedule your sessions and assignments.</p>
        </div>
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
      </div>

      {hasPartner && <div className="flex gap-1 bg-secondary p-1 rounded-lg mb-4 w-fit"><button onClick={() => setDataView('mine')} className={`px-3 py-1.5 rounded-md text-sm ${dataView === 'mine' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>My planner</button><button onClick={() => setDataView('partner')} className={`px-3 py-1.5 rounded-md text-sm ${dataView === 'partner' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>{partnerName}'s planner</button></div>}
      {dataView === 'partner' && <p className="text-sm text-muted-foreground mb-4">Viewing {partnerName}'s planner. It is read-only.</p>}      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-[70vh]">
        <div className="grid grid-cols-8 border-b border-border bg-muted/20">
          <div className="p-4 text-center text-xs font-semibold text-muted-foreground border-r border-border">
            Time
          </div>
          {days.map((day, idx) => (
            <div key={day} className="p-4 text-center border-r border-border last:border-0">
              <div className="text-xs font-semibold text-muted-foreground uppercase">{day}</div>
              <div className={`text-xl font-bold mt-1 ${idx === todayIndex ? 'bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center mx-auto' : ''}`}>
                {getDateForDay(idx)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {times.map(time => (
            <div key={time} className="grid grid-cols-8 border-b border-border min-h-[80px]">
              <div className="p-2 text-xs text-muted-foreground text-center border-r border-border bg-muted/5 font-mono">
                {time}
              </div>
              {days.map((day) => {
                const slotEvent = events.find(e => e.day === day && e.time === time);
                const style = slotEvent ? (colorStyles[slotEvent.color] || colorStyles.indigo) : null;
                
                return (
                <div 
                  key={`${day}-${time}`} 
                  onClick={() => dataView === 'mine' && !slotEvent && addEvent(day, time)}
                  className="p-2 border-r border-border last:border-0 relative hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  {slotEvent && style && (
                    <div className={`absolute inset-x-1 top-1 bottom-1 ${style.bg} border ${style.border} rounded-md p-2 flex flex-col justify-between`}>
                      <span className={`text-xs font-bold ${style.text} break-words leading-tight`}>{slotEvent.title}</span>
                      <div className="flex justify-between items-end">
                        <span className={`text-[10px] ${style.subtext}`}>{time}</span>
                        {dataView === 'mine' && <button 
                          onClick={(e) => deleteEvent(e, slotEvent.id)}
                          className="text-xs text-destructive hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>}
                      </div>
                    </div>
                  )}
                  
                  {!slotEvent && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none">
                      <span className="text-xs text-muted-foreground/50">+</span>
                    </div>
                  )}
                </div>
              )})}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}





