import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { 
  Sparkles, 
  Play, 
  Users, 
  Mail, 
  TrendingUp, 
  DollarSign,
  Check,
  Bot,
  Globe,
  ChartLine,
  Lightbulb,
  Crown,
  ShoppingCart,
  Twitter,
  Github,
  Linkedin
} from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Logo size="lg" variant="full" />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a>
              <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</a>
              <a href="#docs" className="text-muted-foreground hover:text-primary transition-colors">Docs</a>
              
              <ModeToggle />
              
              <Button variant="ghost" asChild>
                <a href="/api/login">Login</a>
              </Button>
              <Button asChild>
                <a href="/api/login">Get Started</a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-background via-background to-blue-50/50 dark:to-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              Custom Domain Email Marketing for 2025
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Email Marketing for{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Geeks
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Build, send, and track professional email campaigns with custom domain support. 
              Higher deliverability, better open rates, and complete control over your email reputation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="/api/login">Start Free Trial</a>
              </Button>
              <Button variant="outline" size="lg">
                <Play className="h-4 w-4 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Hero Dashboard Preview */}
          <div className="relative max-w-6xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl"></div>
            <Card className="relative border shadow-2xl">
              <CardContent className="p-0">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800" 
                  alt="Geek Mail Pro Dashboard Interface" 
                  className="w-full rounded-lg"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Dashboard</h2>
                <p className="text-muted-foreground">Welcome back! Here's your campaign overview.</p>
              </div>
              <Button>
                <Mail className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Subscribers</p>
                      <p className="text-2xl font-bold">12,847</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600 text-sm">12%</span>
                    <span className="text-muted-foreground text-sm ml-2">vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Open Rate</p>
                      <p className="text-2xl font-bold">41.8%</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600 text-sm">9.4%</span>
                    <span className="text-muted-foreground text-sm ml-2">above industry avg</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Click Rate</p>
                      <p className="text-2xl font-bold">8.2%</p>
                    </div>
                    <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/20 rounded-lg flex items-center justify-center">
                      <ChartLine className="h-6 w-6 text-cyan-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600 text-sm">3.1%</span>
                    <span className="text-muted-foreground text-sm ml-2">vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="text-2xl font-bold">$8,429</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600 text-sm">18%</span>
                    <span className="text-muted-foreground text-sm ml-2">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Card>
        </div>
      </section>

      {/* Custom Domain Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Custom Domain Email Sending</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Achieve 41.8% open rates with professional custom domain authentication. 
              Setup takes minutes, reputation building starts immediately.
            </p>
          </div>

          <Card className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold mb-6 flex items-center">
                  <Globe className="h-6 w-6 text-primary mr-3" />
                  Domain Configuration
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Primary Domain</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="thegeektrepreneur.com" 
                        className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                        readOnly
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Check className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <p className="text-sm text-green-600 mt-2">✓ Domain verified and authenticated</p>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-semibold mb-4">DNS Configuration Status</h4>
                    <div className="space-y-3">
                      {[
                        { name: "SPF Record", status: "Verified" },
                        { name: "DKIM Record", status: "Verified" },
                        { name: "DMARC Record", status: "Verified" },
                      ].map((record) => (
                        <div key={record.name} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">{record.name}</span>
                          </div>
                          <Badge variant="secondary" className="text-green-600">
                            {record.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-6 flex items-center">
                  <ChartLine className="h-6 w-6 text-cyan-600 mr-3" />
                  Domain Reputation
                </h3>
                
                <div className="bg-muted/50 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">Warming Progress</span>
                    <span className="text-sm font-bold text-green-600">78% Complete</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-500 to-cyan-500 h-3 rounded-full" style={{width: "78%"}}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Week 3 of 4 - Ready for larger volumes</p>
                </div>

                <div className="space-y-4">
                  {[
                    { label: "Sender Score", value: "87", description: "Excellent reputation" },
                    { label: "Bounce Rate", value: "1.2%", description: "Well below 2% threshold" },
                    { label: "Spam Rate", value: "0.03%", description: "Excellent performance" },
                  ].map((metric) => (
                    <Card key={metric.label}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{metric.label}</span>
                          <span className="text-xl font-bold text-green-600">{metric.value}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{metric.description}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="mt-6 bg-primary/10 border-primary/20">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-primary mb-2 flex items-center">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Pro Tip
                    </h4>
                    <p className="text-sm">
                      Your domain is ready for full email volumes! You can now send up to 10,000 emails per day while maintaining excellent deliverability.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the perfect plan for your email marketing needs. All plans include custom domain support and unlimited templates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Starter</h3>
                  <p className="text-muted-foreground mb-6">Perfect for small businesses getting started</p>
                  <div className="text-4xl font-bold">$19<span className="text-lg text-muted-foreground">/month</span></div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "Up to 2,500 subscribers",
                    "15,000 emails per month",
                    "Custom domain sending",
                    "Drag & drop editor",
                    "Basic analytics",
                    "Email support"
                  ].map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button variant="outline" className="w-full" asChild>
                  <a href="/api/login">Start Free Trial</a>
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-primary shadow-lg relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
              
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Pro</h3>
                  <p className="text-muted-foreground mb-6">For growing businesses that need more power</p>
                  <div className="text-4xl font-bold">$49<span className="text-lg text-muted-foreground">/month</span></div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "Up to 10,000 subscribers",
                    "100,000 emails per month",
                    "Custom domain sending",
                    "Advanced automation",
                    "A/B testing",
                    "Advanced analytics",
                    "Priority support"
                  ].map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button className="w-full" asChild>
                  <a href="/api/login">Start Free Trial</a>
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                  <p className="text-muted-foreground mb-6">For large organizations with custom needs</p>
                  <div className="text-4xl font-bold">$149<span className="text-lg text-muted-foreground">/month</span></div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "Unlimited subscribers",
                    "Unlimited emails",
                    "Dedicated IP",
                    "Multi-user accounts",
                    "API access",
                    "White-label options",
                    "24/7 phone support"
                  ].map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button variant="outline" className="w-full">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Test Card Information */}
          <Card className="mt-16 bg-muted/50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <DollarSign className="h-5 w-5 text-primary mr-2" />
                Test Payment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2"><strong>Test Card Number:</strong></p>
                  <code className="bg-background px-3 py-2 rounded text-sm border">4242 4242 4242 4242</code>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2"><strong>Test Details:</strong></p>
                  <p className="text-sm text-muted-foreground">Expiry: Any future date | CVC: Any 3 digits</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Geek Mail Pro</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Professional email marketing for geeks. Build better campaigns, 
                achieve higher deliverability, and grow your business with custom domain email sending.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                {["Features", "Pricing", "API Docs", "Integrations", "Templates"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-primary transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                {["Help Center", "Contact Us", "Status Page", "Privacy Policy", "Terms of Service"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-primary transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Geek Mail Pro. All rights reserved. Made with ❤️ for email marketing geeks worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
