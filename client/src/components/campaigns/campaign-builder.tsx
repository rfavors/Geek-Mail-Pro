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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Save, 
  Send, 
  Eye, 
  Smartphone, 
  Monitor,
  Type,
  Image as ImageIcon,
  Link,
  Minus,
  Calendar,
  Users,
  Mail
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  subject: z.string().min(1, "Subject line is required"),
  fromEmail: z.string().email("Invalid email format"),
  fromName: z.string().optional(),
  content: z.object({
    html: z.string(),
    text: z.string().optional(),
  }),
  status: z.enum(["draft", "scheduled", "sending", "sent"]).default("draft"),
  scheduledAt: z.string().optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface CampaignBuilderProps {
  campaign?: any;
  onSave: () => void;
  onCancel: () => void;
}

export function CampaignBuilder({ campaign, onSave, onCancel }: CampaignBuilderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [selectedLists, setSelectedLists] = useState<number[]>([]);

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: campaign?.name || "",
      subject: campaign?.subject || "",
      fromEmail: campaign?.fromEmail || "marketing@thegeektrepreneur.com",
      fromName: campaign?.fromName || "The Geektrepreneur",
      content: {
        html: campaign?.content?.html || `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #FF6B35 0%, #8B5CF6 100%); padding: 40px 20px; text-align: center; color: white;">
              <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">Spring Sale Event</h1>
              <p style="margin: 0; opacity: 0.9;">Limited time offer - Don't miss out!</p>
            </div>
            <div style="padding: 40px 20px;">
              <h2 style="color: #1F2937; margin: 0 0 20px 0; font-size: 24px;">40% Off Everything</h2>
              <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300" 
                   alt="Spring sale products" 
                   style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #6B7280; line-height: 1.6; margin-bottom: 30px;">
                Get ready for spring with our biggest sale of the year! 
                Use code SPRING40 at checkout.
              </p>
              <div style="text-align: center;">
                <a href="#" style="background: #FF6B35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Shop Now
                </a>
              </div>
            </div>
            <div style="background: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0; font-size: 12px; color: #6B7280;">
                © 2025 The Geektrepreneur. All rights reserved.<br>
                <a href="#" style="color: #FF6B35;">Unsubscribe</a> | 
                <a href="#" style="color: #FF6B35;">Update preferences</a>
              </p>
            </div>
          </div>
        `,
        text: campaign?.content?.text || "",
      },
      status: campaign?.status || "draft",
    },
  });

  const { data: domains } = useQuery({
    queryKey: ["/api/domains"],
  });

  const { data: contactLists } = useQuery({
    queryKey: ["/api/contact-lists"],
  });

  const { data: aliases } = useQuery({
    queryKey: ["/api/domains/1/aliases"],
    enabled: !!domains?.[0]?.id,
  });

  const saveCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      if (campaign?.id) {
        return await apiRequest("PATCH", `/api/campaigns/${campaign.id}`, data);
      } else {
        return await apiRequest("POST", "/api/campaigns", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campaign Saved",
        description: "Your campaign has been saved successfully!",
      });
      onSave();
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
        description: "Failed to save campaign. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CampaignFormData) => {
    saveCampaignMutation.mutate(data);
  };

  const emailAliases = aliases?.map((alias: any) => `${alias.alias}@thegeektrepreneur.com`) || [
    "marketing@thegeektrepreneur.com",
    "support@thegeektrepreneur.com", 
    "newsletter@thegeektrepreneur.com"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[80vh]">
      {/* Campaign Settings Sidebar */}
      <div className="space-y-6 overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Campaign Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Spring Sale Newsletter" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fromEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Email</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sender email" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {emailAliases.map((email) => (
                            <SelectItem key={email} value={email}>{email}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fromName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="The Geektrepreneur" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject Line</FormLabel>
                      <FormControl>
                        <Input placeholder="🌸 Spring Sale: 40% Off Everything!" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recipient Lists</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contactLists?.map((list: any) => (
                  <div key={list.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`list-${list.id}`}
                      checked={selectedLists.includes(list.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedLists([...selectedLists, list.id]);
                        } else {
                          setSelectedLists(selectedLists.filter(id => id !== list.id));
                        }
                      }}
                    />
                    <Label htmlFor={`list-${list.id}`} className="text-sm">
                      {list.name} ({list.subscriberCount?.toLocaleString() || 0})
                    </Label>
                  </div>
                )) || (
                  <>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="newsletter" defaultChecked />
                      <Label htmlFor="newsletter" className="text-sm">
                        Newsletter Subscribers (8,420)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="vip" />
                      <Label htmlFor="vip" className="text-sm">
                        VIP Customers (1,240)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="recent" />
                      <Label htmlFor="recent" className="text-sm">
                        Recent Purchasers (892)
                      </Label>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </form>
        </Form>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Design Elements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                <Type className="h-4 w-4 mb-1" />
                <span className="text-xs">Text</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                <ImageIcon className="h-4 w-4 mb-1" />
                <span className="text-xs">Image</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                <Link className="h-4 w-4 mb-1" />
                <span className="text-xs">Button</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                <Minus className="h-4 w-4 mb-1" />
                <span className="text-xs">Divider</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Preview */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Email Preview</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant={previewDevice === "desktop" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewDevice("desktop")}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewDevice === "mobile" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewDevice("mobile")}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Send className="h-4 w-4 mr-1" />
                  Send Test
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-full">
            <div className="bg-gray-100 dark:bg-gray-800 p-6 h-full overflow-y-auto rounded-lg">
              <div className={`mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-sm border overflow-hidden ${
                previewDevice === "mobile" ? "max-w-sm" : "max-w-2xl"
              }`}>
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: form.watch("content.html") 
                  }}
                  className="prose max-w-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              variant="outline"
              onClick={() => form.handleSubmit((data) => {
                saveCampaignMutation.mutate({ ...data, status: "draft" });
              })()}
              disabled={saveCampaignMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Later
            </Button>
            <Button
              onClick={() => form.handleSubmit((data) => {
                saveCampaignMutation.mutate({ ...data, status: "sent" });
              })()}
              disabled={saveCampaignMutation.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Campaign
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
