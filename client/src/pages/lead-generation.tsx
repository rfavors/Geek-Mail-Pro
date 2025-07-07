import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Plus, 
  TrendingUp, 
  Users, 
  Target,
  Linkedin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Zap,
  Building2,
  Star,
  ArrowRight,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const LEAD_SOURCES = [
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-600', estimate: '~50 leads' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-500', estimate: '~35 leads' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-500', estimate: '~25 leads' },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'bg-black', estimate: '~30 leads' },
  { id: 'tiktok', name: 'TikTok', icon: Youtube, color: 'bg-black', estimate: '~20 leads' },
  { id: 'google', name: 'Google Business', icon: Building2, color: 'bg-red-500', estimate: '~40 leads' },
  { id: 'yelp', name: 'Yelp', icon: Star, color: 'bg-red-600', estimate: '~35 leads' },
  { id: 'yellowpages', name: 'Yellow Pages', icon: Search, color: 'bg-yellow-500', estimate: '~25 leads' },
  { id: 'zillow', name: 'Zillow', icon: Building2, color: 'bg-blue-700', estimate: '~30 leads' },
  { id: 'realtor', name: 'Realtor.com', icon: Building2, color: 'bg-green-600', estimate: '~28 leads' },
  { id: 'reddit', name: 'Reddit', icon: Target, color: 'bg-orange-500', estimate: '~20 leads' },
  { id: 'quora', name: 'Quora', icon: Target, color: 'bg-red-700', estimate: '~15 leads' },
  { id: 'upwork', name: 'Upwork', icon: Building2, color: 'bg-green-500', estimate: '~18 leads' },
  { id: 'medium', name: 'Medium', icon: Building2, color: 'bg-gray-800', estimate: '~12 leads' },
  { id: 'thumbtack', name: 'Thumbtack', icon: Zap, color: 'bg-green-600', estimate: '~22 leads' }
];

const PROFESSIONS = [
  'Real Estate Agent', 'Marketing Consultant', 'Software Developer', 'Graphic Designer',
  'Personal Trainer', 'Accountant', 'Lawyer', 'Doctor', 'Dentist', 'Photographer',
  'Wedding Planner', 'Interior Designer', 'Architect', 'Life Coach', 'Nutritionist',
  'Financial Advisor', 'Insurance Agent', 'Contractor', 'Plumber', 'Electrician',
  'Hair Stylist', 'Massage Therapist', 'Chiropractor', 'Veterinarian', 'Restaurant Owner'
];

