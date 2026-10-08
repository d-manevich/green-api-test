"use client";

import { useState } from "react";
import { ChatList } from "@/components/chat-list";
import { ChatView } from "@/components/chat-view";
import { InstanceSettingsAlert } from "@/components/instance-settings-alert";
import { NewChatDialog } from "@/components/new-chat-dialog";
import { useChats } from "@/hooks/use-chats";
import { useInstanceSettings } from "@/hooks/use-instance-settings";
import type { Credentials } from "@/lib/chats";
import { cn } from "@/lib/utils";

type ChatScreenProps = {
  credentials: Credentials;
  onLogout: () => void;
  /** Credentials stopped working while signed in */
  onSessionExpired: () => void;
};

export function ChatScreen({
  credentials,
  onLogout,
  onSessionExpired,
}: ChatScreenProps) {
  const { chats, receiveError, createChat, sendMessage } = useChats(
    credentials,
    onSessionExpired,
  );
  const settings = useInstanceSettings(credentials);
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
          alerts={
            <>
              <InstanceSettingsAlert
                state={settings.state}
                onFix={settings.fix}
                onDismiss={settings.dismiss}
              />
              {receiveError && (
                <p
                  role="alert"
                  className="mx-4 mb-2 rounded-xl bg-red-400/10 px-3 py-2 text-sm text-red-400"
                >
                  {receiveError}
                </p>
              )}
            </>
          }
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
