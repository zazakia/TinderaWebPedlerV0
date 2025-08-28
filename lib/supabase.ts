import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      business_settings: {
        Row: {
          id: string;
          business_name: string;
          business_address: string | null;
          business_phone: string | null;
          business_email: string | null;
          tax_rate: number | null;
          currency_symbol: string | null;
          receipt_footer: string | null;
          enable_tax: boolean | null;
          enable_credit_sales: boolean | null;
          low_stock_threshold: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          business_name?: string;
          business_address?: string | null;
          business_phone?: string | null;
          business_email?: string | null;
          tax_rate?: number | null;
          currency_symbol?: string | null;
          receipt_footer?: string | null;
          enable_tax?: boolean | null;
          enable_credit_sales?: boolean | null;
          low_stock_threshold?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          business_name?: string;
          business_address?: string | null;
          business_phone?: string | null;
          business_email?: string | null;
          tax_rate?: number | null;
          currency_symbol?: string | null;
          receipt_footer?: string | null;
          enable_tax?: boolean | null;
          enable_credit_sales?: boolean | null;
          low_stock_threshold?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string | null;
        };
      };
      credit_payments: {
        Row: {
          id: string;
          customer_id: string;
          transaction_id: string | null;
          amount: number;
          payment_method: string;
          notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          customer_id: string;
          transaction_id?: string | null;
          amount: number;
          payment_method: string;
          notes?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          customer_id?: string;
          transaction_id?: string | null;
          amount?: number;
          payment_method?: string;
          notes?: string | null;
          created_at?: string | null;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone_number: string | null;
          address: string | null;
          notes: string | null;
          credit_limit: number | null;
          current_balance: number | null;
          total_purchases: number | null;
          last_purchase_date: string | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone_number?: string | null;
          address?: string | null;
          notes?: string | null;
          credit_limit?: number | null;
          current_balance?: number | null;
          total_purchases?: number | null;
          last_purchase_date?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone_number?: string | null;
          address?: string | null;
          notes?: string | null;
          credit_limit?: number | null;
          current_balance?: number | null;
          total_purchases?: number | null;
          last_purchase_date?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      inventory_adjustments: {
        Row: {
          id: string;
          product_id: string;
          adjustment_type: string;
          quantity: number;
          reason: string | null;
          reference_number: string | null;
          adjusted_by: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          product_id: string;
          adjustment_type: string;
          quantity: number;
          reason?: string | null;
          reference_number?: string | null;
          adjusted_by?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          product_id?: string;
          adjustment_type?: string;
          quantity?: number;
          reason?: string | null;
          reference_number?: string | null;
          adjusted_by?: string | null;
          created_at?: string | null;
        };
      };
      product_addons: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          price: number;
          is_required: boolean | null;
          max_quantity: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          price: number;
          is_required?: boolean | null;
          max_quantity?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          price?: number;
          is_required?: boolean | null;
          max_quantity?: number | null;
          created_at?: string | null;
        };
      };
      product_groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          display_order: number | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          display_order?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          display_order?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      product_units: {
        Row: {
          id: string;
          product_id: string;
          unit_name: string;
          unit_type: string;
          price: number;
          conversion_factor: number;
          is_base_unit: boolean | null;
          display_order: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          product_id: string;
          unit_name: string;
          unit_type?: string;
          price: number;
          conversion_factor?: number;
          is_base_unit?: boolean | null;
          display_order?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          product_id?: string;
          unit_name?: string;
          unit_type?: string;
          price?: number;
          conversion_factor?: number;
          is_base_unit?: boolean | null;
          display_order?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          value: string;
          price_adjustment: number | null;
          sku_suffix: string | null;
          stock: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          value: string;
          price_adjustment?: number | null;
          sku_suffix?: string | null;
          stock?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          value?: string;
          price_adjustment?: number | null;
          sku_suffix?: string | null;
          stock?: number | null;
          created_at?: string | null;
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
          unit: string | null;
          image_url: string | null;
          product_group_id: string | null;
          product_code: string | null;
          low_stock_level: number | null;
          color: string | null;
          has_variants: boolean | null;
          has_addons: boolean | null;
          notes: string | null;
          selling_methods: string[] | null;
          is_active: boolean | null;
          is_online_store: boolean | null;
          created_at: string | null;
          updated_at: string | null;
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
          unit?: string | null;
          image_url?: string | null;
          product_group_id?: string | null;
          product_code?: string | null;
          low_stock_level?: number | null;
          color?: string | null;
          has_variants?: boolean | null;
          has_addons?: boolean | null;
          notes?: string | null;
          selling_methods?: string[] | null;
          is_active?: boolean | null;
          is_online_store?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
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
          unit?: string | null;
          image_url?: string | null;
          product_group_id?: string | null;
          product_code?: string | null;
          low_stock_level?: number | null;
          color?: string | null;
          has_variants?: boolean | null;
          has_addons?: boolean | null;
          notes?: string | null;
          selling_methods?: string[] | null;
          is_active?: boolean | null;
          is_online_store?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      transaction_items: {
        Row: {
          id: string;
          transaction_id: string | null;
          product_id: string | null;
          quantity: number;
          price: number;
          unit_type: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          transaction_id?: string | null;
          product_id?: string | null;
          quantity: number;
          price: number;
          unit_type: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          transaction_id?: string | null;
          product_id?: string | null;
          quantity?: number;
          price?: number;
          unit_type?: string;
          created_at?: string | null;
        };
      };
      transactions: {
        Row: {
          id: string;
          items: Json;
          subtotal: number;
          tax: number | null;
          discount: number | null;
          total: number;
          payment_method: string;
          status: string | null;
          customer_id: string | null;
          receipt_number: string | null;
          service_fee: number | null;
          delivery_fee: number | null;
          notes: string | null;
          is_credit: boolean | null;
          credit_paid_amount: number | null;
          credit_paid_date: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          items: Json;
          subtotal: number;
          tax?: number | null;
          discount?: number | null;
          total: number;
          payment_method: string;
          status?: string | null;
          customer_id?: string | null;
          receipt_number?: string | null;
          service_fee?: number | null;
          delivery_fee?: number | null;
          notes?: string | null;
          is_credit?: boolean | null;
          credit_paid_amount?: number | null;
          credit_paid_date?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          items?: Json;
          subtotal?: number;
          tax?: number | null;
          discount?: number | null;
          total?: number;
          payment_method?: string;
          status?: string | null;
          customer_id?: string | null;
          receipt_number?: string | null;
          service_fee?: number | null;
          delivery_fee?: number | null;
          notes?: string | null;
          is_credit?: boolean | null;
          credit_paid_amount?: number | null;
          credit_paid_date?: string | null;
          created_at?: string | null;
        };
      };
    };
  };
};

