import * as React from "react";
import TopLoadingBar from "@netless/react-loading-bar";
import {PPTProgressPhase, UploadManager} from "@netless/oss-upload-manager";
import * as OSS from "ali-oss";
import {Icon, message} from "antd";
import Dropzone from "react-dropzone";
import {
    WhiteWebSdk,
    Room,
    RoomPhase,
    PptConverter,
    ViewMode,
    DeviceType,
    RoomWhiteboard,
    createPlugins,
    RoomState,
} from "white-react-sdk";
import "white-web-sdk/style/index.css";
import PageError from "../components/PageError";
import WhiteboardTopRight from "../components/whiteboard/WhiteboardTopRight";
import WhiteboardBottomLeft from "../components/whiteboard/WhiteboardBottomLeft";
import WhiteboardBottomRight from "../components/whiteboard/WhiteboardBottomRight";
import MenuBox from "../components/menu/MenuBox";
import MenuAnnexBox from "../components/menu/MenuAnnexBox";
import {ossConfigObj, OSSConfigObjType} from "../appToken";
import {UserCursor} from "@netless/cursor-adapter";
import ToolBox, {CustomerComponentPositionType} from "../tools/toolBox/index";
import UploadBtn from "../tools/upload/UploadBtn";
import {RoomContextProvider} from "./RoomContext";
import WhiteboardTopLeft from "../components/whiteboard/WhiteboardTopLeft";
import WhiteboardFile from "../components/whiteboard/WhiteboardFile";
import {PPTDataType, PPTType} from "../components/menu/PPTDatas";
import LoadingPage from "../components/LoadingPage";
import {isMobile} from "react-device-detect";
import {GuestUserType, HostUserType, RoomManager} from "./RoomManager";
import WhiteboardManager from "../components/whiteboard/WhiteboardManager";
import ExtendTool from "../tools/extendTool/ExtendTool";
import WhiteboardRecord from "../components/whiteboard/WhiteboardRecord";
import "./NetlessRoom.less";
import {RoomFacadeObject} from "../facade/Facade";
import * as default_cover from "../assets/image/default_cover.svg";
import WebPpt from "./WebPpt";
import {roomStore} from "../models/RoomStore";
import {videoPlugin} from "@netless/white-video-plugin";
import {audioPlugin} from "@netless/white-audio-plugin";
import {observer} from "mobx-react";
import {
    ClassModeType,
    IdentityType,
    MenuInnerType,
    NetlessRoomProps,
    PagePreviewPositionEnum,
} from "./NetlessRoomTypes";
const timeout = (ms: any) => new Promise(res => setTimeout(res, ms));
export type NetlessRoomStates = {
    phase: RoomPhase;
    connectedFail: boolean;
    menuInnerState: MenuInnerType;
    isMenuVisible: boolean;
    roomToken: string | null;
    ossPercent: number;
    converterPercent: number;
    isPreviewMenuOpen: boolean;
    isFileMenuOpen: boolean;
    isChatOpen: boolean;
    isFileOpen: boolean;
    room?: Room;
    roomState?: RoomState;
    pptConverter?: PptConverter;
    progressDescription?: string,
    fileUrl?: string;
    whiteboardLayerDownRef?: HTMLDivElement;
    isManagerOpen: boolean | null;
    deviceType: DeviceType;
    classMode: ClassModeType;
    ossConfigObj: OSSConfigObjType;
    documentArray: PPTDataType[];
};

