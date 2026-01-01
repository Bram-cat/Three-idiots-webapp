"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useCurrentUser } from "@/context/UserContext";
import {
  ChatMessage,
  getChatMessages,
  sendChatMessage,
  subscribeToChatMessages,
  roommateConfig
} from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ImageIcon, X } from "lucide-react";

export default function Chatroom() {
  const { oderId, userName, userImage } = useCurrentUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadMessages() {
      const data = await getChatMessages();
      setMessages(data);
      setIsLoading(false);
    }
    loadMessages();

    // Subscribe to new messages
    const unsubscribe = subscribeToChatMessages((message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
      <Card className="bg-zinc-900/50 border-zinc-800 h-[70vh]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 h-[70vh] flex flex-col">
      {/* Messages Container */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <MessageIcon className="w-16 h-16 mb-4 opacity-50" />
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messageGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-3">
              {/* Date divider */}
              <div className="flex items-center gap-4 my-4">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-xs text-zinc-500 font-medium">{group.date}</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>

              {/* Messages */}
              {group.messages.map((message) => {
                const isOwn = message.userId === oderId;
                const config = roommateConfig[message.userName];

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-zinc-800">
                      <Image
                        src={config?.image || "/images/default.png"}
                        alt={message.userName}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Message bubble */}
                    <div
                      className={`max-w-[70%] ${
                        isOwn
                          ? "bg-cyan-500/20 border-cyan-500/30"
                          : "bg-zinc-800/50 border-zinc-700/50"
                      } border rounded-2xl px-4 py-2`}
                    >
                      {!isOwn && (
                        <p className="text-xs font-medium text-cyan-400 mb-1">
                          {message.userName}
                        </p>
                      )}

                      {message.imageUrl && (
                        <div className="mb-2">
                          <img
                            src={message.imageUrl}
                            alt="Shared image"
                            className="max-w-full rounded-lg cursor-pointer hover:opacity-90"
                            onClick={() => window.open(message.imageUrl, "_blank")}
                          />
                        </div>
                      )}

                      {message.message && (
                        <p className="text-white text-sm">{message.message}</p>
                      )}

                      <p className="text-xs text-zinc-500 mt-1 text-right">
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Image Preview */}
      {imagePreview && (
        <div className="px-4 py-2 border-t border-zinc-800">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-20 rounded-lg"
            />
            <button
              onClick={() => setImagePreview(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-zinc-800">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
          >
            <ImageIcon className="w-5 h-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-cyan-500 focus:ring-cyan-500"
          />
          <Button
            type="submit"
            disabled={isSending || (!newMessage.trim() && !imagePreview)}
            className="bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </Card>
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
