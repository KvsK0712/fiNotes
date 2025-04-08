
import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const EMICalculator = () => {
  const [principalAmount, setPrincipalAmount] = useState<number>(100000);
  const [interestRate, setInterestRate] = useState<number>(10);
  const [loanTerm, setLoanTerm] = useState<number>(12);
  const [emi, setEmi] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const calculateEMI = () => {
    // EMI calculation formula: [P x R x (1+R)^N]/[(1+R)^N-1]
    // where P = Principal, R = Monthly interest rate, N = Number of months
    const principal = principalAmount;
    const monthlyRate = interestRate / 100 / 12;
    const months = loanTerm;
    
    const emiValue = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    
    const totalPayment = emiValue * months;
    const totalInterestValue = totalPayment - principal;
    
    setEmi(emiValue);
    setTotalInterest(totalInterestValue);
    setTotalAmount(totalPayment);
  };

  return (
    <PageLayout title="EMI Calculator">
      <div className="finance-container animate-fade-in">
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4">Loan Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Loan Amount
                </label>
                <Input
                  type="number"
                  value={principalAmount}
                  onChange={(e) => setPrincipalAmount(Number(e.target.value))}
                  className="mb-2"
                />
                <Slider
                  value={[principalAmount]}
                  min={1000}
                  max={10000000}
                  step={1000}
                  onValueChange={(value) => setPrincipalAmount(value[0])}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>₹1K</span>
                  <span>₹1Cr</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Interest Rate (% per annum)
                </label>
                <Input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  step="0.1"
                  className="mb-2"
                />
                <Slider
                  value={[interestRate]}
                  min={1}
                  max={36}
                  step={0.1}
                  onValueChange={(value) => setInterestRate(value[0])}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1%</span>
                  <span>36%</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Loan Term (months)
                </label>
                <Input
                  type="number"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(Number(e.target.value))}
                  className="mb-2"
                />
                <Slider
                  value={[loanTerm]}
                  min={1}
                  max={360}
                  step={1}
                  onValueChange={(value) => setLoanTerm(value[0])}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 month</span>
                  <span>30 years</span>
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
                  <span className="font-semibold">₹{emi.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interest:</span>
                  <span className="font-semibold">₹{totalInterest.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-semibold">₹{totalAmount.toFixed(2)}</span>
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
