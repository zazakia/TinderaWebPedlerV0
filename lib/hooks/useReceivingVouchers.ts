import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// Assuming these types will be in @/types/database.ts eventually
export interface ReceivingVoucher {
  id: string;
  voucher_number: string;
  supplier_id: string;
  receiving_date: string;
  status: 'pending' | 'received' | 'cancelled';
  total_amount: number;
  notes?: string;
  created_at: string;
  items: ReceivingVoucherItem[];
}

export interface ReceivingVoucherItem {
  id: string;
  receiving_voucher_id: string;
  product_id: string;
  quantity_received: number;
  cost_price: number;
  total_cost: number;
}

export type ReceivingVoucherInsert = Omit<ReceivingVoucher, 'id' | 'created_at' | 'items'> & {
    items: Omit<ReceivingVoucherItem, 'id' | 'receiving_voucher_id'>[];
};

export const useReceivingVouchers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReceivingVoucher = useCallback(
    async (voucherData: ReceivingVoucherInsert) => {
      setLoading(true);
      setError(null);
      try {
        // 1. Insert the main voucher record
        const { items, ...voucher } = voucherData;
        const { data: newVoucher, error: voucherError } = await supabase
          .from('receiving_vouchers')
          .insert(voucher)
          .select()
          .single();

        if (voucherError) throw voucherError;
        if (!newVoucher) throw new Error('Failed to create receiving voucher.');

        // 2. Insert the line items
        const voucherItems = items.map(item => ({ ...item, receiving_voucher_id: newVoucher.id }));
        const { error: itemsError } = await supabase
            .from('receiving_voucher_items')
            .insert(voucherItems);

        if (itemsError) {
            // If items fail, we should roll back the voucher creation
            await supabase.from('receiving_vouchers').delete().eq('id', newVoucher.id);
            throw itemsError;
        }

        // 3. Update stock levels for each item
        for (const item of items) {
            await supabase.rpc('update_product_stock', {
                p_product_id: item.product_id,
                p_quantity_sold: -item.quantity_received // Negative to add stock
            });
        }

        setLoading(false);
        return newVoucher;
      } catch (e: any) {
        setError(e.message);
        setLoading(false);
        console.error('Error creating receiving voucher:', e);
        return null;
      }
    },
    []
  );

  const getReceivingVouchers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('receiving_vouchers')
        .select('*, items:receiving_voucher_items(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLoading(false);
      return data as ReceivingVoucher[];
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
      return [];
    }
  }, []);

  return { loading, error, createReceivingVoucher, getReceivingVouchers };
};
