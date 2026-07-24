import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePartner } from '@/hooks/usePartner';
import { db } from '@/firebase/config';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';

export function useGlobalNotifications() {
  const { user } = useAuth();
  const { hasPartner, partnershipId } = usePartner();
  const initialLoadRef = useRef(true);
  const lastMessageIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user || !hasPartner || !partnershipId) return;

    // Check if notifications are enabled
    if (Notification.permission !== 'granted') return;

    const chatCollection = collection(db, 'partnerships', partnershipId, 'messages');
    // Just listen to the single most recent message to avoid loading full history
    const q = query(chatCollection, orderBy('createdAt', 'desc'), limit(1));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) return;

      const latestDoc = snapshot.docs[0];
      const data = latestDoc.data();
      
      // Prevent notifying on initial load
      if (initialLoadRef.current) {
        initialLoadRef.current = false;
        lastMessageIdRef.current = latestDoc.id;
        return;
      }

      // If it's a new message and NOT from the current user
      if (latestDoc.id !== lastMessageIdRef.current && data.userId !== user.uid) {
        lastMessageIdRef.current = latestDoc.id;
        
        // Show notification
        const notification = new Notification(`New message from ${data.userName}`, {
          body: data.text,
          icon: '/pwa-192x192.png', // Uses your PWA icon
          badge: '/pwa-192x192.png',
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
    });

    return () => unsubscribe();
  }, [user, hasPartner, partnershipId]);
}
