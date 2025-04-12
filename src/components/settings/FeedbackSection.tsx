
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

const FeedbackSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const { userData } = useAuth();
  const isMobile = useIsMobile();
  
  // Populate form with user data when opening the dialog
  const handleOpenDialog = () => {
    if (userData) {
      setName(userData.name || "");
      setEmail(userData.email || "");
    }
    setIsDialogOpen(true);
  };
  
  const handleSubmit = () => {
    // Validate form
    if (!name.trim() || !email.trim() || !description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    // Create mailto link with form data
    const subject = encodeURIComponent("fiNotes App Feedback/Issue Report");
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nDescription:\n${description}\n\nDevice Info: ${navigator.userAgent}\nPlatform: ${isMobile ? 'Mobile' : 'Desktop'}\nTimestamp: ${new Date().toString()}`
    );
    
    // Use mailto link to open email client
    window.location.href = `mailto:venkatsai.le@gmail.com?subject=${subject}&body=${body}`;
    
    // Show success message
    toast({
      title: "Thank you!",
      description: "Your feedback has been sent.",
    });
    
    // Close dialog and reset form
    setIsDialogOpen(false);
    setDescription("");
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Feedback & Support</h2>
      <div className="rounded-lg border p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">Report an Issue or Send Feedback</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Let us know if you found a bug or have a suggestion
            </p>
          </div>
          <Button onClick={handleOpenDialog} className="flex items-center gap-2">
            <MessageSquare size={16} />
            <span>Report</span>
          </Button>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Feedback or Report Issue</DialogTitle>
            <DialogDescription>
              Help us improve the fiNotes app with your feedback
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Your name" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Your email address" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Please describe the issue or feedback in detail"
                rows={5}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedbackSection;
