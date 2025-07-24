import React, { useState, useEffect } from 'react'
import { blink } from '../../blink/client'
import { 
  Settings as SettingsIcon, 
  Users, 
  Shield, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X,
  Check,
  AlertTriangle,
  UserPlus,
  Key,
  Eye,
  EyeOff
} from 'lucide-react'



interface Employee {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'employee'
  department: string
  status: 'active' | 'inactive'
  permissions: string[]
  created_at: string
  updated_at: string
  user_id: string
}

interface Permission {
  module: string
  label: string
  description: string
}

const AVAILABLE_MODULES: Permission[] = [
  { module: 'dashboard', label: 'Dashboard Overview', description: 'View main dashboard and KPIs' },
  { module: 'hr', label: 'HR Management', description: 'Manage employees, payroll, and PTO' },
  { module: 'projects', label: 'Project Management', description: 'Create and manage projects and tasks' },
  { module: 'support', label: 'Customer Support', description: 'Handle customer tickets and chat' },
  { module: 'communication', label: 'Team Communication', description: 'Access team chat and channels' },
  { module: 'website', label: 'Website Builder', description: 'Create and edit company websites' },
  { module: 'marketing', label: 'Marketing Hub', description: 'Manage campaigns and marketing materials' },
  { module: 'finance', label: 'Finance & Accounting', description: 'View financial data and reports' },
  { module: 'sales', label: 'Sales & CRM', description: 'Manage sales pipeline and customers' },
  { module: 'legal', label: 'Legal & Compliance', description: 'Access legal documents and contracts' },
  { module: 'analytics', label: 'Analytics', description: 'View business analytics and reports' },
  { module: 'mobile', label: 'Mobile App Builder', description: 'Create mobile applications' },
  { module: 'settings', label: 'Settings & Admin', description: 'Admin portal and system settings' }
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'employees' | 'permissions' | 'system'>('employees')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null)
  const [newEmployee, setNewEmployee] = useState({
    email: '',
    name: '',
    role: 'employee' as 'admin' | 'manager' | 'employee',
    department: '',
    permissions: [] as string[]
  })

  const loadData = async () => {
    try {
      const user = await blink.auth.me()
      setCurrentUser(user)
      
      // Check if current user is admin
      const userEmployeeRecord = await blink.db.employees.list({
        where: { email: user.email },
        limit: 1
      })
      
      const isUserAdmin = userEmployeeRecord.length > 0 && userEmployeeRecord[0].role === 'admin'
      setIsAdmin(isUserAdmin)
      
      if (isUserAdmin) {
        const employeeList = await blink.db.employees.list({
          orderBy: { created_at: 'desc' }
        })
        setEmployees(employeeList)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAddEmployee = async () => {
    if (!newEmployee.email || !newEmployee.name) return

    try {
      const employee = await blink.db.employees.create({
        id: `emp_${Date.now()}`,
        email: newEmployee.email,
        name: newEmployee.name,
        role: newEmployee.role,
        department: newEmployee.department,
        status: 'active',
        permissions: JSON.stringify(newEmployee.permissions),
        user_id: currentUser.id
      })

      setEmployees([employee, ...employees])
      setNewEmployee({
        email: '',
        name: '',
        role: 'employee',
        department: '',
        permissions: []
      })
      setShowAddEmployee(false)
    } catch (error) {
      console.error('Error adding employee:', error)
    }
  }

  const handleUpdateEmployee = async (employeeId: string, updates: Partial<Employee>) => {
    try {
      if (updates.permissions) {
        updates.permissions = JSON.stringify(updates.permissions) as any
      }
      
      await blink.db.employees.update(employeeId, updates)
      
      setEmployees(employees.map(emp => 
        emp.id === employeeId 
          ? { ...emp, ...updates, permissions: typeof updates.permissions === 'string' ? JSON.parse(updates.permissions) : emp.permissions }
          : emp
      ))
      setEditingEmployee(null)
    } catch (error) {
      console.error('Error updating employee:', error)
    }
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return

    try {
      await blink.db.employees.delete(employeeId)
      setEmployees(employees.filter(emp => emp.id !== employeeId))
    } catch (error) {
      console.error('Error deleting employee:', error)
    }
  }

  const togglePermission = (employeeId: string, module: string) => {
    const employee = employees.find(emp => emp.id === employeeId)
    if (!employee) return

    const currentPermissions = Array.isArray(employee.permissions) 
      ? employee.permissions 
      : JSON.parse(employee.permissions || '[]')
    
    const updatedPermissions = currentPermissions.includes(module)
      ? currentPermissions.filter((p: string) => p !== module)
      : [...currentPermissions, module]

    handleUpdateEmployee(employeeId, { permissions: updatedPermissions })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Access Restricted</h3>
          <p className="text-yellow-700">
            You need administrator privileges to access the Settings panel. 
            Please contact your system administrator for access.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="h-8 w-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Settings & Admin Portal</h1>
        </div>
        <p className="text-gray-600">Manage employees, permissions, and system settings</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'employees', label: 'Employee Management', icon: Users },
            { id: 'permissions', label: 'Module Permissions', icon: Shield },
            { id: 'system', label: 'System Settings', icon: SettingsIcon }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Employee Management Tab */}
      {activeTab === 'employees' && (
        <div className="space-y-6">
          {/* Add Employee Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Employee Directory</h2>
            <button
              onClick={() => setShowAddEmployee(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Add Employee
            </button>
          </div>

          {/* Add Employee Modal */}
          {showAddEmployee && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Add New Employee</h3>
                  <button
                    onClick={() => setShowAddEmployee(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="employee@company.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={newEmployee.role}
                      onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={newEmployee.department}
                      onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Engineering"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleAddEmployee}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Add Employee
                  </button>
                  <button
                    onClick={() => setShowAddEmployee(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Employee List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permissions
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee) => {
                    const permissions = Array.isArray(employee.permissions) 
                      ? employee.permissions 
                      : JSON.parse(employee.permissions || '[]')
                    
                    return (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 font-medium">
                                {employee.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                              <div className="text-sm text-gray-500">{employee.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            employee.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800'
                              : employee.role === 'manager'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {employee.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            employee.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {employee.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {permissions.length} modules
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingEmployee(editingEmployee === employee.id ? null : employee.id)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(employee.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Module Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Module Access Control</h2>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    {AVAILABLE_MODULES.map((module) => (
                      <th key={module.module} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="transform -rotate-45 origin-center whitespace-nowrap">
                          {module.label.split(' ')[0]}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee) => {
                    const permissions = Array.isArray(employee.permissions) 
                      ? employee.permissions 
                      : JSON.parse(employee.permissions || '[]')
                    
                    return (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 text-sm font-medium">
                                {employee.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                              <div className="text-xs text-gray-500">{employee.role}</div>
                            </div>
                          </div>
                        </td>
                        {AVAILABLE_MODULES.map((module) => (
                          <td key={module.module} className="px-3 py-4 text-center">
                            <button
                              onClick={() => togglePermission(employee.id, module.module)}
                              className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${
                                permissions.includes(module.module)
                                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                            >
                              {permissions.includes(module.module) ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Module Legend */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Module Descriptions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AVAILABLE_MODULES.map((module) => (
                <div key={module.module} className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-1">{module.label}</h4>
                  <p className="text-sm text-gray-600">{module.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* System Settings Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">System Configuration</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Company Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    defaultValue="StartupHub Inc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option>UTC-8 (Pacific Time)</option>
                    <option>UTC-5 (Eastern Time)</option>
                    <option>UTC+0 (GMT)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                    <p className="text-xs text-gray-500">Require 2FA for all admin accounts</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Session Timeout</label>
                    <p className="text-xs text-gray-500">Auto-logout after inactivity</p>
                  </div>
                  <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>4 hours</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Password Policy</label>
                    <p className="text-xs text-gray-500">Enforce strong passwords</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                    <p className="text-xs text-gray-500">Send system alerts via email</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Slack Integration</label>
                    <p className="text-xs text-gray-500">Send alerts to Slack channels</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                  <input
                    type="email"
                    defaultValue="admin@startuphub.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Backup & Data */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Backup & Data</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Automatic Backups</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                    Create Backup Now
                  </button>
                  <button className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                    Export Data
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  Last backup: Today at 3:00 AM
                </div>
              </div>
            </div>
          </div>

          {/* Save Settings Button */}
          <div className="flex justify-end">
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              <Save className="h-4 w-4" />
              Save All Settings
            </button>
          </div>
        </div>
      )}
    </div>
  )
}