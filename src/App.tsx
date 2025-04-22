
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import CalculatorsPage from "./pages/CalculatorsPage";
import EMICalculator from "./pages/calculators/EMICalculator";
import SIPPlanner from "./pages/calculators/SIPPlanner";
import CreditCardOptimizer from "./pages/calculators/CreditCardOptimizer";
import LoanRepayment from "./pages/calculators/LoanRepayment";
import TrackerPage from "./pages/TrackerPage";
import AddTransactionPage from "./pages/tracker/AddTransactionPage";
import AssetsPage from "./pages/AssetsPage";
import LearnPage from "./pages/LearnPage";
import SettingsPage from "./pages/SettingsPage";
import BudgetPage from "./pages/BudgetPage";
import GoalsPage from "./pages/GoalsPage";
import NotFound from "./pages/NotFound";
import StatusBarBackground from './components/safe_area/StatusBarBackground';
import BottomSafeArea from "./components/safe_area/BottomSafeArea";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="main-container safe-area app-wrapper">
          <StatusBarBackground backgroundColor="#ffffff" />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/calculators" element={<ProtectedRoute><CalculatorsPage /></ProtectedRoute>} />
              <Route path="/calculators/emi" element={<ProtectedRoute><EMICalculator /></ProtectedRoute>} />
              <Route path="/calculators/sip" element={<ProtectedRoute><SIPPlanner /></ProtectedRoute>} />
              <Route path="/calculators/credit-card" element={<ProtectedRoute><CreditCardOptimizer /></ProtectedRoute>} />
              <Route path="/calculators/loan" element={<ProtectedRoute><LoanRepayment /></ProtectedRoute>} />
              <Route path="/tracker" element={<ProtectedRoute><TrackerPage /></ProtectedRoute>} />
              <Route path="/tracker/add" element={<ProtectedRoute><AddTransactionPage /></ProtectedRoute>} />
              <Route path="/assets" element={<ProtectedRoute><AssetsPage /></ProtectedRoute>} />
              <Route path="/budget" element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
              <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
              <Route path="/learn" element={<ProtectedRoute><LearnPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomSafeArea backgroundColor="#ffffff" />
          </div>

        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);


export default App;
