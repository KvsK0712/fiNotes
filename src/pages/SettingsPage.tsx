
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
import FeedbackSection from "@/components/settings/FeedbackSection";

// Define storage keys for various user data
const STORAGE_KEYS = {
  DARK_MODE: 'fiNotes-darkMode',
  NOTIFICATIONS: 'fiNotes-notifications',
  TRANSACTIONS: 'pocket_wise_transactions',
  BUDGETS: 'fiNotes-budgets',
  GOALS: 'fiNotes-goals',
  USER_PREFERENCES: 'fiNotes-preferences'
  // Add any additional storage keys used in the app
};

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    // Load settings from localStorage with default values (OFF)
    const savedDarkMode = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    const savedNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    
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
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, enabled.toString());
    
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  const toggleNotifications = (enabled: boolean) => {
    setNotifications(enabled);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, enabled.toString());
    
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
    // Clear all app settings
    localStorage.removeItem(STORAGE_KEYS.DARK_MODE);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    
    // Clear all user data
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
    
    // Clear any additional data stored in localStorage
    // This is a more comprehensive approach to ensure everything is reset
    const keysToKeep = ['pocket_wise_auth', 'pocket_wise_user']; // Keep auth to stay logged in
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('fiNotes-') && !keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    }
    
    // Reset states to default (OFF)
    setDarkMode(false);
    setNotifications(false);
    
    // Reset UI
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
        <FeedbackSection />
        <DataSection handleClearAllData={handleClearAllData} />
        <VersionInfo />
      </div>
    </PageLayout>
  );
};

export default SettingsPage;
