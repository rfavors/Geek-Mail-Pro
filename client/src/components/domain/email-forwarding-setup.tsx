import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  ExternalLink, 
  Copy, 
  Check, 
  Globe,
  Mail,
  Settings,
  ArrowRight,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface EmailForwardingSetupProps {
  webhookUrl: string;
}

export function EmailForwardingSetup({ webhookUrl }: EmailForwardingSetupProps) {
  const { toast } = useToast();
  const [copiedUrl, setCopiedUrl] = useState(false);

  const copyWebhookUrl = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    toast({
      title: "Copied!",
      description: "Webhook URL copied to clipboard",
    });
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const openMailgun = () => {
    window.open('https://www.mailgun.com/', '_blank');
  };

  const setupSteps = [
    {
      title: "Create Mailgun Account",
      description: "Sign up for free (1,000 emails/month included)",
      status: "pending",
      action: "Sign Up",
      url: "https://www.mailgun.com/"
    },
    {
      title: "Add Domain to Mailgun", 
      description: "Add thegeektrepreneur.com to your Mailgun dashboard",
      status: "pending"
    },
    {
      title: "Configure DNS Records",
      description: "Add MX, TXT, and CNAME records to your domain",
      status: "pending"
    },
    {
      title: "Set Up Email Route",
      description: "Forward all emails to your webhook endpoint",
      status: "pending"
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Forwarding Setup
          </CardTitle>
          <CardDescription>
            Configure DNS and mail service to receive emails at marketing@thegeektrepreneur.com
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">Setup Required</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  DNS configuration needed to receive emails
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-yellow-400 text-yellow-700">
              Not Configured
            </Badge>
          </div>

          {/* Webhook URL */}
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Your Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                value={webhookUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyWebhookUrl}
              >
                {copiedUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This is where Mailgun will forward incoming emails
            </p>
          </div>

          {/* Setup Steps */}
          <div className="space-y-4">
            <h3 className="font-medium">Setup Steps</h3>
            <div className="space-y-3">
              {setupSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {step.action && (
                    <Button variant="outline" size="sm" onClick={openMailgun}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {step.action}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Start */}
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Finding Email Forwarding in Mailgun
            </h4>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <p><strong>Email forwarding is called "Routes" in Mailgun:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Look for <strong>"Routes"</strong> in the left sidebar</li>
                <li>Or check under <strong>"Receiving"</strong> section</li>
                <li>Some versions show it as <strong>"Email Routing"</strong></li>
                <li>Click <strong>"Create Route"</strong> to set up forwarding</li>
                <li>Use filter: <code>.*@thegeektrepreneur.com</code></li>
                <li>Action: Forward to your webhook URL</li>
              </ol>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={openMailgun} className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Mailgun Setup
            </Button>
            <Button variant="outline" onClick={() => window.open('/docs/MAILGUN_SETUP_GUIDE.md', '_blank')}>
              View Complete Guide
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* DNS Records Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Required DNS Records</CardTitle>
          <CardDescription>
            Add these records to thegeektrepreneur.com in your domain registrar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="font-medium">Type</div>
              <div className="font-medium">Name</div>
              <div className="font-medium">Value</div>
            </div>
            {[
              { type: "MX", name: "@", value: "mxa.mailgun.org (Priority: 10)" },
              { type: "MX", name: "@", value: "mxb.mailgun.org (Priority: 10)" },
              { type: "TXT", name: "@", value: "v=spf1 include:mailgun.org ~all" },
              { type: "TXT", name: "_dmarc", value: "v=DMARC1; p=none;" },
              { type: "CNAME", name: "email", value: "mailgun.org" }
            ].map((record, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2 border-b text-sm">
                <Badge variant="outline">{record.type}</Badge>
                <code className="text-xs">{record.name}</code>
                <code className="text-xs break-all">{record.value}</code>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            * Exact values will be provided in your Mailgun dashboard
          </p>
        </CardContent>
      </Card>
    </div>
  );
}