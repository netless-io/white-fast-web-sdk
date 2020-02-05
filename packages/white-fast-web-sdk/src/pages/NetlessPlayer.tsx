import * as React from "react";
import SeekSlider from "@netless/react-seek-slider";
import {Badge, Icon, message} from "antd";
import {WhiteWebSdk, PlayerPhase, Player, PlayerWhiteboard, createPlugins} from "white-react-sdk";
import * as chat_white from "../assets/image/chat_white.svg";
import * as player_stop from "../assets/image/player_stop.svg";
import * as player_begin from "../assets/image/player_begin.svg";
import {displayWatch} from "../tools/WatchDisplayer";
import {UserCursor} from "../components/whiteboard/UserCursor";
import {MessageType} from "../components/whiteboard/WhiteboardBottomRight";
import WhiteboardTopLeft from "../components/whiteboard/WhiteboardTopLeft";
import PageError from "../components/PageError";
import "video.js/dist/video-js.css";
import PlayerManager from "../components/whiteboard/PlayerManager";
import PlayerTopRight from "../components/whiteboard/PlayerTopRight";
import Draggable from "react-draggable";
import "./NetlessPlayer.less";
import {PlayerFacadeObject, PlayerFacadeSetter} from "../facade/Facade";
import {replayStore} from "../models/ReplayStore";
import {videoPlugin} from "@netless/white-video-plugin";
import {audioPlugin} from "@netless/white-audio-plugin";
const timeout = (ms: any) => new Promise(res => setTimeout(res, ms));
export enum LayoutType {
    Suspension = "Suspension",
    Side = "Side",
}
export type PlayerPageProps = {
    uuid: string;
    roomToken: string;
    userId: string;
    userName?: string;
    userAvatarUrl?: string;
    boardBackgroundColor?: string;
    duration?: number;
    beginTimestamp?: number,
    mediaUrl?: string,
    logoUrl?: string;
    clickLogoCallback?: () => void;
    playerCallback?: (player: Player) => void;
    roomName?: string;
    isManagerOpen?: boolean;
    elementId: string;
    playerFacadeSetter: PlayerFacadeSetter;
    layoutType?: LayoutType;
};


export type PlayerPageStates = {
    player?: Player;
    phase: PlayerPhase;
    currentTime: number;
    isFirstScreenReady: boolean;
    isPlayerSeeking: boolean;
    messages: MessageType[];
    seenMessagesLength: number;
    isChatOpen: boolean;
    isVisible: boolean;
    replayFail: boolean;
    isManagerOpen: boolean;
    layoutType: LayoutType;
};

class NetlessPlayer extends React.Component<PlayerPageProps, PlayerPageStates> implements PlayerFacadeObject {
    private scheduleTime: number = 0;
    private readonly cursor: any;

    public constructor(props: PlayerPageProps) {
        super(props);
        this.cursor = new UserCursor();
        this.state = {
            currentTime: 0,
            phase: PlayerPhase.Pause,
            isFirstScreenReady: false,
            isPlayerSeeking: false,
            messages: [],
            seenMessagesLength: 0,
            isChatOpen: false,
            isVisible: false,
            replayFail: false,
            isManagerOpen: this.props.isManagerOpen !== undefined ? this.props.isManagerOpen : false,
            layoutType: this.props.layoutType !== undefined ? this.props.layoutType : LayoutType.Side,
        };
    }

    public UNSAFE_componentWillReceiveProps(nextProps: PlayerPageProps): void {
        if (this.props.isManagerOpen !== nextProps.isManagerOpen && nextProps.isManagerOpen === false) {
            this.setState({seenMessagesLength: this.state.messages.length});
        }
    }

    public UNSAFE_componentWillMount(): void {
        this.props.playerFacadeSetter(this);
    }

    public componentWillUnmount(): void {
        this.props.playerFacadeSetter(null);
    }

    public release(): void {
        window.removeEventListener("resize", this.onWindowResize);
        window.removeEventListener("keydown", this.handleSpaceKey);
    }

