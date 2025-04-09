
import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const LoanRepayment = () => {
  const { userData } = useAuth();
  const currencySymbol = userData?.currency || "$";
  
  const [loanAmount, setLoanAmount] = useState<number>(100000);
  const [interestRate, setInterestRate] = useState<number>(10);
  const [loanTerm, setLoanTerm] = useState<number>(12);
  const [termType, setTermType] = useState<"months" | "years">("months");
  const [loanType, setLoanType] = useState<"personal" | "auto" | "education" | "home">("personal");
  const [earlyPayment, setEarlyPayment] = useState<number>(0);
  const [earlyPaymentMonth, setEarlyPaymentMonth] = useState<number>(6);
  
  const [results, setResults] = useState<{
    emi: number;
    totalPayment: number;
    totalInterest: number;
    schedule: Array<{
      month: number;
      emi: number;
      principal: number;
      interest: number;
      balance: number;
    }>;
    earlyPayoffResults?: {
      totalPayment: number;
      totalInterest: number;
      monthsSaved: number;
      interestSaved: number;
    };
  } | null>(null);

  const calculateLoan = () => {
    // Convert loan term to months if it's in years
    const months = termType === "years" ? loanTerm * 12 : loanTerm;
    
    // EMI calculation formula: [P x R x (1+R)^N]/[(1+R)^N-1]
    // where P = Principal, R = Monthly interest rate, N = Number of months
    const principal = loanAmount;
    const monthlyRate = interestRate / 100 / 12;
    
    const emiValue = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    
    let totalPayment = emiValue * months;
    let totalInterest = totalPayment - principal;
    
    // Generate amortization schedule
    const schedule = [];
    let remainingBalance = principal;
    
    for (let i = 1; i <= months; i++) {
      const interestForMonth = remainingBalance * monthlyRate;
      const principalForMonth = emiValue - interestForMonth;
      
      remainingBalance -= principalForMonth;
      
      schedule.push({
        month: i,
        emi: emiValue,
        principal: principalForMonth,
        interest: interestForMonth,
        balance: Math.max(0, remainingBalance)
      });
    }
    
    // Calculate early payoff impact if specified
    let earlyPayoffResults;
    if (earlyPayment > 0 && earlyPaymentMonth > 0 && earlyPaymentMonth < months) {
      let earlySchedule = [];
      let earlyRemainingBalance = principal;
      let totalEarlyPayment = 0;
      let totalEarlyInterest = 0;
      let lastMonth = 0;
      
      for (let i = 1; i <= months; i++) {
        const interestForMonth = earlyRemainingBalance * monthlyRate;
        const principalForMonth = emiValue - interestForMonth;
        
        // Apply early payment at specified month
        if (i === earlyPaymentMonth) {
          earlyRemainingBalance -= earlyPayment;
          totalEarlyPayment += earlyPayment;
        }
        
        if (earlyRemainingBalance <= 0) {
          // Final payment might be less than full EMI
          const finalPayment = principalForMonth + interestForMonth + earlyRemainingBalance;
          totalEarlyPayment += finalPayment;
          totalEarlyInterest += interestForMonth;
          earlyRemainingBalance = 0;
          lastMonth = i;
          break;
        } else {
          earlyRemainingBalance -= principalForMonth;
          totalEarlyPayment += emiValue;
          totalEarlyInterest += interestForMonth;
        }
        
        // Record this month in early schedule
        earlySchedule.push({
          month: i,
          emi: i === earlyPaymentMonth ? emiValue + earlyPayment : emiValue,
          principal: i === earlyPaymentMonth ? principalForMonth + earlyPayment : principalForMonth,
          interest: interestForMonth,
          balance: Math.max(0, earlyRemainingBalance)
        });
        
        lastMonth = i;
      }
      
      earlyPayoffResults = {
        totalPayment: totalEarlyPayment,
        totalInterest: totalEarlyInterest,
        monthsSaved: months - lastMonth,
        interestSaved: totalInterest - totalEarlyInterest
      };
    }
    
    setResults({
      emi: emiValue,
      totalPayment,
      totalInterest,
      schedule,
      earlyPayoffResults
    });
  };

  // Generate chart data
  const prepareChartData = () => {
    if (!results) return [];
    
    // Get principal and interest over time
    return results.schedule.filter((_, index) => index % 3 === 0).map(entry => ({
      month: entry.month,
      principal: loanAmount - entry.balance,
      interest: results.schedule
        .filter(item => item.month <= entry.month)
        .reduce((sum, item) => sum + item.interest, 0),
      balance: entry.balance,
      ...(results.earlyPayoffResults && {
        earlyBalance: entry.month >= earlyPaymentMonth 
          ? Math.max(0, entry.balance - earlyPayment + (entry.month === earlyPaymentMonth ? 0 : 
              (earlyPayment * monthlyRate * (entry.month - earlyPaymentMonth))))
          : entry.balance
      })
    }));
  };

  const chartData = prepareChartData();

  return (
    <PageLayout title="Loan Repayment Calculator" showBackButton>
      <div className="finance-container animate-fade-in">
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4">Loan Details</h2>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-1 block">
                  Loan Type
                </Label>
                <Select 
                  value={loanType} 
                  onValueChange={(value: "personal" | "auto" | "education" | "home") => setLoanType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select loan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal Loan</SelectItem>
                    <SelectItem value="auto">Auto Loan</SelectItem>
                    <SelectItem value="education">Education Loan</SelectItem>
                    <SelectItem value="home">Home Loan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-1 block">
                  Loan Amount ({currencySymbol})
                </Label>
                <Input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-1 block">
                  Interest Rate (% per annum)
                </Label>
                <Input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  step="0.1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-1 block">
                    Loan Term
                  </Label>
                  <Input
                    type="number"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                    min="1"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-1 block">
                    Term Type
                  </Label>
                  <Select value={termType} onValueChange={(value: "months" | "years") => setTermType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select term type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="months">Months</SelectItem>
                      <SelectItem value="years">Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <h3 className="text-md font-medium pt-2">Early Payment Option</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-1 block">
                    Lump Sum Payment ({currencySymbol})
                  </Label>
                  <Input
                    type="number"
                    value={earlyPayment}
                    onChange={(e) => setEarlyPayment(Number(e.target.value))}
                    min="0"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-1 block">
                    Payment at Month #
                  </Label>
                  <Input
                    type="number"
                    value={earlyPaymentMonth}
                    onChange={(e) => setEarlyPaymentMonth(Number(e.target.value))}
                    min="1"
                    max={termType === "years" ? loanTerm * 12 : loanTerm}
                  />
                </div>
              </div>
              
              <Button 
                onClick={calculateLoan} 
                className="w-full bg-primary hover:bg-primary/90"
              >
                Calculate Repayment
              </Button>
            </div>
          </CardContent>
        </Card>

        {results && (
          <>
            <Card className="finance-card mb-6">
              <CardContent className="p-4">
                <h2 className="text-lg font-medium mb-4">Payment Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly EMI:</span>
                    <span className="font-semibold">{currencySymbol}{results.emi.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Interest:</span>
                    <span className="font-semibold">{currencySymbol}{results.totalInterest.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Payment:</span>
                    <span className="font-semibold">{currencySymbol}{results.totalPayment.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loan Term:</span>
                    <span className="font-semibold">
                      {termType === "years" ? `${loanTerm} years (${loanTerm * 12} months)` : `${loanTerm} months`}
                    </span>
                  </div>
                </div>
                
                {results.earlyPayoffResults && (
                  <div className="mt-6 pt-4 border-t">
                    <h3 className="font-medium mb-2">With Early Payment</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Interest:</span>
                        <span className="font-semibold">{currencySymbol}{results.earlyPayoffResults.totalInterest.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Payment:</span>
                        <span className="font-semibold">{currencySymbol}{results.earlyPayoffResults.totalPayment.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Interest Saved:</span>
                        <span className="font-semibold text-green-600">{currencySymbol}{results.earlyPayoffResults.interestSaved.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time Saved:</span>
                        <span className="font-semibold text-green-600">{results.earlyPayoffResults.monthsSaved} months</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="finance-card mb-6">
              <CardContent className="p-4">
                <h2 className="text-lg font-medium mb-4">Loan Amortization</h2>
                <div className="h-80">
                  <ChartContainer
                    config={{
                      principal: { label: 'Principal Paid' },
                      interest: { label: 'Interest Paid' },
                      balance: { label: 'Remaining Balance' },
                      earlyBalance: { label: 'Balance with Early Payment' },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month"
                          label={{ value: 'Month', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis
                          tickFormatter={(value) => `${currencySymbol}${(value / 1000).toFixed(0)}k`}
                        />
                        <ChartTooltip
                          content={<ChartTooltipContent />}
                          formatter={(value) => [`${currencySymbol}${value.toLocaleString()}`, undefined]}
                          labelFormatter={(value) => `Month ${value}`}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="principal" name="Principal Paid" stroke="#8884d8" />
                        <Line type="monotone" dataKey="interest" name="Interest Paid" stroke="#82ca9d" />
                        <Line type="monotone" dataKey="balance" name="Remaining Balance" stroke="#ffc658" />
                        {results.earlyPayoffResults && (
                          <Line 
                            type="monotone" 
                            dataKey="earlyBalance" 
                            name="Balance with Early Payment" 
                            stroke="#ff7300" 
                            strokeDasharray="5 5"
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="finance-card">
              <CardContent className="p-4">
                <h2 className="text-lg font-medium mb-4">Amortization Schedule</h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>EMI</TableHead>
                        <TableHead>Principal</TableHead>
                        <TableHead>Interest</TableHead>
                        <TableHead>Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Show first 12 months + few around early payment if applicable */}
                      {results.schedule
                        .filter((_, index) => 
                          index < 12 || 
                          (results.earlyPayoffResults && 
                           Math.abs(index + 1 - earlyPaymentMonth) <= 2)
                        )
                        .map((entry) => (
                          <TableRow 
                            key={entry.month}
                            className={entry.month === earlyPaymentMonth ? "bg-yellow-50 dark:bg-yellow-900/20" : ""}
                          >
                            <TableCell>{entry.month}</TableCell>
                            <TableCell>{currencySymbol}{entry.emi.toFixed(2)}</TableCell>
                            <TableCell>{currencySymbol}{entry.principal.toFixed(2)}</TableCell>
                            <TableCell>{currencySymbol}{entry.interest.toFixed(2)}</TableCell>
                            <TableCell>{currencySymbol}{entry.balance.toFixed(2)}</TableCell>
                          </TableRow>
                        ))
                      }
                      {results.schedule.length > 12 && !results.earlyPayoffResults && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-2">
                            ... {results.schedule.length - 12} more months ...
                          </TableCell>
                        </TableRow>
                      )}
                      {results.schedule.length > 14 && (
                        <TableRow>
                          <TableCell>{results.schedule.length}</TableCell>
                          <TableCell>{currencySymbol}{results.schedule[results.schedule.length - 1].emi.toFixed(2)}</TableCell>
                          <TableCell>{currencySymbol}{results.schedule[results.schedule.length - 1].principal.toFixed(2)}</TableCell>
                          <TableCell>{currencySymbol}{results.schedule[results.schedule.length - 1].interest.toFixed(2)}</TableCell>
                          <TableCell>{currencySymbol}{results.schedule[results.schedule.length - 1].balance.toFixed(2)}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default LoanRepayment;
