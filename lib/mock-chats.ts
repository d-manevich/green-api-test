"use client";

// Temporary in-memory stand-in for GREEN-API, used to click through the UI.
// Replace with the real API client and reducer.

import { useCallback, useState } from "react";
import type { Chat, Message } from "@/lib/chats";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const minutesAgo = (minutes: number) => Date.now() - minutes * 60_000;

const initialChats: Chat[] = [
  {
    chatId: "10000001",
    phone: "79991234567",
    messages: [
      {
        id: "m1",
        direction: "outgoing",
        text: "Hi! Are we still on for tomorrow?",
        timestamp: minutesAgo(42),
        status: "sent",
      },
      {
        id: "m2",
        direction: "incoming",
        text: "Yes, 10 am at the office 👍",
        timestamp: minutesAgo(40),
      },
    ],
  },
  {
    chatId: "10000002",
    phone: "77011234567",
    messages: [
      {
        id: "m3",
        direction: "incoming",
        text: "Sent you the docs, take a look when you have a minute. There are a few open questions at the end of the file.",
        timestamp: minutesAgo(180),
      },
    ],
  },
];

export function useMockChats() {
  const [chats, setChats] = useState<Chat[]>(initialChats);

  const updateMessage = useCallback(
    (chatId: string, messageId: string, patch: Partial<Message>) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.chatId === chatId
            ? {
                ...chat,
                messages: chat.messages.map((m) =>
                  m.id === messageId ? { ...m, ...patch } : m,
                ),
              }
            : chat,
        ),
      );
    },
    [],
  );

  const appendMessage = useCallback((chatId: string, message: Message) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.chatId === chatId
          ? { ...chat, messages: [...chat.messages, message] }
          : chat,
      ),
    );
  }, []);

  /** Numbers ending in "0000" are "not on Telegram" */
  const createChat = useCallback(
    async (phone: string): Promise<Chat> => {
      const existing = chats.find((chat) => chat.phone === phone);
      if (existing) return existing;
      await delay(600);
      if (phone.endsWith("0000")) {
        throw new Error(
          "Not found on Telegram or the number is hidden by privacy settings",
        );
      }
      const chat: Chat = { chatId: String(Date.now()), phone, messages: [] };
      setChats((prev) => [chat, ...prev]);
      return chat;
    },
    [chats],
  );

  /** Text containing "fail" fails to send; otherwise the Recipient echoes it back */
  const sendMessage = useCallback(
    async (chatId: string, text: string) => {
      const id = crypto.randomUUID();
      appendMessage(chatId, {
        id,
        direction: "outgoing",
        text,
        timestamp: Date.now(),
        status: "sending",
      });
      await delay(700);
      if (text.toLowerCase().includes("fail")) {
        updateMessage(chatId, id, { status: "failed" });
        return;
      }
      updateMessage(chatId, id, { status: "sent" });
      await delay(1500);
      appendMessage(chatId, {
        id: crypto.randomUUID(),
        direction: "incoming",
        text: `Echo: ${text}`,
        timestamp: Date.now(),
      });
    },
    [appendMessage, updateMessage],
  );

  return { chats, createChat, sendMessage };
}
