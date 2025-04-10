
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Delete } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface DataSectionProps {
  handleClearAllData: () => void;
}

const DataSection = ({ handleClearAllData }: DataSectionProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Data</h2>
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Delete size={16} className="mr-1" /> Clear All Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Clear All Data</DialogTitle>
                  <DialogDescription>
                    This will reset your fiNotes app to its initial state. All your financial data, budgets, goals, and settings will be permanently deleted.
                  </DialogDescription>
                </DialogHeader>
                <div className="pt-4 text-left">
                  <p className="text-destructive font-medium">This action cannot be undone.</p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {}}>Cancel</Button>
                  <Button variant="destructive" onClick={handleClearAllData}>
                    <Delete size={16} className="mr-1" /> Clear All Data
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataSection;
