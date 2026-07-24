import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebase/config';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

interface PartnerInfo {
  partnerId: string | null;
  partnerName: string;
  partnerEmail: string;
  partnershipId: string | null;
}

export function usePartner() {
  const { user } = useAuth();
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo>({
    partnerId: null,
    partnerName: '',
    partnerEmail: '',
    partnershipId: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const unsubUser = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (!snap.exists() || !snap.data().partnerId) {
        setPartnerInfo({ partnerId: null, partnerName: '', partnerEmail: '', partnershipId: null });
        setLoading(false);
        return;
      }

      const pid = snap.data().partnerId;
      const pshipId = [user.uid, pid].sort().join('_');

      // Fetch partner data (one-time, not nested listener)
      getDoc(doc(db, 'users', pid)).then((partnerSnap) => {
        // A connection is valid only when both users still point at each other.
        // This prevents a previous partner from being treated as active after a
        // disconnect or a partially-completed connection.
        if (partnerSnap.exists() && partnerSnap.data().partnerId === user.uid) {
          setPartnerInfo({
            partnerId: pid,
            partnerName: partnerSnap.data().displayName || 'Partner',
            partnerEmail: partnerSnap.data().email || '',
            partnershipId: pshipId,
          });
        } else {
          setPartnerInfo({
            partnerId: null,
            partnerName: '',
            partnerEmail: '',
            partnershipId: null,
          });
        }
        setLoading(false);
      });
    });

    return () => unsubUser();
  }, [user]);

  return { ...partnerInfo, loading, hasPartner: !!partnerInfo.partnerId };
}


