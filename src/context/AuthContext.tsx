
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define types for our user data
export interface UserData {
  name: string;
  country: string;
  email: string;
  currency: string;
}

// Define the shape of our context
interface AuthContextType {
  isAuthenticated: boolean;
  userData: UserData | null;
  login: (userData: UserData) => void;
  logout: () => void;
  updateUserData: (userData: Partial<UserData>) => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const AUTH_STORAGE_KEY = "fi_notes_auth";
const USER_DATA_STORAGE_KEY = "fi_notes_user";

// Default currency symbols by country code
const countryCurrencyMap: Record<string, string> = {
  GB: "£",
  EU: "€",
  US: "$",
  JP: "¥",
  IN: "₹",
  // Add more countries as needed
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    const storedUserData = localStorage.getItem(USER_DATA_STORAGE_KEY);
    
    if (storedAuth === "true" && storedUserData) {
      setIsAuthenticated(true);
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  // Login function
  const login = (newUserData: UserData) => {
    // Set currency based on country if not provided
    if (!newUserData.currency && newUserData.country) {
      newUserData.currency = countryCurrencyMap[newUserData.country] || "$";
    }

    localStorage.setItem(AUTH_STORAGE_KEY, "true");
    localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(newUserData));
    
    setIsAuthenticated(true);
    setUserData(newUserData);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
    setUserData(null);
    // We don't remove user data from storage to remember it for next login
  };

  // Update user data
  const updateUserData = (updatedData: Partial<UserData>) => {
    if (!userData) return;
    
    const newUserData = { ...userData, ...updatedData };
    
    // Update currency if country changes
    if (updatedData.country && !updatedData.currency) {
      newUserData.currency = countryCurrencyMap[updatedData.country] || newUserData.currency;
    }
    
    localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(newUserData));
    setUserData(newUserData);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userData,
        login,
        logout,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
