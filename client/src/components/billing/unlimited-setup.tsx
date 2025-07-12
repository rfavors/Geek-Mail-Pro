import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function UnlimitedSetup() {
  const [email, setEmail] = useState("raymond@thegeektrepreneur.com");
  const [password, setPassword] = useState("Nomorelies101@");
  const [isLoading, setIsLoading] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const { toast } = useToast();

  const handleActivate = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/admin/setup-unlimited-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      
      if (result.success) {
        setIsActivated(true);
        toast({
          title: "Unlimited Plan Activated!",
          description: "Your account now has unlimited access to all features.",
        });
      } else {
        toast({
          title: "Activation Failed",
          description: result.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate unlimited plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isActivated) {
    return (
      <Card className="border-green-500 bg-green-50 dark:bg-green-900/10">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white mx-auto mb-4">
            <Check className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl text-green-700 dark:text-green-300">
            Unlimited Plan Activated!
          </CardTitle>
          <CardDescription>
            Your account now has unlimited access to all features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Badge className="bg-green-600 text-white">
              <Crown className="h-3 w-3 mr-1" />
              Unlimited Pro
            </Badge>
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              ✅ Unlimited subscribers<br />
              ✅ Unlimited emails<br />
              ✅ All premium features<br />
              ✅ Priority support
            </p>
          </div>
          <Button 
            className="w-full" 
            onClick={() => window.location.href = '/'}
          >
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-500 bg-purple-50 dark:bg-purple-900/10">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white mx-auto mb-4">
          <Crown className="h-8 w-8" />
        </div>
        <CardTitle className="text-2xl">Activate Unlimited Plan</CardTitle>
        <CardDescription>
          Enter your credentials to activate unlimited access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>
        <Button 
          className="w-full" 
          onClick={handleActivate}
          disabled={isLoading || !email || !password}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Activating...
            </>
          ) : (
            <>
              <Crown className="h-4 w-4 mr-2" />
              Activate Unlimited Plan
            </>
          )}
        </Button>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            This will activate unlimited access for your account
          </p>
        </div>
      </CardContent>
    </Card>
  );
}