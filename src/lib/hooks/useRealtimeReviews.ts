'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Review } from '@/lib/types/database';

export function useRealtimeReviews(productId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    const fetchReviews = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*, profile:profiles(name, country, avatar_url)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (data) setReviews(data as Review[]);
      setIsLoading(false);
    };

    fetchReviews();

    // Subscribe to new reviews
    const channel = supabase
      .channel(`reviews-${productId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reviews',
          filter: `product_id=eq.${productId}`,
        },
        async (payload) => {
          // Fetch the new review with profile data
          const { data } = await supabase
            .from('reviews')
            .select('*, profile:profiles(name, country, avatar_url)')
            .eq('id', (payload.new as Review).id)
            .single();

          if (data) {
            setReviews((prev) => [data as Review, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId]);

  return { reviews, isLoading };
}