    public async componentDidMount(): Promise<void> {
        window.addEventListener("resize", this.onWindowResize);
        window.addEventListener("keydown", this.handleSpaceKey);
        const {player} = this.state;
        if (player) {
            player.addMagixEventListener("message",  event => {
                this.setState({messages: [...this.state.messages, event.payload]});
            });
        }
        const {uuid, roomToken, beginTimestamp, duration, mediaUrl} = this.props;
        if (mediaUrl && this.props.isManagerOpen === undefined) {
            this.setState({isManagerOpen: true});
        }
        const plugins = createPlugins({"video": videoPlugin, "audio": audioPlugin});
        if (uuid && roomToken) {
            const whiteWebSdk = new WhiteWebSdk({plugins: plugins});
            const player = await whiteWebSdk.replayRoom(
                {
                    beginTimestamp: beginTimestamp,
                    duration: duration,
                    room: uuid,
                    mediaURL: mediaUrl,
                    roomToken: roomToken,
                    cursorAdapter: this.cursor,
                }, {
                    onPhaseChanged: phase => {
                        this.setState({phase: phase});
                    },
                    onLoadFirstFrame: () => {
                        this.setState({isFirstScreenReady: true});
                        if (player.state.roomMembers) {
                            this.cursor.setColorAndAppliance(player.state.roomMembers);
                        }
                    },
                    onSliceChanged: slice => {
                    },
                    onPlayerStateChanged: modifyState => {
                        if (modifyState.roomMembers) {
                            this.cursor.setColorAndAppliance(modifyState.roomMembers);
                        }
                    },
                    onStoppedWithError: error => {
                        message.error("Playback error");
                        this.setState({replayFail: true});
                    },
                    onScheduleTimeChanged: scheduleTime => {
                        this.setState({currentTime: scheduleTime});
                    },
                });
            this.setState({
                player: player,
            });
            if (this.props.playerCallback) {
                this.props.playerCallback(player);
            }
            player.addMagixEventListener("message",  event => {
                this.setState({messages: [...this.state.messages, event.payload]});
            });
        }
    }
    private onWindowResize = (): void => {
        if (this.state.player) {
            this.state.player.refreshViewSize();
        }
    }

    private handleSpaceKey = (evt: any): void => {
        if (evt.code === "Space") {
            if (this.state.player) {
                this.onClickOperationButton(this.state.player);
            }
        }
    }

    public getPlayer(): Player | undefined {
        return this.state.player;
    }

    private operationButton = (phase: PlayerPhase): React.ReactNode => {
        switch (phase) {
            case PlayerPhase.Playing: {
                return <img src={player_begin}/>;
            }
            case PlayerPhase.Buffering: {
                return <Icon style={{fontSize: 18, color: "white"}} type="loading" />;
            }
            case PlayerPhase.Ended: {
                return <img style={{marginLeft: 2}} src={player_stop}/>;
            }
            default: {
                return <img style={{marginLeft: 2}} src={player_stop}/>;
            }
        }
    }

    private operationButtonBig = (phase: PlayerPhase): React.ReactNode => {
        switch (phase) {
            case PlayerPhase.Playing: {
                return <img style={{width: 28}} src={player_begin}/>;
            }
            case PlayerPhase.Buffering: {
                return <Icon style={{fontSize: 28, color: "white"}} type="loading" />;
            }
            case PlayerPhase.Ended: {
                return <img style={{marginLeft: 6, width: 28}} src={player_stop}/>;
            }
            default: {
                return <img style={{marginLeft: 6, width: 28}} src={player_stop}/>;
            }
        }
    }

    private getCurrentTime = (scheduleTime: number): number => {
        if (this.state.isPlayerSeeking) {
            this.scheduleTime = scheduleTime;
            return this.state.currentTime;
        } else {
            const isChange = this.scheduleTime !== scheduleTime;
            if (isChange) {
                return scheduleTime;
            } else {
                return this.state.currentTime;
            }
        }
    }

