"use client";

import { useEffect, useState } from "react";
import type { Credentials } from "@/lib/chats";
import {
  describeError,
  GreenApiError,
  getSettings,
  type InstanceSettings,
  setSettings,
} from "@/lib/green-api";

/** Why the Instance can't deliver incoming Messages to the app */
export type SettingsProblem = "webhookUrlSet" | "incomingDisabled";

export type InstanceSettingsState =
  | { status: "checking" }
  | { status: "ok" }
  | { status: "applying" }
  | { status: "problem"; problem: SettingsProblem; fixing: boolean }
  | { status: "error"; message: string };

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2_000;

const REQUIRED: InstanceSettings = { webhookUrl: "", incomingWebhook: "yes" };

function findProblem(settings: InstanceSettings): SettingsProblem | null {
  if (settings.webhookUrl) return "webhookUrlSet";
  if (settings.incomingWebhook !== "yes") return "incomingDisabled";
  return null;
}

/** Checks once per sign-in that incoming Messages can reach the Notification queue */
export function useInstanceSettings(credentials: Credentials) {
  const [state, setState] = useState<InstanceSettingsState>({
    status: "checking",
  });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function check() {
      for (let attempt = 1; ; attempt++) {
        try {
          const settings = await getSettings(credentials, signal);
          const problem = findProblem(settings);
          setState(
            problem
              ? { status: "problem", problem, fixing: false }
              : { status: "ok" },
          );
          return;
        } catch (error) {
          if (signal.aborted) return;
          // getSettings is rate limited per Instance; a burst (e.g. two tabs) gets 429
          const rateLimited =
            error instanceof GreenApiError && error.status === 429;
          if (!rateLimited || attempt === MAX_ATTEMPTS) {
            setState({ status: "error", message: describeError(error) });
            return;
          }
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
          if (signal.aborted) return;
        }
      }
    }

    check();
    return () => controller.abort();
  }, [credentials]);

  async function fix() {
    if (state.status !== "problem") return;
    setState({ ...state, fixing: true });
    try {
      await setSettings(credentials, REQUIRED);
      setState({ status: "applying" });
    } catch (error) {
      setState({ status: "error", message: describeError(error) });
    }
  }

  function dismiss() {
    setState({ status: "ok" });
  }

  return { state, fix, dismiss };
}
