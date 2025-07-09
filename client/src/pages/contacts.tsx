import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Users, 
  Plus, 
  Upload,
  Search,
  Download,
  Filter,
  UserPlus,
  Crown,
  ShoppingCart,
  Mail
} from "lucide-react";
import { ContactList } from "@/components/contacts/contact-list";
import { CsvImport } from "@/components/contacts/csv-import";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Form validation schema
const createContactSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
  isActive: z.boolean().default(true),
});

export default function Contacts() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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

  const { data: contactLists, isLoading: listsLoading } = useQuery({
    queryKey: ["/api/contact-lists"],
    enabled: isAuthenticated,
  });

  const { data: contacts, isLoading: contactsLoading } = useQuery({
    queryKey: ["/api/contacts"],
    enabled: isAuthenticated,
  });

  // Form for creating contacts
  const form = useForm<z.infer<typeof createContactSchema>>({
    resolver: zodResolver(createContactSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      company: "",
      jobTitle: "",
      phone: "",
      location: "",
      notes: "",
      tags: "",
      isActive: true,
    },
  });

  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: async (contactData: z.infer<typeof createContactSchema>) => {
      const dataToSend = {
        ...contactData,
        tags: contactData.tags ? contactData.tags.split(",").map(tag => tag.trim()) : [],
      };
      return await apiRequest("POST", "/api/contacts", dataToSend);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setIsCreateOpen(false);
      form.reset();
      toast({
        title: "Contact Created",
        description: "Your new contact has been added successfully!",
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
        description: "Failed to create contact. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateContact = (data: z.infer<typeof createContactSchema>) => {
    createContactMutation.mutate(data);
  };

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-background" />;
  }

  // Calculate stats
  const totalContacts = contacts?.length || 0;
  const activeContacts = contacts?.filter((c: any) => c.isActive)?.length || 0;
  const recentContacts = contacts?.filter((c: any) => {
    const createdDate = new Date(c.createdAt);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return createdDate >= oneWeekAgo;
  })?.length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contact Management</h1>
          <p className="text-muted-foreground">Manage your subscriber lists and contacts</p>
        </div>
        <div className="flex items-center space-x-4">
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Import Contacts from CSV</DialogTitle>
                <DialogDescription>
                  Upload a CSV file to bulk import contacts into your lists.
                </DialogDescription>
              </DialogHeader>
              <CsvImport onComplete={() => setIsImportOpen(false)} />
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Contact</DialogTitle>
                <DialogDescription>
                  Add a new contact to your database. They can be added to lists and segments later.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateContact)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Corp" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="jobTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Software Engineer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="San Francisco, CA" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input placeholder="customer, premium, newsletter (comma separated)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Add any notes about this contact..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createContactMutation.isPending}
                    >
                      {createContactMutation.isPending ? "Creating..." : "Create Contact"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Contact Lists Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-cyan-50 dark:from-green-900/20 dark:to-cyan-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Newsletter Subscribers</h3>
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold mb-2">
              {contactLists?.find((list: any) => list.name === "Newsletter Subscribers")?.subscriberCount || 8420}
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              <span className="text-green-600">↗ 245</span> new this month
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active: {activeContacts.toLocaleString()}</span>
              <Button variant="link" className="p-0 h-auto text-primary">Manage</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-purple-50 dark:from-primary/10 dark:to-purple-900/20 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">VIP Customers</h3>
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <div className="text-3xl font-bold mb-2">
              {contactLists?.find((list: any) => list.name === "VIP Customers")?.subscriberCount || 1240}
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              <span className="text-green-600">↗ 18</span> new this month
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active: 1,198</span>
              <Button variant="link" className="p-0 h-auto text-primary">Manage</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Purchasers</h3>
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-3xl font-bold mb-2">
              {contactLists?.find((list: any) => list.name === "Recent Purchasers")?.subscriberCount || 892}
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              <span className="text-green-600">↗ 67</span> new this month
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active: 842</span>
              <Button variant="link" className="p-0 h-auto text-primary">Manage</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="contacts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="contacts">All Contacts</TabsTrigger>
          <TabsTrigger value="lists">Contact Lists</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Contact Database</CardTitle>
                  <CardDescription>
                    {totalContacts.toLocaleString()} total contacts • {activeContacts.toLocaleString()} active
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search contacts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ContactList 
                contacts={contacts || []} 
                searchTerm={searchTerm}
                isLoading={contactsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lists" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Contact Lists</CardTitle>
                  <CardDescription>Organize your contacts into targeted lists</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create List
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {listsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-12 h-12 bg-muted rounded-lg animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 w-32 bg-muted rounded animate-pulse mb-2" />
                        <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : contactLists && contactLists.length > 0 ? (
                <div className="space-y-4">
                  {contactLists.map((list: any) => (
                    <div key={list.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center text-white">
                          <Users className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{list.name}</h3>
                          <p className="text-sm text-muted-foreground">{list.description}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {list.subscriberCount?.toLocaleString() || 0} subscribers
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Created {new Date(list.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Users className="h-4 w-4 mr-1" />
                          View Contacts
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No contact lists yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first contact list to organize your subscribers.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First List
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Segments</CardTitle>
              <CardDescription>Create targeted segments based on contact behavior and properties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Advanced Segmentation</h3>
                <p className="text-muted-foreground mb-4">
                  This feature is coming soon. Create dynamic segments based on engagement, location, and custom fields.
                </p>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
