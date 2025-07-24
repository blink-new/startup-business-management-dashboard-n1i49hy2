import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, Phone, Video, Send, Smile, Paperclip, Hash, Plus, Search, Settings } from 'lucide-react';
import { blink } from '../../blink/client';

interface Channel {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'direct';
  members: string[];
  created_at: string;
}

interface ChatMessage {
  id: string;
  channel_id: string;
  sender: string;
  sender_name: string;
  message: string;
  message_type: 'text' | 'file' | 'image';
  created_at: string;
  reactions?: { emoji: string; users: string[] }[];
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  title: string;
}

export default function TeamCommunication() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');

  const loadChannels = async () => {
    try {
      const user = await blink.auth.me();
      const data = await blink.db.channels.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      });
      setChannels(data);
      if (data.length > 0 && !selectedChannel) {
        setSelectedChannel(data[0]);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
    }
  };

  const loadMessages = async (channelId: string) => {
    try {
      const user = await blink.auth.me();
      const data = await blink.db.chatMessages.list({
        where: { channelId, userId: user.id },
        orderBy: { createdAt: 'asc' }
      });
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const user = await blink.auth.me();
      const data = await blink.db.teamMembers.list({
        where: { userId: user.id },
        orderBy: { name: 'asc' }
      });
      setTeamMembers(data);
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  useEffect(() => {
    loadChannels();
    loadTeamMembers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      loadMessages(selectedChannel.id);
    }
  }, [selectedChannel]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel) return;

    try {
      const user = await blink.auth.me();
      await blink.db.chatMessages.create({
        channelId: selectedChannel.id,
        sender: user.id,
        senderName: user.email.split('@')[0],
        message: newMessage,
        messageType: 'text',
        userId: user.id,
        createdAt: new Date().toISOString()
      });
      
      setNewMessage('');
      loadMessages(selectedChannel.id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const createChannel = async () => {
    if (!newChannelName.trim()) return;

    try {
      const user = await blink.auth.me();
      const newChannel = await blink.db.channels.create({
        name: newChannelName,
        description: `Channel created by ${user.email}`,
        type: 'public',
        members: [user.id],
        userId: user.id,
        createdAt: new Date().toISOString()
      });
      
      setNewChannelName('');
      setShowChannelModal(false);
      loadChannels();
      setSelectedChannel(newChannel);
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Team Chat</h1>
          <p className="text-sm text-gray-600">Stay connected with your team</p>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Channels</h2>
              <button
                onClick={() => setShowChannelModal(true)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {channels.filter(c => c.type === 'public').map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
                    selectedChannel?.id === channel.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Hash className="w-4 h-4" />
                  <span className="text-sm">{channel.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Direct Messages */}
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Direct Messages</h2>
            <div className="space-y-1">
              {teamMembers.slice(0, 5).map((member) => (
                <button
                  key={member.id}
                  className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 text-gray-700 hover:bg-gray-100"
                >
                  <div className="relative">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-indigo-600">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                  </div>
                  <span className="text-sm">{member.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-indigo-600">You</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">You</p>
              <p className="text-xs text-gray-500">Online</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Hash className="w-5 h-5 text-gray-400" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedChannel.name}</h2>
                    <p className="text-sm text-gray-600">{selectedChannel.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-indigo-600">
                      {message.sender_name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{message.sender_name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{message.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={`Message #${selectedChannel.name}`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Smile className="w-5 h-5" />
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Team Chat</h3>
              <p className="text-gray-600">Select a channel to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Team Members Sidebar */}
      <div className="w-64 bg-white border-l border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
          <p className="text-sm text-gray-600">{teamMembers.length} members</p>
        </div>
        <div className="p-4 space-y-3">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-indigo-600">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                <p className="text-xs text-gray-500">{member.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Channel Modal */}
      {showChannelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Channel</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Channel Name</label>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="e.g. general, random, project-updates"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowChannelModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createChannel}
                  disabled={!newChannelName.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Create Channel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}