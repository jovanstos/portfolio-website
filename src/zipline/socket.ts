import { io } from 'socket.io-client';

// In prod this will be "" → same-origin
// In dev this will be http://localhost:3000
// "undefined" means the URL will be computed from the `window.location` object
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || undefined;

export const socket = io(SOCKET_URL, {
    autoConnect: true
});