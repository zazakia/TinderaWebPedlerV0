import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// Assuming these types will be in @/types/database.ts eventually
export interface SalesReturn {
  id: string;
  return_number: string;
  original_transaction_id?: string;
  customer_id?: string;
  return_date: string;
  status: 'pending' | 'processed' | 'cancelled';
  total_refund_amount: number;
  notes?: string;
  created_at: string;
  items: SalesReturnItem[];
}

export interface SalesReturnItem {
  id: string;
  sales_return_id: string;
  product_id: string;
  quantity_returned: number;
  refund_unit_price: number;
  total_refund: number;
}

export type SalesReturnInsert = Omit<SalesReturn, 'id' | 'created_at' | 'items'> & {
    items: Omit<SalesReturnItem, 'id' | 'sales_return_id'>[];
};

export const useSalesReturns = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSalesReturn = useCallback(
    async (returnData: SalesReturnInsert) => {
      setLoading(true);
      setError(null);
      try {
        // 1. Insert the main return record
        const { items, ...returnHeader } = returnData;
        const { data: newReturn, error: returnError } = await supabase
          .from('sales_returns')
          .insert(returnHeader)
          .select()
          .single();

        if (returnError) throw returnError;
        if (!newReturn) throw new Error('Failed to create sales return.');

        // 2. Insert the line items
        const returnItems = items.map(item => ({ ...item, sales_return_id: newReturn.id }));
        const { error: itemsError } = await supabase
            .from('sales_return_items')
            .insert(returnItems);

        if (itemsError) {
            await supabase.from('sales_returns').delete().eq('id', newReturn.id);
            throw itemsError;
        }

        // 3. Update stock levels for each returned item
        for (const item of items) {
            await supabase.rpc('update_product_stock', {
                p_product_id: item.product_id,
                p_quantity_sold: -item.quantity_returned // Negative to add stock back
            });
        }

        setLoading(false);
        return newReturn;
      } catch (e: any) {
        setError(e.message);
        setLoading(false);
        console.error('Error creating sales return:', e);
        return null;
      }
    },
    []
  );

  const getSalesReturns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('sales_returns')
        .select('*, items:sales_return_items(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLoading(false);
      return data as SalesReturn[];
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
      return [];
    }
  }, []);

  return { loading, error, createSalesReturn, getSalesReturns };
};
