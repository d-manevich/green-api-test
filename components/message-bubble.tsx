import { CircleAlertIcon, ClockIcon } from "lucide-react";
import { formatTime, type Message } from "@/lib/chats";
import { cn } from "@/lib/utils";

type MessageBubbleProps = {
  message: Message;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const outgoing = message.direction === "outgoing";

  return (
    <div className={cn("flex", outgoing ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-md rounded-2xl bg-linear-to-bl px-2.5 pt-2 pb-2.5",
          outgoing
            ? "rounded-br-md from-purple-600 via-violet-500 to-indigo-500"
            : "rounded-bl-md from-slate-700 to-zinc-700",
        )}
      >
        <p className="break-words whitespace-pre-wrap">
          {message.text}
          <span className="float-right mt-2 ml-3 flex items-center gap-1 text-xs text-white/60">
            {message.status === "sending" && (
              <ClockIcon className="size-3" aria-label="Sending" />
            )}
            {formatTime(message.timestamp)}
          </span>
        </p>
        {message.status === "failed" && (
          <p className="mt-1 flex items-center gap-1 text-xs text-red-300">
            <CircleAlertIcon className="size-3" />
            Not sent
          </p>
        )}
      </div>
    </div>
  );
}
