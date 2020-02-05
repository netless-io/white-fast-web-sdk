import * as React from "react";
import "./ClassroomMedia.less";
import {Room, ViewMode, RoomState} from "white-web-sdk";
import {Button, Radio, Tooltip, notification, Icon, message} from "antd";
import {GuestUserType, HostUserType} from "../../pages/RoomManager";
import * as set_video from "../../assets/image/set_video.svg";
import * as hangUp from "../../assets/image/hangUp.svg";
import * as menu_in from "../../assets/image/menu_in.svg";
import * as close_white from "../../assets/image/close_white.svg";
import * as microphone_open from "../../assets/image/microphone_open.svg";
import * as microphone_close from "../../assets/image/microphone_close.svg";
import * as camera_open from "../../assets/image/camera_open.svg";
import * as camera_close from "../../assets/image/camera_close.svg";
import ClassroomMediaManager from "./ClassroomMediaManager";
import Identicon from "@netless/identicon";
import {ClassModeType, IdentityType, LanguageEnum, RtcType, RtcEnum} from "../../pages/NetlessRoomTypes";
import {roomStore} from "../../models/RoomStore";
import {observer} from "mobx-react";
import { getEasySDK } from "../../utils/SilverRoom";
import uuid from "uuid";
import { projectStore } from "../../models/ProjectStore";

export type NetlessStream = {
    state: {isAudioOpen: boolean, isVideoOpen: boolean, isInStage: boolean, identity?: IdentityType},
} & any;


export type ClassroomMediaStates = {
    isRtcStart: boolean;
    isMaskAppear: boolean;
    isFullScreen: boolean;
    streams: NetlessStream[];
    isLocalStreamPublish: boolean;
    isRtcLoading: boolean;
    isCameraOpen: boolean;
    isMicrophoneOpen: boolean;
    localStream: NetlessStream;
};

export type ClassroomMediaProps = {
    userId: number;
    channelId: string;
    room: Room;
    isAllMemberAudioClose: boolean,
    classMode: ClassModeType;
    handleManagerState: () => void;
    applyForRtc: boolean;
    isVideoEnable: boolean;
    isAllowHandUp: boolean;
    identity?: IdentityType;
    rtc?: RtcType;
    userAvatarUrl?: string;
    roomState: RoomState;
};

@observer
class ClassroomMedia extends React.Component<ClassroomMediaProps, ClassroomMediaStates> {
    private agoraClient: any;
    private zegoClient: any;
    public classroomMediaManager: ClassroomMediaManager;

    public constructor(props: ClassroomMediaProps) {
        super(props);
        this.state = {
            isRtcStart: false,
            isMaskAppear: false,
            isFullScreen: false,
            streams: [],
            isRtcLoading: false,
            isLocalStreamPublish: false,
            isCameraOpen: false,
            isMicrophoneOpen: false,
            localStream: null,
        };
    }

    public componentDidMount(): void {
        const {userId, identity, rtc} = this.props;
        if (identity !== IdentityType.host && this.props.isVideoEnable) {
            const key = `${Date.now()}`;
            const btn = (
                <Button type="primary" onClick={() => {
                    this.startRtc();
                    notification.close(key);
                }}>
                    确认加入
                </Button>
            );
            if (this.props.classMode === ClassModeType.discuss) {
                notification.open({
                    message: `你好！${userId}`,
                    duration: 8,
                    description:
                        "此教室中老师已经开启视频通讯邀请，请确认是否加入。",
                    icon: <Icon type="smile" style={{ color: "#108ee9" }} />,
                    btn,
                    key,
                    top: 64,
                });
            } else {
                notification.open({
                    message: `你好！${userId}`,
                    duration: 8,
                    description:
                        "此教室中老师已经开启视频授课，请确认是否订阅。",
                    icon: <Icon type="smile" style={{ color: "#108ee9" }} />,
                    btn,
                    key,
                    top: 64,
                });
            }
        }
        roomStore.startRtc = this.startRtc;
        roomStore.stopRtc = this.stopRtc;
        if (rtc && rtc.defaultStart) {
            this.startRtc();
        }
    }

