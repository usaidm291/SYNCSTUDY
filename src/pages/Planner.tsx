import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebase/config';
import { collection, addDoc, deleteDoc, onSnapshot, query, where } from 'firebase/firestore';

interface PlannerEvent {
  id: string;
  title: string;
  day: string;
  time: string;
  color: string;
}

export function Planner() {
  const { user } = useAuth();
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const times = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'plannerEvents'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PlannerEvent[];
      setEvents(eventsData);
    });
    return () => unsubscribe();
  }, [user]);

  const addEvent = async (day: string, time: string) => {
    if (!user) return;
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
    if (window.confirm('Delete this event?')) {
      await deleteDoc(doc(db, 'plannerEvents', id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-[70vh]">
        <div className="grid grid-cols-8 border-b border-border bg-muted/20">
          <div className="p-4 text-center text-xs font-semibold text-muted-foreground border-r border-border">
            GMT+0
          </div>
          {days.map((day, i) => (
            <div key={day} className="p-4 text-center border-r border-border last:border-0">
              <div className="text-xs font-semibold text-muted-foreground uppercase">{day}</div>
              <div className={`text-xl font-bold mt-1 ${i === 2 ? 'bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center mx-auto' : ''}`}>
                {15 + i}
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
                
                return (
                <div 
                  key={`${day}-${time}`} 
                  onClick={() => !slotEvent && addEvent(day, time)}
                  className="p-2 border-r border-border last:border-0 relative hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  {slotEvent && (
                    <div className={`absolute inset-x-1 top-1 bottom-1 bg-${slotEvent.color}-500/20 border border-${slotEvent.color}-500/50 rounded-md p-2 flex flex-col justify-between group/event`}>
                      <span className={`text-xs font-bold text-${slotEvent.color}-700 dark:text-${slotEvent.color}-300 break-words leading-tight`}>{slotEvent.title}</span>
                      <div className="flex justify-between items-end">
                        <span className={`text-[10px] text-${slotEvent.color}-600 dark:text-${slotEvent.color}-400`}>{time}</span>
                        <button 
                          onClick={(e) => deleteEvent(e, slotEvent.id)}
                          className="opacity-0 group-hover/event:opacity-100 text-xs text-destructive hover:underline"
                        >
                          x
                        </button>
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
