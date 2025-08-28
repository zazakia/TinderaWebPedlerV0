import { useState, useEffect } from "react";
import {
  supabase,
  type ReceivingVoucher,
  type ReceivingVoucherInsert,
  type ReceivingVoucherItem,
  type ReceivingVoucherItemInsert,
  type SalesReturn,
  type SalesReturnInsert,
  type SalesReturnItem,
  type SalesReturnItemInsert,
  type SupplierReturn,
  type SupplierReturnInsert,
  type SupplierReturnItem,
  type SupplierReturnItemInsert,
  type InventoryTransfer,
  type InventoryTransferInsert,
  type InventoryTransferItem,
  type InventoryTransferItemInsert,
  type InventoryAdjustmentItem,
  type InventoryAdjustmentItemInsert,
  type InventoryMovement,
  type Supplier,
  type Location,
} from "@/lib/supabase";

export function useInventoryTransactions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =====================================================
  // RECEIVING VOUCHERS
  // =====================================================

  const createReceivingVoucher = async (
    voucherData: ReceivingVoucherInsert,
    items: ReceivingVoucherItemInsert[]
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Generate voucher number
      const voucherNumber = `RV${Date.now()}`;

      // Create receiving voucher
      const { data: voucher, error: voucherError } = await supabase
        .from("receiving_vouchers")
        .insert([
          {
            ...voucherData,
            voucher_number: voucherNumber,
            total_amount: items.reduce(
              (sum, item) => sum + (item.line_total || 0),
              0
            ),
          },
        ])
        .select()
        .single();

      if (voucherError) throw voucherError;

      // Create voucher items
      const itemsWithVoucherId = items.map((item, index) => ({
        ...item,
        receiving_voucher_id: voucher.id,
        line_number: index + 1,
        line_total: (item.quantity_received || 0) * (item.unit_cost || 0),
      }));

      const { error: itemsError } = await supabase
        .from("receiving_voucher_items")
        .insert(itemsWithVoucherId);

      if (itemsError) throw itemsError;

      // Create inventory movements for each item
      for (const item of itemsWithVoucherId) {
        await createInventoryMovement({
          product_id: item.product_id,
          product_unit_id: item.product_unit_id,
          location_id: voucherData.location_id,
          movement_type: "in",
          transaction_type: "receive",
          reference_table: "receiving_vouchers",
          reference_id: voucher.id,
          reference_number: voucherNumber,
          quantity_moved: item.quantity_received,
          unit_name: item.unit_name,
          conversion_to_base: 1, // TODO: Get from product_units
          unit_cost: item.unit_cost || 0,
          notes: `Received from supplier: ${item.product_name}`,
        });
      }

      return voucher;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create receiving voucher";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const getReceivingVouchers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("receiving_vouchers")
        .select(
          `
          *,
          supplier:suppliers(name),
          location:locations(name),
          receiving_voucher_items(
            *,
            product:products(name)
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch receiving vouchers";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SALES RETURNS
  // =====================================================

  const createSalesReturn = async (
    returnData: SalesReturnInsert,
    items: SalesReturnItemInsert[]
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Generate return number
      const returnNumber = `SR${Date.now()}`;

      // Create sales return
      const { data: salesReturn, error: returnError } = await supabase
        .from("sales_returns")
        .insert([
          {
            ...returnData,
            return_number: returnNumber,
            total_refund: items.reduce(
              (sum, item) => sum + (item.line_total || 0),
              0
            ),
          },
        ])
        .select()
        .single();

      if (returnError) throw returnError;

      // Create return items
      const itemsWithReturnId = items.map((item, index) => ({
        ...item,
        sales_return_id: salesReturn.id,
        line_number: index + 1,
      }));

      const { error: itemsError } = await supabase
        .from("sales_return_items")
        .insert(itemsWithReturnId);

      if (itemsError) throw itemsError;

      // Create inventory movements for items being returned to inventory
      for (const item of itemsWithReturnId) {
        if (item.return_to_inventory) {
          await createInventoryMovement({
            product_id: item.product_id,
            product_unit_id: item.product_unit_id,
            location_id: returnData.location_id,
            movement_type: "in",
            transaction_type: "sales_return",
            reference_table: "sales_returns",
            reference_id: salesReturn.id,
            reference_number: returnNumber,
            quantity_moved: item.quantity_returned,
            unit_name: item.unit_name,
            conversion_to_base: 1, // TODO: Get from product_units
            unit_cost: item.unit_price,
            notes: `Sales return: ${item.product_name}`,
          });
        }
      }

      return salesReturn;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create sales return";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const getSalesReturns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("sales_returns")
        .select(
          `
          *,
          customer:customers(name),
          location:locations(name),
          original_transaction:transactions(receipt_number),
          sales_return_items(
            *,
            product:products(name)
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch sales returns";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SUPPLIER RETURNS
  // =====================================================

  const createSupplierReturn = async (
    returnData: SupplierReturnInsert,
    items: SupplierReturnItemInsert[]
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Generate return number
      const returnNumber = `SPR${Date.now()}`;

      // Create supplier return
      const { data: supplierReturn, error: returnError } = await supabase
        .from("supplier_returns")
        .insert([
          {
            ...returnData,
            return_number: returnNumber,
            total_amount: items.reduce(
              (sum, item) => sum + (item.line_total || 0),
              0
            ),
          },
        ])
        .select()
        .single();

      if (returnError) throw returnError;

      // Create return items
      const itemsWithReturnId = items.map((item, index) => ({
        ...item,
        supplier_return_id: supplierReturn.id,
        line_number: index + 1,
      }));

      const { error: itemsError } = await supabase
        .from("supplier_return_items")
        .insert(itemsWithReturnId);

      if (itemsError) throw itemsError;

      // Create inventory movements (decrease inventory)
      for (const item of itemsWithReturnId) {
        await createInventoryMovement({
          product_id: item.product_id,
          product_unit_id: item.product_unit_id,
          location_id: returnData.location_id,
          movement_type: "out",
          transaction_type: "supplier_return",
          reference_table: "supplier_returns",
          reference_id: supplierReturn.id,
          reference_number: returnNumber,
          quantity_moved: item.quantity_returned,
          unit_name: item.unit_name,
          conversion_to_base: 1, // TODO: Get from product_units
          unit_cost: item.unit_cost,
          notes: `Return to supplier: ${item.product_name}`,
        });
      }

      return supplierReturn;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create supplier return";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const getSupplierReturns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("supplier_returns")
        .select(
          `
          *,
          supplier:suppliers(name),
          location:locations(name),
          supplier_return_items(
            *,
            product:products(name)
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch supplier returns";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INVENTORY ADJUSTMENTS
  // =====================================================

  const createInventoryAdjustment = async (
    adjustmentData: {
      location_id?: string | null;
      adjustment_type: "increase" | "decrease" | "correction";
      reason_code?: string;
      reason_description?: string;
      reference_number?: string;
      notes?: string;
    },
    items: InventoryAdjustmentItemInsert[]
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Generate adjustment number
      const adjustmentNumber = `ADJ${Date.now()}`;

      // Create adjustment header
      const { data: adjustment, error: adjustmentError } = await supabase
        .from("inventory_adjustments")
        .insert([
          {
            adjustment_number: adjustmentNumber,
            ...adjustmentData,
            total_value_impact: items.reduce(
              (sum, item) => sum + (item.value_impact || 0),
              0
            ),
          },
        ])
        .select()
        .single();

      if (adjustmentError) throw adjustmentError;

      // Create adjustment items
      const itemsWithAdjustmentId = items.map((item, index) => ({
        ...item,
        inventory_adjustment_id: adjustment.id,
        line_number: index + 1,
      }));

      const { error: itemsError } = await supabase
        .from("inventory_adjustment_items")
        .insert(itemsWithAdjustmentId);

      if (itemsError) throw itemsError;

      // Create inventory movements
      for (const item of itemsWithAdjustmentId) {
        const movementType =
          (item.quantity_adjustment || 0) > 0 ? "in" : "out";
        const absQuantity = Math.abs(item.quantity_adjustment || 0);

        await createInventoryMovement({
          product_id: item.product_id,
          product_unit_id: item.product_unit_id,
          location_id: adjustmentData.location_id,
          movement_type: movementType,
          transaction_type: "adjustment",
          reference_table: "inventory_adjustments",
          reference_id: adjustment.id,
          reference_number: adjustmentNumber,
          quantity_moved: absQuantity,
          unit_name: item.unit_name,
          conversion_to_base: 1, // TODO: Get from product_units
          unit_cost: item.unit_cost || 0,
          notes: `Inventory adjustment: ${item.reason_description || adjustmentData.reason_description}`,
        });
      }

      return adjustment;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create inventory adjustment";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INVENTORY TRANSFERS
  // =====================================================

  const createInventoryTransfer = async (
    transferData: InventoryTransferInsert,
    items: InventoryTransferItemInsert[]
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Generate transfer number
      const transferNumber = `TRF${Date.now()}`;

      // Create transfer
      const { data: transfer, error: transferError } = await supabase
        .from("inventory_transfers")
        .insert([
          {
            ...transferData,
            transfer_number: transferNumber,
            total_value: items.reduce(
              (sum, item) => sum + (item.line_value || 0),
              0
            ),
          },
        ])
        .select()
        .single();

      if (transferError) throw transferError;

      // Create transfer items
      const itemsWithTransferId = items.map((item, index) => ({
        ...item,
        inventory_transfer_id: transfer.id,
        line_number: index + 1,
        quantity_shipped: item.quantity_requested, // For now, assume all requested is shipped
        line_value: (item.quantity_requested || 0) * (item.unit_cost || 0),
      }));

      const { error: itemsError } = await supabase
        .from("inventory_transfer_items")
        .insert(itemsWithTransferId);

      if (itemsError) throw itemsError;

      // Create inventory movements (out from source, in to destination)
      for (const item of itemsWithTransferId) {
        // Transfer OUT from source location
        await createInventoryMovement({
          product_id: item.product_id,
          product_unit_id: item.product_unit_id,
          location_id: transferData.from_location_id,
          movement_type: "out",
          transaction_type: "transfer_out",
          reference_table: "inventory_transfers",
          reference_id: transfer.id,
          reference_number: transferNumber,
          quantity_moved: item.quantity_shipped || 0,
          unit_name: item.unit_name,
          conversion_to_base: 1, // TODO: Get from product_units
          unit_cost: item.unit_cost || 0,
          notes: `Transfer out to ${transferData.to_location_id}: ${item.product_name}`,
        });

        // Transfer IN to destination location
        await createInventoryMovement({
          product_id: item.product_id,
          product_unit_id: item.product_unit_id,
          location_id: transferData.to_location_id,
          movement_type: "in",
          transaction_type: "transfer_in",
          reference_table: "inventory_transfers",
          reference_id: transfer.id,
          reference_number: transferNumber,
          quantity_moved: item.quantity_shipped || 0,
          unit_name: item.unit_name,
          conversion_to_base: 1, // TODO: Get from product_units
          unit_cost: item.unit_cost || 0,
          notes: `Transfer in from ${transferData.from_location_id}: ${item.product_name}`,
        });
      }

      return transfer;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create inventory transfer";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INVENTORY MOVEMENTS (AUDIT TRAIL)
  // =====================================================

  const createInventoryMovement = async (movementData: {
    product_id: string;
    product_unit_id?: string | null;
    location_id?: string | null;
    movement_type: string;
    transaction_type: string;
    reference_table?: string | null;
    reference_id?: string | null;
    reference_number?: string | null;
    quantity_moved: number;
    unit_name: string;
    conversion_to_base?: number;
    unit_cost?: number;
    notes?: string;
  }) => {
    try {
      // Get current stock for this product/location
      const { data: currentStock } = await supabase
        .from("current_stock_levels")
        .select("current_stock_base_unit")
        .eq("product_id", movementData.product_id)
        .eq("location_id", movementData.location_id || null)
        .maybeSingle();

      const quantityBefore = currentStock?.current_stock_base_unit || 0;
      const baseQuantity =
        movementData.quantity_moved * (movementData.conversion_to_base || 1);

      const quantityAfter =
        movementData.movement_type === "in"
          ? quantityBefore + baseQuantity
          : quantityBefore - baseQuantity;

      // Create movement record
      const { error } = await supabase
        .from("inventory_movements")
        .insert([
          {
            ...movementData,
            quantity_before: quantityBefore,
            quantity_after: quantityAfter,
            base_unit_quantity: baseQuantity,
            total_cost: movementData.quantity_moved * (movementData.unit_cost || 0),
            conversion_to_base: movementData.conversion_to_base || 1,
          },
        ]);

      if (error) throw error;
    } catch (err) {
      console.error("Failed to create inventory movement:", err);
      throw err;
    }
  };

  const getInventoryMovements = async (productId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from("inventory_movements")
        .select(
          `
          *,
          product:products(name, sku),
          location:locations(name)
        `
        )
        .order("movement_date", { ascending: false });

      if (productId) {
        query = query.eq("product_id", productId);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch inventory movements";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  const getCurrentStockLevels = async (productId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from("current_stock_levels")
        .select("*")
        .order("product_name");

      if (productId) {
        query = query.eq("product_id", productId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch stock levels";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const getSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch suppliers";
      setError(message);
      throw new Error(message);
    }
  };

  const getLocations = async () => {
    try {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch locations";
      setError(message);
      throw new Error(message);
    }
  };

  return {
    loading,
    error,
    // Receiving Vouchers
    createReceivingVoucher,
    getReceivingVouchers,
    // Sales Returns
    createSalesReturn,
    getSalesReturns,
    // Supplier Returns
    createSupplierReturn,
    getSupplierReturns,
    // Inventory Adjustments
    createInventoryAdjustment,
    // Inventory Transfers
    createInventoryTransfer,
    // Inventory Movements
    createInventoryMovement,
    getInventoryMovements,
    // Utility Functions
    getCurrentStockLevels,
    getSuppliers,
    getLocations,
  };
}

// Specialized hooks for individual transaction types
export function useReceivingVouchers() {
  const {
    loading,
    error,
    createReceivingVoucher,
    getReceivingVouchers,
    getSuppliers,
    getLocations,
  } = useInventoryTransactions();

  return {
    loading,
    error,
    createReceivingVoucher,
    getReceivingVouchers,
    getSuppliers,
    getLocations,
  };
}

export function useSalesReturns() {
  const {
    loading,
    error,
    createSalesReturn,
    getSalesReturns,
    getLocations,
  } = useInventoryTransactions();

  return {
    loading,
    error,
    createSalesReturn,
    getSalesReturns,
    getLocations,
  };
}

export function useSupplierReturns() {
  const {
    loading,
    error,
    createSupplierReturn,
    getSupplierReturns,
    getSuppliers,
    getLocations,
  } = useInventoryTransactions();

  return {
    loading,
    error,
    createSupplierReturn,
    getSupplierReturns,
    getSuppliers,
    getLocations,
  };
}

export function useInventoryAdjustments() {
  const {
    loading,
    error,
    createInventoryAdjustment,
    getLocations,
    getCurrentStockLevels,
  } = useInventoryTransactions();

  return {
    loading,
    error,
    createInventoryAdjustment,
    getLocations,
    getCurrentStockLevels,
  };
}

export function useInventoryTransfers() {
  const {
    loading,
    error,
    createInventoryTransfer,
    getLocations,
    getCurrentStockLevels,
  } = useInventoryTransactions();

  return {
    loading,
    error,
    createInventoryTransfer,
    getLocations,
    getCurrentStockLevels,
  };
}
