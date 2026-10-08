"use client";

import { useEffect, useEffectEvent } from "react";
import type { Credentials } from "@/lib/chats";
import {
  deleteNotification,
  GreenApiError,
  type IncomingText,
  isAuthError,
  parseIncomingText,
  receiveNotification,
} from "@/lib/green-api";

const RECEIVE_TIMEOUT_SECONDS = 20;
const RETRY_DELAY_MS = 5_000;

type Handlers = {
  onIncomingText: (message: IncomingText) => void;
  /** Credentials were rejected: polling stops */
  onAuthError: () => void;
  /** `null` once the queue is readable again */
  onQueueError: (message: string | null) => void;
};

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

/** Reads the Notification queue one request at a time until unmounted */
export function useNotificationPolling(
  credentials: Credentials,
  handlers: Handlers,
) {
  const onIncomingText = useEffectEvent(handlers.onIncomingText);
  const onAuthError = useEffectEvent(handlers.onAuthError);
  const onQueueError = useEffectEvent(handlers.onQueueError);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function poll() {
      while (!signal.aborted) {
        try {
          const notification = await receiveNotification(
            credentials,
            RECEIVE_TIMEOUT_SECONDS,
            signal,
          );
          onQueueError(null);
          if (!notification) continue;

          const incoming = parseIncomingText(notification.body);
          if (incoming) onIncomingText(incoming);
          // Every Notification is deleted, otherwise it blocks the queue
          await deleteNotification(credentials, notification.receiptId);
        } catch (error) {
          if (signal.aborted) return;
          if (isAuthError(error)) {
            onAuthError();
            return;
          }
          // 400 here means the queue is unavailable, e.g. a webhook URL is set for the Instance
          onQueueError(
            error instanceof GreenApiError && error.status === 400
              ? `Can't receive messages: ${error.message}`
              : "Can't receive messages, retrying…",
          );
          await sleep(RETRY_DELAY_MS, signal);
        }
      }
    }

    poll();
    return () => controller.abort();
  }, [credentials]);
}
