import { useState } from 'react';
import { usePartner } from '@/hooks/usePartner';
import { useAuth } from '@/hooks/useAuth';
import { auth, db } from '@/firebase/config';
import { collection, addDoc, serverTimestamp, getDocs, updateDoc, query, where } from 'firebase/firestore';

export function TimerForm() {
  const { user } = useAuth();

  const { hasPartner, partnershipId } = usePartner();
  const [label, setLabel] = useState('');
  const [duration, setDuration] = useState(''); // minutes as string

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const durationMinutes = parseInt(duration, 10) || null;
    const start = serverTimestamp();
    const expiresAt = durationMinutes ? new Date(Date.now() + durationMinutes * 60 * 1000) : null;
    const timerData = {
      label: label || null,
      durationMinutes,
      startTime: start,
      startedBy: auth.currentUser?.uid,
      expiresAt,
    };
    if (hasPartner && partnershipId) {
      await addDoc(collection(db, 'partnerships', partnershipId, 'timers'), timerData);
    } else if (user) {
      await addDoc(collection(db, 'users', user.uid, 'timers'), timerData);

      // Update default Study Hours habit total minutes
      if (durationMinutes) {
        const habitQ = query(collection(db, 'habits'), where('userId', '==', user.uid), where('name', '==', 'Study Hours'));
        const habitSnap = await getDocs(habitQ);
        if (!habitSnap.empty) {
          const habitDoc = habitSnap.docs[0];
          const current = habitDoc.data().totalMinutes || 0;
          await updateDoc(habitDoc.ref, { totalMinutes: current + durationMinutes });
        }
      }
    }
    setLabel('');
    setDuration('');
  };

  return (
    <form onSubmit={handleStart} className="mb-6 flex gap-2 bg-card p-4 rounded-lg border border-border">
      <input
        type="text"
        placeholder="Label (optional)"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="flex-1 rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      <input
        type="number"
        placeholder="Minutes"
        min="1"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className="w-24 rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90"
      >
        Start Timer
      </button>
    </form>
  );
}
