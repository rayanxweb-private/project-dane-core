import { useEffect, useState } from 'react';

export function useRealtimeUpdates(merchantId?: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Jalur pipa simulasi pembaruan data asinkronus tanpa Firebase RTDB
    setLoading(true);
    const timer = setTimeout(() => {
      setData({ status: 'ONLINE_SYNCED', timestamp: Date.now() });
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [merchantId]);

  return { data, loading };
}