    public componentWillUnmount(): void {
        if (this.zegoClient) {
            this.zegoClient.unInitSDK();
        }
    }
    public UNSAFE_componentWillReceiveProps(nextProps: ClassroomMediaProps): void {
        if (this.props.isVideoEnable !== nextProps.isVideoEnable) {
            if (nextProps.isVideoEnable) {
                this.videoJoinRemind();
            } else {
                notification.close("notification");
                if (this.props.identity !== IdentityType.host) {
                    this.stopRtc();
                }
            }
        }
        if (this.props.classMode !== nextProps.classMode) {
            if (this.props.identity !== IdentityType.host && nextProps.classMode === ClassModeType.lecture) {
                this.unpublishStream(true);
            } else if (this.props.identity === IdentityType.guest &&
                nextProps.classMode === ClassModeType.discuss &&
                !this.state.isLocalStreamPublish && this.props.isVideoEnable) {
                const key = `${Date.now()}`;
                const btn = (
                    <Button type="primary" onClick={() => {
                        if (this.props.rtc) {
                            if (this.state.localStream) {
                                this.publishStream();
                            } else {
                                this.createLocalStream(this.props.userId);
                            }
                        }
                        notification.close(key);
                    }}>
                        确认加入
                    </Button>
                );
                notification.open({
                    message: `你好！${this.props.userId}`,
                    duration: 8,
                    description:
                        "此教室中老师开启自由讨论，请确认是否加入。",
                    icon: <Icon type="smile" style={{ color: "#108ee9" }} />,
                    btn,
                    key,
                    top: 64,
                });
            }
        }

        if (this.props.isAllowHandUp !== nextProps.isAllowHandUp && nextProps.classMode === ClassModeType.lecture &&
            this.props.identity === IdentityType.guest) {
            if (nextProps.isAllowHandUp) {
                message.info("老师开启举手，您可以点击右下角 [举手] 图标申请互动。");
            } else {
                message.info("老师关闭举手。");
            }
        }

        if (this.props.isAllMemberAudioClose !== nextProps.isAllMemberAudioClose) {
            const {localStream} = this.state;
            if (this.props.identity !== IdentityType.host && localStream) {
                const uid = localStream.getId();
                if (nextProps.isAllMemberAudioClose) {
                    localStream.muteAudio();
                    this.setAudioState(uid, false);
                } else {
                    localStream.unmuteAudio();
                    this.setAudioState(uid, true);
                }
            }
        }

        if (this.props.applyForRtc !== nextProps.applyForRtc) {
            const {roomState} = this.props;
            const hostInfo: HostUserType = (roomState.globalState as any).hostInfo;
            if (hostInfo.classMode === ClassModeType.lecture && nextProps.applyForRtc && nextProps.isVideoEnable) {
                const {rtc, userId} = this.props;
                const {localStream} = this.state;
                if (localStream) {
                    this.publishStream();
                } else {
                    this.createLocalStream(userId);
                }
            } else if (hostInfo.classMode === ClassModeType.lecture && !nextProps.applyForRtc) {
                this.unpublishStream(true);
            }
        }
    }
    private videoJoinRemind = (): void => {
        const {userId} = this.props;
        if (this.props.identity !== IdentityType.host && !this.state.isRtcStart) {
            const key = `notification`;
            const btn = (
                <Button type="primary" onClick={() => {
                    this.startRtc();
                    notification.close(key);
                }}>
                    确认加入
                </Button>
            );
            if (this.props.classMode === ClassModeType.discuss) {
                notification.open({
                    message: `你好！${userId}`,
                    duration: 8,
                    description:
                        "此教室中老师已经开启视频通讯邀请，请确认是否加入。",
                    icon: <Icon type="smile" style={{ color: "#108ee9" }} />,
                    btn,
                    key,
                    top: 64,
                });
            } else {
                notification.open({
                    message: `你好！${userId}`,
                    duration: 8,
                    description:
                        "此教室中老师已经开启视频授课，请确认是否订阅。",
                    icon: <Icon type="smile" style={{ color: "#108ee9" }} />,
                    btn,
                    key,
                    top: 64,
                });
            }
        }
    }

    private setLocalStreamState = (state: boolean): void => {
        this.setState({isLocalStreamPublish: state});
    }

