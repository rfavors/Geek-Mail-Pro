import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  Download, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Users
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CsvImportProps {
  onComplete: () => void;
}

export function CsvImport({ onComplete }: CsvImportProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string>("");
  const [preview, setPreview] = useState<any[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [selectedList, setSelectedList] = useState<string>("");

  const { data: contactLists } = useQuery({
    queryKey: ["/api/contact-lists"],
  });

  const importMutation = useMutation({
    mutationFn: async (data: { csvData: string; listId?: string }) => {
      return await apiRequest("POST", "/api/contacts/import-csv", data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contact-lists"] });
      toast({
        title: "Import Successful",
        description: `Successfully imported ${data.imported} contacts.`,
      });
      onComplete();
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
        title: "Import Failed",
        description: "Failed to import contacts. Please check your CSV format.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvData(text);
      
      // Generate preview
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const previewData = lines.slice(1, 6).map(line => {
        const values = line.split(',');
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || '';
        });
        return row;
      });
      setPreview(previewData);
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = () => {
    if (!csvData) {
      toast({
        title: "No File Selected",
        description: "Please upload a CSV file first.",
        variant: "destructive",
      });
      return;
    }

    importMutation.mutate({
      csvData,
      listId: selectedList || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            {!file ? (
              <>
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload CSV File</h3>
                <p className="text-muted-foreground mb-4">
                  Drop your CSV file here or click to browse
                </p>
                <Label htmlFor="csv-file" className="cursor-pointer">
                  <Button asChild>
                    <span>Choose File</span>
                  </Button>
                  <input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </Label>
              </>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <FileText className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CSV Format Requirements */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-3">CSV Format Requirements</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span><strong>email</strong> (required) - Valid email address</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span><strong>firstName</strong> (optional) - Contact's first name</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span><strong>lastName</strong> (optional) - Contact's last name</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span><strong>company</strong> (optional) - Company name</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Sample CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List Selection */}
      {contactLists && contactLists.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <Label htmlFor="list-select" className="text-base font-medium">
              Add to Contact List (Optional)
            </Label>
            <p className="text-sm text-muted-foreground mb-3">
              Select a list to automatically add imported contacts
            </p>
            <Select value={selectedList} onValueChange={setSelectedList}>
              <SelectTrigger>
                <SelectValue placeholder="Select a contact list" />
              </SelectTrigger>
              <SelectContent>
                {contactLists.map((list: any) => (
                  <SelectItem key={list.id} value={list.id.toString()}>
                    {list.name} ({list.subscriberCount || 0} subscribers)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold mb-3">Preview (First 5 rows)</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    {Object.keys(preview[0]).map(header => (
                      <th key={header} className="border border-muted p-2 text-left bg-muted/50">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value: any, cellIndex) => (
                        <td key={cellIndex} className="border border-muted p-2">
                          {value || <span className="text-muted-foreground">-</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Progress */}
      {importMutation.isPending && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Importing contacts...</span>
                <span className="text-sm text-muted-foreground">{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onComplete}>
          Cancel
        </Button>
        <Button 
          onClick={handleImport}
          disabled={!file || importMutation.isPending}
        >
          <Users className="h-4 w-4 mr-2" />
          {importMutation.isPending ? "Importing..." : "Import Contacts"}
        </Button>
      </div>
    </div>
  );
}
