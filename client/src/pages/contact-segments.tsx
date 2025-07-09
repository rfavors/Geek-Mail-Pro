import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Plus, 
  Search,
  Filter,
  Settings,
  Trash2,
  RefreshCw,
  Target,
  Eye,
  Edit
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SegmentBuilder } from "@/components/segments/segment-builder";
import { ContactSegmentPreview } from "@/components/segments/contact-segment-preview";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function ContactSegments() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<any>(null);

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

  const { data: segments, isLoading: segmentsLoading } = useQuery({
    queryKey: ["/api/contact-segments"],
    enabled: isAuthenticated,
  });

  const createSegmentMutation = useMutation({
    mutationFn: async (segmentData: any) => {
      await apiRequest("/api/contact-segments", {
        method: "POST",
        body: JSON.stringify(segmentData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-segments"] });
      setIsCreateOpen(false);
      toast({
        title: "Success",
        description: "Contact segment created successfully",
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
        description: "Failed to create contact segment",
        variant: "destructive",
      });
    },
  });

  const updateSegmentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      await apiRequest(`/api/contact-segments/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-segments"] });
      setIsEditOpen(false);
      setSelectedSegment(null);
      toast({
        title: "Success",
        description: "Contact segment updated successfully",
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
        description: "Failed to update contact segment",
        variant: "destructive",
      });
    },
  });

  const deleteSegmentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/contact-segments/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-segments"] });
      toast({
        title: "Success",
        description: "Contact segment deleted successfully",
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
        description: "Failed to delete contact segment",
        variant: "destructive",
      });
    },
  });

  const refreshSegmentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/contact-segments/${id}/refresh`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-segments"] });
      toast({
        title: "Success",
        description: "Segment membership refreshed successfully",
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
        description: "Failed to refresh segment membership",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-background" />;
  }

  const filteredSegments = segments?.filter((segment: any) =>
    segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    segment.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateSegment = (segmentData: any) => {
    createSegmentMutation.mutate(segmentData);
  };

  const handleUpdateSegment = (updates: any) => {
    if (selectedSegment) {
      updateSegmentMutation.mutate({ id: selectedSegment.id, updates });
    }
  };

  const handleEditSegment = (segment: any) => {
    setSelectedSegment(segment);
    setIsEditOpen(true);
  };

  const handlePreviewSegment = (segment: any) => {
    setSelectedSegment(segment);
    setIsPreviewOpen(true);
  };

  const handleDeleteSegment = (segmentId: number) => {
    deleteSegmentMutation.mutate(segmentId);
  };

  const handleRefreshSegment = (segmentId: number) => {
    refreshSegmentMutation.mutate(segmentId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contact Segments</h1>
          <p className="text-muted-foreground">Create targeted segments based on contact behavior and properties</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Segment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Contact Segment</DialogTitle>
              <DialogDescription>
                Define conditions to automatically group contacts with similar characteristics
              </DialogDescription>
            </DialogHeader>
            <SegmentBuilder
              onSave={handleCreateSegment}
              onCancel={() => setIsCreateOpen(false)}
              isLoading={createSegmentMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search segments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Segments Grid */}
      {segmentsLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredSegments.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No segments found</h3>
            <p className="text-muted-foreground mb-6">
              {segments?.length === 0
                ? "Create your first contact segment to start targeting specific groups"
                : "No segments match your search criteria"}
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Segment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSegments.map((segment: any) => (
            <Card key={segment.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      {segment.name}
                    </CardTitle>
                    {segment.description && (
                      <CardDescription className="mt-1">{segment.description}</CardDescription>
                    )}
                  </div>
                  <Badge variant={segment.isActive ? "default" : "secondary"}>
                    {segment.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Contacts</span>
                  <span className="font-medium">{segment.contactCount || 0}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Auto-update</span>
                  <Badge variant={segment.isAutoUpdate ? "default" : "outline"} className="text-xs">
                    {segment.isAutoUpdate ? "On" : "Off"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last updated</span>
                  <span className="text-xs">
                    {new Date(segment.lastUpdatedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewSegment(segment)}
                    className="flex-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditSegment(segment)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRefreshSegment(segment.id)}
                    disabled={refreshSegmentMutation.isPending}
                  >
                    <RefreshCw className={`h-3 w-3 ${refreshSegmentMutation.isPending ? 'animate-spin' : ''}`} />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Segment</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{segment.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteSegment(segment.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contact Segment</DialogTitle>
            <DialogDescription>
              Modify segment conditions and settings
            </DialogDescription>
          </DialogHeader>
          {selectedSegment && (
            <SegmentBuilder
              initialData={selectedSegment}
              onSave={handleUpdateSegment}
              onCancel={() => {
                setIsEditOpen(false);
                setSelectedSegment(null);
              }}
              isLoading={updateSegmentMutation.isPending}
              isEdit
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Segment Preview</DialogTitle>
            <DialogDescription>
              View contacts that match this segment's conditions
            </DialogDescription>
          </DialogHeader>
          {selectedSegment && (
            <ContactSegmentPreview
              segment={selectedSegment}
              onClose={() => {
                setIsPreviewOpen(false);
                setSelectedSegment(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}