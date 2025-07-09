import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Check, 
  AlertCircle,
  Copy,
  ExternalLink,
  Loader2
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
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

const domainSchema = z.object({
  domain: z.string()
    .min(1, "Domain is required")
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/, "Invalid domain format"),
});

type DomainFormData = z.infer<typeof domainSchema>;

interface DomainConfigProps {
  onComplete: () => void;
}

export function DomainConfig({ onComplete }: DomainConfigProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [verificationStep, setVerificationStep] = useState<"input" | "dns" | "verified">("input");

  const form = useForm<DomainFormData>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      domain: "",
    },
  });

  const addDomainMutation = useMutation({
    mutationFn: async (data: DomainFormData) => {
      return await apiRequest("POST", "/api/domains", data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/domains"] });
      
      if (data.isVerified) {
        setVerificationStep("verified");
        toast({
          title: "Domain Added Successfully",
          description: "Your domain has been configured and verified!",
        });
        setTimeout(onComplete, 2000);
      } else {
        setVerificationStep("dns");
        toast({
          title: "Domain Added",
          description: "Please configure the DNS records to complete verification.",
        });
      }
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
        description: "Failed to add domain. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DomainFormData) => {
    addDomainMutation.mutate(data);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "DNS record copied to clipboard",
    });
  };

  const dnsRecords = [
    {
      type: "TXT",
      name: "_dmarc",
      value: "v=DMARC1; p=reject; rua=mailto:dmarc@thegeektrepreneur.com",
      description: "DMARC policy for email authentication"
    },
    {
      type: "TXT", 
      name: "@",
      value: "v=spf1 include:geek-mail-pro.com ~all",
      description: "SPF record for authorized email sending"
    },
    {
      type: "CNAME",
      name: "geek-mail-pro._domainkey",
      value: "geek-mail-pro._domainkey.geek-mail-pro.com",
      description: "DKIM signing key for email authentication"
    }
  ];

  if (verificationStep === "verified") {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-green-600">Domain Verified!</h3>
          <p className="text-muted-foreground">
            Your domain has been successfully configured and is ready for email sending.
          </p>
        </div>
      </div>
    );
  }

  if (verificationStep === "dns") {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>DNS Configuration Required</AlertTitle>
          <AlertDescription>
            Please add the following DNS records to your domain to complete verification.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h4 className="font-semibold">Required DNS Records</h4>
          {dnsRecords.map((record, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{record.type} Record</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(record.value)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Name/Host</Label>
                      <div className="font-mono text-sm bg-muted p-2 rounded">
                        {record.name}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Value</Label>
                      <div className="font-mono text-sm bg-muted p-2 rounded break-all">
                        {record.value}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    {record.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Need Help?</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>DNS propagation can take up to 24-48 hours. We'll automatically verify your records.</p>
            <Button variant="link" className="p-0 h-auto text-primary">
              <ExternalLink className="h-4 w-4 mr-1" />
              View DNS Setup Guide
            </Button>
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setVerificationStep("input")}>
            Back
          </Button>
          <Button onClick={onComplete}>
            I'll Configure This Later
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Add Custom Domain</h3>
        <p className="text-muted-foreground">
          Configure a custom domain for professional email sending with better deliverability.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="domain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Domain Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="example.com" 
                    {...field}
                    className="text-center text-lg"
                  />
                </FormControl>
                <FormDescription>
                  Enter your domain without "www" or "http://"
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <h4 className="font-semibold text-primary mb-2">Benefits of Custom Domain</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>41.8% higher open rates vs free domains</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Better email deliverability and spam avoidance</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Professional branding and trust</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Gmail/Yahoo compliance for bulk sending</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" onClick={onComplete}>
              Cancel
            </Button>
            <Button type="submit" disabled={addDomainMutation.isPending}>
              {addDomainMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Add Domain
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
