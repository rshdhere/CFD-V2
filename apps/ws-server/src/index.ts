import { REDIS_URL, WS_PORT } from "@CFD-V2/config";
import { createClient } from "redis";
import type { IncomingMessage } from "http";
import { type RawData, WebSocket, WebSocketServer } from "ws";

const redisUrl = REDIS_URL ?? "redis://127.0.0.1:6379";

const PRICE_CHANNELS = ["BTC", "ETH", "SOL"].map((b) => `price:${b}USDT`);

type ClientCommand = {
  type: string;
  symbol?: string;
};

function toRedisPriceChannel(raw: string): string | null {
  const s = raw.trim().toUpperCase();
  if (s.endsWith("USDT") && PRICE_CHANNELS.includes(`price:${s}`)) {
    return `price:${s}`;
  }
  if (s === "BTC" || s === "ETH" || s === "SOL") {
    return `price:${s}USDT`;
  }
  return null;
}

export async function main() {
  const subscriber = createClient({ url: redisUrl });
  subscriber.on("error", (err) => console.error("Redis subscriber error", err));
  await subscriber.connect();
  console.log("[redis]: connected to redis successfully");

  const wss = new WebSocketServer({ port: Number(WS_PORT) });

  const sockets = new Map<WebSocket, Set<string>>();

  await subscriber.pSubscribe("price:*", (message, channel) => {
    sockets.forEach((channels, ws) => {
      if (!channels.has(channel)) {
        return;
      }
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const remote = req.socket.remoteAddress ?? "unknown";
    console.log(
      `[websocket]: client connected (${remote}), open clients: ${wss.clients.size}`,
    );

    sockets.set(ws, new Set());

    ws.on("message", (raw: RawData) => {
      let parsed: ClientCommand;
      try {
        parsed = JSON.parse(raw.toString()) as ClientCommand;
      } catch {
        return;
      }

      if (parsed.type !== "SUBSCRIBE" && parsed.type !== "UNSUBSCRIBE") {
        return;
      }

      if (typeof parsed.symbol !== "string") {
        return;
      }

      const channel = toRedisPriceChannel(parsed.symbol);
      if (!channel) {
        return;
      }

      let subs = sockets.get(ws);
      if (!subs) {
        subs = new Set();
        sockets.set(ws, subs);
      }

      if (parsed.type === "SUBSCRIBE") {
        subs.add(channel);
        return;
      }

      subs.delete(channel);
      if (subs.size === 0) {
        sockets.delete(ws);
      }
    });

    ws.on("close", () => {
      sockets.delete(ws);
      console.log(
        `[websocket]: client disconnected (${remote}), open clients: ${wss.clients.size}`,
      );
    });
  });

  console.log(`[websocket]: server listening on ws://localhost:${WS_PORT}`);
}
