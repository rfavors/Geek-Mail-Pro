import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  Mail, 
  MousePointer, 
  Eye,
  Send,
  Clock,
  CheckCircle
} from "lucide-react";

interface CampaignStatsProps {
  campaigns: any[];
}

export function CampaignStats({ campaigns }: CampaignStatsProps) {
  // Calculate stats from campaigns
  const totalCampaigns = campaigns.length;
  const sentCampaigns = campaigns.filter(c => c.status === "sent");
  const draftCampaigns = campaigns.filter(c => c.status === "draft");
  const scheduledCampaigns = campaigns.filter(c => c.status === "scheduled");
  
  const totalSent = sentCampaigns.reduce((sum, c) => sum + (c.totalSent || 0), 0);
  const totalOpens = sentCampaigns.reduce((sum, c) => sum + (c.totalOpens || 0), 0);
  const totalClicks = sentCampaigns.reduce((sum, c) => sum + (c.totalClicks || 0), 0);
  
  const avgOpenRate = totalSent > 0 ? ((totalOpens / totalSent) * 100) : 0;
  const avgClickRate = totalSent > 0 ? ((totalClicks / totalSent) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Campaigns</p>
              <p className="text-2xl font-bold">{totalCampaigns}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                <Send className="h-3 w-3 mr-1" />
                {sentCampaigns.length} sent
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {draftCampaigns.length} drafts
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Reach</p>
              <p className="text-2xl font-bold">{totalSent.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-green-600 text-sm">
              {scheduledCampaigns.length} scheduled
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Open Rate</p>
              <p className="text-2xl font-bold">{avgOpenRate.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-green-600 text-sm">
              {avgOpenRate > 25 ? "Above" : "Below"} industry avg
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Click Rate</p>
              <p className="text-2xl font-bold">{avgClickRate.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <MousePointer className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-green-600 text-sm">
              {avgClickRate > 3 ? "Above" : "Below"} industry avg
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
