import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Crown, CreditCard, Calendar, DollarSign, Check, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Billing() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  // Load pricing plans
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["/api/pricing/plans"],
    queryFn: async () => {
      const response = await fetch("/api/pricing/plans");
      if (!response.ok) throw new Error("Failed to load pricing plans");
      return response.json();
    },
  });

  // Create billing portal session
  const billingPortalMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/payment/billing-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to open billing portal");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      window.open(data.url, '_blank');
    },
    onError: (error: Error) => {
      if (error.message.includes("not configured")) {
        toast({
          title: "Development Mode",
          description: "Stripe billing portal not configured in development.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  // Create checkout session for plan upgrades
  const checkoutMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await fetch("/api/payment/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planId })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create checkout session");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error: Error) => {
      if (error.message.includes("not configured")) {
        toast({
          title: "Development Mode",
          description: "Stripe checkout not configured in development.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  if (isLoading || plansLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">Please log in to view billing information.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show unlimited plan for admin user
  if (user.plan === 'unlimited') {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
          <p className="text-muted-foreground">Manage your subscription and billing information</p>
        </div>

        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <Crown className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <CardTitle className="text-yellow-800 dark:text-yellow-200">Unlimited Plan</CardTitle>
                <CardDescription className="text-yellow-600 dark:text-yellow-300">
                  You have unlimited access to all features
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">∞</div>
                <div className="text-sm text-yellow-600 dark:text-yellow-300">Subscribers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">∞</div>
                <div className="text-sm text-yellow-600 dark:text-yellow-300">Emails/Month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">∞</div>
                <div className="text-sm text-yellow-600 dark:text-yellow-300">Domains</div>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="font-semibold mb-3 text-yellow-800 dark:text-yellow-200">Unlimited Features:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  "Unlimited subscribers & emails",
                  "Custom domain sending",
                  "Advanced automation",
                  "A/B testing",
                  "Advanced analytics",
                  "API access",
                  "Priority support",
                  "White-label options"
                ].map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-700 dark:text-yellow-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPlan = plans ? Object.values(plans).find((p: any) => p.id === user.plan) : null;
  const availablePlans = plans ? Object.values(plans).filter((p: any) => p.id !== user.plan) : [];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing information</p>
      </div>

      <Tabs defaultValue="subscription" className="space-y-6">
        <TabsList>
          <TabsTrigger value="subscription">Current Plan</TabsTrigger>
          <TabsTrigger value="upgrade">Upgrade Plans</TabsTrigger>
          <TabsTrigger value="billing">Billing Portal</TabsTrigger>
        </TabsList>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>
                      {currentPlan?.name || user.plan} Plan
                      {currentPlan?.popular && (
                        <Badge className="ml-2" variant="secondary">Popular</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      ${currentPlan?.price || 'N/A'}/month • 
                      {user.subscriptionStatus === 'trialing' ? ' 14-day trial' : 
                       user.subscriptionStatus === 'active' ? ' Active subscription' :
                       user.subscriptionStatus === 'past_due' ? ' Payment overdue' :
                       user.subscriptionStatus === 'canceled' ? ' Canceled' : ' Unknown status'}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={
                  user.subscriptionStatus === 'active' ? 'default' :
                  user.subscriptionStatus === 'trialing' ? 'secondary' :
                  user.subscriptionStatus === 'past_due' ? 'destructive' :
                  'outline'
                }>
                  {user.subscriptionStatus || 'Trial'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {currentPlan && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{currentPlan.limits.subscribers.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Subscribers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{currentPlan.limits.emailsPerMonth.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Emails/Month</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{currentPlan.limits.domains}</div>
                      <div className="text-sm text-muted-foreground">Custom Domains</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Plan Features:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {currentPlan.features.map((feature: string) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {user.trialEndsAt && user.subscriptionStatus === 'trialing' && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium text-blue-800 dark:text-blue-200">Trial Period</div>
                          <div className="text-sm text-blue-600 dark:text-blue-300">
                            Your trial ends on {new Date(user.trialEndsAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upgrade">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availablePlans.map((plan: any) => (
              <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-center">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-center">
                    {plan.description}
                  </CardDescription>
                  <div className="text-center">
                    <div className="text-3xl font-bold">${plan.price}</div>
                    <div className="text-sm text-muted-foreground">/month</div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature: string) => (
                      <li key={feature} className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => checkoutMutation.mutate(plan.id)}
                    disabled={checkoutMutation.isPending}
                  >
                    {checkoutMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Billing Management</span>
              </CardTitle>
              <CardDescription>
                Manage your payment methods, view invoices, and update billing information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-6">
                  <h3 className="font-semibold mb-2">Stripe Customer Portal</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Access your complete billing history, update payment methods, download invoices, and manage your subscription through Stripe's secure customer portal.
                  </p>
                  <Button 
                    onClick={() => billingPortalMutation.mutate()}
                    disabled={billingPortalMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    {billingPortalMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Opening Portal...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Billing Portal
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">🔒</div>
                    <div className="text-sm font-medium">Secure</div>
                    <div className="text-xs text-muted-foreground">PCI compliant</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">📄</div>
                    <div className="text-sm font-medium">Invoices</div>
                    <div className="text-xs text-muted-foreground">Download anytime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">💳</div>
                    <div className="text-sm font-medium">Payment Methods</div>
                    <div className="text-xs text-muted-foreground">Update safely</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}