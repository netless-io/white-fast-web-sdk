import * as React from "react";
import {Badge, Tabs, Icon} from "antd";
import "./WhiteboardManager.less";
import {Room, ViewMode, RoomState} from "white-web-sdk";
import {GuestUserType, HostUserType} from "../../pages/RoomManager";
import speak from "../../assets/image/speak.svg";
import user_empty from "../../assets/image/user_empty.svg";
import raise_hands_active from "../../assets/image/raise_hands_active.svg";
import WhiteboardChat from "./WhiteboardChat";
import {MessageType} from "./WhiteboardBottomRight";
import ClassroomMedia from "./ClassroomMedia";
import Identicon from "@netless/identicon";
import {ClassModeType, IdentityType, LanguageEnum, RtcType} from "../../pages/NetlessRoomTypes";
import { observer } from "mobx-react";
import { projectStore } from "../../models/ProjectStore";
const { TabPane } = Tabs;

export type WhiteboardManagerProps = {
    room: Room;
    userId: string;
    handleManagerState: () => void;
    isManagerOpen: boolean | null;
    isChatOpen: boolean;
    uuid: string;
    hostInfo?: HostUserType,
    cameraState?: ViewMode;
    disableCameraTransform?: boolean;
    identity?: IdentityType;
    userName?: string;
    userAvatarUrl?: string;
    rtc?: RtcType;
    elementId: string;
    roomState: RoomState;
};

export type WhiteboardManagerStates = {
    activeKey: string;
    messages: MessageType[];
    seenMessagesLength: number,
    isRtcReady: boolean,
};

@observer
class WhiteboardManager extends React.Component<WhiteboardManagerProps, WhiteboardManagerStates> {
    public constructor(props: WhiteboardManagerProps) {
        super(props);
        this.state = {
            activeKey: "1",
            messages: [],
            seenMessagesLength: 0,
            isRtcReady: false,
        };
    }

    public UNSAFE_componentWillReceiveProps(nextProps: WhiteboardManagerProps): void {
        if (this.props.cameraState !== undefined && this.props.disableCameraTransform !== undefined && nextProps.cameraState !== undefined && nextProps.disableCameraTransform !== undefined) {
           if (this.props.cameraState !== nextProps.cameraState) {
               this.props.room.setViewMode(nextProps.cameraState);
               this.props.room.disableCameraTransform = nextProps.disableCameraTransform;
           }
        }
        if (this.props.isChatOpen !== nextProps.isChatOpen) {
            if (nextProps.isChatOpen) {
                this.setState({activeKey: "1"});
            } else {
                this.setState({activeKey: "2"});
            }
        }
    }

    public componentDidMount(): void {
        this.props.room.addMagixEventListener("message",  (event: any) => {
            this.setState({messages: [...this.state.messages, event.payload]});
        });
    }

