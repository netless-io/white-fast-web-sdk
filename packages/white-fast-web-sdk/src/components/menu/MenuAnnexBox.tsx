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

    private renderPreviewCellS = (scenes: ReadonlyArray<WhiteScene>, activeIndex: number, sceneDir: any): React.ReactNode => {
        const nodes: React.ReactNode = scenes.map((scene, index) => {
            const isActive = index === activeIndex;
            return <div
                key={index}
                className={isActive ? "page-out-box-active" : "page-out-box"}
                onMouseEnter={() => this.setState({hoverCellIndex: index})}
                onMouseLeave={() => this.setState({hoverCellIndex: null})}
            >
                <div className="page-box-inner-index-left">{index + 1}</div>
                <div
                    onFocus={() => this.setState({isFocus: true})}
                    onBlur={() => this.setState({isFocus: false})}
                    onClick={() => {
                        this.setScenePath(index);
                    }} className="page-mid-box">
                    <div className="page-box">
                        <PageImage
                            isMenuOpen={this.props.isPreviewMenuOpen}
                            scene={scene}
                            room={this.props.room}
                            path={sceneDir.concat(scene.name).join("/")}/>
                    </div>
                </div>
                <div className="page-box-inner-index-delete-box">
                    {this.renderClose(index, isActive)}
                </div>
            </div>;
        });
        return (
            <div style={{height: "calc(100vh - 84px)"}}>
                {nodes}
            </div>
        );
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
                {this.renderPreviewCellS(scenes, activeIndex, sceneDir)}
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
    private imageElement?: HTMLImageElement;
    private imageURL?: string;

    public constructor(props: any) {
        super(props);
    }
    public UNSAFE_componentWillReceiveProps(nextProps: PageImageProps): void {
        if (nextProps.isMenuOpen !== this.props.isMenuOpen &&
            nextProps.path !== this.props.path &&
            nextProps.isMenuOpen) {
            if (this.imageElement && this.imageURL) {
                URL.revokeObjectURL(this.imageURL);
                this.imageElement.remove();
                this.imageURL = undefined;
                this.imageElement = undefined;
            }
            this.fillPreviewImage(nextProps.path).catch(console.error);
        }
    }

    public componentWillUnmount(): void {
        if (this.imageURL) {
            URL.revokeObjectURL(this.imageURL);
        }
    }

    private setupDivRef = async (ref: HTMLDivElement | null): Promise<void> => {
        if (ref) {
            this.ref = ref;
            await this.fillPreviewImage(this.props.path);
        }
    }

    private async fillPreviewImage(path: string): Promise<void> {
        if (this.ref) {
            const {room} = this.props;
            this.imageURL = await room.generateScreenshot(path, 192, 112.5);
            this.imageElement = document.createElement("img");
            this.imageElement.src = this.imageURL;
            this.imageElement.style.width = `192px`;
            this.imageElement.style.height = `112.5px`;
            this.ref.append(this.imageElement);
        }
    }

    public render(): React.ReactNode {
        // return null;
        return <div className="ppt-image" ref={this.setupDivRef.bind(this)}/>;
    }
}

export default MenuAnnexBox;