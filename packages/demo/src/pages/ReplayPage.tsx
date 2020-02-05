import * as React from "react";
import {RouteComponentProps} from "react-router";
import "./WhiteboardPage.less";
import {netlessWhiteboardApi} from "../apiMiddleware";
import WhiteFastSDK from "@netless/white-fast-web-sdk";
export type ReplayPageProps = RouteComponentProps<{
    uuid: string;
    userId: string;
    startTime?: string;
    endTime?: string;
    mediaUrl?: string;
}>;

export type WhiteboardPageState = {
    player: any;
};

export default class ReplayPage extends React.Component<ReplayPageProps, WhiteboardPageState> {
    private netlessPlayer: any;
    public constructor(props: ReplayPageProps) {
        super(props);
        this.state = {
            player: null,
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

    private getDuration = (): number | undefined => {
        const {startTime, endTime} = this.props.match.params;
        if (startTime && endTime) {
            return parseInt(endTime) - parseInt(startTime);
        } else {
            return undefined;
        }
    }

    private startReplay = async (): Promise<void> => {
        const {userId, uuid, startTime, mediaUrl} = this.props.match.params;
        const roomToken = await this.getRoomToken(uuid);
        let url: string | undefined = undefined;
        if (mediaUrl) {
            url = `https://beings.oss-cn-hangzhou.aliyuncs.com/${mediaUrl}`;
        }
        if (roomToken) {
            this.netlessPlayer = WhiteFastSDK.Player("netless-replay", {
                uuid: uuid,
                roomToken: roomToken,
                userId: userId,
                userName: "伍双",
                userAvatarUrl: "https://ohuuyffq2.qnssl.com/netless_icon.png",
                logoUrl: "https://white-sdk.oss-cn-beijing.aliyuncs.com/video/netless_black2.svg",
                boardBackgroundColor: "#F2F2F2",
                clickLogoCallback: () => {
                    this.props.history.push("/");
                },
                playerCallback: (player: any) => {
                    console.log("player", player);
                },
                beginTimestamp: startTime && parseInt(startTime),
                duration: this.getDuration(),
                layoutType: "Side",
                isManagerOpen: true,
                mediaUrl: url,
            });
        }
    }


    public async componentDidMount(): Promise<void> {
        await this.startReplay();
    }
    public componentWillUnmount(): void {
        if (this.netlessPlayer) {
            this.netlessPlayer.release();
        }
    }
    public render(): React.ReactNode {
        return (
            <div id="netless-replay" className="whiteboard-box"/>
        );
    }
}