    private onClickOperationButton = (player: Player): void => {
        switch (player.phase) {
            case PlayerPhase.WaitingFirstFrame:
            case PlayerPhase.Pause: {
                player.play();
                replayStore.play();
                break;
            }
            case PlayerPhase.Playing: {
                player.pause();
                replayStore.pause();
                break;
            }
            case PlayerPhase.Ended: {
                player.seekToScheduleTime(0);
                break;
            }
        }
    }
    private renderScheduleView(): React.ReactNode {
        if (this.state.player && this.state.isVisible) {
            return (
                <div
                    onMouseEnter={() => this.setState({isVisible: true})}
                    className="player-schedule">
                    <div className="player-mid-box">
                        <SeekSlider
                            fullTime={this.state.player.timeDuration}
                            currentTime={this.getCurrentTime(this.state.currentTime)}
                            onChange={(time: number, offsetTime: number) => {
                                if (this.state.player) {
                                    this.setState({currentTime: time});
                                    this.state.player.seekToScheduleTime(time);
                                }
                            }}
                            hideHoverTime={true}
                            limitTimeTooltipBySides={true}/>
                    </div>
                    <div className="player-controller-box">
                        <div className="player-controller-left">
                            <div className="player-left-box">
                                <div
                                    onClick={() => {
                                        if (this.state.player) {
                                            this.onClickOperationButton(this.state.player);
                                        }
                                    }}
                                    className="player-controller">
                                    {this.operationButton(this.state.phase)}
                                </div>
                            </div>
                            <div className="player-mid-box-time">
                                {displayWatch(Math.floor(this.state.player.scheduleTime / 1000))} / {displayWatch(Math.floor(this.state.player.timeDuration / 1000))}
                            </div>
                        </div>
                        {this.state.layoutType === LayoutType.Side &&
                        <div className="player-controller-left">
                            <Badge overflowCount={99} offset={[-3, 6]} count={this.state.isManagerOpen ? 0 : (this.state.messages.length - this.state.seenMessagesLength)}>
                                <div onClick={this.handleChatState} className="player-controller">
                                    <img src={chat_white}/>
                                </div>
                            </Badge>
                        </div>}
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }


    private handleChatState = async (): Promise<void> => {
        if (!this.state.isManagerOpen) {
            this.setState({isChatOpen: true, isManagerOpen: true});
            await timeout(100);
            this.onWindowResize();
        } else {
            this.setState({isChatOpen: true});
        }
    }
    private handleManagerState = async (): Promise<void> => {
        if (this.state.isManagerOpen) {
            this.setState({isManagerOpen: false, isChatOpen: false});
        } else {
            this.setState({isManagerOpen: true});
        }
        await timeout(100);
        this.onWindowResize();
    }

    private renderMedia = (): React.ReactNode => {
        const {mediaUrl, layoutType} = this.props;
        if (mediaUrl) {
            if (layoutType === LayoutType.Suspension) {
                return (
                    <Draggable bounds="parent">
                        <div className="player-video-out">
                            <video
                                poster={"https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/video_cover.svg"}
                                className="video-js video-layout"
                                id="white-sdk-video-js"/>
                        </div>
                    </Draggable>
                );
            } else {
                return null;
            }
        } else {
            return null;
        }
    }


    private renderLoading = (): React.ReactNode => {
        const {player} = this.state;
        if (player) {
            return null;
        } else {
            return <div className="white-board-loading">
                <img src="https://white-sdk.oss-cn-beijing.aliyuncs.com/fast-sdk/icons/loading.svg"/>
            </div>;
        }
    }

    public render(): React.ReactNode {
        const {player} = this.state;
        const {userId, boardBackgroundColor, uuid} = this.props;
        if (this.state.replayFail) {
            return <PageError/>;
        }
        return (
            <div className="player-out-box">
                {this.renderLoading()}
                <div className="player-board">
                    <WhiteboardTopLeft
                        clickLogoCallback={this.props.clickLogoCallback}
                        roomName={this.props.roomName}
                        logoUrl={this.props.logoUrl}/>
                    {player && <PlayerTopRight
                        userId={userId}
                        layoutType={this.state.layoutType}
                        player={player}
                        isFirstScreenReady={this.state.isFirstScreenReady}
                        handleManagerState={this.handleManagerState}
                        isManagerOpen={this.state.isManagerOpen}/>}
                    {this.renderMedia()}
                    {this.renderScheduleView()}
                    <div
                        className="player-board-inner"
                        onMouseOver={() => this.setState({isVisible: true})}
                        onMouseLeave={() => this.setState({isVisible: false})}
                    >
                        <div
                            onClick={() => {
                                if (this.state.player) {
                                    this.onClickOperationButton(this.state.player);
                                }
                            }}
                            className="player-mask">
                            {this.state.phase === PlayerPhase.Pause &&
                            <div className="player-big-icon">
                                {this.operationButtonBig(this.state.phase)}
                            </div>}
                        </div>
                        {player &&
                        <PlayerWhiteboard
                            style={{backgroundColor: boardBackgroundColor ? boardBackgroundColor : "#F2F2F2"}}
                            className="player-box"
                            player={player}/>}
                    </div>
                </div>
                {this.state.layoutType === LayoutType.Side &&
                <PlayerManager
                    elementId={this.props.elementId}
                    player={player}
                    mediaUrl={this.props.mediaUrl}
                    isChatOpen={this.state.isChatOpen}
                    userId={userId}
                    isFirstScreenReady={this.state.isFirstScreenReady}
                    messages={this.state.messages}
                    handleManagerState={this.handleManagerState}
                    isManagerOpen={this.state.isManagerOpen}
                    uuid={uuid}/>
                }
            </div>
        );
    }
}
export default NetlessPlayer;
