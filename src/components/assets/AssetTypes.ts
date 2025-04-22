
// Asset and Liability Type Definitions

export type AssetType = 
  | "cash" 
  | "investment" 
  | "property" 
  | "vehicle" 
  | "retirement" 
  | "gold" 
  | "other";

export type LiabilityType = 
  | "loan" 
  | "credit_card" 
  | "mortgage" 
  | "other";

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  value: number;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Liability {
  id: string;
  name: string;
  type: LiabilityType;
  value: number;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface NetWorthSnapshot {
  date: string;
  assets: number;
  liabilities: number;
  netWorth: number;
}

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  cash: "Cash & Bank",
  investment: "Investments",
  property: "Property",
  vehicle: "Vehicles",
  retirement: "Retirement Funds",
  gold: "Gold & Jewelry",
  other: "Other Assets"
};

export const LIABILITY_TYPE_LABELS: Record<LiabilityType, string> = {
  loan: "Loans",
  credit_card: "Credit Card Debt",
  mortgage: "Mortgage",
  other: "Other Debts"
};

export const getAssetTypeIcon = (type: AssetType): string => {
  switch (type) {
    case "cash": return "💰";
    case "investment": return "📈";
    case "property": return "🏠";
    case "vehicle": return "🚗";
    case "retirement": return "👴";
    case "gold": return "💍";
    case "other": return "📦";
  }
};

export const getLiabilityTypeIcon = (type: LiabilityType): string => {
  switch (type) {
    case "loan": return "💸";
    case "credit_card": return "💳";
    case "mortgage": return "🏘️";
    case "other": return "📝";
  }
};
