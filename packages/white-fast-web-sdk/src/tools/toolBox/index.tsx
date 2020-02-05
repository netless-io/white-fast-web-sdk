import * as React from "react";
import TweenOne from "rc-tween-one";
import {Popover} from "antd";
import ToolBoxPaletteBox from "./ToolBoxPaletteBox";
import {
    IconProps,
    ToolBoxEllipse,
    ToolBoxEraser,
    ToolBoxPencil, ToolBoxRectangle,
    ToolBoxSelector,
    ToolBoxText,
} from "./ToolIconComponent";
import "./ToolBox.less";
import {TooltipPlacement} from "antd/lib/tooltip";
import {isMobile} from "react-device-detect";
import {ToolBarPositionEnum} from "../../pages/NetlessRoomTypes";
import {DisplayProperty} from "csstype";
import {roomStore} from "../../models/RoomStore";
import {Room, RoomState} from "white-web-sdk";

type ApplianceDescription = {
    readonly iconView: React.ComponentClass<IconProps>;
    readonly hasColor: boolean;
    readonly hasStroke: boolean;
};

export enum CustomerComponentPositionType {
    middle = "middle",
    end = "end",
    head = "head",
}
export type Color = number[];
export type MemberState = {
    currentApplianceName: string;
    strokeColor: Color;
    strokeWidth: number;
    textSize: number;
};
export type ToolBoxProps = {
    room: Room;
    roomState: RoomState;
    isReadOnly?: boolean;
    toolBarPosition?: ToolBarPositionEnum;
    colorConfig?: string[];
    customerComponent?: React.ReactNode[];
    customerComponentPosition?: CustomerComponentPositionType;
};

export type ToolBoxStates = {
    isPaletteBoxAppear: boolean;
    strokeEnable: boolean;
    isToolBoxSwitched: boolean;
    extendsPanel: boolean;
    windowHeight: number;
};

export default class ToolBox extends React.Component<ToolBoxProps, ToolBoxStates> {
    private static readonly descriptions: {readonly [applianceName: string]: ApplianceDescription} = Object.freeze({
        selector: Object.freeze({
            iconView: ToolBoxSelector,
            hasColor: false,
            hasStroke: false,
        }),
        pencil: Object.freeze({
            iconView: ToolBoxPencil,
            hasColor: true,
            hasStroke: true,
        }),
        text: Object.freeze({
            iconView: ToolBoxText,
            hasColor: true,
            hasStroke: false,
        }),
        eraser: Object.freeze({
            iconView: ToolBoxEraser,
            hasColor: false,
            hasStroke: false,
        }),
        ellipse: Object.freeze({
            iconView: ToolBoxEllipse,
            hasColor: true,
            hasStroke: true,
        }),
        rectangle: Object.freeze({
            iconView: ToolBoxRectangle,
            hasColor: true,
            hasStroke: true,
        }),
    });

    public constructor(props: ToolBoxProps) {
        super(props);
        this.state = {
            isPaletteBoxAppear: false,
            strokeEnable: false,
            isToolBoxSwitched: false,
            extendsPanel: false,
            windowHeight: 0,
        };
    }

    public clickAppliance = (event: Event | undefined, applianceName: string): void => {
        const {room, roomState} = this.props;
        event!.preventDefault();
        const isSelected = roomState.memberState.currentApplianceName === applianceName;
        if (isSelected) {
            this.setState({isToolBoxSwitched: false, extendsPanel: !this.state.extendsPanel});
        } else {
            this.setState({isToolBoxSwitched: true, isPaletteBoxAppear: false});
            room.setMemberState({currentApplianceName: applianceName});
            this.setState({extendsPanel: false});
        }
    }

    public componentDidMount(): void {
        this.setState({extendsPanel: false, windowHeight: window.innerHeight});
    }
    private onVisibleChange = (visible: boolean): void => {
        if (!visible) {
            this.setState({extendsPanel: false});
        }
    }

    private buttonColor(isSelected: boolean): string {
        const {roomState} = this.props;
        if (isSelected) {
            const [r, g, b] = roomState.memberState.strokeColor;
            return `rgb(${r},${g},${b})`;
        } else {
            return "rgb(162,167,173)";
        }
    }

    private addCustomerComponent = (nodes: React.ReactNode[]): React.ReactNode[] => {
        const position = this.props.customerComponentPosition;
        if (this.props.customerComponent) {
            const appendPositionNumber: number = Math.floor((nodes.length / 2));
            const customerNodes = this.props.customerComponent.map((data: React.ReactNode, index: number) => {
                return <div key={`tool-customer-${index}`}>{data}</div>;
            });
            if (position) {
                if (position === CustomerComponentPositionType.head) {
                    nodes.splice(0, 0, [...customerNodes]);
                    return nodes;
                } else if (position === CustomerComponentPositionType.end) {
                    nodes.splice(nodes.length, 0, [...customerNodes]);
                    return nodes;
                }
            }
            nodes.splice(appendPositionNumber, 0, [...customerNodes]);
            return nodes;
        } else {
            return nodes;
        }
    }

