import { useCallback, useEffect, useRef, useState } from "react";

type WsStatus = "connecting" | "open" | "closed" | "error";

export function useWebSocket<T = unknown>(url: string | null) {
  const [messages, setMessages] = useState<T[]>([]);
  const [status, setStatus] = useState<WsStatus>("closed");
  const ws = useRef<WebSocket | null>(null);
  const retryDelay = useRef(1000);
  const unmounted = useRef(false);

  const connect = useCallback(() => {
    if (!url || unmounted.current) return;
    setStatus("connecting");
    const socket = new WebSocket(url);
    ws.current = socket;

    socket.onopen = () => {
      retryDelay.current = 1000;
      setStatus("open");
    };

    socket.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data) as T;
        setMessages((prev) => [...prev.slice(-49), data]);
      } catch {
        // ignore malformed messages
      }
    };

    socket.onerror = () => setStatus("error");

    socket.onclose = () => {
      if (unmounted.current) return;
      setStatus("closed");
      const delay = retryDelay.current;
      retryDelay.current = Math.min(delay * 2, 30_000);
      setTimeout(connect, delay);
    };
  }, [url]);

  useEffect(() => {
    unmounted.current = false;
    connect();
    return () => {
      unmounted.current = true;
      ws.current?.close();
    };
  }, [connect]);

  const clearMessages = useCallback(() => setMessages([]), []);
  return { messages, status, clearMessages };
}
