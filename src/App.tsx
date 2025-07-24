import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { DashboardOverview } from './components/dashboard/DashboardOverview'
import HRManagement from './components/modules/HRManagement'
import ProjectManagement from './components/modules/ProjectManagement'
import CustomerSupport from './components/modules/CustomerSupport'
import TeamCommunication from './components/modules/TeamCommunication'
import WebsiteBuilder from './components/modules/WebsiteBuilder'
import Marketing from './components/modules/Marketing'
import Settings from './components/modules/Settings'
import { Toaster } from './components/ui/toaster'

// Placeholder components for other modules
const PlaceholderModule = ({ title, description }: { title: string; description: string }) => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
    <div className="bg-muted/50 border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
      <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
      <p className="text-muted-foreground">This module is under development and will be available soon.</p>
    </div>
  </div>
)

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeModule, setActiveModule] = useState('dashboard')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">StartupHub Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Your all-in-one business management platform
            </p>
          </div>
          <button
            onClick={() => blink.auth.login()}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    )
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardOverview />
      case 'hr':
        return <HRManagement />
      case 'finance':
        return <PlaceholderModule title="Finance & Accounting" description="Manage expenses, invoicing, and financial reports" />
      case 'projects':
        return <ProjectManagement />
      case 'support':
        return <CustomerSupport />
      case 'sales':
        return <PlaceholderModule title="Sales & CRM" description="Manage leads, deals, and customer relationships" />
      case 'marketing':
        return <Marketing />
      case 'legal':
        return <PlaceholderModule title="Legal & Compliance" description="Document management and legal compliance tracking" />
      case 'analytics':
        return <PlaceholderModule title="Analytics" description="Business intelligence and data visualization" />
      case 'website':
        return <WebsiteBuilder />
      case 'mobile':
        return <PlaceholderModule title="Mobile App Builder" description="No-code mobile app development platform" />
      case 'communication':
        return <TeamCommunication />
      case 'settings':
        return <Settings />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <>
      <DashboardLayout 
        activeModule={activeModule} 
        onModuleChange={setActiveModule}
      >
        {renderModule()}
      </DashboardLayout>
      <Toaster />
    </>
  )
}

export default App