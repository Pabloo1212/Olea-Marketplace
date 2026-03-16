'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/lib/types/database';

export function useRealtimeStock(productIds?: string[]) {
  const [stockMap, setStockMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('stock-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: productIds ? `id=in.(${productIds.join(',')})` : undefined,
        },
        (payload) => {
          const updated = payload.new as Product;
          setStockMap((prev) => ({ ...prev, [updated.id]: updated.stock }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productIds]);

  return stockMap;
}
