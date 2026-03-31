const BASE = import.meta.env.VITE_API_URL || "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status}: ${body}`);
  }
  return res.json();
}

export const api = {
  health: () => request<{ status: string; providers: string[]; cache_available: boolean }>("/health"),
  stats: () => request<Record<string, unknown>>("/stats"),
  models: () => request<{ models: string[] }>("/models"),
  providers: () => request<{ providers: string[] }>("/providers"),
  chat: (body: { messages: { role: string; content: string }[]; model?: string; provider?: string; conversation_id?: string }) =>
    request<{ content: string; model: string; provider: string; usage: Record<string, number>; conversation_id?: string }>("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  conversations: {
    list: () => request<{ conversations: { id: string; title: string; created_at: string; provider: string; message_count: number }[] }>("/conversations"),
    get: (id: string) => request<{ id: string; messages: { role: string; content: string }[]; provider: string }>(`/conversations/${id}`),
    delete: (id: string) => request<void>(`/conversations/${id}`, { method: "DELETE" }),
  },
};
