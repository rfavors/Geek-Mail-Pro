import React, { useState, useCallback } from "react";
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
  Mail,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Upload
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

interface EmailComponent {
  id: string;
  type: 'text' | 'image' | 'button' | 'divider' | 'spacer';
  content: any;
  styles: any;
}

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
  const [emailComponents, setEmailComponents] = useState<EmailComponent[]>([
    {
      id: 'header',
      type: 'text',
      content: {
        text: 'Spring Sale Event',
        tag: 'h1'
      },
      styles: {
        background: 'linear-gradient(135deg, #FF6B35 0%, #8B5CF6 100%)',
        color: '#ffffff',
        padding: '40px 20px',
        textAlign: 'center',
        fontSize: '28px',
        fontWeight: 'bold',
        margin: '0'
      }
    },
    {
      id: 'subtitle',
      type: 'text',
      content: {
        text: 'Limited time offer - Don\'t miss out!',
        tag: 'p'
      },
      styles: {
        background: 'linear-gradient(135deg, #FF6B35 0%, #8B5CF6 100%)',
        color: '#ffffff',
        padding: '0 20px 40px 20px',
        textAlign: 'center',
        opacity: '0.9',
        margin: '0'
      }
    },
    {
      id: 'main-text',
      type: 'text',
      content: {
        text: '40% Off Everything',
        tag: 'h2'
      },
      styles: {
        color: '#1F2937',
        margin: '40px 20px 20px 20px',
        fontSize: '24px'
      }
    },
    {
      id: 'product-image',
      type: 'image',
      content: {
        src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300',
        alt: 'Spring sale products'
      },
      styles: {
        width: '100%',
        height: '200px',
        objectFit: 'cover',
        borderRadius: '8px',
        margin: '0 20px 20px 20px',
        display: 'block',
        maxWidth: 'calc(100% - 40px)'
      }
    },
    {
      id: 'description',
      type: 'text',
      content: {
        text: 'Get ready for spring with our biggest sale of the year! Use code SPRING40 at checkout.',
        tag: 'p'
      },
      styles: {
        color: '#6B7280',
        lineHeight: '1.6',
        margin: '0 20px 30px 20px'
      }
    },
    {
      id: 'cta-button',
      type: 'button',
      content: {
        text: 'Shop Now',
        url: '#'
      },
      styles: {
        background: '#FF6B35',
        color: '#ffffff',
        padding: '15px 30px',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        display: 'inline-block',
        margin: '0 auto',
        textAlign: 'center'
      }
    }
  ]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [editingComponent, setEditingComponent] = useState<EmailComponent | null>(null);
  const [draggedItem, setDraggedItem] = useState<{ type: string; src?: string } | null>(null);
  const [logoLibrary, setLogoLibrary] = useState<string[]>([]);

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
    // Generate HTML from components
    const generatedHtml = generateEmailHtml(emailComponents);
    const campaignData = {
      ...data,
      content: {
        ...data.content,
        html: generatedHtml
      }
    };
    saveCampaignMutation.mutate(campaignData);
  };

  const generateEmailHtml = (components: EmailComponent[]) => {
    const componentHtml = components.map(component => {
      const styleString = Object.entries(component.styles)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
        .join('; ');

      switch (component.type) {
        case 'text':
          const Tag = component.content.tag || 'p';
          return `<${Tag} style="${styleString}">${component.content.text}</${Tag}>`;
        case 'image':
          return `<img src="${component.content.src}" alt="${component.content.alt || ''}" style="${styleString}" />`;
        case 'button':
          return `<div style="text-align: center; margin: 20px;"><a href="${component.content.url}" style="${styleString}">${component.content.text}</a></div>`;
        case 'divider':
          return `<hr style="${styleString}" />`;
        case 'spacer':
          return `<div style="${styleString}"></div>`;
        default:
          return '';
      }
    }).join('');

    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        ${componentHtml}
        <div style="background: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #E5E7EB;">
          <p style="margin: 0; font-size: 12px; color: #6B7280;">
            © 2025 The Geektrepreneur. All rights reserved.<br>
            <a href="#" style="color: #FF6B35;">Unsubscribe</a> | 
            <a href="#" style="color: #FF6B35;">Update preferences</a>
          </p>
        </div>
      </div>
    `;
  };

  const addComponent = (type: EmailComponent['type']) => {
    const newComponent: EmailComponent = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type)
    };
    setEmailComponents([...emailComponents, newComponent]);
  };

  const getDefaultContent = (type: EmailComponent['type']) => {
    switch (type) {
      case 'text':
        return { text: 'Enter your text here', tag: 'p' };
      case 'image':
        return { src: 'https://via.placeholder.com/600x200', alt: 'Image' };
      case 'button':
        return { text: 'Click Here', url: '#' };
      case 'divider':
        return {};
      case 'spacer':
        return {};
      default:
        return {};
    }
  };

  const getDefaultStyles = (type: EmailComponent['type']) => {
    switch (type) {
      case 'text':
        return {
          color: '#333333',
          fontSize: '16px',
          lineHeight: '1.5',
          margin: '20px',
          padding: '0'
        };
      case 'image':
        return {
          width: '100%',
          height: 'auto',
          display: 'block',
          margin: '20px auto'
        };
      case 'button':
        return {
          background: '#007bff',
          color: '#ffffff',
          padding: '12px 24px',
          textDecoration: 'none',
          borderRadius: '4px',
          display: 'inline-block',
          fontWeight: 'bold'
        };
      case 'divider':
        return {
          border: 'none',
          borderTop: '1px solid #E5E7EB',
          margin: '20px 0'
        };
      case 'spacer':
        return {
          height: '20px',
          display: 'block'
        };
      default:
        return {};
    }
  };

  const updateComponent = (id: string, updates: Partial<EmailComponent>) => {
    setEmailComponents(components =>
      components.map(comp =>
        comp.id === id ? { ...comp, ...updates } : comp
      )
    );
  };

  const deleteComponent = (id: string) => {
    setEmailComponents(components => components.filter(comp => comp.id !== id));
    setSelectedComponent(null);
  };

  const moveComponent = (fromIndex: number, toIndex: number) => {
    const newComponents = [...emailComponents];
    const [removed] = newComponents.splice(fromIndex, 1);
    newComponents.splice(toIndex, 0, removed);
    setEmailComponents(newComponents);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await apiRequest('POST', '/api/upload/image', formData);
      return response.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const uploadLogo = async (file: File): Promise<string> => {
    const url = await uploadImage(file);
    setLogoLibrary(prev => [...prev, url]);
    return url;
  };

  const handleDragStart = (e: React.DragEvent, type: string, src?: string) => {
    setDraggedItem({ type, src });
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent, insertIndex?: number) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    const targetIndex = insertIndex !== undefined ? insertIndex : emailComponents.length;
    
    const newComponent: EmailComponent = {
      id: Math.random().toString(36).substr(2, 9),
      type: draggedItem.type as EmailComponent['type'],
      content: draggedItem.src ? 
        { src: draggedItem.src, alt: 'Dragged image' } : 
        getDefaultContent(draggedItem.type as EmailComponent['type']),
      styles: getDefaultStyles(draggedItem.type as EmailComponent['type'])
    };

    const newComponents = [...emailComponents];
    newComponents.splice(targetIndex, 0, newComponent);
    setEmailComponents(newComponents);
    setDraggedItem(null);
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) return;

    for (const file of imageFiles) {
      try {
        const url = await uploadImage(file);
        const newComponent: EmailComponent = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'image',
          content: { src: url, alt: file.name },
          styles: getDefaultStyles('image')
        };
        setEmailComponents(prev => [...prev, newComponent]);
      } catch (error) {
        console.error('Failed to upload file:', file.name, error);
      }
    }
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
              <div 
                draggable
                onDragStart={(e) => handleDragStart(e, 'text')}
                className="h-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-grab hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Type className="h-4 w-4 mb-1" />
                <span className="text-xs">Text</span>
              </div>
              <div 
                draggable
                onDragStart={(e) => handleDragStart(e, 'image')}
                className="h-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-grab hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <ImageIcon className="h-4 w-4 mb-1" />
                <span className="text-xs">Image</span>
              </div>
              <div 
                draggable
                onDragStart={(e) => handleDragStart(e, 'button')}
                className="h-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-grab hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Link className="h-4 w-4 mb-1" />
                <span className="text-xs">Button</span>
              </div>
              <div 
                draggable
                onDragStart={(e) => handleDragStart(e, 'divider')}
                className="h-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-grab hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Minus className="h-4 w-4 mb-1" />
                <span className="text-xs">Divider</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logo Library */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Logo Library</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <LogoUpload onUpload={uploadLogo} />
              <div className="grid grid-cols-2 gap-2">
                {logoLibrary.map((logoUrl, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'image', logoUrl)}
                    className="relative group cursor-grab hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={logoUrl}
                      alt={`Logo ${index + 1}`}
                      className="w-full h-16 object-contain border rounded-lg bg-gray-50"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <span className="text-white text-xs">Drag to canvas</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Component Editor */}
        {selectedComponent && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Edit Component</CardTitle>
            </CardHeader>
            <CardContent>
              <ComponentEditor
                component={emailComponents.find(c => c.id === selectedComponent)!}
                onChange={(updates) => updateComponent(selectedComponent, updates)}
                onDelete={() => deleteComponent(selectedComponent)}
              />
            </CardContent>
          </Card>
        )}
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
                  className="email-builder-canvas min-h-[400px]"
                  onDragOver={handleDragOver}
                  onDrop={handleFileDrop}
                >
                  {emailComponents.length === 0 ? (
                    <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-center">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Drag elements here to build your email</p>
                        <p className="text-sm text-gray-400">Or drop image files directly</p>
                      </div>
                    </div>
                  ) : (
                    emailComponents.map((component, index) => (
                      <div key={component.id}>
                        {/* Drop zone before component */}
                        <div
                          className="drop-zone h-2 opacity-0 hover:opacity-100 transition-opacity border-2 border-dashed border-blue-500 rounded"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                        />
                        
                        <div
                          className={`component-wrapper relative group ${
                            selectedComponent === component.id ? 'ring-2 ring-blue-500' : ''
                          }`}
                          onClick={() => setSelectedComponent(component.id)}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', component.id);
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                        >
                          <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <div className="flex space-x-1 bg-white border rounded p-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingComponent(component);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteComponent(component.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="cursor-grab"
                              >
                                <GripVertical className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <EmailComponentRenderer component={component} />
                        </div>
                        
                        {/* Drop zone after last component */}
                        {index === emailComponents.length - 1 && (
                          <div
                            className="drop-zone h-2 opacity-0 hover:opacity-100 transition-opacity border-2 border-dashed border-blue-500 rounded"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index + 1)}
                          />
                        )}
                      </div>
                    ))
                  )}
                </div>
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

// Component Renderer
function EmailComponentRenderer({ component }: { component: EmailComponent }) {
  const styleString = Object.entries(component.styles)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
    .join('; ');

  switch (component.type) {
    case 'text':
      const Tag = component.content.tag || 'p';
      return React.createElement(Tag, {
        style: component.styles,
        dangerouslySetInnerHTML: { __html: component.content.text }
      });

    case 'image':
      return (
        <img
          src={component.content.src}
          alt={component.content.alt || ''}
          style={component.styles}
        />
      );

    case 'button':
      return (
        <div style={{ textAlign: 'center', margin: '20px' }}>
          <a
            href={component.content.url}
            style={component.styles}
          >
            {component.content.text}
          </a>
        </div>
      );

    case 'divider':
      return <hr style={component.styles} />;

    case 'spacer':
      return <div style={component.styles}></div>;

    default:
      return null;
  }
}

// Component Editor
function ComponentEditor({ 
  component, 
  onChange, 
  onDelete 
}: { 
  component: EmailComponent;
  onChange: (updates: Partial<EmailComponent>) => void;
  onDelete: () => void;
}) {
  const updateContent = (field: string, value: any) => {
    onChange({
      content: {
        ...component.content,
        [field]: value
      }
    });
  };

  const updateStyle = (field: string, value: any) => {
    onChange({
      styles: {
        ...component.styles,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Content Editor */}
      {component.type === 'text' && (
        <>
          <div>
            <Label>Text Content</Label>
            <Textarea
              value={component.content.text}
              onChange={(e) => updateContent('text', e.target.value)}
              placeholder="Enter your text..."
            />
          </div>
          <div>
            <Label>Text Tag</Label>
            <select
              value={component.content.tag}
              onChange={(e) => updateContent('tag', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="p">Paragraph</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
            </select>
          </div>
        </>
      )}

      {component.type === 'image' && (
        <>
          <div>
            <Label>Image Source</Label>
            <div className="space-y-2">
              <Input
                value={component.content.src}
                onChange={(e) => updateContent('src', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <div className="text-center">
                <span className="text-sm text-muted-foreground">or</span>
              </div>
              <ImageUpload
                onUpload={(url) => updateContent('src', url)}
                disabled={false}
              />
            </div>
          </div>
          <div>
            <Label>Alt Text</Label>
            <Input
              value={component.content.alt}
              onChange={(e) => updateContent('alt', e.target.value)}
              placeholder="Image description"
            />
          </div>
        </>
      )}

      {component.type === 'button' && (
        <>
          <div>
            <Label>Button Text</Label>
            <Input
              value={component.content.text}
              onChange={(e) => updateContent('text', e.target.value)}
              placeholder="Click Here"
            />
          </div>
          <div>
            <Label>Button URL</Label>
            <Input
              value={component.content.url}
              onChange={(e) => updateContent('url', e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        </>
      )}

      {/* Style Editor */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Styling</h4>
        <div className="grid grid-cols-2 gap-2">
          {component.type !== 'divider' && component.type !== 'spacer' && (
            <>
              <div>
                <Label>Text Color</Label>
                <Input
                  type="color"
                  value={component.styles.color || '#000000'}
                  onChange={(e) => updateStyle('color', e.target.value)}
                />
              </div>
              <div>
                <Label>Background</Label>
                <Input
                  value={component.styles.background || ''}
                  onChange={(e) => updateStyle('background', e.target.value)}
                  placeholder="#ffffff"
                />
              </div>
            </>
          )}
          <div>
            <Label>Margin</Label>
            <Input
              value={component.styles.margin || ''}
              onChange={(e) => updateStyle('margin', e.target.value)}
              placeholder="20px"
            />
          </div>
          <div>
            <Label>Padding</Label>
            <Input
              value={component.styles.padding || ''}
              onChange={(e) => updateStyle('padding', e.target.value)}
              placeholder="10px"
            />
          </div>
        </div>
      </div>

      <Button variant="destructive" size="sm" onClick={onDelete}>
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Component
      </Button>
    </div>
  );
}

// Logo Upload Component
function LogoUpload({ onUpload }: { onUpload: (url: string) => Promise<string> }) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      await onUpload(file);
      
      toast({
        title: "Logo uploaded",
        description: "Your logo has been added to the library!",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
        id="logo-upload"
      />
      <label htmlFor="logo-upload">
        <Button
          variant="outline"
          size="sm"
          disabled={uploading}
          className="w-full cursor-pointer"
          asChild
        >
          <div>
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Logo'}
          </div>
        </Button>
      </label>
    </div>
  );
}

// Image Upload Component
function ImageUpload({ onUpload, disabled }: { onUpload: (url: string) => void; disabled: boolean }) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await apiRequest('POST', '/api/upload/image', formData);
      onUpload(response.url);
      
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully!",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="hidden"
        id="image-upload"
      />
      <label htmlFor="image-upload">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || uploading}
          className="w-full cursor-pointer"
          asChild
        >
          <div>
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Image'}
          </div>
        </Button>
      </label>
    </div>
  );
}
