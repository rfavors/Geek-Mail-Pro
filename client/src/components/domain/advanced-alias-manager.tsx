import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Mail, 
  Settings, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Forward, 
  Filter,
  BarChart3,
  Eye,
  Edit,
  Copy,
  RotateCcw
} from "lucide-react";

interface Domain {
  id: number;
  domain: string;
  isVerified: boolean;
}

interface EmailAlias {
  id: number;
  domainId: number;
  alias: string;
  destination?: string;
  isVerified: boolean;
  isActive: boolean;
  description?: string;
  forwardingType: string;
  autoReply: boolean;
  autoReplyMessage?: string;
  createdAt: string;
  updatedAt: string;
}

interface ForwardingRule {
  id: number;
  aliasId: number;
  name: string;
  priority: number;
  isActive: boolean;
  conditions: any;
  actions: any;
  createdAt: string;
  updatedAt: string;
}

interface ForwardingDestination {
  id: number;
  aliasId: number;
  email: string;
  name?: string;
  weight: number;
  isActive: boolean;
  createdAt: string;
}

interface ForwardingStats {
  totalForwarded: number;
  totalBlocked: number;
  totalAutoReplied: number;
  successRate: number;
}

const aliasSchema = z.object({
  alias: z.string().min(1, "Alias is required").regex(/^[a-zA-Z0-9._-]+$/, "Invalid alias format"),
  destination: z.string().email("Invalid email address").optional(),
  description: z.string().optional(),
  forwardingType: z.enum(["simple", "conditional", "split", "round_robin"]),
  autoReply: z.boolean(),
  autoReplyMessage: z.string().optional(),
});

const ruleSchema = z.object({
  name: z.string().min(1, "Rule name is required"),
  priority: z.number().min(1).max(100),
  conditions: z.object({
    fromDomain: z.string().optional(),
    subjectContains: z.string().optional(),
    hasAttachment: z.boolean().optional(),
  }),
  actions: z.object({
    forwardTo: z.array(z.string().email()),
    block: z.boolean().optional(),
    autoReply: z.boolean().optional(),
    autoReplyMessage: z.string().optional(),
  }),
});

const destinationSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
  weight: z.number().min(1).max(10),
});

type AliasFormData = z.infer<typeof aliasSchema>;
type RuleFormData = z.infer<typeof ruleSchema>;
type DestinationFormData = z.infer<typeof destinationSchema>;

interface AdvancedAliasManagerProps {
  domains: Domain[];
}

