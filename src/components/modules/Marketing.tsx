import React, { useState, useEffect } from 'react';
import { Mail, Users, TrendingUp, Eye, Send, Calendar, Target, BarChart3, Plus, Edit, Trash2, Play, Pause } from 'lucide-react';
import { blink } from '../../blink/client';

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'social' | 'ads' | 'content';
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused';
  subject?: string;
  content: string;
  audience: string;
  scheduled_date?: string;
  sent_count: number;
  open_rate: number;
  click_rate: number;
  created_at: string;
}

interface Contact {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  tags: string[];
  status: 'subscribed' | 'unsubscribed' | 'bounced';
  created_at: string;
}

interface Template {
  id: string;
  name: string;
  type: 'email' | 'social' | 'landing';
  thumbnail: string;
  content: string;
  category: string;
}

export default function Marketing() {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const loadCampaigns = async () => {
    try {
      const user = await blink.auth.me();
      const data = await blink.db.campaigns.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      });
      setCampaigns(data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const loadContacts = async () => {
    try {
      const user = await blink.auth.me();
      const data = await blink.db.contacts.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      });
      setContacts(data);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const user = await blink.auth.me();
      const data = await blink.db.templates.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      });
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  useEffect(() => {
    loadCampaigns();
    loadContacts();
    loadTemplates();
  }, []);

  const createCampaign = async (campaignData: Omit<Campaign, 'id' | 'created_at' | 'sent_count' | 'open_rate' | 'click_rate'>) => {
    try {
      const user = await blink.auth.me();
      await blink.db.campaigns.create({
        ...campaignData,
        sentCount: 0,
        openRate: 0,
        clickRate: 0,
        userId: user.id,
        createdAt: new Date().toISOString()
      });
      loadCampaigns();
      setShowNewCampaign(false);
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const updateCampaignStatus = async (campaignId: string, status: Campaign['status']) => {
    try {
      await blink.db.campaigns.update(campaignId, { status });
      loadCampaigns();
    } catch (error) {
      console.error('Error updating campaign status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'social': return Users;
      case 'ads': return Target;
      case 'content': return Edit;
      default: return Mail;
    }
  };

  const tabs = [
    { id: 'campaigns', label: 'Campaigns', icon: Send },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'templates', label: 'Templates', icon: Edit },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Hub</h1>
          <p className="text-gray-600 mt-1">Create and manage marketing campaigns</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowNewCampaign(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.filter(c => c.status === 'active').length}
              </p>
            </div>
            <Send className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Contacts</p>
              <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Open Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.length > 0 
                  ? `${Math.round(campaigns.reduce((sum, c) => sum + c.open_rate, 0) / campaigns.length)}%`
                  : '0%'
                }
              </p>
            </div>
            <Eye className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Click Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.length > 0 
                  ? `${Math.round(campaigns.reduce((sum, c) => sum + c.click_rate, 0) / campaigns.length)}%`
                  : '0%'
                }
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
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

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => {
              const TypeIcon = getTypeIcon(campaign.type);
              return (
                <div key={campaign.id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <TypeIcon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{campaign.type} Campaign</p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Audience:</span>
                      <span className="font-medium">{campaign.audience}</span>
                    </div>
                    
                    {campaign.sent_count > 0 && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Sent:</span>
                          <span className="font-medium">{campaign.sent_count.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Open Rate:</span>
                          <span className="font-medium">{campaign.open_rate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Click Rate:</span>
                          <span className="font-medium">{campaign.click_rate}%</span>
                        </div>
                      </>
                    )}

                    {campaign.scheduled_date && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Scheduled:</span>
                        <span className="font-medium">
                          {new Date(campaign.scheduled_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Created {new Date(campaign.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      {campaign.status === 'draft' && (
                        <button
                          onClick={() => updateCampaignStatus(campaign.id, 'active')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {campaign.status === 'active' && (
                        <button
                          onClick={() => updateCampaignStatus(campaign.id, 'paused')}
                          className="text-yellow-600 hover:text-yellow-700"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      <button className="text-indigo-600 hover:text-indigo-700">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contacts Tab */}
      {activeTab === 'contacts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Contact Management</h2>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Contact
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tags
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Added
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {contact.first_name} {contact.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{contact.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {contact.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          contact.status === 'subscribed' ? 'bg-green-100 text-green-800' :
                          contact.status === 'unsubscribed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {contact.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(contact.created_at).toLocaleDateString()}
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

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Email Templates</h2>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Template
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Welcome Email', category: 'Onboarding', type: 'email' },
              { name: 'Newsletter', category: 'Marketing', type: 'email' },
              { name: 'Product Launch', category: 'Announcement', type: 'email' },
              { name: 'Social Media Post', category: 'Social', type: 'social' },
              { name: 'Landing Page', category: 'Conversion', type: 'landing' },
              { name: 'Thank You Email', category: 'Transactional', type: 'email' }
            ].map((template, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{template.category}</p>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                    {template.type}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                    Use Template
                  </button>
                  <div className="flex items-center gap-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Marketing Analytics</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Performance</h3>
              <div className="space-y-4">
                {campaigns.slice(0, 5).map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{campaign.name}</p>
                      <p className="text-sm text-gray-600">{campaign.sent_count} sent</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{campaign.open_rate}% open</p>
                      <p className="text-sm text-gray-600">{campaign.click_rate}% click</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Audience Growth</h3>
              <div className="text-center py-8">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Analytics charts coming soon</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Campaign Modal */}
      {showNewCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Campaign</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  placeholder="Summer Sale Campaign"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="email">Email Campaign</option>
                  <option value="social">Social Media</option>
                  <option value="ads">Paid Ads</option>
                  <option value="content">Content Marketing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="all">All Contacts</option>
                  <option value="subscribers">Subscribers Only</option>
                  <option value="customers">Customers</option>
                  <option value="prospects">Prospects</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowNewCampaign(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowNewCampaign(false)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}