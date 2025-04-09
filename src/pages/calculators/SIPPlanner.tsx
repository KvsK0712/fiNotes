
import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Info } from "lucide-react";

const SIPPlanner = () => {
  const { userData } = useAuth();
  const currencySymbol = userData?.currency || "$";
  
  const [monthlyAmount, setMonthlyAmount] = useState<number>(5000);
  const [expectedReturn, setExpectedReturn] = useState<number>(12);
  const [duration, setDuration] = useState<number>(10);
  const [durationType, setDurationType] = useState<"years" | "months">("years");
  const [goalAmount, setGoalAmount] = useState<number>(0);
  const [isGoalBased, setIsGoalBased] = useState<boolean>(false);
  
  const [result, setResult] = useState<{
    maturityAmount: number;
    totalInvested: number;
    interestEarned: number;
    monthlyAmountNeeded?: number;
    chartData: any[];
  } | null>(null);

  const calculateSIP = () => {
    // Convert duration to months
    const months = durationType === "years" ? duration * 12 : duration;
    const monthlyRate = expectedReturn / 100 / 12;
    
    let maturityAmount = 0;
    let monthlyAmountNeeded = 0;
    
    if (isGoalBased) {
      // Calculate monthly SIP needed to reach goal
      // M = P * r / ((1 + r)^n - 1) * (1 + r)
      // where M is the goal amount, solving for P (monthly SIP)
      const denominator = ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate));
      monthlyAmountNeeded = goalAmount * monthlyRate / denominator;
      maturityAmount = goalAmount;
    } else {
      // Calculate future value of SIP
      // FV = P × [(1 + r)^n – 1] × (1 + r)/r
      maturityAmount = monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate)) / monthlyRate;
    }
    
    const totalInvested = isGoalBased 
      ? monthlyAmountNeeded * months 
      : monthlyAmount * months;
    
    const interestEarned = maturityAmount - totalInvested;
    
    // Generate chart data
    const chartData = [];
    let yearlyInvested = 0;
    let yearlyValue = 0;
    
    for (let i = 1; i <= Math.ceil(months / 12); i++) {
      const monthsCompleted = Math.min(i * 12, months);
      const monthlySIP = isGoalBased ? monthlyAmountNeeded : monthlyAmount;
      yearlyInvested = monthlySIP * monthsCompleted;
      yearlyValue = monthlySIP * ((Math.pow(1 + monthlyRate, monthsCompleted) - 1) * (1 + monthlyRate)) / monthlyRate;
      
      chartData.push({
        year: i,
        invested: Math.round(yearlyInvested),
        value: Math.round(yearlyValue)
      });
    }
    
    setResult({
      maturityAmount,
      totalInvested,
      interestEarned,
      monthlyAmountNeeded: isGoalBased ? monthlyAmountNeeded : undefined,
      chartData
    });
  };

  const toggleCalculationMode = () => {
    setIsGoalBased(!isGoalBased);
    setResult(null);
  };

  return (
    <PageLayout title="SIP Planner" showBackButton>
      <div className="finance-container animate-fade-in">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">SIP Calculator</h2>
              <Button variant="outline" onClick={toggleCalculationMode}>
                {isGoalBased ? "Switch to Regular SIP" : "Switch to Goal-based"}
              </Button>
            </div>
            
            <div className="space-y-4">
              {isGoalBased ? (
                <div>
                  <Label className="text-sm font-medium mb-1 block">
                    Target Amount ({currencySymbol})
                  </Label>
                  <Input
                    type="number"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(Number(e.target.value))}
                    min="0"
                  />
                </div>
              ) : (
                <div>
                  <Label className="text-sm font-medium mb-1 block">
                    Monthly SIP Amount ({currencySymbol})
                  </Label>
                  <Input
                    type="number"
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                    min="0"
                  />
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium mb-1 block">
                  Expected Annual Return (%)
                </Label>
                <Input
                  type="number"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  step="0.1"
                  min="0"
                  max="100"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-1 block">
                    Duration
                  </Label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min="1"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-1 block">
                    Duration Type
                  </Label>
                  <Select value={durationType} onValueChange={(value: "months" | "years") => setDurationType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="months">Months</SelectItem>
                      <SelectItem value="years">Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                onClick={calculateSIP} 
                className="w-full bg-primary hover:bg-primary/90"
              >
                Calculate
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <>
            <Card className="finance-card mb-6">
              <CardContent className="p-4">
                <h2 className="text-lg font-medium mb-4">SIP Summary</h2>
                
                <div className="space-y-3">
                  {isGoalBased && result.monthlyAmountNeeded && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Required Monthly SIP:</span>
                      <span className="font-semibold">{currencySymbol}{result.monthlyAmountNeeded.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Maturity Amount:</span>
                    <span className="font-semibold">{currencySymbol}{result.maturityAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Investment:</span>
                    <span className="font-semibold">{currencySymbol}{result.totalInvested.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interest Earned:</span>
                    <span className="font-semibold">{currencySymbol}{result.interestEarned.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Investment Period:</span>
                    <span className="font-semibold">
                      {durationType === "years" ? `${duration} years (${duration * 12} months)` : `${duration} months`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="finance-card mb-6">
              <CardContent className="p-4">
                <h2 className="text-lg font-medium mb-4">Growth Projection</h2>
                <div className="h-80">
                  <ChartContainer
                    config={{
                      invested: { label: 'Total Investment' },
                      value: { label: 'Value' },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={result.chartData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="year"
                          label={{ value: `Year${durationType === "months" ? ' (Approx)' : ''}`, position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis
                          tickFormatter={(value) => `${currencySymbol}${(value).toLocaleString()}`}
                        />
                        <ChartTooltip
                          content={<ChartTooltipContent />}
                          formatter={(value) => [`${currencySymbol}${value.toLocaleString()}`, undefined]}
                          labelFormatter={(value) => `Year ${value}`}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="invested" name="Invested Amount" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="value" name="Projected Value" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="finance-card">
              <CardContent className="p-4">
                <h2 className="text-lg font-medium mb-4">Year-by-Year Breakdown</h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Year</TableHead>
                        <TableHead>Total Investment</TableHead>
                        <TableHead>Projected Value</TableHead>
                        <TableHead>Wealth Gained</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.chartData.map((data, index) => (
                        <TableRow key={index}>
                          <TableCell>{data.year}</TableCell>
                          <TableCell>{currencySymbol}{data.invested.toLocaleString()}</TableCell>
                          <TableCell>{currencySymbol}{data.value.toLocaleString()}</TableCell>
                          <TableCell>{currencySymbol}{(data.value - data.invested).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
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

export default SIPPlanner;
