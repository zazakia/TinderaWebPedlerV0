import { useState, useEffect } from "react";
import { supabase, type Customer } from "@/lib/supabase";

// Enhanced Customer type with credit management
interface EnhancedCustomer extends Customer {
  customer_type?: "retail" | "wholesale" | "dealer";
  credit_limit?: number;
  current_balance?: number;
  available_credit?: number;
  payment_terms?: number;
  is_active?: boolean;
}

interface PaymentCollection {
  id: string;
  collection_number: string;
  customer_id: string;
  collection_date: string;
  payment_method: string;
  payment_reference?: string;
  amount_collected: number;
  discount_amount: number;
  net_collection: number;
  collected_by?: string;
  notes?: string;
  created_at: string;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<EnhancedCustomer[]>([]);
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

  // Create customer with enhanced fields
  const createCustomer = async (customerData: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
    customer_type?: "retail" | "wholesale" | "dealer";
    credit_limit?: number;
    payment_terms?: number;
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
  const updateCustomer = async (
    id: string,
    updates: Partial<EnhancedCustomer>,
  ) => {
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
          `name.ilike.%${query}%, email.ilike.%${query}%, phone_number.ilike.%${query}%`,
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

  // Update customer credit balance
  const updateCreditBalance = async (
    customerId: string,
    newBalance: number,
  ) => {
    try {
      const customer = customers.find((c) => c.id === customerId);
      if (!customer) throw new Error("Customer not found");

      const availableCredit = (customer.credit_limit || 0) - newBalance;

      const { data, error } = await supabase
        .from("customers")
        .update({
          current_balance: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq("id", customerId)
        .select()
        .single();

      if (error) throw error;

      await fetchCustomers(); // Refresh the list
      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to update credit balance",
      );
    }
  };

  // Record payment collection
  const recordPaymentCollection = async (paymentData: {
    customer_id: string;
    payment_method: string;
    payment_reference?: string;
    amount_collected: number;
    discount_amount?: number;
    collected_by?: string;
    notes?: string;
  }) => {
    try {
      // Generate collection number
      const { data: sequence } = await supabase.rpc("nextval", {
        sequence_name: "collection_seq",
      });
      const collectionNumber = `COL-${new Date().getFullYear()}-${String(sequence).padStart(4, "0")}`;

      const { data, error } = await supabase
        .from("payment_collections")
        .insert({
          collection_number: collectionNumber,
          customer_id: paymentData.customer_id,
          collection_date: new Date().toISOString().split("T")[0],
          payment_method: paymentData.payment_method,
          payment_reference: paymentData.payment_reference,
          amount_collected: paymentData.amount_collected,
          discount_amount: paymentData.discount_amount || 0,
          collected_by: paymentData.collected_by,
          notes: paymentData.notes,
        })
        .select()
        .single();

      if (error) throw error;

      // Update customer balance
      const customer = customers.find((c) => c.id === paymentData.customer_id);
      if (customer && customer.current_balance) {
        const newBalance =
          customer.current_balance - paymentData.amount_collected;
        await updateCreditBalance(
          paymentData.customer_id,
          Math.max(0, newBalance),
        );
      }

      return data;
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : "Failed to record payment collection",
      );
    }
  };

  // Get customer payment history
  const getCustomerPaymentHistory = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from("payment_collections")
        .select("*")
        .eq("customer_id", customerId)
        .order("collection_date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to fetch payment history",
      );
    }
  };

  // Get customers with outstanding balances
  const getCustomersWithBalance = () => {
    return customers.filter((customer) => (customer.current_balance || 0) > 0);
  };

  // Get customers near credit limit
  const getCustomersNearLimit = (threshold: number = 0.8) => {
    return customers.filter((customer) => {
      const creditLimit = customer.credit_limit || 0;
      const currentBalance = customer.current_balance || 0;
      return creditLimit > 0 && currentBalance / creditLimit >= threshold;
    });
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
    updateCreditBalance,
    recordPaymentCollection,
    getCustomerPaymentHistory,
    getCustomersWithBalance,
    getCustomersNearLimit,
    refetch: fetchCustomers,
  };
}