@observer
class NetlessRoom extends React.Component<NetlessRoomProps, NetlessRoomStates> implements RoomFacadeObject {
    private didLeavePage: boolean = false;
    private roomManager: RoomManager;
    private menuChild: React.Component;
    public constructor(props: NetlessRoomProps) {
        super(props);
        this.state = {
            phase: RoomPhase.Connecting,
            connectedFail: false,
            menuInnerState: MenuInnerType.PPTBox,
            isMenuVisible: false,
            roomToken: null,
            ossPercent: 0,
            converterPercent: 0,
            isPreviewMenuOpen: false,
            isFileMenuOpen: false,
            isChatOpen: false,
            isFileOpen: false,
            deviceType: DeviceType.Desktop,
            isManagerOpen: this.handleManagerOpenState(),
            classMode: this.props.defaultClassMode !== undefined ? this.props.defaultClassMode : ClassModeType.discuss,
            ossConfigObj: this.props.ossConfigObj !== undefined ? this.props.ossConfigObj : ossConfigObj,
            documentArray: this.props.documentArray !== undefined ? this.handleDocs(this.props.documentArray) : [],
        };
    }

    private handleManagerOpenState = (): boolean | null => {
        if (this.props.isManagerOpen !== undefined) {
            return this.props.isManagerOpen;
        } else {
            return false;
        }
    }

    private startJoinRoom = async (): Promise<void> => {
        const {uuid, roomToken, userId, userName, userAvatarUrl, identity, isManagerOpen} = this.props;
        const {classMode} = this.state;
        if (roomToken && uuid) {
            let whiteWebSdk;
            if (isMobile) {
                whiteWebSdk = new WhiteWebSdk({ deviceType: DeviceType.Surface});
            } else {
                const plugins = createPlugins({"video": videoPlugin, "audio": audioPlugin});
                plugins.setPluginContext("video", {identity: identity ? identity : IdentityType.guest});
                plugins.setPluginContext("audio", {identity: identity ? identity : IdentityType.guest});
                whiteWebSdk = new WhiteWebSdk({ deviceType: DeviceType.Surface, handToolKey: " ",
                    plugins: plugins});
            }
            const pptConverter = whiteWebSdk.pptConverter(roomToken);
            this.setState({pptConverter: pptConverter});
            const cursor = new UserCursor();
            const room = await whiteWebSdk.joinRoom({
                    uuid: uuid,
                    roomToken: roomToken,
                    cursorAdapter: cursor,
                    userPayload: {
                        userId: userId,
                        name: userName,
                        avatar: userAvatarUrl,
                        identity: identity,
                    }},
                {
                    onPhaseChanged: phase => {
                        if (!this.didLeavePage) {
                            this.setState({phase});
                        }
                        console.log(`room ${"uuid"} changed: ${phase}`);
                    },
                    onDisconnectWithError: error => {
                        console.error(error);
                    },
                    onKickedWithReason: reason => {
                        console.error("kicked with reason: " + reason);
                    },
                    onRoomStateChanged: modifyState => {
                        this.setState({roomState: {...room.state, modifyState} as RoomState});
                        if (modifyState.roomMembers) {
                            cursor.setColorAndAppliance(modifyState.roomMembers);
                        }
                    },
                });
            cursor.setColorAndAppliance(room.state.roomMembers);
            room.moveCamera({
                centerX: 0,
                centerY: 0,
            });
            (window as any).room = room;
            if (this.props.roomCallback) {
                this.props.roomCallback(room);
            }
            if (isManagerOpen !== null) {
                this.roomManager = new RoomManager(userId, room, userAvatarUrl, identity, userName, classMode);
                await this.roomManager.start();
                if (identity === IdentityType.host) {
                    this.initDocumentState(room);
                }
            }
            this.setState({room: room, roomToken: roomToken, roomState: room.state});
        } else {
            message.error("join fail");
        }
    }

