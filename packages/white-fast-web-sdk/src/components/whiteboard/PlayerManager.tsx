import * as React from "react";
import {Tabs, Tooltip} from "antd";
import {ViewMode, Player} from "white-web-sdk";
import WhiteboardChat from "./WhiteboardChat";
import {MessageType} from "./WhiteboardBottomRight";
import {GuestUserType, HostUserType} from "../../pages/RoomManager";
import user_empty from "../../assets/image/user_empty.svg";
import menu_in from "../../assets/image/menu_in.svg";
import teacher from "../../assets/image/teacher.svg";
import "./PlayerManager.less";
import Identicon from "@netless/identicon";
import {ClassModeType, LanguageEnum} from "../../pages/NetlessRoomTypes";
import { observer } from "mobx-react";
import { projectStore } from "../../models/ProjectStore";
const { TabPane } = Tabs;

export type PlayerManagerProps = {
    player?: Player;
    userId: string;
    handleManagerState: () => void;
    isManagerOpen?: boolean;
    uuid?: string;
    userName?: string;
    userAvatarUrl?: string;
    messages: MessageType[];
    isFirstScreenReady: boolean;
    isChatOpen: boolean;
    mediaUrl?: string;
    elementId: string;
};

export type PlayerManagerStates = {
    isLandscape: boolean,
    isRtcReady: boolean,
    isManagerOpen: boolean,
    activeKey: string,
};

@observer
class PlayerManager extends React.Component<PlayerManagerProps, PlayerManagerStates> {


    public constructor(props: PlayerManagerProps) {
        super(props);
        this.state = {
            isLandscape: false,
            isRtcReady: false,
            isManagerOpen: this.props.isManagerOpen !== undefined ? this.props.isManagerOpen : false,
            activeKey: "1",
        };
    }
    private detectLandscape = (): void => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const isLandscape = (width / height) >= 1;
        this.setState({isLandscape: isLandscape});
    }
    public componentDidMount(): void {
        this.detectLandscape();
        window.addEventListener("resize", this.detectLandscape);
    }
    public componentWillReceiveProps(nextProps: PlayerManagerProps): void {
        if (this.props.isChatOpen !== nextProps.isChatOpen) {
            if (nextProps.isChatOpen) {
                this.setState({activeKey: "2"});
            } else {
                this.setState({activeKey: "1"});
            }
        }
    }

    public componentWillUnmount(): void {
        window.removeEventListener("resize", this.detectLandscape);
    }
    private handleTabsChange = (evt: any): void => {
        this.setState({activeKey: evt});
    }

    private renderGuest = (): React.ReactNode => {
        const {player, isFirstScreenReady} = this.props;
        if (player && isFirstScreenReady) {
            const globalGuestUsers: GuestUserType[] = (player.state.globalState as any).guestUsers;
            if (globalGuestUsers) {
                const guestNodes = globalGuestUsers.map((guestUser: GuestUserType, index: number) => {
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
                                <div className="control-box-name">{guestUser.name}</div>
                            </div>
                        </div>
                    );
                });
                return (
                    <div>
                        {guestNodes}
                    </div>
                );
            } else {
                return <div className="room-member-empty">
                    <img src={user_empty}/>
                    {projectStore.isEnglish() ? <div>No students have joined</div> : <div>尚且无学生加入</div>}
                </div>;
            }
        } else {
            return <div className="room-member-empty">
                <img src={user_empty}/>
                {projectStore.isEnglish() ? <div>No students have joined</div> : <div>尚且无学生加入</div>}
            </div>;
        }
    }
    private handleManagerStyle = (): string => {
        if (this.props.isManagerOpen) {
            return "manager-box";
        } else {
            return "manager-box-mask-close";
        }
    }

    private renderMedia = (): React.ReactNode => {
        const {mediaUrl} = this.props;
        if (mediaUrl) {
            return (
                <div className="player-video-out-side">
                    <video
                        poster={"https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/video_cover.svg"}
                        className="video-js video-layout"
                        id="white-sdk-video-js"/>
                </div>
            );
        } else {
            return null;
        }
    }
    private handleModeText = (mode: ClassModeType) => {
        switch (mode) {
            case ClassModeType.discuss: {
                return "自由讨论";
            }
            case ClassModeType.lecture: {
                return "讲课模式";
            }
            default: {
                return "举手问答";
            }
        }
    }

    private renderHostInf = (): React.ReactNode => {
        const {player, isFirstScreenReady} = this.props;
        if (player && isFirstScreenReady && (player.state.globalState as any).hostInfo !== undefined) {
            const hostInfo: HostUserType = (player.state.globalState as any).hostInfo;
            return (
                <div className="replay-video-box">
                    {this.renderMedia()}
                    <div className="manager-box-btn-right">
                        <Tooltip placement={"left"} title={projectStore.isEnglish() ? "Hide sidebar" : "隐藏侧边栏"}>
                            <div onClick={() => this.props.handleManagerState()} className="manager-box-btn-right-inner">
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
                    <div className="manager-box-text">老师：{hostInfo.name ? hostInfo.name : hostInfo.userId}</div>
                    <div style={{marginTop: 6, color: "white"}}>模式: {this.handleModeText(hostInfo.classMode)}</div>
                </div>
            );
        } else {
            return (
                <div className="replay-video-box">
                    {this.renderMedia()}
                    <div className="manager-box-btn-right">
                        <Tooltip placement={"left"} title={"隐藏侧边栏"}>
                            <div onClick={() => this.props.handleManagerState()} className="manager-box-btn-right-inner">
                                <img src={menu_in}/>
                            </div>
                        </Tooltip>
                    </div>
                    <div className="manager-box-image">
                        <img style={{width: 42}} src={teacher}/>
                    </div>
                </div>
            );
        }
    }
    public render(): React.ReactNode {
        return (
            <div className={this.handleManagerStyle()}>
                {this.renderHostInf()}
                <div className="chat-box-switch">
                    <Tabs activeKey={this.state.activeKey} onChange={this.handleTabsChange}>
                        <TabPane  tab={projectStore.isEnglish() ? "Live chat" : "聊天群组"} key="1">
                            <WhiteboardChat
                                elementId={this.props.elementId}
                                messages={this.props.messages}
                                userAvatarUrl={this.props.userAvatarUrl}
                                userId={this.props.userId}
                                userName={this.props.userName}
                                player={this.props.player}/>
                        </TabPane>
                        <TabPane tab={projectStore.isEnglish() ? "Users list" : "用户列表"} key="2">
                            <div className="guest-box">
                                {this.renderGuest()}
                            </div>
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        );
    }
}
export default PlayerManager;