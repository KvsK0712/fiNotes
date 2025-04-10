import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2, CreditCard } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface CreditCard {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minPayment: number;
}

interface PaymentPlan {
  id: string;
  name: string;
  monthsToPayoff: number;
  totalInterest: number;
  paymentSchedule: {
    month: number;
    remainingBalance: number;
    payment: number;
    interestPaid: number;
    principalPaid: number;
  }[];
}

const CreditCardOptimizer = () => {
  const { userData } = useAuth();
  const currencySymbol = userData?.currency || "$";
  
  const [cards, setCards] = useState<CreditCard[]>([
    { id: '1', name: 'Card A', balance: 20000, interestRate: 30, minPayment: 600 },
    { id: '2', name: 'Card B', balance: 8000, interestRate: 22, minPayment: 400 }
  ]);
  
  const [strategy, setStrategy] = useState<'avalanche' | 'snowball'>('avalanche');
  const [monthlyPayment, setMonthlyPayment] = useState<number>(2000);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [totalInterestSaved, setTotalInterestSaved] = useState<number>(0);
  const [minOnlyTotalInterest, setMinOnlyTotalInterest] = useState<number>(0);
  const [timeToPayoff, setTimeToPayoff] = useState<number>(0);

  const addCard = () => {
    const newId = (cards.length + 1).toString();
    const newCard: CreditCard = {
      id: newId,
      name: `Card ${newId}`,
      balance: 0,
      interestRate: 0,
      minPayment: 0
    };
    setCards([...cards, newCard]);
  };

  const updateCard = (id: string, field: keyof CreditCard, value: string | number) => {
    setCards(cards.map(card => 
      card.id === id ? { ...card, [field]: typeof value === 'string' ? value : Number(value) } : card
    ));
  };

  const removeCard = (id: string) => {
    setCards(cards.filter(card => card.id !== id));
  };

  const calculatePayoff = () => {
    if (cards.length === 0 || monthlyPayment <= 0) {
      return;
    }

    const totalMinPayments = cards.reduce((sum, card) => sum + card.minPayment, 0);
    if (monthlyPayment < totalMinPayments) {
      alert(`Your monthly payment must be at least equal to the sum of minimum payments: ${currencySymbol}${totalMinPayments}`);
      return;
    }

    const cardsCopy = [...cards];

    const sortedCards = [...cardsCopy].sort((a, b) => {
      if (strategy === 'avalanche') {
        return b.interestRate - a.interestRate;
      } else {
        return a.balance - b.balance;
      }
    });

    const plans: PaymentPlan[] = [];
    let totalMonths = 0;
    let strategicTotalInterest = 0;
    let minOnlyInterest = 0;

    let remainingCards = [...sortedCards];
    let currentMonth = 1;
    let availablePayment = monthlyPayment;

    while (remainingCards.length > 0) {
      let leftover = availablePayment;
      for (const card of remainingCards) {
        leftover -= card.minPayment;
      }

      if (leftover > 0 && remainingCards.length > 0) {
        const targetCard = remainingCards[0];
        const extraPayment = Math.min(leftover, targetCard.balance);
        leftover -= extraPayment;
      }

      for (let i = remainingCards.length - 1; i >= 0; i--) {
        const card = remainingCards[i];
        const interest = (card.balance * (card.interestRate / 100)) / 12;
        strategicTotalInterest += interest;
        
        let cardPayment;
        if (i === 0 && leftover === 0) {
          cardPayment = Math.min(card.minPayment + (availablePayment - leftover - totalMinPayments), card.balance + interest);
        } else {
          cardPayment = Math.min(card.minPayment, card.balance + interest);
        }

        card.balance = card.balance + interest - cardPayment;

        let plan = plans.find(p => p.id === card.id);
        if (!plan) {
          plan = {
            id: card.id,
            name: card.name,
            monthsToPayoff: 0,
            totalInterest: 0,
            paymentSchedule: []
          };
          plans.push(plan);
        }

        plan.totalInterest += interest;
        plan.paymentSchedule.push({
          month: currentMonth,
          remainingBalance: card.balance,
          payment: cardPayment,
          interestPaid: interest,
          principalPaid: cardPayment - interest
        });

        if (card.balance <= 0) {
          plan.monthsToPayoff = currentMonth;
          remainingCards.splice(i, 1);
        }
      }

      currentMonth++;
      if (currentMonth > 1000) break;
    }

    let minPaymentCards = [...cardsCopy];
    let minMonth = 1;
    while (minPaymentCards.some(card => card.balance > 0) && minMonth <= 1000) {
      for (const card of minPaymentCards) {
        if (card.balance <= 0) continue;
        
        const interest = (card.balance * (card.interestRate / 100)) / 12;
        minOnlyInterest += interest;
        
        const payment = Math.min(card.minPayment, card.balance + interest);
        card.balance = card.balance + interest - payment;
      }
      minMonth++;
    }

    totalMonths = Math.max(...plans.map(plan => plan.monthsToPayoff));
    
    setPaymentPlans(plans);
    setTimeToPayoff(totalMonths);
    setTotalInterestSaved(minOnlyInterest - strategicTotalInterest);
    setMinOnlyTotalInterest(minOnlyInterest);
  };

  const prepareChartData = () => {
    if (paymentPlans.length === 0) return [];

    const maxMonths = Math.max(...paymentPlans.map(plan => 
      plan.paymentSchedule.length
    ));

    const chartData = [];
    for (let month = 1; month <= maxMonths; month++) {
      const monthData: any = { month };
      
      for (const plan of paymentPlans) {
        const schedule = plan.paymentSchedule.find(s => s.month === month);
        if (schedule) {
          monthData[plan.name] = Math.max(0, schedule.remainingBalance);
        } else if (month > plan.monthsToPayoff) {
          monthData[plan.name] = 0;
        }
      }
      
      chartData.push(monthData);
    }

    return chartData;
  };

  const chartData = prepareChartData();

  return (
    <PageLayout title="Credit Card Optimizer" showBackButton>
      <div className="finance-container animate-fade-in">
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4">Credit Card Details</h2>

            <div className="space-y-4">
              {cards.map((card, index) => (
                <div key={card.id} className="p-4 border rounded-md">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <CreditCard className="mr-2 text-primary" size={20} />
                      <h3 className="font-medium">
                        <Input 
                          className="border-0 p-0 h-auto bg-transparent"
                          value={card.name} 
                          onChange={(e) => updateCard(card.id, 'name', e.target.value)} 
                        />
                      </h3>
                    </div>
                    <Button
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeCard(card.id)}
                      disabled={cards.length <= 1} 
                      aria-label="Remove card"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-1 block">
                        Balance ({currencySymbol})
                      </Label>
                      <Input
                        type="number"
                        value={card.balance}
                        onChange={(e) => updateCard(card.id, 'balance', e.target.value)}
                        min="0"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-1 block">
                        Interest Rate (% per annum)
                      </Label>
                      <Input
                        type="number"
                        value={card.interestRate}
                        onChange={(e) => updateCard(card.id, 'interestRate', e.target.value)}
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-1 block">
                        Min Monthly Payment ({currencySymbol})
                      </Label>
                      <Input
                        type="number"
                        value={card.minPayment}
                        onChange={(e) => updateCard(card.id, 'minPayment', e.target.value)}
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button 
                variant="outline" 
                className="w-full" 
                onClick={addCard}
              >
                <PlusCircle size={16} className="mr-2" />
                Add Another Card
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-1 block">
                    Payment Strategy
                  </Label>
                  <Select value={strategy} onValueChange={(value: 'avalanche' | 'snowball') => setStrategy(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avalanche">Avalanche (Highest Interest First)</SelectItem>
                      <SelectItem value="snowball">Snowball (Smallest Balance First)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-1 block">
                    Monthly Payment ({currencySymbol})
                  </Label>
                  <Input
                    type="number"
                    value={monthlyPayment}
                    onChange={(e) => setMonthlyPayment(Number(e.target.value))}
                    min="0"
                  />
                </div>
              </div>

              <Button 
                onClick={calculatePayoff} 
                className="w-full bg-primary hover:bg-primary/90"
              >
                Calculate Payoff Plan
              </Button>
            </div>
          </CardContent>
        </Card>

        {paymentPlans.length > 0 && (
          <>
            <Card className="finance-card mb-6">
              <CardContent className="p-4">
                <h2 className="text-lg font-medium mb-4">Payoff Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payoff Strategy:</span>
                    <span className="font-semibold">
                      {strategy === 'avalanche' ? 'Avalanche (Highest Interest First)' : 'Snowball (Smallest Balance First)'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time to Pay Off:</span>
                    <span className="font-semibold">
                      {timeToPayoff} months ({Math.floor(timeToPayoff / 12)} years, {timeToPayoff % 12} months)
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Interest Paid:</span>
                    <span className="font-semibold">{currencySymbol}{minOnlyTotalInterest.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interest Saved:</span>
                    <span className="font-semibold text-green-600">{currencySymbol}{totalInterestSaved.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="finance-card mb-6">
              <CardContent className="p-4">
                <h2 className="text-lg font-medium mb-4">Payoff Order</h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Card</TableHead>
                        <TableHead>Starting Balance</TableHead>
                        <TableHead>Interest Rate</TableHead>
                        <TableHead>Payoff Time</TableHead>
                        <TableHead>Total Interest</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentPlans.map((plan, index) => (
                        <TableRow key={plan.id}>
                          <TableCell>{index + 1}. {plan.name}</TableCell>
                          <TableCell>{currencySymbol}{cards.find(c => c.id === plan.id)?.balance.toFixed(2)}</TableCell>
                          <TableCell>{cards.find(c => c.id === plan.id)?.interestRate.toFixed(2)}%</TableCell>
                          <TableCell>{plan.monthsToPayoff} months</TableCell>
                          <TableCell>{currencySymbol}{plan.totalInterest.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="finance-card mb-6">
              <CardContent className="p-4">
                <h2 className="text-lg font-medium mb-4">Payoff Timeline</h2>
                <div className="h-80">
                  <ChartContainer config={paymentPlans.reduce((acc, plan) => {
                    acc[plan.name] = { label: plan.name };
                    return acc;
                  }, {} as any)}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
                        <YAxis
                          label={{ value: `Balance (${currencySymbol})`, angle: -90, position: 'insideLeft' }}
                          tickFormatter={(value) => `${currencySymbol}${value}`}
                        />
                        <ChartTooltip
                          content={<ChartTooltipContent />}
                          formatter={(value) => [`${currencySymbol}${value.toLocaleString()}`, undefined]}
                        />
                        <Legend />
                        {paymentPlans.map((plan, index) => (
                          <Bar 
                            key={plan.id} 
                            dataKey={plan.name} 
                            stackId="a" 
                            fill={`hsl(${index * 360 / paymentPlans.length}, 70%, 50%)`} 
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default CreditCardOptimizer;