export default function LeadGeneration() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedProfession, setSelectedProfession] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [searchLocation, setSearchLocation] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch lead sources
  const { data: leadSources = [], isLoading: sourcesLoading } = useQuery({
    queryKey: ["/api/lead-sources"],
    enabled: isAuthenticated,
  });

  // Fetch leads
  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ["/api/leads"],
    enabled: isAuthenticated,
  });

  // Fetch lead campaigns
  const { data: leadCampaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/lead-campaigns"],
    enabled: isAuthenticated,
  });

  const createLeadSourceMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/lead-sources", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-sources"] });
      toast({
        title: "Success",
        description: "Lead source created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create lead source",
        variant: "destructive",
      });
    },
  });

  const generateLeadsMutation = useMutation({
    mutationFn: async (data: any) => {
      // Simulate lead generation process
      setIsGenerating(true);
      
      // Create leads for demonstration
      const mockLeads = [];
      const firstNames = ['John', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'Chris', 'Jessica', 'Mark', 'Amanda'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
      const companies = ['ABC Corp', 'XYZ Ltd', 'Tech Solutions', 'Creative Agency', 'Global Services', 'Innovation Hub'];

      for (let i = 0; i < data.expectedLeads; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const company = companies[Math.floor(Math.random() * companies.length)];
        
        const lead = {
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
          firstName,
          lastName,
          company,
          jobTitle: data.profession,
          location: data.location,
          score: Math.floor(Math.random() * 40) + 60, // 60-100 score
          status: 'new',
          tags: [data.profession.toLowerCase(), data.location.toLowerCase()],
          metadata: {
            source: data.sources[Math.floor(Math.random() * data.sources.length)],
            foundAt: new Date().toISOString()
          }
        };
        
        mockLeads.push(lead);
      }

      // Create leads in batches
      for (const lead of mockLeads) {
        await apiRequest("/api/leads", "POST", lead);
      }

      return mockLeads;
    },
    onSuccess: (data) => {
      setIsGenerating(false);
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Success",
        description: `Generated ${data.length} new leads successfully`,
      });
    },
    onError: (error) => {
      setIsGenerating(false);
      toast({
        title: "Error",
        description: "Failed to generate leads",
        variant: "destructive",
      });
    },
  });

  const handleSourceToggle = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleGenerateLeads = () => {
    if (!selectedProfession || selectedSources.length === 0) {
      toast({
        title: "Error",
        description: "Please select a profession and at least one source",
        variant: "destructive",
      });
      return;
    }

    const expectedLeads = selectedSources.reduce((total, sourceId) => {
      const source = LEAD_SOURCES.find(s => s.id === sourceId);
      const estimate = parseInt(source?.estimate.match(/\d+/)?.[0] || '0');
      return total + estimate;
    }, 0);

    generateLeadsMutation.mutate({
      profession: selectedProfession,
      sources: selectedSources,
      location: searchLocation || 'United States',
      expectedLeads: Math.floor(expectedLeads * 0.8) // 80% success rate
    });
  };

  if (authLoading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lead Generation</h1>
          <p className="text-muted-foreground">
            Generate leads from multiple platforms and sources
          </p>
        </div>
        <Button onClick={() => queryClient.invalidateQueries()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Generate New Leads
            </CardTitle>
            <CardDescription>
              Select a profession and platforms to find potential leads
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Select Profession</Label>
                <Select value={selectedProfession} onValueChange={setSelectedProfession}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a profession..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFESSIONS.map((profession) => (
                      <SelectItem key={profession} value={profession}>
                        {profession}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location (Optional)</Label>
                <Input
                  placeholder="e.g., New York, NY"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Select Platforms to Search</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {LEAD_SOURCES.map((source) => {
                  const Icon = source.icon;
                  const isSelected = selectedSources.includes(source.id);
                  
                  return (
                    <Card
                      key={source.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleSourceToggle(source.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className={`w-12 h-12 rounded-lg ${source.color} flex items-center justify-center mx-auto mb-2`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-medium text-sm">{source.name}</h3>
                        <p className="text-xs text-muted-foreground">{source.estimate}</p>
                        {isSelected && (
                          <Badge variant="default" className="mt-2">
                            Selected
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {selectedSources.length > 0 && (
                  <>
                    Expected leads: ~{selectedSources.reduce((total, sourceId) => {
                      const source = LEAD_SOURCES.find(s => s.id === sourceId);
                      const estimate = parseInt(source?.estimate.match(/\d+/)?.[0] || '0');
                      return total + estimate;
                    }, 0)} leads
                  </>
                )}
              </div>
              <Button 
                onClick={handleGenerateLeads}
                disabled={!selectedProfession || selectedSources.length === 0 || isGenerating}
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Leads
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leads" className="space-y-6">
        <TabsList>
          <TabsTrigger value="leads">Recent Leads ({leads.length})</TabsTrigger>
          <TabsTrigger value="sources">Lead Sources ({leadSources.length})</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns ({leadCampaigns.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-4">
          {leadsLoading ? (
            <div className="text-center py-8">Loading leads...</div>
          ) : leads.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No leads yet</h3>
                <p className="text-muted-foreground mb-4">
                  Generate your first leads using the form above
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {leads.slice(0, 10).map((lead: any) => (
                <Card key={lead.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{lead.firstName} {lead.lastName}</h3>
                          <p className="text-sm text-muted-foreground">{lead.email}</p>
                          {lead.company && (
                            <p className="text-sm text-muted-foreground">{lead.company}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={lead.status === 'new' ? 'default' : 'secondary'}>
                          {lead.status}
                        </Badge>
                        <Badge variant="outline">
                          Score: {lead.score}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Lead Sources</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Source
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Lead Source</DialogTitle>
                  <DialogDescription>
                    Configure a new lead generation source
                  </DialogDescription>
                </DialogHeader>
                {/* Add lead source form here */}
              </DialogContent>
            </Dialog>
          </div>
          
          {sourcesLoading ? (
            <div className="text-center py-8">Loading sources...</div>
          ) : leadSources.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No lead sources configured</h3>
                <p className="text-muted-foreground">
                  Add your first lead source to start generating leads
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {leadSources.map((source: any) => (
                <Card key={source.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{source.name}</h3>
                        <p className="text-sm text-muted-foreground">{source.type}</p>
                        <p className="text-sm text-muted-foreground">
                          Total leads: {source.totalLeads}
                        </p>
                      </div>
                      <Badge variant={source.isActive ? 'default' : 'secondary'}>
                        {source.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Lead Campaigns</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>
          
          {campaignsLoading ? (
            <div className="text-center py-8">Loading campaigns...</div>
          ) : leadCampaigns.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No lead campaigns</h3>
                <p className="text-muted-foreground">
                  Create campaigns to organize your lead generation efforts
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {leadCampaigns.map((campaign: any) => (
                <Card key={campaign.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground">{campaign.description}</p>
                        <div className="flex space-x-4 mt-2 text-sm text-muted-foreground">
                          <span>Total: {campaign.totalLeads}</span>
                          <span>Qualified: {campaign.qualifiedLeads}</span>
                          <span>Converted: {campaign.convertedLeads}</span>
                        </div>
                      </div>
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}