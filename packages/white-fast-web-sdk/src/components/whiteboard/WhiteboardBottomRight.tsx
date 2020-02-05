import * as React from "react";
import * as annex_box from "../../assets/image/annex_box.svg";
import * as left_arrow from "../../assets/image/left_arrow.svg";
import * as right_arrow from "../../assets/image/right_arrow.svg";
import * as chat from "../../assets/image/chat.svg";
import * as handup from "../../assets/image/handup.svg";
import * as handup_black from "../../assets/image/handup_black.svg";
import "./WhiteboardBottomRight.less";
import {Badge, message, Tooltip} from "antd";
import {Room, DeviceType, ViewMode, RoomState} from "white-web-sdk";
import {GuestUserType, HostUserType} from "../../pages/RoomManager";
import {isMobile} from "react-device-detect";
import {ClassModeType, LanguageEnum} from "../../pages/NetlessRoomTypes";
import { observer } from "mobx-react";
import { projectStore } from "../../models/ProjectStore";
const timeout = (ms: any) => new Promise(res => setTimeout(res, ms));

export type MessageType = {
    name: string,
    avatar: string,
    id: string,
    messageInner: string[],
};

export type hotkeyTooltipState = {
    hotkeyTooltipDisplay: boolean,
    messages:  MessageType[],
    seenMessagesLength: number,
};

export type WhiteboardBottomRightProps = {
    room: Room;
    userId: string;
    handleAnnexBoxMenuState: () => void;
    handleChatState: () => void;
    deviceType: DeviceType;
    isReadOnly?: boolean;
    isManagerOpen: boolean | null;
    roomState: RoomState;
};

@observer
class WhiteboardBottomRight extends React.Component<WhiteboardBottomRightProps, hotkeyTooltipState> {

    public constructor(props: WhiteboardBottomRightProps) {
        super(props);
        this.state = {
            hotkeyTooltipDisplay: false,
            messages: [],
            seenMessagesLength: 0,
        };
    }

    public componentDidMount(): void {
        const {room} = this.props;
        room.addMagixEventListener("message",  event => {
            this.setState({messages: [...this.state.messages, event.payload]});
        });
    }

    public UNSAFE_componentWillReceiveProps(nextProps: WhiteboardBottomRightProps): void {
        if (this.props.isManagerOpen !== nextProps.isManagerOpen && !nextProps.isManagerOpen) {
            this.setState({seenMessagesLength: this.state.messages.length});
        }
    }

    private pageNumber = (): React.ReactNode => {
        const {deviceType, roomState} = this.props;
        const activeIndex = roomState.sceneState.index;
        const scenes = roomState.sceneState.scenes;
        const isMobile = deviceType === DeviceType.Touch;
        if (isMobile) {
            return (
                <div
                    onClick={this.props.handleAnnexBoxMenuState}
                    className="whiteboard-annex-arrow-mid">
                    <div className="whiteboard-annex-img-box">
                        <img src={annex_box}/>
                    </div>
                    <div className="whiteboard-annex-arrow-page">
                        {activeIndex + 1} / {scenes.length}
                    </div>
                </div>
            );
        } else {
            return (
                <Tooltip placement="top" title={projectStore.isEnglish() ? "Preview" : "预览"}>
                    <div
                        onClick={this.props.handleAnnexBoxMenuState}
                        className="whiteboard-annex-arrow-mid">
                        <div className="whiteboard-annex-img-box">
                            <img src={annex_box}/>
                        </div>
                        <div className="whiteboard-annex-arrow-page">
                            {activeIndex + 1} / {scenes.length}
                        </div>
                    </div>
                </Tooltip>
            );
        }
    }

