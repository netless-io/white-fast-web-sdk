import * as React from "react";
import {ViewMode, Player, Scene, DeviceType} from "white-web-sdk";
import {Badge} from "antd";
import menu_out from "../../assets/image/menu_out.svg";
import {GuestUserType} from "../../pages/RoomManager";
import "./WhiteboardTopRight.less";
import {LayoutType} from "../../pages/NetlessPlayer";
import Identicon from "@netless/identicon";
import {LanguageEnum} from "../../pages/NetlessRoomTypes";

export type PlayerTopRightProps = {
    userId: string;
    player: Player;
    handleManagerState: () => void;
    userAvatarUrl?: string;
    userName?: string;
    isReadOnly?: boolean;
    language?: LanguageEnum;
    isManagerOpen: boolean;
    isFirstScreenReady: boolean;
    layoutType: LayoutType;
};

export type PlayerTopRightStates = {
    isVisible: boolean;
    isLoading: boolean;
    canvas: any;
    imageRef: any;
    handUpNumber: number;
    seenHandUpNumber: number;
    isInviteVisible: boolean;
    isCloseTipsVisible: boolean;
    url: string;
};


export default class PlayerTopRight extends React.Component<PlayerTopRightProps, PlayerTopRightStates> {

    public constructor(props: PlayerTopRightProps) {
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
        };
    }

    private handleDotState = (): boolean => {
        const {player} = this.props;
        if (!this.props.isManagerOpen && this.props.isFirstScreenReady) {
            const guestUsers: GuestUserType[] = (player.state.globalState as any).guestUsers;
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
                            string={userId}
                        />
                    </div>
                </div>
            );
        }
    }

    private renderMenu = (): React.ReactNode => {
        const  {isManagerOpen} = this.props;
        if (this.props.layoutType === LayoutType.Side) {
            if (!isManagerOpen) {
                return (
                    <Badge offset={[-5, 7]} dot={this.handleDotState()}>
                        <div onClick={() => this.props.handleManagerState()} className="whiteboard-top-right-cell">
                            <img style={{width: 16}} src={menu_out}/>
                        </div>
                    </Badge>
                );
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
    public render(): React.ReactNode {
        return (
            <div className="whiteboard-top-right-box">
                <div className="whiteboard-top-user-box">
                    {this.handleUserAvatar()}
                </div>
                {this.renderMenu()}
            </div>
        );

    }
}
