"use client";

import Chatroom from "@/components/Chatroom";
import { AnimateOnScroll } from "@/hooks/useScrollAnimation";

export default function ChatPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <AnimateOnScroll animation="fadeInUp">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Chat</h1>
      </AnimateOnScroll>

      <AnimateOnScroll animation="scaleIn" delay={100}>
        <Chatroom />
      </AnimateOnScroll>
    </div>
  );
}
