import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

interface PartnerInfo {
  partnerId: string | null;
  partnerName: string;
  partnerEmail: string;
  partnershipId: string | null; // sorted combo of both UIDs for scoping shared data
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

    // Listen to current user's doc for partnerId changes
    const unsubUser = onSnapshot(doc(db, 'users', user.uid), async (snap) => {
      if (!snap.exists() || !snap.data().partnerId) {
        setPartnerInfo({ partnerId: null, partnerName: '', partnerEmail: '', partnershipId: null });
        setLoading(false);
        return;
      }

      const partnerId = snap.data().partnerId;
      // Generate a deterministic partnershipId from both UIDs
      const partnershipId = [user.uid, partnerId].sort().join('_');

      // Listen to partner's doc
      const unsubPartner = onSnapshot(doc(db, 'users', partnerId), (partnerSnap) => {
        if (partnerSnap.exists()) {
          setPartnerInfo({
            partnerId,
            partnerName: partnerSnap.data().displayName || 'Partner',
            partnerEmail: partnerSnap.data().email || '',
            partnershipId,
          });
        }
        setLoading(false);
      });

      return () => unsubPartner();
    });

    return () => unsubUser();
  }, [user]);

  return { ...partnerInfo, loading, hasPartner: !!partnerInfo.partnerId };
}
