
import React from "react";
import BottomNav from "./BottomNav";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  hideNav?: boolean;
}

const PageLayout = ({ children, className, title, hideNav = false }: PageLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900">
      {title && (
        <div className="p-4 flex items-center justify-center bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
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
