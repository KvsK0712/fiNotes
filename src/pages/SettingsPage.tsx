
import { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { useToast } from "@/hooks/use-toast";

// Import refactored components
import ProfileSection from "@/components/settings/ProfileSection";
import AppearanceSection from "@/components/settings/AppearanceSection";
import NotificationSection from "@/components/settings/NotificationSection";
import AppPreferencesSection from "@/components/settings/AppPreferencesSection";
import DataSection from "@/components/settings/DataSection";
import VersionInfo from "@/components/settings/VersionInfo";

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const { toast } = useToast();
  
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
        <ProfileSection />
        <AppearanceSection darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <NotificationSection notifications={notifications} toggleNotifications={toggleNotifications} />
        <AppPreferencesSection />
        <DataSection handleClearAllData={handleClearAllData} />
        <VersionInfo />
      </div>
    </PageLayout>
  );
};

export default SettingsPage;
