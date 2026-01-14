export type DeviceInfo = {
    socketId: string;
    publicKey: string;
    approved: boolean;
};

export type RoomState = {
    pairingCode: string;
    devices: Map<string, DeviceInfo>;
};
