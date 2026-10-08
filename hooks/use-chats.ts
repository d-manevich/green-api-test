"use client";

import { useReducer, useState } from "react";
import { useNotificationPolling } from "@/hooks/use-notification-polling";
import { type Chat, type Credentials, chatsReducer } from "@/lib/chats";
import { checkAccount, describeError, sendMessage } from "@/lib/green-api";

/** Chats live in memory only: they are gone after a reload or Log out */
export function useChats(credentials: Credentials, onAuthError: () => void) {
  const [chats, dispatch] = useReducer(chatsReducer, []);
  const [receiveError, setReceiveError] = useState<string | null>(null);

  useNotificationPolling(credentials, {
    onIncomingText: ({ chatId, idMessage, text, timestamp }) =>
      dispatch({
        type: "messageReceived",
        chatId,
        message: { id: idMessage, direction: "incoming", text, timestamp },
      }),
    onAuthError,
    onQueueError: setReceiveError,
  });

  /** Opens the existing Chat for this phone, otherwise resolves its Chat ID */
  async function createChat(phone: string): Promise<Chat> {
    const existing = chats.find((chat) => chat.phone === phone);
    if (existing) return existing;

    let account: { exist: boolean; chatId: string };
    try {
      account = await checkAccount(credentials, phone);
    } catch (error) {
      throw new Error(describeError(error));
    }
    if (!account.exist || !account.chatId) {
      throw new Error(
        "Not found on Telegram or the number is hidden by privacy settings",
      );
    }

    const chat =
      chats.find((c) => c.chatId === account.chatId) ??
      ({
        chatId: account.chatId,
        phone,
        createdAt: Date.now(),
        messages: [],
      } satisfies Chat);
    dispatch({ type: "chatCreated", chat });
    return chat;
  }

  async function send(chatId: string, text: string): Promise<void> {
    const id = crypto.randomUUID();
    dispatch({
      type: "messageQueued",
      chatId,
      message: {
        id,
        direction: "outgoing",
        text,
        timestamp: Date.now(),
        status: "sending",
      },
    });
    try {
      await sendMessage(credentials, chatId, text);
      dispatch({ type: "messageSent", chatId, id });
    } catch {
      dispatch({ type: "messageFailed", chatId, id });
    }
  }

  return { chats, receiveError, createChat, sendMessage: send };
}
