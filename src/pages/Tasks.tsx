import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebase/config';
import { collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt?: any;
}

export function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState<'low'|'medium'|'high'>('medium');

  useEffect(() => {
    if (!user) return;
    // Removed orderBy to avoid requiring a Firestore composite index
    const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Task[];
      // Sort client-side instead
      tasksData.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
      setTasks(tasksData);
    });
    return () => unsubscribe();
  }, [user]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !user) return;
    
    await addDoc(collection(db, 'tasks'), {
      title: newTask,
      completed: false,
      priority,
      userId: user.uid,
      createdAt: serverTimestamp()
    });
    setNewTask('');
  };

  const toggleTask = async (id: string, currentStatus: boolean) => {
    await updateDoc(doc(db, 'tasks', id), { completed: !currentStatus });
  };

  const deleteTask = async (id: string) => {
    await deleteDoc(doc(db, 'tasks', id));
  };

  const priorityColors = {
    low: 'bg-emerald-500/10 text-emerald-500',
    medium: 'bg-orange-500/10 text-orange-500',
    high: 'bg-red-500/10 text-red-500',
  };

  return (
    <div className="max-w-4xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Task Manager</h1>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20">
          <form onSubmit={addTask} className="flex gap-4">
            <input 
              type="text" 
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 rounded-lg border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <select 
              value={priority} 
              onChange={(e) => setPriority(e.target.value as any)}
              className="rounded-lg border border-input bg-background px-4 py-3 focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Add Task
            </button>
          </form>
        </div>

        <div className="divide-y divide-border">
          {tasks.map(task => (
            <div key={task.id} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors group">
              <input 
                type="checkbox" 
                checked={task.completed}
                onChange={() => toggleTask(task.id, task.completed)}
                className="w-5 h-5 rounded border-input bg-background text-primary focus:ring-primary cursor-pointer"
              />
              <span className={`flex-1 font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {task.title}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${priorityColors[task.priority]}`}>
                {task.priority.toUpperCase()}
              </span>
              <button 
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-2"
              >
                Delete
              </button>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No tasks yet. Enjoy your day!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
