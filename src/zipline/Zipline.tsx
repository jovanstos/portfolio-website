import { useRef, useState, useEffect } from 'react';
import { socket } from './socket';
import {
    generateKeyPair,
    exportPublicKey,
    decryptText,
} from "./crypto";
import "../styles/Zipline.css";

function Zipline() {
    const privateKeyRef = useRef<CryptoKey | null>(null);
    const [roomID, setRoomID] = useState('');
    const [pairingCode, setPairingCode] = useState("");
    const [approved, setApproved] = useState(false);

    useEffect(() => {
        socket.on("msg:encrypted", async ({ payload }) => {
            console.log("PAYLOAD BACK", payload);

            if (!privateKeyRef.current) return;
            const decrypted = await decryptText(
                payload,
                privateKeyRef.current
            );
            console.log("Received: " + decrypted);
        });

        return () => {
            socket.off('disconnect');
        };
    }, []);

    const handleRoomIDChange = (event: any) => {
        setRoomID(event.target.value);
    };

    const handlePairKeyChange = (event: any) => {
        setPairingCode(event.target.value);
    };

    async function createRoom() {
        const keyPair = await generateKeyPair();
        privateKeyRef.current = keyPair.privateKey;
        const publicKey = await exportPublicKey(keyPair.publicKey);

        socket.emit("room:create", { roomID, publicKey });

        socket.on("room:pairing-code", ({ pairingCode, approved }) => {
            console.log("PAIR APPROVAL", pairingCode, approved);

            setPairingCode(pairingCode);
            setApproved(approved);
        });
    }

    async function joinRoom() {
        const keyPair = await generateKeyPair();
        privateKeyRef.current = keyPair.privateKey;
        const publicKey = await exportPublicKey(keyPair.publicKey);

        socket.emit("room:join", { roomID, publicKey, pairingCode });

        socket.on("room:approved", () => {
            setApproved(true);
            console.log("Approved!");
        });

        const payload = "HELLO HELLO!"

        socket.emit("msg:encrypted", ({ roomID, payload }));
    }

    return (
        <main id="project">
            <h1>Zipline </h1>
            <p>Create A Room</p>
            <input
                type="text"
                value={roomID}
                onChange={handleRoomIDChange}
                placeholder="Enter room ID"
            />
            <button onClick={createRoom}>Create room</button>
            <p>{pairingCode}</p>
            <p>{approved}</p>
            <p>Join A Room</p>
            <input
                type="text"
                value={roomID}
                onChange={handleRoomIDChange}
                placeholder="Enter room ID"
            />
            <input
                type="text"
                value={pairingCode}
                onChange={handlePairKeyChange}
                placeholder="Enter paring key"
            />
            <button onClick={joinRoom}>Join Room</button>
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
