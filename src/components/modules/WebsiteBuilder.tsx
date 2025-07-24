import React, { useState, useEffect } from 'react';
import { Globe, Layout, Palette, Type, Image, Code, Eye, Save, Plus, Trash2, Move, Settings } from 'lucide-react';
import { blink } from '../../blink/client';

interface WebsiteProject {
  id: string;
  name: string;
  description: string;
  domain: string;
  template: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  pages: WebsitePage[];
}

interface WebsitePage {
  id: string;
  name: string;
  slug: string;
  title: string;
  content: PageElement[];
  is_homepage: boolean;
}

interface PageElement {
  id: string;
  type: 'header' | 'text' | 'image' | 'button' | 'form' | 'gallery' | 'video';
  content: any;
  styles: any;
  position: { x: number; y: number };
}

export default function WebsiteBuilder() {
  const [projects, setProjects] = useState<WebsiteProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<WebsiteProject | null>(null);
  const [selectedPage, setSelectedPage] = useState<WebsitePage | null>(null);
  const [activeTab, setActiveTab] = useState('design');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedElement, setSelectedElement] = useState<PageElement | null>(null);

  const loadProjects = async () => {
    try {
      const user = await blink.auth.me();
      const data = await blink.db.websiteProjects.list({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' }
      });
      setProjects(data);
    } catch (error) {
      console.error('Error loading website projects:', error);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const createProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      const user = await blink.auth.me();
      const newProject = await blink.db.websiteProjects.create({
        name: newProjectName,
        description: `Website created by ${user.email}`,
        domain: `${newProjectName.toLowerCase().replace(/\s+/g, '-')}.mysite.com`,
        template: 'blank',
        status: 'draft',
        pages: [{
          id: 'home',
          name: 'Home',
          slug: '/',
          title: 'Welcome to My Website',
          content: [],
          isHomepage: true
        }],
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      setNewProjectName('');
      setShowNewProjectModal(false);
      loadProjects();
      setSelectedProject(newProject);
      setSelectedPage(newProject.pages[0]);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const getDefaultContent = (type: PageElement['type']) => {
    switch (type) {
      case 'header': return { text: 'Your Heading Here', level: 1 };
      case 'text': return { text: 'Your text content goes here. Click to edit.' };
      case 'image': return { src: 'https://via.placeholder.com/400x300', alt: 'Placeholder image' };
      case 'button': return { text: 'Click Me', link: '#' };
      case 'form': return { fields: [{ type: 'email', label: 'Email', required: true }] };
      case 'gallery': return { images: [] };
      case 'video': return { src: '', poster: '' };
      default: return {};
    }
  };

  const getDefaultStyles = (type: PageElement['type']) => {
    return {
      width: type === 'button' ? 'auto' : '100%',
      padding: '16px',
      margin: '8px 0',
      backgroundColor: type === 'button' ? '#6366f1' : 'transparent',
      color: type === 'button' ? '#ffffff' : '#000000',
      fontSize: type === 'header' ? '32px' : '16px',
      fontWeight: type === 'header' ? 'bold' : 'normal',
      textAlign: 'left',
      borderRadius: type === 'button' ? '8px' : '0px'
    };
  };

  const addElement = (type: PageElement['type']) => {
    if (!selectedPage) return;

    const newElement: PageElement = {
      id: `element-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
      position: { x: 50, y: 50 }
    };

    const updatedPage = {
      ...selectedPage,
      content: [...selectedPage.content, newElement]
    };

    setSelectedPage(updatedPage);
    setSelectedElement(newElement);
  };

  const updateElementContent = (elementId: string, newContent: any) => {
    if (!selectedPage) return;

    const updatedContent = selectedPage.content.map(element =>
      element.id === elementId ? { ...element, content: newContent } : element
    );

    setSelectedPage({ ...selectedPage, content: updatedContent });
  };

  const deleteElement = (elementId: string) => {
    if (!selectedPage) return;

    const updatedContent = selectedPage.content.filter(element => element.id !== elementId);
    setSelectedPage({ ...selectedPage, content: updatedContent });
    setSelectedElement(null);
  };

  const templates = [
    { id: 'blank', name: 'Blank', description: 'Start from scratch' },
    { id: 'business', name: 'Business', description: 'Professional business site' },
    { id: 'portfolio', name: 'Portfolio', description: 'Showcase your work' },
    { id: 'blog', name: 'Blog', description: 'Share your thoughts' },
    { id: 'ecommerce', name: 'E-commerce', description: 'Sell products online' }
  ];

  const elementTypes = [
    { type: 'header', icon: Type, label: 'Heading' },
    { type: 'text', icon: Type, label: 'Text' },
    { type: 'image', icon: Image, label: 'Image' },
    { type: 'button', icon: Layout, label: 'Button' },
    { type: 'form', icon: Layout, label: 'Form' },
    { type: 'gallery', icon: Image, label: 'Gallery' },
    { type: 'video', icon: Layout, label: 'Video' }
  ];

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Website Builder</h1>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">Create beautiful websites with drag & drop</p>
        </div>

        {/* Projects List */}
        {!selectedProject && (
          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Your Websites</h2>
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => {
                    setSelectedProject(project);
                    setSelectedPage(project.pages.find(p => p.is_homepage) || project.pages[0]);
                  }}
                  className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      <p className="text-xs text-gray-500 mt-2">{project.domain}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      project.status === 'published' ? 'bg-green-100 text-green-800' :
                      project.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                    <span>{project.pages.length} pages</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Design Tools */}
        {selectedProject && (
          <div className="flex-1 overflow-y-auto">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                {[
                  { id: 'design', label: 'Design', icon: Layout },
                  { id: 'pages', label: 'Pages', icon: Globe },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 ${
                        activeTab === tab.id
                          ? 'border-b-2 border-indigo-500 text-indigo-600'
                          : 'text-gray-500 hover:text-gray-700'
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
            <div className="p-4">
              {activeTab === 'design' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Add Elements</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {elementTypes.map((element) => {
                        const Icon = element.icon;
                        return (
                          <button
                            key={element.type}
                            onClick={() => addElement(element.type)}
                            className="p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 flex flex-col items-center gap-2 text-sm"
                          >
                            <Icon className="w-5 h-5 text-gray-600" />
                            {element.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedElement && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Element Properties</h3>
                      <div className="space-y-3">
                        {selectedElement.type === 'header' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Text</label>
                            <input
                              type="text"
                              value={selectedElement.content.text}
                              onChange={(e) => updateElementContent(selectedElement.id, { ...selectedElement.content, text: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        )}
                        {selectedElement.type === 'text' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Content</label>
                            <textarea
                              value={selectedElement.content.text}
                              onChange={(e) => updateElementContent(selectedElement.id, { ...selectedElement.content, text: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              rows={3}
                            />
                          </div>
                        )}
                        {selectedElement.type === 'button' && (
                          <>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Button Text</label>
                              <input
                                type="text"
                                value={selectedElement.content.text}
                                onChange={(e) => updateElementContent(selectedElement.id, { ...selectedElement.content, text: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Link URL</label>
                              <input
                                type="text"
                                value={selectedElement.content.link}
                                onChange={(e) => updateElementContent(selectedElement.id, { ...selectedElement.content, link: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                          </>
                        )}
                        <button
                          onClick={() => deleteElement(selectedElement.id)}
                          className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center justify-center gap-2 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Element
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'pages' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Pages</h3>
                    <button className="text-indigo-600 hover:text-indigo-700 text-sm">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selectedProject.pages.map((page) => (
                      <button
                        key={page.id}
                        onClick={() => setSelectedPage(page)}
                        className={`w-full text-left p-3 rounded-lg border ${
                          selectedPage?.id === page.id
                            ? 'border-indigo-300 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{page.name}</span>
                          {page.is_homepage && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Home
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{page.slug}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                    <input
                      type="text"
                      value={selectedProject.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
                    <input
                      type="text"
                      value={selectedProject.domain}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2">
                      <Globe className="w-4 h-4" />
                      Publish Website
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {selectedProject ? (
          <>
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    ← Back to Projects
                  </button>
                  <div className="h-6 w-px bg-gray-300"></div>
                  <h2 className="font-semibold text-gray-900">{selectedProject.name}</h2>
                  {selectedPage && (
                    <>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-600">{selectedPage.name}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 bg-gray-100 p-8 overflow-auto">
              <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm min-h-96 relative">
                {selectedPage && (
                  <div className="p-8">
                    {selectedPage.content.length === 0 ? (
                      <div className="text-center py-16">
                        <Layout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building</h3>
                        <p className="text-gray-600">Add elements from the sidebar to start designing your page</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedPage.content.map((element) => (
                          <div
                            key={element.id}
                            onClick={() => setSelectedElement(element)}
                            className={`cursor-pointer border-2 border-transparent hover:border-indigo-300 rounded-lg p-2 ${
                              selectedElement?.id === element.id ? 'border-indigo-500' : ''
                            }`}
                          >
                            {element.type === 'header' && (
                              <h1 style={element.styles} className="font-bold">
                                {element.content.text}
                              </h1>
                            )}
                            {element.type === 'text' && (
                              <p style={element.styles}>
                                {element.content.text}
                              </p>
                            )}
                            {element.type === 'button' && (
                              <button style={element.styles} className="px-6 py-2 rounded-lg">
                                {element.content.text}
                              </button>
                            )}
                            {element.type === 'image' && (
                              <img
                                src={element.content.src}
                                alt={element.content.alt}
                                style={element.styles}
                                className="max-w-full h-auto rounded-lg"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Website Builder</h2>
              <p className="text-gray-600 mb-6">Create beautiful websites with our drag-and-drop builder</p>
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Create New Website
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Website</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="My Awesome Website"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Choose Template</label>
                <div className="grid grid-cols-1 gap-2">
                  {templates.slice(0, 3).map((template) => (
                    <button
                      key={template.id}
                      className="text-left p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50"
                    >
                      <div className="font-medium text-gray-900">{template.name}</div>
                      <div className="text-sm text-gray-600">{template.description}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createProject}
                  disabled={!newProjectName.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Create Website
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}