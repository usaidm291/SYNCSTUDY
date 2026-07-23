import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebase/config';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore';

interface Habit {
  id: string;
  name: string;
  streak: number;
  longest: number;
  icon: string;
  color: string;
}

export function Habits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'habits'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const habitsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Habit[];
      setHabits(habitsData);
    });
    return () => unsubscribe();
  }, [user]);

  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim() || !user) return;
    
    await addDoc(collection(db, 'habits'), {
      name: newHabitName,
      streak: 0,
      longest: 0,
      icon: '🎯',
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      userId: user.uid,
      createdAt: serverTimestamp()
    });
    setNewHabitName('');
    setIsAdding(false);
  };

  const incrementStreak = async (habit: Habit) => {
    const newStreak = habit.streak + 1;
    const newLongest = newStreak > habit.longest ? newStreak : habit.longest;
    await updateDoc(doc(db, 'habits', habit.id), {
      streak: newStreak,
      longest: newLongest
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Habit Tracker</h1>
          <p className="text-muted-foreground">Build consistency day by day.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90"
        >
          {isAdding ? 'Cancel' : '+ New Habit'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={addHabit} className="mb-8 flex gap-4 bg-card p-4 rounded-xl border border-border">
          <input 
            type="text" 
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="Name your new habit..."
            className="flex-1 rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
            autoFocus
          />
          <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90">
            Save
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {habits.map(habit => (
          <div key={habit.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:border-foreground/20 transition-colors">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${habit.color}`}>
                  {habit.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{habit.name}</h3>
                  <p className="text-sm text-muted-foreground">Current Streak: <span className="font-semibold text-foreground">{habit.streak} days</span></p>
                </div>
              </div>
              <button 
                onClick={() => incrementStreak(habit)}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors cursor-pointer"
                title="Mark completed today"
              >
                ✓
              </button>
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Longest: {habit.longest} days</span>
              </div>
              <div className="flex gap-1 justify-between overflow-hidden">
                {Array.from({ length: 14 }).map((_, i) => {
                  // Mock history view - shows blocks based on streak
                  const isCompleted = i < habit.streak;
                  return (
                    <div 
                      key={i} 
                      className={`w-4 h-6 rounded-sm ${isCompleted ? 'bg-primary opacity-100' : 'bg-muted opacity-50'}`}
                    ></div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
        {habits.length === 0 && !isAdding && (
          <div className="col-span-1 md:col-span-2 text-center text-muted-foreground p-12 bg-muted/20 rounded-2xl border border-dashed border-border">
            You don't have any habits tracking yet. Click "+ New Habit" to start.
          </div>
        )}
      </div>
    </div>
  );
}
