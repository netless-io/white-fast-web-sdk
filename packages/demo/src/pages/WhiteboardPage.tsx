import * as React from "react";
import {RouteComponentProps} from "react-router";
import AgoraRTC from "agora-rtc-sdk";
import { ZegoClient } from "webrtc-zego";
import "./WhiteboardPage.less";
import {netlessWhiteboardApi} from "../apiMiddleware";
import WhiteFastSDK from "@netless/white-fast-web-sdk";
import {IdentityType} from "./IndexPage";
export type WhiteboardPageProps = RouteComponentProps<{
    uuid: string;
    userId: string;
    identityType: IdentityType;
}>;

const zegoRtcConfig = {
    type: "zego",
    rtcObj: ZegoClient,
    appId: 1082937486,
    authConfig: {
        token: [0x60, 0x25, 0xbf, 0x4c, 0xe1, 0x10, 0x42, 0xda, 0x3a, 0xa0, 0xf6, 0xab, 0xf8, 0x14, 0x9e, 0xcc, 0x48, 0x8a, 0x34, 0x08, 0x45, 0xac, 0x60, 0x77, 0x25, 0x1c, 0x00, 0x63, 0x4b, 0xc6, 0xd6, 0x9a],
    },
};

const agoraRtcConfig = {
    type: "agora",
    rtcObj: AgoraRTC,
    appId: "8595fd46955f427db44b4e9ba90f015d",
};
const rtcConfig = agoraRtcConfig;

export type WhiteboardPageState = {
    recordData: RecordDataType | null;
    room: any;
    mediaSource?: string;
};
export type RecordDataType = {startTime?: number, endTime?: number, mediaUrl?: string};
export default class WhiteboardPage extends React.Component<WhiteboardPageProps, WhiteboardPageState> {
    private netlessRoom: any;
    public constructor(props: WhiteboardPageProps) {
        super(props);
        this.state = {
            recordData: null,
            room: null,
        };
    }

    private getRoomToken = async (uuid: string): Promise<string | null> => {
        const res = await netlessWhiteboardApi.room.joinRoomApi(uuid);
        if (res.code === 200) {
            return res.msg.roomToken;
        } else {
            return null;
        }
    }


    private handleReplayUrl = (): void => {
        const {userId, uuid} = this.props.match.params;
        const {recordData} = this.state;
        if (recordData) {
            if (recordData.startTime) {
                if (recordData.endTime) {
                    if (recordData.mediaUrl) {
                        this.props.history.push(`/replay/${uuid}/${userId}/${recordData.startTime}/${recordData.endTime}/${recordData.mediaUrl}/`);
                    } else {
                        this.props.history.push(`/replay/${uuid}/${userId}/${recordData.startTime}/${recordData.endTime}/`);
                    }
                } else {
                    this.props.history.push(`/replay/${uuid}/${userId}/${recordData.startTime}/`);
                }
            } else {
                this.props.history.push(`/replay/${uuid}/${userId}/`);
            }
        } else {
            this.props.history.push(`/replay/${uuid}/${userId}/`);
        }
    }

