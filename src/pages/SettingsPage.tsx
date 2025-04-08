
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronRight, Moon, Sun, Bell, Lock, Laptop, Delete } from "lucide-react";
import { useState } from "react";
import UserProfile from "@/components/profile/UserProfile";

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  
  return (
    <PageLayout title="Settings">
      <div className="finance-container animate-fade-in space-y-6">
        {/* Profile Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Profile</h2>
          <UserProfile />
        </div>
        
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
                  onCheckedChange={setDarkMode}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Notifications</h2>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell size={20} className="mr-3" />
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive reminders and alerts
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-lg font-medium">App Preferences</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <SettingItem icon={Lock} label="Privacy & Security" />
                <SettingItem icon={Laptop} label="App Preferences" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Data</h2>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Export All Data</Label>
                  <Button variant="outline">Export</Button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <Label className="text-red-500">Clear All Data</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    <Delete size={16} className="mr-1" /> Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center text-gray-500 text-sm pt-4">
          <p>Version 1.0.0</p>
        </div>
      </div>
    </PageLayout>
  );
};

const SettingItem = ({ 
  icon: Icon, 
  label 
}: { 
  icon: React.ElementType; 
  label: string;
}) => (
  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
    <div className="flex items-center">
      <Icon size={20} className="mr-3 text-gray-500" />
      <span>{label}</span>
    </div>
    <ChevronRight size={18} className="text-gray-400" />
  </div>
);

export default SettingsPage;
