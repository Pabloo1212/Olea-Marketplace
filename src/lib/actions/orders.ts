'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { CartItem } from '@/lib/types/database';

export async function createOrder(
  items: CartItem[],
  shipping: {
    name: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingCost = subtotal > 75 ? 0 : 8.50;
  const tax = Math.round(subtotal * 0.21 * 100) / 100;
  const totalPrice = subtotal + shippingCost + tax;

  // Create the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      total_price: totalPrice,
      subtotal,
      shipping_cost: shippingCost,
      tax,
      currency: 'EUR',
      status: 'pending',
      shipping_name: shipping.name,
      shipping_address: shipping.address,
      shipping_city: shipping.city,
      shipping_country: shipping.country,
      shipping_postal_code: shipping.postalCode,
    })
    .select()
    .single();

  if (orderError || !order) {
    return { data: null, error: orderError?.message || 'Failed to create order' };
  }

  // Create order items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    producer_id: item.product.producer_id,
    quantity: item.quantity,
    unit_price: item.product.price,
    total_price: item.product.price * item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    // Rollback order
    await supabase.from('orders').delete().eq('id', order.id);
    return { data: null, error: itemsError.message };
  }

  // Update product stock
  for (const item of items) {
    await supabase
      .from('products')
      .update({ stock: item.product.stock - item.quantity })
      .eq('id', item.product_id);
  }

  revalidatePath('/dashboard/orders');
  return { data: order, error: null };
}

export async function getOrders(userId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('orders')
    .select('*, items:order_items(*, product:products(name, slug, olive_variety, volume_ml))')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/orders');
  return { error: null };
}
