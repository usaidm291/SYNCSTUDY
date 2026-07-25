import { useState } from 'react';
import { usePartner } from '@/hooks/usePartner';
import { db } from '@/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function TimerForm() {
  const { hasPartner, partnershipId } = usePartner();
  const [label, setLabel] = useState('');
  const [duration, setDuration] = useState(''); // minutes as string

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPartner || !partnershipId) return;
    const durationMinutes = parseInt(duration, 10) || null;
    const start = serverTimestamp();
    const expiresAt = durationMinutes
      ? serverTimestamp() // placeholder, will be computed on server via Cloud Function or client after write
      : null;
    await addDoc(collection(db, 'partnerships', partnershipId, 'timers'), {
      label: label || null,
      durationMinutes: durationMinutes,
      startTime: start,
      startedBy: db.auth?.currentUser?.uid,
      expiresAt: durationMinutes ? null : null, // set later
    });
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
