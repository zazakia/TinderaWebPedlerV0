import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          sku: string;
          category_id: string | null;
          price_retail: number;
          price_wholesale: number | null;
          cost: number;
          stock: number;
          base_unit: string | null;
          unit: string;
          image_url: string | null;
          units: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          sku: string;
          category_id?: string | null;
          price_retail: number;
          price_wholesale?: number | null;
          cost: number;
          stock?: number;
          base_unit?: string | null;
          unit?: string;
          image_url?: string | null;
          units?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          sku?: string;
          category_id?: string | null;
          price_retail?: number;
          price_wholesale?: number | null;
          cost?: number;
          stock?: number;
          base_unit?: string | null;
          unit?: string;
          image_url?: string | null;
          units?: any | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          items: any;
          subtotal: number;
          tax: number;
          discount: number;
          total: number;
          payment_method: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          items: any;
          subtotal: number;
          tax?: number;
          discount?: number;
          total: number;
          payment_method: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          items?: any;
          subtotal?: number;
          tax?: number;
          discount?: number;
          total?: number;
          payment_method?: string;
          status?: string;
          created_at?: string;
        };
      };
      transaction_items: {
        Row: {
          id: string;
          transaction_id: string;
          product_id: string | null;
          quantity: number;
          price: number;
          unit_type: "retail" | "wholesale";
          created_at: string;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          product_id?: string | null;
          quantity: number;
          price: number;
          unit_type: "retail" | "wholesale";
          created_at?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          product_id?: string | null;
          quantity?: number;
          price?: number;
          unit_type?: "retail" | "wholesale";
          created_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type TransactionItem =
  Database["public"]["Tables"]["transaction_items"]["Row"];
export type Customer = Database["public"]["Tables"]["customers"]["Row"];
