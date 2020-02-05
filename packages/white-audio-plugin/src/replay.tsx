import * as React from "react";
import { PluginProps } from "white-web-sdk";
import { reaction, IReactionDisposer } from "mobx";
import "./index.less";
import * as audio_plugin from "./image/audio_plugin.svg";
import { PluginContext } from "./Plugins";
export enum IdentityType {
    host = "host",
    guest = "guest",
    listener = "listener",
}

export type WhiteAudioPluginProps = PluginProps<PluginContext, {
    play: boolean;
    seek: number;
    volume: number;
    mute: boolean;
    currentTime: number;
}>;

export type SelfUserInf = {
    identity: IdentityType,
};

export type WhiteAudioPluginStates = {
    mute: boolean;
};

export default class WhiteAudioPluginReplay extends React.Component<WhiteAudioPluginProps, WhiteAudioPluginStates> {

    private readonly reactionPlayDisposer: IReactionDisposer;
    private readonly reactionSeekDisposer: IReactionDisposer;
    private readonly reactionVolumeDisposer: IReactionDisposer;
    private readonly reactionMuteDisposer: IReactionDisposer;
    private readonly reactionReplayPlayingDisposer: IReactionDisposer;
    private readonly player: React.RefObject<HTMLAudioElement>;
    public constructor(props: WhiteAudioPluginProps) {
        super(props);
        this.player = React.createRef();
        this.reactionPlayDisposer = this.startPlayReaction();
        this.reactionSeekDisposer = this.startSeekReaction();
        this.reactionMuteDisposer = this.startMuteTimeReaction();
        this.reactionVolumeDisposer = this.startVolumeReaction();
        this.reactionReplayPlayingDisposer = this.startReplayPlayingReaction();
        this.state = {
            mute: false,
        };
    }
    
    private startPlayReaction(): IReactionDisposer {
        return reaction(() => {
            return this.props.plugin.attributes.play;
        }, async play => {
            if (play) {
                if (this.player.current) {
                    try {
                        await this.player.current.play();
                    } catch (err) {
                        if (`${err.name}` === "NotAllowedError") {
                            await this.player.current.play();
                        }
                    }
                }
            } else {
                if (this.player.current) {
                    this.player.current.pause();
                }
            }
        });
    }

    private startSeekReaction(): IReactionDisposer {
        return reaction(() => {
            return this.props.plugin.attributes.seek;
        }, seek => {
            if (this.player.current) {
                this.player.current.currentTime = seek;
            }
        });
    }

    private startReplayPlayingReaction(): IReactionDisposer {
        return reaction(() => {
            return this.props.plugin.isPlaying;
        }, async isPlaying => {
            if (isPlaying) {
                if (this.player.current) {
                    try {
                        await this.player.current.play();
                    } catch (err) {
                        if (`${err.name}` === "NotAllowedError") {
                            await this.player.current.play();
                        }
                    }
                }
            } else {
                if (this.player.current) {
                    this.player.current.pause();
                }
            }
        });
    }

    private startVolumeReaction(): IReactionDisposer {
        return reaction(() => {
            return this.props.plugin.attributes.volume;
        }, volume => {
            if (this.player.current) {
                this.player.current.volume = volume;
            }
        });
    }

    public componentWillUnmount(): void {
        this.reactionPlayDisposer();
        this.reactionSeekDisposer();
        this.reactionMuteDisposer();
        this.reactionVolumeDisposer();
        this.reactionReplayPlayingDisposer();
    }

    private startMuteTimeReaction(): IReactionDisposer {
        const { plugin } = this.props;
        return reaction(() => {
            return plugin.attributes.mute;
        }, mute => {
            this.setState({ mute: mute });
        });
    }


    public render(): React.ReactNode {
        const { size, plugin } = this.props;
        return (
            <div className="plugin-audio-box" style={{ width: size.width, height: size.height }}>
                <div className="plugin-audio-box-nav">
                    <div>
                        <img style={{ width: 20, marginLeft: 8 }} src={audio_plugin} />
                        <span>
                            Audio Player
                        </span>
                    </div>
                </div>
                <div className="plugin-audio-box-body">
                    <div className="white-plugin-audio-box">
                        <audio webkit-playsinline="true"
                            playsinline
                            className="white-plugin-audio"
                            src={(plugin.attributes as any).pluginAudioUrl}
                            ref={this.player}
                            muted={this.state.mute}
                            style={{
                                width: "100%",
                                height: "100%",
                                pointerEvents: "none",
                                outline: "none",
                            }}
                            controls
                            controlsList={"nodownload nofullscreen"}
                            preload="auto"
                        />
                    </div>
                </div>
            </div>
        );
    }
}