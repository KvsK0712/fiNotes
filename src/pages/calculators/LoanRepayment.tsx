import { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash } from "lucide-react";
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

type EarlyPayment = {
  amount: number;
  month: number;
  error?: string;
};

const LoanRepayment = () => {
  const { userData } = useAuth();
  const currencySymbol = userData?.currency || "$";
  
  const [loanAmount, setLoanAmount] = useState<number>(100000);
  const [interestRate, setInterestRate] = useState<number>(10);
  const [loanTerm, setLoanTerm] = useState<number>(12);
  const [termType, setTermType] = useState<"months" | "years">("months");
  const [loanType, setLoanType] = useState<"personal" | "auto" | "education" | "home">("personal");
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const [earlyPayments, setEarlyPayments] = useState<EarlyPayment[]>([
    { amount: 0, month: 6 }
  ]);
  
  const [results, setResults] = useState<{
    emi: number;
    totalPayment: number;
    totalInterest: number;
    monthlyRate: number;
    schedule: Array<{
      month: number;
      emi: number;
      principal: number;
      interest: number;
      balance: number;
      extraPayment?: number;
    }>;
    earlyPayoffResults?: {
      totalPayment: number;
      totalInterest: number;
      monthsSaved: number;
      interestSaved: number;
    };
  } | null>(null);

  useEffect(() => {
    validateEarlyPayments();
  }, [earlyPayments, loanAmount, interestRate, loanTerm, termType]);
  
  const addEarlyPayment = () => {
    setEarlyPayments([...earlyPayments, { amount: 0, month: Math.min(earlyPayments.length * 3 + 6, (termType === "years" ? loanTerm * 12 : loanTerm) - 1) }]);
  };

  const removeEarlyPayment = (index: number) => {
    setEarlyPayments(earlyPayments.filter((_, i) => i !== index));
  };

  const updateEarlyPayment = (index: number, field: keyof EarlyPayment, value: number) => {
    const updatedPayments = [...earlyPayments];
    updatedPayments[index] = { ...updatedPayments[index], [field]: value };
    setEarlyPayments(updatedPayments);
    setValidationError(null);
  };

  const validateEarlyPayments = () => {
    setValidationError(null);
    
    if (loanAmount <= 0 || interestRate <= 0 || loanTerm <= 0) {
      return;
    }
    
    const months = termType === "years" ? loanTerm * 12 : loanTerm;
    const monthlyRate = interestRate / 100 / 12;
    const emiValue = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months) / 
                    (Math.pow(1 + monthlyRate, months) - 1);

    const sortedPayments = [...earlyPayments]
      .filter(payment => payment.amount > 0 && payment.month > 0 && payment.month <= months)
      .sort((a, b) => a.month - b.month);
    
    if (sortedPayments.length === 0) return;
    
    let remainingBalance = loanAmount;
    let currentMonth = 1;
    let updatedPayments = [...earlyPayments];
    let hasError = false;
    
    for (let i = 0; i < sortedPayments.length; i++) {
      const payment = sortedPayments[i];
      const paymentIndex = earlyPayments.findIndex(p => p.month === payment.month && p.amount === payment.amount);
      
      while (currentMonth < payment.month) {
        const interestForMonth = remainingBalance * monthlyRate;
        const principalForMonth = emiValue - interestForMonth;
        remainingBalance -= principalForMonth;
        currentMonth++;
        
        if (remainingBalance <= 0) {
          if (paymentIndex !== -1) {
            updatedPayments[paymentIndex] = { 
              ...updatedPayments[paymentIndex], 
              error: `Loan will be fully paid by month ${currentMonth - 1}, before this payment` 
            };
            hasError = true;
          }
          break;
        }
      }
      
      if (remainingBalance <= 0) continue;
      
      if (payment.amount > remainingBalance) {
        if (paymentIndex !== -1) {
          updatedPayments[paymentIndex] = { 
            ...updatedPayments[paymentIndex], 
            error: `Payment exceeds remaining balance of ${currencySymbol}${remainingBalance.toFixed(2)}` 
          };
          hasError = true;
        }
      }
      
      remainingBalance -= payment.amount;
      
      if (remainingBalance <= 0) {
        for (let j = i + 1; j < sortedPayments.length; j++) {
          const laterPayment = sortedPayments[j];
          const laterIndex = earlyPayments.findIndex(p => p.month === laterPayment.month && p.amount === laterPayment.amount);
          
          if (laterIndex !== -1) {
            updatedPayments[laterIndex] = { 
              ...updatedPayments[laterIndex], 
              error: `Loan will be fully paid by month ${payment.month}, before this payment` 
            };
            hasError = true;
          }
        }
        break;
      }
    }
    
    if (hasError) {
      setEarlyPayments(updatedPayments);
      setValidationError("Some early payments need adjustment. See highlighted fields for details.");
    }
  };

  const calculateLoan = () => {
    setValidationError(null);
    const clearedErrorPayments = earlyPayments.map(payment => ({
      ...payment,
      error: undefined
    }));
    setEarlyPayments(clearedErrorPayments);
    
    const months = termType === "years" ? loanTerm * 12 : loanTerm;
    
    const principal = loanAmount;
    const monthlyRate = interestRate / 100 / 12;
    
    const emiValue = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    
    let totalPayment = emiValue * months;
    let totalInterest = totalPayment - principal;
    
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
    
    let earlyPayoffResults;
    
    if (earlyPayments.some(payment => payment.amount > 0 && payment.month > 0 && payment.month < months)) {
      const sortedEarlyPayments = [...earlyPayments]
        .filter(payment => payment.amount > 0 && payment.month > 0 && payment.month <= months)
        .sort((a, b) => a.month - b.month);
      
      let earlySchedule = [];
      let earlyRemainingBalance = principal;
      let totalEarlyPayment = 0;
      let totalEarlyInterest = 0;
      let lastMonth = 0;
      
      for (let i = 1; i <= months; i++) {
        const interestForMonth = earlyRemainingBalance * monthlyRate;
        const principalForMonth = emiValue - interestForMonth;
        
        const earlyPayment = sortedEarlyPayments.find(payment => payment.month === i);
        let extraPayment = 0;
        
        if (earlyPayment) {
          extraPayment = earlyPayment.amount;
          earlyRemainingBalance -= extraPayment;
          totalEarlyPayment += extraPayment;
        }
        
        if (earlyRemainingBalance <= 0) {
          const finalPayment = principalForMonth + interestForMonth + earlyRemainingBalance;
          totalEarlyPayment += finalPayment;
          totalEarlyInterest += interestForMonth;
          earlyRemainingBalance = 0;
          lastMonth = i;
          
          earlySchedule.push({
            month: i,
            emi: emiValue,
            principal: principalForMonth,
            interest: interestForMonth,
            balance: 0,
            extraPayment: extraPayment
          });
          
          break;
        } else {
          earlyRemainingBalance -= principalForMonth;
          totalEarlyPayment += emiValue;
          totalEarlyInterest += interestForMonth;
          
          earlySchedule.push({
            month: i,
            emi: emiValue,
            principal: principalForMonth,
            interest: interestForMonth,
            balance: Math.max(0, earlyRemainingBalance),
            extraPayment: extraPayment
          });
        }
        
        lastMonth = i;
      }
      
      earlyPayoffResults = {
        totalPayment: totalEarlyPayment,
        totalInterest: totalEarlyInterest,
        monthsSaved: months - lastMonth,
        interestSaved: totalInterest - totalEarlyInterest
      };
      
      schedule.length = 0;
      schedule.push(...earlySchedule);
    }
    
    setResults({
      emi: emiValue,
      totalPayment: earlyPayoffResults?.totalPayment || totalPayment,
      totalInterest: earlyPayoffResults?.totalInterest || totalInterest,
      monthlyRate,
      schedule,
      earlyPayoffResults
    });
  };

  const prepareChartData = () => {
    if (!results) return [];
    
    return results.schedule.filter((_, index) => index % 3 === 0 || index === results.schedule.length - 1).map(entry => {
      const cumulativeInterest = results.schedule
        .filter(item => item.month <= entry.month)
        .reduce((sum, item) => sum + item.interest, 0);
      
      const cumulativeExtraPayments = results.schedule
        .filter(item => item.month <= entry.month && item.extraPayment)
        .reduce((sum, item) => sum + (item.extraPayment || 0), 0);
      
      return {
        month: entry.month,
        principal: loanAmount - entry.balance - cumulativeExtraPayments,
        interest: cumulativeInterest,
        balance: entry.balance,
      };
    });
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
              
              {validationError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}
              
              <h3 className="text-md font-medium pt-2">Early Payment Options</h3>
              
              {earlyPayments.map((payment, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-end border-b pb-2 border-gray-100 dark:border-gray-800">
                  <div className="col-span-5">
                    <Label className="text-sm font-medium mb-1 block">
                      Payment Amount ({currencySymbol})
                    </Label>
                    <Input
                      type="number"
                      value={payment.amount}
                      onChange={(e) => updateEarlyPayment(index, 'amount', Number(e.target.value))}
                      min="0"
                      className={payment.error ? "border-red-500" : ""}
                    />
                  </div>
                  
                  <div className="col-span-5">
                    <Label className="text-sm font-medium mb-1 block">
                      At Month #
                    </Label>
                    <Input
                      type="number"
                      value={payment.month}
                      onChange={(e) => updateEarlyPayment(index, 'month', Number(e.target.value))}
                      min="1"
                      max={termType === "years" ? loanTerm * 12 : loanTerm}
                      className={payment.error ? "border-red-500" : ""}
                    />
                    {payment.error && (
                      <p className="text-xs text-red-500 mt-1">{payment.error}</p>
                    )}
                  </div>
                  
                  <div className="col-span-2 flex justify-end">
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEarlyPayment(index)}
                      className="h-10 w-10 rounded-full"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                onClick={addEarlyPayment}
                className="w-full"
              >
                Add Another Early Payment
              </Button>
              
              <Button 
                onClick={calculateLoan} 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={!!validationError}
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
                    <h3 className="font-medium mb-2">With Early Payments</h3>
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
                        <TableHead>Extra Payment</TableHead>
                        <TableHead>Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.schedule
                        .filter((entry, index) => {
                          if (index < 12) return true;
                          if (index === results.schedule.length - 1) return true;
                          const hasNearbyEarlyPayment = earlyPayments.some(payment => 
                            Math.abs(entry.month - payment.month) <= 1 && payment.amount > 0
                          );
                          return hasNearbyEarlyPayment;
                        })
                        .map((entry) => (
                          <TableRow 
                            key={entry.month}
                            className={entry.extraPayment ? "bg-yellow-50 dark:bg-yellow-900/20" : ""}
                          >
                            <TableCell>{entry.month}</TableCell>
                            <TableCell>{currencySymbol}{entry.emi.toFixed(2)}</TableCell>
                            <TableCell>{currencySymbol}{entry.principal.toFixed(2)}</TableCell>
                            <TableCell>{currencySymbol}{entry.interest.toFixed(2)}</TableCell>
                            <TableCell>
                              {entry.extraPayment ? `${currencySymbol}${entry.extraPayment.toFixed(2)}` : '-'}
                            </TableCell>
                            <TableCell>{currencySymbol}{entry.balance.toFixed(2)}</TableCell>
                          </TableRow>
                        ))
                      }
                      {results.schedule.length > 14 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-2 italic text-gray-500">
                            {results.schedule.length > 14 && results.schedule.filter((entry, index) => 
                              index >= 12 && 
                              index < results.schedule.length - 1 && 
                              !earlyPayments.some(payment => Math.abs(entry.month - payment.month) <= 1 && payment.amount > 0)
                            ).length > 0 ? '... more months ...' : ''}
                          </TableCell>
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
