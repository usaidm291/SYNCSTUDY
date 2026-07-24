import { useEffect, useRef, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/hooks/useAuth';
import { usePartner } from '@/hooks/usePartner';

interface ReminderMessage {
  id: string;
  text?: string;
  type?: string;
  userId?: string;
  userName?: string;
}

export function PartnerReminderToast() {
  const { user } = useAuth();
  const { partnershipId } = usePartner();
  const [reminder, setReminder] = useState<ReminderMessage | null>(null);
  const isInitialSnapshot = useRef(true);

  useEffect(() => {
    setReminder(null);
    isInitialSnapshot.current = true;
    if (!user || !partnershipId) return;

    const remindersQuery = query(
      collection(db, 'partnerships', partnershipId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(25)
    );
    const unsubscribe = onSnapshot(remindersQuery, (snapshot) => {
      // Existing chat history must not produce notifications when the app opens.
      if (isInitialSnapshot.current) {
        isInitialSnapshot.current = false;
        return;
      }
      snapshot.docChanges().forEach((change) => {
        const message = { id: change.doc.id, ...change.doc.data() } as ReminderMessage;
        if (change.type === 'added' && message.type === 'reminder' && message.userId !== user.uid) {
          setReminder(message);
        }
      });
    });
    return unsubscribe;
  }, [user, partnershipId]);

  useEffect(() => {
    if (!reminder) return;
    const timeout = window.setTimeout(() => setReminder(null), 7000);
    return () => window.clearTimeout(timeout);
  }, [reminder]);

  if (!reminder) return null;

  return (
    <div className="fixed top-5 left-5 z-50 w-[min(24rem,calc(100vw-2.5rem))] rounded-xl border border-primary/30 bg-card p-4 shadow-xl animate-in fade-in slide-in-from-top-3 duration-300" role="alert">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-foreground">Reminder from {reminder.userName || 'your partner'}</p>
          <p className="mt-1 text-sm text-muted-foreground">{reminder.text}</p>
        </div>
        <button onClick={() => setReminder(null)} className="text-muted-foreground hover:text-foreground" aria-label="Dismiss reminder">Dismiss</button>
      </div>
    </div>
  );
}
