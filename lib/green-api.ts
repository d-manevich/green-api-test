// GREEN-API client for Telegram instances: https://green-api.com/telegram/docs/

import type { Credentials } from "@/lib/chats";

const REQUEST_TIMEOUT_MS = 15_000;

export class GreenApiError extends Error {
  /** HTTP status; 0 when the request never got a response (network error, timeout) */
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "GreenApiError";
    this.status = status;
  }
}

/** Instances are served by a host named after the first 4 digits of idInstance */
export function apiHost(idInstance: string): string {
  return `https://${idInstance.slice(0, 4)}.api.green-api.com`;
}

type RequestOptions = {
  httpMethod?: "GET" | "POST" | "DELETE";
  body?: unknown;
  /** Extra path segment after the token, e.g. a receiptId */
  pathSuffix?: string;
  query?: Record<string, string>;
  timeoutMs?: number;
  signal?: AbortSignal;
};

async function request<T>(
  credentials: Credentials,
  method: string,
  {
    httpMethod = "GET",
    body,
    pathSuffix,
    query,
    timeoutMs = REQUEST_TIMEOUT_MS,
    signal,
  }: RequestOptions = {},
): Promise<T> {
  const { idInstance, apiTokenInstance } = credentials;
  let url = `${apiHost(idInstance)}/waInstance${encodeURIComponent(idInstance)}/${method}/${encodeURIComponent(apiTokenInstance)}`;
  if (pathSuffix) url += `/${encodeURIComponent(pathSuffix)}`;
  if (query) url += `?${new URLSearchParams(query)}`;

  const timeout = AbortSignal.timeout(timeoutMs);
  let response: Response;
  try {
    response = await fetch(url, {
      method: httpMethod,
      headers:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new GreenApiError(0, "Could not reach GREEN-API");
  }

  const text = await response.text();
  if (!response.ok) {
    throw new GreenApiError(response.status, text || response.statusText);
  }
  // Empty body means "nothing" (e.g. receiveNotification timed out)
  return (text ? JSON.parse(text) : null) as T;
}

export type StateInstance =
  | "notAuthorized"
  | "authorized"
  | "blocked"
  | "suspended"
  | "starting"
  | "pendingPassword";

export async function getStateInstance(
  credentials: Credentials,
): Promise<StateInstance> {
  const result = await request<{ stateInstance: StateInstance }>(
    credentials,
    "getStateInstance",
  );
  return result.stateInstance;
}

/** The subset of Instance settings the app depends on */
export type InstanceSettings = {
  /** Must be empty: with a webhook URL set, Notifications skip the queue */
  webhookUrl: string;
  /** Must be "yes": otherwise incoming Messages never reach the queue */
  incomingWebhook: "yes" | "no";
};

export function getSettings(
  credentials: Credentials,
  signal?: AbortSignal,
): Promise<InstanceSettings> {
  return request(credentials, "getSettings", { signal });
}

/** Restarts the Instance; new settings apply within ~5 minutes */
export function setSettings(
  credentials: Credentials,
  settings: Partial<InstanceSettings>,
): Promise<{ saveSettings: boolean }> {
  return request(credentials, "setSettings", {
    httpMethod: "POST",
    body: settings,
  });
}

/** Resolves a phone number to a Chat ID; `exist: false` also when the number is hidden by privacy settings */
export function checkAccount(
  credentials: Credentials,
  phone: string,
): Promise<{ exist: boolean; chatId: string }> {
  return request(credentials, "checkAccount", {
    httpMethod: "POST",
    body: { phoneNumber: Number(phone) },
  });
}

export function sendMessage(
  credentials: Credentials,
  chatId: string,
  message: string,
): Promise<{ idMessage: string }> {
  return request(credentials, "sendMessage", {
    httpMethod: "POST",
    body: { chatId, message },
  });
}

export type Notification = {
  receiptId: number;
  body: NotificationBody;
};

export type NotificationBody = {
  typeWebhook: string;
  idMessage?: string;
  /** Unix time in seconds */
  timestamp?: number;
  senderData?: { chatId: string };
  messageData?: {
    typeMessage: string;
    textMessageData?: { textMessage: string };
    extendedTextMessageData?: { text: string };
  };
};

/** Long-polls the Notification queue; `null` when nothing arrived within `receiveTimeout` seconds */
export function receiveNotification(
  credentials: Credentials,
  receiveTimeout: number,
  signal?: AbortSignal,
): Promise<Notification | null> {
  return request(credentials, "receiveNotification", {
    query: { receiveTimeout: String(receiveTimeout) },
    timeoutMs: (receiveTimeout + 10) * 1000,
    signal,
  });
}

export function deleteNotification(
  credentials: Credentials,
  receiptId: number,
): Promise<{ result: boolean }> {
  return request(credentials, "deleteNotification", {
    httpMethod: "DELETE",
    pathSuffix: String(receiptId),
  });
}

export type IncomingText = {
  chatId: string;
  idMessage: string;
  text: string;
  /** Unix time in milliseconds */
  timestamp: number;
};

/** Extracts an incoming text Message; `null` for any other Notification */
export function parseIncomingText(body: NotificationBody): IncomingText | null {
  if (body.typeWebhook !== "incomingMessageReceived") return null;
  const { senderData, messageData, idMessage, timestamp } = body;
  if (!senderData || !messageData || !idMessage || !timestamp) return null;

  let text: string | undefined;
  if (messageData.typeMessage === "textMessage") {
    text = messageData.textMessageData?.textMessage;
  } else if (messageData.typeMessage === "extendedTextMessage") {
    text = messageData.extendedTextMessageData?.text;
  }
  if (text === undefined) return null;

  return {
    chatId: senderData.chatId,
    idMessage,
    text,
    timestamp: timestamp * 1000,
  };
}

/** Short user-facing description of a failed request */
export function describeError(error: unknown): string {
  if (!(error instanceof GreenApiError)) {
    return error instanceof Error ? error.message : "Something went wrong";
  }
  switch (error.status) {
    case 0:
      return "Could not reach GREEN-API";
    case 429:
      return "Too many requests, try again later";
    case 466:
      return "Instance quota exceeded";
    default:
      return `GREEN-API error ${error.status}`;
  }
}

export function isAuthError(error: unknown): boolean {
  return (
    error instanceof GreenApiError &&
    (error.status === 401 || error.status === 403)
  );
}
