import { io } from 'socket.io-client';

// This script just starts socket

// In prod this will be "" the same-origin
// In dev this will be http://localhost:3000
// "undefined" means the URL will be computed from the `window.location` object
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || undefined;

export const socket = io(SOCKET_URL, {
    autoConnect: true
});