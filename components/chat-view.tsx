"use client";

import { ArrowLeftIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { ChatAvatar } from "@/components/chat-avatar";
import { MessageBubble } from "@/components/message-bubble";
import { MessageInput } from "@/components/message-input";
import { Button } from "@/components/ui/button";
import { type Chat, formatPhone } from "@/lib/chats";

type ChatViewProps = {
  chat: Chat;
  onBack: () => void;
  onSend: (text: string) => void;
};

export function ChatView({ chat, onBack, onSend }: ChatViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageCount = chat.messages.length;

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on every new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messageCount, chat.chatId]);

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 bg-zinc-900 px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="Back to chats"
          className="md:hidden"
        >
          <ArrowLeftIcon className="size-5" />
        </Button>
        <ChatAvatar size="header" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium">
            {formatPhone(chat.phone)}
          </span>
          <span className="text-xs text-white/60">Telegram</span>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-end gap-1 p-4">
          {messageCount === 0 ? (
            <p className="self-center rounded-full bg-white/10 px-3 py-1 text-sm text-white/60">
              No messages yet
            </p>
          ) : (
            <>
              <p className="mb-2 self-center rounded-full bg-white/10 px-2 text-xs">
                Today
              </p>
              {chat.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl shrink-0 p-4 pt-2">
        <MessageInput key={chat.chatId} onSend={onSend} />
      </div>
    </div>
  );
}
