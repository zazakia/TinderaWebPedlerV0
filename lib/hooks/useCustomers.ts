import { useState, useEffect } from "react";
import { supabase, type Customer } from "@/lib/supabase";

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("name");

      if (error) throw error;

      setCustomers(data || []);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch customers",
      );
    } finally {
      setLoading(false);
    }
  };

  // Create customer
  const createCustomer = async (customerData: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .insert([customerData])
        .select()
        .single();

      if (error) throw error;

      await fetchCustomers(); // Refresh the list
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to create customer",
      );
    }
  };

  // Update customer
  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      await fetchCustomers(); // Refresh the list
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to update customer",
      );
    }
  };

  // Delete customer
  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase.from("customers").delete().eq("id", id);

      if (error) throw error;

      await fetchCustomers(); // Refresh the list
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete customer",
      );
    }
  };

  // Get customer by id
  const getCustomerById = (id: string) => {
    return customers.find((customer) => customer.id === id);
  };

  // Get customer by name
  const getCustomerByName = (name: string) => {
    return customers.find(
      (customer) => customer.name.toLowerCase() === name.toLowerCase(),
    );
  };

  // Search customers
  const searchCustomers = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .or(
          `name.ilike.%${query}%, email.ilike.%${query}%, phone.ilike.%${query}%`,
        )
        .order("name");

      if (error) throw error;
      return data || [];
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to search customers",
      );
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    getCustomerByName,
    searchCustomers,
    refetch: fetchCustomers,
  };
}
