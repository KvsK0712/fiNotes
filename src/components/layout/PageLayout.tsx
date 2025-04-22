
import React from "react";
import BottomNav from "./BottomNav";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  hideNav?: boolean;
  showBackButton?: boolean;
}

const PageLayout = ({ 
  children, 
  className, 
  title, 
  hideNav = false, 
  showBackButton = false 
}: PageLayoutProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900">
      {title && (
        <div className="p-4 flex items-center justify-center bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 relative">
          {showBackButton && (
            <button 
              onClick={() => navigate(-1)} 
              className="absolute left-4 text-gray-600 dark:text-gray-400"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="text-lg font-medium">{title}</h1>
        </div>
      )}
      <main className={cn("flex-1 pb-16", className)}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
};

export default PageLayout;
