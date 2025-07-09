import { useState, useCallback, useEffect, useRef } from "react";
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
  Handle,
  Position,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node types for the drag-and-drop builder
const EmailNode = ({ data, isConnectable, selected }) => {
  return (
    <div className={`bg-white border-2 ${selected ? 'border-blue-700 shadow-xl' : 'border-blue-500'} rounded-lg p-3 shadow-lg min-w-[200px] relative cursor-pointer hover:shadow-xl transition-all`}>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-blue-100 rounded-full">
          <Mail className="h-3.5 w-3.5 text-blue-600" />
        </div>
        <div>
          <div className="font-semibold text-sm text-gray-800">{data.label}</div>
          <div className="text-xs text-gray-500">Email Step</div>
        </div>
      </div>
      <div className="text-xs text-gray-600 space-y-1">
        <div className="truncate">
          <span className="font-medium">Subject:</span> {data.subject || 'Click to edit'}
        </div>
        <div>
          <span className="font-medium">Delay:</span> {data.delay || '0'} days
        </div>
      </div>
      {selected && (
        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
          Click to edit
        </div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

const DelayNode = ({ data, isConnectable, selected }) => {
  return (
    <div className={`bg-white border-2 ${selected ? 'border-yellow-700 shadow-xl' : 'border-yellow-500'} rounded-lg p-3 shadow-lg min-w-[180px] relative cursor-pointer hover:shadow-xl transition-all`}>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-yellow-100 rounded-full">
          <Clock className="h-3.5 w-3.5 text-yellow-600" />
        </div>
        <div>
          <div className="font-semibold text-sm text-gray-800">{data.label}</div>
          <div className="text-xs text-gray-500">Wait Step</div>
        </div>
      </div>
      <div className="text-xs text-gray-600">
        <span className="font-medium">Wait:</span> {data.duration || '1'} {data.unit || 'days'}
      </div>
      {selected && (
        <div className="absolute -top-2 -right-2 bg-yellow-600 text-white text-xs px-2 py-1 rounded">
          Click to edit
        </div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

const ConditionNode = ({ data, isConnectable, selected }) => {
  return (
    <div className={`bg-white border-2 ${selected ? 'border-purple-700 shadow-xl' : 'border-purple-500'} rounded-lg p-3 shadow-lg min-w-[160px] relative cursor-pointer hover:shadow-xl transition-all`}>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 bg-purple-100 rounded-full">
          <GitBranch className="h-3 w-3 text-purple-600" />
        </div>
        <div>
          <div className="font-semibold text-xs text-gray-800">{data.label}</div>
          <div className="text-xs text-gray-500">Condition</div>
        </div>
      </div>
      <div className="text-xs text-gray-600">
        <span className="font-medium">If:</span> {data.condition || 'Email opened'}
      </div>
      {selected && (
        <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
          Click to edit
        </div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="else"
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
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
    position: { x: 400, y: 50 },
    style: {
      background: '#dcfce7',
      border: '2px solid #16a34a',
      borderRadius: '8px',
      padding: '12px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#166534',
    },
  },
];

const initialEdges: Edge[] = [];

// Flow Builder Component with proper positioning
function FlowBuilder({ nodes, setNodes, edges, setEdges, onNodesChange, onEdgesChange, selectedNode, setSelectedNode }) {
  const reactFlowWrapper = useRef(null);
  
  const onDrop = useCallback((event) => {
    event.preventDefault();
    
    const type = event.dataTransfer.getData('application/reactflow');
    
    if (typeof type === 'undefined' || !type) {
      return;
    }
    
    // Get the bounding rectangle of the ReactFlow wrapper
    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!reactFlowBounds) return;
    
    // Calculate position relative to the ReactFlow canvas
    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };
    
    const nodeCount = nodes.filter(n => n.type === type).length;
    
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: { 
        label: type === 'email' ? `Email ${nodeCount + 1}` :
               type === 'delay' ? `Wait ${nodeCount + 1}` :
               `Condition ${nodeCount + 1}`,
        ...(type === 'email' && { subject: 'Click to edit subject', delay: '0' }),
        ...(type === 'delay' && { duration: '1', unit: 'days' }),
        ...(type === 'condition' && { condition: 'Email opened' }),
      },
    };
    
    setNodes((nds) => nds.concat(newNode));
  }, [nodes, setNodes]);
  
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, [setSelectedNode]);
  
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  
  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-gradient-to-br from-blue-50 to-indigo-50"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
      >
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            switch (node.type) {
              case 'email': return '#3b82f6';
              case 'delay': return '#eab308';
              case 'condition': return '#8b5cf6';
              default: return '#6b7280';
            }
          }}
        />
        <Background variant="dots" gap={20} size={1} color="#cbd5e1" />
      </ReactFlow>
    </div>
  );
}

export default function EmailSequences() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedSequence, setSelectedSequence] = useState(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isEditingNode, setIsEditingNode] = useState(false);

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
        label: `Email ${nodes.filter(n => n.type === 'email').length + 1}`,
        subject: 'Welcome to our sequence',
        delay: '0'
      },
      position: { x: 300 + Math.random() * 200, y: 200 + Math.random() * 200 },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, nodes]);

  const addDelayNode = useCallback(() => {
    const newNode: Node = {
      id: `delay-${Date.now()}`,
      type: 'delay',
      data: { 
        label: `Wait ${nodes.filter(n => n.type === 'delay').length + 1}`,
        duration: '1',
        unit: 'days'
      },
      position: { x: 300 + Math.random() * 200, y: 200 + Math.random() * 200 },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, nodes]);

  const addConditionNode = useCallback(() => {
    const newNode: Node = {
      id: `condition-${Date.now()}`,
      type: 'condition',
      data: { 
        label: `Condition ${nodes.filter(n => n.type === 'condition').length + 1}`,
        condition: 'Email opened'
      },
      position: { x: 300 + Math.random() * 200, y: 200 + Math.random() * 200 },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, nodes]);

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
        <DialogContent className="max-w-[95vw] h-[95vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Email Sequence Builder</DialogTitle>
            <DialogDescription>
              Drag components from the sidebar to the canvas and connect them to build your automated email sequence
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex h-[calc(100%-80px)] gap-4 px-6 pb-6">
            {/* Draggable Toolbar */}
            <div className="w-72 bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold mb-4 text-gray-800">Drag Components</h3>
              
              {/* Node Editor Panel */}
              {selectedNode && (
                <div className="mb-6 p-4 bg-white rounded-lg border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm">Edit {selectedNode.data.label}</h4>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setSelectedNode(null)}
                    >
                      ×
                    </Button>
                  </div>
                  
                  {selectedNode.type === 'email' && (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Subject Line</Label>
                        <Input 
                          className="text-xs"
                          value={selectedNode.data.subject || ''}
                          onChange={(e) => {
                            const updatedNode = {
                              ...selectedNode,
                              data: { ...selectedNode.data, subject: e.target.value }
                            };
                            setSelectedNode(updatedNode);
                            setNodes(nds => nds.map(n => n.id === selectedNode.id ? updatedNode : n));
                          }}
                          placeholder="Enter email subject"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Delay (days)</Label>
                        <Input 
                          className="text-xs"
                          type="number"
                          value={selectedNode.data.delay || '0'}
                          onChange={(e) => {
                            const updatedNode = {
                              ...selectedNode,
                              data: { ...selectedNode.data, delay: e.target.value }
                            };
                            setSelectedNode(updatedNode);
                            setNodes(nds => nds.map(n => n.id === selectedNode.id ? updatedNode : n));
                          }}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  )}
                  
                  {selectedNode.type === 'delay' && (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Duration</Label>
                        <Input 
                          className="text-xs"
                          type="number"
                          value={selectedNode.data.duration || '1'}
                          onChange={(e) => {
                            const updatedNode = {
                              ...selectedNode,
                              data: { ...selectedNode.data, duration: e.target.value }
                            };
                            setSelectedNode(updatedNode);
                            setNodes(nds => nds.map(n => n.id === selectedNode.id ? updatedNode : n));
                          }}
                          placeholder="1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Unit</Label>
                        <Select 
                          value={selectedNode.data.unit || 'days'}
                          onValueChange={(value) => {
                            const updatedNode = {
                              ...selectedNode,
                              data: { ...selectedNode.data, unit: value }
                            };
                            setSelectedNode(updatedNode);
                            setNodes(nds => nds.map(n => n.id === selectedNode.id ? updatedNode : n));
                          }}
                        >
                          <SelectTrigger className="text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minutes">Minutes</SelectItem>
                            <SelectItem value="hours">Hours</SelectItem>
                            <SelectItem value="days">Days</SelectItem>
                            <SelectItem value="weeks">Weeks</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  
                  {selectedNode.type === 'condition' && (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Condition</Label>
                        <Select 
                          value={selectedNode.data.condition || 'Email opened'}
                          onValueChange={(value) => {
                            const updatedNode = {
                              ...selectedNode,
                              data: { ...selectedNode.data, condition: value }
                            };
                            setSelectedNode(updatedNode);
                            setNodes(nds => nds.map(n => n.id === selectedNode.id ? updatedNode : n));
                          }}
                        >
                          <SelectTrigger className="text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Email opened">Email opened</SelectItem>
                            <SelectItem value="Email clicked">Email clicked</SelectItem>
                            <SelectItem value="No response">No response</SelectItem>
                            <SelectItem value="Purchased">Purchased</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Draggable Components */}
              <div className="space-y-3">
                <div 
                  className="bg-white border-2 border-blue-300 rounded-lg p-3 cursor-grab hover:border-blue-500 transition-colors shadow-sm"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData('application/reactflow', 'email');
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Email Step</div>
                      <div className="text-xs text-gray-500">Send an email</div>
                    </div>
                  </div>
                </div>

                <div 
                  className="bg-white border-2 border-yellow-300 rounded-lg p-3 cursor-grab hover:border-yellow-500 transition-colors shadow-sm"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData('application/reactflow', 'delay');
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <Clock className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Wait Step</div>
                      <div className="text-xs text-gray-500">Add a delay</div>
                    </div>
                  </div>
                </div>

                <div 
                  className="bg-white border-2 border-purple-300 rounded-lg p-3 cursor-grab hover:border-purple-500 transition-colors shadow-sm"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData('application/reactflow', 'condition');
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <GitBranch className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Condition</div>
                      <div className="text-xs text-gray-500">Branch logic</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 space-y-3">
                <Button 
                  onClick={saveSequence}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={createSequenceMutation.isPending}
                >
                  {createSequenceMutation.isPending ? "Saving..." : "Save Sequence"}
                </Button>
                
                <Button 
                  onClick={() => {
                    setNodes(initialNodes);
                    setEdges([]);
                  }}
                  variant="outline" 
                  className="w-full"
                >
                  Clear Canvas
                </Button>
              </div>

              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-sm text-blue-800 mb-2">Instructions:</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Drag components to the canvas</li>
                  <li>• Connect nodes by dragging handles</li>
                  <li>• Click nodes to edit settings</li>
                  <li>• Use mouse wheel to zoom</li>
                </ul>
              </div>
            </div>

            {/* Large Flow Builder Canvas */}
            <div className="flex-1 bg-gray-100 rounded-lg border overflow-hidden">
              <ReactFlowProvider>
                <FlowBuilder
                  nodes={nodes}
                  setNodes={setNodes}
                  edges={edges}
                  setEdges={setEdges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  selectedNode={selectedNode}
                  setSelectedNode={setSelectedNode}
                />
              </ReactFlowProvider>
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