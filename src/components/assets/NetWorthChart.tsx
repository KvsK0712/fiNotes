
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { format, parseISO, subMonths } from "date-fns";
import { NetWorthSnapshot } from "./AssetTypes";
import { useAuth } from "@/context/AuthContext";

interface NetWorthChartProps {
  snapshots: NetWorthSnapshot[];
}

const NetWorthChart: React.FC<NetWorthChartProps> = ({ snapshots }) => {
  const { userData } = useAuth();
  const currencySymbol = userData?.currency || "$";
  
  // Sort snapshots by date
  const sortedSnapshots = [...snapshots].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Format data for the chart
  const chartData = sortedSnapshots.map(snapshot => ({
    date: snapshot.date,
    formattedDate: format(new Date(snapshot.date), "MMM d"),
    "Net Worth": snapshot.netWorth,
    Assets: snapshot.assets,
    Liabilities: snapshot.liabilities
  }));

  // Calculate growth if we have data
  const calculateGrowth = () => {
    if (snapshots.length <= 1) return null;
    
    const lastIndex = snapshots.length - 1;
    const currentNetWorth = snapshots[lastIndex].netWorth;
    let previousNetWorth;
    
    // Try to find a snapshot from 3 months ago
    const threeMonthsAgo = subMonths(new Date(), 3);
    const previousSnapshot = snapshots.find(s => 
      new Date(s.date) <= threeMonthsAgo
    );
    
    // If we have data from 3 months ago, use that, otherwise use the first snapshot
    previousNetWorth = previousSnapshot 
      ? previousSnapshot.netWorth 
      : snapshots[0].netWorth;
    
    if (previousNetWorth === 0) return null;
    
    const growthRate = ((currentNetWorth - previousNetWorth) / Math.abs(previousNetWorth)) * 100;
    return {
      rate: growthRate.toFixed(1),
      isPositive: growthRate >= 0,
      amount: Math.abs(currentNetWorth - previousNetWorth)
    };
  };
  
  const growth = calculateGrowth();
  
  // Check if we have enough data to show a meaningful chart
  const hasEnoughData = snapshots.length > 1;

  // Define chart configuration
  const chartConfig = {
    "Net Worth": { color: "#1e40af" },
    Assets: { color: "#10b981" },
    Liabilities: { color: "#ef4444" }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <CardTitle className="text-lg">Net Worth Over Time</CardTitle>
          {growth && (
            <div className={`text-sm ${growth.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {growth.isPositive ? '↗' : '↘'} {growth.isPositive ? '+' : '-'}{growth.rate}% ({currencySymbol}{growth.amount.toLocaleString()})
              <div className="text-xs text-gray-500">since first record</div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!hasEnoughData ? (
          <div className="h-80 flex items-center justify-center text-gray-500">
            Add multiple assets or liabilities over time to see your net worth trend.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 5, left: 5, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="formattedDate" 
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis 
                  tickFormatter={(value) => `${currencySymbol}${value}`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <ChartTooltipContent>
                          <div className="py-1">
                            <div className="font-medium">{format(new Date(data.date), "MMM d, yyyy")}</div>
                            <div className="flex items-center gap-2 text-green-600">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
                              Assets: {currencySymbol}{data.Assets.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2 text-red-600">
                              <div className="h-1.5 w-1.5 rounded-full bg-red-600" />
                              Liabilities: {currencySymbol}{data.Liabilities.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2 font-semibold">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-800" />
                              Net Worth: {currencySymbol}{data["Net Worth"].toLocaleString()}
                            </div>
                          </div>
                        </ChartTooltipContent>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ bottom: 0, fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="Net Worth"
                  stroke="#1e40af"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="Assets"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
                <Line
                  type="monotone"
                  dataKey="Liabilities"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default NetWorthChart;
