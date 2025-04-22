
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";

interface AppearanceSectionProps {
  darkMode: boolean;
  toggleDarkMode: (enabled: boolean) => void;
}

const AppearanceSection = ({ darkMode, toggleDarkMode }: AppearanceSectionProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Appearance</h2>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {darkMode ? <Moon size={20} className="mr-3" /> : <Sun size={20} className="mr-3" />}
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Switch between light and dark themes
                </p>
              </div>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppearanceSection;
