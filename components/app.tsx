"use client";

import { useState } from "react";
import { ChatScreen } from "@/components/chat-screen";
import { LoginScreen } from "@/components/login-screen";
import type { Credentials } from "@/lib/chats";
import { mockSignIn } from "@/lib/mock-chats";

export function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(null);

  async function handleSignIn(next: Credentials) {
    await mockSignIn(next);
    setCredentials(next);
  }

  return credentials ? (
    <ChatScreen onLogout={() => setCredentials(null)} />
  ) : (
    <LoginScreen onSubmit={handleSignIn} />
  );
}
