import React, { useState, useEffect } from 'react';
import { MessageCircle, Clock, CheckCircle, AlertTriangle, User, Search, Filter, Plus, Star, Tag, Send } from 'lucide-react';
import { blink } from '../../blink/client';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  customer_name: string;
  customer_email: string;
  assigned_to: string;
  category: string;
  created_at: string;
  updated_at: string;
  satisfaction_rating?: number;
}

interface Message {
  id: string;
  ticket_id: string;
  sender: string;
  sender_type: 'customer' | 'agent';
  message: string;
  created_at: string;
}

export default function CustomerSupport() {
  const [activeTab, setActiveTab] = useState('tickets');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newMessage, setNewMessage] = useState('');

  const loadTickets = async () => {
    try {
      const user = await blink.auth.me();
      const data = await blink.db.tickets.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      });
      setTickets(data);
    } catch (error) {
      console.error('Error loading tickets:', error);
    }
  };

  const loadMessages = async (ticketId: string) => {
    try {
      const user = await blink.auth.me();
      const data = await blink.db.messages.list({
        where: { ticketId, userId: user.id },
        orderBy: { createdAt: 'asc' }
      });
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

  const updateTicketStatus = async (ticketId: string, status: Ticket['status']) => {
    try {
      await blink.db.tickets.update(ticketId, { 
        status,
        updatedAt: new Date().toISOString()
      });
      loadTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status });
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    try {
      const user = await blink.auth.me();
      await blink.db.messages.create({
        ticketId: selectedTicket.id,
        sender: user.email,
        senderType: 'agent',
        message: newMessage,
        userId: user.id,
        createdAt: new Date().toISOString()
      });
      
      setNewMessage('');
      loadMessages(selectedTicket.id);
      
      // Update ticket status to in-progress if it was open
      if (selectedTicket.status === 'open') {
        updateTicketStatus(selectedTicket.id, 'in-progress');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tabs = [
    { id: 'tickets', label: 'All Tickets', icon: MessageCircle },
    { id: 'analytics', label: 'Analytics', icon: Star },
    { id: 'knowledge', label: 'Knowledge Base', icon: Tag }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Support</h1>
          <p className="text-gray-600 mt-1">Manage customer tickets and support requests</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Tickets</p>
              <p className="text-2xl font-bold text-gray-900">
                {tickets.filter(t => t.status === 'open').length}
              </p>
            </div>
            <MessageCircle className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {tickets.filter(t => t.status === 'in-progress').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {tickets.filter(t => t.status === 'resolved' && 
                  new Date(t.updated_at).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">2.4h</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-purple-600" />
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

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search and Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Tickets */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTicket?.id === ticket.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 text-sm">{ticket.title}</h3>
                    <span className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                      ●
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{ticket.customer_name}</p>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Detail */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <div className="bg-white rounded-xl shadow-sm border h-full flex flex-col">
                {/* Ticket Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedTicket.title}</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        From: {selectedTicket.customer_name} ({selectedTicket.customer_email})
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTicket.status)}`}>
                        {selectedTicket.status.replace('-', ' ')}
                      </span>
                      <span className={`text-sm font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                        {selectedTicket.priority} priority
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, 'in-progress')}
                      className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
                      className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, 'closed')}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                    >
                      Close
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="space-y-4">
                    {/* Initial ticket description */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">{selectedTicket.customer_name}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(selectedTicket.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{selectedTicket.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    {messages.map((message) => (
                      <div key={message.id} className="flex gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.sender_type === 'agent' ? 'bg-indigo-100' : 'bg-gray-100'
                        }`}>
                          <User className={`w-4 h-4 ${
                            message.sender_type === 'agent' ? 'text-indigo-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className={`rounded-lg p-3 ${
                            message.sender_type === 'agent' ? 'bg-indigo-50' : 'bg-gray-50'
                          }`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900">{message.sender}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(message.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{message.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-6 border-t border-gray-200">
                  <div className="flex gap-3">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your response..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                      rows={3}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a ticket</h3>
                  <p className="text-gray-600">Choose a ticket from the list to view details and respond</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolution Rate</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">94.2%</div>
                <p className="text-sm text-gray-600 mt-1">This month</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Satisfaction</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">4.8/5</div>
                <p className="text-sm text-gray-600 mt-1">Average rating</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">First Response Time</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">1.2h</div>
                <p className="text-sm text-gray-600 mt-1">Average time</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Knowledge Base Tab */}
      {activeTab === 'knowledge' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Knowledge Base Articles</h2>
            <div className="space-y-4">
              {[
                'How to reset your password',
                'Billing and subscription management',
                'Getting started guide',
                'Troubleshooting common issues',
                'API documentation'
              ].map((article, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <span className="font-medium text-gray-900">{article}</span>
                  <button className="text-indigo-600 hover:text-indigo-700 text-sm">
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}