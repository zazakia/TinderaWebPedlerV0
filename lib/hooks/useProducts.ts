import { useState, useEffect } from "react";
import { supabase, type Product } from "@/lib/supabase";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
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

      setProducts(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // Create product
  const createProduct = async (productData: {
    name: string;
    description?: string;
    sku: string;
    category_id?: string;
    price_retail: number;
    price_wholesale?: number;
    cost: number;
    stock?: number;
    base_unit?: string;
    unit?: string;
    image_url?: string;
    units?: any;
  }) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert([productData])
        .select()
        .single();

      if (error) throw error;

      await fetchProducts(); // Refresh the list
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to create product",
      );
    }
  };

  // Update product
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      await fetchProducts(); // Refresh the list
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to update product",
      );
    }
  };

  // Delete product
  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;

      await fetchProducts(); // Refresh the list
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete product",
      );
    }
  };

  // Update stock
  const updateStock = async (id: string, newStock: number) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      await fetchProducts(); // Refresh the list
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to update stock",
      );
    }
  };

  // Bulk update stock (for transactions)
  const bulkUpdateStock = async (
    updates: Array<{ id: string; quantity: number }>,
  ) => {
    try {
      const promises = updates.map(async ({ id, quantity }) => {
        // First get current stock
        const { data: product, error: fetchError } = await supabase
          .from("products")
          .select("stock")
          .eq("id", id)
          .single();

        if (fetchError) throw fetchError;

        // Calculate new stock
        const newStock = Math.max(0, product.stock - quantity);

        // Update stock
        const { error: updateError } = await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", id);

        if (updateError) throw updateError;
      });

      await Promise.all(promises);
      await fetchProducts(); // Refresh the list
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to bulk update stock",
      );
    }
  };

  // Get low stock products
  const getLowStockProducts = async (threshold: number = 10) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .lte("stock", threshold)
        .order("stock", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to get low stock products",
      );
    }
  };

  // Search products
  const searchProducts = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          category:categories(name)
        `,
        )
        .or(
          `name.ilike.%${query}%, description.ilike.%${query}%, sku.ilike.%${query}%`,
        )
        .order("name");

      if (error) throw error;
      return data || [];
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to search products",
      );
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    bulkUpdateStock,
    getLowStockProducts,
    searchProducts,
    refetch: fetchProducts,
  };
}