export function AdvancedAliasManager({ domains }: AdvancedAliasManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAlias, setSelectedAlias] = useState<EmailAlias | null>(null);
  const [isAliasDialogOpen, setIsAliasDialogOpen] = useState(false);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [isDestinationDialogOpen, setIsDestinationDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ForwardingRule | null>(null);
  const [editingDestination, setEditingDestination] = useState<ForwardingDestination | null>(null);

  const primaryDomain = domains.find(d => d.domain === "thegeektrepreneur.com") || domains[0];

  const { data: aliases, isLoading: aliasesLoading } = useQuery({
    queryKey: [`/api/domains/${primaryDomain?.id}/aliases`],
    enabled: !!primaryDomain?.id,
  });

  const { data: forwardingRules } = useQuery({
    queryKey: ["/api/forwarding-rules", "alias", selectedAlias?.id],
    enabled: !!selectedAlias?.id,
  });

  const { data: forwardingDestinations } = useQuery({
    queryKey: ["/api/forwarding-destinations", "alias", selectedAlias?.id],
    enabled: !!selectedAlias?.id,
  });

  const { data: forwardingStats } = useQuery({
    queryKey: ["/api/forwarding-stats", "alias", selectedAlias?.id],
    enabled: !!selectedAlias?.id,
  });

  const aliasForm = useForm<AliasFormData>({
    resolver: zodResolver(aliasSchema),
    defaultValues: {
      alias: "",
      destination: "",
      description: "",
      forwardingType: "simple",
      autoReply: false,
      autoReplyMessage: "",
    },
  });

  const ruleForm = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      name: "",
      priority: 1,
      conditions: {},
      actions: { forwardTo: [] },
    },
  });

  const destinationForm = useForm<DestinationFormData>({
    resolver: zodResolver(destinationSchema),
    defaultValues: {
      email: "",
      name: "",
      weight: 1,
    },
  });

  const createAliasMutation = useMutation({
    mutationFn: async (data: AliasFormData) => {
      return apiRequest(`/api/domains/${primaryDomain.id}/aliases`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/domains/${primaryDomain.id}/aliases`] });
      queryClient.invalidateQueries({ queryKey: ["/api/domains"] });
      setIsAliasDialogOpen(false);
      aliasForm.reset();
      toast({
        title: "Alias Created",
        description: "Your email alias has been successfully created.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create email alias. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createRuleMutation = useMutation({
    mutationFn: async (data: RuleFormData) => {
      return apiRequest("/api/forwarding-rules", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          aliasId: selectedAlias?.id,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forwarding-rules", "alias", selectedAlias?.id] });
      setIsRuleDialogOpen(false);
      ruleForm.reset();
      toast({
        title: "Rule Created",
        description: "Forwarding rule has been successfully created.",
      });
    },
  });

  const createDestinationMutation = useMutation({
    mutationFn: async (data: DestinationFormData) => {
      return apiRequest("/api/forwarding-destinations", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          aliasId: selectedAlias?.id,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forwarding-destinations", "alias", selectedAlias?.id] });
      setIsDestinationDialogOpen(false);
      destinationForm.reset();
      toast({
        title: "Destination Added",
        description: "Forwarding destination has been successfully added.",
      });
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (ruleId: number) => {
      return apiRequest(`/api/forwarding-rules/${ruleId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forwarding-rules", "alias", selectedAlias?.id] });
      toast({
        title: "Rule Deleted",
        description: "Forwarding rule has been successfully deleted.",
      });
    },
  });

  const deleteDestinationMutation = useMutation({
    mutationFn: async (destinationId: number) => {
      return apiRequest(`/api/forwarding-destinations/${destinationId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forwarding-destinations", "alias", selectedAlias?.id] });
      toast({
        title: "Destination Removed",
        description: "Forwarding destination has been successfully removed.",
      });
    },
  });

  const onSubmitAlias = (data: AliasFormData) => {
    createAliasMutation.mutate(data);
  };

  const onSubmitRule = (data: RuleFormData) => {
    createRuleMutation.mutate(data);
  };

  const onSubmitDestination = (data: DestinationFormData) => {
    createDestinationMutation.mutate(data);
  };

  const handleSelectAlias = (alias: EmailAlias) => {
    setSelectedAlias(alias);
  };

  if (aliasesLoading) {
    return <div className="flex items-center justify-center p-8">Loading aliases...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Email Alias Management</h2>
          <p className="text-muted-foreground">
            Manage email aliases with sophisticated forwarding rules for {primaryDomain?.domain}
          </p>
        </div>
        <Dialog open={isAliasDialogOpen} onOpenChange={setIsAliasDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Alias
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Advanced Email Alias</DialogTitle>
              <DialogDescription>
                Set up an email alias with advanced forwarding and auto-reply features
              </DialogDescription>
            </DialogHeader>
            <Form {...aliasForm}>
              <form onSubmit={aliasForm.handleSubmit(onSubmitAlias)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={aliasForm.control}
                    name="alias"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alias Name</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Input placeholder="support" {...field} />
                            <span className="text-muted-foreground">@{primaryDomain?.domain}</span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={aliasForm.control}
                    name="forwardingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Forwarding Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select forwarding type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="simple">Simple Forward</SelectItem>
                            <SelectItem value="conditional">Conditional Rules</SelectItem>
                            <SelectItem value="split">Split Testing</SelectItem>
                            <SelectItem value="round_robin">Round Robin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={aliasForm.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Destination (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="user@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={aliasForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Customer support inquiries" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={aliasForm.control}
                  name="autoReply"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Auto-Reply</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Automatically send a reply to incoming emails
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {aliasForm.watch("autoReply") && (
                  <FormField
                    control={aliasForm.control}
                    name="autoReplyMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Auto-Reply Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Thank you for your email. We'll get back to you within 24 hours." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAliasDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createAliasMutation.isPending}>
                    {createAliasMutation.isPending ? "Creating..." : "Create Alias"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aliases List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Email Aliases</CardTitle>
              <CardDescription>Select an alias to manage forwarding rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {aliases?.map((alias: EmailAlias) => (
                  <div
                    key={alias.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedAlias?.id === alias.id
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => handleSelectAlias(alias)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {alias.alias}@{primaryDomain?.domain}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {alias.forwardingType?.replace("_", " ") || "Simple"}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {alias.isActive && (
                          <Badge variant={alias.isVerified ? "default" : "secondary"} className="text-xs">
                            {alias.isVerified ? "Active" : "Pending"}
                          </Badge>
                        )}
                        {alias.autoReply && (
                          <Badge variant="outline" className="text-xs">
                            Auto-Reply
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {!aliases?.length && (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No aliases created yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alias Details */}
        <div className="lg:col-span-2">
          {selectedAlias ? (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="rules">Forwarding Rules</TabsTrigger>
                <TabsTrigger value="destinations">Destinations</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{selectedAlias.alias}@{primaryDomain?.domain}</span>
                      <Badge variant={selectedAlias.isActive ? "default" : "secondary"}>
                        {selectedAlias.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{selectedAlias.description || "No description"}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Forwarding Type</Label>
                        <p className="font-medium capitalize">
                          {selectedAlias.forwardingType?.replace("_", " ") || "Simple"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Primary Destination</Label>
                        <p className="font-medium">{selectedAlias.destination || "Not set"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Auto-Reply</Label>
                        <p className="font-medium">{selectedAlias.autoReply ? "Enabled" : "Disabled"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                        <p className="font-medium">{new Date(selectedAlias.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {selectedAlias.autoReply && selectedAlias.autoReplyMessage && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Auto-Reply Message</Label>
                        <div className="mt-1 p-3 bg-muted rounded-lg">
                          <p className="text-sm">{selectedAlias.autoReplyMessage}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rules">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Forwarding Rules</CardTitle>
                        <CardDescription>Conditional rules for smart email routing</CardDescription>
                      </div>
                      <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Rule
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create Forwarding Rule</DialogTitle>
                            <DialogDescription>
                              Define conditions and actions for smart email forwarding
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...ruleForm}>
                            <form onSubmit={ruleForm.handleSubmit(onSubmitRule)} className="space-y-4">
                              <FormField
                                control={ruleForm.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Rule Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Priority Customer Support" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={ruleForm.control}
                                name="priority"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Priority (1-100)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        min="1" 
                                        max="100" 
                                        {...field} 
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <div className="space-y-3">
                                <Label className="text-base font-medium">Conditions</Label>
                                <div className="space-y-3 p-3 border rounded-lg">
                                  <div>
                                    <Label className="text-sm">From Domain Contains</Label>
                                    <Input 
                                      placeholder="example.com" 
                                      onChange={(e) => ruleForm.setValue("conditions.fromDomain", e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm">Subject Contains</Label>
                                    <Input 
                                      placeholder="urgent" 
                                      onChange={(e) => ruleForm.setValue("conditions.subjectContains", e.target.value)}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <Label className="text-base font-medium">Actions</Label>
                                <div className="space-y-3 p-3 border rounded-lg">
                                  <div>
                                    <Label className="text-sm">Forward To (comma-separated emails)</Label>
                                    <Input 
                                      placeholder="manager@company.com, support@company.com" 
                                      onChange={(e) => {
                                        const emails = e.target.value.split(",").map(email => email.trim()).filter(Boolean);
                                        ruleForm.setValue("actions.forwardTo", emails);
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setIsRuleDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button type="submit" disabled={createRuleMutation.isPending}>
                                  {createRuleMutation.isPending ? "Creating..." : "Create Rule"}
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {forwardingRules?.map((rule: ForwardingRule) => (
                        <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{rule.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                Priority {rule.priority}
                              </Badge>
                              <Badge variant={rule.isActive ? "default" : "secondary"} className="text-xs">
                                {rule.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {rule.conditions?.fromDomain && `From: ${rule.conditions.fromDomain} • `}
                              {rule.conditions?.subjectContains && `Subject: ${rule.conditions.subjectContains} • `}
                              Forward to: {rule.actions?.forwardTo?.join(", ") || "Not configured"}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteRuleMutation.mutate(rule.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {!forwardingRules?.length && (
                        <div className="text-center py-8">
                          <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">No forwarding rules configured</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="destinations">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Forwarding Destinations</CardTitle>
                        <CardDescription>Manage email forwarding destinations</CardDescription>
                      </div>
                      <Dialog open={isDestinationDialogOpen} onOpenChange={setIsDestinationDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Destination
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Forwarding Destination</DialogTitle>
                            <DialogDescription>
                              Add a new email destination for forwarding
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...destinationForm}>
                            <form onSubmit={destinationForm.handleSubmit(onSubmitDestination)} className="space-y-4">
                              <FormField
                                control={destinationForm.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                      <Input placeholder="user@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={destinationForm.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Display Name (Optional)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={destinationForm.control}
                                name="weight"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Weight (1-10)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        min="1" 
                                        max="10" 
                                        {...field} 
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setIsDestinationDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button type="submit" disabled={createDestinationMutation.isPending}>
                                  {createDestinationMutation.isPending ? "Adding..." : "Add Destination"}
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {forwardingDestinations?.map((destination: ForwardingDestination) => (
                        <div key={destination.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{destination.email}</h4>
                              {destination.name && (
                                <span className="text-sm text-muted-foreground">({destination.name})</span>
                              )}
                              <Badge variant="outline" className="text-xs">
                                Weight {destination.weight}
                              </Badge>
                              <Badge variant={destination.isActive ? "default" : "secondary"} className="text-xs">
                                {destination.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Added {new Date(destination.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteDestinationMutation.mutate(destination.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {!forwardingDestinations?.length && (
                        <div className="text-center py-8">
                          <Forward className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">No forwarding destinations configured</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle>Forwarding Analytics</CardTitle>
                    <CardDescription>Performance metrics for this email alias</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {forwardingStats ? (
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="text-sm font-medium text-muted-foreground">Forwarded</span>
                          </div>
                          <p className="text-2xl font-bold mt-2">{forwardingStats.totalForwarded}</p>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <span className="text-sm font-medium text-muted-foreground">Blocked</span>
                          </div>
                          <p className="text-2xl font-bold mt-2">{forwardingStats.totalBlocked}</p>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center space-x-2">
                            <RotateCcw className="h-5 w-5 text-blue-500" />
                            <span className="text-sm font-medium text-muted-foreground">Auto-Replied</span>
                          </div>
                          <p className="text-2xl font-bold mt-2">{forwardingStats.totalAutoReplied}</p>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="h-5 w-5 text-purple-500" />
                            <span className="text-sm font-medium text-muted-foreground">Success Rate</span>
                          </div>
                          <p className="text-2xl font-bold mt-2">{forwardingStats.successRate}%</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No analytics data available yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select an Email Alias</h3>
                  <p className="text-muted-foreground">
                    Choose an alias from the list to view and manage its forwarding rules.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}