// Type exports for convenience
export type BusinessSettings =
  Database["public"]["Tables"]["business_settings"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type CreditPayment =
  Database["public"]["Tables"]["credit_payments"]["Row"];
export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type InventoryAdjustment =
  Database["public"]["Tables"]["inventory_adjustments"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductAddon =
  Database["public"]["Tables"]["product_addons"]["Row"];
export type ProductGroup =
  Database["public"]["Tables"]["product_groups"]["Row"];
export type ProductUnit = Database["public"]["Tables"]["product_units"]["Row"];
export type ProductVariant =
  Database["public"]["Tables"]["product_variants"]["Row"];
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type TransactionItem =
  Database["public"]["Tables"]["transaction_items"]["Row"];

// Insert types
export type BusinessSettingsInsert =
  Database["public"]["Tables"]["business_settings"]["Insert"];
export type CategoryInsert =
  Database["public"]["Tables"]["categories"]["Insert"];
export type CreditPaymentInsert =
  Database["public"]["Tables"]["credit_payments"]["Insert"];
export type CustomerInsert =
  Database["public"]["Tables"]["customers"]["Insert"];
export type InventoryAdjustmentInsert =
  Database["public"]["Tables"]["inventory_adjustments"]["Insert"];
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
export type ProductAddonInsert =
  Database["public"]["Tables"]["product_addons"]["Insert"];
export type ProductGroupInsert =
  Database["public"]["Tables"]["product_groups"]["Insert"];
export type ProductUnitInsert =
  Database["public"]["Tables"]["product_units"]["Insert"];
export type ProductVariantInsert =
  Database["public"]["Tables"]["product_variants"]["Insert"];
export type TransactionInsert =
  Database["public"]["Tables"]["transactions"]["Insert"];
export type TransactionItemInsert =
  Database["public"]["Tables"]["transaction_items"]["Insert"];

// Update types
export type BusinessSettingsUpdate =
  Database["public"]["Tables"]["business_settings"]["Update"];
export type CategoryUpdate =
  Database["public"]["Tables"]["categories"]["Update"];
export type CreditPaymentUpdate =
  Database["public"]["Tables"]["credit_payments"]["Update"];
export type CustomerUpdate =
  Database["public"]["Tables"]["customers"]["Update"];
export type InventoryAdjustmentUpdate =
  Database["public"]["Tables"]["inventory_adjustments"]["Update"];
export type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];
export type ProductAddonUpdate =
  Database["public"]["Tables"]["product_addons"]["Update"];
export type ProductGroupUpdate =
  Database["public"]["Tables"]["product_groups"]["Update"];
export type ProductUnitUpdate =
  Database["public"]["Tables"]["product_units"]["Update"];
export type ProductVariantUpdate =
  Database["public"]["Tables"]["product_variants"]["Update"];
export type TransactionUpdate =
  Database["public"]["Tables"]["transactions"]["Update"];
export type TransactionItemUpdate =
  Database["public"]["Tables"]["transaction_items"]["Update"];
