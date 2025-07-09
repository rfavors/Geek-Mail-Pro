import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import NotFound from "@/pages/not-found";
import LeadGeneration from "@/pages/lead-generation";
import EmailSequences from "@/pages/email-sequences";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Campaigns from "@/pages/campaigns";
import Contacts from "@/pages/contacts";
import DomainSettings from "@/pages/domain-settings";
import Billing from "@/pages/billing";

function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return children;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <AppLayout>
      <Switch>
        {isLoading || !isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={Dashboard} />
            <Route path="/campaigns" component={Campaigns} />
            <Route path="/contacts" component={Contacts} />
            <Route path="/domain-settings" component={DomainSettings} />
            <Route path="/lead-generation" component={LeadGeneration} />
            <Route path="/email-sequences" component={EmailSequences} />
            <Route path="/analytics" component={() => <div className="space-y-6"><h1 className="text-3xl font-bold">Analytics</h1><p className="text-muted-foreground">Detailed analytics coming soon...</p></div>} />
            <Route path="/billing" component={Billing} />
            <Route path="/settings" component={() => <div className="space-y-6"><h1 className="text-3xl font-bold">Settings</h1><p className="text-muted-foreground">Account settings coming soon...</p></div>} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="geek-mail-pro-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
