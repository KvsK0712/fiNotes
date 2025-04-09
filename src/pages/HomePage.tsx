import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import PageLayout from "@/components/layout/PageLayout";
import { ArrowDown, ArrowUp, DollarSign, PiggyBank, Target } from "lucide-react";
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

const STORAGE_KEY = "pocket_wise_transactions";

const HomePage = () => {
  const { userData } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  
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
  }, []);

  // Get currency symbol from user data
  const currencySymbol = userData?.currency || "$";

  const QuickActions = [
    { name: "Add Expense", icon: ArrowDown, color: "bg-red-100 text-red-600", path: "/tracker/add?type=expense" },
    { name: "Add Income", icon: ArrowUp, color: "bg-green-100 text-green-600", path: "/tracker/add?type=income" },
    { name: "View Budget", icon: PiggyBank, color: "bg-blue-100 text-blue-600", path: "/tracker" },
    { name: "Set Goal", icon: Target, color: "bg-purple-100 text-purple-600", path: "/tracker" }
  ];

  const Features = [
    { 
      name: "Track Finances", 
      description: "Record expenses and income with our offline tracker", 
      path: "/tracker" 
    },
    { 
      name: "Calculate", 
      description: "EMI, loans, SIP and more financial calculators", 
      path: "/calculators" 
    },
    { 
      name: "Financial Education", 
      description: "Learn about personal finance concepts and strategies", 
      path: "/learn" 
    },
    { 
      name: "Set Goals", 
      description: "Track your progress towards financial goals", 
      path: "/goals" 
    }
  ];

  return (
    <PageLayout>
      <div className="finance-container animate-fade-in">
        {/* Header/Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Hello, {userData?.name || "User"}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Welcome to your financial dashboard
          </p>
        </div>

        {/* Balance Card */}
        <Card className="mb-6 bg-finance-navy text-white">
          <CardContent className="p-6">
            <p className="text-sm opacity-80 mb-1">Current Balance</p>
            <div className="flex items-baseline">
              <span className="mr-1 text-xl">{currencySymbol}</span>
              <span className="text-3xl font-bold">{balance.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Features.map((feature) => (
              <Link key={feature.name} to={feature.path}>
                <Card className="card-hover cursor-pointer">
                  <CardContent className="p-4">
                    <h3 className="font-medium">{feature.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {feature.description}
                    </p>
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
