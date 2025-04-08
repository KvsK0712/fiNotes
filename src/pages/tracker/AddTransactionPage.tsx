
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

const expenseCategories = [
  "Housing", "Food", "Transport", "Utilities", "Entertainment", 
  "Healthcare", "Education", "Shopping", "Personal Care", "Other"
];

const incomeCategories = [
  "Salary", "Freelance", "Business", "Investment", "Gift", "Other"
];

const AddTransactionPage = () => {
  const navigate = useNavigate();
  const [type, setType] = useState<"income" | "expense">("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!title || !amount || !category || !date) {
      toast.error("Please fill in all fields");
      return;
    }

    // In a real app, we'd save this to local storage or IndexedDB
    const newTransaction = {
      id: Date.now().toString(),
      title,
      amount: parseFloat(amount),
      type,
      category,
      date,
    };

    console.log("Adding transaction:", newTransaction);
    
    // Show success message
    toast.success(`${type === 'income' ? 'Income' : 'Expense'} added successfully!`);
    
    // Return to tracker page
    navigate("/tracker");
  };

  return (
    <PageLayout title="Add Transaction">
      <div className="finance-container animate-fade-in">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={type === "expense" ? "default" : "outline"}
                  className={type === "expense" ? "bg-red-600 hover:bg-red-700" : ""}
                  onClick={() => setType("expense")}
                >
                  Expense
                </Button>
                <Button
                  type="button"
                  variant={type === "income" ? "default" : "outline"}
                  className={type === "income" ? "bg-green-600 hover:bg-green-700" : ""}
                  onClick={() => setType("income")}
                >
                  Income
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(type === "income" ? incomeCategories : expenseCategories).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              
              <Button type="submit" className="w-full">
                Save Transaction
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default AddTransactionPage;
