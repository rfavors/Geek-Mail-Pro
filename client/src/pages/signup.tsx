import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Crown, Mail, Lock, Loader2, Check, CreditCard } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 19,
    description: "Perfect for small businesses getting started",
    features: [
      "Up to 2,500 subscribers",
      "15,000 emails per month",
      "Custom domain sending",
      "Drag & drop editor",
      "Basic analytics",
      "Email support"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    description: "For growing businesses that need more power",
    features: [
      "Up to 10,000 subscribers",
      "100,000 emails per month",
      "Custom domain sending",
      "Advanced automation",
      "A/B testing",
      "Advanced analytics",
      "Priority support"
    ],
    popular: true
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 149,
    description: "For large organizations with custom needs",
    features: [
      "Unlimited subscribers",
      "Unlimited emails",
      "Dedicated IP",
      "Multi-user accounts",
      "API access",
      "White-label options",
      "24/7 phone support"
    ]
  }
];

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [step, setStep] = useState(1); // 1: Plan selection, 2: Account details, 3: Payment
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    company: ""
  });

  const signupMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include"
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Signup failed");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Account Created Successfully",
        description: "Welcome to Geek Mail Pro! Your trial period has started.",
      });
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Signup Failed",
        description: error.message || "Unable to create account",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    const selectedPlanData = plans.find(p => p.id === selectedPlan);
    
    signupMutation.mutate({
      ...formData,
      plan: selectedPlan,
      planPrice: selectedPlanData?.price
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-xl text-muted-foreground">Start your email marketing journey with a 14-day free trial</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedPlan === plan.id ? 'ring-2 ring-primary border-primary' : ''
                } ${plan.popular ? 'border-primary shadow-lg relative' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground mb-4">{plan.description}</p>
                    <div className="text-3xl font-bold">${plan.price}<span className="text-lg text-muted-foreground">/month</span></div>
                  </div>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Button size="lg" onClick={() => setStep(2)}>
              Continue with {plans.find(p => p.id === selectedPlan)?.name} Plan
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              14-day free trial • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white mx-auto mb-4">
            <Crown className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>
            Sign up for {plans.find(p => p.id === selectedPlan)?.name} plan - ${plans.find(p => p.id === selectedPlan)?.price}/month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company (Optional)</Label>
              <Input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                placeholder="Your company name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="Create a strong password"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Start 14-Day Free Trial
                </>
              )}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Already have an account? <a href="/login" className="text-primary hover:underline">Sign in</a></p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}