import * as React from "react";
import {ViewMode, Room, RoomState, Scene, DeviceType} from "white-web-sdk";
import {Badge, Button, message, Modal, Input, Radio} from "antd";
import Clipboard from "react-clipboard.js";
import QRCode from "qrcode.react";
import menu_out from "../../assets/image/menu_out.svg";
import stop_icon from "../../assets/image/stop_icon.svg";
import replay_video_cover_en from "../../assets/image/replay_video_cover_en.svg";
import replay_video_cover from "../../assets/image/replay_video_cover.svg";
import * as add from "../../assets/image/add.svg";
import {GuestUserType} from "../../pages/RoomManager";
import "./WhiteboardTopRight.less";
import Identicon from "@netless/identicon";
import {IdentityType} from "../../pages/NetlessRoomTypes";
import {roomStore} from "../../models/RoomStore";
import { observer } from "mobx-react";
import { projectStore } from "../../models/ProjectStore";
const timeout = (ms: any) => new Promise(res => setTimeout(res, ms));

export type WhiteboardTopRightProps = {
    userId: string;
    room: Room;
    handleManagerState: () => void;
    deviceType: DeviceType;
    userAvatarUrl?: string;
    userName?: string;
    identity?: IdentityType;
    isReadOnly?: boolean;
    isManagerOpen: boolean | null;
    exitRoomCallback?: () => void;
    replayCallback?: () => void;
    roomState: RoomState;
};

export enum ShareUrlType {
    readOnly = "readOnly",
    interactive = "interactive",
}

export type WhiteboardTopRightStates = {
    isVisible: boolean;
    isLoading: boolean;
    canvas: any;
    imageRef: any;
    handUpNumber: number;
    seenHandUpNumber: number;
    isInviteVisible: boolean;
    isCloseTipsVisible: boolean;
    url: string;
    shareUrl: ShareUrlType;
};

@observer
class WhiteboardTopRight extends React.Component<WhiteboardTopRightProps, WhiteboardTopRightStates> {

    public constructor(props: WhiteboardTopRightProps) {
        super(props);
        this.state = {
            isVisible: false,
            isLoading: false,
            canvas: null,
            imageRef: null,
            handUpNumber: 0,
            seenHandUpNumber: 0,
            isInviteVisible: false,
            isCloseTipsVisible: false,
            url: location.href,
            shareUrl: ShareUrlType.interactive,
        };
    }

