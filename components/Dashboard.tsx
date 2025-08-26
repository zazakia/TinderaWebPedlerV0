import {
  DollarSign,
  CreditCard,
  Monitor,
  Receipt,
  ShoppingCart,
  ShoppingBag,
  BarChart3,
  Link,
  Gamepad2,
  Mail,
  FileText,
  User,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardProps {
  setCurrentScreen: (screen: "dashboard" | "pos" | "inventory" | "products" | "add-product") => void;
}

export default function Dashboard({ setCurrentScreen }: DashboardProps) {
  const services = [
    { name: "Cash", icon: DollarSign, action: () => {} },
    { name: "Credit", icon: CreditCard, action: () => {} },
    { name: "Payment", icon: Monitor, action: () => {} },
    { name: "Expenses", icon: Receipt, action: () => {} },
    { name: "POS", icon: Monitor, action: () => setCurrentScreen("pos") },
    { name: "Receipts", icon: ShoppingCart, action: () => {} },
    { name: "Purchases", icon: ShoppingBag, action: () => {} },
    { name: "Reports", icon: BarChart3, action: () => {} },
    { name: "Store Link", icon: Link, action: () => {} },
    { name: "Play & Win", icon: Gamepad2, action: () => {} },
    { name: "Inbox", icon: Mail, action: () => {}, notification: 12 },
    { name: "Products", icon: FileText, action: () => setCurrentScreen("products") },
  ];

  return (
    <div className="min-h-screen bg-gray-100 max-w-sm mx-auto relative">
      {/* Header */}
      <div className="bg-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-2xl font-bold text-purple-600">Peddlr</span>
            <div className="w-6 h-4 bg-gradient-to-b from-blue-500 via-white to-red-500 rounded-sm ml-1"></div>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
            <User className="w-4 h-4" />
            Account
          </Button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="px-4 mb-6">
        <div className="bg-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🍌</div>
              <span className="text-lg font-medium">kankolek</span>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4" />
                <span className="text-sm">Your Balance</span>
              </div>
              <div className="text-2xl font-bold">P 0.00</div>
              <div className="text-xs opacity-75">Powered by Netbank</div>
            </div>
          </div>
          <Button className="w-full bg-white text-purple-600 hover:bg-gray-100 rounded-lg py-3 font-semibold">
            Activate 🇵🇭QRPh
          </Button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-4 gap-4">
          {services.map((service) => (
            <div key={service.name} className="text-center cursor-pointer hover:opacity-80" onClick={service.action}>
              <div className="relative">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
                  <service.icon className="w-6 h-6 text-purple-600" />
                </div>
                {service.notification && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {service.notification}
                  </div>
                )}
              </div>
              <p className="text-xs font-medium text-gray-700">{service.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}