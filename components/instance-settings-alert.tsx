"use client";

import { CircleAlertIcon, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  InstanceSettingsState,
  SettingsProblem,
} from "@/hooks/use-instance-settings";

const PROBLEM_TEXT: Record<
  SettingsProblem,
  { message: string; action: string }
> = {
  incomingDisabled: {
    message:
      "Incoming message notifications are turned off for this instance, so replies won't appear here.",
    action: "Turn on",
  },
  webhookUrlSet: {
    message:
      "This instance sends notifications to a webhook URL, so replies won't appear here. Fixing clears the webhook URL.",
    action: "Clear webhook and turn on",
  },
};

type InstanceSettingsAlertProps = {
  state: InstanceSettingsState;
  onFix: () => void;
  onDismiss: () => void;
};

export function InstanceSettingsAlert({
  state,
  onFix,
  onDismiss,
}: InstanceSettingsAlertProps) {
  if (state.status === "checking" || state.status === "ok") return null;

  if (state.status === "applying") {
    return (
      <div className="mx-4 mb-2 flex gap-2 rounded-xl bg-blue-500/10 px-3 py-2 text-sm text-blue-400">
        <InfoIcon className="mt-0.5 size-4 shrink-0" />
        <p>
          Settings saved. The instance restarts and applies them within about 5
          minutes.
        </p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <p
        role="alert"
        className="mx-4 mb-2 rounded-xl bg-red-400/10 px-3 py-2 text-sm text-red-400"
      >
        Couldn't check instance settings: {state.message}
      </p>
    );
  }

  const text = PROBLEM_TEXT[state.problem];
  return (
    <div
      role="alert"
      className="mx-4 mb-2 flex flex-col gap-3 rounded-xl bg-amber-400/10 px-3 py-3 text-sm text-amber-300"
    >
      <div className="flex gap-2">
        <CircleAlertIcon className="mt-0.5 size-4 shrink-0" />
        <p>{text.message}</p>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          disabled={state.fixing}
          className="rounded-lg text-white/60"
        >
          Not now
        </Button>
        <Button
          size="sm"
          onClick={onFix}
          disabled={state.fixing}
          className="rounded-lg"
        >
          {state.fixing ? "Saving…" : text.action}
        </Button>
      </div>
    </div>
  );
}
