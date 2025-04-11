
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Liability, LiabilityType, LIABILITY_TYPE_LABELS } from "./AssetTypes";
import { useAuth } from "@/context/AuthContext";

interface LiabilitiesPieChartProps {
  liabilities: Liability[];
}

const COLORS = ['#FF4560', '#775DD0', '#FF6B3B', '#2E93FA', '#66DA26', '#E91E63', '#FEB019'];

const LiabilitiesPieChart: React.FC<LiabilitiesPieChartProps> = ({ liabilities }) => {
  const { userData } = useAuth();
  const currencySymbol = userData?.currency || "$";
  
  // Calculate totals by liability type
  const liabilitiesByType: Record<string, number> = {};
  
  Object.keys(LIABILITY_TYPE_LABELS).forEach((type) => {
    liabilitiesByType[type] = 0;
  });
  
  liabilities.forEach((liability) => {
    liabilitiesByType[liability.type] += liability.value;
  });
  
  // Format data for pie chart - only include types with values > 0
  const chartData = Object.entries(liabilitiesByType)
    .filter(([_, value]) => value > 0)
    .map(([type, value], index) => ({
      name: LIABILITY_TYPE_LABELS[type as LiabilityType],
      value,
      fill: COLORS[index % COLORS.length]
    }));
  
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.value, 0);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Liability Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No liabilities added yet.
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
              <p className="text-sm text-gray-500">Total Liabilities</p>
              <p className="text-lg font-bold text-red-600">{currencySymbol}{totalLiabilities.toLocaleString()}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LiabilitiesPieChart;
