import { resolveServiceURL } from "./resolve-service-url";
import type { Message } from "../messages";

export interface HistoryThread {
  id: string;
  title: string;
  created_at: string;
}

export async function fetchHistory(): Promise<HistoryThread[]> {
  const res = await fetch(resolveServiceURL("history"));
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function fetchHistoryThread(id: string): Promise<Message[]> {
  const res = await fetch(resolveServiceURL(`history/${id}`));
  if (!res.ok) throw new Error("Failed to fetch thread");
  return res.json();
}

export async function saveHistory(
  id: string,
  title: string,
  messages: Message[],
): Promise<void> {
  await fetch(resolveServiceURL("history"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, title, messages }),
  });
}
