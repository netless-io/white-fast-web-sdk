import {PPTDataType} from "../components/menu/PPTDatas";
import {OSSConfigObjType} from "../appToken";
import {RoomFacadeSetter} from "../facade/Facade";
import {DeviceType, Room} from "white-web-sdk";

export enum MenuInnerType {
    AnnexBox = "AnnexBox",
    PPTBox = "PPTBox",
}
export enum IdentityType {
    host = "host",
    guest = "guest",
    listener = "listener",
}

export enum LanguageEnum {
    Chinese = "Chinese",
    English = "English",
}

export enum UploadDocumentEnum {
    image = "image",
    static_conversion = "static_conversion",
    dynamic_conversion = "dynamic_conversion",
}

export enum RtcEnum {
    agora = "agora",
    zego = "zego",
    qiniu = "qiniu",
}

export type UploadToolBoxType = {
    enable: boolean,
    type: UploadDocumentEnum,
    icon?: string,
    title?: string,
    script?: string,
};

export type RtcType = {
    type: RtcEnum,
    rtcObj: any,
    appId: string,
    defaultStart?: boolean,
    channel?: string, // 不写默认是 uuid,
    authConfig?: {
        token: string | number[],
    }
    recordConfig?: {
        recordUid?: string,
        recordToken?: string,
        customerId: string,
        customerCertificate: string,
    },
};
export type RecordDataType = {startTime?: number, endTime?: number, mediaUrl?: string};

export enum ToolBarPositionEnum {
    top = "top",
    bottom = "bottom",
    left = "left",
    right = "right",
}

export enum PagePreviewPositionEnum {
    left = "left",
    right = "right",
}

export enum ClassModeType {
    lecture = "lecture",
    discuss = "discuss",
}
export type NetlessRoomProps = {
    uuid: string;
    roomToken: string;
    userId: string;
    roomFacadeSetter: RoomFacadeSetter;
    plugins?: any[];
    defaultClassMode?: ClassModeType,
    userName?: string;
    roomName?: string;
    userAvatarUrl?: string;
    isReadOnly?: boolean;
    uploadToolBox?: UploadToolBoxType[],
    toolBarPosition?: ToolBarPositionEnum;
    pagePreviewPosition?: PagePreviewPositionEnum;
    boardBackgroundColor?: string;
    defaultColorArray?: string[];
    identity?: IdentityType;
    colorArrayStateCallback?: (colorArray: string[]) => void;
    roomRenameCallback?: (name: string) => void;
    documentArray?: PPTDataType[];
    logoUrl?: string;
    loadingSvgUrl?: string;
    language?: LanguageEnum;
    clickLogoCallback?: () => void;
    deviceType?: DeviceType;
    rtc?: RtcType;
    roomCallback?: (room: Room) => void;
    exitRoomCallback?: () => void;
    replayCallback?: () => void;
    recordDataCallback?: (data: RecordDataType) => void;
    documentArrayCallback?: (data: PPTDataType[]) => void;
    isManagerOpen?: boolean | null;
    elementId: string;
    ossConfigObj?: OSSConfigObjType;
    ossUploadCallback?: (res: any) => void;
    enableRecord?: boolean;
};
