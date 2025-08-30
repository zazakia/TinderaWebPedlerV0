"use client";

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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  DialogFooter,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Plus,
  Edit,
  Trash2,
  Search,
  User,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  customer_type: "retail" | "wholesale" | "dealer";
  credit_limit: number;
  current_balance: number;
  available_credit: number;
  payment_terms: number; // days
  is_active: boolean;
  created_at: string;
  updated_at: string;
  notes?: string;
}

interface Transaction {
  id: string;
  transaction_number: string;
  date: string;
  amount: number;
  payment_status: "paid" | "partial" | "unpaid";
  due_date: string;
  days_overdue: number;
}

interface PaymentHistory {
  id: string;
  collection_number: string;
  date: string;
  amount: number;
  payment_method: string;
  notes?: string;
}

interface CustomerManagerProps {
  onCustomerSelect?: (customer: Customer) => void;
  showSelection?: boolean;
}

const CUSTOMER_TYPES = [
  {
    value: "retail",
    label: "Retail Customer",
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "wholesale",
    label: "Wholesale Customer",
    color: "bg-green-100 text-green-800",
  },
  { value: "dealer", label: "Dealer", color: "bg-purple-100 text-purple-800" },
];

const PAYMENT_METHODS = [
  "cash",
  "check",
  "bank_transfer",
  "gcash",
  "paymaya",
  "other",
];

