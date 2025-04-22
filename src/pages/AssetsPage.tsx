import { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlusCircle, Download } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { 
  Asset, 
  Liability, 
  NetWorthSnapshot, 
  AssetType, 
  LiabilityType, 
  ASSET_TYPE_LABELS, 
  LIABILITY_TYPE_LABELS 
} from "@/components/assets/AssetTypes";
import AssetForm from "@/components/assets/AssetForm";
import LiabilityForm from "@/components/assets/LiabilityForm";
import AssetsList from "@/components/assets/AssetsList";
import LiabilitiesList from "@/components/assets/LiabilitiesList";
import NetWorthChart from "@/components/assets/NetWorthChart";
import AssetsPieChart from "@/components/assets/AssetsPieChart";
import LiabilitiesPieChart from "@/components/assets/LiabilitiesPieChart";
import { format } from "date-fns";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ASSETS_STORAGE_KEY = "fi_notes_assets";
const LIABILITIES_STORAGE_KEY = "fi_notes_liabilities";
const NET_WORTH_HISTORY_KEY = "fi_notes_net_worth_history";

const AssetsPage = () => {
  const { userData } = useAuth();
  const currencySymbol = userData?.currency || "$";
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [netWorthHistory, setNetWorthHistory] = useState<NetWorthSnapshot[]>([]);
  
  const [assetDialog, setAssetDialog] = useState(false);
  const [liabilityDialog, setLiabilityDialog] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | undefined>();
  const [editingLiability, setEditingLiability] = useState<Liability | undefined>();
  
  const [activeAssetType, setActiveAssetType] = useState<AssetType | 'all'>('all');
  const [activeLiabilityType, setActiveLiabilityType] = useState<LiabilityType | 'all'>('all');
  
  // Calculate totals
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.value, 0);
  const netWorth = totalAssets - totalLiabilities;

  // Load data from localStorage
  useEffect(() => {
    const savedAssets = localStorage.getItem(ASSETS_STORAGE_KEY);
    if (savedAssets) {
      setAssets(JSON.parse(savedAssets));
    }
    
    const savedLiabilities = localStorage.getItem(LIABILITIES_STORAGE_KEY);
    if (savedLiabilities) {
      setLiabilities(JSON.parse(savedLiabilities));
    }
    
    const savedNetWorthHistory = localStorage.getItem(NET_WORTH_HISTORY_KEY);
    if (savedNetWorthHistory) {
      setNetWorthHistory(JSON.parse(savedNetWorthHistory));
    }
  }, []);

  // Update net worth history when assets or liabilities change
  useEffect(() => {
    if (assets.length > 0 || liabilities.length > 0) {
      const assetsByDate = new Map<string, number>();
      const liabilitiesByDate = new Map<string, number>();
      
      const allDates = new Set<string>();
      
      assets.forEach(asset => {
        const date = asset.date.split('T')[0];
        allDates.add(date);
        assetsByDate.set(date, (assetsByDate.get(date) || 0) + asset.value);
      });
      
      liabilities.forEach(liability => {
        const date = liability.date.split('T')[0];
        allDates.add(date);
        liabilitiesByDate.set(date, (liabilitiesByDate.get(date) || 0) + liability.value);
      });
      
      const sortedDates = Array.from(allDates).sort();
      
      const newSnapshots: NetWorthSnapshot[] = sortedDates.map(date => {
        const assetValue = assetsByDate.get(date) || 0;
        const liabilityValue = liabilitiesByDate.get(date) || 0;
        return {
          date,
          assets: assetValue,
          liabilities: liabilityValue,
          netWorth: assetValue - liabilityValue
        };
      });
      
      setNetWorthHistory(newSnapshots);
      localStorage.setItem(NET_WORTH_HISTORY_KEY, JSON.stringify(newSnapshots));
    }
  }, [assets, liabilities]);

  // Save assets to localStorage when they change
  useEffect(() => {
    localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets));
  }, [assets]);

  // Save liabilities to localStorage when they change
  useEffect(() => {
    localStorage.setItem(LIABILITIES_STORAGE_KEY, JSON.stringify(liabilities));
  }, [liabilities]);

  // Asset handlers
  const handleSaveAsset = (asset: Asset) => {
    if (editingAsset) {
      setAssets(assets.map(a => a.id === asset.id ? asset : a));
    } else {
      setAssets([...assets, asset]);
    }
    setAssetDialog(false);
    setEditingAsset(undefined);
  };

  const handleDeleteAsset = (assetId: string) => {
    setAssets(assets.filter(a => a.id !== assetId));
    toast.success("Asset deleted");
  };

  // Liability handlers
  const handleSaveLiability = (liability: Liability) => {
    if (editingLiability) {
      setLiabilities(liabilities.map(l => l.id === liability.id ? liability : l));
    } else {
      setLiabilities([...liabilities, liability]);
    }
    setLiabilityDialog(false);
    setEditingLiability(undefined);
  };

  const handleDeleteLiability = (liabilityId: string) => {
    setLiabilities(liabilities.filter(l => l.id !== liabilityId));
    toast.success("Liability deleted");
  };

  // Export net worth as PDF
  const exportNetWorthReport = async () => {
    const reportElement = document.getElementById('net-worth-report');
    
    if (reportElement) {
      try {
        toast.info("Generating PDF report...");
        
        const canvas = await html2canvas(reportElement, {
          scale: 2,
          logging: false,
          useCORS: true
        });
        
        const imageData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const imgWidth = 210;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        pdf.addImage(imageData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`networth-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
        
        toast.success("Report exported successfully");
      } catch (error) {
        console.error("Error generating PDF:", error);
        toast.error("Failed to generate PDF report");
      }
    }
  };

  return (
    <PageLayout title="Assets & Liabilities">
      <div className="px-4 pb-6">
        {/* Net Worth Summary Card */}
        <Card className="mb-6 bg-gradient-to-r from-blue-700 to-blue-900 text-white">
          <CardContent className="pt-6 pb-6">
            <h2 className="text-sm font-medium opacity-80 mb-1">Net Worth</h2>
            <div className="flex items-baseline">
              <span className="text-2xl mr-1">{currencySymbol}</span>
              <span className="text-4xl font-bold">{netWorth.toLocaleString()}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/20">
              <div>
                <p className="text-xs font-medium opacity-80">Total Assets</p>
                <p className="text-xl font-semibold text-green-300">{currencySymbol}{totalAssets.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-medium opacity-80">Total Liabilities</p>
                <p className="text-xl font-semibold text-red-300">{currencySymbol}{totalLiabilities.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Net Worth Chart */}
        <div className="mb-6">
          <NetWorthChart snapshots={netWorthHistory} />
        </div>
        
        {/* Asset & Liability Distribution Charts */}
        {(assets.length > 0 || liabilities.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <AssetsPieChart assets={assets} />
            <LiabilitiesPieChart liabilities={liabilities} />
          </div>
        )}
        
        {/* Assets & Liabilities Management Tabs */}
        <Tabs defaultValue="assets" className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid w-full max-w-xs grid-cols-2">
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
            </TabsList>
            <Button 
              className="ml-auto" 
              size="sm" 
              variant="outline"
              onClick={exportNetWorthReport}
            >
              <Download size={16} className="mr-1" />
              Export
            </Button>
          </div>
          
          {/* Assets Tab */}
          <TabsContent value="assets" className="mt-0">
            <div className="flex justify-between items-center mb-4">
              <div className="overflow-x-auto flex space-x-2">
                <Button
                  variant={activeAssetType === 'all' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveAssetType('all')}
                >
                  All
                </Button>
                {Object.entries(ASSET_TYPE_LABELS).map(([key, label]) => (
                  <Button
                    key={key}
                    variant={activeAssetType === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveAssetType(key as AssetType)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
              
              <Button
                onClick={() => {
                  setEditingAsset(undefined);
                  setAssetDialog(true);
                }}
                size="sm"
                className="ml-2 whitespace-nowrap"
              >
                <PlusCircle size={16} className="mr-1" /> Add Asset
              </Button>
            </div>
            
            <AssetsList
              assets={assets}
              onEdit={(asset) => {
                setEditingAsset(asset);
                setAssetDialog(true);
              }}
              onDelete={handleDeleteAsset}
              filterType={activeAssetType}
            />
          </TabsContent>
          
          {/* Liabilities Tab */}
          <TabsContent value="liabilities" className="mt-0">
            <div className="flex justify-between items-center mb-4">
              <div className="overflow-x-auto flex space-x-2">
                <Button
                  variant={activeLiabilityType === 'all' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveLiabilityType('all')}
                >
                  All
                </Button>
                {Object.entries(LIABILITY_TYPE_LABELS).map(([key, label]) => (
                  <Button
                    key={key}
                    variant={activeLiabilityType === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveLiabilityType(key as LiabilityType)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
              
              <Button
                onClick={() => {
                  setEditingLiability(undefined);
                  setLiabilityDialog(true);
                }}
                size="sm"
                variant="destructive"
                className="ml-2 whitespace-nowrap"
              >
                <PlusCircle size={16} className="mr-1" /> Add Liability
              </Button>
            </div>
            
            <LiabilitiesList
              liabilities={liabilities}
              onEdit={(liability) => {
                setEditingLiability(liability);
                setLiabilityDialog(true);
              }}
              onDelete={handleDeleteLiability}
              filterType={activeLiabilityType}
            />
          </TabsContent>
        </Tabs>
        
        {/* Hidden Report Section (for PDF export) */}
        <div id="net-worth-report" className="hidden">
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Net Worth Report</h1>
            <p className="mb-2">Generated on: {format(new Date(), "MMMM d, yyyy")}</p>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Summary</h2>
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <td className="py-2">Total Assets:</td>
                    <td className="py-2 text-right font-medium">{currencySymbol}{totalAssets.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2">Total Liabilities:</td>
                    <td className="py-2 text-right font-medium">{currencySymbol}{totalLiabilities.toLocaleString()}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2 font-bold">Net Worth:</td>
                    <td className="py-2 text-right font-bold">{currencySymbol}{netWorth.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Assets</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left">Name</th>
                    <th className="py-2 text-left">Type</th>
                    <th className="py-2 text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map(asset => (
                    <tr key={asset.id} className="border-b">
                      <td className="py-2">{asset.name}</td>
                      <td className="py-2">{ASSET_TYPE_LABELS[asset.type]}</td>
                      <td className="py-2 text-right">{currencySymbol}{asset.value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Liabilities</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left">Name</th>
                    <th className="py-2 text-left">Type</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {liabilities.map(liability => (
                    <tr key={liability.id} className="border-b">
                      <td className="py-2">{liability.name}</td>
                      <td className="py-2">{LIABILITY_TYPE_LABELS[liability.type]}</td>
                      <td className="py-2 text-right">{currencySymbol}{liability.value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Asset Dialog */}
        <Dialog open={assetDialog} onOpenChange={setAssetDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAsset ? "Edit Asset" : "Add New Asset"}</DialogTitle>
            </DialogHeader>
            <AssetForm 
              onSave={handleSaveAsset}
              onCancel={() => {
                setAssetDialog(false);
                setEditingAsset(undefined);
              }}
              existingAsset={editingAsset}
            />
          </DialogContent>
        </Dialog>
        
        {/* Liability Dialog */}
        <Dialog open={liabilityDialog} onOpenChange={setLiabilityDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLiability ? "Edit Liability" : "Add New Liability"}</DialogTitle>
            </DialogHeader>
            <LiabilityForm
              onSave={handleSaveLiability}
              onCancel={() => {
                setLiabilityDialog(false);
                setEditingLiability(undefined);
              }}
              existingLiability={editingLiability}
            />
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default AssetsPage;
