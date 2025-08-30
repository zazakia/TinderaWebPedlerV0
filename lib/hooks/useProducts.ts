import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, type Product } from "@/lib/supabase";

// Fetch products
const fetchProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(name)
    `,
    )
    .order("name");

  if (error) throw error;
  return data || [];
};

export function useProducts() {
  const queryClient = useQueryClient();

  const {
    data: products,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const createProductMutation = useMutation({
    mutationFn: async (
      productData: Omit<Product, "id" | "created_at" | "updated_at">,
    ) => {
      const { data, error } = await supabase
        .from("products")
        .insert([productData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Product>;
    }) => {
      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ id, newStock }: { id: string; newStock: number }) => {
      const { data, error } = await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return {
    products: products || [],
    loading,
    error,
    createProduct: createProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,
    updateStock: updateStockMutation.mutateAsync,
  };
}
