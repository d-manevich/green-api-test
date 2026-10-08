"use client";

import { useState } from "react";
import { ChatList } from "@/components/chat-list";
import { ChatView } from "@/components/chat-view";
import { NewChatDialog } from "@/components/new-chat-dialog";
import { useMockChats } from "@/lib/mock-chats";
import { cn } from "@/lib/utils";

type ChatScreenProps = {
  onLogout: () => void;
};

export function ChatScreen({ onLogout }: ChatScreenProps) {
  const { chats, createChat, sendMessage } = useMockChats();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [newChatOpen, setNewChatOpen] = useState(false);

  const activeChat = chats.find((chat) => chat.chatId === activeChatId) ?? null;

  async function handleCreateChat(phone: string) {
    const chat = await createChat(phone);
    setActiveChatId(chat.chatId);
  }

  return (
    <div className="flex h-full">
      <aside
        className={cn(
          "w-full shrink-0 border-r border-white/10 md:block md:w-96",
          activeChat ? "hidden" : "block",
        )}
      >
        <ChatList
          chats={chats}
          activeChatId={activeChatId}
          onSelect={setActiveChatId}
          onNewChat={() => setNewChatOpen(true)}
          onLogout={onLogout}
        />
      </aside>

      <main
        className={cn(
          "min-w-0 flex-1 bg-food md:block",
          activeChat ? "block" : "hidden",
        )}
      >
        {activeChat ? (
          <ChatView
            chat={activeChat}
            onBack={() => setActiveChatId(null)}
            onSend={(text) => sendMessage(activeChat.chatId, text)}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/60">
              Select a chat to start messaging
            </p>
          </div>
        )}
      </main>

      <NewChatDialog
        open={newChatOpen}
        onOpenChange={setNewChatOpen}
        onSubmit={handleCreateChat}
      />
    </div>
  );
}
