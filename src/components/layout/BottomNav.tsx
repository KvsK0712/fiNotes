
import { Home, Calculator, BookOpen, Settings, Wallet, BarChart3 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Tracker", path: "/tracker", icon: Wallet },
    { name: "Calculator", path: "/calculators", icon: Calculator },
    { name: "Assets", path: "/assets", icon: BarChart3 },
    { name: "Learn", path: "/learn", icon: BookOpen },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 shadow-md border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex justify-between items-center px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== "/" && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center py-2 px-3 ${
                isActive 
                  ? "text-primary" 
                  : "text-gray-500 hover:text-primary"
              }`}
            >
              <item.icon size={20} />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
