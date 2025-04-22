
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Lock, Laptop, Eye, Database, Server } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const AppPreferencesSection = () => {
  return (
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
  );
};

export default AppPreferencesSection;
