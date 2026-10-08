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
  messages: Message[];
};

export const MAX_MESSAGE_LENGTH = 4096;

export function lastMessage(chat: Chat): Message | undefined {
  return chat.messages.at(-1);
}

export function sortByLastMessage(chats: Chat[]): Chat[] {
  return [...chats].sort(
    (a, b) =>
      (lastMessage(b)?.timestamp ?? 0) - (lastMessage(a)?.timestamp ?? 0),
  );
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
