import * as React from "react";
import {Popover, Upload} from "antd";
import * as OSS from "ali-oss";
import {ToolBoxUpload} from "./ToolBoxUpload";
import {PPTProgressListener, UploadManager} from "./UploadManager";
import "./UploadBtn.less";
import {DeviceType, PptKind, Room, WhiteWebSdk} from "white-web-sdk";
import * as image_icon from "../../assets/image/image_icon.svg";
import * as image_transform from "../../assets/image/image_transform.svg";
import * as web_transform from "../../assets/image/web_transform.svg";
import {TooltipPlacement} from "antd/lib/tooltip";
import {PPTDataType} from "../../components/menu/PPTDatas";
import {LanguageEnum, ToolBarPositionEnum, UploadDocumentEnum, UploadToolBoxType} from "../../pages/NetlessRoomTypes";
import { projectStore } from "../../models/ProjectStore";
export type ToolBoxUploadBoxState = {
    toolBoxColor: string,
};

export const FileUploadStatic: string = "application/pdf, " +
    "application/vnd.openxmlformats-officedocument.presentationml.presentation, " +
    "application/vnd.ms-powerpoint, " +
    "application/msword, " +
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type UploadBtnProps = {
    oss: {
        accessKeyId: string,
        accessKeySecret: string,
        region: string,
        bucket: string,
        folder: string,
        prefix: string,
    },
    room: Room,
    uuid: string,
    roomToken: string | null,
    whiteboardRef?: HTMLDivElement,
    onProgress?: PPTProgressListener,
    toolBarPosition?: ToolBarPositionEnum;
    uploadToolBox?: UploadToolBoxType[],
    ossUploadCallback?: (res: any) => void;
    documentFileCallback: (data: PPTDataType) => void;
    deviceType: DeviceType;
};

