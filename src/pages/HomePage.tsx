
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import PageLayout from "@/components/layout/PageLayout";
import { ArrowDown, ArrowUp, Calculator, BookOpen, Wallet, BarChart3, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
}

interface Asset {
  id: string;
  name: string;
  type: string;
  value: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface Liability {
  id: string;
  name: string;
  type: string;
  value: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "fi_notes_transactions";
const ASSETS_STORAGE_KEY = "fi_notes_assets";
const LIABILITIES_STORAGE_KEY = "fi_notes_liabilities";

const HomePage = () => {
  const { userData } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [netWorth, setNetWorth] = useState<number>(0);
  
  useEffect(() => {
    // Calculate balance from stored transactions
    const savedTransactions = localStorage.getItem(STORAGE_KEY);
    if (savedTransactions) {
      const transactions: Transaction[] = JSON.parse(savedTransactions);
      const totalIncome = transactions
        .filter(t => t.type === "income")
        .reduce((acc, t) => acc + t.amount, 0);
      
      const totalExpense = transactions
        .filter(t => t.type === "expense")
        .reduce((acc, t) => acc + t.amount, 0);
        
      setBalance(totalIncome - totalExpense);
    } else {
      // Set initial balance to 0 for new users
      setBalance(0);
    }
    
    // Calculate net worth from assets and liabilities
    const savedAssets = localStorage.getItem(ASSETS_STORAGE_KEY);
    const savedLiabilities = localStorage.getItem(LIABILITIES_STORAGE_KEY);
    
    let totalAssets = 0;
    let totalLiabilities = 0;
    
    if (savedAssets) {
      const assets: Asset[] = JSON.parse(savedAssets);
      totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
    }
    
    if (savedLiabilities) {
      const liabilities: Liability[] = JSON.parse(savedLiabilities);
      totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.value, 0);
    }
    
    setNetWorth(totalAssets - totalLiabilities);
  }, []);

  // Get currency symbol from user data
  const currencySymbol = userData?.currency || "$";

  const QuickActions = [
    { name: "Add Expense", icon: ArrowDown, color: "bg-red-100 text-red-600", path: "/tracker/add?type=expense" },
    { name: "Add Income", icon: ArrowUp, color: "bg-green-100 text-green-600", path: "/tracker/add?type=income" },
    { name: "View Budget", icon: Calculator, color: "bg-blue-100 text-blue-600", path: "/budget" },
    { name: "Set Goal", icon: Target, color: "bg-yellow-100 text-yellow-600", path: "/goals" }
  ];

  const Features = [
    { 
      name: "Calculator", 
      description: "EMI, loans, SIP and more financial calculators", 
      path: "/calculators",
      icon: Calculator,
      color: "text-blue-500"
    },
    { 
      name: "Tracker", 
      description: "Track your expenses and income transactions", 
      path: "/tracker",
      icon: Wallet,
      color: "text-green-500"
    },
    { 
      name: "Assets", 
      description: "Track assets, liabilities and net worth", 
      path: "/assets",
      icon: BarChart3,
      color: "text-purple-500"
    },
    { 
      name: "Learn", 
      description: "Educational resources for financial literacy", 
      path: "/learn",
      icon: BookOpen,
      color: "text-indigo-500"
    }
  ];

  return (
    <PageLayout>
      <div className="finance-container animate-fade-in p-4">
        {/* Header/Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Hello, {userData?.name || "User"}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Welcome to your financial dashboard
          </p>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Balance Card */}
          <Card className="bg-gradient-to-r from-green-700 to-green-900 text-white">
            <CardContent className="p-4">
              <p className="text-sm opacity-80 mb-1">Balance</p>
              <div className="flex items-baseline">
                <span className="mr-1">{currencySymbol}</span>
                <span className="text-xl font-bold">{balance.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Net Worth Card */}
          <Card className="bg-gradient-to-r from-blue-700 to-blue-900 text-white">
            <CardContent className="p-4">
              <p className="text-sm opacity-80 mb-1">Net Worth</p>
              <div className="flex items-baseline">
                <span className="mr-1">{currencySymbol}</span>
                <span className="text-xl font-bold">{netWorth.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-3">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-2">
            {QuickActions.map((action) => (
              <Link key={action.name} to={action.path}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-full ${action.color} mb-1`}>
                    <action.icon size={20} />
                  </div>
                  <p className="text-xs text-center">{action.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* App Features */}
        <div>
          <h2 className="text-lg font-medium mb-3">Features</h2>
          <div className="grid grid-cols-1 gap-4">
            {Features.map((feature) => (
              <Link key={feature.name} to={feature.path}>
                <Card className="card-hover cursor-pointer">
                  <CardContent className="p-4 flex items-center">
                    <div className={`mr-4 ${feature.color}`}>
                      <feature.icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-medium">{feature.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default HomePage;
