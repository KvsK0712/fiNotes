
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import PageLayout from "@/components/layout/PageLayout";
import { ArrowDown, ArrowUp, DollarSign, PiggyBank, Target } from "lucide-react";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [username, setUsername] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  
  useEffect(() => {
    // In a real app, this would come from local storage or an API
    setUsername("User");
    setBalance(12500);
  }, []);

  const QuickActions = [
    { name: "Add Expense", icon: ArrowDown, color: "bg-red-100 text-red-600", path: "/tracker/add" },
    { name: "Add Income", icon: ArrowUp, color: "bg-green-100 text-green-600", path: "/tracker/add" },
    { name: "View Budget", icon: PiggyBank, color: "bg-blue-100 text-blue-600", path: "/tracker/budget" },
    { name: "Set Goal", icon: Target, color: "bg-purple-100 text-purple-600", path: "/goals" }
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
            Hello, {username}
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
              <DollarSign className="mr-1" size={24} />
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
