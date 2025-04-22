
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Delete, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

interface DataSectionProps {
  handleClearAllData: () => void;
}

const DataSection = ({ handleClearAllData }: DataSectionProps) => {
  const handleClearData = () => {
    // Clear all transaction data
    localStorage.removeItem("fi_notes_transactions");
    
    // Clear all assets data
    localStorage.removeItem("fi_notes_assets");
    
    // Clear all liabilities data
    localStorage.removeItem("fi_notes_liabilities");
    
    // Clear all net worth history
    localStorage.removeItem("fi_notes_net_worth_history");
    
    // Clear any other app data with fi_notes_ prefix
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('fi_notes_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Execute any additional clear data functions passed from parent
    handleClearAllData();
    
    toast.success("All data cleared successfully");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Data</h2>
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Delete size={16} className="mr-1" /> Clear All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Clear All Data
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset your fiNotes app to its initial state. All your financial data, budgets, goals, assets, liabilities and settings will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="pt-2 text-left">
                  <p className="text-destructive font-medium">This action cannot be undone.</p>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClearData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    <Delete size={16} className="mr-1" /> Clear All Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataSection;