    private initDocumentState = (room: Room): void => {
        const {uuid} = this.props;
        if (this.state.documentArray.length > 0 ) {
            const activeDoc = this.state.documentArray.find(data => data.active);
            if (activeDoc) {
                room.putScenes(`/${uuid}/${activeDoc.id}`, activeDoc.data);
                room.setScenePath(`/${uuid}/${activeDoc.id}/1`);
                const documentArrayState: {id: string, isHaveScenes: boolean}[] = this.state.documentArray.map(data => {
                    if (data.id === activeDoc.id) {
                        return {
                            id: data.id,
                            isHaveScenes: true,
                        };
                    } else {
                        return {
                            id: data.id,
                            isHaveScenes: false,
                        };
                    }
                });
                room.setGlobalState({documentArrayState: documentArrayState});
            } else {
                const newDocumentArray = [
                    {active: true,
                    pptType: PPTType.init,
                    id: "init",
                    data: [{componentsCount: 0,
                        name: "init"}],
                    }, ...this.state.documentArray];
                this.setState({documentArray: newDocumentArray});
                const documentArrayState: {id: string, isHaveScenes: boolean}[] = newDocumentArray.map(data => {
                    if (data.pptType === PPTType.init && data.active) {
                        return {
                            id: data.id,
                            isHaveScenes: true,
                        };
                    } else {
                        return {
                            id: data.id,
                            isHaveScenes: false,
                        };
                    }
                });
                room.setGlobalState({documentArrayState: documentArrayState});
            }
        }
    }
    private handleDocs = (documentArray: PPTDataType[]): PPTDataType[] => {
        if (documentArray.length > 0) {
            const docs = documentArray.map((PPTData: PPTDataType) => {
                const newDataArray = JSON.parse(PPTData.data);
                if (PPTData.pptType === PPTType.static) {
                    const newDataObj = newDataArray.map((data: any) => {
                        const proportion = data.ppt.width / data.ppt.height;
                        data.ppt.width = 1024;
                        data.ppt.height = 1024 / proportion;
                        return data;
                    });
                    return {
                        active: PPTData.active,
                        cover: PPTData.cover ? PPTData.cover : default_cover,
                        id: PPTData.id,
                        data: newDataObj,
                        pptType: PPTData.pptType,
                    };
                } else {
                    return {
                        active: PPTData.active,
                        cover: PPTData.cover ? PPTData.cover : default_cover,
                        id: PPTData.id,
                        data: newDataArray,
                        pptType: PPTData.pptType,
                    };
                }
            });
            return docs;
        } else {
            return [];
        }
    }

    private onWindowResize = (): void => {
        if (this.state.room) {
            this.state.room.refreshViewSize();
        }
    }
    public componentWillMount (): void {
        if (this.props.identity) {
            roomStore.identity = this.props.identity;
        }
        this.props.roomFacadeSetter(this);
        window.addEventListener("beforeunload", this.beforeunload);
    }
    private beforeunload = (): void => {
        this.stopAll();
    }

    private stopAll = (): void => {
        if (this.roomManager) {
            this.roomManager.leave();
        }
        const {identity} = this.props;
        const {room} = this.state;
        if (room && identity === IdentityType.host) {
            room.setGlobalState({hostInfo: {
                    ...(room.state.globalState as any).hostInfo,
                    isVideoEnable: false,
                }});
        }
        this.didLeavePage = true;
        if (this.state.room) {
            this.state.room.removeMagixEventListener("handup");
            this.state.room.disconnect();
        }
        if (this.roomManager) {
            this.roomManager.stop();
        }
        if (roomStore.stopRtc) {
            roomStore.stopRtc();
        }
        if (roomStore.releaseMedia) {
            roomStore.releaseMedia();
        }
        window.removeEventListener("resize", this.onWindowResize);
        window.removeEventListener("beforeunload", this.beforeunload);
    }
    public release(): void {
        this.stopAll();
    }
    public async componentDidMount(): Promise<void> {
        window.addEventListener("resize", this.onWindowResize);
        roomStore.recordDataCallback = this.props.recordDataCallback;
        if (this.props.deviceType) {
            this.setState({deviceType: this.props.deviceType});
        } else {
            if (isMobile) {
                this.setState({deviceType: DeviceType.Touch});
            } else {
                this.setState({deviceType: DeviceType.Desktop});
            }
        }
        await this.startJoinRoom();
        this.onWindowResize();
    }
    public componentWillUnmount(): void {
        this.props.roomFacadeSetter(null);
        window.removeEventListener("beforeunload", this.beforeunload);
    }

