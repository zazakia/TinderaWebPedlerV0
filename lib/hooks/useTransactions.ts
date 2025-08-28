import { useState, useEffect } from "react";
import {
  supabase,
  type Transaction,
  type TransactionItem,
} from "@/lib/supabase";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch transactions",
      );
    } finally {
      setLoading(false);
    }
  };

  // Create transaction
  const createTransaction = async (transactionData: {
    items: any[];
    subtotal: number;
    tax?: number;
    discount?: number;
    total: number;
    payment_method: string;
    status?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .insert([
          {
            ...transactionData,
            tax: transactionData.tax || 0,
            discount: transactionData.discount || 0,
            status: transactionData.status || "completed",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      await fetchTransactions(); // Refresh the list
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to create transaction",
      );
    }
  };

  // Create transaction with items (includes stock updates)
  const createTransactionWithItems = async (transactionData: {
    items: Array<{
      product_id: string;
      quantity: number;
      price: number;
      unit_type: "retail" | "wholesale";
      name?: string;
    }>;
    subtotal: number;
    tax?: number;
    discount?: number;
    total: number;
    payment_method: string;
    status?: string;
  }) => {
    try {
      // Create the transaction
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert([
          {
            items: transactionData.items,
            subtotal: transactionData.subtotal,
            tax: transactionData.tax || 0,
            discount: transactionData.discount || 0,
            total: transactionData.total,
            payment_method: transactionData.payment_method,
            status: transactionData.status || "completed",
          },
        ])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Create transaction items
      const itemsToInsert = transactionData.items.map((item) => ({
        transaction_id: transaction.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        unit_type: item.unit_type,
      }));

      const { error: itemsError } = await supabase
        .from("transaction_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // Update stock for products
      for (const item of transactionData.items) {
        // Get current stock
        const { data: product, error: fetchError } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.product_id)
          .single();

        if (fetchError) throw fetchError;

        // Calculate new stock
        const newStock = Math.max(0, product.stock - item.quantity);

        // Update stock
        const { error: updateError } = await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", item.product_id);

        if (updateError) throw updateError;
      }

      await fetchTransactions(); // Refresh the list
      return transaction;
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : "Failed to create transaction with items",
      );
    }
  };

  // Get transaction by ID with items
  const getTransactionById = async (id: string) => {
    try {
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", id)
        .single();

      if (transactionError) throw transactionError;

      const { data: items, error: itemsError } = await supabase
        .from("transaction_items")
        .select(
          `
          *,
          product:products(name, sku)
        `,
        )
        .eq("transaction_id", id);

      if (itemsError) throw itemsError;

      return {
        ...transaction,
        transaction_items: items || [],
      };
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to get transaction",
      );
    }
  };

  // Get sales summary for a date range
  const getSalesSummary = async (startDate?: string, endDate?: string) => {
    try {
      let query = supabase
        .from("transactions")
        .select("total, created_at, payment_method")
        .eq("status", "completed");

      if (startDate) {
        query = query.gte("created_at", startDate);
      }
      if (endDate) {
        query = query.lte("created_at", endDate);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;

      const summary = {
        totalSales:
          data?.reduce((sum, transaction) => sum + transaction.total, 0) || 0,
        transactionCount: data?.length || 0,
        averageTransaction: data?.length
          ? data.reduce((sum, transaction) => sum + transaction.total, 0) /
            data.length
          : 0,
        paymentMethods:
          data?.reduce(
            (acc, transaction) => {
              acc[transaction.payment_method] =
                (acc[transaction.payment_method] || 0) + transaction.total;
              return acc;
            },
            {} as Record<string, number>,
          ) || {},
        transactions: data || [],
      };

      return summary;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to get sales summary",
      );
    }
  };

  // Get today's sales
  const getTodaysSales = async () => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000)
      .toISOString()
      .split("T")[0];

    return getSalesSummary(today, tomorrow);
  };

  // Update transaction status
  const updateTransactionStatus = async (id: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      await fetchTransactions(); // Refresh the list
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : "Failed to update transaction status",
      );
    }
  };

  // Delete transaction (and its items)
  const deleteTransaction = async (id: string) => {
    try {
      // Delete transaction items first (due to foreign key constraint)
      const { error: itemsError } = await supabase
        .from("transaction_items")
        .delete()
        .eq("transaction_id", id);

      if (itemsError) throw itemsError;

      // Delete the transaction
      const { error: transactionError } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (transactionError) throw transactionError;

      await fetchTransactions(); // Refresh the list
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete transaction",
      );
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    error,
    createTransaction,
    createTransactionWithItems,
    getTransactionById,
    getSalesSummary,
    getTodaysSales,
    updateTransactionStatus,
    deleteTransaction,
    bulkUpdateStock: async (
      updates: Array<{ id: string; quantity: number }>,
    ) => {
      for (const update of updates) {
        // Get current stock
        const { data: product, error: fetchError } = await supabase
          .from("products")
          .select("stock")
          .eq("id", update.id)
          .single();

        if (fetchError) throw fetchError;

        // Calculate new stock
        const newStock = Math.max(0, product.stock - update.quantity);

        // Update stock
        const { error: updateError } = await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", update.id);

        if (updateError) throw updateError;
      }
    },
    refetch: fetchTransactions,
  };
}
