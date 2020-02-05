import * as React from "react";
import "./ClassroomMediaManager.less";
import {NetlessStream} from "./ClassroomMedia";
import * as microphone_open from "../../assets/image/microphone_open.svg";
import * as microphone_close from "../../assets/image/microphone_close.svg";
import Identicon from "../../tools/identicon/Identicon";
import {ClassModeType, RtcEnum} from "../../pages/NetlessRoomTypes";
import {roomStore} from "../../models/RoomStore";
export type ClassroomManagerCellProps = {
    rtcType: RtcEnum;
    stream: NetlessStream;
    userId: number;
    rtcClient: any;
    streamsLength: number;
    streamIndex: number
    userAvatarUrl?: string;
    setMemberToStageById: (userId: number) => void;
    classMode: ClassModeType;
    setLocalStreamState: (state: boolean) => void;
    isLocalStreamPublish: boolean;
    mediaLayerDownRef: HTMLDivElement;
};

export default class ClassroomMediaCell extends React.Component<ClassroomManagerCellProps, {}> {
    public constructor(props: ClassroomManagerCellProps) {
        super(props);
    }
    public videoEl: HTMLVideoElement;

    public async componentDidMount(): Promise<void> {
        const {stream} = this.props;
        await this.startStream(stream);
        roomStore.releaseMedia = this.release;
    }

    private startStream = (stream: NetlessStream): void => {
        switch (this.props.rtcType) {
            case "agora": {
                const streamId = stream.getId();
                this.publishLocalStream(stream);
                stream.play(`netless-${streamId}`);
                break;
            }
            default: {
                break;
            }
        }
    }

    private release = (): void => {
        const {stream} = this.props;
        this.stopStream(stream);
    }

    public componentWillUnmount(): void {
        this.release();
    }

    private stopStream = (stream: NetlessStream): void => {
        switch (this.props.rtcType) {
            case "agora": {
                if (stream.isPlaying()) {
                    stream.stop();
                }
                break;
            }
            default: {
                break;
            }
        }
    }

    private renderStageStyle = (): any => {
        const {streamsLength, mediaLayerDownRef} = this.props;
        const {clientWidth, clientHeight} = mediaLayerDownRef;
        if (streamsLength <= 2) {
            return {width: clientWidth, height: clientHeight};
        } else if (streamsLength > 4 && streamsLength < 6) {
            return {width: clientWidth, height: (0.75 * clientHeight)};
        } else {
            return {width: clientWidth, height: (0.7 * clientHeight)};
        }
    }
    private renderStyle = (): any => {
        const {streamsLength, streamIndex, mediaLayerDownRef} = this.props;
        const {clientWidth, clientHeight} = mediaLayerDownRef;
        const index = streamIndex - 1;
        if (streamsLength === 2) {
            return {width: (0.3 * clientWidth), height: (0.3 * clientHeight)};
        } else if (streamsLength === 3) {
            return {width: (0.5 * clientWidth), height: (0.3 * clientHeight), left: (index * (0.5 * clientWidth))};
        } else if (streamsLength === 4) {
            return {width: (clientWidth / 3), height: (0.3 * clientHeight), left: (index * (clientWidth / 3))};
        } else if (streamsLength === 5) {
            return {width: (0.25 * clientWidth), height: (0.25 * clientHeight), left: (index * (0.25 * clientWidth))};
        } else {
            if (streamIndex >= 4) {
                return {width: (0.25 * clientWidth), height: (0.25 * clientHeight), left: ((index - 4) * (0.25 * clientWidth)), bottom: (0.25 * clientHeight)};
            } else {
                return {width: (0.25 * clientWidth), height: (0.25 * clientHeight), left: (index * (0.25 * clientWidth))};
            }
        }
    }

    private publishLocalStream = (stream: NetlessStream): void => {
        const {userId, rtcClient} = this.props;
        const streamId = stream.getId();
        if (streamId === userId && !this.props.isLocalStreamPublish && rtcClient !== undefined) {
            rtcClient.publish(stream, (err: any) => {
                console.log("publish failed");
                console.error(err);
            });
            this.props.setLocalStreamState(true);
        }
    }

    private handleClickVideo = (userId: number): void => {
        this.props.setMemberToStageById(userId);
    }

    private renderStageAvatar = (): React.ReactNode => {
        const {userAvatarUrl, userId, stream} = this.props;
        const size = this.renderStageStyle();
        if (userAvatarUrl) {
            return <div className="rtc-media-avatar-image">
                <img src={userAvatarUrl}/>
            </div>;
        } else {
            return <div className="rtc-media-avatar-image">
                <Identicon
                    className="rtc-media-stage-image-avatar"
                    size={size.width}
                    string={`${stream.getId()}`}/>
            </div>;
        }
    }

    private renderAvatar = (): React.ReactNode => {
        const {userAvatarUrl, stream} = this.props;
        const size = this.renderStyle();
        if (userAvatarUrl) {
            return <div className="rtc-media-avatar-image">
                <img src={userAvatarUrl}/>
            </div>;
        } else {
            return <div className="rtc-media-avatar-image">
                <Identicon
                    className="rtc-media-stage-image-avatar"
                    size={size.width}
                    string={`${stream.getId()}`}/>
            </div>;
        }
    }

    private zegoSDKDetect = () => this.props.rtcType === "zego";
    private agoraSDKDetect = () => this.props.rtcType === "agora";

    private setUpVideoRef (ref: HTMLVideoElement): void {
        this.videoEl = ref;
    }
    public render(): React.ReactNode {
        const {stream, rtcType, isLocalStreamPublish} = this.props;
        const isZegoSDK = this.zegoSDKDetect();
        const isAgoraSDK = this.agoraSDKDetect();

        const zegoVideoNode = <video
            ref={this.setUpVideoRef.bind(this)}
            autoPlay
            playsInline
            onClick={() => this.handleClickVideo(streamId)}
            style={{ objectFit: "cover", background: "#000" }}
            className="rtc-media-cell-box"
            muted={isLocalStreamPublish}
        />;
        const streamId = {
            "zego": stream.streamId,
            "agora": stream.getId(),
        }[rtcType] || "";

        if (stream.state.isInStage) {
            return (
                <div className="rtc-media-stage-out-box" style={this.renderStageStyle()}>
                    <div className="rtc-media-stage-mid-box">
                        <div className="rtc-media-stage-icon">
                            {stream.state.isAudioOpen ? <img src={microphone_open}/> : <img src={microphone_close}/>}
                        </div>
                        {!stream.state.isVideoOpen && this.renderStageAvatar()}
                        {isAgoraSDK && <div id={`netless-${streamId}`} className="rtc-media-stage-box" />}
                        {isZegoSDK && zegoVideoNode}
                    </div>
                </div>
            );
        } else {
            return (
                <div className="rtc-media-cell-out-box" style={this.renderStyle()}>
                    <div className="rtc-media-cell-mid-box">
                        <div className="rtc-media-cell-icon">
                            {stream.state.isAudioOpen ? <img src={microphone_open}/> : <img src={microphone_close}/>}
                        </div>
                        {!stream.state.isVideoOpen && this.renderAvatar()}
                        {isAgoraSDK && <div id={`netless-${streamId}`} onClick={() => this.handleClickVideo(streamId)} className="rtc-media-cell-box" />}
                        {isZegoSDK && zegoVideoNode}
                    </div>
                </div>
            );
        }
    }
}