    private handleDotState = (): boolean => {
        const {roomState} = this.props;
        if (!this.props.isManagerOpen) {
            const guestUsers: GuestUserType[] = (roomState.globalState as any).guestUsers;
            if (guestUsers && guestUsers.length > 0) {
                const handUpGuestUsers = guestUsers.filter((guestUser: GuestUserType) => guestUser.isHandUp);
                return handUpGuestUsers && handUpGuestUsers.length > 0;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    private handleUrl = (url: string): string => {
        if (this.props.isManagerOpen === null) {
            return url;
        } else {
            let classUrl;
            if (this.props.identity === IdentityType.host) {
                if (this.state.shareUrl === ShareUrlType.readOnly) {
                    classUrl = url.replace(`${IdentityType.host}/`, `${IdentityType.listener}/`);
                } else {
                    classUrl = url.replace(`${IdentityType.host}/`, `${IdentityType.guest}/`);
                }
            } else {
                if (this.state.shareUrl === ShareUrlType.readOnly) {
                    classUrl = url.replace(`${IdentityType.guest}/`, `${IdentityType.listener}/`);
                } else {
                    classUrl = url.replace(`${IdentityType.guest}/`, `${IdentityType.guest}/`);
                }
            }
            if (this.props.isReadOnly) {
                classUrl = classUrl.replace(`${IdentityType.guest}/`, `${IdentityType.listener}/`);
            }
            const regex = /[\w]+\/$/gm;
            const match = regex.exec(classUrl);
            if (match) {
                return classUrl.substring(0, match.index);
            } else {
                return classUrl;
            }
        }
    }
    private handleInvite = (): void => {
        this.setState({isInviteVisible: true});
    }
    public componentDidMount(): void {
        const {identity} = this.props;
        if (identity === IdentityType.host) {
            this.setState({shareUrl: ShareUrlType.interactive});
        } else {
            this.setState({shareUrl: ShareUrlType.readOnly});
        }
    }

    private handleClose = (): void => {
        this.setState({isCloseTipsVisible: true});
    }

    private handleRenderStop = (): React.ReactNode => {
        return (
            <div onClick={this.handleClose} className="whiteboard-top-right-user">
                <img src={stop_icon}/>
            </div>
        );
    }
    private handleUserAvatar = (): React.ReactNode => {
        const  {userAvatarUrl, userId} = this.props;
        if (userAvatarUrl) {
            return (
                <div onClick={() => this.props.handleManagerState()} className="whiteboard-top-right-user">
                    <img src={userAvatarUrl}/>
                </div>
            );
        } else {
            return (
                <div onClick={() => this.props.handleManagerState()} className="whiteboard-top-right-user">
                    <div className="whiteboard-top-right-avatar">
                        <Identicon
                            className={`avatar-${userId}`}
                            size={22}
                            string={`${userId}`}
                        />
                    </div>
                </div>
            );
        }
    }

    private handleShareUrl = (evt: any): void => {
        this.setState({shareUrl: evt.target.value});
    }

    private handleSwitchDisable = (shareUrl: ShareUrlType): boolean => {
        const  {identity} = this.props;
        if (shareUrl === ShareUrlType.readOnly) {
            return false;
        } else {
            if (identity === IdentityType.host) {
                return false;
            } else if (identity === IdentityType.guest) {
                return false;
            } else {
                return true;
            }
        }
    }

    private renderSideMenu = (): React.ReactNode => {
        const  {isManagerOpen} = this.props;
        const isHost = this.props.identity === IdentityType.host;
        if (!isManagerOpen) {
            if (isHost) {
                return (
                    <Badge offset={[-5, 7]} dot={this.handleDotState()}>
                        <div onClick={() => this.props.handleManagerState()} className="whiteboard-top-right-cell">
                            <img style={{width: 16}} src={menu_out}/>
                        </div>
                    </Badge>
                );
            } else {
                return (
                    <div onClick={() => this.props.handleManagerState()} className="whiteboard-top-right-cell">
                        <img style={{width: 16}} src={menu_out}/>
                    </div>
                );
            }
        } else {
            return null;
        }
    }

    private renderExit = (): React.ReactNode => {
        if (this.props.identity === IdentityType.host) {
            return (
                <div onClick={async () => {
                    if (this.props.replayCallback) {
                        this.props.replayCallback();
                        this.setState({isCloseTipsVisible: false});
                    }
                }} className="replay-video-cover">
                    {projectStore.isEnglish() ?
                        <img src={replay_video_cover_en}/> :
                        <img src={replay_video_cover}/>
                    }
                </div>
            );
        } else {
            return (
                <div className="go-back-image">
                    {projectStore.isEnglish() ?
                        "Are you sure you want to quit the room?" :
                        "您确认要退出房间 ?"
                    }
                </div>
            );
        }
    }
    public render(): React.ReactNode {
        const  {isManagerOpen} = this.props;
        return (
            <div className="whiteboard-top-right-box">
                <div className="whiteboard-top-user-box">
                    {this.handleUserAvatar()}
                    {this.handleRenderStop()}
                </div>
                <div
                    className="whiteboard-top-right-cell" onClick={this.handleInvite}>
                    <img style={{width: 18}} src={add}/>
                </div>
                {this.renderSideMenu()}
                <Modal
                    visible={this.state.isInviteVisible}
                    footer={null}
                    title={projectStore.isEnglish() ? "Invite" : "邀请"}
                    onCancel={() => this.setState({isInviteVisible: false})}
                >
                    <div className="whiteboard-share-box">
                        <QRCode value={`${this.handleUrl(this.state.url)}`} />
                        <div className="whiteboard-share-text-box">
                            <Input readOnly size="large" value={`${this.handleUrl(this.state.url)}`}/>
                            {isManagerOpen !== null &&
                            <Radio.Group
                                value={this.state.shareUrl}
                                onChange={this.handleShareUrl}
                                className="whiteboard-switch">
                                <Radio.Button
                                    disabled={this.handleSwitchDisable(ShareUrlType.readOnly)}
                                    value={ShareUrlType.readOnly}>{projectStore.isEnglish() ? "Read Only" : "只能观看"}</Radio.Button>
                                <Radio.Button
                                    disabled={this.handleSwitchDisable(ShareUrlType.interactive)}
                                    value={ShareUrlType.interactive}>{projectStore.isEnglish() ? "Interactive" : "允许互动"}</Radio.Button>
                            </Radio.Group>}
                            <Clipboard
                                data-clipboard-text={`${this.handleUrl(this.state.url)}`}
                                component="div"
                                onSuccess={() => {
                                    if (projectStore.isEnglish()) {
                                        message.success("Copy already copied address to clipboard");
                                    } else {
                                        message.success("已经将链接复制到剪贴板");
                                    }
                                    this.setState({isInviteVisible: false});
                                }}
                            >
                                <Button style={{marginTop: 16, width: 240}} size="large" type="primary">
                                    {projectStore.isEnglish() ? "Copy Link" : "复制链接"}
                                </Button>
                            </Clipboard>
                        </div>
                    </div>
                </Modal>
                <Modal
                    visible={this.state.isCloseTipsVisible}
                    footer={null}
                    title={projectStore.isEnglish() ? "Exit classroom" : "退出教室"}
                    onCancel={() => this.setState({isCloseTipsVisible: false})}
                >
                    <div className="whiteboard-share-box">
                        <div className="whiteboard-share-text-box">
                            {this.renderExit()}
                            <Button
                                    onClick={async () => {
                                        if (roomStore.isRecording) {
                                            if (roomStore.stopRecord) {
                                                roomStore.stopRecord();
                                            }
                                            this.setState({isCloseTipsVisible: false});
                                            await timeout(500);
                                            if (this.props.exitRoomCallback) {
                                                this.props.exitRoomCallback();
                                            }
                                        } else {
                                            this.setState({isCloseTipsVisible: false});
                                            if (this.props.exitRoomCallback) {
                                                this.props.exitRoomCallback();
                                            }
                                        }
                                    }}
                                    style={{marginTop: 16, width: 240}}
                                    size="large">
                                {projectStore.isEnglish() ? "Confirm exit" : "确认退出"}
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        );

    }
}

export default WhiteboardTopRight;