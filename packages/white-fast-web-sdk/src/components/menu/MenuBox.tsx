import * as React from "react";
import close from "../../assets/image/close.svg";
import add_icon from "../../assets/image/add_icon.svg";
import {LanguageEnum, PagePreviewPositionEnum} from "../../pages/NetlessRoomTypes";
import { observer } from "mobx-react";
import { projectStore } from "../../models/ProjectStore";
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
    private renderAnnexBoxPlaceHold = (): React.ReactNode => {
        return (
            <div
                className="menu-annex-box">
                <div className="menu-title-line">
                    <div className="menu-title-text-box">
                        {projectStore.isEnglish() ? "Preview" : "预览"}
                    </div>
                    <div className="menu-close-btn">
                        <img className="menu-title-close-icon" src={close}/>
                    </div>
                </div>
                <div style={{height: 42}}/>
                <div className="page-out-box-active">
                    <div className="page-box-inner-index-left">1</div>
                    <div className="page-mid-box">
                        <div className="page-box">
                        </div>
                    </div>
                    <div className="page-box-inner-index-delete-box">
                    </div>
                </div>
                <div style={{height: 42}}/>
                <div className="menu-under-btn">
                    <div
                        className="menu-under-btn-inner"
                    >
                        <img src={add_icon}/>
                        <div>
                            {projectStore.isEnglish() ? "Add a page" : "加一页"}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    private renderInner = (): React.ReactNode => {
        if (this.props.isSidePreview) {
            if (this.state.isMenuOpen) {
                return this.props.children;
            } else {
                return this.renderAnnexBoxPlaceHold();
            }
        } else {
            return this.props.children;
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
                        await timeout(500);
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
                        await timeout(500);
                        this.setState({isMenuOpen: true});
                    }
                }}>
                {this.renderInner()}
            </Menu>
        );
    }
}
export default MenuBox;