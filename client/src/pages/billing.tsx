import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Calendar,
  Receipt,
  Download,
  ArrowUpRight,
  Check,
  Crown,
  Zap,
  Users,
  Mail
} from "lucide-react";
import { PricingCards } from "@/components/billing/pricing-cards";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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

  const currentPlan = user?.currentPlan || "starter";
  const mockInvoices = [
    {
      id: "INV-2024-001",
      date: "2024-01-01",
      amount: 49.00,
      status: "paid",
      plan: "Pro Plan"
    },
    {
      id: "INV-2023-012",
      date: "2023-12-01", 
      amount: 49.00,
      status: "paid",
      plan: "Pro Plan"
    },
    {
      id: "INV-2023-011",
      date: "2023-11-01",
      amount: 19.00,
      status: "paid", 
      plan: "Starter Plan"
    }
  ];

  const getPlanInfo = (plan: string) => {
    switch (plan) {
      case "pro":
        return {
          name: "Pro Plan",
          price: "$49/month",
          color: "bg-primary",
          icon: Crown,
          subscribers: "10,000",
          emails: "100,000"
        };
      case "enterprise":
        return {
          name: "Enterprise Plan", 
          price: "$149/month",
          color: "bg-purple-600",
          icon: Zap,
          subscribers: "Unlimited",
          emails: "Unlimited"
        };
      default:
        return {
          name: "Starter Plan",
          price: "$19/month", 
          color: "bg-green-600",
          icon: Users,
          subscribers: "2,500",
          emails: "15,000"
        };
    }
  };

  const planInfo = getPlanInfo(currentPlan);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground">Manage your subscription and billing information</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download All Invoices
        </Button>
      </div>

      {/* Current Plan Overview */}
      <Card className="bg-gradient-to-r from-primary/10 to-purple-600/10 border-primary/20">
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
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <Check className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-background/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Subscribers</span>
              </div>
              <div className="text-2xl font-bold">{planInfo.subscribers}</div>
              <p className="text-xs text-muted-foreground">Current limit</p>
            </div>
            <div className="bg-background/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Monthly Emails</span>
              </div>
              <div className="text-2xl font-bold">{planInfo.emails}</div>
              <p className="text-xs text-muted-foreground">Current limit</p>
            </div>
            <div className="bg-background/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Next Billing</span>
              </div>
              <div className="text-2xl font-bold">Feb 1</div>
              <p className="text-xs text-muted-foreground">2025</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <div>
              <p className="text-sm text-muted-foreground">
                Your subscription renews automatically on February 1, 2025
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                Cancel Subscription
              </Button>
              <Button>
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList>
          <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
          <TabsTrigger value="payment">Payment Method</TabsTrigger>
          <TabsTrigger value="invoices">Billing History</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Plans</CardTitle>
              <CardDescription>Choose the perfect plan for your email marketing needs</CardDescription>
            </CardHeader>
            <CardContent>
              <PricingCards currentPlan={currentPlan} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Manage your billing information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">•••• •••• •••• 4242</h3>
                      <p className="text-sm text-muted-foreground">Expires 12/28</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Default</Badge>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Billing Address</h4>
                    <p className="text-sm text-muted-foreground">
                      123 Tech Street<br />
                      San Francisco, CA 94105<br />
                      United States
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Update Address
                  </Button>
                </div>

                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <CreditCard className="h-4 w-4 text-primary mr-2" />
                      Test Payment Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1"><strong>Test Card Number:</strong></p>
                        <code className="bg-background px-2 py-1 rounded">4242 4242 4242 4242</code>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1"><strong>Test Details:</strong></p>
                        <p className="text-muted-foreground">Expiry: Any future date | CVC: Any 3 digits</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>View and download your past invoices</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center text-white">
                        <Receipt className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{invoice.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          {invoice.plan} • {new Date(invoice.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold">${invoice.amount.toFixed(2)}</p>
                        <Badge variant={invoice.status === "paid" ? "default" : "destructive"}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Month Usage</CardTitle>
                <CardDescription>January 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Emails Sent</span>
                      <span className="text-sm text-muted-foreground">12,847 / {planInfo.emails}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{width: "12.8%"}} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Active Subscribers</span>
                      <span className="text-sm text-muted-foreground">8,420 / {planInfo.subscribers}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: planInfo.subscribers === "Unlimited" ? "0%" : "33.7%"}} />
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Storage Used</span>
                      <span>2.3 GB / 10 GB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>API Calls</span>
                      <span>1,847 / 10,000</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Trends</CardTitle>
                <CardDescription>Last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">73%</div>
                    <p className="text-sm text-muted-foreground">Average monthly usage</p>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { month: "Jan 2025", usage: 73, emails: "12.8k" },
                      { month: "Dec 2024", usage: 89, emails: "15.6k" },
                      { month: "Nov 2024", usage: 67, emails: "11.8k" },
                      { month: "Oct 2024", usage: 54, emails: "9.5k" },
                    ].map((month) => (
                      <div key={month.month} className="flex items-center justify-between">
                        <span className="text-sm">{month.month}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{width: `${month.usage}%`}} 
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {month.emails}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
