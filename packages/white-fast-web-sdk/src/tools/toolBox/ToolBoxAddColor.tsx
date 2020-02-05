import * as React from "react";
import {Popover} from "antd";
import ChromePicker from "react-color/lib/components/chrome/Chrome";
import toolPaletteConfig from "./ToolPaletteConfig";
import * as add_white from "../../assets/image/add_white.svg";


export type ToolBoxAddColorStates = {
    activeColor: string;
    isAddColor: boolean;
    isVisible: boolean;
};

export type ToolBoxAddColorProps = {
    newColorArray?: (colorArray: string[]) => void;
    newColor?: (color: string) => void;
    colorConfig?: string[];
};

export default class ToolBoxAddColor extends React.Component<ToolBoxAddColorProps, ToolBoxAddColorStates> {

    public constructor(props: ToolBoxAddColorProps) {
        super(props);
        this.state = {
            activeColor: "#5B908E",
            isAddColor: false,
            isVisible: false,
        };
    }

    private handleChangeComplete = (color: any): void => {
        this.setState({ activeColor: color.hex });
        if (this.state.activeColor !== "#5B908E") {
            this.setState({isAddColor: true});
        }
    }

    private updateColorArray = (): void => {
        const {newColorArray, colorConfig} = this.props;
        if (colorConfig) {
            colorConfig.push(this.state.activeColor);
            if (newColorArray) {
                newColorArray(colorConfig);
            }
        } else {
            toolPaletteConfig.push(this.state.activeColor);
            if (newColorArray) {
                newColorArray(toolPaletteConfig);
            }
        }
    }
    private handleVisibleChange = (visible: boolean): void => {
        this.setState({isVisible: visible});
        if (!visible && this.state.isAddColor) {
            const {newColor} = this.props;
            if (newColor && this.state.activeColor) {
                newColor(this.state.activeColor);
            }
            this.updateColorArray();
        }
    }

    public componentWillUnmount(): void {
        this.updateColorArray();
        const {newColor} = this.props;
        if (newColor && this.state.isAddColor) {
            newColor(this.state.activeColor);
        }
    }
    public render(): React.ReactNode {
        const { activeColor, isVisible} = this.state;
        return (
            <Popover
                onVisibleChange={this.handleVisibleChange}
                trigger="click"
                content={<ChromePicker color={activeColor} onChangeComplete={this.handleChangeComplete}/>}
                placement="bottom"
            >
                <div className="palette-color-inner-box">
                    <div className="palette-color"
                         style={{backgroundColor: isVisible ? activeColor : "#BEBEBE"}}>
                        {isVisible || <img src={add_white}/>}
                    </div>
                </div>
            </Popover>
        );
    }

}