    public async setPptPreviewShow(): Promise<void> {
        if (this.state.room) {
            this.setState({
                isMenuVisible: true,
                menuInnerState: MenuInnerType.AnnexBox,
            });
        } else {
            await timeout(1500);
            this.setState({
                isMenuVisible: true,
                menuInnerState: MenuInnerType.AnnexBox,
            });
        }
    }
    public async setPptPreviewHide(): Promise<void> {
        if (this.menuChild) {
            this.menuChild.setState({isMenuOpen: false});
        }
        await timeout(200);
        this.setState({
            isMenuVisible: false,
            menuInnerState: MenuInnerType.AnnexBox,
        });
    }
    private renderMenuInner = (roomState: RoomState): React.ReactNode => {
        switch (this.state.menuInnerState) {
            case MenuInnerType.AnnexBox:
                return <MenuAnnexBox
                    roomState={roomState}
                    isPreviewMenuOpen={this.state.isPreviewMenuOpen}
                    room={this.state.room!}
                    handleAnnexBoxMenuState={this.handleAnnexBoxMenuState}/>;
            default:
                return null;
        }
    }

    private setWhiteboardLayerDownRef = (whiteboardLayerDownRef: HTMLDivElement): void => {
        this.setState({whiteboardLayerDownRef: whiteboardLayerDownRef});
    }

    private handleAnnexBoxMenuState = async (): Promise<void> => {
        if (this.state.isMenuVisible) {
            if (this.menuChild) {
                this.menuChild.setState({isMenuOpen: false});
            }
            await timeout(200);
            this.setState({
                isMenuVisible: !this.state.isMenuVisible,
                menuInnerState: MenuInnerType.AnnexBox,
            });
        } else {
            this.setState({
                isMenuVisible: !this.state.isMenuVisible,
                menuInnerState: MenuInnerType.AnnexBox,
            });
        }
    }

    private isImageType = (type: string): boolean => {
        return type === "image/jpeg" || type === "image/png";
    }

    private onDropFiles = async (
        acceptedFiles: File[],
        rejectedFiles: File[],
        event: React.DragEvent<HTMLDivElement>): Promise<void> => {
        event.persist();
        const {ossConfigObj} = this.state;
        try {
            const imageFiles = acceptedFiles.filter(file => this.isImageType(file.type));
            const client = new OSS({
                accessKeyId: ossConfigObj.accessKeyId,
                accessKeySecret: ossConfigObj.accessKeySecret,
                region: ossConfigObj.region,
                bucket: ossConfigObj.bucket,
            });
            const uploadManager = new UploadManager(client, this.state.room!);
            await Promise.all([
                uploadManager.uploadImageFiles(imageFiles, event.clientX, event.clientY),
            ]);
        } catch (error) {
            this.state.room!.setMemberState({
                currentApplianceName: "selector",
            });
        }
    }

    private progress = (phase: PPTProgressPhase, percent: number): void => {
        message.config({
            maxCount: 1,
        });
        switch (phase) {
            case PPTProgressPhase.Uploading: {
                this.setState({ossPercent: percent * 100});
                break;
            }
            case PPTProgressPhase.Converting: {
                this.setState({converterPercent: percent * 100});
                break;
            }
        }
    }
    private onRef = (ref: React.Component) => {
        this.menuChild = ref;
    }
    private setPreviewMenuState = (state: boolean) => {
        this.setState({isPreviewMenuOpen: state});
    }
    private setFileMenuState = (state: boolean) => {
        this.setState({isFileMenuOpen: state});
    }

