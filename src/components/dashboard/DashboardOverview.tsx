import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const revenueData = [
  { month: 'Jan', revenue: 45000, expenses: 32000 },
  { month: 'Feb', revenue: 52000, expenses: 35000 },
  { month: 'Mar', revenue: 48000, expenses: 33000 },
  { month: 'Apr', revenue: 61000, expenses: 38000 },
  { month: 'May', revenue: 55000, expenses: 36000 },
  { month: 'Jun', revenue: 67000, expenses: 41000 },
]

const projectData = [
  { name: 'Completed', value: 45, color: '#22c55e' },
  { name: 'In Progress', value: 30, color: '#6366f1' },
  { name: 'On Hold', value: 15, color: '#f59e0b' },
  { name: 'Cancelled', value: 10, color: '#ef4444' },
]

const teamPerformance = [
  { department: 'Engineering', performance: 92 },
  { department: 'Sales', performance: 88 },
  { department: 'Marketing', performance: 85 },
  { department: 'Support', performance: 94 },
  { department: 'HR', performance: 90 },
]

const recentActivities = [
  { id: 1, type: 'project', message: 'New project "Mobile App Redesign" created', time: '2 minutes ago', user: 'Sarah Chen' },
  { id: 2, type: 'hr', message: 'John Smith submitted PTO request', time: '15 minutes ago', user: 'John Smith' },
  { id: 3, type: 'sales', message: 'Deal "Enterprise Contract" moved to closing stage', time: '1 hour ago', user: 'Mike Johnson' },
  { id: 4, type: 'support', message: '3 new support tickets assigned', time: '2 hours ago', user: 'System' },
  { id: 5, type: 'finance', message: 'Monthly expense report generated', time: '3 hours ago', user: 'Finance Team' },
]

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$328,000</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12.5% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              +3 new this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <div className="flex items-center text-xs text-blue-600">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              +5 hired this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +2.1% improvement
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
            <CardDescription>Monthly comparison for the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                <Area type="monotone" dataKey="expenses" stackId="2" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Status */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
            <CardDescription>Current status of all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {projectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 mt-4">
              {projectData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
            <CardDescription>Department performance scores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamPerformance.map((dept) => (
              <div key={dept.department} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{dept.department}</span>
                  <span className="font-medium">{dept.performance}%</span>
                </div>
                <Progress value={dept.performance} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across all modules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{activity.user}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used actions across modules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="w-5 h-5" />
              <span className="text-xs">Add Employee</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Target className="w-5 h-5" />
              <span className="text-xs">New Project</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-xs">Add Expense</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs">Support Ticket</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Calendar className="w-5 h-5" />
              <span className="text-xs">Schedule Meeting</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs">View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}