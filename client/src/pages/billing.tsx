import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check,
  Crown,
  Users,
  Mail,
  Zap,
  Shield,
  Globe,
  Settings
} from "lucide-react";

export default function Billing() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-background" />;
  }

  // Check if user has unlimited plan
  const isUnlimitedUser = user?.email === 'raymond@thegeektrepreneur.com';

  const planInfo = {
    name: isUnlimitedUser ? "Unlimited Pro" : "Starter Plan",
    price: isUnlimitedUser ? "Free" : "$19/month",
    color: isUnlimitedUser ? "bg-gradient-to-r from-purple-600 to-pink-600" : "bg-green-600",
    icon: isUnlimitedUser ? Crown : Users,
    subscribers: isUnlimitedUser ? "Unlimited" : "2,500",
    emails: isUnlimitedUser ? "Unlimited" : "15,000"
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            {isUnlimitedUser ? "Your unlimited plan details" : "Manage your subscription"}
          </p>
        </div>
      </div>

      {/* Current Plan Overview */}
      <Card className={`${isUnlimitedUser ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 dark:from-purple-900/20 dark:to-pink-900/20' : 'bg-gradient-to-r from-primary/10 to-purple-600/10 border-primary/20'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 ${planInfo.color} rounded-lg flex items-center justify-center text-white`}>
                <planInfo.icon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">{planInfo.name}</CardTitle>
                <CardDescription className="text-lg font-medium text-primary">
                  {planInfo.price}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`${isUnlimitedUser ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'}`}>
                <Check className="h-3 w-3 mr-1" />
                {isUnlimitedUser ? "Unlimited" : "Active"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-background/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Subscribers</span>
              </div>
              <div className="text-2xl font-bold">{planInfo.subscribers}</div>
              <p className="text-xs text-muted-foreground">
                {isUnlimitedUser ? "No limits" : "Current limit"}
              </p>
            </div>
            <div className="bg-background/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Monthly Emails</span>
              </div>
              <div className="text-2xl font-bold">{planInfo.emails}</div>
              <p className="text-xs text-muted-foreground">
                {isUnlimitedUser ? "No limits" : "Current limit"}
              </p>
            </div>
          </div>

          {isUnlimitedUser && (
            <div className="flex items-center justify-center mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  <span className="text-lg font-semibold text-primary">Unlimited Access Activated</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You have unlimited access to all features and capabilities
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Section for Unlimited Users */}
      {isUnlimitedUser && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-purple-600" />
              <span>Unlimited Pro Features</span>
            </CardTitle>
            <CardDescription>
              All premium features are included with your unlimited plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Unlimited subscribers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Unlimited emails per month</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Custom domain sending</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Advanced automation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Email sequences</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">A/B testing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Priority support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">API access</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Lead generation tools</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Contact segmentation</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg">High Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Lightning-fast email delivery with 99.9% uptime
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-lg">Enterprise Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Bank-level security with encryption and compliance
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Globe className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle className="text-lg">Global Reach</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Send emails worldwide with regional optimization
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}