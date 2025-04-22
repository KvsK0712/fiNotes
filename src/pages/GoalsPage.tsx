
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
import { Progress } from "@/components/ui/progress";
import { PlusCircle, Target, Edit2, PiggyBank } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

// Types
interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string | null;
  status: "not_started" | "in_progress" | "completed";
  createdAt: string;
}

// Storage keys
const GOALS_STORAGE_KEY = "fi_notes_goals";

const GoalsPage = () => {
  const { userData } = useAuth();
  const currencySymbol = userData?.currency || "$";

  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [title, setTitle] = useState<string>("");
  const [targetAmount, setTargetAmount] = useState<string>("");
  const [savedAmount, setSavedAmount] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [addingContribution, setAddingContribution] = useState<SavingsGoal | null>(null);
  const [contributionAmount, setContributionAmount] = useState<string>("");

  // Load goals from localStorage
  useEffect(() => {
    const savedGoals = localStorage.getItem(GOALS_STORAGE_KEY);
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  // Save goals to localStorage
  const saveGoals = (updatedGoals: SavingsGoal[]) => {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(updatedGoals));
    setGoals(updatedGoals);
  };

  // Add or update a goal
  const handleSaveGoal = () => {
    if (!title || !targetAmount || parseFloat(targetAmount) <= 0) {
      toast.error("Please enter a title and valid target amount");
      return;
    }

    // Calculate status
    let savedAmountValue = parseFloat(savedAmount || "0");
    const targetAmountValue = parseFloat(targetAmount);
    
    let status: SavingsGoal["status"] = "not_started";
    if (savedAmountValue > 0) {
      status = savedAmountValue >= targetAmountValue ? "completed" : "in_progress";
    }

    if (editingGoal) {
      // Update existing goal
      const updatedGoals = goals.map(goal => 
        goal.id === editingGoal.id
          ? { 
              ...goal, 
              title, 
              targetAmount: targetAmountValue,
              savedAmount: savedAmountValue,
              deadline: deadline || null,
              status
            } 
          : goal
      );
      
      saveGoals(updatedGoals);
      toast.success("Savings goal updated successfully");
    } else {
      // Add new goal
      const newGoal: SavingsGoal = {
        id: Date.now().toString(),
        title,
        targetAmount: targetAmountValue,
        savedAmount: savedAmountValue,
        deadline: deadline || null,
        status,
        createdAt: new Date().toISOString()
      };
      
      saveGoals([...goals, newGoal]);
      toast.success("Savings goal added successfully");
    }
    
    // Reset form
    setTitle("");
    setTargetAmount("");
    setSavedAmount("");
    setDeadline("");
    setEditingGoal(null);
  };

  // Handle edit goal
  const handleEditGoal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setTargetAmount(goal.targetAmount.toString());
    setSavedAmount(goal.savedAmount.toString());
    setDeadline(goal.deadline || "");
  };

  // Handle contribution
  const handleAddContribution = () => {
    if (!addingContribution || !contributionAmount || parseFloat(contributionAmount) <= 0) {
      toast.error("Please enter a valid contribution amount");
      return;
    }

    const amount = parseFloat(contributionAmount);
    const newSavedAmount = addingContribution.savedAmount + amount;
    const status: SavingsGoal["status"] = 
      newSavedAmount >= addingContribution.targetAmount 
        ? "completed" 
        : "in_progress";

    const updatedGoals = goals.map(goal => 
      goal.id === addingContribution.id
        ? { ...goal, savedAmount: newSavedAmount, status }
        : goal
    );

    saveGoals(updatedGoals);
    setAddingContribution(null);
    setContributionAmount("");
    toast.success(`${currencySymbol}${amount} added to your saving goal`);
  };

  // Get progress percentage
  const getProgressPercentage = (goal: SavingsGoal): number => {
    return Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100);
  };

  // Format date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "No deadline";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <PageLayout title="Savings Goals" showBackButton={true}>
      <div className="finance-container animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Your Financial Goals</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-1" onClick={() => {
                setEditingGoal(null);
                setTitle("");
                setTargetAmount("");
                setSavedAmount("");
                setDeadline("");
              }}>
                <PlusCircle size={16} />
                Create Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingGoal ? "Edit" : "Create"} Savings Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Buy a Laptop"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Target Amount ({currencySymbol})</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="Enter target amount"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="savedAmount">Already Saved ({currencySymbol})</Label>
                  <Input
                    id="savedAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={savedAmount}
                    onChange={(e) => setSavedAmount(e.target.value)}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deadline">Target Date (Optional)</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={handleSaveGoal}>Save</Button>
                  </DialogClose>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {goals.length === 0 ? (
          <Card className="mb-4">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <Target size={40} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Savings Goals Yet</h3>
              <p className="text-gray-500 mb-4">
                Start creating savings goals to track your financial progress.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const percentage = getProgressPercentage(goal);
              const remaining = goal.targetAmount - goal.savedAmount;
              
              return (
                <Card key={goal.id} className="card-hover">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className="font-medium">{goal.title}</h3>
                        <p className="text-xs text-gray-500">
                          {goal.deadline ? `Target date: ${formatDate(goal.deadline)}` : "No deadline"}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEditGoal(goal)}
                      >
                        <Edit2 size={16} />
                      </Button>
                    </div>
                    
                    <div className="mt-3">
                      <Progress value={percentage} className="h-2" />
                      <div className="flex justify-between mt-1 text-xs text-gray-600">
                        <span>{percentage}% complete</span>
                        <span>
                          {currencySymbol}{goal.savedAmount} of {currencySymbol}{goal.targetAmount}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-gray-600">Remaining: </span>
                        <span className="font-medium">{currencySymbol}{remaining}</span>
                      </div>
                      
                      {goal.status !== "completed" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="gap-1"
                              onClick={() => setAddingContribution(goal)}
                            >
                              <PiggyBank size={14} />
                              Add Savings
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add to {goal.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-2">
                              <div className="space-y-2">
                                <Label htmlFor="contributionAmount">Amount ({currencySymbol})</Label>
                                <Input
                                  id="contributionAmount"
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={contributionAmount}
                                  onChange={(e) => setContributionAmount(e.target.value)}
                                  placeholder="Enter amount"
                                />
                              </div>
                              <div className="flex justify-end gap-2 pt-2">
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                  <Button onClick={handleAddContribution}>Add</Button>
                                </DialogClose>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      
                      {goal.status === "completed" && (
                        <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-md font-medium">
                          Completed
                        </span>
                      )}
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

export default GoalsPage;
