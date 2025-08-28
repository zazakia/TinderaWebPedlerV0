"use client";

import {
  ArrowLeft,
  Search,
  ShoppingCart,
  Package,
  Plus,
  Minus,
  X,
  ChevronDown,
  Home,
  User,
  DollarSign,
  CreditCard,
  Receipt,
  Monitor,
  FileText,
  ShoppingBag,
  BarChart3,
  Edit,
  Trash2,
  Camera,
  Calculator,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useProducts } from "@/lib/hooks/useProducts";
import { useCategories } from "@/lib/hooks/useCategories";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { useCustomers } from "@/lib/hooks/useCustomers";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Main Dashboard Component
function DashboardScreen({
  onNavigate,
}: {
  onNavigate: (screen: string) => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-sm mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="p-4 bg-purple-600 text-white">
          <h1 className="text-xl font-bold">POS Dashboard</h1>
          <p className="text-purple-200 text-sm">
            Good morning! Ready to sell?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="p-4 grid grid-cols-2 gap-3">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-green-600 text-xs font-medium">
                Today's Sales
              </span>
            </div>
            <p className="text-green-800 font-bold text-lg">₱0.00</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              <span className="text-blue-600 text-xs font-medium">
                Transactions
              </span>
            </div>
            <p className="text-blue-800 font-bold text-lg">0</p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="p-4 space-y-3">
          <button
            onClick={() => onNavigate("pos")}
            className="w-full p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold">Start Selling</h3>
                <p className="text-purple-200 text-sm">
                  Process new transactions
                </p>
              </div>
              <ShoppingCart className="w-6 h-6" />
            </div>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate("inventory")}
              className="p-3 bg-orange-50 rounded-lg text-left"
            >
              <Package className="w-6 h-6 text-orange-600 mb-2" />
              <h4 className="font-medium text-orange-800">Inventory</h4>
              <p className="text-orange-600 text-xs">Manage stock</p>
            </button>

            <button
              onClick={() => onNavigate("products")}
              className="p-3 bg-blue-50 rounded-lg text-left"
            >
              <ShoppingBag className="w-6 h-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-blue-800">Products</h4>
              <p className="text-blue-600 text-xs">Add & edit items</p>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4">
          <h3 className="font-medium text-gray-800 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full p-3 bg-gray-50 rounded-lg text-left flex items-center gap-3">
              <Receipt className="w-4 h-4 text-gray-600" />
              <span className="text-gray-800">View Reports</span>
            </button>
            <button className="w-full p-3 bg-gray-50 rounded-lg text-left flex items-center gap-3">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-gray-800">Manage Customers</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t max-w-sm mx-auto">
        <div className="flex">
          <div className="flex-1 text-center p-3 text-purple-600">
            <Home className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xs">Home</p>
          </div>
          <div className="flex-1 text-center p-3 text-gray-400">
            <ShoppingCart className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xs">POS</p>
          </div>
          <div className="flex-1 text-center p-3 text-gray-400">
            <Package className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xs">Stock</p>
          </div>
          <div className="flex-1 text-center p-3 text-gray-400">
            <BarChart3 className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xs">Reports</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// POS Screen Component
function POSScreen({
  onBack,
  products,
  categories,
}: {
  onBack: () => void;
  products: any[];
  categories: any[];
}) {
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCart, setShowCart] = useState(false);
  const { createTransactionWithItems } = useTransactions();

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "All" || product.category === activeCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartItems = Object.entries(cart)
    .map(([productId, quantity]) => {
      const product = products.find((p) => p.id === productId);
      return {
        ...product,
        quantity,
        subtotal: product.price * quantity,
      };
    })
    .filter((item) => item.quantity > 0);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const addToCart = (productId: string) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      const newCart = { ...cart };
      delete newCart[productId];
      setCart(newCart);
    } else {
      setCart((prev) => ({
        ...prev,
        [productId]: quantity,
      }));
    }
  };

  const handleCheckout = async () => {
    try {
      const transactionData = {
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          unit_type: "retail" as const,
          name: item.name,
        })),
        subtotal: cartTotal,
        total: cartTotal,
        payment_method: "cash",
      };

      await createTransactionWithItems(transactionData);

      // Clear cart
      setCart({});
      setShowCart(false);
      alert("Transaction completed successfully!");
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed. Please try again.");
    }
  };

  if (showCart) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-sm mx-auto bg-white min-h-screen">
          <div className="p-4 bg-purple-600 text-white flex items-center gap-3">
            <ArrowLeft
              className="w-5 h-5 cursor-pointer"
              onClick={() => setShowCart(false)}
            />
            <h1 className="text-lg font-bold">Review Cart</h1>
          </div>

          <div className="p-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">
                          ₱{item.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ₱{item.subtotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-lg font-bold">
                      ₱{cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Complete Payment
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-sm mx-auto bg-white min-h-screen pb-20">
        <div className="p-4 bg-purple-600 text-white flex items-center gap-3">
          <ArrowLeft className="w-5 h-5 cursor-pointer" onClick={onBack} />
          <h1 className="text-lg font-bold flex-1">Point of Sale</h1>
          <div className="relative">
            <ShoppingCart
              className="w-5 h-5 cursor-pointer"
              onClick={() => setShowCart(true)}
            />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search products..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="px-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["All", ...categories.map((c) => c.name)].map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                  activeCategory === category
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products */}
        <div className="p-4 grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white border rounded-lg p-3">
              <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="font-medium text-sm mb-1">{product.name}</h4>
              <p className="text-purple-600 font-bold">
                ₱{product.price.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mb-2">
                Stock: {product.stock}
              </p>
              <div className="flex items-center gap-1">
                {cart[product.id] > 0 ? (
                  <div className="flex items-center gap-1 flex-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-8 h-8 p-0"
                      onClick={() =>
                        updateCartQuantity(product.id, cart[product.id] - 1)
                      }
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="flex-1 text-center text-sm">
                      {cart[product.id]}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-8 h-8 p-0"
                      onClick={() => addToCart(product.id)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    onClick={() => addToCart(product.id)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {cartCount > 0 && (
          <div className="fixed bottom-16 left-0 right-0 p-4 max-w-sm mx-auto">
            <Button
              onClick={() => setShowCart(true)}
              className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-between"
            >
              <span>View Cart ({cartCount})</span>
              <span>₱{cartTotal.toFixed(2)}</span>
            </Button>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t max-w-sm mx-auto">
        <div className="flex">
          <div className="flex-1 text-center p-3 text-gray-400">
            <Home className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xs">Home</p>
          </div>
          <div className="flex-1 text-center p-3 text-purple-600">
            <ShoppingCart className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xs">POS</p>
          </div>
          <div className="flex-1 text-center p-3 text-gray-400">
            <Package className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xs">Stock</p>
          </div>
          <div className="flex-1 text-center p-3 text-gray-400">
            <BarChart3 className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xs">Reports</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inventory Management Screen
function InventoryScreen({
  onBack,
  products,
  onUpdateStock,
}: {
  onBack: () => void;
  products: any[];
  onUpdateStock: (id: string, stock: number) => void;
}) {
  const [showStockView, setShowStockView] = useState(true);
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState("");

  const groupedProducts = products.reduce(
    (acc: Record<string, any[]>, product: any) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  const handleStockUpdate = (productId: string, newStock: number) => {
    onUpdateStock(productId, newStock);
    setEditingStock(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-sm mx-auto bg-white min-h-screen pb-20">
        <div className="p-4 bg-orange-600 text-white flex items-center gap-3">
          <ArrowLeft className="w-5 h-5 cursor-pointer" onClick={onBack} />
          <h1 className="text-lg font-bold">Inventory Management</h1>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={showStockView}
                onCheckedChange={setShowStockView}
                id="stock-view"
              />
              <Label htmlFor="stock-view" className="text-sm">
                Show stock numbers
              </Label>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(groupedProducts).map(
              ([category, categoryProducts]) => (
                <div key={category} className="border rounded-lg">
                  <div className="p-3 bg-gray-50 border-b">
                    <h3 className="font-medium flex items-center justify-between">
                      {category}
                      <span className="text-sm text-gray-500">
                        {(categoryProducts as any[]).reduce(
                          (sum: number, p: any) => sum + p.stock,
                          0,
                        )}{" "}
                        total
                      </span>
                    </h3>
                  </div>
                  <div className="p-3 space-y-3">
                    {(categoryProducts as any[]).map((product: any) => (
                      <div key={product.id} className="flex items-center gap-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {product.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            ₱{product.price.toFixed(2)}
                          </p>
                        </div>
                        {showStockView && (
                          <div className="flex items-center gap-2">
                            {editingStock === product.id ? (
                              <>
                                <Input
                                  type="number"
                                  value={stockValue}
                                  onChange={(e) =>
                                    setStockValue(e.target.value)
                                  }
                                  className="w-16 h-8 text-sm"
                                  autoFocus
                                />
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleStockUpdate(
                                      product.id,
                                      parseInt(stockValue),
                                    )
                                  }
                                  className="h-8"
                                >
                                  ✓
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingStock(null)}
                                  className="h-8"
                                >
                                  ✕
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleStockUpdate(
                                      product.id,
                                      product.stock - 1,
                                    )
                                  }
                                  className="w-8 h-8 p-0"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span
                                  className="w-12 text-center text-sm cursor-pointer hover:bg-gray-100 rounded px-1"
                                  onClick={() => {
                                    setEditingStock(product.id);
                                    setStockValue(product.stock.toString());
                                  }}
                                >
                                  {product.stock}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleStockUpdate(
                                      product.id,
                                      product.stock + 1,
                                    )
                                  }
                                  className="w-8 h-8 p-0"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t max-w-sm mx-auto">
        <div className="flex">
          <div className="flex-1 text-center p-3 text-gray-400">
            <Home className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xs">Home</p>
          </div>
          <div className="flex-1 text-center p-3 text-gray-400">
            <ShoppingCart className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xs">POS</p>
          </div>
          <div className="flex-1 text-center p-3 text-orange-600">
            <Package className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xs">Stock</p>
          </div>
          <div className="flex-1 text-center p-3 text-gray-400">
            <BarChart3 className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xs">Reports</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Products Management Screen
function ProductsScreen({
  onBack,
  products,
  categories,
  onEdit,
  onDelete,
  onAdd,
}: {
  onBack: () => void;
  products: any[];
  categories: any[];
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}) {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-sm mx-auto bg-white min-h-screen pb-20">
        <div className="p-4 bg-blue-600 text-white flex items-center gap-3">
          <ArrowLeft className="w-5 h-5 cursor-pointer" onClick={onBack} />
          <h1 className="text-lg font-bold flex-1">Products</h1>
          <Plus className="w-5 h-5 cursor-pointer" onClick={onAdd} />
        </div>

        <div className="p-4">
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
              >
                Sort {sortOrder === "asc" ? "A-Z" : "Z-A"}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <div key={product.id} className="border rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-gray-600">{product.category}</p>
                    <p className="text-purple-600 font-bold">
                      ₱{product.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Stock: {product.stock}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(product)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(product.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-20 right-4">
          <Button
            onClick={onAdd}
            className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 p-0"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t max-w-sm mx-auto">
        <div className="flex">
          <div className="flex-1 text-center p-3 text-gray-400">
            <Home className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xs">Home</p>
          </div>
          <div className="flex-1 text-center p-3 text-gray-400">
            <ShoppingCart className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xs">POS</p>
          </div>
          <div className="flex-1 text-center p-3 text-gray-400">
            <Package className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xs">Stock</p>
          </div>
          <div className="flex-1 text-center p-3 text-blue-600">
            <BarChart3 className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xs">Products</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add Product Screen
function AddProductScreen({
  onBack,
  categories,
  onSave,
  editingProduct = null,
}: {
  onBack: () => void;
  categories: any[];
  onSave: (productData: any) => void;
  editingProduct?: any;
}) {
  const [formData, setFormData] = useState({
    name: editingProduct?.name || "",
    category: editingProduct?.category || "",
    price: editingProduct?.price?.toString() || "",
    cost: editingProduct?.cost?.toString() || "",
    stock: editingProduct?.stock?.toString() || "",
    description: editingProduct?.description || "",
    sku: editingProduct?.sku || `PRD${Date.now()}`,
    baseUnit: editingProduct?.baseUnit || "pcs",
  });

  const handleSave = () => {
    if (!formData.name || !formData.price) {
      alert("Please fill in required fields");
      return;
    }

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost) || 0,
      stock: parseInt(formData.stock) || 0,
      units: [
        {
          name: formData.baseUnit,
          conversionFactor: 1,
          price: formData.price,
          isBase: true,
          type: "retail",
        },
      ],
    };

    onSave(productData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-sm mx-auto bg-white min-h-screen pb-20">
        <div className="p-4 bg-green-600 text-white flex items-center gap-3">
          <ArrowLeft className="w-5 h-5 cursor-pointer" onClick={onBack} />
          <h1 className="text-lg font-bold">
            {editingProduct ? "Edit Product" : "Add Product"}
          </h1>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter product name"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                type="number"
                value={formData.cost}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cost: e.target.value }))
                }
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, stock: e.target.value }))
                }
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="baseUnit">Unit</Label>
              <Select
                value={formData.baseUnit}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, baseUnit: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pcs">Pieces</SelectItem>
                  <SelectItem value="kg">Kilogram</SelectItem>
                  <SelectItem value="liter">Liter</SelectItem>
                  <SelectItem value="box">Box</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Product description..."
            />
          </div>

          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, sku: e.target.value }))
              }
              placeholder="Product SKU"
            />
          </div>

          <Button
            onClick={handleSave}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {editingProduct ? "Update Product" : "Save Product"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function Dashboard() {
  const [currentScreen, setCurrentScreen] = useState<
    "dashboard" | "pos" | "inventory" | "products" | "addProduct"
  >("dashboard");
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Use Supabase hooks for real data
  const {
    products: dbProducts,
    loading: productsLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
  } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { createTransactionWithItems } = useTransactions();

  // Transform database products to match the component structure
  const products = dbProducts.map((product) => ({
    id: product.id,
    name: product.name,
    stock: product.stock,
    price: product.price_retail,
    image: product.image_url || "/placeholder.svg",
    category:
      categories.find((cat) => cat.id === product.category_id)?.name ||
      "General",
    baseUnit: product.base_unit,
    cost: product.cost,
    description: product.description,
    sku: product.sku,
    units:
      product.units?.map((unit: any) => ({
        name: unit.unit_name,
        conversionFactor: unit.conversion_factor,
        price: unit.price,
        isBase: unit.is_base_unit,
        type: unit.unit_type,
      })) || [],
  }));

  const handleSaveProduct = async (productData: any) => {
    try {
      if (editingProduct) {
        // Update existing product
        await updateProduct(editingProduct.id, {
          name: productData.name,
          price_retail: productData.price,
          cost: productData.cost,
          stock: productData.stock,
          description: productData.description,
          base_unit: productData.baseUnit,
          units: productData.units,
        });
      } else {
        // Create new product
        const categoryId = categories.find(
          (cat) => cat.name === productData.category,
        )?.id;
        await createProduct({
          name: productData.name,
          sku: productData.sku,
          price_retail: productData.price,
          cost: productData.cost,
          stock: productData.stock,
          description: productData.description,
          base_unit: productData.baseUnit,
          category_id: categoryId,
          units: productData.units,
        });
      }
      setCurrentScreen("products");
      setEditingProduct(null);
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("Failed to save product. Please try again.");
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setCurrentScreen("addProduct");
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
      } catch (error) {
        console.error("Failed to delete product:", error);
        alert("Failed to delete product. Please try again.");
      }
    }
  };

  const handleUpdateStock = async (id: string, newStock: number) => {
    try {
      await updateStock(id, newStock);
    } catch (error) {
      console.error("Failed to update stock:", error);
      alert("Failed to update stock. Please try again.");
    }
  };

  // Loading state
  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Route to different screens
  if (currentScreen === "pos") {
    return (
      <POSScreen
        onBack={() => setCurrentScreen("dashboard")}
        products={products}
        categories={categories}
      />
    );
  }

  if (currentScreen === "inventory") {
    return (
      <InventoryScreen
        onBack={() => setCurrentScreen("dashboard")}
        products={products}
        onUpdateStock={handleUpdateStock}
      />
    );
  }

  if (currentScreen === "products") {
    return (
      <ProductsScreen
        onBack={() => setCurrentScreen("dashboard")}
        products={products}
        categories={categories}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onAdd={() => {
          setEditingProduct(null);
          setCurrentScreen("addProduct");
        }}
      />
    );
  }

  if (currentScreen === "addProduct") {
    return (
      <AddProductScreen
        onBack={() => setCurrentScreen("products")}
        categories={categories}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
      />
    );
  }

  // Default dashboard screen
  return (
    <DashboardScreen
      onNavigate={(screen: string) =>
        setCurrentScreen(
          screen as
            | "dashboard"
            | "pos"
            | "inventory"
            | "products"
            | "addProduct",
        )
      }
    />
  );
}