    private handleChatState = async (): Promise<void> => {
        if (this.props.isManagerOpen !== null) {
            if (!this.state.isManagerOpen) {
                this.setState({isChatOpen: true, isManagerOpen: true});
                await timeout(100);
                this.onWindowResize();
            } else {
                this.setState({isChatOpen: true});
            }
        }
    }
    private handleManagerState = async (): Promise<void> => {
        if (this.props.isManagerOpen !== null) {
            if (this.state.isManagerOpen) {
                this.setState({isManagerOpen: false, isChatOpen: false});
            } else {
                this.setState({isManagerOpen: true});
            }
            await timeout(100);
            this.onWindowResize();
        }
    }
    private handleFileState = (): void => {
        this.setState({isFileOpen: !this.state.isFileOpen});
    }

    private detectIsReadOnly = (roomState: RoomState, room: Room): boolean => {
        const {identity, userId, isManagerOpen} = this.props;
        // const {room} = this.state;
        if (isManagerOpen === null) {
            return false;
        }
        if (identity === IdentityType.listener) {
            return true;
        } else if (identity === IdentityType.host) {
            return false;
        }
        const selfUser: GuestUserType = (roomState.globalState as any).guestUsers.find((user: GuestUserType) => user.userId === userId);
        if (selfUser) {
            room.disableDeviceInputs = selfUser.isReadOnly;
            return selfUser.isReadOnly;
        } else {
            if (this.props.isReadOnly) {
                room.disableDeviceInputs = this.props.isReadOnly;
                return this.props.isReadOnly;
            } else {
                return true;
            }
        }
    }
    private renderRecordComponent = (roomState: RoomState): React.ReactNode => {
        if (this.props.enableRecord === false) {
          return null;
        }
        if (this.props.identity === IdentityType.host && this.state.deviceType !== DeviceType.Touch) {
            return (
                <WhiteboardRecord
                    roomState={roomState}
                    ossConfigObj={this.state.ossConfigObj}
                    replayCallback={this.props.replayCallback}
                    room={this.state.room!}
                    uuid={this.props.uuid} rtc={this.props.rtc}
                    channelName={this.props.uuid}/>
            );
        } else {
            return null;
        }
    }

    private  documentFileCallback = (documentFile: PPTDataType): void => {
        const {documentArrayCallback} = this.props;
        const {room} = this.state;
        const documents = this.state.documentArray.map(data => {
            data.active = false;
            return data;
        });
        this.setState({documentArray: [...documents, documentFile]});
        if (room) {
            if ((room.state.globalState as any).documentArrayState) {
                const documentArrayState = (room.state.globalState as any).documentArrayState;
                room.setGlobalState({documentArrayState: [...documentArrayState, {id: documentFile.id, isHaveScenes: true}]});
            } else {
                room.setGlobalState({documentArrayState: [{id: documentFile.id, isHaveScenes: true}]});
            }
        }
        if (documentArrayCallback) {
            const docs: PPTDataType[] = this.state.documentArray;
            const documentArray = docs.map(doc => {
                doc.data = JSON.stringify(doc.data);
                return doc;
            });
            documentArrayCallback(documentArray);
        }
    }

    private renderExtendTool = (): React.ReactNode => {
        if (!isMobile) {
            return (
                <ExtendTool
                    oss={this.state.ossConfigObj}
                    userId={this.props.userId}
                    onProgress={this.progress}
                    toolBarPosition={this.props.toolBarPosition}/>
            );
        } else {
            return null;
        }
    }

    private handleDocumentArrayState = (state: PPTDataType[]): void => {
        this.setState({documentArray: state});
    }

    private getCameraState = (roomState: RoomState): ViewMode => {
        const {userId} = this.props;
        if (this.props.isManagerOpen === null) {
            return ViewMode.Freedom;
        } else {
            if (this.props.identity === IdentityType.host) {
                const userSelf: HostUserType = (roomState.globalState as any).hostInfo;
                if (userSelf) {
                    return userSelf.cameraState;
                } else {
                    return ViewMode.Freedom;
                }
            } else if (this.props.identity === IdentityType.guest) {
                const userSelf: GuestUserType = (roomState.globalState as any).guestUsers.find((user: GuestUserType) => user.userId === userId);
                if (userSelf) {
                    return userSelf.cameraState;
                } else {
                    return ViewMode.Freedom;
                }
            } else {
                return ViewMode.Follower;
            }
        }
    }

