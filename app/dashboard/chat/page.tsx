'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Send, Search, MoreVertical, Loader, AlertCircle } from 'lucide-react';
import { chatApi, Chat, Message } from '@/services/chatApi';

const normalizeMessage = (m: any, chatId: string): Message => {
  const createdAt = m.createdAt
    ? new Date(m.createdAt).toISOString()
    : m.ts
    ? new Date(m.ts).toISOString()
    : new Date().toISOString();

  return {
    id: String(m.id),
    chat: chatId,
    sender: m.sender || null,
    recipient: m.recipient || null,
    content: m.content || m.text || '',
    isRead: typeof m.isRead === 'boolean' ? m.isRead : !!m.read,
    createdAt,
  };
};

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId] = useState<string>(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem('userId') || sessionStorage.getItem('userId') || ''
      : ''
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = async (chatId: string) => {
    try {
      setMessagesLoading(true);
      const response = (await chatApi.getMessages(chatId)) as { data?: any[] };
      const raw = response?.data ?? [];
      const list = raw.map((m) => normalizeMessage(m, chatId));
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setMessages(list);
    } catch (err) {
      // Error loading messages - silently continue
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    // Initial load: fetch chats, then auto-select the first one
    chatApi.getChats().then((res: any) => {
      const list: Chat[] = res?.data ?? [];
      setChats(list);
      if (list.length > 0) setSelectedChatId(list[0].id);
    }).catch((err: any) => {
      setError('Failed to load chats');
    }).finally(() => setLoading(false));

    // Poll chat list every 10 s (updates last-message previews)
    const chatInterval = setInterval(() => {
      chatApi.getChats().then((res: any) => {
        setChats(res?.data ?? []);
      }).catch(() => {});
    }, 10_000);

    return () => clearInterval(chatInterval);
  }, []);

  useEffect(() => {
    if (!selectedChatId) return;
    loadMessages(selectedChatId);
    // Mark all messages in this chat as read for the current user
    chatApi.markChatAsRead(selectedChatId).catch(() => {});

    // Poll messages every 3 s so incoming messages appear without sockets
    const msgInterval = setInterval(() => {
      chatApi.getMessages(selectedChatId).then((res: any) => {
        const raw: any[] = res?.data ?? [];
        const list = raw.map((m) => normalizeMessage(m, selectedChatId));
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setMessages(list);
      }).catch(() => {});
    }, 3_000);

    return () => clearInterval(msgInterval);
  }, [selectedChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChatId) return;

    const activeChat = chats.find((c) => c.id === selectedChatId);
    const recipient = activeChat?.participants?.find((p: any) => String(p.id) !== String(currentUserId));

    try {
      setSending(true);
      await chatApi.sendMessage({
        chat: selectedChatId,
        recipientId: String(recipient?.id || ''),
        content: messageInput,
      });
      setMessageInput('');
      await loadMessages(selectedChatId);
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const activeChat = chats.find((c) => c.id === selectedChatId);

  const filteredChats = chats.filter((chat) =>
    chat.participants?.some(
      (p: any) =>
        p.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="h-full flex gap-6">
      <div className="w-80 bg-white border border-gray-200 rounded-lg flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader className="w-5 h-5 animate-spin text-blue-500" />
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No conversations yet</p>
            </div>
          ) : (
            filteredChats.map((chat) => {
              const lastMsg = chat.messages?.[chat.messages.length - 1];
              const otherParticipant =
                chat.participants?.find((p: any) => String(p.id) !== String(currentUserId)) || chat.participants?.[0];
              const label = otherParticipant?.displayName || otherParticipant?.username || 'Unknown';

              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition ${
                    selectedChatId === chat.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {label[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{label}</p>
                      <p className="text-sm text-gray-600 truncate mt-1">{lastMsg?.content || 'No messages yet'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {lastMsg?.createdAt ? new Date(lastMsg.createdAt).toLocaleTimeString() : ''}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-lg flex flex-col">
        {error && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {activeChat ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const other =
                    activeChat.participants?.find((p: any) => String(p.id) !== String(currentUserId)) ||
                    activeChat.participants?.[0];
                  const label = other?.displayName || other?.username || 'Unknown';
                  return (
                    <>
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {label[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{label}</p>
                        <p className="text-xs text-gray-600">Online</p>
                      </div>
                    </>
                  );
                })()}
              </div>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messagesLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader className="w-5 h-5 animate-spin text-blue-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSent = currentUserId && String(msg.sender?.id) === String(currentUserId);
                  return (
                    <div key={msg.id} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          isSent ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isSent ? 'text-blue-100' : 'text-gray-500'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
                <button
                  type="submit"
                  disabled={sending || !messageInput.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