    private renderHost = (): React.ReactNode => {
        const {userId, roomState} = this.props;
        const hostInfo: HostUserType = (roomState.globalState as any).hostInfo;
        if (hostInfo) {
            if (userId === hostInfo.userId) {
                return (
                    <ClassroomMedia isVideoEnable={hostInfo.isVideoEnable}
                                    applyForRtc={false}
                                    roomState={roomState}
                                    isAllMemberAudioClose={hostInfo.isAllMemberAudioClose}
                                    rtc={this.props.rtc}
                                    isAllowHandUp={hostInfo.isAllowHandUp}
                                    classMode={hostInfo.classMode}
                                    userId={parseInt(this.props.userId)}
                                    handleManagerState={this.props.handleManagerState}
                                    identity={this.props.identity}
                                    room={this.props.room}
                                    channelId={this.props.uuid}/>
                );
            } else {
                const thisGuestUsers = (roomState.globalState as any).guestUsers;
                if (thisGuestUsers) {
                    const selfInfo: GuestUserType = thisGuestUsers.find((guestUser: GuestUserType) => guestUser.userId === userId);
                    if (selfInfo) {
                        return (
                            <ClassroomMedia isVideoEnable={hostInfo.isVideoEnable}
                                            roomState={roomState}
                                            applyForRtc={selfInfo.applyForRtc}
                                            isAllowHandUp={hostInfo.isAllowHandUp}
                                            isAllMemberAudioClose={hostInfo.isAllMemberAudioClose}
                                            rtc={this.props.rtc}
                                            classMode={hostInfo.classMode}
                                            userId={parseInt(this.props.userId)}
                                            handleManagerState={this.props.handleManagerState}
                                            identity={this.props.identity}
                                            room={this.props.room}
                                            channelId={this.props.uuid}/>
                        );
                    } else {
                        return (
                            <ClassroomMedia isVideoEnable={hostInfo.isVideoEnable}
                                            applyForRtc={false}
                                            roomState={roomState}
                                            isAllMemberAudioClose={hostInfo.isAllMemberAudioClose}
                                            rtc={this.props.rtc}
                                            isAllowHandUp={hostInfo.isAllowHandUp}
                                            classMode={hostInfo.classMode}
                                            userId={parseInt(this.props.userId)}
                                            handleManagerState={this.props.handleManagerState}
                                            identity={this.props.identity}
                                            room={this.props.room}
                                            channelId={this.props.uuid}/>
                        );
                    }
                } else {
                    return (
                        <ClassroomMedia isVideoEnable={hostInfo.isVideoEnable}
                                        applyForRtc={false}
                                        roomState={roomState}
                                        isAllowHandUp={hostInfo.isAllowHandUp}
                                        isAllMemberAudioClose={hostInfo.isAllMemberAudioClose}
                                        rtc={this.props.rtc}
                                        classMode={hostInfo.classMode}
                                        userId={parseInt(this.props.userId)}
                                        handleManagerState={this.props.handleManagerState}
                                        identity={this.props.identity}
                                        room={this.props.room}
                                        channelId={this.props.uuid}/>
                    );
                }
            }
        } else {
            return null;
        }
    }

    private handleAgree = (room: Room, guestUser: GuestUserType, guestUsers: GuestUserType[]): void => {
        const {roomState} = this.props;
        const hostInfo: HostUserType = (roomState.globalState as any).hostInfo;
        if (this.props.identity === IdentityType.host) {
            if (hostInfo && guestUsers) {
                if (hostInfo.isVideoEnable) {
                    const users = guestUsers.map((user: GuestUserType) => {
                        if (user.userId === guestUser.userId) {
                            user.isReadOnly = false;
                            user.cameraState = ViewMode.Freedom;
                            user.disableCameraTransform = false;
                            user.applyForRtc = true;
                        }
                        return user;
                    });
                    room.setGlobalState({guestUsers: users});
                } else {
                    const users = guestUsers.map((user: GuestUserType) => {
                        if (user.userId === guestUser.userId) {
                            user.isReadOnly = false;
                            user.cameraState = ViewMode.Freedom;
                            user.disableCameraTransform = false;
                        }
                        return user;
                    });
                    room.setGlobalState({guestUsers: users});
                }
            }
        }
    }

