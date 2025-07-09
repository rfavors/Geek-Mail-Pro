import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, X, Filter } from "lucide-react";

interface SegmentBuilderProps {
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

interface Rule {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface ConditionGroup {
  id: string;
  operator: 'AND' | 'OR';
  rules: Rule[];
}

export function SegmentBuilder({
  initialData,
  onSave,
  onCancel,
  isLoading = false,
  isEdit = false
}: SegmentBuilderProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [isAutoUpdate, setIsAutoUpdate] = useState(initialData?.isAutoUpdate ?? true);
  const [conditions, setConditions] = useState<ConditionGroup>(() => {
    if (initialData?.conditions) {
      return initialData.conditions;
    }
    return {
      id: 'root',
      operator: 'AND',
      rules: [{
        id: Math.random().toString(36),
        field: '',
        operator: '',
        value: ''
      }]
    };
  });

  const fieldOptions = [
    { value: 'email', label: 'Email' },
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'company', label: 'Company' },
    { value: 'jobTitle', label: 'Job Title' },
    { value: 'location', label: 'Location' },
    { value: 'engagementScore', label: 'Engagement Score' },
    { value: 'totalEmailsOpened', label: 'Emails Opened' },
    { value: 'totalEmailsClicked', label: 'Emails Clicked' },
    { value: 'createdAt', label: 'Sign-up Date' },
    { value: 'lastActivityAt', label: 'Last Activity' },
    { value: 'tags', label: 'Tags' },
  ];

  const getOperatorOptions = (field: string) => {
    const numericFields = ['engagementScore', 'totalEmailsOpened', 'totalEmailsClicked'];
    const dateFields = ['createdAt', 'lastActivityAt'];
    const textFields = ['email', 'firstName', 'lastName', 'company', 'jobTitle', 'location'];
    const arrayFields = ['tags'];

    if (numericFields.includes(field)) {
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Not Equals' },
        { value: 'greater_than', label: 'Greater Than' },
        { value: 'less_than', label: 'Less Than' },
        { value: 'greater_equal', label: 'Greater or Equal' },
        { value: 'less_equal', label: 'Less or Equal' },
      ];
    } else if (dateFields.includes(field)) {
      return [
        { value: 'date_before', label: 'Before' },
        { value: 'date_after', label: 'After' },
      ];
    } else if (arrayFields.includes(field)) {
      return [
        { value: 'tag_contains', label: 'Contains Tag' },
        { value: 'is_empty', label: 'Has No Tags' },
        { value: 'is_not_empty', label: 'Has Tags' },
      ];
    } else {
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Not Equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'not_contains', label: 'Does Not Contain' },
        { value: 'starts_with', label: 'Starts With' },
        { value: 'ends_with', label: 'Ends With' },
        { value: 'is_empty', label: 'Is Empty' },
        { value: 'is_not_empty', label: 'Is Not Empty' },
      ];
    }
  };

  const addRule = () => {
    setConditions(prev => ({
      ...prev,
      rules: [...prev.rules, {
        id: Math.random().toString(36),
        field: '',
        operator: '',
        value: ''
      }]
    }));
  };

  const removeRule = (ruleId: string) => {
    setConditions(prev => ({
      ...prev,
      rules: prev.rules.filter(rule => rule.id !== ruleId)
    }));
  };

  const updateRule = (ruleId: string, updates: Partial<Rule>) => {
    setConditions(prev => ({
      ...prev,
      rules: prev.rules.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    }));
  };

  const handleSave = () => {
    if (!name.trim()) {
      return;
    }

    // Validate that all rules have required fields
    const hasInvalidRules = conditions.rules.some(rule => 
      !rule.field || !rule.operator || (needsValue(rule.operator) && !rule.value)
    );

    if (hasInvalidRules) {
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      isActive,
      isAutoUpdate,
      conditions
    });
  };

  const needsValue = (operator: string) => {
    return !['is_empty', 'is_not_empty'].includes(operator);
  };

  const renderValueInput = (rule: Rule) => {
    if (!needsValue(rule.operator)) {
      return null;
    }

    const numericFields = ['engagementScore', 'totalEmailsOpened', 'totalEmailsClicked'];
    const dateFields = ['createdAt', 'lastActivityAt'];

    if (numericFields.includes(rule.field)) {
      return (
        <Input
          type="number"
          placeholder="Enter number"
          value={rule.value}
          onChange={(e) => updateRule(rule.id, { value: e.target.value })}
        />
      );
    } else if (dateFields.includes(rule.field)) {
      return (
        <Input
          type="date"
          value={rule.value}
          onChange={(e) => updateRule(rule.id, { value: e.target.value })}
        />
      );
    } else {
      return (
        <Input
          placeholder="Enter value"
          value={rule.value}
          onChange={(e) => updateRule(rule.id, { value: e.target.value })}
        />
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Segment Name</Label>
          <Input
            id="name"
            placeholder="Enter segment name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe this segment's purpose"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="active">Active</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="auto-update"
              checked={isAutoUpdate}
              onCheckedChange={setIsAutoUpdate}
            />
            <Label htmlFor="auto-update">Auto-update membership</Label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Conditions Builder */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="text-lg font-semibold">Segment Conditions</h3>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Rules</CardTitle>
              <Select
                value={conditions.operator}
                onValueChange={(value: 'AND' | 'OR') => 
                  setConditions(prev => ({ ...prev, operator: value }))
                }
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AND">AND</SelectItem>
                  <SelectItem value="OR">OR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              {conditions.operator === 'AND' 
                ? 'All conditions must be met' 
                : 'Any condition can be met'
              }
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {conditions.rules.map((rule, index) => (
              <div key={rule.id} className="space-y-3">
                {index > 0 && (
                  <div className="flex items-center justify-center">
                    <Badge variant="outline" className="text-xs">
                      {conditions.operator}
                    </Badge>
                  </div>
                )}
                
                <div className="grid gap-3 p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Field Selection */}
                    <div className="space-y-1">
                      <Label className="text-xs">Field</Label>
                      <Select
                        value={rule.field}
                        onValueChange={(value) => updateRule(rule.id, { 
                          field: value, 
                          operator: '', 
                          value: '' 
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Operator Selection */}
                    <div className="space-y-1">
                      <Label className="text-xs">Condition</Label>
                      <Select
                        value={rule.operator}
                        onValueChange={(value) => updateRule(rule.id, { 
                          operator: value, 
                          value: needsValue(value) ? rule.value : '' 
                        })}
                        disabled={!rule.field}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {rule.field && getOperatorOptions(rule.field).map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Value Input */}
                    <div className="space-y-1">
                      <Label className="text-xs">Value</Label>
                      {needsValue(rule.operator) ? (
                        renderValueInput(rule)
                      ) : (
                        <div className="h-10 flex items-center px-3 border rounded-md bg-muted text-muted-foreground text-sm">
                          No value needed
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Remove Rule Button */}
                  {conditions.rules.length > 1 && (
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRule(rule.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Remove Rule
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={addRule}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isLoading || !name.trim()}
        >
          {isLoading ? "Saving..." : isEdit ? "Update Segment" : "Create Segment"}
        </Button>
      </div>
    </div>
  );
}