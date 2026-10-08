"use client";

import { ClockIcon, LogOutIcon, PlusIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ChatAvatar } from "@/components/chat-avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  type Chat,
  formatPhone,
  formatTime,
  lastMessage,
  sortByLastMessage,
} from "@/lib/chats";
import { cn } from "@/lib/utils";

type ChatListProps = {
  chats: Chat[];
  /** Shown under the header, e.g. receiving problems */
  alerts?: ReactNode;
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
  onNewChat: () => void;
  onLogout: () => void;
};

export function ChatList({
  chats,
  alerts,
  activeChatId,
  onSelect,
  onNewChat,
  onLogout,
}: ChatListProps) {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
        <h1 className="text-2xl font-semibold">Chats</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            aria-label="Log out"
            className="rounded-full"
          >
            <LogOutIcon className="text-white/60" />
          </Button>
          <Button
            size="icon"
            onClick={onNewChat}
            aria-label="New chat"
            className="size-8 rounded-full"
          >
            <PlusIcon className="size-5" />
          </Button>
        </div>
      </header>

      {alerts}

      {chats.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4 text-center text-sm text-white/60">
          <p>No chats yet</p>
          <Button
            variant="secondary"
            onClick={onNewChat}
            className="rounded-xl"
          >
            Start a new chat
          </Button>
        </div>
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <ul>
            {sortByLastMessage(chats).map((chat) => (
              <li key={chat.chatId}>
                <ChatListItem
                  chat={chat}
                  active={chat.chatId === activeChatId}
                  onClick={() => onSelect(chat.chatId)}
                />
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </div>
  );
}

type ChatListItemProps = {
  chat: Chat;
  active: boolean;
  onClick: () => void;
};

function ChatListItem({ chat, active, onClick }: ChatListItemProps) {
  const last = lastMessage(chat);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-20 w-full items-center gap-3 px-4 text-left transition-colors hover:bg-zinc-800/60",
        active && "bg-zinc-800 hover:bg-zinc-800",
      )}
    >
      <ChatAvatar size="list" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium">
            {formatPhone(chat.phone)}
          </span>
          {last && (
            <span className="flex shrink-0 items-center gap-1 text-xs text-white/60">
              {last.status === "sending" && <ClockIcon className="size-3.5" />}
              {formatTime(last.timestamp)}
            </span>
          )}
        </div>
        <p
          className={cn(
            "line-clamp-2 text-sm text-white/60",
            last?.status === "failed" && "text-red-400",
          )}
        >
          {last ? last.text : "No messages yet"}
        </p>
      </div>
    </button>
  );
}
