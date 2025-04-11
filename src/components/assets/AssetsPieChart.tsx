
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Asset, AssetType, ASSET_TYPE_LABELS } from "./AssetTypes";
import { useAuth } from "@/context/AuthContext";

interface AssetsPieChartProps {
  assets: Asset[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const AssetsPieChart: React.FC<AssetsPieChartProps> = ({ assets }) => {
  const { userData } = useAuth();
  const currencySymbol = userData?.currency || "$";
  
  // Calculate totals by asset type
  const assetsByType: Record<string, number> = {};
  
  Object.keys(ASSET_TYPE_LABELS).forEach((type) => {
    assetsByType[type] = 0;
  });
  
  assets.forEach((asset) => {
    assetsByType[asset.type] += asset.value;
  });
  
  // Format data for pie chart - only include types with values > 0
  const chartData = Object.entries(assetsByType)
    .filter(([_, value]) => value > 0)
    .map(([type, value], index) => ({
      name: ASSET_TYPE_LABELS[type as AssetType],
      value,
      fill: COLORS[index % COLORS.length]
    }));
  
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Asset Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No assets added yet.
          </div>
        ) : (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `${currencySymbol}${value.toLocaleString()}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">Total Assets</p>
              <p className="text-lg font-bold text-green-600">{currencySymbol}{totalAssets.toLocaleString()}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AssetsPieChart;