    private handleHandup = (classMode: ClassModeType, room: Room, userId?: string): void => {
        const {roomState} = this.props;
        const globalGuestUsers: GuestUserType[] = (roomState.globalState as any).guestUsers;
        const selfHostInfo: HostUserType = (roomState.globalState as any).hostInfo;
        if (userId) {
            if (classMode === ClassModeType.lecture && globalGuestUsers) {
                const users = globalGuestUsers.map((user: GuestUserType) => {
                    if (parseInt(user.userId) === this.props.userId) {
                        user.isHandUp = !user.isHandUp;
                    }
                    return user;
                });
                room.setGlobalState({guestUsers: users});
            }
        } else {
            if (classMode !== ClassModeType.discuss && globalGuestUsers) {
                const users = globalGuestUsers.map((user: GuestUserType) => {
                    user.isHandUp = false;
                    user.isReadOnly = true;
                    user.cameraState = ViewMode.Follower;
                    user.disableCameraTransform = true;
                    return user;
                });
                selfHostInfo.cameraState = ViewMode.Broadcaster;
                selfHostInfo.disableCameraTransform = false;
                room.setGlobalState({guestUsers: users, hostInfo: selfHostInfo});
            } else if (classMode === ClassModeType.discuss && globalGuestUsers) {
                const users = globalGuestUsers.map((user: GuestUserType) => {
                    user.isHandUp = false;
                    user.isReadOnly = false;
                    user.cameraState = ViewMode.Freedom;
                    user.disableCameraTransform = false;
                    return user;
                });
                selfHostInfo.cameraState = ViewMode.Freedom;
                selfHostInfo.disableCameraTransform = false;
                room.setGlobalState({guestUsers: users, hostInfo: selfHostInfo});
            }
        }
    }

    private renderHostController = (hostInfo: HostUserType): React.ReactNode => {
        const {room, roomState} = this.props;
        const guestUsers: GuestUserType[] = (roomState.globalState as any).guestUsers;
        if (hostInfo.classMode) {
            if (this.props.identity === IdentityType.host) {
                return (
                    <Radio.Group buttonStyle="solid" size={"small"} style={{marginTop: 6, fontSize: 12}} value={hostInfo.classMode} onChange={evt => {
                        this.handleHandup(evt.target.value, room);
                        if (hostInfo.classMode === ClassModeType.lecture) {
                            room.setGlobalState({hostInfo: {...hostInfo, classMode: evt.target.value}});
                        } else {
                            room.setGlobalState({hostInfo: {...hostInfo, classMode: evt.target.value}, guestUsers: guestUsers});
                        }
                    }}>
                        <Radio.Button value={ClassModeType.lecture}>{projectStore.isEnglish() ? "Lecture" : "讲课模式"}</Radio.Button>
                        <Radio.Button value={ClassModeType.discuss}>{projectStore.isEnglish() ? "Interactive" : "自由互动"}</Radio.Button>
                    </Radio.Group>
                );
            } else {
                if (projectStore.isEnglish()) {
                    return (
                        <div style={{marginTop: 6, color: "white"}}>Class mode: {this.handleModeText(hostInfo.classMode)}</div>
                    );
                } else {
                    return (
                        <div style={{marginTop: 6, color: "white"}}>模式：{this.handleModeText(hostInfo.classMode)}</div>
                    );
                }
            }
        } else {
            return null;
        }
    }

