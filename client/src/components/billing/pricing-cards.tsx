import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Crown, 
  Users, 
  Zap,
  CreditCard,
  Loader2,
  ArrowUpRight
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PricingCardsProps {
  currentPlan: string;
}

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  icon: any;
  color: string;
  features: string[];
  popular?: boolean;
  subscribers: string;
  emails: string;
}

export function PricingCards({ currentPlan }: PricingCardsProps) {
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  const plans: PricingPlan[] = [
    {
      id: "starter",
      name: "Starter",
      price: billingCycle === "monthly" ? "$19" : "$190",
      monthlyPrice: 19,
      annualPrice: 190,
      description: "Perfect for small businesses getting started",
      icon: Users,
      color: "bg-green-600",
      subscribers: "2,500",
      emails: "15,000",
      features: [
        "Up to 2,500 subscribers",
        "15,000 emails per month", 
        "Custom domain sending",
        "Drag & drop editor",
        "Basic analytics",
        "Email support",
        "Mobile-responsive templates",
        "List segmentation"
      ]
    },
    {
      id: "pro",
      name: "Pro",
      price: billingCycle === "monthly" ? "$49" : "$490",
      monthlyPrice: 49,
      annualPrice: 490,
      description: "For growing businesses that need more power",
      icon: Crown,
      color: "bg-primary",
      subscribers: "10,000",
      emails: "100,000",
      popular: true,
      features: [
        "Up to 10,000 subscribers",
        "100,000 emails per month",
        "Custom domain sending",
        "Advanced automation",
        "A/B testing",
        "Advanced analytics",
        "Priority support",
        "Custom templates",
        "Advanced segmentation",
        "Send time optimization"
      ]
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: billingCycle === "monthly" ? "$149" : "$1,490",
      monthlyPrice: 149,
      annualPrice: 1490,
      description: "For large organizations with custom needs",
      icon: Zap,
      color: "bg-purple-600",
      subscribers: "Unlimited",
      emails: "Unlimited",
      features: [
        "Unlimited subscribers",
        "Unlimited emails",
        "Dedicated IP",
        "Multi-user accounts",
        "API access",
        "White-label options",
        "24/7 phone support",
        "Custom integrations",
        "Advanced reporting",
        "Dedicated account manager"
      ]
    }
  ];

  const checkoutMutation = useMutation({
    mutationFn: async (plan: PricingPlan) => {
      // Mock Stripe checkout - in real implementation, this would create a Stripe checkout session
      return new Promise(resolve => setTimeout(resolve, 2000));
    },
    onSuccess: () => {
      toast({
        title: "Redirecting to Checkout",
        description: "You're being redirected to complete your subscription upgrade.",
      });
      // In real implementation, redirect to Stripe checkout
      setIsCheckoutOpen(false);
    },
    onError: () => {
      toast({
        title: "Checkout Error", 
        description: "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpgrade = (plan: PricingPlan) => {
    if (plan.id === currentPlan) {
      toast({
        title: "Current Plan",
        description: "You're already on this plan.",
      });
      return;
    }

    setSelectedPlan(plan);
    setIsCheckoutOpen(true);
  };

  const handleCheckout = () => {
    if (selectedPlan) {
      checkoutMutation.mutate(selectedPlan);
    }
  };

  const getPlanStatus = (planId: string) => {
    if (planId === currentPlan) {
      return "current";
    }
    
    const currentPlanIndex = plans.findIndex(p => p.id === currentPlan);
    const planIndex = plans.findIndex(p => p.id === planId);
    
    if (planIndex > currentPlanIndex) {
      return "upgrade";
    } else {
      return "downgrade";
    }
  };

  const getButtonText = (plan: PricingPlan) => {
    const status = getPlanStatus(plan.id);
    
    switch (status) {
      case "current":
        return "Current Plan";
      case "upgrade":
        return "Upgrade";
      case "downgrade":
        return "Downgrade";
      default:
        return "Select Plan";
    }
  };

  const getButtonVariant = (plan: PricingPlan) => {
    const status = getPlanStatus(plan.id);
    
    if (status === "current") return "outline";
    if (plan.popular) return "default";
    return "outline";
  };

  const annualSavings = (plan: PricingPlan) => {
    const monthlyCost = plan.monthlyPrice * 12;
    const savings = monthlyCost - plan.annualPrice;
    const percentage = Math.round((savings / monthlyCost) * 100);
    return { amount: savings, percentage };
  };

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center">
        <div className="bg-muted p-1 rounded-lg flex">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === "monthly" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === "annual"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Annual
            <Badge variant="secondary" className="ml-2 text-xs">
              Save 20%
            </Badge>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const IconComponent = plan.icon;
          const status = getPlanStatus(plan.id);
          const savings = annualSavings(plan);
          
          return (
            <Card 
              key={plan.id} 
              className={`relative hover:shadow-lg transition-shadow ${
                plan.popular ? "border-primary shadow-lg" : ""
              } ${status === "current" ? "border-green-500 bg-green-50 dark:bg-green-900/10" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {status === "current" && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-600 text-white">
                    <Check className="h-3 w-3 mr-1" />
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <div className={`w-12 h-12 ${plan.color} rounded-lg flex items-center justify-center text-white mx-auto mb-4`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
                
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    {plan.price}
                    <span className="text-lg text-muted-foreground">
                      /{billingCycle === "monthly" ? "month" : "year"}
                    </span>
                  </div>
                  
                  {billingCycle === "annual" && (
                    <div className="text-sm text-green-600">
                      Save ${savings.amount}/year ({savings.percentage}% off)
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Plan Limits */}
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      Subscribers
                    </span>
                    <span className="font-semibold">{plan.subscribers}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                      Monthly Emails
                    </span>
                    <span className="font-semibold">{plan.emails}</span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <Button
                  className="w-full"
                  variant={getButtonVariant(plan)}
                  onClick={() => handleUpgrade(plan)}
                  disabled={status === "current"}
                >
                  {status === "upgrade" && <ArrowUpRight className="h-4 w-4 mr-2" />}
                  {getButtonText(plan)}
                </Button>

                {status === "upgrade" && (
                  <p className="text-xs text-center text-muted-foreground">
                    Upgrade anytime • Cancel anytime • No setup fees
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade to {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Complete your subscription upgrade using Stripe checkout
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{selectedPlan.name} Plan</span>
                  <span className="text-lg font-bold">{selectedPlan.price}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Billed {billingCycle} • {selectedPlan.subscribers} subscribers • {selectedPlan.emails} emails/month
                </div>
                
                {billingCycle === "annual" && (
                  <div className="mt-2 text-sm text-green-600">
                    You save ${annualSavings(selectedPlan).amount} with annual billing
                  </div>
                )}
              </div>

              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <CreditCard className="h-4 w-4 text-primary mr-2" />
                    Test Payment Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Test Card:</span>
                      <code className="ml-2 bg-background px-2 py-1 rounded">4242 4242 4242 4242</code>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expiry:</span>
                      <span className="ml-2">Any future date</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">CVC:</span>
                      <span className="ml-2">Any 3 digits</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsCheckoutOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleCheckout}
                  disabled={checkoutMutation.isPending}
                >
                  {checkoutMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Upgrade Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
