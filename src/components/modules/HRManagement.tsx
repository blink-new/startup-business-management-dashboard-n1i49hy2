import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Calendar, Award, Plus, Search, Filter, Download, Edit, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { blink } from '../../blink/client';

interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  salary: number;
  hire_date: string;
  status: 'active' | 'inactive';
  avatar?: string;
}

interface PTORequest {
  id: string;
  employee_id: string;
  employee_name: string;
  type: 'vacation' | 'sick' | 'personal';
  start_date: string;
  end_date: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  created_at: string;
}

interface PayrollEntry {
  id: string;
  employee_id: string;
  employee_name: string;
  period: string;
  base_salary: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  net_pay: number;
  status: 'draft' | 'processed' | 'paid';
}

export default function HRManagement() {
  const [activeTab, setActiveTab] = useState('employees');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [ptoRequests, setPtoRequests] = useState<PTORequest[]>([]);
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddPTO, setShowAddPTO] = useState(false);

  const loadEmployees = async () => {
    try {
      const user = await blink.auth.me();
      const data = await blink.db.employees.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      });
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadPTORequests = async () => {
    try {
      const user = await blink.auth.me();
      const data = await blink.db.ptoRequests.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      });
      setPtoRequests(data);
    } catch (error) {
      console.error('Error loading PTO requests:', error);
    }
  };

  const loadPayrollEntries = async () => {
    try {
      const user = await blink.auth.me();
      const data = await blink.db.payrollEntries.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      });
      setPayrollEntries(data);
    } catch (error) {
      console.error('Error loading payroll entries:', error);
    }
  };

  useEffect(() => {
    loadEmployees();
    loadPTORequests();
    loadPayrollEntries();
  }, []);

  const addEmployee = async (employeeData: Omit<Employee, 'id'>) => {
    try {
      const user = await blink.auth.me();
      await blink.db.employees.create({
        ...employeeData,
        userId: user.id,
        createdAt: new Date().toISOString()
      });
      loadEmployees();
      setShowAddEmployee(false);
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const updatePTOStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await blink.db.ptoRequests.update(id, { status });
      loadPTORequests();
    } catch (error) {
      console.error('Error updating PTO status:', error);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'payroll', label: 'Payroll', icon: DollarSign },
    { id: 'pto', label: 'PTO Requests', icon: Calendar },
    { id: 'performance', label: 'Performance', icon: Award }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR Management</h1>
          <p className="text-gray-600 mt-1">Manage employees, payroll, and HR processes</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddEmployee(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
            <Users className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Payroll</p>
              <p className="text-2xl font-bold text-gray-900">
                ${employees.reduce((sum, emp) => sum + emp.salary, 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending PTO</p>
              <p className="text-2xl font-bold text-gray-900">
                {ptoRequests.filter(req => req.status === 'pending').length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-amber-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Employees</p>
              <p className="text-2xl font-bold text-gray-900">
                {employees.filter(emp => emp.status === 'active').length}
              </p>
            </div>
            <Award className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'employees' && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
              />
            </div>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>

          {/* Employees Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-indigo-600">
                                {employee.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                            <div className="text-sm text-gray-500">{employee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${employee.salary.toLocaleString()}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button className="text-indigo-600 hover:text-indigo-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pto' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">PTO Requests</h2>
            <button
              onClick={() => setShowAddPTO(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Request
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ptoRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.employee_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          request.type === 'vacation' ? 'bg-blue-100 text-blue-800' :
                          request.type === 'sick' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.days}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {request.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updatePTOStatus(request.id, 'approved')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updatePTOStatus(request.id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Payroll Management</h2>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Process Payroll
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Pay Period</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Gross Pay</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${employees.reduce((sum, emp) => sum + emp.salary, 0).toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Deductions</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${Math.round(employees.reduce((sum, emp) => sum + emp.salary, 0) * 0.25).toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Net Pay</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${Math.round(employees.reduce((sum, emp) => sum + emp.salary, 0) * 0.75).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Performance Reviews</h2>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Schedule Review
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.slice(0, 6).map((employee) => (
              <div key={employee.id} className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-600">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                      <p className="text-xs text-gray-500">{employee.position}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Overall Performance</span>
                      <span className="font-medium">4.2/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '84%' }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Last Review: 3 months ago</span>
                    <span>Next: Due</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}