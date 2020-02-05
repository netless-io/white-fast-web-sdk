import * as React from "react";
import uuidv4 from "uuid/v4";
import "./ExtendToolInner.less";
import {
    Room,
} from "white-web-sdk";
import {Button, Input, Modal, Tabs, Tooltip, Upload} from "antd";
import web_plugin from "../../assets/image/web_plugin.svg";
import video_plugin from "../../assets/image/video_plugin.svg";
import audio_plugin from "../../assets/image/audio_plugin.svg";
import {PPTProgressListener, UploadManager} from "../upload/UploadManager";
import {observer} from "mobx-react";
import {LanguageEnum} from "../../pages/NetlessRoomTypes";
import {roomStore} from "../../models/RoomStore";
import { projectStore } from "../../models/ProjectStore";
const { TabPane } = Tabs;
export type ExtendToolInnerProps = {
    whiteboardLayerDownRef: HTMLDivElement;
    client: any;
    room: Room;
    onProgress: PPTProgressListener,
    userId: string;
};

export type ExtendToolInnerStates = {
    activeKey: string;
    url: string | null;
};

@observer
class ExtendToolInner extends React.Component<ExtendToolInnerProps, ExtendToolInnerStates> {
    public constructor(props: ExtendToolInnerProps) {
        super(props);
        this.state = {
            activeKey: "1",
            url: null,
        };
    }

    private handleTabsChange = (evt: any): void => {
        if (evt === "1") {
            this.setState({activeKey: evt});
        } else {
            this.setState({activeKey: evt});
        }
    }
    private uploadVideo = async (event: any): Promise<void> => {
        try {
            const uploadManager = new UploadManager(this.props.client, this.props.room);
            const res = await uploadManager.addFile(`${uuidv4()}/${event.file.name}`, event.file,  this.props.onProgress);
            const isHttps = res.indexOf("https") !== -1;
            let url;
            if (isHttps) {
                url = res;
            } else {
                url = res.replace("http", "https");
            }
            if (url) {
                this.props.room.insertPlugin("video", {
                    originX: 0,
                    originY: 0,
                    width: 480,
                    height: 270,
                    attributes: {
                        pluginVideoUrl: url,
                    },
                });
            }
        } catch (err) {
            console.log(err);
        }
    }
    private uploadAudio = async (event: any): Promise<void> => {
        try {
            const uploadManager = new UploadManager(this.props.client, this.props.room);
            const res = await uploadManager.addFile(`${uuidv4()}/${event.file.name}`, event.file,  this.props.onProgress);
            const isHttps = res.indexOf("https") !== -1;
            let url;
            if (isHttps) {
                url = res;
            } else {
                url = res.replace("http", "https");
            }
            if (url) {
                this.props.room.insertPlugin("audio", {
                    originX: 0,
                    originY: 0,
                    width: 480,
                    height: 86,
                    attributes: {
                        pluginAudioUrl: url,
                    },
                });
            }
        } catch (err) {
            console.log(err);
        }
    }
    private isURL(): boolean {// 验证url
        const strRegex = "^((https|http|ftp|rtsp|mms)?://)"
            + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" // ftp的user@
            + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
            + "|" // 允许IP和DOMAIN（域名）
            + "([0-9a-z_!~*'()-]+\.)*" // 域名- www.
            + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名
            + "[a-z]{2,6})" // first level domain- .com or .museum
            + "(:[0-9]{1,4})?" // 端口- :80
            + "((/?)|" // a slash isn't required if there is no file name
            + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
        const re = new RegExp(strRegex);
        if (this.state.url) {
            return re.test(this.state.url);
        } else {
            return false;
        }
    }


    public render(): React.ReactNode {
        return (
            <div className="extend-inner-box">
                <Tabs activeKey={this.state.activeKey} onChange={this.handleTabsChange}>
                    <TabPane tab={projectStore.isEnglish() ? "Plugins" : "插件教具"} key="1">
                        <div className="extend-icon-out-box">
                            <div className="extend-icon-box">
                                <Tooltip placement="bottom" title={projectStore.isEnglish() ? "Web page" : "H5 课件"}>
                                    <div onClick={() => {
                                        roomStore.isInputH5Visible = true;
                                    }} className="extend-inner-icon">
                                        <img src={web_plugin}/>
                                    </div>
                                </Tooltip>
                            </div>
                            <div className="extend-icon-box">
                                <Tooltip placement="bottom" title={projectStore.isEnglish() ? "Upload video" : "上传视频"}>
                                    <Upload
                                        accept={"video/mp4"}
                                        showUploadList={false}
                                        customRequest={this.uploadVideo}>
                                        <div className="extend-inner-icon">
                                            <img style={{width: 26}} src={video_plugin}/>
                                        </div>
                                    </Upload>
                                </Tooltip>
                            </div>
                            <div className="extend-icon-box">
                                <Tooltip placement="bottom" title={projectStore.isEnglish() ? "Upload video" : "上传音频"}>
                                    <Upload
                                        accept={"audio/mp3"}
                                        showUploadList={false}
                                        customRequest={this.uploadAudio}>
                                        <div className="extend-inner-icon">
                                            <img style={{width: 26}} src={audio_plugin}/>
                                        </div>
                                    </Upload>
                                </Tooltip>
                            </div>
                        </div>
                    </TabPane>
                    <TabPane tab={projectStore.isEnglish() ? "Graph" : "常用图形"} key="2">
                    </TabPane>
                </Tabs>
                <Modal
                    visible={roomStore.isInputH5Visible}
                    footer={null}
                    title={projectStore.isEnglish() ? "H5 课件" : "H5 课件"}
                    onCancel={() => roomStore.isInputH5Visible = false}
                >
                    <div className="whiteboard-share-box">
                        <div className="whiteboard-share-text-box">
                            <Input onChange={event => this.setState({url: event.target.value})} placeholder={"输入 H5 课件地址"} size="large"/>
                            <Button
                                disabled={!this.isURL()}
                                type="primary"
                                onClick={() => {
                                    this.props.room.setGlobalState({h5PptUrl: this.state.url});
                                    roomStore.isInputH5Visible = false;
                                }}
                                style={{marginTop: 16, width: 240}}
                                size="large">
                                提交 H5 课件地址
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default ExtendToolInner;
