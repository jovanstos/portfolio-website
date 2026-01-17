export type DeviceInfo = {
    socketId: string;
    publicKey: string;
    approved: boolean;
};

export type RoomState = {
    pairingCode: string;
    devices: Map<string, DeviceInfo>;
    transfers?: Map<string, FileTransferState>;
};

export type FileTransferState = {
    bytesReceived: number;
    active: boolean;
}
