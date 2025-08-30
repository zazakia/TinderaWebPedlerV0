import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, type Transaction } from "@/lib/supabase";

// Fetch transactions
const fetchTransactions = async () => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

export function useTransactions() {
  const queryClient = useQueryClient();

  const {
    data: transactions,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: fetchTransactions,
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (
      transactionData: Omit<Transaction, "id" | "created_at">,
    ) => {
      // Create the transaction
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert([transactionData])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Create transaction items
      const itemsToInsert = transactionData.items.map((item: any) => ({
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
        const { data: product, error: fetchError } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.product_id)
          .single();

        if (fetchError) throw fetchError;

        const newStock = Math.max(0, product.stock - item.quantity);

        const { error: updateError } = await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", item.product_id);

        if (updateError) throw updateError;
      }

      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return {
    transactions: transactions || [],
    loading,
    error,
    createTransactionWithItems: createTransactionMutation.mutateAsync,
  };
}
