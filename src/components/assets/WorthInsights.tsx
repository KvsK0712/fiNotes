
import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Asset, Liability, NetWorthSnapshot } from "./AssetTypes";
import { useAuth } from "@/context/AuthContext";
import { ArrowUpRight, ArrowDownRight, MinusCircle, Target } from "lucide-react";
import { differenceInMonths, format, subMonths } from "date-fns";

interface WorthInsightsProps {
  assets: Asset[];
  liabilities: Liability[];
  netWorthHistory: NetWorthSnapshot[];
}

const WorthInsights: React.FC<WorthInsightsProps> = ({
  assets,
  liabilities,
  netWorthHistory,
}) => {
  const { userData } = useAuth();
  const currencySymbol = userData?.currency || "$";

  // Sort history by date (newest first)
  const sortedHistory = [...netWorthHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const insights = useMemo(() => {
    const results = [];
    
    const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.value, 0);
    const currentNetWorth = totalAssets - totalLiabilities;

    // Calculate metrics if we have history
    if (sortedHistory.length > 1) {
      // Current values
      const current = sortedHistory[0];
      
      // Find record from 3 months ago or the oldest record
      const threeMonthsAgo = subMonths(new Date(), 3);
      const previousIndex = sortedHistory.findIndex(s => 
        new Date(s.date) <= threeMonthsAgo
      );
      
      const previous = previousIndex >= 0 
        ? sortedHistory[previousIndex] 
        : sortedHistory[sortedHistory.length - 1];
      
      // Asset growth
      if (previous.assets > 0) {
        const assetGrowthRate = ((current.assets - previous.assets) / previous.assets) * 100;
        const assetGrowthAmount = current.assets - previous.assets;
        
        if (assetGrowthAmount !== 0) {
          results.push({
            text: `Your assets ${assetGrowthAmount > 0 ? 'grew' : 'decreased'} by ${currencySymbol}${Math.abs(assetGrowthAmount).toLocaleString()} (${assetGrowthRate.toFixed(1)}%) in the last ${differenceInMonths(new Date(current.date), new Date(previous.date))} months`,
            icon: assetGrowthAmount > 0 ? ArrowUpRight : ArrowDownRight,
            iconColor: assetGrowthAmount > 0 ? 'text-green-500' : 'text-amber-500',
            priority: 2
          });
        }
      }
      
      // Liability reduction
      if (previous.liabilities > 0) {
        const liabilityChangeRate = ((current.liabilities - previous.liabilities) / previous.liabilities) * 100;
        const liabilityChangeAmount = previous.liabilities - current.liabilities;
        
        if (liabilityChangeAmount > 0) {
          results.push({
            text: `Your liabilities reduced by ${currencySymbol}${liabilityChangeAmount.toLocaleString()} (${Math.abs(liabilityChangeRate).toFixed(1)}%) since ${format(new Date(previous.date), "MMMM yyyy")}`,
            icon: MinusCircle,
            iconColor: 'text-green-500',
            priority: 3
          });
        }
      }
      
      // Net worth milestone (crossing 100k, 500k, etc.)
      const milestones = [10000, 50000, 100000, 500000, 1000000, 5000000, 10000000];
      
      for (const milestone of milestones) {
        if (current.netWorth >= milestone && previous.netWorth < milestone) {
          results.push({
            text: `Net worth milestone: ${currencySymbol}${(milestone/1000).toLocaleString()}k reached 🎉`,
            icon: Target,
            iconColor: 'text-purple-500',
            priority: 1
          });
          break;
        }
      }
    }
    
    // Goal projection (assuming 1 Cr = 10M)
    if (currentNetWorth > 0) {
      const goalAmount = 10000000; // 1 Cr
      const progressPercent = (currentNetWorth / goalAmount) * 100;
      
      if (progressPercent > 0 && progressPercent < 100) {
        results.push({
          text: `You are ${progressPercent.toFixed(0)}% towards your ${currencySymbol}1Cr goal`,
          icon: Target,
          iconColor: 'text-blue-500',
          priority: 4
        });
      }
    }
    
    // Sort by priority
    return results.sort((a, b) => a.priority - b.priority);
  }, [assets, liabilities, sortedHistory, currencySymbol]);

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-medium mb-3">Financial Insights</h3>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${insight.iconColor} bg-opacity-10`}>
                <insight.icon size={18} className={insight.iconColor} />
              </div>
              <p className="text-sm">{insight.text}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorthInsights;
