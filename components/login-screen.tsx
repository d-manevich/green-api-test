"use client";

import { MessageCircleIcon } from "lucide-react";
import { type SubmitEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Credentials } from "@/lib/chats";

type LoginScreenProps = {
  onSubmit: (credentials: Credentials) => Promise<void>;
};

export function LoginScreen({ onSubmit }: LoginScreenProps) {
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const canSubmit =
    idInstance.trim() !== "" && apiTokenInstance.trim() !== "" && !pending;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setPending(true);
    setError(null);
    try {
      await onSubmit({
        idInstance: idInstance.trim(),
        apiTokenInstance: apiTokenInstance.trim(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setPending(false);
    }
  }

  return (
    <main className="flex h-full items-center justify-center bg-food p-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-6 rounded-2xl bg-zinc-800 p-6"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-blue-500">
            <MessageCircleIcon className="size-7" />
          </div>
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-white/60">
            Enter your GREEN-API instance credentials
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="idInstance">idInstance</Label>
            <Input
              id="idInstance"
              inputMode="numeric"
              autoComplete="off"
              placeholder="1101000001"
              value={idInstance}
              onChange={(e) => setIdInstance(e.target.value)}
              className="h-10 rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="apiTokenInstance">apiTokenInstance</Label>
            <Input
              id="apiTokenInstance"
              type="password"
              autoComplete="off"
              value={apiTokenInstance}
              onChange={(e) => setApiTokenInstance(e.target.value)}
              className="h-10 rounded-xl"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <Button type="submit" disabled={!canSubmit} className="h-10 rounded-xl">
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </main>
  );
}
