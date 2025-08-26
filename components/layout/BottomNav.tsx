import { Home, Package, Plus, FileText, ShoppingBag } from "lucide-react";

interface BottomNavProps {
  currentScreen: "dashboard" | "pos" | "inventory" | "products" | "add-product";
  setCurrentScreen: (screen: "dashboard" | "pos" | "inventory" | "products" | "add-product") => void;
}

export default function BottomNav({ currentScreen, setCurrentScreen }: BottomNavProps) {
  const navItems = [
    { name: "Home", screen: "dashboard", icon: Home },
    { name: "Inventory", screen: "inventory", icon: Package },
    { name: "Add Product", screen: "add-product", icon: Plus, isCentral: true },
    { name: "Products", screen: "products", icon: FileText },
    { name: "Store", screen: "pos", icon: ShoppingBag },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200">
      <div className="flex justify-around items-center py-3 relative">
        {navItems.map((item) => {
          const isActive = currentScreen === item.screen;
          const Icon = item.icon;

          if (item.isCentral) {
            return (
              <div key={item.name} className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen(item.screen as any)}>
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-1 mx-auto shadow-lg transform hover:scale-105 transition-all">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className={`text-xs ${isActive ? "text-purple-600 font-medium" : "text-gray-400"}`}>
                  {item.name}
                </p>
              </div>
            );
          }

          return (
            <div key={item.name} className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen(item.screen as any)}>
              <Icon className={`w-6 h-6 mx-auto mb-1 ${isActive ? "text-purple-600" : "text-gray-400"}`} />
              <p className={`text-xs ${isActive ? "text-purple-600 font-medium" : "text-gray-400"}`}>
                {item.name}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}