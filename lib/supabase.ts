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
      transaction_types: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          affects_inventory: string | null;
          requires_approval: boolean | null;
          is_active: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          affects_inventory?: string | null;
          requires_approval?: boolean | null;
          is_active?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          affects_inventory?: string | null;
          requires_approval?: boolean | null;
          is_active?: boolean | null;
          created_at?: string | null;
        };
      };
      suppliers: {
        Row: {
          id: string;
          supplier_code: string | null;
          name: string;
          contact_person: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          province: string | null;
          postal_code: string | null;
          tax_id: string | null;
          payment_terms: number | null;
          is_active: boolean | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          supplier_code?: string | null;
          name: string;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          province?: string | null;
          postal_code?: string | null;
          tax_id?: string | null;
          payment_terms?: number | null;
          is_active?: boolean | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          supplier_code?: string | null;
          name?: string;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          province?: string | null;
          postal_code?: string | null;
          tax_id?: string | null;
          payment_terms?: number | null;
          is_active?: boolean | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      locations: {
        Row: {
          id: string;
          location_code: string;
          name: string;
          description: string | null;
          address: string | null;
          is_main_location: boolean | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          location_code: string;
          name: string;
          description?: string | null;
          address?: string | null;
          is_main_location?: boolean | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          location_code?: string;
          name?: string;
          description?: string | null;
          address?: string | null;
          is_main_location?: boolean | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      receiving_vouchers: {
        Row: {
          id: string;
          voucher_number: string;
          supplier_id: string | null;
          location_id: string | null;
          reference_number: string | null;
          purchase_order_number: string | null;
          delivery_date: string | null;
          received_date: string | null;
          subtotal: number | null;
          tax_amount: number | null;
          discount_amount: number | null;
          total_amount: number | null;
          status: string | null;
          received_by: string | null;
          approved_by: string | null;
          approved_at: string | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          voucher_number: string;
          supplier_id?: string | null;
          location_id?: string | null;
          reference_number?: string | null;
          purchase_order_number?: string | null;
          delivery_date?: string | null;
          received_date?: string | null;
          subtotal?: number | null;
          tax_amount?: number | null;
          discount_amount?: number | null;
          total_amount?: number | null;
          status?: string | null;
          received_by?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          voucher_number?: string;
          supplier_id?: string | null;
          location_id?: string | null;
          reference_number?: string | null;
          purchase_order_number?: string | null;
          delivery_date?: string | null;
          received_date?: string | null;
          subtotal?: number | null;
          tax_amount?: number | null;
          discount_amount?: number | null;
          total_amount?: number | null;
          status?: string | null;
          received_by?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      receiving_voucher_items: {
        Row: {
          id: string;
          receiving_voucher_id: string;
          product_id: string;
          product_unit_id: string | null;
          product_name: string;
          unit_name: string;
          quantity_ordered: number | null;
          quantity_received: number;
          unit_cost: number | null;
          line_total: number | null;
          expiry_date: string | null;
          batch_number: string | null;
          notes: string | null;
          line_number: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          receiving_voucher_id: string;
          product_id: string;
          product_unit_id?: string | null;
          product_name: string;
          unit_name: string;
          quantity_ordered?: number | null;
          quantity_received: number;
          unit_cost?: number | null;
          line_total?: number | null;
          expiry_date?: string | null;
          batch_number?: string | null;
          notes?: string | null;
          line_number?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          receiving_voucher_id?: string;
          product_id?: string;
          product_unit_id?: string | null;
          product_name?: string;
          unit_name?: string;
          quantity_ordered?: number | null;
          quantity_received?: number;
          unit_cost?: number | null;
          line_total?: number | null;
          expiry_date?: string | null;
          batch_number?: string | null;
          notes?: string | null;
          line_number?: number | null;
          created_at?: string | null;
        };
      };
      sales_returns: {
        Row: {
          id: string;
          return_number: string;
          original_transaction_id: string | null;
          customer_id: string | null;
          location_id: string | null;
          return_date: string | null;
          return_reason: string | null;
          return_type: string | null;
          subtotal: number | null;
          tax_amount: number | null;
          total_refund: number | null;
          refund_method: string | null;
          status: string | null;
          processed_by: string | null;
          approved_by: string | null;
          approved_at: string | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          return_number: string;
          original_transaction_id?: string | null;
          customer_id?: string | null;
          location_id?: string | null;
          return_date?: string | null;
          return_reason?: string | null;
          return_type?: string | null;
          subtotal?: number | null;
          tax_amount?: number | null;
          total_refund?: number | null;
          refund_method?: string | null;
          status?: string | null;
          processed_by?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          return_number?: string;
          original_transaction_id?: string | null;
          customer_id?: string | null;
          location_id?: string | null;
          return_date?: string | null;
          return_reason?: string | null;
          return_type?: string | null;
          subtotal?: number | null;
          tax_amount?: number | null;
          total_refund?: number | null;
          refund_method?: string | null;
          status?: string | null;
          processed_by?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      sales_return_items: {
        Row: {
          id: string;
          sales_return_id: string;
          product_id: string;
          product_unit_id: string | null;
          original_transaction_item_id: string | null;
          product_name: string;
          unit_name: string;
          quantity_returned: number;
          unit_price: number;
          line_total: number;
          return_condition: string | null;
          return_to_inventory: boolean | null;
          notes: string | null;
          line_number: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          sales_return_id: string;
          product_id: string;
          product_unit_id?: string | null;
          original_transaction_item_id?: string | null;
          product_name: string;
          unit_name: string;
          quantity_returned: number;
          unit_price: number;
          line_total: number;
          return_condition?: string | null;
          return_to_inventory?: boolean | null;
          notes?: string | null;
          line_number?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          sales_return_id?: string;
          product_id?: string;
          product_unit_id?: string | null;
          original_transaction_item_id?: string | null;
          product_name?: string;
          unit_name?: string;
          quantity_returned?: number;
          unit_price?: number;
          line_total?: number;
          return_condition?: string | null;
          return_to_inventory?: boolean | null;
          notes?: string | null;
          line_number?: number | null;
          created_at?: string | null;
        };
      };
      supplier_returns: {
        Row: {
          id: string;
          return_number: string;
          supplier_id: string | null;
          location_id: string | null;
          original_receiving_id: string | null;
          return_date: string | null;
          return_reason: string | null;
          expected_credit: boolean | null;
          subtotal: number | null;
          tax_amount: number | null;
          total_amount: number | null;
          status: string | null;
          requested_by: string | null;
          approved_by: string | null;
          approved_at: string | null;
          shipped_at: string | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          return_number: string;
          supplier_id?: string | null;
          location_id?: string | null;
          original_receiving_id?: string | null;
          return_date?: string | null;
          return_reason?: string | null;
          expected_credit?: boolean | null;
          subtotal?: number | null;
          tax_amount?: number | null;
          total_amount?: number | null;
          status?: string | null;
          requested_by?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          shipped_at?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          return_number?: string;
          supplier_id?: string | null;
          location_id?: string | null;
          original_receiving_id?: string | null;
          return_date?: string | null;
          return_reason?: string | null;
          expected_credit?: boolean | null;
          subtotal?: number | null;
          tax_amount?: number | null;
          total_amount?: number | null;
          status?: string | null;
          requested_by?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          shipped_at?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      supplier_return_items: {
        Row: {
          id: string;
          supplier_return_id: string;
          product_id: string;
          product_unit_id: string | null;
          product_name: string;
          unit_name: string;
          quantity_returned: number;
          unit_cost: number;
          line_total: number;
          return_reason: string | null;
          batch_number: string | null;
          expiry_date: string | null;
          notes: string | null;
          line_number: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          supplier_return_id: string;
          product_id: string;
          product_unit_id?: string | null;
          product_name: string;
          unit_name: string;
          quantity_returned: number;
          unit_cost: number;
          line_total: number;
          return_reason?: string | null;
          batch_number?: string | null;
          expiry_date?: string | null;
          notes?: string | null;
          line_number?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          supplier_return_id?: string;
          product_id?: string;
          product_unit_id?: string | null;
          product_name?: string;
          unit_name?: string;
          quantity_returned?: number;
          unit_cost?: number;
          line_total?: number;
          return_reason?: string | null;
          batch_number?: string | null;
          expiry_date?: string | null;
          notes?: string | null;
          line_number?: number | null;
          created_at?: string | null;
        };
      };
      inventory_transfers: {
        Row: {
          id: string;
          transfer_number: string;
          from_location_id: string | null;
          to_location_id: string | null;
          transfer_date: string | null;
          expected_date: string | null;
          transfer_type: string | null;
          status: string | null;
          shipped_by: string | null;
          shipped_at: string | null;
          received_by: string | null;
          received_at: string | null;
          total_value: number | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          transfer_number: string;
          from_location_id?: string | null;
          to_location_id?: string | null;
          transfer_date?: string | null;
          expected_date?: string | null;
          transfer_type?: string | null;
          status?: string | null;
          shipped_by?: string | null;
          shipped_at?: string | null;
          received_by?: string | null;
          received_at?: string | null;
          total_value?: number | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          transfer_number?: string;
          from_location_id?: string | null;
          to_location_id?: string | null;
          transfer_date?: string | null;
          expected_date?: string | null;
          transfer_type?: string | null;
          status?: string | null;
          shipped_by?: string | null;
          shipped_at?: string | null;
          received_by?: string | null;
          received_at?: string | null;
          total_value?: number | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      inventory_transfer_items: {
        Row: {
          id: string;
          inventory_transfer_id: string;
          product_id: string;
          product_unit_id: string | null;
          product_name: string;
          unit_name: string;
          quantity_requested: number;
          quantity_shipped: number | null;
          quantity_received: number | null;
          unit_cost: number | null;
          line_value: number | null;
          notes: string | null;
          line_number: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          inventory_transfer_id: string;
          product_id: string;
          product_unit_id?: string | null;
          product_name: string;
          unit_name: string;
          quantity_requested: number;
          quantity_shipped?: number | null;
          quantity_received?: number | null;
          unit_cost?: number | null;
          line_value?: number | null;
          notes?: string | null;
          line_number?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          inventory_transfer_id?: string;
          product_id?: string;
          product_unit_id?: string | null;
          product_name?: string;
          unit_name?: string;
          quantity_requested?: number;
          quantity_shipped?: number | null;
          quantity_received?: number | null;
          unit_cost?: number | null;
          line_value?: number | null;
          notes?: string | null;
          line_number?: number | null;
          created_at?: string | null;
        };
      };
      inventory_adjustment_items: {
        Row: {
          id: string;
          inventory_adjustment_id: string;
          product_id: string;
          product_unit_id: string | null;
          product_name: string;
          unit_name: string;
          quantity_before: number | null;
          quantity_adjustment: number;
          quantity_after: number | null;
          unit_cost: number | null;
          value_impact: number | null;
          reason_description: string | null;
          batch_number: string | null;
          expiry_date: string | null;
          notes: string | null;
          line_number: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          inventory_adjustment_id: string;
          product_id: string;
          product_unit_id?: string | null;
          product_name: string;
          unit_name: string;
          quantity_before?: number | null;
          quantity_adjustment: number;
          quantity_after?: number | null;
          unit_cost?: number | null;
          value_impact?: number | null;
          reason_description?: string | null;
          batch_number?: string | null;
          expiry_date?: string | null;
          notes?: string | null;
          line_number?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          inventory_adjustment_id?: string;
          product_id?: string;
          product_unit_id?: string | null;
          product_name?: string;
          unit_name?: string;
          quantity_before?: number | null;
          quantity_adjustment?: number;
          quantity_after?: number | null;
          unit_cost?: number | null;
          value_impact?: number | null;
          reason_description?: string | null;
          batch_number?: string | null;
          expiry_date?: string | null;
          notes?: string | null;
          line_number?: number | null;
          created_at?: string | null;
        };
      };
      inventory_movements: {
        Row: {
          id: string;
          product_id: string;
          product_unit_id: string | null;
          location_id: string | null;
          movement_date: string | null;
          movement_type: string;
          transaction_type: string;
          reference_table: string | null;
          reference_id: string | null;
          reference_number: string | null;
          quantity_moved: number;
          quantity_before: number;
          quantity_after: number;
          unit_name: string;
          conversion_to_base: number | null;
          base_unit_quantity: number;
          unit_cost: number | null;
          total_cost: number | null;
          created_by: string | null;
          notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          product_id: string;
          product_unit_id?: string | null;
          location_id?: string | null;
          movement_date?: string | null;
          movement_type: string;
          transaction_type: string;
          reference_table?: string | null;
          reference_id?: string | null;
          reference_number?: string | null;
          quantity_moved: number;
          quantity_before: number;
          quantity_after: number;
          unit_name: string;
          conversion_to_base?: number | null;
          base_unit_quantity: number;
          unit_cost?: number | null;
          total_cost?: number | null;
          created_by?: string | null;
          notes?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          product_id?: string;
          product_unit_id?: string | null;
          location_id?: string | null;
          movement_date?: string | null;
          movement_type?: string;
          transaction_type?: string;
          reference_table?: string | null;
          reference_id?: string | null;
          reference_number?: string | null;
          quantity_moved?: number;
          quantity_before?: number;
          quantity_after?: number;
          unit_name?: string;
          conversion_to_base?: number | null;
          base_unit_quantity?: number;
          unit_cost?: number | null;
          total_cost?: number | null;
          created_by?: string | null;
          notes?: string | null;
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

// New Inventory Transaction Types
export type TransactionType =
  Database["public"]["Tables"]["transaction_types"]["Row"];
export type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];
export type Location = Database["public"]["Tables"]["locations"]["Row"];
export type ReceivingVoucher =
  Database["public"]["Tables"]["receiving_vouchers"]["Row"];
export type ReceivingVoucherItem =
  Database["public"]["Tables"]["receiving_voucher_items"]["Row"];
export type SalesReturn = Database["public"]["Tables"]["sales_returns"]["Row"];
export type SalesReturnItem =
  Database["public"]["Tables"]["sales_return_items"]["Row"];
export type SupplierReturn =
  Database["public"]["Tables"]["supplier_returns"]["Row"];
export type SupplierReturnItem =
  Database["public"]["Tables"]["supplier_return_items"]["Row"];
export type InventoryTransfer =
  Database["public"]["Tables"]["inventory_transfers"]["Row"];
export type InventoryTransferItem =
  Database["public"]["Tables"]["inventory_transfer_items"]["Row"];
export type InventoryAdjustmentItem =
  Database["public"]["Tables"]["inventory_adjustment_items"]["Row"];
export type InventoryMovement =
  Database["public"]["Tables"]["inventory_movements"]["Row"];

// Insert types for new tables
export type TransactionTypeInsert =
  Database["public"]["Tables"]["transaction_types"]["Insert"];
export type SupplierInsert =
  Database["public"]["Tables"]["suppliers"]["Insert"];
export type LocationInsert =
  Database["public"]["Tables"]["locations"]["Insert"];
export type ReceivingVoucherInsert =
  Database["public"]["Tables"]["receiving_vouchers"]["Insert"];
export type ReceivingVoucherItemInsert =
  Database["public"]["Tables"]["receiving_voucher_items"]["Insert"];
export type SalesReturnInsert =
  Database["public"]["Tables"]["sales_returns"]["Insert"];
export type SalesReturnItemInsert =
  Database["public"]["Tables"]["sales_return_items"]["Insert"];
export type SupplierReturnInsert =
  Database["public"]["Tables"]["supplier_returns"]["Insert"];
export type SupplierReturnItemInsert =
  Database["public"]["Tables"]["supplier_return_items"]["Insert"];
export type InventoryTransferInsert =
  Database["public"]["Tables"]["inventory_transfers"]["Insert"];
export type InventoryTransferItemInsert =
  Database["public"]["Tables"]["inventory_transfer_items"]["Insert"];
export type InventoryAdjustmentItemInsert =
  Database["public"]["Tables"]["inventory_adjustment_items"]["Insert"];
export type InventoryMovementInsert =
  Database["public"]["Tables"]["inventory_movements"]["Insert"];

// Update types for new tables
export type TransactionTypeUpdate =
  Database["public"]["Tables"]["transaction_types"]["Update"];
export type SupplierUpdate =
  Database["public"]["Tables"]["suppliers"]["Update"];
export type LocationUpdate =
  Database["public"]["Tables"]["locations"]["Update"];
export type ReceivingVoucherUpdate =
  Database["public"]["Tables"]["receiving_vouchers"]["Update"];
export type ReceivingVoucherItemUpdate =
  Database["public"]["Tables"]["receiving_voucher_items"]["Update"];
export type SalesReturnUpdate =
  Database["public"]["Tables"]["sales_returns"]["Update"];
export type SalesReturnItemUpdate =
  Database["public"]["Tables"]["sales_return_items"]["Update"];
export type SupplierReturnUpdate =
  Database["public"]["Tables"]["supplier_returns"]["Update"];
export type SupplierReturnItemUpdate =
  Database["public"]["Tables"]["supplier_return_items"]["Update"];
export type InventoryTransferUpdate =
  Database["public"]["Tables"]["inventory_transfers"]["Update"];
export type InventoryTransferItemUpdate =
  Database["public"]["Tables"]["inventory_transfer_items"]["Update"];
export type InventoryAdjustmentItemUpdate =
  Database["public"]["Tables"]["inventory_adjustment_items"]["Update"];
export type InventoryMovementUpdate =
  Database["public"]["Tables"]["inventory_movements"]["Update"];
export type TransactionItemUpdate =
  Database["public"]["Tables"]["transaction_items"]["Update"];
