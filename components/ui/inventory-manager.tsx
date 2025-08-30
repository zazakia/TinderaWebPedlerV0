import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Package,
  Plus,
  Trash2,
  Search,
  TrendingUp,
  AlertTriangle,
  Download,
  Upload,
  RotateCcw,
  ArrowRightLeft,
  Calculator,
  Eye,
} from "lucide-react";

// Import the new hooks
import { useProducts } from "@/lib/hooks/useProducts";
import { useSuppliers } from "@/lib/hooks/useSuppliers";
import { useCustomers } from "@/lib/hooks/useCustomers";
import { useReceivingVouchers } from "@/lib/hooks/useReceivingVouchers";
import { useSalesReturns } from "@/lib/hooks/useSalesReturns";
import { useSupplierReturns } from "@/lib/hooks/useSupplierReturns";
import { useInventoryTransactions } from "@/lib/hooks/useInventoryTransactions";

// Assuming these types are defined in @/types/database.ts
import { Product, ProductUnit, Supplier, Customer } from "@/types/database";

export function InventoryManager() {
  const [activeTab, setActiveTab] = useState("overview");

  // Data states managed by hooks
  const { products, loading: productsLoading } = useProducts();
  const { suppliers, loading: suppliersLoading } = useSuppliers();
  const { customers, loading: customersLoading } = useCustomers();
  const {
    receivingVouchers,
    createReceivingVoucher,
    loading: receivingLoading,
  } = useReceivingVouchers();
  const {
    salesReturns,
    createSalesReturn,
    loading: salesReturnsLoading,
  } = useSalesReturns();
  const {
    supplierReturns,
    createSupplierReturn,
    loading: supplierReturnsLoading,
  } = useSupplierReturns();
  const {
    getInventoryTransactions,
    createInventoryTransaction,
    loading: transactionsLoading,
  } = useInventoryTransactions();

  const [transactionLog, setTransactionLog] = useState<any[]>([]);

  // Dialog states
  const [isReceivingDialogOpen, setIsReceivingDialogOpen] = useState(false);
  const [isSalesReturnDialogOpen, setIsSalesReturnDialogOpen] = useState(false);
  const [isSupplierReturnDialogOpen, setIsSupplierReturnDialogOpen] =
    useState(false);
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);

  // Form states
  const [receivingForm, setReceivingForm] = useState(/*...*/);
  const [salesReturnForm, setSalesReturnForm] = useState(/*...*/);
  const [supplierReturnForm, setSupplierReturnForm] = useState(/*...*/);
  const [adjustmentForm, setAdjustmentForm] = useState({
    adjustment_type: "in" as "in" | "out",
    reason: "",
    notes: "",
    items: [] as Array<{
      product_id: string;
      unit_id: string;
      quantity_adjusted: string;
    }>,
  });

  useEffect(() => {
    if (activeTab === "transactions" || activeTab === "adjustments") {
      fetchTransactions();
    }
  }, [activeTab]);

  const fetchTransactions = async () => {
    const logs = await getInventoryTransactions();
    setTransactionLog(logs);
  };

  const handleReceivingSubmit = async () => {
    /* ... */
  };
  const handleSalesReturnSubmit = async () => {
    /* ... */
  };
  const handleSupplierReturnSubmit = async () => {
    /* ... */
  };
  const handleAdjustmentSubmit = async () => {
    /* ... */
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* Header and Buttons */}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* TabsList */}

        <TabsContent value="adjustments">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Adjustments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionLog
                    .filter((t) => t.transaction_type.includes("adjustment"))
                    .map((adj) => (
                      <TableRow key={adj.id}>
                        <TableCell>
                          {new Date(adj.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {products.find((p) => p.id === adj.product_id)?.name}
                        </TableCell>
                        <TableCell>
                          <Badge>{adj.transaction_type}</Badge>
                        </TableCell>
                        <TableCell>{adj.quantity_change}</TableCell>
                        <TableCell>{adj.notes}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other Tabs Here */}
      </Tabs>

      {/* Dialog for Adjustment */}
      <Dialog
        open={isAdjustmentDialogOpen}
        onOpenChange={setIsAdjustmentDialogOpen}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>New Inventory Adjustment</DialogTitle>
          </DialogHeader>
          {/* Adjustment Form Content Here */}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAdjustmentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdjustmentSubmit}
              disabled={transactionsLoading}
            >
              {transactionsLoading ? "Saving..." : "Save Adjustment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Other Dialogs would go here */}
    </div>
  );
}

export default InventoryManager;
