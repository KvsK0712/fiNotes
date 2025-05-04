
import { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
}

const STORAGE_KEY = "fi_notes_transactions";

const TrackerPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const { userData } = useAuth();
  const currencySymbol = userData?.currency || "$";

  // Load transactions from localStorage on component mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem(STORAGE_KEY);
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
      setIsFirstVisit(false);
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (!isFirstVisit || transactions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions, isFirstVisit]);

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
              <p className="text-lg font-semibold text-green-600">{currencySymbol}{totalIncome}</p>
            </CardContent>
          </Card>
          
          <Card className="finance-card">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Expense</p>
              <p className="text-lg font-semibold text-red-600">{currencySymbol}{totalExpense}</p>
            </CardContent>
          </Card>
          
          <Card className="finance-card">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
              <p className="text-lg font-semibold">{currencySymbol}{totalIncome - totalExpense}</p>
            </CardContent>
          </Card>
        </div>

        {/* Empty state message */}
        {transactions.length === 0 && (
          <Card className="mb-6">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-medium mb-2">Welcome to the Finance Tracker!</h3>
              <p className="text-gray-500 mb-4">
                Add your first income or expense to get started tracking your finances.
              </p>
              <Link to="/tracker/add?type=expense">
                <Button className="gap-1">
                  <Plus size={16} />
                  Add Transaction
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Transactions List - only show if there are transactions */}
        {transactions.length > 0 && (
          <Tabs defaultValue="all">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              
              <div className="flex flex-row justify-center items-center gap-2">
                <Link to="/tracker/add?type=expense">
                  <Button size="sm" variant="destructive" className="gap-1">
                    <ArrowDown size={16} />
                    Add Expense
                  </Button>
                </Link>
                <Link to="/tracker/add?type=income">
                  <Button size="sm" variant="outline" className="gap-1 bg-green-600 text-white hover:bg-green-700">
                    <ArrowUp size={16} />
                    Add Income
                  </Button>
                </Link>
              </div>

              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="income">Income</TabsTrigger>
                <TabsTrigger value="expense">Expense</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="mt-0">
              <TransactionList transactions={transactions} currencySymbol={currencySymbol} />
            </TabsContent>
            
            <TabsContent value="income" className="mt-0">
              <TransactionList 
                transactions={transactions.filter(t => t.type === 'income')}
                currencySymbol={currencySymbol}
              />
            </TabsContent>
            
            <TabsContent value="expense" className="mt-0">
              <TransactionList 
                transactions={transactions.filter(t => t.type === 'expense')}
                currencySymbol={currencySymbol}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageLayout>
  );
};

const TransactionList = ({ transactions, currencySymbol }: { transactions: Transaction[], currencySymbol: string }) => {
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
              {transaction.type === "income" ? "+" : "-"}{currencySymbol}{transaction.amount}
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
