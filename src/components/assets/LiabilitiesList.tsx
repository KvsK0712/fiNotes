
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Liability, LiabilityType, LIABILITY_TYPE_LABELS, getLiabilityTypeIcon } from "./AssetTypes";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface LiabilitiesListProps {
  liabilities: Liability[];
  onEdit: (liability: Liability) => void;
  onDelete: (liabilityId: string) => void;
  filterType?: LiabilityType | 'all';
}

const LiabilitiesList: React.FC<LiabilitiesListProps> = ({
  liabilities,
  onEdit,
  onDelete,
  filterType = 'all'
}) => {
  const { userData } = useAuth();
  const currencySymbol = userData?.currency || "$";

  const filteredLiabilities = filterType === 'all' 
    ? liabilities 
    : liabilities.filter(liability => liability.type === filterType);

  // Sort by most recent date first
  const sortedLiabilities = [...filteredLiabilities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sortedLiabilities.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No liabilities found. Add your first liability to start tracking.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedLiabilities.map((liability) => (
        <Card key={liability.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getLiabilityTypeIcon(liability.type)}</div>
                <div>
                  <h3 className="font-medium">{liability.name}</h3>
                  <div className="flex items-center text-xs text-gray-500 space-x-2">
                    <span>{LIABILITY_TYPE_LABELS[liability.type]}</span>
                    <span>•</span>
                    <span>{format(new Date(liability.date), "MMM d, yyyy")}</span>
                  </div>
                  {liability.description && (
                    <p className="text-sm text-gray-600 mt-1 truncate max-w-[250px]">
                      {liability.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="font-semibold text-red-600">
                  {currencySymbol}{liability.value.toLocaleString()}
                </span>
                <div className="flex space-x-1 mt-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onEdit(liability)}
                  >
                    <Edit size={16} />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500">
                        <Trash2 size={16} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Liability</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{liability.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(liability.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LiabilitiesList;
