import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Mail, 
  TrendingUp, 
  DollarSign, 
  Send, 
  Clock, 
  Eye,
  MousePointer
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/stats"],
    enabled: isAuthenticated,
  });

  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/campaigns"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your campaign overview.</p>
        </div>
        <Button>
          <Mail className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Subscribers</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.totalSubscribers?.toLocaleString() || 0}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600 text-sm">12%</span>
              <span className="text-muted-foreground text-sm ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Rate</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.avgOpenRate?.toFixed(1) || 0}%</p>
                )}
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600 text-sm">9.4%</span>
              <span className="text-muted-foreground text-sm ml-2">above industry avg</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Click Rate</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.avgClickRate?.toFixed(1) || 0}%</p>
                )}
              </div>
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/20 rounded-lg flex items-center justify-center">
                <MousePointer className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600 text-sm">3.1%</span>
              <span className="text-muted-foreground text-sm ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">${stats?.totalRevenue?.toLocaleString() || 0}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600 text-sm">18%</span>
              <span className="text-muted-foreground text-sm ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
          <CardDescription>Your latest email marketing campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          {campaignsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : campaigns && campaigns.length > 0 ? (
            <div className="space-y-4">
              {campaigns.slice(0, 5).map((campaign: any) => (
                <div key={campaign.id} className="flex items-center justify-between hover:bg-muted/50 p-3 rounded-lg transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                      {campaign.status === "sent" ? (
                        <Send className="h-5 w-5 text-white" />
                      ) : (
                        <Clock className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{campaign.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {campaign.status === "sent" 
                          ? `Sent to ${campaign.totalSent?.toLocaleString() || 0} subscribers`
                          : campaign.status === "scheduled"
                          ? "Scheduled for delivery"
                          : "Draft campaign"
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    {campaign.status === "sent" && (
                      <>
                        <div className="text-center">
                          <p className="text-sm font-medium">{campaign.openRate}%</p>
                          <p className="text-xs text-muted-foreground">Open Rate</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{campaign.clickRate}%</p>
                          <p className="text-xs text-muted-foreground">Click Rate</p>
                        </div>
                      </>
                    )}
                    <Badge 
                      variant={
                        campaign.status === "sent" ? "default" :
                        campaign.status === "scheduled" ? "secondary" : 
                        "outline"
                      }
                    >
                      {campaign.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first email campaign to get started with Mail-Geek.
              </p>
              <Button>
                <Mail className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
