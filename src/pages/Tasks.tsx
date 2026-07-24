import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BackToDashboard } from '@/components/BackToDashboard';
import { usePartner } from '@/hooks/usePartner';
import { db } from '@/firebase/config';
import { collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore';

interface Task { id: string; title: string; completed: boolean; priority?: 'low' | 'medium' | 'high'; createdAt?: any; }
const priorityColors = { low: 'bg-emerald-500/10 text-emerald-500', medium: 'bg-orange-500/10 text-orange-500', high: 'bg-red-500/10 text-red-500' };

export function Tasks() {
  const { user } = useAuth();
  const { hasPartner, partnerId, partnerName, partnershipId } = usePartner();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [view, setView] = useState<'mine' | 'partner'>('mine');

  const ownerId = view === 'partner' ? partnerId : user?.uid;
  useEffect(() => {
    if (!ownerId) { setTasks([]); return; }
    const unsubscribe = onSnapshot(query(collection(db, 'tasks'), where('userId', '==', ownerId)), snapshot => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Task[];
      data.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setTasks(data);
    });
    return unsubscribe;
  }, [ownerId]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !user) return;
    await addDoc(collection(db, 'tasks'), { title: newTask.trim(), completed: false, priority, userId: user.uid, createdAt: serverTimestamp() });
    setNewTask('');
  };
  const sendReminder = async (task: Task) => {
    if (!user || !partnershipId) return;
    await addDoc(collection(db, 'partnerships', partnershipId, 'messages'), { text: `Reminder: Don't forget to "${task.title}"!`, userId: user.uid, userName: user.displayName || 'Partner', createdAt: serverTimestamp(), type: 'reminder' });
  };

  return <div className="max-w-4xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500"><div className="mb-6"><BackToDashboard /></div>
    <div className="flex flex-wrap justify-between gap-4 mb-8"><div><h1 className="text-3xl font-bold text-foreground">Task Manager</h1><p className="text-muted-foreground">{view === 'mine' ? 'Keep track of what you need to finish.' : `${partnerName}'s tasks are view-only.`}</p></div>
      {hasPartner && <div className="flex gap-1 bg-secondary p-1 rounded-lg"><button onClick={() => setView('mine')} className={`px-3 py-1.5 rounded-md text-sm ${view === 'mine' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>My tasks</button><button onClick={() => setView('partner')} className={`px-3 py-1.5 rounded-md text-sm ${view === 'partner' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>{partnerName}'s tasks</button></div>}
    </div>
    {view === 'mine' && <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"><div className="p-6 border-b border-border bg-muted/20"><form onSubmit={addTask} className="flex gap-4"><input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="What needs to be done?" className="flex-1 rounded-lg border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"/><select value={priority} onChange={e => setPriority(e.target.value as typeof priority)} className="rounded-lg border border-input bg-background px-4 py-3"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select><button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold">Add Task</button></form></div>
      <TaskList tasks={tasks} onToggle={(task) => updateDoc(doc(db, 'tasks', task.id), { completed: !task.completed })} onDelete={(task) => deleteDoc(doc(db, 'tasks', task.id))}/></div>}
    {view === 'partner' && <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"><TaskList tasks={tasks} onRemind={sendReminder}/></div>}
  </div>;
}
function TaskList({ tasks, onToggle, onDelete, onRemind }: { tasks: Task[]; onToggle?: (task: Task) => void; onDelete?: (task: Task) => void; onRemind?: (task: Task) => void }) {
  return <div className="divide-y divide-border">{tasks.map(task => { const taskPriority = task.priority || 'medium'; return <div key={task.id} className="p-4 flex items-center gap-4"><input type="checkbox" checked={task.completed} disabled={!onToggle} onChange={() => onToggle?.(task)} className="w-5 h-5"/><span className={`flex-1 font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</span><span className={`px-2 py-1 rounded text-xs font-semibold ${priorityColors[taskPriority]}`}>{taskPriority.toUpperCase()}</span>{onRemind && !task.completed && <button onClick={() => onRemind(task)} className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full">Remind</button>}{onDelete && <button onClick={() => onDelete(task)} className="text-muted-foreground hover:text-destructive">Delete</button>}</div>; })}{tasks.length === 0 && <div className="p-8 text-center text-muted-foreground">No tasks yet.</div>}</div>;
}



