import { useRef, useState, useEffect } from 'react';
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
    const privateKeyRef = useRef<CryptoKey | null>(null);
    const publicKeyRef = useRef<CryptoKey | null>(null);
    const peerPublicKeyRef = useRef<CryptoKey | null>(null);
    const sessionKeyRef = useRef<CryptoKey | null>(null);
    const roomID = useRef<string>("");

    const [roomSateID, setRoomSateId] = useState<string>("");
    const [pairingCode, setPairingCode] = useState<string>("");
    const [approved, setApproved] = useState<boolean>(false);
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        socket.on("peer:public-key", async ({ publicKey }) => {
            const imported = await importPublicKey(publicKey);
            peerPublicKeyRef.current = imported;
            console.log("Peer public key received");

            if (sessionKeyRef.current) {
                console.log("This browser is sending the key");
                await sendSessionKey();
            }
        });

        socket.on("session:key", async ({ payload }) => {
            if (!privateKeyRef.current) return;

            const buffer = Uint8Array.from(atob(payload), (c) => c.charCodeAt(0));
            const decrypted = await decryptText(buffer.buffer, privateKeyRef.current);

            const aesKey = await importAESKey(decrypted);
            sessionKeyRef.current = aesKey;

            console.log("Session key established");
        });

        socket.on("msg:encrypted", async ({ payload }) => {
            if (!sessionKeyRef.current) return;

            const decrypted = await aesDecrypt(payload, sessionKeyRef.current);
            const text = new TextDecoder().decode(decrypted);

            console.log("Text", text);

            setMessages((prev) => [...prev, `Peer: ${text}`]);
        });

        socket.on("file:init", ({ meta }) => {
            console.log("Receiving file:", meta);
        });

        socket.on("file:chunk", async ({ payload }) => {
            if (!sessionKeyRef.current) return;

            console.log(payload);

            console.log("Received file chunk");
        });

        socket.on("file:complete", () => {
            console.log("File transfer complete");
        });

        return () => {
            socket.off("peer:public-key");
            socket.off("session:key");
            socket.off("msg:encrypted");
            socket.off("file:init");
            socket.off("file:chunk");
            socket.off("file:complete");
        };
    }, []);


    const handleRoomIDChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRoomSateId(event.target.value);

        roomID.current = roomSateID
        console.log("CHANGE", roomID.current);
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

        socket.emit("room:create", { currentRoomID, publicKey: exportedPublicKey });

        socket.on("room:pairing-code", ({ pairingCode, approved }) => {
            setPairingCode(pairingCode);
            setApproved(approved);
        });
    }

    async function joinRoom() {
        if (!publicKeyRef.current) await createKeys();

        const currentRoomID = roomID.current

        const exportedPublicKey = await exportPublicKey(publicKeyRef.current!);

        socket.emit("room:join", { currentRoomID, publicKey: exportedPublicKey, pairingCode });

        socket.on("room:approved", () => {
            setApproved(true);
        });

        console.log(approved);
    }

    async function sendSessionKey() {
        if (!peerPublicKeyRef.current) return;

        if (!sessionKeyRef.current) return;

        const currentRoomID = roomID.current

        const exportedAES = await exportAESKey(sessionKeyRef.current);
        const encryptedKey = await encryptText(exportedAES, peerPublicKeyRef.current);

        socket.emit("session:key", {
            currentRoomID,
            payload: btoa(String.fromCharCode(...new Uint8Array(encryptedKey))),
        });

        console.log("Session key sent to peer");
    }

    async function sendMessage(text: string) {
        if (!sessionKeyRef.current) return;

        const currentRoomID = roomID.current

        const encoded = new TextEncoder().encode(text);
        const encrypted = await aesEncrypt(encoded, sessionKeyRef.current);

        socket.emit("msg:encrypted", { currentRoomID, payload: encrypted });
        setMessages((prev) => [...prev, `You: ${text}`]);
    }

    async function sendFile(file: File) {
        if (!sessionKeyRef.current) return;

        const currentRoomID = roomID.current

        const chunkSize = 64 * 1024;
        socket.emit("file:init", { currentRoomID, meta: { name: file.name, size: file.size, type: file.type } });

        for (let offset = 0; offset < file.size; offset += chunkSize) {
            const chunk = new Uint8Array(await file.slice(offset, offset + chunkSize).arrayBuffer());
            const encrypted = await aesEncrypt(chunk, sessionKeyRef.current);
            socket.emit("file:chunk", { currentRoomID, payload: encrypted });
        }

        socket.emit("file:complete", { currentRoomID });
        console.log("File sent:", file.name);
    }

    return (
        <main id="project">
            <h1>Zipline</h1>
            <section>
                <h2>Create a Room</h2>
                <input type="text" value={roomSateID} onChange={handleRoomIDChange} placeholder="Room ID" />
                <button onClick={createRoom}>Create Room</button>
            </section>
            <section>
                <h2>Join a Room</h2>
                <input type="text" value={roomSateID} onChange={handleRoomIDChange} placeholder="Room ID" />
                <input type="text" value={pairingCode} onChange={handlePairKeyChange} placeholder="Pairing Code" />
                <button onClick={joinRoom}>Join Room</button>
            </section>
            <section>
                <h2>Send Message</h2>
                <button onClick={() => sendMessage("Hello Peer!")}>Send "Hello Peer!"</button>
            </section>
            <section>
                <h2>Send File</h2>
                <input type="file" onChange={(e) => e.target.files && sendFile(e.target.files[0])} />
            </section>
            <section>
                <h2>Messages</h2>
                <ul>
                    {messages.map((msg, idx) => (
                        <li key={idx}>{msg}</li>
                    ))}
                </ul>
            </section>
            {/* <h1>{projectData.title}</h1>
            <p style={{ marginBottom: "15px" }}>To have the best experience desktop is recommended.</p>
            <img
                id="main-project-img"
                src={projectData.imageurl}
                alt={projectData.imagedescription}
                width="1000"
            />
            <section className="project-content">
                {contentData?.map((articleData: any) => {
                    const hasText = Boolean(articleData.text);
                    const hasImage = Boolean(articleData.imageurl);

                    return (
                        <FadeInSection>
                            <article className="project-article" key={articleData.id}>
                                {hasImage && (
                                    <>
                                        <h2 className="project-h2">{articleData.title}</h2>
                                        <img
                                            src={articleData.imageurl}
                                            alt={articleData.imagedescription || ""}
                                            width={750}
                                        />
                                        <p style={{ textAlign: "center" }}>{!hasText ? articleData.imagedescription : ""}</p>
                                    </>
                                )}
                                {hasText && <p>{articleData.text}</p>}
                            </article>
                        </FadeInSection>
                    );
                })}
            </section> */}
        </main>
    );
}

export default Zipline;
