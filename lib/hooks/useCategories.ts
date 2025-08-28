import { useState, useEffect } from "react";
import { supabase, type Category } from "@/lib/supabase";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;

      setCategories(data || []);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch categories",
      );
    } finally {
      setLoading(false);
    }
  };

  // Create category
  const createCategory = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert([{ name }])
        .select()
        .single();

      if (error) throw error;

      await fetchCategories(); // Refresh the list
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to create category",
      );
    }
  };

  // Update category
  const updateCategory = async (id: string, name: string) => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .update({ name })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      await fetchCategories(); // Refresh the list
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to update category",
      );
    }
  };

  // Delete category
  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) throw error;

      await fetchCategories(); // Refresh the list
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete category",
      );
    }
  };

  // Get category by id
  const getCategoryById = (id: string) => {
    return categories.find((category) => category.id === id);
  };

  // Get category by name
  const getCategoryByName = (name: string) => {
    return categories.find(
      (category) => category.name.toLowerCase() === name.toLowerCase(),
    );
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoryByName,
    refetch: fetchCategories,
  };
}
