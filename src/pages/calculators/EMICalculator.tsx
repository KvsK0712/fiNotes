
import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EMICalculator = () => {
  const { userData } = useAuth();
  const currencySymbol = userData?.currency || "$";
  
  const [principalAmount, setPrincipalAmount] = useState<number>(100000);
  const [interestRate, setInterestRate] = useState<number>(10);
  const [loanTerm, setLoanTerm] = useState<number>(12);
  const [termType, setTermType] = useState<"months" | "years">("months");
  const [emi, setEmi] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const calculateEMI = () => {
    // Convert loan term to months if it's in years
    const months = termType === "years" ? loanTerm * 12 : loanTerm;
    
    // EMI calculation formula: [P x R x (1+R)^N]/[(1+R)^N-1]
    // where P = Principal, R = Monthly interest rate, N = Number of months
    const principal = principalAmount;
    const monthlyRate = interestRate / 100 / 12;
    
    const emiValue = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    
    const totalPayment = emiValue * months;
    const totalInterestValue = totalPayment - principal;
    
    setEmi(emiValue);
    setTotalInterest(totalInterestValue);
    setTotalAmount(totalPayment);
  };

  return (
    <PageLayout title="EMI Calculator" showBackButton={true}>
      <div className="finance-container animate-fade-in">
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4">Loan Details</h2>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-1 block">
                  Loan Amount ({currencySymbol})
                </Label>
                <Input
                  type="number"
                  value={principalAmount}
                  onChange={(e) => setPrincipalAmount(Number(e.target.value))}
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
              
              <Button 
                onClick={calculateEMI} 
                className="w-full bg-primary hover:bg-primary/90"
              >
                Calculate EMI
              </Button>
            </div>
          </CardContent>
        </Card>

        {emi > 0 && (
          <Card className="finance-card">
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-4">Payment Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly EMI:</span>
                  <span className="font-semibold">{currencySymbol}{emi.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interest:</span>
                  <span className="font-semibold">{currencySymbol}{totalInterest.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-semibold">{currencySymbol}{totalAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Loan Term:</span>
                  <span className="font-semibold">
                    {termType === "years" ? `${loanTerm} years (${loanTerm * 12} months)` : `${loanTerm} months`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default EMICalculator;
