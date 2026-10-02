import { io } from "socket.io-client";
// Both development (Vite proxy) and production use the current origin.
// A stale VITE_SOCKET_URL must never send a deployed browser to localhost.
export function createSocket() {
  return io({ autoConnect: false, withCredentials: true, reconnection: false });
}
