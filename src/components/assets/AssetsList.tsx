
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Asset, AssetType, ASSET_TYPE_LABELS, getAssetTypeIcon } from "./AssetTypes";
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

interface AssetsListProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (assetId: string) => void;
  filterType?: AssetType | 'all';
}

const AssetsList: React.FC<AssetsListProps> = ({
  assets,
  onEdit,
  onDelete,
  filterType = 'all'
}) => {
  const { userData } = useAuth();
  const currencySymbol = userData?.currency || "$";

  const filteredAssets = filterType === 'all' 
    ? assets 
    : assets.filter(asset => asset.type === filterType);

  // Sort by most recent date first
  const sortedAssets = [...filteredAssets].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sortedAssets.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No assets found. Add your first asset to start tracking.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedAssets.map((asset) => (
        <Card key={asset.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getAssetTypeIcon(asset.type)}</div>
                <div>
                  <h3 className="font-medium">{asset.name}</h3>
                  <div className="flex items-center text-xs text-gray-500 space-x-2">
                    <span>{ASSET_TYPE_LABELS[asset.type]}</span>
                    <span>•</span>
                    <span>{format(new Date(asset.date), "MMM d, yyyy")}</span>
                  </div>
                  {asset.description && (
                    <p className="text-sm text-gray-600 mt-1 truncate max-w-[250px]">
                      {asset.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="font-semibold text-green-600">
                  {currencySymbol}{asset.value.toLocaleString()}
                </span>
                <div className="flex space-x-1 mt-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onEdit(asset)}
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
                        <AlertDialogTitle>Delete Asset</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{asset.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(asset.id)}
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

export default AssetsList;
