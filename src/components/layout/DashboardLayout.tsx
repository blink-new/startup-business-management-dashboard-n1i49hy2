import { useState } from 'react'
import { 
  BarChart3, 
  Building2, 
  Calendar, 
  CreditCard, 
  FileText, 
  Headphones, 
  Home, 
  Mail, 
  MessageSquare, 
  PieChart, 
  Smartphone, 
  TrendingUp, 
  Users,
  Menu,
  Bell,
  Search,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
  activeModule: string
  onModuleChange: (module: string) => void
}

const modules = [
  { id: 'dashboard', name: 'Dashboard', icon: Home },
  { id: 'hr', name: 'HR Management', icon: Users },
  { id: 'finance', name: 'Finance & Accounting', icon: CreditCard },
  { id: 'projects', name: 'Project Management', icon: BarChart3 },
  { id: 'support', name: 'Customer Support', icon: Headphones },
  { id: 'sales', name: 'Sales & CRM', icon: TrendingUp },
  { id: 'marketing', name: 'Marketing Hub', icon: Mail },
  { id: 'legal', name: 'Legal & Compliance', icon: FileText },
  { id: 'analytics', name: 'Analytics', icon: PieChart },
  { id: 'website', name: 'Website Builder', icon: Building2 },
  { id: 'mobile', name: 'Mobile App Builder', icon: Smartphone },
  { id: 'communication', name: 'Team Communication', icon: MessageSquare },
]

export function DashboardLayout({ children, activeModule, onModuleChange }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "bg-card border-r border-border transition-all duration-300 flex flex-col",
        sidebarCollapsed ? "w-16" : "w-64"
      )}>
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-semibold text-sm">StartupHub</h1>
                <p className="text-xs text-muted-foreground">Business Dashboard</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {modules.map((module) => {
            const Icon = module.icon
            const isActive = activeModule === module.id
            
            return (
              <button
                key={module.id}
                onClick={() => onModuleChange(module.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>{module.name}</span>}
              </button>
            )
          })}
        </nav>

        {/* Settings */}
        <div className="p-2 border-t border-border">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent">
            <Settings className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Settings</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <Menu className="w-4 h-4" />
              </Button>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-10 w-80"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs">
                  3
                </Badge>
              </Button>
              
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}