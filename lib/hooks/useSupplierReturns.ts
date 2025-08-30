import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// Assuming these types will be in @/types/database.ts eventually
export interface SupplierReturn {
  id: string;
  return_number: string;
  supplier_id: string;
  return_date: string;
  status: 'pending' | 'returned' | 'credited' | 'cancelled';
  total_return_amount: number;
  notes?: string;
  created_at: string;
  items: SupplierReturnItem[];
}

export interface SupplierReturnItem {
  id: string;
  supplier_return_id: string;
  product_id: string;
  quantity_returned: number;
  cost_price: number;
  total_cost: number;
}

export type SupplierReturnInsert = Omit<SupplierReturn, 'id' | 'created_at' | 'items'> & {
    items: Omit<SupplierReturnItem, 'id' | 'supplier_return_id'>[];
};

export const useSupplierReturns = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSupplierReturn = useCallback(
    async (returnData: SupplierReturnInsert) => {
      setLoading(true);
      setError(null);
      try {
        // 1. Insert the main return record
        const { items, ...returnHeader } = returnData;
        const { data: newReturn, error: returnError } = await supabase
          .from('supplier_returns')
          .insert(returnHeader)
          .select()
          .single();

        if (returnError) throw returnError;
        if (!newReturn) throw new Error('Failed to create supplier return.');

        // 2. Insert the line items
        const returnItems = items.map(item => ({ ...item, supplier_return_id: newReturn.id }));
        const { error: itemsError } = await supabase
            .from('supplier_return_items')
            .insert(returnItems);

        if (itemsError) {
            await supabase.from('supplier_returns').delete().eq('id', newReturn.id);
            throw itemsError;
        }

        // 3. Update stock levels for each returned item
        for (const item of items) {
            await supabase.rpc('update_product_stock', {
                p_product_id: item.product_id,
                p_quantity_sold: item.quantity_returned // Positive to deduct stock
            });
        }

        setLoading(false);
        return newReturn;
      } catch (e: any) {
        setError(e.message);
        setLoading(false);
        console.error('Error creating supplier return:', e);
        return null;
      }
    },
    []
  );

  const getSupplierReturns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('supplier_returns')
        .select('*, items:supplier_return_items(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLoading(false);
      return data as SupplierReturn[];
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
      return [];
    }
  }, []);

  return { loading, error, createSupplierReturn, getSupplierReturns };
};
