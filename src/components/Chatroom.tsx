"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useCurrentUser } from "@/context/UserContext";
import {
  ChatMessage,
  getChatMessages,
  sendChatMessage,
  editChatMessage,
  deleteChatMessage,
  subscribeToChatMessages,
  roommateConfig
} from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  ImageIcon,
  X,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  Check,
  CheckCheck
} from "lucide-react";

export default function Chatroom() {
  const { oderId, userName, userImage } = useCurrentUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadMessages() {
      const data = await getChatMessages();
      setMessages(data);
      setIsLoading(false);
    }
    loadMessages();

    // Subscribe to message changes
    const unsubscribe = subscribeToChatMessages((payload) => {
      if (payload.eventType === "INSERT") {
        setMessages((prev) => [...prev, payload.message]);
      } else if (payload.eventType === "UPDATE") {
        setMessages((prev) =>
          prev.map((m) => (m.id === payload.message.id ? payload.message : m))
        );
      } else if (payload.eventType === "DELETE") {
        setMessages((prev) => prev.filter((m) => m.id !== payload.message.id));
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (editingMessageId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingMessageId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = () => setActiveMenuId(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !imagePreview) || !oderId || !userName) return;

    setIsSending(true);
    await sendChatMessage(oderId, userName, newMessage.trim(), imagePreview || undefined);
    setNewMessage("");
    setImagePreview(null);
    setIsSending(false);
  };

  const handleEdit = async (messageId: string) => {
    if (!editText.trim()) return;
    await editChatMessage(messageId, editText.trim());
    setEditingMessageId(null);
    setEditText("");
  };

  const handleDelete = async (messageId: string) => {
    await deleteChatMessage(messageId);
    setActiveMenuId(null);
  };

  const handleCopy = async (text: string, messageId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(messageId);
    setActiveMenuId(null);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startEditing = (message: ChatMessage) => {
    setEditingMessageId(message.id);
    setEditText(message.message);
    setActiveMenuId(null);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return "Today";
    } else if (d.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = "";

    messages.forEach((message) => {
      const messageDate = formatDate(message.createdAt);
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        groups.push({ date: messageDate, messages: [message] });
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });

    return groups;
  };

  if (isLoading) {
    return (
      <div className="chat-container bg-[#0b141a] h-[calc(100vh-200px)] min-h-[500px] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-center h-full">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="chat-container bg-[#0b141a] h-[calc(100vh-200px)] min-h-[500px] rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-zinc-800/50">
      {/* Chat Header */}
      <div className="bg-[#1f2c34] px-4 py-3 flex items-center gap-3 border-b border-zinc-800/50">
        <div className="flex -space-x-2">
          {Object.entries(roommateConfig).slice(0, 4).map(([name, config]) => (
            <div
              key={name}
              className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#1f2c34]"
            >
              <Image
                src={config.image}
                alt={name}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <div className="flex-1">
          <h2 className="text-white font-semibold text-sm">Roommates Chat</h2>
          <p className="text-zinc-400 text-xs">Ram, Munna, Suriya, Kaushik</p>
        </div>
      </div>

      {/* Messages Container - WhatsApp style background */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-1"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#0b141a'
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
              <MessageIcon className="w-10 h-10 opacity-50" />
            </div>
            <p className="font-medium">No messages yet</p>
            <p className="text-sm text-zinc-600">Start the conversation!</p>
          </div>
        ) : (
          messageGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-1">
              {/* Date divider - WhatsApp style */}
              <div className="flex justify-center my-4">
                <span className="bg-[#1d2b33] text-zinc-400 text-xs px-3 py-1.5 rounded-lg shadow-sm">
                  {group.date}
                </span>
              </div>

              {/* Messages */}
              {group.messages.map((message, msgIndex) => {
                const isOwn = message.userId === oderId;
                const config = roommateConfig[message.userName];
                const isEditing = editingMessageId === message.id;
                const showTail = msgIndex === 0 ||
                  group.messages[msgIndex - 1]?.userId !== message.userId;

                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}
                  >
                    <div className={`flex gap-2 max-w-[85%] md:max-w-[70%] ${isOwn ? "flex-row-reverse" : ""}`}>
                      {/* Avatar - only show for first message in sequence from same user */}
                      {!isOwn && showTail && (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 self-end mb-1">
                          <Image
                            src={config?.image || "/images/default.png"}
                            alt={message.userName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      {!isOwn && !showTail && <div className="w-8 flex-shrink-0" />}

                      {/* Message bubble */}
                      <div className="relative">
                        <div
                          className={`relative px-3 py-2 shadow-sm ${
                            isOwn
                              ? "chat-bubble-sent text-white"
                              : "chat-bubble-received text-white"
                          } ${showTail ? "" : isOwn ? "rounded-tr-lg" : "rounded-tl-lg"}`}
                        >
                          {/* Sender name for others */}
                          {!isOwn && showTail && (
                            <p className={`text-xs font-semibold mb-1 ${
                              config?.color?.replace('bg-', 'text-') || 'text-cyan-400'
                            }`}>
                              {message.userName}
                            </p>
                          )}

                          {/* Image */}
                          {message.imageUrl && (
                            <div className="mb-2 -mx-1">
                              <img
                                src={message.imageUrl}
                                alt="Shared image"
                                className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(message.imageUrl, "_blank")}
                              />
                            </div>
                          )}

                          {/* Message text or edit input */}
                          {isEditing ? (
                            <div className="flex gap-2 items-center min-w-[200px]">
                              <Input
                                ref={editInputRef}
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="flex-1 h-8 text-sm bg-white/10 border-white/20 text-white"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleEdit(message.id);
                                  if (e.key === "Escape") {
                                    setEditingMessageId(null);
                                    setEditText("");
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                onClick={() => handleEdit(message.id)}
                                className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingMessageId(null);
                                  setEditText("");
                                }}
                                className="h-8 w-8 p-0 text-white hover:bg-white/10"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            message.message && (
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {message.message}
                              </p>
                            )
                          )}

                          {/* Time and status */}
                          <div className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : ""}`}>
                            <span className="text-[10px] text-white/60">
                              {formatTime(message.createdAt)}
                            </span>
                            {isOwn && (
                              <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
                            )}
                          </div>
                        </div>

                        {/* Message menu button */}
                        {isOwn && !isEditing && (
                          <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === message.id ? null : message.id);
                              }}
                              className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown menu */}
                            {activeMenuId === message.id && (
                              <div
                                className="absolute right-0 top-full mt-1 bg-[#233138] rounded-lg shadow-xl border border-zinc-700/50 py-1 min-w-[140px] z-50"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {message.message && (
                                  <>
                                    <button
                                      onClick={() => startEditing(message)}
                                      className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/10 flex items-center gap-3 transition-colors"
                                    >
                                      <Pencil className="w-4 h-4 text-zinc-400" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleCopy(message.message, message.id)}
                                      className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/10 flex items-center gap-3 transition-colors"
                                    >
                                      {copiedId === message.id ? (
                                        <>
                                          <Check className="w-4 h-4 text-green-400" />
                                          Copied!
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-4 h-4 text-zinc-400" />
                                          Copy
                                        </>
                                      )}
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleDelete(message.id)}
                                  className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-white/10 flex items-center gap-3 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Copy button for received messages */}
                        {!isOwn && message.message && !isEditing && (
                          <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleCopy(message.message, message.id)}
                              className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                            >
                              {copiedId === message.id ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="px-4 py-3 bg-[#1f2c34] border-t border-zinc-800/50">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-24 rounded-lg shadow-lg"
            />
            <button
              onClick={() => setImagePreview(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input Area - WhatsApp style */}
      <div className="p-3 bg-[#1f2c34] border-t border-zinc-800/50">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-full bg-transparent hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message"
              className="w-full bg-[#2a3942] border-0 text-white placeholder:text-zinc-500 focus:ring-0 focus:border-0 rounded-full px-4 py-2.5 text-sm"
            />
          </div>
          <Button
            type="submit"
            disabled={isSending || (!newMessage.trim() && !imagePreview)}
            className="w-11 h-11 rounded-full bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500 p-0 flex items-center justify-center transition-colors"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}
