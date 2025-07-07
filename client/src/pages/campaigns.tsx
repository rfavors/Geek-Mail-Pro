import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { 
  Mail, 
  Plus, 
  Send, 
  Clock, 
  Eye,
  MousePointer,
  Search,
  Filter,
  Calendar,
  Users,
  BarChart3
} from "lucide-react";
import { CampaignBuilder } from "@/components/campaigns/campaign-builder";
import { CampaignStats } from "@/components/campaigns/campaign-stats";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Campaigns() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

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

  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/campaigns"],
    enabled: isAuthenticated,
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignId: number) => {
      return await apiRequest("POST", `/api/campaigns/${campaignId}/send`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campaign Sent",
        description: "Your campaign has been sent successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to send campaign. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-background" />;
  }

  const filteredCampaigns = campaigns?.filter((campaign: any) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent": return <Send className="h-4 w-4" />;
      case "scheduled": return <Calendar className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent": return "default";
      case "scheduled": return "secondary";
      case "sending": return "default";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Campaigns</h1>
          <p className="text-muted-foreground">Create, manage, and track your email marketing campaigns</p>
        </div>
        <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedCampaign(null)}>
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedCampaign ? "Edit Campaign" : "Create New Campaign"}
              </DialogTitle>
              <DialogDescription>
                Design and configure your email campaign with our drag-and-drop builder.
              </DialogDescription>
            </DialogHeader>
            <CampaignBuilder 
              campaign={selectedCampaign}
              onSave={() => {
                setIsBuilderOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
              }}
              onCancel={() => setIsBuilderOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaign Stats Overview */}
      <CampaignStats campaigns={campaigns || []} />

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Campaigns</CardTitle>
              <CardDescription>Manage your email marketing campaigns</CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="sending">Sending</option>
                <option value="sent">Sent</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {campaignsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : filteredCampaigns.length > 0 ? (
            <div className="space-y-4">
              {filteredCampaigns.map((campaign: any) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center text-white">
                      {getStatusIcon(campaign.status)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {campaign.totalSent?.toLocaleString() || 0} recipients
                        </span>
                        {campaign.sentAt && (
                          <span className="text-xs text-muted-foreground">
                            Sent {new Date(campaign.sentAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    {campaign.status === "sent" && (
                      <>
                        <div className="text-center">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{campaign.openRate}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Opens</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center space-x-1">
                            <MousePointer className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{campaign.clickRate}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Clicks</p>
                        </div>
                      </>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(campaign.status) as any}>
                        {campaign.status}
                      </Badge>
                      
                      {campaign.status === "draft" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setIsBuilderOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      )}
                      
                      {(campaign.status === "draft" || campaign.status === "scheduled") && (
                        <Button
                          size="sm"
                          onClick={() => sendCampaignMutation.mutate(campaign.id)}
                          disabled={sendCampaignMutation.isPending}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Send
                        </Button>
                      )}
                      
                      {campaign.status === "sent" && (
                        <Button size="sm" variant="outline">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          View Report
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm || statusFilter !== "all" ? "No campaigns found" : "No campaigns yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "Create your first email campaign to get started with Mail-Geek."
                }
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button onClick={() => setIsBuilderOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Campaign
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