    private handlePushToIframe = (netlessState: string): void => {
        const childFrameObj = document.getElementById("calculation-under") as HTMLIFrameElement;
        if (childFrameObj) {
            childFrameObj.contentWindow!.postMessage(netlessState, "*");
        }
    }
    private handlePptPreviousStep = async (): Promise<void> => {
        const {room, roomState} = this.props;
        const currentPage = roomState.sceneState.index + 1;
        const previousPage = currentPage - 1;
        const jumpPageMessage = {toPage: previousPage, method: "onJumpPage", sendUserId: "a1001576140868974"};
        this.handlePushToIframe(JSON.stringify(jumpPageMessage));
        await timeout(500);
        room.pptPreviousStep();
    }
    private handlePptNextStep = async (): Promise<void> => {
        const {room, roomState} = this.props;
        const currentPage = roomState.sceneState.index + 1;
        const nextPage = currentPage + 1;
        const jumpPageMessage = {toPage: nextPage, method: "onJumpPage", sendUserId: "a1001576140868974"};
        this.handlePushToIframe(JSON.stringify(jumpPageMessage));
        await timeout(500);
        room.pptNextStep();
    }
    private renderAnnexBox = (): React.ReactNode => {
        return (
            <div className="whiteboard-annex-box">
                <div
                    onClick={() => this.handlePptPreviousStep()}
                    className="whiteboard-annex-arrow-left">
                    <img src={left_arrow}/>
                </div>
                {this.pageNumber()}
                <div
                    onClick={() => this.handlePptNextStep()}
                    className="whiteboard-annex-arrow-right">
                    <img src={right_arrow}/>
                </div>
            </div>
        );
    }
    private getSelfUserInfo = (): GuestUserType | null => {
        const {roomState} = this.props;
        const globalGuestUsers: GuestUserType[] = (roomState.globalState as any).guestUsers;
        if (globalGuestUsers) {
            const self = globalGuestUsers.find((user: GuestUserType) => user.userId === this.props.userId);
            if (self) {
                return self;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
    private handleHandup = (mode: ClassModeType, room: Room, userId?: string): void => {
        const {roomState } = this.props;
        const globalGuestUsers: GuestUserType[] = (roomState.globalState as any).guestUsers;
        const selfHostInfo: HostUserType = (roomState.globalState as any).hostInfo;
        if (userId) {
            if (mode === ClassModeType.lecture && globalGuestUsers) {
                const users = globalGuestUsers.map((user: GuestUserType) => {
                    if (user.userId === this.props.userId) {
                        user.isHandUp = !user.isHandUp;
                        if (user.isHandUp) {
                            if (projectStore.isEnglish()) {
                                message.info("You have raised your hand, please wait for approval.");
                            } else {
                                message.info("您已举手，请等待批准。");
                            }
                        } else {
                            if (projectStore.isEnglish()) {
                                message.info("You have cancelled your raise.");
                            } else {
                                message.info("您已取消举手。");
                            }
                        }
                    }
                    return user;
                });
                room.setGlobalState({guestUsers: users});
            }
        } else {
            if (mode !== ClassModeType.discuss && globalGuestUsers) {
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
            } else if (mode === ClassModeType.discuss && globalGuestUsers) {
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

    private renderHandUpBtn = (): React.ReactNode => {
        const {room, roomState} = this.props;
        const hostInfo = (roomState.globalState as any).hostInfo;
        if (hostInfo && hostInfo.classMode === ClassModeType.lecture && hostInfo.isAllowHandUp) {
            const user = this.getSelfUserInfo();
            if (user) {
                if (user.isReadOnly) {
                    return <Tooltip title={user.isHandUp ? "收回举手请求" : "举手请求互动"}>
                        <div onClick={() => this.handleHandup(hostInfo.classMode, room, this.props.userId)}
                             className="manager-under-btn">
                            <img src={user.isHandUp ? handup_black : handup}/>
                        </div>
                    </Tooltip>;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    private renderChatIcon = (): React.ReactNode => {
        const {isManagerOpen} = this.props;
        if (!isMobile && isManagerOpen !== null) {
            return (
                <Badge overflowCount={99} offset={[-3, 6]} count={this.props.isManagerOpen ? 0 : (this.state.messages.length - this.state.seenMessagesLength)}>
                    <div onClick={this.props.handleChatState} className="whiteboard-box-bottom-left-chart">
                        <img src={chat}/>
                    </div>
                </Badge>
            );
        } else {
            return null;
        }
    }
    public render(): React.ReactNode {
        const {isReadOnly} = this.props;
        if (isReadOnly) {
            if (this.renderHandUpBtn() !== null || this.renderChatIcon() !== null) {
                return (
                    <div className="whiteboard-box-bottom-right">
                        <div className="whiteboard-box-bottom-right-mid">
                            {this.renderHandUpBtn()}
                            {this.renderChatIcon()}
                        </div>
                    </div>
                );
            } else {
                return null;
            }
        } else {
            return (
                <div className="whiteboard-box-bottom-right">
                    <div className="whiteboard-box-bottom-right-mid">
                        {this.renderAnnexBox()}
                        {this.renderChatIcon()}
                    </div>
                </div>
            );
        }
    }
}
export default WhiteboardBottomRight;