import * as React from "react";
import close from "../../assets/image/close.svg";
import add_icon from "../../assets/image/add_icon.svg";
import TweenOne from "rc-tween-one";
import {Room, WhiteScene, RoomState} from "white-web-sdk";
import "./MenuAnnexBox.less";
import VirtualList, {ItemInfo} from "react-tiny-virtual-list";
import { observer } from "mobx-react";
import { projectStore } from "../../models/ProjectStore";

export type MenuAnnexBoxState = {
    isFocus: boolean,
    hoverCellIndex: number | null;
};

export type MenuAnnexBoxProps = {
    room: Room;
    roomState: RoomState;
    handleAnnexBoxMenuState: () => void;
    isPreviewMenuOpen: boolean;
};

@observer
class MenuAnnexBox extends React.Component<MenuAnnexBoxProps, MenuAnnexBoxState> {

    private ref: HTMLDivElement | null = null;

    public constructor(props: MenuAnnexBoxProps) {
        super(props);
        this.state = {
            isFocus: false,
            hoverCellIndex: null,
        };
        this.arrowControllerHotKey = this.arrowControllerHotKey.bind(this);
    }

    private arrowControllerHotKey(evt: KeyboardEvent): void {
    }

    private removeScene(): void {
        const {room, roomState} = this.props;
        const scenePath = roomState.sceneState.scenePath;
        room.removeScenes(`${scenePath}`);
    }
    private setScenePath = (newActiveIndex: number) => {
        const {room} = this.props;
        room.setSceneIndex(newActiveIndex);
    }
    private pathName = (path: string): string => {
        const reg = /\/([^\/]*)\//g;
        reg.exec(path);
        if (RegExp.$1 === "aria") {
            return "";
        } else {
            return RegExp.$1;
        }
    }

    public componentDidMount(): void {
        document.body.addEventListener("keydown", this.arrowControllerHotKey);
    }

    public componentWillUnmount(): void {
        document.body.removeEventListener("keydown", this.arrowControllerHotKey);
    }

    private renderClose = (index: number, isActive: boolean): React.ReactNode => {
        if (index === this.state.hoverCellIndex || isActive) {
            return (
                <TweenOne
                    animation={[
                        {
                            scale: 1,
                            duration: 200,
                            ease: "easeInOutQuart",
                        },
                    ]}
                    style={{
                        transform: "scale(0)",
                    }}
                    className="page-box-inner-index-delete" onClick={() => this.removeScene()}>
                    <img className="menu-title-close-icon" src={close}/>
                </TweenOne>
            );
        } else {
            return null;
        }
    }

    private setRef(ref: HTMLDivElement | null): void {
        this.ref = ref;
    }
    public render(): React.ReactNode {
        const {roomState} = this.props;
        const scenes = roomState.sceneState.scenes;
        const sceneDir = roomState.sceneState.scenePath.split("/");
        sceneDir.pop();
        const activeIndex = roomState.sceneState.index;
        return (
            <div
                ref={this.setRef.bind(this)} className="menu-annex-box">
                <div className="menu-title-line">
                    <div className="menu-title-text-box">
                        {projectStore.isEnglish() ? "Preview" : "预览"}
                    </div>
                    <div className="menu-close-btn" onClick={this.props.handleAnnexBoxMenuState}>
                        <img className="menu-title-close-icon" src={close}/>
                    </div>
                </div>
                <div style={{height: 42}}/>
                <VirtualList
                    height={"calc(100vh - 84px)"}
                    itemCount={scenes.length}
                    itemSize={157.5}
                    overscanCount={6}
                    renderItem={(itemInfo: ItemInfo) => {
                        const cell = scenes[itemInfo.index];
                        const isActive = itemInfo.index === activeIndex;
                        return <div
                            key={itemInfo.index}
                            style={itemInfo.style}
                            className={isActive ? "page-out-box-active" : "page-out-box"}
                            onMouseEnter={() => this.setState({hoverCellIndex: itemInfo.index})}
                            onMouseLeave={() => this.setState({hoverCellIndex: null})}
                        >
                            <div className="page-box-inner-index-left">{itemInfo.index + 1}</div>
                            <div
                                onFocus={() => this.setState({isFocus: true})}
                                onBlur={() => this.setState({isFocus: false})}
                                onClick={() => {
                                    this.setScenePath(itemInfo.index);
                                }} className="page-mid-box">
                                <div className="page-box">
                                    <PageImage
                                        isMenuOpen={this.props.isPreviewMenuOpen}
                                        scene={cell}
                                        room={this.props.room}
                                        path={sceneDir.concat(cell.name).join("/")}/>
                                </div>
                            </div>
                            <div className="page-box-inner-index-delete-box">
                                {this.renderClose(itemInfo.index, isActive)}
                            </div>
                        </div>;
                    }}
                />
                <div style={{height: 42}}/>
                <div className="menu-under-btn">
                    <div
                        className="menu-under-btn-inner"
                        onClick={() => {
                            const {room} = this.props;
                            const activeIndex = roomState.sceneState.index;
                            const newSceneIndex = activeIndex + 1;
                            const scenePath = roomState.sceneState.scenePath;
                            const pathName = this.pathName(scenePath);
                            room.putScenes(`/${pathName}`, [{}], newSceneIndex);
                            room.setSceneIndex(newSceneIndex);
                        }}
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
}

export type PageImageProps = { scene: WhiteScene, path: string, room: Room, isMenuOpen: boolean};

class PageImage extends React.Component<PageImageProps, {}> {

    private ref?: HTMLDivElement | null;

    public constructor(props: any) {
        super(props);
    }
    public UNSAFE_componentWillReceiveProps(nextProps: PageImageProps): void {
        const ref = this.ref;
        if (nextProps.isMenuOpen !== this.props.isMenuOpen && nextProps.isMenuOpen && ref) {
            this.props.room.scenePreview(this.props.path, ref, 192, 112.5);
        }
    }
    private setupDivRef = (ref: HTMLDivElement | null) => {
        if (ref) {
            this.ref = ref;
            this.props.room.scenePreview(this.props.path, ref, 192, 112.5);
        }
    }

    public render(): React.ReactNode {
        return <div className="ppt-image" ref={this.setupDivRef.bind(this)}/>;
    }
}

export default MenuAnnexBox;