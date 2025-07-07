import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Mail, 
  Users, 
  Globe, 
  BarChart3,
  Settings,
  CreditCard
} from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Campaigns', href: '/campaigns', icon: Mail },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Domain Settings', href: '/domain-settings', icon: Globe },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-background border-r">
      <div className="flex flex-1 flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href || 
              (item.href !== '/' && location.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors'
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground',
                    'mr-3 flex-shrink-0 h-5 w-5'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
