"use client";

import { useEffect, useState } from "react";
import { ChatScreen } from "@/components/chat-screen";
import { LoginScreen } from "@/components/login-screen";
import type { Credentials } from "@/lib/chats";
import {
  clearCredentials,
  loadCredentials,
  saveCredentials,
} from "@/lib/credentials-storage";
import { GreenApiError, getStateInstance } from "@/lib/green-api";

async function signIn(credentials: Credentials): Promise<void> {
  if (!/^\d+$/.test(credentials.idInstance)) {
    throw new Error("idInstance must contain digits only");
  }
  let state: string;
  try {
    state = await getStateInstance(credentials);
  } catch (error) {
    if (error instanceof GreenApiError && error.status === 401) {
      throw new Error("Invalid credentials");
    }
    if (error instanceof GreenApiError && error.status === 0) {
      throw new Error("Could not reach the instance, check idInstance");
    }
    throw error;
  }
  if (state !== "authorized") {
    throw new Error(`Instance is not ready: ${state}`);
  }
}

export function App() {
  // undefined until storage is read on the client
  const [credentials, setCredentials] = useState<Credentials | null>();
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setCredentials(loadCredentials());
  }, []);

  async function handleSignIn(next: Credentials) {
    setNotice(null);
    await signIn(next);
    saveCredentials(next);
    setCredentials(next);
  }

  function handleLogout() {
    clearCredentials();
    setCredentials(null);
  }

  function handleSessionExpired() {
    handleLogout();
    setNotice("Session expired, sign in again");
  }

  if (credentials === undefined) return null;

  return credentials ? (
    <ChatScreen
      credentials={credentials}
      onLogout={handleLogout}
      onSessionExpired={handleSessionExpired}
    />
  ) : (
    <LoginScreen onSubmit={handleSignIn} notice={notice} />
  );
}
