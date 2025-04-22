
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { User, Mail, Map, Save, LogOut } from "lucide-react";

// List of countries for the dropdown
const countries = [
  { code: "GB", name: "United Kingdom" },
  { code: "EU", name: "European Union" },
  { code: "US", name: "United States" },
  { code: "JP", name: "Japan" },
  { code: "IN", name: "India" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  // Add more countries as needed
];

const UserProfile = () => {
  const { userData, updateUserData, logout } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState(userData?.name || "");
  const [email, setEmail] = useState(userData?.email || "");
  const [country, setCountry] = useState(userData?.country || "US");
  const [isEditing, setIsEditing] = useState(false);
  
  const handleUpdateProfile = () => {
    // Simple validation
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and email",
        variant: "destructive"
      });
      return;
    }
    
    updateUserData({ name, email, country });
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully"
    });
    
    setIsEditing(false);
  };
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully"
    });
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Profile Information</h3>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <User size={20} className="mr-3 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Name</p>
              {isEditing ? (
                <Input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="font-medium">{userData?.name}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            <Mail size={20} className="mr-3 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              {isEditing ? (
                <Input 
                  value={email}
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="font-medium">{userData?.email}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            <Map size={20} className="mr-3 text-gray-500" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Country</p>
              {isEditing ? (
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="font-medium">
                  {countries.find(c => c.code === userData?.country)?.name || userData?.country}
                </p>
              )}
            </div>
          </div>
          
          {isEditing && (
            <div className="flex space-x-2 pt-2">
              <Button onClick={handleUpdateProfile} className="flex-1">
                <Save size={16} className="mr-1" />
                Save Changes
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setName(userData?.name || "");
                  setEmail(userData?.email || "");
                  setCountry(userData?.country || "US");
                  setIsEditing(false);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          )}
          
          <div className="pt-4 border-t mt-4">
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="w-full"
            >
              <LogOut size={16} className="mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
