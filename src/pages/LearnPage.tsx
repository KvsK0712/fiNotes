
import { useEffect, useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const LearnPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(true);
  
  const categories = [
    {
      id: "loans",
      title: "Loans",
      description: "Learn about different types of loans and borrowing",
      articleCount: 5,
    },
    {
      id: "credit-cards",
      title: "Credit Cards",
      description: "Understand how to use credit cards responsibly",
      articleCount: 4,
    },
    {
      id: "investments",
      title: "Investments",
      description: "Learn about different investment options and strategies",
      articleCount: 6,
    },
    {
      id: "risk-management",
      title: "Risk Management",
      description: "Protect your finances with proper risk management",
      articleCount: 3,
    },
    {
      id: "budgeting",
      title: "Budgeting",
      description: "Tips and strategies for effective budgeting",
      articleCount: 4,
    },
    {
      id: "taxes",
      title: "Taxes",
      description: "Understanding taxes and tax-saving strategies",
      articleCount: 3,
    },
  ];

  const featuredArticle = {
    title: "The 50/30/20 Budgeting Rule",
    description: "Learn how to allocate your income to needs, wants, and savings effectively.",
    readTime: 5,
  };

  useEffect(() => {
    // Initial filtering on component mount
    setFilteredCategories(categories);
  }, []);

  useEffect(() => {
    // Filter categories whenever search query changes
    if (searchQuery.trim() === "") {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter((category) => 
        category.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        category.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <PageLayout title="Learn Finance">
      <div className="finance-container animate-fade-in">
        {/* Development Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Feature Under Development</DialogTitle>
              <DialogDescription>
                The Learn section is currently under development. More financial education resources will be available soon!
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setShowDialog(false)}>Continue to Preview</Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search topics..." 
            className="pl-9"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {/* Featured Article */}
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-3">Featured Article</h2>
          <Card className="bg-primary text-white">
            <CardContent className="p-6">
              <div className="flex items-center mb-2">
                <BookOpen size={18} className="mr-2" />
                <span className="text-sm">{featuredArticle.readTime} min read</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{featuredArticle.title}</h3>
              <p className="opacity-90 mb-4">{featuredArticle.description}</p>
              <Link to="/learn/articles/budgeting-rule">
                <span className="underline text-sm">Read More</span>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Categories - Now filtered */}
        <div>
          <h2 className="text-lg font-medium mb-3">Browse by Category</h2>
          {filteredCategories.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No categories match your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredCategories.map((category) => (
                <Link key={category.id} to={`/learn/category/${category.id}`}>
                  <Card className="card-hover cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">{category.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {category.description}
                          </p>
                        </div>
                        <div className="text-sm text-gray-400 ml-4">
                          {category.articleCount} articles
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default LearnPage;
