export type Credentials = {
  idInstance: string;
  apiTokenInstance: string;
};

export type MessageStatus = "sending" | "sent" | "failed";

export type Message = {
  id: string;
  direction: "incoming" | "outgoing";
  text: string;
  /** Unix time in milliseconds */
  timestamp: number;
  status?: MessageStatus;
};

export type Chat = {
  chatId: string;
  phone: string;
  /** Unix time in milliseconds */
  createdAt: number;
  messages: Message[];
};

export const MAX_MESSAGE_LENGTH = 4096;

export function lastMessage(chat: Chat): Message | undefined {
  return chat.messages.at(-1);
}

function lastActivity(chat: Chat): number {
  return lastMessage(chat)?.timestamp ?? chat.createdAt;
}

export function sortByLastMessage(chats: Chat[]): Chat[] {
  return [...chats].sort((a, b) => lastActivity(b) - lastActivity(a));
}

export type ChatsAction =
  | { type: "chatCreated"; chat: Chat }
  | { type: "messageQueued"; chatId: string; message: Message }
  | { type: "messageSent"; chatId: string; id: string }
  | { type: "messageFailed"; chatId: string; id: string }
  | { type: "messageReceived"; chatId: string; message: Message };

function updateChat(
  chats: Chat[],
  chatId: string,
  update: (chat: Chat) => Chat,
): Chat[] {
  return chats.map((chat) => (chat.chatId === chatId ? update(chat) : chat));
}

function setStatus(
  chats: Chat[],
  chatId: string,
  id: string,
  status: MessageStatus,
): Chat[] {
  return updateChat(chats, chatId, (chat) => ({
    ...chat,
    messages: chat.messages.map((m) => (m.id === id ? { ...m, status } : m)),
  }));
}

export function chatsReducer(chats: Chat[], action: ChatsAction): Chat[] {
  switch (action.type) {
    case "chatCreated":
      return chats.some((chat) => chat.chatId === action.chat.chatId)
        ? chats
        : [action.chat, ...chats];
    case "messageQueued":
      return updateChat(chats, action.chatId, (chat) => ({
        ...chat,
        messages: [...chat.messages, action.message],
      }));
    case "messageSent":
      return setStatus(chats, action.chatId, action.id, "sent");
    case "messageFailed":
      return setStatus(chats, action.chatId, action.id, "failed");
    case "messageReceived":
      // Messages from unknown Recipients are ignored; a redelivered Notification is deduplicated by id
      return updateChat(chats, action.chatId, (chat) =>
        chat.messages.some((m) => m.id === action.message.id)
          ? chat
          : { ...chat, messages: [...chat.messages, action.message] },
      );
  }
}

/** Keeps digits only: "+7 (999) 123-45-67" → "79991234567" */
export function normalizePhone(input: string): string {
  return input.replace(/\D/g, "");
}

export function isValidPhone(phone: string): boolean {
  return /^\d{10,15}$/.test(phone);
}

export function formatPhone(phone: string): string {
  return `+${phone}`;
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
