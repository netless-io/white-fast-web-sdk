import * as React from "react";
import "./LoadingPage.less";
import {RoomPhase} from "white-web-sdk";
import {LanguageEnum} from "../pages/NetlessRoomTypes";
import { observer } from "mobx-react";
import { projectStore } from "../models/ProjectStore";
export type LoadingPageProps = {
    loadingSvgUrl?: string;
    phase: RoomPhase;
};

@observer
class LoadingPage extends React.Component<LoadingPageProps, {}> {
    public constructor(props: LoadingPageProps) {
        super(props);
    }

    private renderScript = (): React.ReactNode => {
        const {phase} = this.props;
        switch (phase) {
            case RoomPhase.Reconnecting: {
                return (
                    <div>
                        {projectStore.isEnglish() ? "Reconnecting" : "正在重连房间"}
                    </div>
                );
            }
            case RoomPhase.Disconnected: {
                return (
                    <div>
                        {projectStore.isEnglish() ? "Disconnected" : "已经断开房间"}
                    </div>
                );
            }
            case RoomPhase.Connected: {
                return (
                    <div>
                        {projectStore.isEnglish() ? "Connected" : "已经连接房间"}
                    </div>
                );
            }
            case RoomPhase.Connecting: {
                return (
                    <div>
                        {projectStore.isEnglish() ? "Connecting" : "正在连接房间"}
                    </div>
                );
            }
            case RoomPhase.Disconnecting: {
                return (
                    <div>
                        {projectStore.isEnglish() ? "Disconnecting" : "正在断开房间"}
                    </div>
                );
            }
            default: {
                return (
                    <div>
                        {projectStore.isEnglish() ? "Connected" : "已经连接房间"}
                    </div>
                );
            }
        }
    }
    public render(): React.ReactNode {
        const {loadingSvgUrl} = this.props;
        const loading = "https://white-sdk.oss-cn-beijing.aliyuncs.com/fast-sdk/icons/loading.svg";
        return (
            <div className="white-board-loading">
                <div className="white-board-loading-mid">
                    <img src={loadingSvgUrl ? loadingSvgUrl : loading}/>
                    {this.renderScript()}
                </div>
            </div>
        );
    }
}

export default LoadingPage;