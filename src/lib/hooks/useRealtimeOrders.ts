'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Order } from '@/lib/types/database';

export function useRealtimeOrders(producerId?: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    const fetchOrders = async () => {
      let query = supabase
        .from('orders')
        .select('*, items:order_items(*, product:products(name, slug))')
        .order('created_at', { ascending: false })
        .limit(20);

      const { data } = await query;
      if (data) setOrders(data as Order[]);
      setIsLoading(false);
    };

    fetchOrders();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrders((prev) => [payload.new as Order, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((order) =>
                order.id === (payload.new as Order).id
                  ? { ...order, ...(payload.new as Partial<Order>) }
                  : order
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setOrders((prev) =>
              prev.filter((order) => order.id !== (payload.old as Order).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [producerId]);

  return { orders, isLoading };
}
