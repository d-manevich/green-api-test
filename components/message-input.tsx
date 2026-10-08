"use client";

import { SendHorizontalIcon } from "lucide-react";
import { type KeyboardEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MAX_MESSAGE_LENGTH } from "@/lib/chats";

type MessageInputProps = {
  onSend: (text: string) => void;
};

export function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState("");
  const canSend = text.trim() !== "";

  function send() {
    if (!canSend) return;
    onSend(text.trim());
    setText("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      send();
    }
  }

  return (
    <div className="flex items-end gap-2 rounded-xl bg-zinc-800 py-1 pr-1 pl-3">
      <Textarea
        rows={1}
        autoFocus
        placeholder="Message"
        aria-label="Message"
        maxLength={MAX_MESSAGE_LENGTH}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="max-h-40 min-h-10 resize-none border-0 bg-transparent px-0 py-2 text-base focus-visible:ring-0 md:text-base dark:bg-transparent"
      />
      {canSend && (
        <Button
          size="icon"
          onClick={send}
          aria-label="Send"
          className="size-10 rounded-full"
        >
          <SendHorizontalIcon className="size-5" />
        </Button>
      )}
    </div>
  );
}