    private startJoinRoom = async (): Promise<void> => {
        const {userId, uuid, identityType} = this.props.match.params;
        const roomToken = await this.getRoomToken(uuid);
        if (roomToken) {
            this.netlessRoom = WhiteFastSDK.Room("whiteboard", {
                uuid: uuid,
                roomToken: roomToken,
                userId: userId,
                // userName: "伍双",
                // roomName: "伍双的房间",
                // userAvatarUrl: "https://ohuuyffq2.qnssl.com/netless_icon.png",
                logoUrl: "https://white-sdk.oss-cn-beijing.aliyuncs.com/video/netless_black2.svg",
               //  loadingSvgUrl: "",
                clickLogoCallback: () => {
                    // this.props.history.push("/");
                },
                exitRoomCallback: () => {
                    this.props.history.push("/");
                },
                recordDataCallback: (data: RecordDataType) => {
                    this.setState({recordData: data});
                },
                replayCallback: () => {
                    this.handleReplayUrl();
                },
                roomCallback: (room: any) => {
                },
                rtc: {
                    ...rtcConfig,
                    recordConfig: {
                        customerId: "b4e2bc22a89549b2a84969b844258fe3",
                        customerCertificate: "594daac9c32b491795f8cbd27a7d5265",
                    },
                },
                identity: identityType, // 老师 "host" 学生 "listener",
                language: "Chinese",
                toolBarPosition: "left",
                isManagerOpen: true,
                documentArray: [
                    {
                        active: false,
                        pptType: "dynamic",
                        id: "1",
                        data: "[{\"name\":\"1\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/1.slide\",\"width\":1280}},{\"name\":\"2\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/2.slide\",\"width\":1280}},{\"name\":\"3\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/3.slide\",\"width\":1280}},{\"name\":\"4\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/4.slide\",\"width\":1280}},{\"name\":\"5\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/5.slide\",\"width\":1280}},{\"name\":\"6\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/6.slide\",\"width\":1280}},{\"name\":\"7\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/7.slide\",\"width\":1280}},{\"name\":\"8\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/8.slide\",\"width\":1280}},{\"name\":\"9\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/9.slide\",\"width\":1280}},{\"name\":\"10\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/10.slide\",\"width\":1280}},{\"name\":\"11\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/11.slide\",\"width\":1280}},{\"name\":\"12\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/12.slide\",\"width\":1280}},{\"name\":\"13\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/13.slide\",\"width\":1280}},{\"name\":\"14\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/14.slide\",\"width\":1280}},{\"name\":\"15\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/15.slide\",\"width\":1280}},{\"name\":\"16\",\"componentsCount\":1,\"ppt\":{\"height\":720,\"src\":\"pptx://white-cover.oss-cn-hangzhou.aliyuncs.com/dynamicConvert/5c822a0a920b4151be66b6eca3b97a45/16.slide\",\"width\":1280}}]",
                    },
                    {
                        active: false,
                        pptType: "static",
                        id: "4",
                        cover: "https://white-sdk.oss-cn-beijing.aliyuncs.com/fast-sdk/icons/cover_3.jpg",
                        data: "[{\"name\":\"1\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/1.png\",\"width\":2666}},{\"name\":\"2\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/2.png\",\"width\":2666}},{\"name\":\"3\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/3.png\",\"width\":2666}},{\"name\":\"4\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/4.png\",\"width\":2666}},{\"name\":\"5\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/5.png\",\"width\":2666}},{\"name\":\"6\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/6.png\",\"width\":2666}},{\"name\":\"7\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/7.png\",\"width\":2666}},{\"name\":\"8\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/8.png\",\"width\":2666}},{\"name\":\"9\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/9.png\",\"width\":2666}},{\"name\":\"10\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/10.png\",\"width\":2666}},{\"name\":\"11\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/11.png\",\"width\":2666}},{\"name\":\"12\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/12.png\",\"width\":2666}},{\"name\":\"13\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/13.png\",\"width\":2666}},{\"name\":\"14\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/14.png\",\"width\":2666}},{\"name\":\"15\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/15.png\",\"width\":2666}},{\"name\":\"16\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/16.png\",\"width\":2666}},{\"name\":\"17\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/17.png\",\"width\":2666}},{\"name\":\"18\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/18.png\",\"width\":2666}},{\"name\":\"19\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/19.png\",\"width\":2666}},{\"name\":\"20\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/20.png\",\"width\":2666}},{\"name\":\"21\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/21.png\",\"width\":2666}},{\"name\":\"22\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/22.png\",\"width\":2666}},{\"name\":\"23\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/23.png\",\"width\":2666}},{\"name\":\"24\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/24.png\",\"width\":2666}},{\"name\":\"25\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/25.png\",\"width\":2666}},{\"name\":\"26\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/26.png\",\"width\":2666}},{\"name\":\"27\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/27.png\",\"width\":2666}},{\"name\":\"28\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/28.png\",\"width\":2666}},{\"name\":\"29\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/29.png\",\"width\":2666}},{\"name\":\"30\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/30.png\",\"width\":2666}},{\"name\":\"31\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/31.png\",\"width\":2666}},{\"name\":\"32\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/32.png\",\"width\":2666}},{\"name\":\"33\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/33.png\",\"width\":2666}},{\"name\":\"34\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/34.png\",\"width\":2666}},{\"name\":\"35\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/35.png\",\"width\":2666}},{\"name\":\"36\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/36.png\",\"width\":2666}},{\"name\":\"37\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/37.png\",\"width\":2666}},{\"name\":\"38\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/38.png\",\"width\":2666}},{\"name\":\"39\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/39.png\",\"width\":2666}},{\"name\":\"40\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/40.png\",\"width\":2666}},{\"name\":\"41\",\"componentsCount\":1,\"ppt\":{\"height\":1500,\"src\":\"https://netless-agora-whiteboard.oss-cn-hangzhou.aliyuncs.com/staticConvert/6c537d1380584f4b82a8b521336fcfbe/41.png\",\"width\":2666}}]",
                    },
                ],
            });
        }
    }


    public async componentDidMount(): Promise<void> {
        await this.startJoinRoom();
    }
    public componentWillUnmount(): void {
        if (this.netlessRoom) {
            this.netlessRoom.release();
        }
    }

    public render(): React.ReactNode {
        return (
            <div id="whiteboard" className="whiteboard-box">
            </div>
        );
    }
}
