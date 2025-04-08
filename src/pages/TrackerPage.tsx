
import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
}

const TrackerPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      title: "Salary",
      amount: 5000,
      type: "income",
      category: "Salary",
      date: "2025-04-01",
    },
    {
      id: "2",
      title: "Rent",
      amount: 1200,
      type: "expense",
      category: "Housing",
      date: "2025-04-03",
    },
    {
      id: "3",
      title: "Groceries",
      amount: 85,
      type: "expense",
      category: "Food",
      date: "2025-04-05",
    },
    {
      id: "4",
      title: "Freelance Project",
      amount: 750,
      type: "income",
      category: "Freelance",
      date: "2025-04-07",
    },
  ]);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <PageLayout title="Finance Tracker">
      <div className="finance-container animate-fade-in">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="finance-card">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Income</p>
              <p className="text-lg font-semibold text-green-600">${totalIncome}</p>
            </CardContent>
          </Card>
          
          <Card className="finance-card">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Expense</p>
              <p className="text-lg font-semibold text-red-600">${totalExpense}</p>
            </CardContent>
          </Card>
          
          <Card className="finance-card">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
              <p className="text-lg font-semibold">${totalIncome - totalExpense}</p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        <Tabs defaultValue="all">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expense">Expense</TabsTrigger>
            </TabsList>
            
            <Link to="/tracker/add">
              <Button size="sm" className="gap-1">
                <Plus size={16} />
                Add
              </Button>
            </Link>
          </div>
          
          <TabsContent value="all" className="mt-0">
            <TransactionList transactions={transactions} />
          </TabsContent>
          
          <TabsContent value="income" className="mt-0">
            <TransactionList 
              transactions={transactions.filter(t => t.type === 'income')} 
            />
          </TabsContent>
          
          <TabsContent value="expense" className="mt-0">
            <TransactionList 
              transactions={transactions.filter(t => t.type === 'expense')} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

const TransactionList = ({ transactions }: { transactions: Transaction[] }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No transactions found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <Card key={transaction.id} className="finance-card card-hover">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className={`p-2 rounded-full mr-3 ${
                transaction.type === "income" 
                  ? "bg-green-100 text-green-600" 
                  : "bg-red-100 text-red-600"
              }`}>
                {transaction.type === "income" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              </div>
              <div>
                <p className="font-medium">{transaction.title}</p>
                <p className="text-xs text-gray-500">{transaction.category} • {formatDate(transaction.date)}</p>
              </div>
            </div>
            <span className={`font-semibold ${
              transaction.type === "income" ? "text-green-600" : "text-red-600"
            }`}>
              {transaction.type === "income" ? "+" : "-"}${transaction.amount}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export default TrackerPage;
