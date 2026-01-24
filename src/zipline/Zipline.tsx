import { useRef, useState, useEffect } from 'react';
import { ImFolderUpload } from "react-icons/im";
import { FaCopy, FaDownload } from "react-icons/fa";
import Popup from "../components/Popup";
import type { ChatMessage } from '../types/ziplineTypes';
import ErrorPopup from "../components/ErrorPopup";
import { socket } from './socket';
import {
    generateKeyPair,
    exportPublicKey,
    importPublicKey,
    encryptText,
    decryptText,
    generateAESKey,
    exportAESKey,
    importAESKey,
    aesEncrypt,
    aesDecrypt,
} from "./crypto";
import "../styles/Zipline.css";

function Zipline() {
    // Declaring all of refs
    const privateKeyRef = useRef<CryptoKey | null>(null);
    const publicKeyRef = useRef<CryptoKey | null>(null);
    const peerPublicKeyRef = useRef<CryptoKey | null>(null);
    const sessionKeyRef = useRef<CryptoKey | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const incomingFileRef = useRef<{
        meta: { name: string; type: string };
        chunks: Uint8Array[];
    } | null>(null);
    const roomID = useRef<string>("");

    // Declaing all of the states
    const [roomSateID, setRoomSateId] = useState<string>("");
    const [pairingCode, setPairingCode] = useState<string>("");
    // Error is set up this way so I can work with the error popup component
    const [isError, setIsError] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [approved, setApproved] = useState<boolean>(false);
    const [messageInput, setMessageInput] = useState<string>("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

    useEffect(() => {
        // All of the socket listners listening for key events

        // Get RSA-OAEP key to use to send the session key
        socket.on("peer:public-key", async ({ publicKey }) => {
            const imported = await importPublicKey(publicKey);
            peerPublicKeyRef.current = imported;

            if (sessionKeyRef.current) {
                await sendSessionKey();
            }
        });

        // Get AES-GCM key to start the encyrpted chat
        socket.on("session:key", async ({ payload }) => {
            if (!privateKeyRef.current) return;

            const buffer = Uint8Array.from(atob(payload), (c) => c.charCodeAt(0));
            const decrypted = await decryptText(buffer.buffer, privateKeyRef.current);

            const aesKey = await importAESKey(decrypted);
            sessionKeyRef.current = aesKey;
        });


        // Get encrypted messages to decrypt and add to messages
        socket.on("msg:encrypted", async ({ payload }) => {
            if (!sessionKeyRef.current) return;

            const decrypted = await aesDecrypt(payload, sessionKeyRef.current);
            const text = new TextDecoder().decode(decrypted);

            setMessages(prev => [
                ...prev,
                { id: uid(), from: "other", type: "text", text }
            ]);
        });


        // Start the initial state to get a file
        socket.on("file:init", ({ meta }) => {
            incomingFileRef.current = {
                meta,
                chunks: [],
            };
        });

        // Receive chunks fo the file and add them
        socket.on("file:chunk", async ({ payload }) => {
            if (!sessionKeyRef.current || !incomingFileRef.current) return;

            const decrypted = await aesDecrypt(payload, sessionKeyRef.current);
            incomingFileRef.current.chunks.push(new Uint8Array(decrypted));
        });


        // Abort the file upload and set file ref ot null
        socket.on("file:abort", async () => {
            if (!sessionKeyRef.current || !incomingFileRef.current) return;

            incomingFileRef.current = null;
        });

        // When the file upload is completed do the proper steps to create a new blob and show it
        socket.on("file:complete", () => {
            if (!incomingFileRef.current) return;

            const { meta, chunks } = incomingFileRef.current;
            const blob = new Blob(chunks as BlobPart[], { type: meta.type });

            setMessages(prev => [
                ...prev,
                {
                    id: uid(),
                    from: "other",
                    type: "file",
                    name: meta.name,
                    blob,
                },
            ]);

            incomingFileRef.current = null;
        });

        // Handle any error messages
        socket.on("room:error-message", ({ message }) => {
            setError(message)
            setIsError(true)
        });

        // Clean up
        return () => {
            socket.off("peer:public-key");
            socket.off("session:key");
            socket.off("msg:encrypted");
            socket.off("file:init");
            socket.off("file:chunk");
            socket.off("file:complete");
        };
    }, []);

    // A lot of these funtions below are self documenting
    const uid = () => crypto.randomUUID();

    function closePopup() {
        setIsPopupOpen(!isPopupOpen)
    }

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        sendFile(file);
    };

    function handleMessageInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        setMessageInput(event.target.value);
    }

    const handleRoomIDChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRoomSateId(event.target.value);

        roomID.current = roomSateID
    };

    const handlePairKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPairingCode(event.target.value);
    };

    async function createKeys() {
        const keyPair = await generateKeyPair();
        privateKeyRef.current = keyPair.privateKey;
        publicKeyRef.current = keyPair.publicKey;
    }

    async function createRoom() {
        if (!publicKeyRef.current) await createKeys();

        const currentRoomID = roomID.current

        const aesKey = await generateAESKey();
        sessionKeyRef.current = aesKey;

        const exportedPublicKey = await exportPublicKey(publicKeyRef.current!);

        socket.emit("room:create", { roomID: currentRoomID, publicKey: exportedPublicKey });

        socket.on("room:pairing-code", ({ pairingCode, approved }) => {
            setPairingCode(pairingCode);
            setApproved(approved);
            setIsPopupOpen(true)
            setError("")
            setIsError(false)
        });
    }

    async function joinRoom() {
        if (!publicKeyRef.current) await createKeys();

        const currentRoomID = roomID.current

        const exportedPublicKey = await exportPublicKey(publicKeyRef.current!);

        socket.emit("room:join", { roomID: currentRoomID, publicKey: exportedPublicKey, pairingCode });

        socket.on("room:approved", () => {
            setApproved(true);
            setError("")
            setIsError(false)
        });
    }

    async function sendSessionKey() {
        if (!peerPublicKeyRef.current) return;

        if (!sessionKeyRef.current) return;

        const currentRoomID = roomID.current

        const exportedAES = await exportAESKey(sessionKeyRef.current);
        const encryptedKey = await encryptText(exportedAES, peerPublicKeyRef.current);

        socket.emit("session:key", {
            roomID: currentRoomID,
            payload: btoa(String.fromCharCode(...new Uint8Array(encryptedKey))),
        });

        setError("")
        setIsError(false)
    }

    async function sendMessage(text: string) {
        if (!sessionKeyRef.current || !text) return;

        const currentRoomID = roomID.current;
        const encoded = new TextEncoder().encode(text);
        const encrypted = await aesEncrypt(encoded, sessionKeyRef.current);

        socket.emit("msg:encrypted", { roomID: currentRoomID, payload: encrypted });

        setMessages(prev => [
            ...prev,
            { id: uid(), from: "self", type: "text", text }
        ]);

        setMessageInput("");
        setError("")
        setIsError(false)
    }


    // When sending a file set up chunk the file into the correct chunks and encrypt...
    // ...then loop through and send each piece until complete
    async function sendFile(file: File) {
        if (!sessionKeyRef.current) return;

        const currentRoomID = roomID.current

        const chunkSize = 64 * 1024;
        socket.emit("file:init", { roomID: currentRoomID, meta: { name: file.name, size: file.size, type: file.type } });

        for (let offset = 0; offset < file.size; offset += chunkSize) {
            const chunk = new Uint8Array(await file.slice(offset, offset + chunkSize).arrayBuffer());
            const encrypted = await aesEncrypt(chunk, sessionKeyRef.current);
            socket.emit("file:chunk", { roomID: currentRoomID, payload: encrypted });
        }

        socket.emit("file:complete", { roomID: currentRoomID });

        setMessages(prev => [
            ...prev,
            {
                id: uid(),
                from: "self",
                type: "file",
                name: file.name,
                blob: file,
            },
        ]);

        setError("")
        setIsError(false)
    }

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text);
    }

    function downloadBlob(blob: Blob, filename: string) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // This is an ugly funcion but all it does it make the user leave then reset everything to default
    function leaveRoom() {
        socket.emit("leave")

        privateKeyRef.current = null
        publicKeyRef.current = null
        peerPublicKeyRef.current = null
        sessionKeyRef.current = null
        roomID.current = ""

        setApproved(false)
        setMessageInput("")
        setMessages([])
        setRoomSateId("")
        setError("")
        setIsError(false)
    }

    return (
        <section id="zipline-app">
            <Popup isOpen={isPopupOpen} onClose={closePopup}>
                <h2>Pairing Information</h2>
                <br />
                <div id='pairing-info-container'>
                    <div>
                        <h3 className='pairing-info'>ID: {roomSateID}</h3>
                        <h3 className='pairing-info'>Code: {pairingCode}</h3>
                    </div>
                </div>
                <br />
                <p>All linked up? Once you close this you will no longer be able to see this information!</p>
            </Popup>
            <ErrorPopup isError={isError} message={error} />
            {
                !approved ? (
                    <section id="room-options">
                        <div id="create-room">
                            <h2 style={{ margin: "0px" }}>Host</h2>
                            <input type="text" value={roomSateID} onChange={handleRoomIDChange} placeholder="Create an ID" />
                            <button className='primary-button' onClick={createRoom}>Create Room</button>
                        </div>
                        <h2>Or</h2>
                        <div id="join-room">
                            <h2>Pair Device</h2>
                            <input type="text" value={roomSateID} onChange={handleRoomIDChange} placeholder="Host ID" />
                            <input type="text" value={pairingCode} onChange={handlePairKeyChange} placeholder="Pairing Code" />
                            <button className='primary-button' onClick={joinRoom}>Join Room</button>
                        </div>
                    </section>
                ) : (
                    <section id='zipline-chat-section'>
                        <article id='chat-feed'>
                            <h2>Feed</h2>
                            <div id='message-feed'>
                                <ul>
                                    {messages.map(msg => (
                                        <li key={msg.id} className={msg.from}>
                                            {msg.type === "text" ? (
                                                <ul className='message'>
                                                    <span>Text from {msg.from}: </span>
                                                    <b>{msg.text}</b>
                                                    <button onClick={() => copyToClipboard(msg.text)}>
                                                        <FaCopy />
                                                    </button>
                                                </ul>
                                            ) : (
                                                <ul className='message'>
                                                    <span>File from {msg.from}: </span>
                                                    <b>{msg.name}</b>
                                                    <button onClick={() => downloadBlob(msg.blob, msg.name)}>
                                                        <FaDownload />
                                                    </button>
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div id='chat-input'>
                                <input id='text-input' type="text"
                                    value={messageInput}
                                    onChange={handleMessageInputChange} placeholder="Message..." />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
                                />
                                <button
                                    id="chat-folder"
                                    aria-label="Upload file"
                                    type="button"
                                    onClick={handleFileClick}
                                >
                                    <ImFolderUpload />
                                </button>
                                <button id='chat-send' onClick={() => sendMessage(messageInput)}>Send</button>
                            </div>
                        </article>
                        <article id='control-panel'>
                            <h2>Control Panel</h2>
                            <h3>Actions</h3>
                            <button className='danger-button' onClick={leaveRoom}>Leave</button>
                        </article>
                    </section>
                )
            }
        </section >
    );
}

export default Zipline;
