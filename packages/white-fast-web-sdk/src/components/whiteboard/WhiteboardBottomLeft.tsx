import * as React from "react";
import {DeviceType, Room, RoomState} from "white-web-sdk";
import {observer} from "mobx-react";
import "./WhiteboardBottomLeft.less";
import ScaleController from "../../tools/scaleController";
import file from "../../assets/image/file.svg";
import * as change_icon from "../../assets/image/change_icon.svg";
import * as delete_ppt_icon from "../../assets/image/delete_ppt_icon.svg";
import * as redo from "../../assets/image/redo.svg";
import * as undo from "../../assets/image/undo.svg";
import * as redo_black from "../../assets/image/redo_black.svg";
import * as undo_black from "../../assets/image/undo_black.svg";
import * as ppt_click_icon from "../../assets/image/ppt_click_icon.svg";
import {roomStore} from "../../models/RoomStore";
import {IdentityType} from "../../pages/NetlessRoomTypes";

export type WhiteboardBottomLeftProps = {
    room: Room;
    handleFileState: (state: boolean) => void;
    deviceType: DeviceType;
    isManagerOpen: boolean | null;
    identity?: IdentityType;
    isReadOnly?: boolean;
    roomState: RoomState;
};
export type WhiteboardBottomLeftStates = {
    undoSteps: number;
    redoSteps: number;
};

@observer
class WhiteboardBottomLeft extends React.Component<WhiteboardBottomLeftProps, WhiteboardBottomLeftStates> {

    public constructor(props: WhiteboardBottomLeftProps) {
        super(props);
        this.state = {
            undoSteps: 0,
            redoSteps: 0,
        };
    }

    private zoomChange = (scale: number): void => {
        const {room} = this.props;
        room.moveCamera({
            centerX: 0,
            centerY: 0,
            scale: scale,
        });
    }

    public componentDidMount(): void {
        const {room} = this.props;
        room.callbacks.on("onCanUndoStepsUpdate", (steps: number): void => {
            this.setState({
                undoSteps: steps,
            });
        });
        room.callbacks.on("onCanRedoStepsUpdate", (steps: number): void => {
            this.setState({
                redoSteps: steps,
            });
        });
    }

    private renderFileIcon = (): React.ReactNode => {
        const {handleFileState, isManagerOpen} = this.props;
        if (isManagerOpen === null) {
            return (
                <div onClick={() => handleFileState(true)} className="whiteboard-box-bottom-left-chart-2">
                    <img src={file}/>
                </div>
            );
        }
        if (this.props.identity === IdentityType.host) {
            return (
                <div onClick={() => handleFileState(true)} className="whiteboard-box-bottom-left-chart-2">
                    <img src={file}/>
                </div>
            );
        } else {
            return null;
        }
    }

    private handlePptClick = (): void => {
        if (roomStore.boardPointerEvents === "auto") {
            roomStore.boardPointerEvents = "none";
        } else {
            roomStore.boardPointerEvents = "auto";
        }
    }

    private deletePptUrl = (): void => {
        this.props.room.setGlobalState({h5PptUrl: ""});
        roomStore.boardPointerEvents = "auto";
    }

    private renderPptPopover = (): React.ReactNode => {
        return <div className="ppt-popover">
            <div onClick={this.handlePptClick} className="ppt-popover-cell">
                <div className="ppt-popover-icon">
                    <img style={{width: 24}} src={ppt_click_icon}/>
                </div>
                <div className="ppt-popover-title">
                    切换点击 PPT
                </div>
            </div>
            <div onClick={() => {
                roomStore.isInputH5Visible = true;
            }} className="ppt-popover-cell">
                <div className="ppt-popover-icon">
                    <img style={{width: 23}} src={change_icon}/>
                </div>
                <div className="ppt-popover-title">
                    更换 PPT 链接
                </div>
            </div>
            <div onClick={this.deletePptUrl} className="ppt-popover-cell">
                <div className="ppt-popover-icon">
                    <img style={{width: 26}} src={delete_ppt_icon}/>
                </div>
                <div className="ppt-popover-title">
                    清空 PPT 链接
                </div>
            </div>
        </div>;
    }

    public render(): React.ReactNode {
        const {isReadOnly, room, roomState} = this.props;
        const {redoSteps, undoSteps} = this.state;
        if (isReadOnly) {
            return <div className="whiteboard-box-bottom-left">
                <div className="whiteboard-box-mid">
                    <ScaleController
                        roomState={roomState}
                        isReadOnly={this.props.isReadOnly}
                        deviceType={this.props.deviceType}
                        zoomChange={this.zoomChange}/>
                </div>
            </div>;
        }
        return (
            <div className="whiteboard-box-bottom-left">
                <div className="whiteboard-box-mid">
                    {this.renderFileIcon()}
                    <div className="scale-controller-box">
                        <div onClick={() => room.undo()} className="scale-controller-btn">
                            <img style={{width: 16}} src={undoSteps === 0 ? undo : undo_black}/>
                        </div>
                        <div onClick={() => room.redo()} className="scale-controller-btn">
                            <img style={{width: 16}} src={redoSteps === 0 ? redo : redo_black}/>
                        </div>
                    </div>
                    <ScaleController
                        roomState={roomState}
                        deviceType={this.props.deviceType}
                        zoomChange={this.zoomChange}/>
                </div>
            </div>
        );
    }

}

export default WhiteboardBottomLeft;