    private getDisableCameraTransformState = (roomState: RoomState): boolean => {
        const {userId} = this.props;
        if (this.props.isManagerOpen === null) {
            return false;
        } else {
            if (this.props.identity === IdentityType.host) {
                const userSelf: HostUserType = (roomState.globalState as any).hostInfo;
                if (userSelf) {
                    return userSelf.disableCameraTransform;
                } else {
                    return true;
                }
            } else if (this.props.identity === IdentityType.guest) {
                const userSelf: GuestUserType = (roomState.globalState as any).guestUsers.find((user: GuestUserType) => user.userId === userId);
                if (userSelf) {
                    return userSelf.disableCameraTransform;
                } else {
                    return true;
                }
            } else {
                return true;
            }
        }
    }

    private handleScreenLock = (room: Room): void => {
        room.disableCameraTransform = roomStore.isScreenZoomLock;
    }
    public render(): React.ReactNode {
        const {phase, connectedFail, room, roomState} = this.state;
        const {loadingSvgUrl} = this.props;
        if (connectedFail || phase === RoomPhase.Disconnected) {
            return <PageError/>;
        } else if (phase === RoomPhase.Reconnecting) {
            return <LoadingPage
                        phase={phase}
                        loadingSvgUrl={loadingSvgUrl}/>;
        } else if (phase === RoomPhase.Connecting ||
            phase === RoomPhase.Disconnecting) {
            return <LoadingPage
                        phase={phase}
                        loadingSvgUrl={loadingSvgUrl}/>;
        } else if (!room) {
            return <LoadingPage
                        phase={phase}
                        loadingSvgUrl={loadingSvgUrl}/>;
        } else if (!roomState) {
            return <LoadingPage
                        phase={phase}
                        loadingSvgUrl={loadingSvgUrl}/>;
        } else {
            const isReadOnly = this.detectIsReadOnly(roomState, room);
            const cameraState = this.getCameraState(roomState);
            const disableCameraTransform = this.getDisableCameraTransformState(roomState);
            this.handleScreenLock(room);
            return (
                <RoomContextProvider value={{
                    onColorArrayChange: this.props.colorArrayStateCallback,
                    whiteboardLayerDownRef: this.state.whiteboardLayerDownRef!,
                    room: room,
                }}>
                    <div className="realtime-box">
                        <MenuBox
                            onRef={this.onRef}
                            isSidePreview={this.state.menuInnerState === MenuInnerType.AnnexBox}
                            pagePreviewPosition={this.props.pagePreviewPosition}
                            setMenuState={this.setPreviewMenuState}
                            isVisible={this.state.isMenuVisible}
                        >
                            {this.renderMenuInner(roomState)}
                        </MenuBox>
                        <MenuBox
                            pagePreviewPosition={PagePreviewPositionEnum.left}
                            setMenuState={this.setFileMenuState}
                            sideMenuWidth={336}
                            isVisible={this.state.isFileOpen}
                        >
                            <WhiteboardFile
                                roomState={roomState}
                                handleFileState={this.handleFileState}
                                isFileMenuOpen={this.state.isFileMenuOpen}
                                handleDocumentArrayState={this.handleDocumentArrayState}
                                uuid={this.props.uuid}
                                documentArray={this.state.documentArray}
                                room={room}/>
                        </MenuBox>
                        <Dropzone
                            accept={"image/*"}
                            disableClick={true}
                            className="whiteboard-out-box"
                            onDrop={this.onDropFiles}>
                            <TopLoadingBar loadingPercent={this.state.ossPercent}/>
                            <TopLoadingBar style={{backgroundColor: "red"}} loadingPercent={this.state.converterPercent}/>
                            <WhiteboardTopLeft
                                clickLogoCallback={this.props.clickLogoCallback}
                                roomRenameCallback={this.props.roomRenameCallback}
                                identity={this.props.identity}
                                roomName={this.props.roomName}
                                logoUrl={this.props.logoUrl}/>
                            <WhiteboardTopRight
                                roomState={roomState}
                                isManagerOpen={this.state.isManagerOpen}
                                exitRoomCallback={this.props.exitRoomCallback}
                                handleManagerState={this.handleManagerState}
                                deviceType={this.state.deviceType}
                                identity={this.props.identity}
                                userName={this.props.userName}
                                userId={this.props.userId}
                                room={room}
                                replayCallback={this.props.replayCallback}
                                isReadOnly={isReadOnly}
                                userAvatarUrl={this.props.userAvatarUrl}/>
                            <WhiteboardBottomLeft
                                roomState={roomState}
                                handleFileState={this.handleFileState}
                                isManagerOpen={this.state.isManagerOpen}
                                isReadOnly={isReadOnly}
                                identity={this.props.identity}
                                deviceType={this.state.deviceType}
                                room={room}/>
                            <WhiteboardBottomRight
                                roomState={roomState}
                                isManagerOpen={this.state.isManagerOpen}
                                deviceType={this.state.deviceType}
                                userId={this.props.userId}
                                isReadOnly={isReadOnly}
                                handleChatState={this.handleChatState}
                                handleAnnexBoxMenuState={this.handleAnnexBoxMenuState}
                                room={room}/>
                            {this.renderRecordComponent(roomState)}
                            <ToolBox
                                room={room}
                                roomState={roomState}
                                isReadOnly={isReadOnly}
                                toolBarPosition={this.props.toolBarPosition}
                                colorConfig={this.props.defaultColorArray}
                                customerComponent={[
                                    <UploadBtn
                                        toolBarPosition={this.props.toolBarPosition}
                                        uuid={this.props.uuid}
                                        deviceType={this.state.deviceType}
                                        oss={this.state.ossConfigObj}
                                        ossUploadCallback={this.props.ossUploadCallback}
                                        room={room}
                                        documentFileCallback={this.documentFileCallback}
                                        uploadToolBox={this.props.uploadToolBox}
                                        roomToken={this.state.roomToken}
                                        onProgress={this.progress}
                                        whiteboardRef={this.state.whiteboardLayerDownRef}
                                    />,
                                    this.renderExtendTool(),
                                ]}
                                customerComponentPosition={CustomerComponentPositionType.end}
                                />
                            <div
                                style={{pointerEvents: roomStore.boardPointerEvents}}
                                className="whiteboard-tool-layer-down"
                                ref={this.setWhiteboardLayerDownRef}>
                                <RoomWhiteboard room={room} style={{width: "100%", height: "100%"}}/>
                            </div>
                            <WebPpt roomState={roomState} identity={this.props.identity} ppt={(room.state.globalState as any).ppt} room={room}/>
                        </Dropzone>
                        {!isMobile &&
                        <WhiteboardManager
                            roomState={roomState}
                            elementId={this.props.elementId}
                            uuid={this.props.uuid}
                            userAvatarUrl={this.props.userAvatarUrl}
                            userName={this.props.userName}
                            userId={this.props.userId}
                            isChatOpen={this.state.isChatOpen}
                            rtc={this.props.rtc}
                            identity={this.props.identity}
                            isManagerOpen={this.state.isManagerOpen}
                            handleManagerState={this.handleManagerState}
                            cameraState={cameraState}
                            disableCameraTransform={disableCameraTransform}
                            room={room}/>}
                        {isReadOnly &&
                        <div onClick={() => message.warning("老师正在讲课，屏幕被锁定。")} className="lock-icon">
                            <Icon type="lock"/>
                        </div>}
                    </div>
                </RoomContextProvider>
            );
        }
    }
}

export default NetlessRoom;
