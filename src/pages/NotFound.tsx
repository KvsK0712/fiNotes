
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-slate-900">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-bold text-primary mb-4">404</h1>
        <p className="text-2xl font-medium text-gray-800 dark:text-gray-200 mb-2">
          Page Not Found
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          The page you are looking for is currently under development or doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button className="gap-2 w-full sm:w-auto">
              <Home size={18} />
              Return to Home
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="gap-2 w-full sm:w-auto"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={18} />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