    private isHavePpt = (): boolean => {
        const {roomState} = this.props;
        const isHave = !!(roomState.globalState && (roomState.globalState as any).h5PptUrl);
        if (isHave) {
            roomStore.isScreenZoomLock = true;
        }
        return isHave;
    }
    private detectToolboxState = (): DisplayProperty => {
        const {isReadOnly} = this.props;
        // if (!this.isHavePpt()) {
        //     return "flex";
        // }
        if (isReadOnly || roomStore.boardPointerEvents === "none") {
            return "none";
        } else {
            return "flex";
        }
    }

    public render(): React.ReactNode {
        const {toolBarPosition} = this.props;
        const nodes: React.ReactNode[] = [];
        for (const applianceName in ToolBox.descriptions) {
            const description = ToolBox.descriptions[applianceName];
            const node = this.renderApplianceButton(applianceName, description);
            if (isMobile) {
                if (applianceName !== "ellipse" && applianceName !== "text") {
                    nodes.push(node);
                }
            } else {
                nodes.push(node);
            }
        }
        switch (toolBarPosition) {
            case ToolBarPositionEnum.top: {
                return (
                    <div style={{
                        display: this.detectToolboxState(),
                    }} className="whiteboard-tool-box">
                        <div className="tool-mid-box">
                            {this.addCustomerComponent(nodes)}
                        </div>
                    </div>
                );
            }
            case ToolBarPositionEnum.bottom: {
                return (
                    <div style={{display: this.detectToolboxState()}} className="whiteboard-tool-box-bottom">
                        <div className="tool-mid-box">
                                {this.addCustomerComponent(nodes)}
                        </div>
                    </div>
                );
            }
            case ToolBarPositionEnum.left: {
                return (
                    <div style={{display: this.detectToolboxState()}} className="whiteboard-tool-box-left">
                        <div className="tool-mid-box-left">
                            {this.addCustomerComponent(nodes)}
                        </div>
                    </div>
                );
            }
            case ToolBarPositionEnum.right: {
                return (
                    <div style={{display: this.detectToolboxState()}} className="whiteboard-tool-box-right">
                        <div className="tool-mid-box-left">
                            {this.addCustomerComponent(nodes)}
                        </div>
                    </div>
                );
            }
            default: {
                return (
                    <div style={{display: this.detectToolboxState()}} className="whiteboard-tool-box-left">
                        <div className="tool-mid-box-left">
                            {this.addCustomerComponent(nodes)}
                        </div>
                    </div>
                );
            }
        }
    }

    private renderApplianceButton(applianceName: string, description: ApplianceDescription): React.ReactNode {
        const {toolBarPosition, roomState} = this.props;
        const ToolIcon = description.iconView;
        const isExtendable = description.hasStroke || description.hasColor;
        const isSelected = roomState.memberState.currentApplianceName === applianceName;
        const buttonColor = this.buttonColor(isSelected);

        const cellBox: React.ReactNode = (
            <div className={(toolBarPosition === ToolBarPositionEnum.left || toolBarPosition === ToolBarPositionEnum.right || toolBarPosition === undefined) ? "tool-box-cell-box-left" : "tool-box-cell-box"} key={applianceName}>
                <div className="tool-box-cell"
                     onClick={() => this.clickAppliance(event, applianceName)}>
                    <ToolIcon color={buttonColor}/>
                </div>
                {isExtendable && isSelected && (
                    <TweenOne className="tool-box-cell-step-two"
                              animation={{
                                  duration: 150,
                                  delay: 100,
                                  width: 8,
                                  backgroundColor: buttonColor,
                                  display: isSelected ? "flex" : "none",
                              }}
                              style={{
                                  backgroundColor: buttonColor,
                                  width: 0,
                                  display: "none",
                              }}/>
                )}
            </div>
        );
        if (isExtendable && isSelected) {
            return (
                <Popover key={applianceName}
                         visible={this.state.extendsPanel}
                         trigger="click"
                         placement={this.handlePlacement()}
                         onVisibleChange={this.onVisibleChange}
                         content={this.renderToolBoxPaletteBox(isSelected, description)}>
                    {cellBox}
                </Popover>
            );
        } else {
            return cellBox;
        }
    }

    private handlePlacement = (): TooltipPlacement => {
        const {toolBarPosition} = this.props;
        switch (toolBarPosition) {
            case ToolBarPositionEnum.top: {
                return "top";
            }
            case ToolBarPositionEnum.bottom: {
                return "bottom";
            }
            case ToolBarPositionEnum.right: {
                return "right";
            }
            default: {
                return "left";
            }
        }
    }

    private renderToolBoxPaletteBox(isSelected: boolean, description: ApplianceDescription): React.ReactNode {
        const {room, roomState} = this.props;
        return <ToolBoxPaletteBox colorConfig={this.props.colorConfig}
                                  room={room}
                                  roomState={roomState}
                                  displayStroke={description.hasStroke}/>;
    }
}

