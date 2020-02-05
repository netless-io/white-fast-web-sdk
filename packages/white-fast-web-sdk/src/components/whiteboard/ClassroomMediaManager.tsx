import * as React from "react";
import {NetlessStream} from "./ClassroomMedia";
import ClassroomMediaCell from "./ClassroomMediaCell";
import "./ClassroomMediaManager.less";
import {ClassModeType, IdentityType, RtcEnum} from "../../pages/NetlessRoomTypes";

export type ClassroomMediaManagerProps = {
    rtcType: RtcEnum;
    streams: NetlessStream[];
    userId: number;
    classMode: ClassModeType;
    identity?: IdentityType;
    rtcClient: any;
    setMemberToStageById: (userId: number) => void;
    setLocalStreamState: (state: boolean) => void;
    isLocalStreamPublish: boolean;
    userAvatarUrl?: string;
};

export type ClassroomMediaManagerStates = {
    mediaLayerDownRef: HTMLDivElement | null;
};

export default class ClassroomMediaManager extends React.Component<ClassroomMediaManagerProps, ClassroomMediaManagerStates> {


    public constructor(props: ClassroomMediaManagerProps) {
        super(props);
        this.state = {
            mediaLayerDownRef: null,
        };
    }

    public getVideoEls(): HTMLVideoElement[] {
        return this.mediaCells.map(mediaCell => {
            return mediaCell ? mediaCell.videoEl : (null as any);
        });
    }

    public mediaCells: ClassroomMediaCell[] = [];
    public videoEls: HTMLVideoElement[] = [];
    private renderMediaCell = (streams: NetlessStream[]): React.ReactNode => {
        const {mediaLayerDownRef} = this.state;
        this.mediaCells = [];
        if (mediaLayerDownRef) {
            return streams.map((stream: NetlessStream, index: number) => {
                return <ClassroomMediaCell setLocalStreamState={this.props.setLocalStreamState}
                                           key={`${stream.getId()}`}
                                           rtcType={this.props.rtcType}
                                           streamIndex={index}
                                           mediaLayerDownRef={mediaLayerDownRef}
                                           classMode={this.props.classMode}
                                           streamsLength={this.props.streams.length}
                                           isLocalStreamPublish={this.props.isLocalStreamPublish}
                                           userId={this.props.userId}
                                           setMemberToStageById={this.props.setMemberToStageById}
                                           rtcClient={this.props.rtcClient}
                                           stream={stream}
                                           ref={(mediaCell: ClassroomMediaCell) => this.mediaCells[index] = mediaCell} />;
            });
        } else {
            return null;
        }
    }
    private getStageStream = (): NetlessStream | null => {
        const {streams, userId} = this.props;
        const streamsLength = streams.length;
        if (streamsLength === 1) {
            return streams[0];
        } else if (streamsLength === 2) {
            const theirStream = streams.find(stream => stream.getId() !== userId);
            if (theirStream) {
                return theirStream;
            } else {
                return null;
            }
        } else {
            // 剩余的情况遵循，有老师显示老师，没老师显示自己。
            const hostStream = streams.find(stream => stream.state.identity === IdentityType.host);
            if (hostStream) {
                return hostStream;
            } else {
                const selfStream = streams.find(stream => stream.getId() === userId);
                if (selfStream) {
                    return selfStream;
                } else {
                    return null;
                }
            }
        }
    }

    private handleMediaArray = (): NetlessStream[] => {
        const {streams} = this.props;
        const stageStream: NetlessStream | null = this.getStageStream();
        if (stageStream) {
            return streams.map(stream => {
                stream.state.isInStage = stream.getId() === stageStream.getId();
                return stream;
            });
        } else {
            return streams;
        }
    }
    private setMediaLayerDownRef = (whiteboardLayerDownRef: HTMLDivElement): void => {
        this.setState({mediaLayerDownRef: whiteboardLayerDownRef});
    }
    public render(): React.ReactNode {
        const streams = this.handleMediaArray();
        return (
            <div ref={this.setMediaLayerDownRef} className="rtc-media-box">
                {this.renderMediaCell(streams)}
            </div>
        );
    }
}
