
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, CreditCard, Coins, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const CalculatorsPage = () => {
  const isMobile = useIsMobile();
  
  const calculators = [
    {
      id: 'emi',
      name: 'EMI Calculator',
      description: 'Calculate your monthly loan repayments',
      icon: Calculator,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'loan',
      name: 'Loan Repayment',
      description: 'Plan your loan repayment schedule',
      icon: Coins,
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 'sip',
      name: 'SIP Planner',
      description: 'Calculate returns on systematic investments',
      icon: ArrowUpRight,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'credit-card',
      name: 'Credit Card Optimizer',
      description: 'Optimize your credit card debt payments',
      icon: CreditCard,
      color: 'bg-red-100 text-red-600',
    },
  ];

  return (
    <PageLayout title="Financial Calculators">
      <div className="finance-container animate-fade-in p-4">
        <div className="grid grid-cols-1 gap-4">
          {calculators.map((calculator) => (
            <Link key={calculator.id} to={`/calculators/${calculator.id}`}>
              <Card className="finance-card card-hover cursor-pointer">
                <CardContent className={`p-4 flex items-center ${isMobile ? 'touch-manipulation' : ''}`}>
                  <div className={`flex items-center justify-center rounded-full ${calculator.color} p-3 mr-4`}>
                    <calculator.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{calculator.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {calculator.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default CalculatorsPage;
