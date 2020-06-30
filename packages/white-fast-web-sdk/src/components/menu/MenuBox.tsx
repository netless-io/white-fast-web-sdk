import * as React from "react";
import {PagePreviewPositionEnum} from "../../pages/NetlessRoomTypes";
import { observer } from "mobx-react";
const Menu = require("react-burger-menu/lib/menus/slide");

const timeout = (ms: any) => new Promise(res => setTimeout(res, ms));

export type MenuBoxStyleState = {
    menuStyles: any,
    isMenuOpen: boolean,
};

const styles: any = {
    bmMenu: {
        boxShadow: "0 8px 24px 0 rgba(0,0,0,0.15)",
    },
    bmBurgerButton: {
        display: "none",
    },
};

const styles2: any = {
    bmBurgerButton: {
        display: "none",
    },
};


export type MenuBoxProps = {
    isVisible: boolean;
    setMenuState?: (state: boolean) => void;
    pagePreviewPosition?: PagePreviewPositionEnum;
    sideMenuWidth?: number;
    isSidePreview?: boolean;
    onRef?: (ref: React.Component) => void;
};

@observer
class MenuBox extends React.Component<MenuBoxProps, MenuBoxStyleState> {

    public constructor(props: MenuBoxProps) {
        super(props);
        this.state = {
            menuStyles: this.props.isVisible ? styles : styles2,
            isMenuOpen: false,
        };
    }

    public componentDidMount(): void {
        if (this.props.onRef) {
            this.props.onRef(this);
        }
    }
    private async getMenuStyle(isOpen: boolean): Promise<void> {
        if (isOpen) {
            this.setState({
                menuStyles: styles,
            });
        } else {
            await timeout(200);
            this.setState({
                menuStyles: styles2,
            });
        }
    }

    public render(): React.ReactNode {
        const {pagePreviewPosition, sideMenuWidth, setMenuState} = this.props;
        const isRight = pagePreviewPosition !== PagePreviewPositionEnum.left;
        const menuWidth = sideMenuWidth ? sideMenuWidth : 280;
        return (
            <Menu
                noOverlay
                styles={this.state.menuStyles}
                width={menuWidth}
                right={isRight}
                isOpen={this.props.isVisible}
                onStateChange={async (menuState: any) => {
                    if (!menuState.isOpen) {
                        await timeout(300);
                        if (setMenuState) {
                            setMenuState(false);
                        }
                        await this.getMenuStyle(false);
                    }
                    else {
                        if (setMenuState) {
                            setMenuState(true);
                        }
                        await this.getMenuStyle(true);
                        await timeout(300);
                        this.setState({isMenuOpen: true});
                    }
                }}>
                {this.props.children}
            </Menu>
        );
    }
}
export default MenuBox;