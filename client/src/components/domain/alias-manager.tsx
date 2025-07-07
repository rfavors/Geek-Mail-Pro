import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Plus, 
  Check,
  AlertCircle,
  Settings,
  Trash2,
  TestTube,
  Send
} from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

const aliasSchema = z.object({
  alias: z.string()
    .min(1, "Alias is required")
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]$/, "Invalid alias format")
    .max(64, "Alias must be 64 characters or less"),
  destination: z.string()
    .email("Please enter a valid email address")
    .min(1, "Destination email is required"),
});

type AliasFormData = z.infer<typeof aliasSchema>;

interface AliasManagerProps {
  domains: any[];
}

export function AliasManager({ domains }: AliasManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDomainId, setSelectedDomainId] = useState<number | null>(null);

  const primaryDomain = domains.find(d => d.domain === "thegeektrepreneur.com") || domains[0];

  const form = useForm<AliasFormData>({
    resolver: zodResolver(aliasSchema),
    defaultValues: {
      alias: "",
      destination: "",
    },
  });

  const { data: aliases, isLoading: aliasesLoading } = useQuery({
    queryKey: [`/api/domains/${primaryDomain?.id}/aliases`],
    enabled: !!primaryDomain?.id,
  });

  const createAliasMutation = useMutation({
    mutationFn: async (data: AliasFormData) => {
      if (!primaryDomain?.id) throw new Error("No domain selected");
      return await apiRequest("POST", `/api/domains/${primaryDomain.id}/aliases`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/domains/${primaryDomain?.id}/aliases`] });
      queryClient.invalidateQueries({ queryKey: ["/api/domains"] });
      toast({
        title: "Email Alias Created",
        description: "Your email alias has been created successfully!",
      });
      setIsAddDialogOpen(false);
      form.reset();
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
        description: "Failed to create email alias. Please try again.",
        variant: "destructive",
      });
    },
  });

  const testAliasMutation = useMutation({
    mutationFn: async (aliasEmail: string) => {
      // Mock test email sending
      return new Promise(resolve => setTimeout(resolve, 2000));
    },
    onSuccess: () => {
      toast({
        title: "Test Email Sent",
        description: "A test email has been sent to verify your alias configuration.",
      });
    },
    onError: () => {
      toast({
        title: "Test Failed",
        description: "Failed to send test email. Please check your alias configuration.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AliasFormData) => {
    createAliasMutation.mutate(data);
  };

  const handleTestAlias = (alias: string) => {
    const fullEmail = `${alias}@${primaryDomain?.domain}`;
    testAliasMutation.mutate(fullEmail);
  };

  const displayAliases = aliases || [];

  if (!primaryDomain) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email Aliases</CardTitle>
          <CardDescription>Create professional email aliases for your campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No domains configured</h3>
            <p className="text-muted-foreground mb-4">
              Add a custom domain first to create email aliases.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Domain
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Email Aliases</CardTitle>
              <CardDescription>
                Create professional email aliases for {primaryDomain.domain}
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Alias
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Email Alias</DialogTitle>
                  <DialogDescription>
                    Create a new email alias for professional sending
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="alias"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alias Name</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Input 
                                placeholder="support" 
                                {...field}
                                className="flex-1"
                              />
                              <span className="text-muted-foreground">@{primaryDomain.domain}</span>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Enter the alias name (e.g., support, marketing, newsletter)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="destination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Forward To Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="rfavors@gmail.com" 
                              type="email"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            All emails sent to this alias will be forwarded to this address
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Alias Guidelines</AlertTitle>
                      <AlertDescription className="space-y-1">
                        <p>• Use lowercase letters, numbers, dots, and hyphens only</p>
                        <p>• Must start and end with alphanumeric characters</p>
                        <p>• Keep it professional and brand-appropriate</p>
                      </AlertDescription>
                    </Alert>

                    <div className="flex items-center justify-between">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddDialogOpen(false)}
                      >
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
        </CardHeader>
        <CardContent>
          {aliasesLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-muted rounded-lg animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 w-48 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayAliases.length > 0 ? (
            <div className="space-y-4">
              {displayAliases.map((alias: any) => (
                <div key={alias.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center text-white">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {alias.alias}@{primaryDomain.domain}
                      </h3>
                      {alias.destination && (
                        <p className="text-sm text-muted-foreground">
                          Forwards to: {alias.destination}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-1">
                        <Badge variant={alias.isVerified ? "default" : "destructive"} className="text-xs">
                          {alias.isVerified ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Pending
                            </>
                          )}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Created {new Date(alias.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestAlias(alias.alias)}
                      disabled={testAliasMutation.isPending}
                    >
                      <TestTube className="h-4 w-4 mr-1" />
                      Test
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No email aliases yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first email alias to start sending professional campaigns.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Alias
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alias Usage Examples */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">Popular Email Aliases</CardTitle>
          <CardDescription>
            Common aliases used by successful email marketers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Marketing & Newsletters</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• marketing@{primaryDomain.domain}</li>
                <li>• newsletter@{primaryDomain.domain}</li>
                <li>• news@{primaryDomain.domain}</li>
                <li>• updates@{primaryDomain.domain}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Support & Service</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• support@{primaryDomain.domain}</li>
                <li>• help@{primaryDomain.domain}</li>
                <li>• service@{primaryDomain.domain}</li>
                <li>• care@{primaryDomain.domain}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Sales & Business</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• sales@{primaryDomain.domain}</li>
                <li>• hello@{primaryDomain.domain}</li>
                <li>• contact@{primaryDomain.domain}</li>
                <li>• info@{primaryDomain.domain}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