    private renderHandUpController = (hostInfo: HostUserType): React.ReactNode => {
        const {room} = this.props;
        if (hostInfo.classMode) {
            if (this.props.identity === IdentityType.host && hostInfo.classMode === ClassModeType.lecture) {
                return (
                    <Radio.Group
                        buttonStyle="solid"
                        size={"small"}
                        style={{marginTop: 12, fontSize: 12}}
                        value={hostInfo.isAllowHandUp}
                        onChange={evt => {
                            this.handleHandup(evt.target.value, room);
                            room.setGlobalState({hostInfo: {...hostInfo, isAllowHandUp: evt.target.value}});
                        }}
                    >
                        <Radio.Button value={true}>{"允许举手"}</Radio.Button>
                        <Radio.Button value={false}>{"禁止举手"}</Radio.Button>
                    </Radio.Group>
                );
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    private handleModeText = (classMode: ClassModeType) => {
        switch (classMode) {
            case ClassModeType.discuss: {
                if (projectStore.isEnglish()) {
                    return "Interactive";
                } else {
                    return "自由讨论";
                }
            }
            case ClassModeType.lecture: {
                if (projectStore.isEnglish()) {
                    return "Lecture";
                } else {
                    return "讲课模式";
                }
            }
            default: {
                if (projectStore.isEnglish()) {
                    return "Hand Up";
                } else {
                    return "举手问答";
                }
            }
        }
    }

    private renderRtcBtn = (): React.ReactNode => {
        const {rtc, roomState, identity} = this.props;
        const hostInfo: HostUserType = (roomState.globalState as any).hostInfo;
        if (rtc) {
            if (hostInfo.classMode === ClassModeType.discuss) {
                if (identity === IdentityType.listener && !hostInfo.isVideoEnable) {
                    return null;
                }
                return (
                    <div className="manager-box-btn">
                        {this.state.isRtcLoading ?
                            <Button style={{fontSize: 16}} type="primary" shape="circle" icon="loading"/>
                            :
                            <Tooltip placement={"right"} title={projectStore.isEnglish() ? "Start video call" : "开启音视频通信"}>
                                <Button onClick={() => this.startRtc()} style={{fontSize: 16}} type="primary" shape="circle" icon="video-camera"/>
                            </Tooltip>
                        }
                    </div>
                );
            } else {
                if (identity === IdentityType.host) {
                    return (
                        <div className="manager-box-btn">
                            {this.state.isRtcLoading ?
                                <Button style={{fontSize: 16}} type="primary" shape="circle" icon="loading"/>
                                :
                                <Tooltip placement={"right"} title={projectStore.isEnglish() ? "Start video call" : "开启音视频通信"}>
                                    <Button onClick={() => this.startRtc()} style={{fontSize: 16}} type="primary" shape="circle" icon="video-camera"/>
                                </Tooltip>
                            }
                        </div>
                    );
                } else {
                    if (hostInfo.isVideoEnable) {
                        return (
                            <div className="manager-box-btn">
                                {this.state.isRtcLoading ?
                                    <Button style={{fontSize: 16}} type="primary" shape="circle" icon="loading"/>
                                    :
                                    <Tooltip placement={"right"} title={projectStore.isEnglish() ? "Start video call" : "开启音视频通信"}>
                                        <Button onClick={() => this.startRtc()} style={{fontSize: 16}} type="primary" shape="circle" icon="video-camera"/>
                                    </Tooltip>
                                }
                            </div>
                        );
                    } else {
                        return null;
                    }
                }
            }
        } else {
            return null;
        }
    }

    private renderHost = (): React.ReactNode => {
        const {roomState, handleManagerState} = this.props;
        const hostInfo: HostUserType = (roomState.globalState as any).hostInfo;
        if (hostInfo) {
            return (
                <div className="manager-box-inner-host">
                    {this.renderRtcBtn()}
                    <div className="manager-box-btn-right">
                        <Tooltip placement={"left"} title={projectStore.isEnglish() ? "Hide sidebar" : "隐藏侧边栏"}>
                            <div onClick={() => handleManagerState()} className="manager-box-btn-right-inner">
                                <img src={menu_in}/>
                            </div>
                        </Tooltip>
                    </div>
                    <div className="manager-box-image">
                        {hostInfo.avatar ? <img src={hostInfo.avatar}/> :
                            <Identicon
                                className={`avatar-${hostInfo.userId}`}
                                size={60}
                                string={hostInfo.userId}/>
                        }
                    </div>
                    {projectStore.isEnglish() ?
                        <div className="manager-box-text">Teacher: {hostInfo.name ? hostInfo.name : hostInfo.userId}</div> :
                        <div className="manager-box-text">老师：{hostInfo.name ? hostInfo.name : hostInfo.userId}</div>
                    }
                    {this.renderHostController(hostInfo)}
                    {this.renderHandUpController(hostInfo)}
                </div>
            );
        } else {
            return null;
        }
    }

    private switchCamera = (): void => {
        const { rtc } = this.props;
        if (rtc && rtc.type === "zego") {
            const els = this.classroomMediaManager.getVideoEls();
            if (els && els[0]) {
                let { isCameraOpen } = this.state;
                isCameraOpen = !isCameraOpen;
                this.zegoClient.enableCamera(els[0], isCameraOpen);
                this.setState({isCameraOpen});
            }
            return;
        }

        const {localStream} = this.state;
        if (localStream) {
            const uid = localStream.getId();
            if (this.state.isCameraOpen) {
                const isVideoMute = localStream.muteVideo();
                this.setVideoState(uid, false);
                if (isVideoMute) {
                    this.setState({isCameraOpen: false});
                } else {
                    message.warning("关闭摄像头失败");
                }
            } else {
                const isVideoMute = localStream.unmuteVideo();
                this.setVideoState(uid, true);
                if (isVideoMute) {
                    this.setState({isCameraOpen: true});
                } else {
                    message.warning("打开摄像头失败");
                }
            }

        }
    }

    private switchMicrophone = (): void => {
        const { rtc } = this.props;
        if (rtc && rtc.type === "zego") {
            const els = this.classroomMediaManager.getVideoEls();
            if (els && els[0]) {
                let { isMicrophoneOpen } = this.state;
                isMicrophoneOpen = !isMicrophoneOpen;
                this.zegoClient.enableMicrophone(els[0], isMicrophoneOpen);
                this.setState({isMicrophoneOpen});
            }
            return;
        }

        const {localStream} = this.state;
        if (localStream) {
            const uid = localStream.getId();
            if (this.state.isMicrophoneOpen) {
                const isAudioMute = localStream.muteAudio();
                this.setAudioState(uid, false);
                if (isAudioMute) {
                    this.setState({isMicrophoneOpen: false});
                } else {
                    message.warning("关闭麦克风失败");
                }
            } else {
                const isAudioMute = localStream.unmuteAudio();
                this.setAudioState(uid, true);
                if (isAudioMute) {
                    this.setState({isMicrophoneOpen: true});
                } else {
                    message.warning("打开麦克风失败");
                }
            }

        }
    }

    private renderSetIcon = (): React.ReactNode => {
        return (
            <div onClick={() => {
                this.setState({isMaskAppear: !this.state.isMaskAppear});
            }} className="netless-set-icon">
                {this.state.isMaskAppear ? <img style={{width: 14}} src={close_white}/> : <img style={{width: 26}} src={set_video}/>}
            </div>
        );
    }

    private renderJoinVideoIcon = (): React.ReactNode => {
        const {rtc, userId, identity, classMode} = this.props;
        if (this.state.isRtcStart && rtc) {
            if (identity === IdentityType.guest && classMode === ClassModeType.discuss && !this.state.isLocalStreamPublish) {
                return (
                    <div className="join-video-icon">
                        {this.state.isRtcLoading ?
                            <Button style={{fontSize: 16}} type="primary" shape="circle" icon="loading"/>
                            :
                            <Tooltip placement={"right"} title={projectStore.isEnglish() ? "Join video call" : "参与音视频互动"}>
                                <Button onClick={() => {
                                    if (this.state.localStream) {
                                        this.publishStream();
                                    } else {
                                        this.createLocalStream(userId);
                                    }
                                }} style={{fontSize: 16}} type="primary" shape="circle" icon="video-camera"/>
                            </Tooltip>
                        }
                    </div>
                );
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    private setUpCassroomMediaManagerRef (ref: any): void {
        this.classroomMediaManager = ref;
    }

    public render(): React.ReactNode {
        const {roomState} = this.props;
        const hostInfo: HostUserType = (roomState.globalState as any).hostInfo;
        return (
            <div className="netless-video-out-box">
               {!this.state.isRtcStart &&
               <div className="netless-video-mask">
                   {this.renderHost()}
               </div>}
               <div className="netless-video-box">
                   {this.renderSetIcon()}
                   {this.renderJoinVideoIcon()}
                   {this.state.isMaskAppear &&
                   <div className="classroom-box-video-mask">
                       <div className="manager-box-inner-host2">
                           <div className="manager-box-btn">
                               <Tooltip placement={"right"} title={projectStore.isEnglish() ? "Close video call" : "关闭视频"}>
                                   <div className="manager-box-btn-hang" onClick={() => {
                                       if (roomStore.isRecording && this.props.identity === IdentityType.host) {
                                           const key = `rtc-close`;
                                           const btn = (
                                               <Button type="primary" onClick={() => {
                                                   if (roomStore.stopRecord) {
                                                       roomStore.stopRecord();
                                                   }
                                                   this.stopRtc();
                                                   notification.close(key);
                                               }}>
                                                   停止录制并关闭
                                               </Button>
                                           );
                                           notification.open({
                                               message: `关闭 RTC 提醒`,
                                               duration: 6,
                                               description:
                                                   "您正开启录制服务，关闭 RTC 之前请先停止录制。否则视频和白板会录制时长不统一。",
                                               icon: <Icon type="smile" style={{ color: "#108ee9" }} />,
                                               btn,
                                               key,
                                               top: 64,
                                           });
                                       } else {
                                           this.stopRtc();
                                       }
                                   }}>
                                       <img src={hangUp}/>
                                   </div>
                               </Tooltip>
                           </div>
                           <div className="manager-box-image">
                               {hostInfo.avatar ? <img src={hostInfo.avatar}/> :
                                   <Identicon
                                       className={`avatar-${hostInfo.userId}`}
                                       size={60}
                                       string={hostInfo.userId}/>
                               }
                           </div>
                           {projectStore.isEnglish() ?
                               <div className="manager-box-text">Teacher: {hostInfo.name ? hostInfo.name : hostInfo.userId}</div> :
                               <div className="manager-box-text">老师：{hostInfo.name ? hostInfo.name : hostInfo.userId}</div>
                           }
                           {this.renderHostController(hostInfo)}
                           {this.renderHandUpController(hostInfo)}
                           <div className="classroom-box-video-set-box">
                               <div onClick={() => {
                                   this.switchMicrophone();
                               }} className="classroom-box-video-set">
                                   {this.state.isMicrophoneOpen ? <img style={{width: 14}} src={microphone_open}/> : <img style={{width: 14}} src={microphone_close}/>}
                               </div>
                               <div onClick={() => {
                                   this.switchCamera();
                               }} className="classroom-box-video-set">
                                   {this.state.isCameraOpen ? <img style={{width: 19}} src={camera_open}/> : <img style={{width: 19}} src={camera_close}/>}
                               </div>
                           </div>
                       </div>
                   </div>}
                   <ClassroomMediaManager
                        ref={this.setUpCassroomMediaManagerRef.bind(this)}
                        rtcType={this.props.rtc!.type as RtcEnum}
                        rtcClient={this.agoraClient}
                        isLocalStreamPublish={this.state.isLocalStreamPublish}
                        setMemberToStageById={this.setMemberToStageById}
                        userId={this.props.userId}
                        setLocalStreamState={this.setLocalStreamState}
                        classMode={this.props.classMode}
                        streams={this.state.streams}
                    />
               </div>
            </div>
        );
    }


    private setMediaState = (state: boolean): void => {
        const {room, identity, roomState} = this.props;
        if (identity === IdentityType.host) {
            room.setGlobalState({hostInfo: {
                    ...(roomState.globalState as any).hostInfo,
                    isVideoEnable: state,
                }});
        }
    }

    private startRtc = async () => {
        const {rtc, classMode, userId, channelId, identity} = this.props;
        if (rtc) {
            let token: string | number[] = "";
            let channel: string = channelId;
            const {rtcObj} = rtc;
            if (rtc.channel) {
                channel = rtc.channel;
            }
            if (rtc.authConfig !== undefined) {
                token = rtc.authConfig.token;
            }
            const appId = rtc.appId;
            // 按钮 loading
            if (!rtcObj) { return; }
            this.setState({isRtcLoading: true});

            switch (rtc.type) {
                case "agora": {
                    // 初始化
                    const AgoraRTC = rtcObj;
                    if (!this.agoraClient) {
                        this.agoraClient = AgoraRTC.createClient({mode: "live", codec: "h264"});
                    }
                    this.addRtcListeners(this.agoraClient);
                    this.agoraClient.init(appId, () => {
                        console.log("AgoraRTC client initialized");
                        this.agoraClient.join(token, channel, userId, (uid: number) => {
                            console.log("User " + uid + " join channel successfully");
                            // 创建本地流对象
                            if (identity === IdentityType.host) {
                                this.createLocalStream(userId, identity);
                            } else if (identity === IdentityType.guest) {
                                if (classMode === ClassModeType.discuss) {
                                    this.createLocalStream(userId);
                                } else {
                                    this.setMediaState(true);
                                    this.setState({isRtcStart: true, isRtcLoading: false});
                                }
                            } else {
                                this.setMediaState(true);
                                this.setState({isRtcStart: true, isRtcLoading: false});
                            }
                            // 添加监听
                        }, (err: any) => {
                            console.log(err);
                        });
                    }, (err: any) => {
                        console.log("AgoraRTC client init failed", err);
                    });
                }
                case "zego": {
                    if (!this.zegoClient) {
                        const ZegoClient = getEasySDK(rtcObj);
                        const zegoClient = new ZegoClient();
                        this.zegoClient = zegoClient;
                    }
                    const { zegoClient } = this;
                    await zegoClient.initSDK({ appId, signKey: token as number[] });
                    const streams = await zegoClient.join({ roomId: channelId.toString(), userId: userId.toString() });
                    this.setMediaState(true);
                    this.addZegoListeners();
                    this.setState({ isRtcStart: true, isRtcLoading: false, streams: streams ? streams.map((t: any) => this.convertZegoStream(t)) : [] }, () => {
                        this.createLocalStream(userId, streams);
                    });
                    roomStore.isRtcOpen = true;
                }
                default: {
                    break;
                }
            }
        } else {
            message.warning("请添加 rtc 配置，否则无法开启");
        }
    }

    private stopRtc = (): void => {
        const { rtc } = this.props;
        if (!rtc) { return; }
        switch (rtc.type) {
            case "agora": {
                if (this.agoraClient) {
                    const {localStream} = this.state;
                    this.unpublishStream();
                    this.agoraClient.leave(() => {
                        this.setState({streams: [], isRtcStart: false, isMaskAppear: false});
                        roomStore.isRtcOpen = false;
                        this.setMediaState(false);
                        if (localStream) {
                            if (localStream.isPlaying()) {
                                localStream.stop();
                            }
                            localStream.close();
                        }
                        console.log("client leaves channel success");
                    }, (err: any) => {
                        console.log("channel leave failed");
                        console.error(err);
                    });
                    this.agoraClient = undefined;
                }
                break;
            }
            case "zego": {
                if (this.zegoClient) {
                    this.zegoClient.unInitSDK();
                    this.setState({streams: [], isRtcStart: false, isMaskAppear: false, localStream: null});
                    roomStore.isRtcOpen = false;
                }
                break;
            }
            default: {
                break;
            }
        }
    }

    private unpublishStream = (isLocalStop?: boolean): void => {
        const {localStream} = this.state;
        if (localStream) {
            if (this.state.isLocalStreamPublish) {
                this.agoraClient.unpublish(localStream, (err: any) => {
                    console.log("unpublish failed");
                    console.error(err);
                });
                this.setState({isLocalStreamPublish: false});
            }
            if (isLocalStop) {
                localStream.stop();
                localStream.close();
                this.removeStream(localStream);
                this.setState({localStream: null});
            }
        }
    }

    private publishStream = (): void => {
        const {localStream} = this.state;
        if (localStream) {
            if (!this.state.isLocalStreamPublish) {
                this.agoraClient.publish(localStream, (err: any) => {
                    console.log("publish failed");
                    console.error(err);
                });
                this.setState({isLocalStreamPublish: true});
            }
        }
    }

    private createLocalStream = (userId: number, identity?: IdentityType): void => {
        const { rtc } = this.props;
        if (!rtc) { return; }
        const { rtcObj, type } = rtc as RtcType;
        switch (type) {
            case "agora": {
                // 创建本地流对象
                const localStream = rtcObj.createStream({
                    streamID: userId,
                    audio: true,
                    video: true,
                });
                // 初始化本地流
                localStream.init(()  => {
                    console.log("getUserMedia successfully");
                    this.setMediaState(true);
                    this.addStream(localStream);
                    this.setState({
                        isRtcStart: true,
                        isRtcLoading: false,
                        isCameraOpen: true,
                        isMicrophoneOpen: true,
                        localStream: localStream});
                    if (identity === IdentityType.host) {
                        roomStore.isRtcOpen = true;
                    }
                }, (err: any) => {
                    console.log("getUserMedia failed", err);
                });
                break;
            }
            case "zego": {
                this.addStream({});
                const { zegoClient } = this;
                this.setState({
                    isRtcStart: true,
                    isRtcLoading: false,
                    isCameraOpen: true,
                    isMicrophoneOpen: true,
                    localStream: {},
                }, async () => {
                    const els = this.classroomMediaManager.getVideoEls();
                    if (els && els[0]) {
                        await zegoClient.startPreview(els[0]);
                        const res = await zegoClient.publish();
                        console.log("publish--------------------------");
                    }
                    this.playZegoRemoteStreams();
                });
                // 创建本地流对象
                break;
            }
            default: {
                break;
            }
        }
    }

    private getStreamIdentity = (userId: number): IdentityType => {
        const {roomState} = this.props;
        const roomMember = roomState.roomMembers.find((roomMember: any) => {
            if (roomMember.payload && roomMember.payload.userId !== undefined) {
                if (parseInt(roomMember.payload.userId) === userId) {
                    return roomMember;
                }
            }
        });
        if (roomMember) {
            return roomMember.payload.identity;
        } else {
            return IdentityType.listener;
        }
    }

    private addStream = (stream: any): void => {
        if (stream) {
            if (!stream.getId) {
                const id = uuid.v4();
                stream.getId = () => id;
            }
            let originalStreamArray = this.state.streams;
            stream.state = {
                isVideoOpen: true,
                isAudioOpen: true,
                isInStage: false,
                identity: this.getStreamIdentity(stream.getId()),
            };
            if (originalStreamArray.length > 0) {
                originalStreamArray = [stream, ...originalStreamArray];
            } else {
                originalStreamArray.push(stream);
            }
            this.setState({streams: originalStreamArray});
        }
    }

    private setMemberToStageById = (userId: number): void => {
        const originalStreamArray = this.state.streams;
        const newStreams: NetlessStream[] = originalStreamArray.map(originalStream => {
            originalStream.isInStage = originalStream.getId() === userId;
            return originalStream;
        });
        this.setState({streams: newStreams});
    }

    private removeStream = (stream: any): void => {
        if (stream) {
            const originalStreamArray = this.state.streams;
            const newStream = originalStreamArray.filter(originalStream => {
                return stream.getId() !== originalStream.getId();
            });
            this.setState({streams: newStream});
        }
    }

    private setVideoState = (uid: number, state: boolean): void => {
        const streams = this.state.streams.map(data => {
            if (data.getId() === uid) {
                data.state.isVideoOpen = state;
            }
            return data;
        });
        this.setState({streams: streams});
    }
    private setAudioState = (uid: number, state: boolean): void => {
        const streams = this.state.streams.map(data => {
            if (data.getId() === uid) {
                data.state.isAudioOpen = state;
            }
            return data;
        });
        this.setState({streams: streams});
    }

    private convertZegoStream = (stream: any) => {
        stream.state = {
            isVideoOpen: true,
            isAudioOpen: true,
            isInStage: true,
            identity: "listener",
        };
        stream.getId = () => stream.stream_id;

        return stream;
    }
    private playZegoRemoteStreams = () => {
        const els = this.classroomMediaManager.getVideoEls();
        const { zegoClient, state: { streams } } = this;
        zegoClient.playStreams(streams.slice(1).map((stream, index) => ({ streamId: stream.stream_id, viewEl: els[index + 1] })));
    }
    private addZegoListeners = () => {
        const { zegoClient } = this;
        zegoClient.handleStreamsUpdate = (streamList: any[]) => {
            const { state: { streams, localStream } } = this;
            if (streamList) {
                const newStreams = [...(localStream ? [streams[0]] : []), ...streamList.map(t => this.convertZegoStream(t))];
                console.log(newStreams);
                this.setState({
                    streams: newStreams,
                }, () => {
                    this.playZegoRemoteStreams();
                });
            }
        };
    }

    private addRtcListeners = (rtcClient: any): void => {
        // 监听
        rtcClient.on("stream-published", () => {
            console.log("Publish local stream successfully");
        });
        rtcClient.on("stream-added",  (evt: any) => {
            const stream = evt.stream;
            console.log("New stream added: " + stream.getId());
            rtcClient.subscribe(stream);
        });
        rtcClient.on("stream-removed",  (evt: any) => {
            const stream = evt.stream;
            this.removeStream(stream);
        });
        rtcClient.on("stream-subscribed", (evt: any) => {
            const stream = evt.stream;
            this.addStream(stream);
            console.log("Subscribe remote stream successfully: " + stream.getId());
        });
        rtcClient.on("peer-leave", (evt: any) => {
            const stream = evt.stream;
            this.removeStream(stream);
            console.log("remote user left ", evt.uid);
        });

        rtcClient.on("mute-video", (evt: any) => {
            const uid = evt.uid;
            this.setVideoState(uid, false);
        });
        rtcClient.on("unmute-video", (evt: any) => {
            const uid = evt.uid;
            this.setVideoState(uid, true);
        });
        rtcClient.on("mute-audio", (evt: any) => {
            const uid = evt.uid;
            this.setAudioState(uid, false);
        });
        rtcClient.on("unmute-audio", (evt: any) => {
            const uid = evt.uid;
            this.setAudioState(uid, true);
        });
    }

}

export default ClassroomMedia;
