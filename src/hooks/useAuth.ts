import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, authReady } from '@/firebase/config';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const { user, loading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    // Wait for Firebase to restore its local browser session before deciding
    // whether a protected page should redirect to login.
    authReady
      .catch(() => undefined)
      .finally(() => {
        if (!active) return;
        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (!active) return;
          setUser(firebaseUser);
          setLoading(false);
        });
      });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [setUser, setLoading]);

  return { user, loading };
}