export function CustomerManager({
  onCustomerSelect,
  showSelection = false,
}: CustomerManagerProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    customer_type: "retail" as const,
    credit_limit: 0,
    payment_terms: 30,
    notes: "",
  });

  // Payment form state
  const [paymentData, setPaymentData] = useState({
    amount: "",
    payment_method: "cash",
    payment_reference: "",
    notes: "",
  });

  // Sample data for development
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const sampleCustomers: Customer[] = [
        {
          id: "1",
          name: "Maria Santos",
          phone: "09123456789",
          email: "maria@example.com",
          address: "123 Main St, Manila",
          customer_type: "retail",
          credit_limit: 5000,
          current_balance: 1250,
          available_credit: 3750,
          payment_terms: 30,
          is_active: true,
          created_at: "2024-01-15",
          updated_at: "2024-08-15",
        },
        {
          id: "2",
          name: "Juan dela Cruz Store",
          phone: "09987654321",
          email: "juan@store.com",
          address: "456 Commerce Ave, Quezon City",
          customer_type: "wholesale",
          credit_limit: 25000,
          current_balance: 8500,
          available_credit: 16500,
          payment_terms: 45,
          is_active: true,
          created_at: "2024-02-20",
          updated_at: "2024-08-20",
        },
        {
          id: "3",
          name: "ABC Trading Corp",
          phone: "09456789123",
          email: "procurement@abc.com",
          address: "789 Business District, Makati",
          customer_type: "dealer",
          credit_limit: 100000,
          current_balance: 0,
          available_credit: 100000,
          payment_terms: 60,
          is_active: true,
          created_at: "2024-03-10",
          updated_at: "2024-08-10",
        },
      ];
      setCustomers(sampleCustomers);
    } catch (error) {
      toast.error("Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      (customer.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === "all" || customer.customer_type === filterType;

    return matchesSearch && matchesType;
  });

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      customer_type: "retail",
      credit_limit: 0,
      payment_terms: 30,
      notes: "",
    });
  };

  const handleAddCustomer = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }

    setIsLoading(true);
    try {
      const newCustomer: Customer = {
        id: Date.now().toString(),
        ...formData,
        current_balance: 0,
        available_credit: formData.credit_limit,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setCustomers((prev) => [...prev, newCustomer]);
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("Customer added successfully");
    } catch (error) {
      toast.error("Failed to add customer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCustomer = async () => {
    if (!selectedCustomer) return;

    setIsLoading(true);
    try {
      const updatedCustomer = {
        ...selectedCustomer,
        ...formData,
        available_credit:
          formData.credit_limit - selectedCustomer.current_balance,
        updated_at: new Date().toISOString(),
      };

      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === selectedCustomer.id ? updatedCustomer : customer,
        ),
      );

      setIsEditDialogOpen(false);
      setSelectedCustomer(null);
      resetForm();
      toast.success("Customer updated successfully");
    } catch (error) {
      toast.error("Failed to update customer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;

    setIsLoading(true);
    try {
      setCustomers((prev) =>
        prev.filter((customer) => customer.id !== customerToDelete.id),
      );
      setIsDeleteDialogOpen(false);
      setCustomerToDelete(null);
      toast.success("Customer deleted successfully");
    } catch (error) {
      toast.error("Failed to delete customer");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentCollection = async () => {
    if (!selectedCustomer || !paymentData.amount) {
      toast.error("Please fill in required payment information");
      return;
    }

    const amount = parseFloat(paymentData.amount);
    if (amount <= 0 || amount > selectedCustomer.current_balance) {
      toast.error("Invalid payment amount");
      return;
    }

    setIsLoading(true);
    try {
      const updatedCustomer = {
        ...selectedCustomer,
        current_balance: selectedCustomer.current_balance - amount,
        available_credit: selectedCustomer.available_credit + amount,
        updated_at: new Date().toISOString(),
      };

      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === selectedCustomer.id ? updatedCustomer : customer,
        ),
      );

      setIsPaymentDialogOpen(false);
      setSelectedCustomer(null);
      setPaymentData({
        amount: "",
        payment_method: "cash",
        payment_reference: "",
        notes: "",
      });

      toast.success("Payment recorded successfully");
    } catch (error) {
      toast.error("Failed to record payment");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      address: customer.address || "",
      customer_type: customer.customer_type,
      credit_limit: customer.credit_limit,
      payment_terms: customer.payment_terms,
      notes: customer.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const openPaymentDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setPaymentData({
      amount: "",
      payment_method: "cash",
      payment_reference: "",
      notes: "",
    });
    setIsPaymentDialogOpen(true);
  };

  const getCreditStatus = (customer: Customer) => {
    const utilization =
      (customer.current_balance / customer.credit_limit) * 100;

    if (utilization === 0)
      return {
        status: "excellent",
        color: "text-green-600",
        label: "No Balance",
      };
    if (utilization <= 50)
      return { status: "good", color: "text-green-600", label: "Good" };
    if (utilization <= 80)
      return { status: "warning", color: "text-yellow-600", label: "Watch" };
    return { status: "danger", color: "text-red-600", label: "Limit Reached" };
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Customer List</TabsTrigger>
          <TabsTrigger value="credit">Credit Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    {CUSTOMER_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredCustomers.map((customer) => {
                    const creditStatus = getCreditStatus(customer);
                    return (
                      <Card
                        key={customer.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">
                                  {customer.name}
                                </h3>
                                <Badge
                                  className={
                                    CUSTOMER_TYPES.find(
                                      (t) => t.value === customer.customer_type,
                                    )?.color
                                  }
                                >
                                  {
                                    CUSTOMER_TYPES.find(
                                      (t) => t.value === customer.customer_type,
                                    )?.label
                                  }
                                </Badge>
                                {!customer.is_active && (
                                  <Badge variant="secondary">Inactive</Badge>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  {customer.phone}
                                </div>
                                {customer.email && (
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    {customer.email}
                                  </div>
                                )}
                                {customer.address && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    {customer.address}
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  {customer.payment_terms} days terms
                                </div>
                              </div>

                              <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <div className="text-muted-foreground">
                                    Credit Limit
                                  </div>
                                  <div className="font-semibold">
                                    ₱{customer.credit_limit.toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">
                                    Current Balance
                                  </div>
                                  <div
                                    className={`font-semibold ${customer.current_balance > 0 ? "text-red-600" : "text-green-600"}`}
                                  >
                                    ₱{customer.current_balance.toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">
                                    Available Credit
                                  </div>
                                  <div
                                    className={`font-semibold ${creditStatus.color}`}
                                  >
                                    ₱
                                    {customer.available_credit.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 ml-4">
                              {showSelection && (
                                <Button
                                  size="sm"
                                  onClick={() => onCustomerSelect?.(customer)}
                                >
                                  Select
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(customer)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              {customer.current_balance > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openPaymentDialog(customer)}
                                >
                                  <DollarSign className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setCustomerToDelete(customer);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credit">
          <Card>
            <CardHeader>
              <CardTitle>Credit Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {
                          customers.filter((c) => c.current_balance === 0)
                            .length
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Customers with No Balance
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {
                          customers.filter(
                            (c) =>
                              c.current_balance > 0 &&
                              c.current_balance <= c.credit_limit * 0.8,
                          ).length
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Customers within Credit Limit
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {
                          customers.filter(
                            (c) => c.current_balance > c.credit_limit * 0.8,
                          ).length
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Customers near/over Limit
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Credit Limit</TableHead>
                    <TableHead>Current Balance</TableHead>
                    <TableHead>Available Credit</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers
                    .filter((c) => c.current_balance > 0)
                    .sort(
                      (a, b) =>
                        b.current_balance / b.credit_limit -
                        a.current_balance / a.credit_limit,
                    )
                    .map((customer) => {
                      const creditStatus = getCreditStatus(customer);
                      return (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">
                            {customer.name}
                          </TableCell>
                          <TableCell>
                            ₱{customer.credit_limit.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-red-600">
                            ₱{customer.current_balance.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            ₱{customer.available_credit.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={creditStatus.color}>
                              {creditStatus.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Customer Dialog */}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Create a new customer profile with credit settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter customer name"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="09XXXXXXXXX"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="customer@example.com"
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Complete address"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="customer_type">Customer Type</Label>
            <Select
              value={formData.customer_type}
              onValueChange={(value: any) =>
                setFormData({ ...formData, customer_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CUSTOMER_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="credit_limit">Credit Limit</Label>
              <Input
                id="credit_limit"
                type="number"
                value={formData.credit_limit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    credit_limit: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="payment_terms">Payment Terms (Days)</Label>
              <Input
                id="payment_terms"
                type="number"
                value={formData.payment_terms}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    payment_terms: parseInt(e.target.value) || 30,
                  })
                }
                placeholder="30"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional customer notes..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddCustomer} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information and credit settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Same form fields as Add Customer */}
            <div>
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter customer name"
              />
            </div>

            <div>
              <Label htmlFor="edit-phone">Phone Number *</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="09XXXXXXXXX"
              />
            </div>

            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="customer@example.com"
              />
            </div>

            <div>
              <Label htmlFor="edit-customer_type">Customer Type</Label>
              <Select
                value={formData.customer_type}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, customer_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMER_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-credit_limit">Credit Limit</Label>
                <Input
                  id="edit-credit_limit"
                  type="number"
                  value={formData.credit_limit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      credit_limit: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="edit-payment_terms">Payment Terms (Days)</Label>
                <Input
                  id="edit-payment_terms"
                  type="number"
                  value={formData.payment_terms}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payment_terms: parseInt(e.target.value) || 30,
                    })
                  }
                  placeholder="30"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditCustomer} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Collection Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Collect Payment</DialogTitle>
            <DialogDescription>
              Record payment from {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <>
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">
                  Current Balance
                </div>
                <div className="text-2xl font-bold text-red-600">
                  ₱{selectedCustomer.current_balance.toLocaleString()}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="payment-amount">Payment Amount *</Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    step="0.01"
                    value={paymentData.amount}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, amount: e.target.value })
                    }
                    placeholder="0.00"
                    max={selectedCustomer.current_balance}
                  />
                </div>

                <div>
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Select
                    value={paymentData.payment_method}
                    onValueChange={(value) =>
                      setPaymentData({ ...paymentData, payment_method: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method.charAt(0).toUpperCase() +
                            method.slice(1).replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="payment-reference">Reference Number</Label>
                  <Input
                    id="payment-reference"
                    value={paymentData.payment_reference}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        payment_reference: e.target.value,
                      })
                    }
                    placeholder="Check #, Reference #, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="payment-notes">Notes</Label>
                  <Textarea
                    id="payment-notes"
                    value={paymentData.notes}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, notes: e.target.value })
                    }
                    placeholder="Payment notes..."
                    rows={2}
                  />
                </div>
              </div>
            </>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handlePaymentCollection} disabled={isLoading}>
              {isLoading ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Customer Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {customerToDelete?.name}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCustomer}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default CustomerManager;
