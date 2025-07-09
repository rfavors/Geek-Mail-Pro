import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Play,
  Pause,
  Plus,
  Settings,
  BarChart3,
  Users,
  Mail,
  Clock,
  GitBranch,
  Filter,
  Target,
  Zap,
  Eye,
  MousePointer,
  TrendingUp,
  Archive,
  Edit3,
  Trash2,
  Copy
} from "lucide-react";
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  OnConnect,
  NodeTypes,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node types for the drag-and-drop builder
const EmailNode = ({ data, isConnectable }) => {
  return (
    <div className="bg-white border-2 border-blue-500 rounded-lg p-3 shadow-lg min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="h-4 w-4 text-blue-500" />
        <span className="font-medium text-sm">{data.label}</span>
      </div>
      <div className="text-xs text-gray-600">
        <div>Subject: {data.subject || 'No subject'}</div>
        <div>Delay: {data.delay || '0'} days</div>
      </div>
      <div className="handle-container">
        {/* React Flow will add handles automatically */}
      </div>
    </div>
  );
};

const DelayNode = ({ data, isConnectable }) => {
  return (
    <div className="bg-white border-2 border-yellow-500 rounded-lg p-3 shadow-lg min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-4 w-4 text-yellow-500" />
        <span className="font-medium text-sm">{data.label}</span>
      </div>
      <div className="text-xs text-gray-600">
        Wait: {data.duration || '1'} {data.unit || 'days'}
      </div>
    </div>
  );
};

const ConditionNode = ({ data, isConnectable }) => {
  return (
    <div className="bg-white border-2 border-purple-500 rounded-lg p-3 shadow-lg min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <GitBranch className="h-4 w-4 text-purple-500" />
        <span className="font-medium text-sm">{data.label}</span>
      </div>
      <div className="text-xs text-gray-600">
        If: {data.condition || 'Email opened'}
      </div>
    </div>
  );
};

const nodeTypes: NodeTypes = {
  email: EmailNode,
  delay: DelayNode,
  condition: ConditionNode,
};

const initialNodes: Node[] = [
  {
    id: 'start',
    type: 'input',
    data: { label: 'Sequence Start' },
    position: { x: 250, y: 25 },
    className: 'bg-green-100 border-green-500',
  },
];

const initialEdges: Edge[] = [];

export default function EmailSequences() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedSequence, setSelectedSequence] = useState(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Fetch email sequences
  const { data: sequences = [], isLoading: sequencesLoading } = useQuery({
    queryKey: ["/api/email-sequences"],
    enabled: isAuthenticated,
  });

  // Create sequence mutation
  const createSequenceMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/email-sequences", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-sequences"] });
      toast({
        title: "Success",
        description: "Email sequence created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create email sequence",
        variant: "destructive",
      });
    },
  });

  // Update sequence mutation
  const updateSequenceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest("PATCH", `/api/email-sequences/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-sequences"] });
      toast({
        title: "Success",
        description: "Email sequence updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update email sequence",
        variant: "destructive",
      });
    },
  });

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addEmailNode = useCallback(() => {
    const newNode: Node = {
      id: `email-${Date.now()}`,
      type: 'email',
      data: { 
        label: 'Email Step',
        subject: 'Welcome to our sequence',
        delay: '0'
      },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const addDelayNode = useCallback(() => {
    const newNode: Node = {
      id: `delay-${Date.now()}`,
      type: 'delay',
      data: { 
        label: 'Wait Step',
        duration: '1',
        unit: 'days'
      },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const addConditionNode = useCallback(() => {
    const newNode: Node = {
      id: `condition-${Date.now()}`,
      type: 'condition',
      data: { 
        label: 'Condition',
        condition: 'Email opened'
      },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const saveSequence = useCallback(() => {
    const flowData = {
      nodes,
      edges,
    };

    const sequenceData = {
      name: 'My Email Sequence',
      description: 'Automated email sequence',
      triggerType: 'signup',
      flowData,
      status: 'draft',
    };

    createSequenceMutation.mutate(sequenceData);
  }, [nodes, edges, createSequenceMutation]);

  if (authLoading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Sequences</h1>
          <p className="text-muted-foreground">
            Create automated email sequences with drag-and-drop builder
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsBuilderOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Sequence
          </Button>
        </div>
      </div>

      {/* Sequence Builder Dialog */}
      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogContent className="max-w-7xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Email Sequence Builder</DialogTitle>
            <DialogDescription>
              Drag and drop components to build your automated email sequence
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex h-full gap-4">
            {/* Toolbar */}
            <div className="w-64 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-4">Components</h3>
              <div className="space-y-2">
                <Button 
                  onClick={addEmailNode}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button 
                  onClick={addDelayNode}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Delay
                </Button>
                <Button 
                  onClick={addConditionNode}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <GitBranch className="h-4 w-4 mr-2" />
                  Condition
                </Button>
              </div>
              
              <div className="mt-6">
                <Button 
                  onClick={saveSequence}
                  className="w-full"
                  disabled={createSequenceMutation.isPending}
                >
                  {createSequenceMutation.isPending ? "Saving..." : "Save Sequence"}
                </Button>
              </div>
            </div>

            {/* Flow Builder */}
            <div className="flex-1 bg-gray-100 rounded-lg">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                connectionMode={ConnectionMode.Loose}
                fitView
                className="bg-teal-50"
              >
                <Controls />
                <MiniMap />
                <Background variant="dots" gap={12} size={1} />
              </ReactFlow>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sequences List */}
      <Tabs defaultValue="sequences" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sequences">My Sequences ({sequences.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="sequences" className="space-y-4">
          {sequencesLoading ? (
            <div className="text-center py-8">Loading sequences...</div>
          ) : sequences.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No email sequences yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first automated email sequence to engage your audience
                </p>
                <Button onClick={() => setIsBuilderOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Sequence
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {sequences.map((sequence: any) => (
                <Card key={sequence.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Mail className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{sequence.name}</h3>
                          <p className="text-sm text-muted-foreground">{sequence.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={sequence.status === 'active' ? 'default' : 'secondary'}>
                              {sequence.status}
                            </Badge>
                            <Badge variant="outline">
                              {sequence.triggerType}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{sequence.totalSubscribers || 0} subscribers</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="h-4 w-4 text-gray-400" />
                            <span>{sequence.activeSubscribers || 0} active</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedSequence(sequence);
                              setIsBuilderOpen(true);
                            }}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant={sequence.status === 'active' ? 'destructive' : 'default'}
                          >
                            {sequence.status === 'active' ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Mail className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                    <p className="text-2xl font-bold">2,847</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Eye className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Open Rate</p>
                    <p className="text-2xl font-bold">24.8%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <MousePointer className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Click Rate</p>
                    <p className="text-2xl font-bold">4.2%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-orange-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold">1,234</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Welcome Series", desc: "3-email welcome sequence for new subscribers", icon: "👋" },
              { name: "Product Launch", desc: "5-email sequence for product announcements", icon: "🚀" },
              { name: "Abandoned Cart", desc: "Recovery sequence for incomplete purchases", icon: "🛒" },
              { name: "Customer Onboarding", desc: "Educational sequence for new customers", icon: "📚" },
              { name: "Re-engagement", desc: "Win back inactive subscribers", icon: "💝" },
              { name: "Newsletter Series", desc: "Weekly newsletter automation", icon: "📰" },
            ].map((template, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{template.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{template.desc}</p>
                  <Button variant="outline" className="w-full">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}