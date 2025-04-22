
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { UserIcon, LogIn } from "lucide-react";

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

const LoginPage = () => {
  const { isAuthenticated, login } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("GB");
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and email",
        variant: "destructive",
      });
      return;
    }
    
    // Login the user
    login({
      name,
      email,
      country,
      currency: "", // This will be auto-set in the context
    });
    
    toast({
      title: "Welcome!",
      description: `Great to have you with us, ${name}!`,
    });
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-finance-navy rounded-full flex items-center justify-center">
              <UserIcon size={32} className="text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to fiNotes</CardTitle>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Please enter your details to continue
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
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
            </div>
            
            <Button type="submit" className="w-full" size="lg">
              <LogIn className="mr-2" size={18} />
              Get Started
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
