declare module "*.svg" {
    const content: string;
    export = content;
}

declare module "@netless/white-fast-web-sdk" {
    const WhiteFastSDK: any;
    export default WhiteFastSDK;
}

declare module "agora-rtc-sdk" {
    const AgoraRTC: any;
    export default AgoraRTC;
}

declare module "webrtc-zego" {
    export const ZegoClient: any;
}


declare module "*.jpg" {
    const content: string;
    export = content;
}
declare module "*.png" {
    const content: string;
    export = content;
}

