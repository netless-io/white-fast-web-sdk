import * as React from "react";
import {Popover} from "antd";
import "./ExtendTool.less";
import {ExtendToolIcon} from "./ExtendToolIcon";
import ExtendToolInner from "./ExtendToolInner";
import {RoomContextConsumer} from "../../pages/RoomContext";
import {TooltipPlacement} from "antd/lib/tooltip";
import * as OSS from "ali-oss";
import {PPTProgressListener} from "../upload/UploadManager";
import {ToolBarPositionEnum} from "../../pages/NetlessRoomTypes";

export type ExtendToolStates = {
    toolBoxColor: string;
};

export type ExtendToolProps = {
    oss: {
        accessKeyId: string,
        accessKeySecret: string,
        region: string,
        bucket: string,
        folder: string,
        prefix: string,
    },
    onProgress: PPTProgressListener,
    toolBarPosition?: ToolBarPositionEnum;
    userId: string;
};

export default class ExtendTool extends React.Component<ExtendToolProps, ExtendToolStates> {
    private readonly client: any;
    public constructor(props: ExtendToolProps) {
        super(props);
        this.state = {
            toolBoxColor: "#A2A7AD",
        };
        this.client = new OSS({
            accessKeyId: this.props.oss.accessKeyId,
            accessKeySecret: this.props.oss.accessKeySecret,
            region: this.props.oss.region,
            bucket: this.props.oss.bucket,
        });
    }
    private handlePlacement = (): TooltipPlacement => {
        const {toolBarPosition} = this.props;
        switch (toolBarPosition) {
            case ToolBarPositionEnum.left: {
                return "left";
            }
            case ToolBarPositionEnum.bottom: {
                return "bottom";
            }
            case ToolBarPositionEnum.right: {
                return "right";
            }
            default: {
                return "bottom";
            }
        }
    }


    public render(): React.ReactNode {
        const {toolBarPosition} = this.props;
        return (
            <RoomContextConsumer key={"add"} children={context => (
                <Popover
                    trigger="click"
                    placement={this.handlePlacement()}
                    content={
                        <ExtendToolInner
                            onProgress={this.props.onProgress}
                            client={this.client}
                            userId={this.props.userId}
                            room={context.room}
                            whiteboardLayerDownRef={context.whiteboardLayerDownRef}
                            />}>
                    <div
                        onMouseEnter={() => this.setState({toolBoxColor: "#141414"})}
                        onMouseLeave={() => this.setState({toolBoxColor: "#A2A7AD"})}
                        className={(toolBarPosition === ToolBarPositionEnum.left ||
                        toolBarPosition === ToolBarPositionEnum.right) ? "extend-tool-cell-box-left" : "extend-tool-cell-box"}>
                        <div className="extend-tool-cell">
                            <ExtendToolIcon color={this.state.toolBoxColor}/>
                        </div>
                    </div>
                </Popover>
        )}/>);
    }
}