export default class UploadBtn extends React.Component<UploadBtnProps, ToolBoxUploadBoxState> {
    private readonly client: any;
    public constructor(props: UploadBtnProps) {
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

    private uploadStatic = async (event: any): Promise<void> => {
        const {ossUploadCallback, uuid, documentFileCallback} = this.props;
        const uploadManager = new UploadManager(this.client, this.props.room, ossUploadCallback);
        const whiteWebSdk = new WhiteWebSdk();
        const pptConverter = whiteWebSdk.pptConverter(this.props.roomToken!);
        await uploadManager.convertFile(
            event.file,
            pptConverter,
            PptKind.Static,
            this.props.oss.folder,
            uuid,
            documentFileCallback,
            this.props.onProgress);
    }

    private uploadDynamic = async (event: any): Promise<void> => {
        const {ossUploadCallback, uuid, documentFileCallback} = this.props;
        const uploadManager = new UploadManager(this.client, this.props.room, ossUploadCallback);
        const whiteWebSdk = new WhiteWebSdk();
        const pptConverter = whiteWebSdk.pptConverter(this.props.roomToken!);
        await uploadManager.convertFile(
            event.file,
            pptConverter,
            PptKind.Dynamic,
            this.props.oss.folder,
            uuid,
            documentFileCallback,
            this.props.onProgress,
            );
    }

    private uploadImage = async (event: any): Promise<void> => {
        const {ossUploadCallback} = this.props;
        const uploadFileArray: File[] = [];
        uploadFileArray.push(event.file);
        const uploadManager = new UploadManager(this.client, this.props.room, ossUploadCallback);
        if (this.props.whiteboardRef) {
            const {clientWidth, clientHeight} = this.props.whiteboardRef;
            await uploadManager.uploadImageFiles(uploadFileArray, clientWidth / 2, clientHeight / 2, this.props.onProgress);
        } else {
            const clientWidth = window.innerWidth;
            const clientHeight = window.innerHeight;
            await uploadManager.uploadImageFiles(uploadFileArray, clientWidth / 2, clientHeight / 2, this.props.onProgress);
        }
    }

    private renderUploadButton = (): React.ReactNode => {
        const {uploadToolBox} = this.props;
        let Nodes: React.ReactNode[];
        if (uploadToolBox) {
            Nodes = uploadToolBox.map((data: UploadToolBoxType, index: number) => {
                if (data.type === UploadDocumentEnum.image) {
                    if (data.enable) {
                        return (
                            <Upload
                                key={`${index}`}
                                accept={"image/*"}
                                showUploadList={false}
                                customRequest={this.uploadImage}>
                                <div className="popover-section">
                                    <div className="popover-section-inner">
                                        <div className="popover-section-image">
                                            <img width={68} src={data.icon ? data.icon : image_icon}/>
                                        </div>
                                        <div className="popover-section-script">
                                            <div className="popover-section-title">{data.title ? data.title : (projectStore.isEnglish() ? "upload image" : "上传图片")}</div>
                                            <div className="popover-section-text">{data.script ? data.script : (projectStore.isEnglish() ? "Support for common formats." : "支持常见格式，可以改变图片大小和位置。")}</div>
                                        </div>
                                    </div>
                                </div>
                            </Upload>
                        );
                    } else {
                        return null;
                    }
                } else if (data.type === UploadDocumentEnum.dynamic_conversion) {
                    if (data.enable) {
                        return (
                            <Upload
                                key={`${index}`}
                                disabled={!this.props.roomToken}
                                accept={"application/vnd.openxmlformats-officedocument.presentationml.presentation"}
                                showUploadList={false}
                                customRequest={this.uploadDynamic}>
                                <div className="popover-section">
                                    <div className="popover-section-inner">
                                        <div className="popover-section-image">
                                            <img width={72} src={data.icon ? data.icon : web_transform}/>
                                        </div>
                                        <div className="popover-section-script">
                                            <div className="popover-section-title">{data.title ? data.title : (projectStore.isEnglish() ? "PPTX transfer web" : "资料转网页")}</div>
                                            <div className="popover-section-text">{data.script ? data.script : (projectStore.isEnglish() ? "Turn pptx into a web page for syncing." : "支持 pptx，如果是 ppt 格式文件，请手动转换。")}</div>
                                        </div>
                                    </div>
                                </div>
                            </Upload>
                        );
                    } else {
                        return null;
                    }
                } else {
                    if (data.enable) {
                        return (
                            <Upload
                                key={`${index}`}
                                disabled={!this.props.roomToken}
                                accept={FileUploadStatic}
                                showUploadList={false}
                                customRequest={this.uploadStatic}>
                                <div className="popover-section">
                                    <div className="popover-section-inner">
                                        <div className="popover-section-image">
                                            <img width={72} src={data.icon ? data.icon : image_transform}/>
                                        </div>
                                        <div className="popover-section-script">
                                            <div className="popover-section-title">{data.title ? data.title : (projectStore.isEnglish() ? "Docs transfer image" : "资料转图片")}</div>
                                            <div className="popover-section-text">{data.script ? data.script : (projectStore.isEnglish() ? "Support ppt、pptx、word and pdf." : "支持 ppt、pptx、word 以及 pdf。")}</div>
                                        </div>
                                    </div>
                                </div>
                            </Upload>
                        );
                    } else {
                        return null;
                    }
                }
            });
            return Nodes;
        } else {
            return [
                <Upload
                    key={`image`}
                    accept={"image/*"}
                    showUploadList={false}
                    customRequest={this.uploadImage}>
                    <div className="popover-section">
                        <div className="popover-section-inner">
                            <div className="popover-section-image">
                                <img width={68} src={image_icon}/>
                            </div>
                            <div className="popover-section-script">
                                <div className="popover-section-title">{projectStore.isEnglish() ? "upload image" : "上传图片"}</div>
                                <div className="popover-section-text">{projectStore.isEnglish() ? "Support for common formats." : "支持常见格式，可以改变图片大小和位置。"}</div>
                            </div>
                        </div>
                    </div>
                </Upload>,
                <Upload
                    key={`dynamic`}
                    disabled={!this.props.roomToken}
                    accept={"application/vnd.openxmlformats-officedocument.presentationml.presentation"}
                    showUploadList={false}
                    customRequest={this.uploadDynamic}>
                    <div className="popover-section">
                        <div className="popover-section-inner">
                            <div className="popover-section-image">
                                <img width={72} src={web_transform}/>
                            </div>
                            <div className="popover-section-script">
                                <div className="popover-section-title">{projectStore.isEnglish() ? "PPTX transfer web" : "资料转网页"}</div>
                                <div className="popover-section-text">{projectStore.isEnglish() ? "Turn pptx into a web page for syncing." : "支持 pptx，如果是 ppt 格式文件，请手动转换。"}</div>
                            </div>
                        </div>
                    </div>
                </Upload>,
                <Upload
                    key={`static`}
                    disabled={!this.props.roomToken}
                    accept={FileUploadStatic}
                    showUploadList={false}
                    customRequest={this.uploadStatic}>
                    <div className="popover-section">
                        <div className="popover-section-inner">
                            <div className="popover-section-image">
                                <img width={72} src={image_transform}/>
                            </div>
                            <div className="popover-section-script">
                                <div className="popover-section-title">{projectStore.isEnglish() ? "Docs transfer image" : "资料转图片"}</div>
                                <div className="popover-section-text">{projectStore.isEnglish() ? "Support ppt、pptx、word and pdf." : "支持 ppt、pptx、word 以及 pdf。"}</div>
                            </div>
                        </div>
                    </div>
                </Upload>,
            ];
        }
    }

    private renderPopoverContent = (): React.ReactNode => {
        const {uploadToolBox} = this.props;
        if (uploadToolBox) {
            const length = uploadToolBox.filter(data => data.enable).length;
            return (
                <div style={{height: 118 * length}} className="popover-box">
                    {this.renderUploadButton()}
                </div>
            );
        } else {
            return (
                <div style={{height: 118 * 3}} className="popover-box">
                    {this.renderUploadButton()}
                </div>
            );
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
            case ToolBarPositionEnum.left
            : {
                return "left";
            }
            default: {
                return "right";
            }
        }
    }

    private handleVisibleChange = (e: any): void => {
        if (e) {
            this.setState({toolBoxColor: "#141414"});
        } else {
            this.setState({toolBoxColor: "#A2A7AD"});
        }
    }

    public render(): React.ReactNode {
        const {toolBarPosition} = this.props;
        return (
            <Popover trigger="click" onVisibleChange={this.handleVisibleChange} placement={this.handlePlacement()} content={this.renderPopoverContent()}>
                <div
                    onMouseEnter={() => this.setState({toolBoxColor: "#141414"})}
                    onMouseLeave={() => this.setState({toolBoxColor: "#A2A7AD"})}
                    className={(toolBarPosition === ToolBarPositionEnum.left || toolBarPosition === ToolBarPositionEnum.right || toolBarPosition === undefined) ?
                        "tool-box-cell-box-left" : "tool-box-cell-box"}>
                    <div className="tool-box-cell">
                        <ToolBoxUpload color={this.state.toolBoxColor}/>
                    </div>
                </div>
            </Popover>
        );
    }
}
