
import { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

// Types
interface Budget {
  category: string;
  amount: number;
}

interface MonthlyBudget {
  [month: string]: {
    [category: string]: number;
  };
}

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
}

// Storage keys
const BUDGETS_STORAGE_KEY = "fi_notes_budgets";
const TRANSACTIONS_STORAGE_KEY = "fi_notes_transactions";

// Expense categories
const expenseCategories = [
  "Housing", "Food", "Transport", "Utilities", "Entertainment", 
  "Healthcare", "Education", "Shopping", "Personal Care", "Other"
];

const BudgetPage = () => {
  const { userData } = useAuth();
  const currencySymbol = userData?.currency || "$";

  // Current month in YYYY-MM format
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const [monthlyBudgets, setMonthlyBudgets] = useState<MonthlyBudget>({});
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newCategory, setNewCategory] = useState<string>("");
  const [newAmount, setNewAmount] = useState<string>("");
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  
  // Load budgets and transactions from localStorage
  useEffect(() => {
    const savedBudgets = localStorage.getItem(BUDGETS_STORAGE_KEY);
    const savedTransactions = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    
    if (savedBudgets) {
      const parsedBudgets = JSON.parse(savedBudgets);
      setMonthlyBudgets(parsedBudgets);
      
      // Get current month's budgets
      if (parsedBudgets[currentMonth]) {
        const currentBudgets: Budget[] = Object.entries(parsedBudgets[currentMonth]).map(
          ([category, amount]) => ({
            category,
            amount: amount as number,
          })
        );
        setBudgets(currentBudgets);
      }
    }
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, [currentMonth]);
  
  // Add or update a budget
  const handleSaveBudget = () => {
    if (!newCategory || !newAmount || parseFloat(newAmount) <= 0) {
      toast.error("Please select a category and enter a valid amount");
      return;
    }
    
    const amount = parseFloat(newAmount);
    
    // Check if we're editing or adding
    if (editingBudget) {
      // Update existing budget
      const updatedBudgets = budgets.map(budget => 
        budget.category === editingBudget.category 
          ? { ...budget, amount } 
          : budget
      );
      
      setBudgets(updatedBudgets);
    } else {
      // Check if category already exists
      if (budgets.some(budget => budget.category === newCategory)) {
        toast.error("Budget for this category already exists");
        return;
      }
      
      // Add new budget
      const newBudget: Budget = {
        category: newCategory,
        amount,
      };
      
      setBudgets([...budgets, newBudget]);
    }
    
    // Update in storage
    const updatedMonthlyBudgets = { ...monthlyBudgets };
    if (!updatedMonthlyBudgets[currentMonth]) {
      updatedMonthlyBudgets[currentMonth] = {};
    }
    
    const categoryToUpdate = editingBudget ? editingBudget.category : newCategory;
    updatedMonthlyBudgets[currentMonth][categoryToUpdate] = amount;
    
    setMonthlyBudgets(updatedMonthlyBudgets);
    localStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(updatedMonthlyBudgets));
    
    // Reset form
    setNewCategory("");
    setNewAmount("");
    setEditingBudget(null);
    
    toast.success(`Budget ${editingBudget ? "updated" : "added"} successfully`);
  };
  
  // Calculate spent amount for each category in the current month
  const calculateSpentAmount = (category: string): number => {
    const currentMonthStart = `${currentMonth}-01`;
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStart = nextMonth.toISOString().slice(0, 8) + "01";
    
    return transactions
      .filter(
        t => 
          t.type === "expense" && 
          t.category === category && 
          t.date >= currentMonthStart && 
          t.date < nextMonthStart
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };
  
  // Get progress percentage
  const getProgressPercentage = (budget: Budget): number => {
    const spent = calculateSpentAmount(budget.category);
    return Math.min(Math.round((spent / budget.amount) * 100), 100);
  };
  
  // Get progress color
  const getProgressColor = (budget: Budget): string => {
    const percentage = getProgressPercentage(budget);
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  // Handle edit budget
  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setNewCategory(budget.category);
    setNewAmount(budget.amount.toString());
  };

  return (
    <PageLayout title="Budget Planner" showBackButton={true}>
      <div className="finance-container animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Monthly Budgets</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-1" onClick={() => {
                setEditingBudget(null);
                setNewCategory("");
                setNewAmount("");
              }}>
                <PlusCircle size={16} />
                Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingBudget ? "Edit" : "Add"} Budget</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  {editingBudget ? (
                    <Input id="category" value={newCategory} readOnly />
                  ) : (
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Budget Amount ({currencySymbol})</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={handleSaveBudget}>Save</Button>
                  </DialogClose>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {budgets.length === 0 ? (
          <Card className="mb-4">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-medium mb-2">No Budgets Yet</h3>
              <p className="text-gray-500 mb-4">
                Start creating budgets to track your spending by category.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => {
              const spent = calculateSpentAmount(budget.category);
              const remaining = budget.amount - spent;
              const percentage = getProgressPercentage(budget);
              
              return (
                <Card key={budget.category} className="card-hover">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium">{budget.category}</h3>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span>Budget: {currencySymbol}{budget.amount}</span>
                          <span 
                            className={remaining < 0 ? "text-red-500 font-medium" : ""}
                          >
                            Remaining: {currencySymbol}{remaining.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEditBudget(budget)}
                      >
                        <Edit2 size={16} />
                      </Button>
                    </div>
                    
                    <div className="mt-2">
                      <Progress 
                        value={percentage} 
                        className="h-2"
                        indicatorClassName={getProgressColor(budget)}
                      />
                      <div className="flex justify-between mt-1 text-xs text-gray-600 dark:text-gray-400">
                        <span>Spent: {currencySymbol}{spent.toFixed(2)}</span>
                        <span>{percentage}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default BudgetPage;
