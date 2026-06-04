'use client';

import { useEffect, useState } from 'react';
import { ref, onValue, limitToLast, query } from 'firebase/database';
import { firebaseRtdb } from '@/config/firebase-client';

export function useRealtimeUpdates() {
  const [metrics, setMetrics] = useState({
    totalRevenue: 24592931000,
    totalTransaction: 142940,
    successRate: 99.4,
    activeMerchants: 1284
  });
  const [liveLogs, setLiveLogs] = useState<any[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    setIsStreaming(true);
    const liveTxnRef = query(ref(firebaseRtdb, 'live_transactions'), limitToLast(20));
    
    const unsubscribe = onValue(liveTxnRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsedList = Object.values(data).sort((a: any, b: any) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setLiveLogs(parsedList);
      }
    });

    return () => {
      unsubscribe();
      setIsStreaming(false);
    };
  }, []);

  return { metrics, liveLogs, isStreaming };
}