    private handleUnlock = (state: boolean, room: Room, guestUser: GuestUserType, guestUsers: GuestUserType[]): void => {
        const {identity} = this.props;
        if (identity === IdentityType.host && guestUsers) {
            let users;
            if (state) {
                // 解锁
                users = guestUsers.map((user: GuestUserType) => {
                    if (user.userId === guestUser.userId) {
                        user.isReadOnly = false;
                        user.cameraState = ViewMode.Freedom;
                        user.disableCameraTransform = false;
                        user.applyForRtc = true;
                    }
                    return user;
                });
            } else {
                // 锁定
                users = guestUsers.map((user: GuestUserType) => {
                    if (user.userId === guestUser.userId) {
                        user.isReadOnly = true;
                        user.cameraState = ViewMode.Follower;
                        user.isHandUp = false;
                        user.disableCameraTransform = true;
                        user.applyForRtc = false;
                    }
                    return user;
                });
            }
            room.setGlobalState({guestUsers: users});
        }
    }
    private renderGuestIcon = (guestUser: GuestUserType, guestUsers: GuestUserType[]): React.ReactNode => {
        const {room, roomState} = this.props;
        const hostInfo: HostUserType = (roomState.globalState as any).hostInfo;
        const isHost = this.props.identity === IdentityType.host;
        if (hostInfo && hostInfo.classMode === ClassModeType.lecture) {
            if (guestUser.isHandUp) {
                if (guestUser.isReadOnly) {
                    return (
                        <div className="room-member-icon-box">
                            <div onClick={() => this.handleAgree(room, guestUser, guestUsers)} className={isHost ? "room-member-cell-icon" : "room-member-cell-icon-disable"}>
                                <img src={raise_hands_active}/>
                            </div>
                            <div onClick={() => this.handleUnlock(true, room, guestUser, guestUsers)} className={isHost ? "room-member-cell-icon" : "room-member-cell-icon-disable"}>
                                <Icon type="lock" />
                            </div>
                        </div>
                    );
                } else {
                    return (
                        <div className="room-member-icon-box">
                            <div className={isHost ? "room-member-cell-icon" : "room-member-cell-icon-disable"}>
                                <img style={{width: 14}} src={speak}/>
                            </div>
                            <div onClick={() => this.handleUnlock(false, room, guestUser, guestUsers)}
                                 className={isHost ? "room-member-cell-icon" : "room-member-cell-icon-disable"}>
                                <Icon type="unlock" />
                            </div>
                        </div>
                    );
                }
            } else {
                if (!guestUser.isReadOnly) {
                    return <div onClick={() => this.handleUnlock(false, room, guestUser, guestUsers)}
                                className={isHost ? "room-member-cell-icon" : "room-member-cell-icon-disable"}>
                        <Icon type="unlock" />
                    </div>;
                } else {
                    return <div onClick={() => this.handleUnlock(true, room, guestUser, guestUsers)}
                                className={isHost ? "room-member-cell-icon" : "room-member-cell-icon-disable"}>
                        <Icon type="lock" />
                    </div>;
                }
            }
        } else {
            if (!guestUser.isReadOnly) {
                return <div onClick={() => this.handleUnlock(false, room, guestUser, guestUsers)}
                            className={isHost ? "room-member-cell-icon" : "room-member-cell-icon-disable"}>
                    <Icon type="unlock" />
                </div>;
            } else {
                return <div onClick={() => this.handleUnlock(true, room, guestUser, guestUsers)}
                            className={isHost ? "room-member-cell-icon" : "room-member-cell-icon-disable"}>
                    <Icon type="lock" />
                </div>;
            }
        }
    }
    private renderGuest = (): React.ReactNode => {
        const {room, roomState} = this.props;
        const globalGuestUsers: GuestUserType[] = (roomState.globalState as any).guestUsers;
        if (globalGuestUsers && globalGuestUsers.length > 0) {
            const guestNodesOnline = globalGuestUsers.filter(guestUser => guestUser.isOnline);
            const guestNodes = guestNodesOnline.map((guestUser: GuestUserType, index: number) => {
                return (
                    <div className="room-member-cell" key={`${index}`}>
                        <div className="room-member-cell-inner">
                            {guestUser.avatar ?
                                <div className="manager-avatar-box">
                                    <img className="room-member-avatar"  src={guestUser.avatar}/>
                                </div>
                                :
                                <div className="manager-avatar-box">
                                    <Identicon
                                        className={`avatar-${guestUser.userId}`}
                                        size={24}
                                        string={guestUser.userId}/>
                                </div>
                            }
                            <div className="control-box-name">{guestUser.name ? guestUser.name : guestUser.userId}</div>
                        </div>
                        {this.renderGuestIcon(guestUser, globalGuestUsers)}
                    </div>
                );
            });
            if (guestNodes.length > 0) {
                return (
                    <div>
                        {guestNodes}
                    </div>
                );
            } else {
                return <div className="room-member-empty">
                    <img src={user_empty}/>
                    <div>{projectStore.isEnglish() ? "No students have joined" : "尚且无学生加入"}</div>
                </div>;
            }
        } else {
            return <div className="room-member-empty">
                <img src={user_empty}/>
                <div>{projectStore.isEnglish() ? "No students have joined" : "尚且无学生加入"}</div>
            </div>;
        }
    }

