
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";

interface NotificationSectionProps {
  notifications: boolean;
  toggleNotifications: (enabled: boolean) => void;
}

const NotificationSection = ({ notifications, toggleNotifications }: NotificationSectionProps) => {
  return (
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
  );
};

export default NotificationSection;
