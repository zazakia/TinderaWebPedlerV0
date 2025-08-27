export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      product_groups: {
        Row: {
          id: string
          name: string
          description: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          sku: string
          category_id: string | null
          product_group_id: string | null
          product_code: string | null
          base_unit: string
          price_retail: number
          price_wholesale: number | null
          cost: number
          stock: number
          low_stock_level: number
          unit: string
          color: string
          has_variants: boolean
          has_addons: boolean
          notes: string | null
          selling_methods: string[] | null
          is_active: boolean
          is_online_store: boolean
          image_url: string | null
          location_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          sku: string
          category_id?: string | null
          product_group_id?: string | null
          product_code?: string | null
          base_unit?: string
          price_retail: number
          price_wholesale?: number | null
          cost: number
          stock: number
          low_stock_level?: number
          unit?: string
          color?: string
          has_variants?: boolean
          has_addons?: boolean
          notes?: string | null
          selling_methods?: string[] | null
          is_active?: boolean
          is_online_store?: boolean
          image_url?: string | null
          location_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          sku?: string
          category_id?: string | null
          product_group_id?: string | null
          product_code?: string | null
          base_unit?: string
          price_retail?: number
          price_wholesale?: number | null
          cost?: number
          stock?: number
          low_stock_level?: number
          unit?: string
          color?: string
          has_variants?: boolean
          has_addons?: boolean
          notes?: string | null
          selling_methods?: string[] | null
          is_active?: boolean
          is_online_store?: boolean
          image_url?: string | null
          location_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      product_units: {
        Row: {
          id: string
          product_id: string
          unit_name: string
          conversion_factor: number
          price: number
          unit_type: 'retail' | 'wholesale'
          is_base_unit: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          unit_name: string
          conversion_factor: number
          price: number
          unit_type?: 'retail' | 'wholesale'
          is_base_unit?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          unit_name?: string
          conversion_factor?: number
          price?: number
          unit_type?: 'retail' | 'wholesale'
          is_base_unit?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          phone_number: string | null
          email: string | null
          address: string | null
          notes: string | null
          credit_limit: number
          current_balance: number
          total_purchases: number
          last_purchase_date: string | null
          is_active: boolean
          location_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone_number?: string | null
          email?: string | null
          address?: string | null
          notes?: string | null
          credit_limit?: number
          current_balance?: number
          total_purchases?: number
          last_purchase_date?: string | null
          is_active?: boolean
          location_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone_number?: string | null
          email?: string | null
          address?: string | null
          notes?: string | null
          credit_limit?: number
          current_balance?: number
          total_purchases?: number
          last_purchase_date?: string | null
          is_active?: boolean
          location_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          customer_id: string | null
          receipt_number: string | null
          items: Json
          subtotal: number
          tax: number
          discount: number
          service_fee: number
          delivery_fee: number
          total: number
          payment_method: string
          status: string
          notes: string | null
          is_credit: boolean
          credit_paid_amount: number
          credit_paid_date: string | null
          location_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          receipt_number?: string | null
          items: Json
          subtotal: number
          tax?: number
          discount?: number
          service_fee?: number
          delivery_fee?: number
          total: number
          payment_method: string
          status?: string
          notes?: string | null
          is_credit?: boolean
          credit_paid_amount?: number
          credit_paid_date?: string | null
          location_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          receipt_number?: string | null
          items?: Json
          subtotal?: number
          tax?: number
          discount?: number
          service_fee?: number
          delivery_fee?: number
          total?: number
          payment_method?: string
          status?: string
          notes?: string | null
          is_credit?: boolean
          credit_paid_amount?: number
          credit_paid_date?: string | null
          location_id?: string | null
          created_at?: string
        }
      }
      transaction_items: {
        Row: {
          id: string
          transaction_id: string
          product_id: string | null
          quantity: number
          price: number
          unit_type: 'retail' | 'wholesale'
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          product_id: string | null
          quantity: number
          price: number
          unit_type: 'retail' | 'wholesale'
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          product_id?: string | null
          quantity?: number
          price?: number
          unit_type?: 'retail' | 'wholesale'
          created_at?: string
        }
      }
      credit_payments: {
        Row: {
          id: string
          customer_id: string
          transaction_id: string | null
          amount: number
          payment_method: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          transaction_id?: string | null
          amount: number
          payment_method: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          transaction_id?: string | null
          amount?: number
          payment_method?: string
          notes?: string | null
          created_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          name: string
          value: string
          price_adjustment: number
          stock: number
          sku_suffix: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          value: string
          price_adjustment?: number
          stock?: number
          sku_suffix?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          value?: string
          price_adjustment?: number
          stock?: number
          sku_suffix?: string | null
          created_at?: string
        }
      }
      product_addons: {
        Row: {
          id: string
          product_id: string
          name: string
          price: number
          is_required: boolean
          max_quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          price: number
          is_required?: boolean
          max_quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          price?: number
          is_required?: boolean
          max_quantity?: number
          created_at?: string
        }
      }
      inventory_adjustments: {
        Row: {
          id: string
          product_id: string
          adjustment_type: 'add' | 'remove' | 'damage' | 'return' | 'correction'
          quantity: number
          reason: string | null
          reference_number: string | null
          adjusted_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          adjustment_type: 'add' | 'remove' | 'damage' | 'return' | 'correction'
          quantity: number
          reason?: string | null
          reference_number?: string | null
          adjusted_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          adjustment_type?: 'add' | 'remove' | 'damage' | 'return' | 'correction'
          quantity?: number
          reason?: string | null
          reference_number?: string | null
          adjusted_by?: string | null
          created_at?: string
        }
      }
      business_settings: {
        Row: {
          id: string
          business_name: string
          business_address: string | null
          business_phone: string | null
          business_email: string | null
          tax_rate: number
          currency_symbol: string
          receipt_footer: string | null
          low_stock_threshold: number
          enable_tax: boolean
          enable_credit_sales: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_name?: string
          business_address?: string | null
          business_phone?: string | null
          business_email?: string | null
          tax_rate?: number
          currency_symbol?: string
          receipt_footer?: string | null
          low_stock_threshold?: number
          enable_tax?: boolean
          enable_credit_sales?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_name?: string
          business_address?: string | null
          business_phone?: string | null
          business_email?: string | null
          tax_rate?: number
          currency_symbol?: string
          receipt_footer?: string | null
          low_stock_threshold?: number
          enable_tax?: boolean
          enable_credit_sales?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          name: string
          contact_info: Json | null
          terms: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          contact_info?: Json | null
          terms?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact_info?: Json | null
          terms?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      purchase_orders: {
        Row: {
          id: string
          supplier_id: string
          status: string
          total: number
          created_by: string | null
          notes: string | null
          expected_delivery: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          supplier_id: string
          status?: string
          total?: number
          created_by?: string | null
          notes?: string | null
          expected_delivery?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          supplier_id?: string
          status?: string
          total?: number
          created_by?: string | null
          notes?: string | null
          expected_delivery?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      purchase_order_items: {
        Row: {
          id: string
          purchase_order_id: string
          product_id: string | null
          quantity: number
          unit_price: number
          total_price: number
          received_quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          purchase_order_id: string
          product_id?: string | null
          quantity: number
          unit_price: number
          total_price?: number
          received_quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          purchase_order_id?: string
          product_id?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
          received_quantity?: number
          created_at?: string
        }
      }
      user_permissions: {
        Row: {
          id: string
          user_id: string
          permission_name: string
          resource: string | null
          granted_by: string | null
          granted_at: string
          expires_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          permission_name: string
          resource?: string | null
          granted_by?: string | null
          granted_at?: string
          expires_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          permission_name?: string
          resource?: string | null
          granted_by?: string | null
          granted_at?: string
          expires_at?: string | null
          is_active?: boolean
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          session_token: string
          device_info: string | null
          ip_address: string | null
          location: string | null
          is_active: boolean
          last_activity: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_token: string
          device_info?: string | null
          ip_address?: string | null
          location?: string | null
          is_active?: boolean
          last_activity?: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_token?: string
          device_info?: string | null
          ip_address?: string | null
          location?: string | null
          is_active?: boolean
          last_activity?: string
          expires_at?: string
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string | null
          resource_id: string | null
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      permission_templates: {
        Row: {
          id: string
          role: string
          permissions: Json
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          role: string
          permissions?: Json
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: string
          permissions?: Json
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      user_profiles_with_location: {
        Row: {
          id: string | null
          email: string | null
          full_name: string | null
          role: string | null
          location_id: string | null
          phone: string | null
          avatar_url: string | null
          is_active: boolean | null
          last_login_at: string | null
          created_at: string | null
          updated_at: string | null
          location_name: string | null
          location_address: string | null
        }
      } | null
    }
    Functions: {
      generate_receipt_number: {
        Args: Record<string, never>
        Returns: string
      }
      get_products_with_categories: {
        Args: Record<string, never>
        Returns: {
          id: string
          name: string
          description: string | null
          sku: string
          category_id: string | null
          category_name: string | null
          price_retail: number
          price_wholesale: number | null
          cost: number
          stock: number
          unit: string
          image_url: string | null
          created_at: string
          updated_at: string
        }[]
      }
      get_low_stock_products: {
        Args: {
          threshold?: number
        }
        Returns: {
          id: string
          name: string
          sku: string
          stock: number
          category_name: string | null
        }[]
      }
      get_sales_summary: {
        Args: {
          p_start_date?: string
          p_end_date?: string
        }
        Returns: {
          total_sales: number
          total_transactions: number
          average_transaction_value: number
          top_product_id: string | null
          top_product_name: string | null
          top_product_sales: number | null
        }
      }
      update_product_stock: {
        Args: {
          p_product_id: string
          p_quantity_sold: number
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
