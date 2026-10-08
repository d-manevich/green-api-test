"use client";

import { type SubmitEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { isValidPhone, normalizePhone } from "@/lib/chats";
import { cn } from "@/lib/utils";

type NewChatDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (phone: string) => Promise<void>;
};

export function NewChatDialog({
  open,
  onOpenChange,
  onSubmit,
}: NewChatDialogProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const phone = normalizePhone(input);
  const canSubmit = isValidPhone(phone) && !pending;

  function handleOpenChange(next: boolean) {
    if (!next) {
      setInput("");
      setError(null);
    }
    onOpenChange(next);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setPending(true);
    setError(null);
    try {
      await onSubmit(phone);
      handleOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 rounded-2xl p-6 sm:max-w-sm">
        <DialogTitle className="text-xl font-semibold">
          Search by number
        </DialogTitle>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div
              className={cn(
                "flex h-12 items-center gap-1 rounded-xl bg-white/10 px-3 ring-blue-500 focus-within:ring-2",
                error && "ring-2 ring-red-400",
              )}
            >
              <span className="text-white/60">+</span>
              <Input
                autoFocus
                type="tel"
                inputMode="tel"
                placeholder="7 999 123 45 67"
                aria-label="Phone number"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "new-chat-error" : undefined}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError(null);
                }}
                className="h-full border-0 bg-transparent px-0 text-base focus-visible:ring-0 aria-invalid:ring-0 md:text-base dark:bg-transparent"
              />
            </div>
            {error && (
              <p id="new-chat-error" className="text-sm text-red-400">
                {error}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={!canSubmit}
            className="h-12 rounded-xl text-base disabled:bg-white/10 disabled:text-white/60 disabled:opacity-100"
          >
            {pending ? "Searching…" : "Find in Telegram"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
