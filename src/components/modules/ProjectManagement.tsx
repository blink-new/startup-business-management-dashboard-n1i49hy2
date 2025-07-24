import React, { useState, useEffect } from 'react';
import { FolderOpen, Calendar, Users, CheckCircle, Clock, AlertCircle, Plus, Search, Filter, MoreHorizontal, Star, MessageSquare } from 'lucide-react';
import { blink } from '../../blink/client';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  start_date: string;
  end_date: string;
  progress: number;
  team_members: string[];
  budget: number;
  client: string;
  created_at: string;
}

interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  due_date: string;
  created_at: string;
}

export default function ProjectManagement() {
  const [activeView, setActiveView] = useState('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      const user = await blink.auth.me();
      const data = await blink.db.projects.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      });
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const user = await blink.auth.me();
      const data = await blink.db.tasks.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      });
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  useEffect(() => {
    loadProjects();
    loadTasks();
  }, []);

  const addProject = async (projectData: Omit<Project, 'id' | 'created_at'>) => {
    try {
      const user = await blink.auth.me();
      await blink.db.projects.create({
        ...projectData,
        userId: user.id,
        createdAt: new Date().toISOString()
      });
      loadProjects();
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      await blink.db.tasks.update(taskId, { status });
      loadTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const projectTasks = selectedProject 
    ? tasks.filter(task => task.project_id === selectedProject)
    : tasks;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600 mt-1">Track projects, tasks, and team collaboration</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </button>
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.filter(p => p.status === 'in-progress').length}
              </p>
            </div>
            <FolderOpen className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
              <p className="text-2xl font-bold text-gray-900">
                {tasks.filter(t => new Date(t.due_date) < new Date() && t.status !== 'done').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveView('projects')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'projects'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveView('kanban')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'kanban'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Kanban Board
          </button>
          <button
            onClick={() => setActiveView('calendar')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'calendar'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Calendar
          </button>
        </div>
        
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
          />
        </div>
      </div>

      {/* Projects View */}
      {activeView === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                  <p className="text-xs text-gray-500">Client: {project.client}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                    {project.status.replace('-', ' ')}
                  </span>
                  <span className={`text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority} priority
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(project.end_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{project.team_members.length} members</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-sm font-medium text-gray-900">
                    ${project.budget.toLocaleString()}
                  </div>
                  <button
                    onClick={() => setSelectedProject(project.id)}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Kanban Board View */}
      {activeView === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {['todo', 'in-progress', 'review', 'done'].map((status) => (
            <div key={status} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 capitalize">
                  {status.replace('-', ' ')}
                </h3>
                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                  {projectTasks.filter(task => task.status === status).length}
                </span>
              </div>
              
              <div className="space-y-3">
                {projectTasks
                  .filter(task => task.status === status)
                  .map((task) => (
                    <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                        <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                          ●
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">{task.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-indigo-600">
                              {task.assignee.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar View */}
      {activeView === 'calendar' && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Project Timeline</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                Month
              </button>
              <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md">
                Week
              </button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                Day
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {projects.slice(0, 5).map((project) => (
              <div key={project.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-4 h-4 bg-indigo-600 rounded-full"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{project.name}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                    {project.status.replace('-', ' ')}
                  </span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
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