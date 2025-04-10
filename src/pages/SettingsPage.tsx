import { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronRight, Moon, Sun, Bell, Lock, Laptop, Delete, Info, Database, Eye, Server } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UserProfile from "@/components/profile/UserProfile";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const { toast } = useToast();
  const { userData } = useAuth();
  
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('fiNotes-darkMode');
    const savedNotifications = localStorage.getItem('fiNotes-notifications');
    
    setDarkMode(savedDarkMode === 'true');
    setNotifications(savedNotifications === 'true');
    
    if (savedDarkMode === 'true') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  const toggleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled);
    localStorage.setItem('fiNotes-darkMode', enabled.toString());
    
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  const toggleNotifications = (enabled: boolean) => {
    setNotifications(enabled);
    localStorage.setItem('fiNotes-notifications', enabled.toString());
    
    if (enabled) {
      toast({
        title: "Notifications Enabled",
        description: "You will now receive updates about your financial activities.",
      });
      
      setTimeout(() => {
        toast({
          title: "Reminder",
          description: "Time to check your monthly budget status!",
        });
      }, 3000);
    } else {
      toast({
        title: "Notifications Disabled",
        description: "You will no longer receive notifications.",
      });
    }
  };
  
  const handleClearAllData = () => {
    localStorage.removeItem('fiNotes-darkMode');
    localStorage.removeItem('fiNotes-notifications');
    
    setDarkMode(false);
    setNotifications(false);
    
    document.documentElement.classList.remove('dark');
    
    toast({
      title: "All Data Cleared",
      description: "Your fiNotes app has been reset to default settings.",
    });
  };
  
  return (
    <PageLayout title="Settings">
      <div className="finance-container animate-fade-in space-y-6">
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
                  onCheckedChange={toggleDarkMode}
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
                  onCheckedChange={toggleNotifications}
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
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center">
                        <Lock size={20} className="mr-3 text-gray-500" />
                        <span>Privacy & Security</span>
                      </div>
                      <ChevronRight size={18} className="text-gray-400" />
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Privacy & Security</DialogTitle>
                      <DialogDescription>
                        fiNotes takes your privacy and security seriously.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="flex items-start gap-3">
                        <Eye className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">Data Privacy</h4>
                          <p className="text-sm text-muted-foreground">
                            All your financial data is encrypted and stored securely. We don't share your data with third parties.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Lock className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">Secure Authentication</h4>
                          <p className="text-sm text-muted-foreground">
                            We use industry-standard authentication methods to protect your account.
                          </p>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center">
                        <Laptop size={20} className="mr-3 text-gray-500" />
                        <span>App Preferences</span>
                      </div>
                      <ChevronRight size={18} className="text-gray-400" />
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>App Preferences</DialogTitle>
                      <DialogDescription>
                        Configure how fiNotes works for you.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="flex items-start gap-3">
                        <Database className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">Data Storage</h4>
                          <p className="text-sm text-muted-foreground">
                            fiNotes stores your data locally and syncs with secure cloud storage when you're online.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Server className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">Sync Frequency</h4>
                          <p className="text-sm text-muted-foreground">
                            Data syncs automatically every time you make changes to ensure your information is up-to-date across devices.
                          </p>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Data</h2>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Delete size={16} className="mr-1" /> Clear All Data
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Clear All Data</DialogTitle>
                      <DialogDescription>
                        This will reset your fiNotes app to its initial state. All your financial data, budgets, goals, and settings will be permanently deleted.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="pt-4 text-left">
                      <p className="text-destructive font-medium">This action cannot be undone.</p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {}}>Cancel</Button>
                      <Button variant="destructive" onClick={handleClearAllData}>
                        <Delete size={16} className="mr-1" /> Clear All Data
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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

export default SettingsPage;
