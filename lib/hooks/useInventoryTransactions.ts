import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { InventoryMovement, InventoryMovementInsert } from "@/types/database";

export const useInventoryTransactions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInventoryTransaction = useCallback(
    async (transactionData: InventoryMovementInsert) => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("inventory_transaction_log")
          .insert(transactionData)
          .select();

        if (error) {
          throw error;
        }

        // Also update the product's stock level
        const { product_id, quantity_change } = transactionData;
        if (product_id && quantity_change) {
          const { error: stockError } = await supabase.rpc(
            "update_product_stock",
            {
              p_product_id: product_id,
              p_quantity_sold: -quantity_change, // Pass negative value to add stock
            },
          );

          if (stockError) {
            console.error("Failed to update product stock:", stockError);
            // Handle stock update error (e.g., log it, but don't fail the whole transaction)
          }
        }

        setLoading(false);
        return data;
      } catch (e: any) {
        setError(e.message);
        setLoading(false);
        console.error("Error creating inventory transaction:", e);
        return null;
      }
    },
    [],
  );

  const getInventoryTransactions = useCallback(async (productId?: string) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from("inventory_transaction_log").select("*");

      if (productId) {
        query = query.eq("product_id", productId);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        throw error;
      }

      setLoading(false);
      return data as InventoryMovement[];
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
      console.error("Error fetching inventory transactions:", e);
      return [];
    }
  }, []);

  return {
    loading,
    error,
    createInventoryTransaction,
    getInventoryTransactions,
  };
};
