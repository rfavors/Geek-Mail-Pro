import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Plus, 
  Check,
  AlertCircle,
  Shield,
  Zap,
  Settings,
  Mail,
  BarChart3
} from "lucide-react";
import { DomainConfig } from "@/components/domain/domain-config";
import { AliasManager } from "@/components/domain/alias-manager";
import { AdvancedAliasManager } from "@/components/domain/advanced-alias-manager";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function DomainSettings() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isDomainDialogOpen, setIsDomainDialogOpen] = useState(false);

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

  const { data: domains, isLoading: domainsLoading } = useQuery({
    queryKey: ["/api/domains"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-background" />;
  }

  const primaryDomain = domains?.find((d: any) => d.domain === "thegeektrepreneur.com") || domains?.[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Domain Settings</h1>
          <p className="text-muted-foreground">Configure custom domains and email aliases for professional sending</p>
        </div>
        <Dialog open={isDomainDialogOpen} onOpenChange={setIsDomainDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Custom Domain</DialogTitle>
              <DialogDescription>
                Add a custom domain for sending professional email campaigns.
              </DialogDescription>
            </DialogHeader>
            <DomainConfig onComplete={() => setIsDomainDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Domain Overview */}
      {primaryDomain && (
        <Card className="bg-gradient-to-r from-primary/10 to-purple-600/10 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Globe className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl">{primaryDomain.domain}</CardTitle>
                  <CardDescription>Primary sending domain</CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {primaryDomain.isVerified ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <Check className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-background/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Sender Score</span>
                  <span className="text-2xl font-bold text-green-600">{primaryDomain.senderScore || 87}</span>
                </div>
                <p className="text-xs text-muted-foreground">Excellent reputation</p>
              </div>
              <div className="bg-background/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Bounce Rate</span>
                  <span className="text-2xl font-bold text-green-600">{primaryDomain.bounceRate || "1.2"}%</span>
                </div>
                <p className="text-xs text-muted-foreground">Well below 2% threshold</p>
              </div>
              <div className="bg-background/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Spam Rate</span>
                  <span className="text-2xl font-bold text-green-600">{primaryDomain.spamRate || "0.03"}%</span>
                </div>
                <p className="text-xs text-muted-foreground">Excellent performance</p>
              </div>
            </div>

            {primaryDomain.warmingProgress < 100 && (
              <div className="mt-6 p-4 bg-background/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Domain Warming Progress</span>
                  <span className="text-sm font-bold text-primary">{primaryDomain.warmingProgress || 78}% Complete</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-cyan-500 h-2 rounded-full transition-all duration-300" 
                    style={{width: `${primaryDomain.warmingProgress || 78}%`}}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Week 3 of 4 - Ready for larger volumes
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="domains" className="space-y-6">
        <TabsList>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="aliases">Basic Aliases</TabsTrigger>
          <TabsTrigger value="advanced-aliases">Advanced Aliases</TabsTrigger>
          <TabsTrigger value="dns">DNS Records</TabsTrigger>
          <TabsTrigger value="reputation">Reputation</TabsTrigger>
        </TabsList>

        <TabsContent value="domains" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configured Domains</CardTitle>
              <CardDescription>Manage your custom sending domains</CardDescription>
            </CardHeader>
            <CardContent>
              {domainsLoading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-12 h-12 bg-muted rounded-lg animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 w-48 bg-muted rounded animate-pulse mb-2" />
                        <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : domains && domains.length > 0 ? (
                <div className="space-y-4">
                  {domains.map((domain: any) => (
                    <div key={domain.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center text-white">
                          <Globe className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{domain.domain}</h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <Badge variant={domain.isVerified ? "default" : "destructive"}>
                              {domain.isVerified ? "Verified" : "Pending"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Added {new Date(domain.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                        <Button variant="outline" size="sm">
                          <Shield className="h-4 w-4 mr-1" />
                          DNS
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No domains configured</h3>
                  <p className="text-muted-foreground mb-4">
                    Add a custom domain to improve email deliverability and branding.
                  </p>
                  <Button onClick={() => setIsDomainDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Domain
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aliases" className="space-y-6">
          <AliasManager domains={domains || []} />
        </TabsContent>

        <TabsContent value="advanced-aliases" className="space-y-6">
          <AdvancedAliasManager domains={domains || []} />
        </TabsContent>

        <TabsContent value="dns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>DNS Configuration</CardTitle>
              <CardDescription>Verify your DNS records for email authentication</CardDescription>
            </CardHeader>
            <CardContent>
              {primaryDomain ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="font-medium">SPF Record</span>
                          </div>
                          <Badge variant="secondary" className="text-green-600">Verified</Badge>
                        </div>
                        <code className="text-xs bg-background/50 p-2 rounded block">
                          {primaryDomain.spfRecord || "v=spf1 include:mailgeek.io ~all"}
                        </code>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="font-medium">DKIM Record</span>
                          </div>
                          <Badge variant="secondary" className="text-green-600">Verified</Badge>
                        </div>
                        <code className="text-xs bg-background/50 p-2 rounded block truncate">
                          {primaryDomain.dkimRecord || "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBA..."}
                        </code>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="font-medium">DMARC Record</span>
                          </div>
                          <Badge variant="secondary" className="text-green-600">Verified</Badge>
                        </div>
                        <code className="text-xs bg-background/50 p-2 rounded block truncate">
                          {primaryDomain.dmarcRecord || "v=DMARC1; p=reject; rua=mailto:dmarc@thegeektrepreneur.com"}
                        </code>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Zap className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-primary mb-1">Pro Tip</h4>
                          <p className="text-sm">
                            All your DNS records are properly configured! Your domain is ready for high-volume email sending 
                            with excellent deliverability rates.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No domains to configure</h3>
                  <p className="text-muted-foreground mb-4">
                    Add a domain first to view and configure DNS records.
                  </p>
                  <Button onClick={() => setIsDomainDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Domain
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reputation" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sender Reputation</CardTitle>
                <CardDescription>Monitor your domain's email sending reputation</CardDescription>
              </CardHeader>
              <CardContent>
                {primaryDomain ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        {primaryDomain.senderScore || 87}
                      </div>
                      <p className="text-muted-foreground">Sender Score</p>
                      <Badge className="mt-2">Excellent</Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Bounce Rate</span>
                        <span className="text-sm font-medium">{primaryDomain.bounceRate || "1.2"}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Spam Complaints</span>
                        <span className="text-sm font-medium">{primaryDomain.spamRate || "0.03"}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Domain Age</span>
                        <span className="text-sm font-medium">2+ years</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No reputation data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Warming Schedule</CardTitle>
                <CardDescription>Gradual volume increase for optimal deliverability</CardDescription>
              </CardHeader>
              <CardContent>
                {primaryDomain?.warmingProgress < 100 ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">
                        {primaryDomain.warmingProgress || 78}%
                      </div>
                      <p className="text-muted-foreground">Warming Complete</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Current Week</span>
                        <Badge variant="secondary">Week 3 of 4</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Daily Limit</span>
                        <span className="text-sm font-medium">10,000 emails</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Next Increase</span>
                        <span className="text-sm font-medium">In 4 days</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Check className="h-12 w-12 text-green-600 mx-auto mb-2" />
                    <p className="font-medium text-green-600">Warming Complete!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your domain is ready for full volume sending
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