    private handleDotState = (): React.ReactNode => {
        const {roomState} = this.props;
        const isActive = this.state.activeKey === "2";
        if (this.props.isManagerOpen && !isActive) {
            const guestUsers: GuestUserType[] = (roomState.globalState as any).guestUsers;
            if (guestUsers && guestUsers.length > 0) {
                const handUpGuestUsers = guestUsers.filter((guestUser: GuestUserType) => guestUser.isHandUp);
                if (handUpGuestUsers && handUpGuestUsers.length > 0) {
                    return "举手";
                } else {
                    return  null;
                }
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    private renderUserListTitle = (): React.ReactNode => {
        if (this.props.identity === IdentityType.host) {
            return (
                <Badge count={this.handleDotState()} overflowCount={99} offset={[8, -2]}>
                    <div>{projectStore.isEnglish() ? "Users List" : "用户列表"}</div>
                </Badge>
            );
        } else {
            return (
                <div>{projectStore.isEnglish() ? "Users List" : "用户列表"}</div>
            );
        }
    }

    private renderChatListTitle = (): React.ReactNode => {
        const isActive = this.state.activeKey === "1";
        return (
            <Badge overflowCount={99} offset={[8, -2]} count={isActive ? 0 : (this.state.messages.length - this.state.seenMessagesLength)}>
                <div>{projectStore.isEnglish() ? "Live Chat" : "聊天群组"}</div>
            </Badge>
        );
    }

    private handleTabsChange = (evt: any): void => {
        this.setState({activeKey: evt, seenMessagesLength: this.state.messages.length});
    }

    private handleManagerStyle = (): string => {
        if (this.props.isManagerOpen) {
            return "manager-box";
        } else {
            return "manager-box-mask-close";
        }
    }
    private setMediaAudioState = (state: boolean): void => {
        const {room, identity, roomState} = this.props;
        if (identity === IdentityType.host) {
            room.setGlobalState({hostInfo: {
                    ...(roomState.globalState as any).hostInfo,
                    isAllMemberAudioClose: state,
                }});
        }
    }
    private getMediaState = (): boolean => {
        const {roomState} = this.props;
        if ((roomState.globalState as any).hostInfo) {
            const hostInfo: HostUserType = (roomState.globalState as any).hostInfo;
            if (hostInfo) {
                return hostInfo.isVideoEnable;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    private renderAudioController = (): React.ReactNode => {
        if (!this.getMediaState()) {
            return null;
        }
        if (this.props.identity === IdentityType.host) {
            const {roomState} = this.props;
            const hostInfo: HostUserType = (roomState.globalState as any).hostInfo;
            if (hostInfo) {
                if (hostInfo.isAllMemberAudioClose) {
                    return (
                        <div onClick={() => this.setMediaAudioState(false)} className="guest-box-btn">
                            打开学生音频
                        </div>
                    );
                } else {
                    return (
                        <div onClick={() => this.setMediaAudioState(true)} className="guest-box-btn">
                            关闭学生音频
                        </div>
                    );
                }
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
    public render(): React.ReactNode {
        if (this.props.isManagerOpen === null) {
            return null;
        } else {
            return (
                <div className={this.handleManagerStyle()}>
                    {this.renderHost()}
                    <div className="chat-box-switch">
                        <Tabs activeKey={this.state.activeKey} onChange={this.handleTabsChange}>
                            <TabPane forceRender tab={this.renderChatListTitle()} key="1">
                                <WhiteboardChat
                                    elementId={this.props.elementId}
                                    identity={this.props.identity}
                                    messages={this.state.messages}
                                    userAvatarUrl={this.props.userAvatarUrl}
                                    userId={this.props.userId}
                                    userName={this.props.userName}
                                    room={this.props.room}/>
                            </TabPane>
                            <TabPane forceRender tab={this.renderUserListTitle()} key="2">
                                <div className="guest-box">
                                    {this.renderGuest()}
                                    {this.renderAudioController()}
                                </div>
                            </TabPane>
                        </Tabs>
                    </div>
                </div>
            );
        }
    }
}
export default WhiteboardManager;