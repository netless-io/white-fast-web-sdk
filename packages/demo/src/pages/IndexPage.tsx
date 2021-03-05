import * as React from "react";
import {Input, Button, Tabs} from "antd";
import "./IndexPage.less";
import {RouteComponentProps} from "react-router";
import netless_black from "../assets/image/netless_black.svg";
import {Link} from "@netless/i18n-react-router";
import {FormComponentProps} from "antd/lib/form";
export enum IdentityType {
    host = "host",
    guest = "guest",
    listener = "listener",
}

const { TabPane } = Tabs;

export type IndexPageProps = RouteComponentProps<{}> & FormComponentProps;
export type IndexPageStates = {
    name: string;
    url: string;
};

export default class IndexPage extends React.Component<IndexPageProps, IndexPageStates> {
    public constructor(props: IndexPageProps) {
        super(props);
        this.state = {
            name: "",
            url: "",
        };
    }
    private handleWhiteboardClickBtn = (): void => {
        this.props.history.push(`/whiteboard/${IdentityType.host}`);
    }
    private handleClickBtnUrl = (): void => {
        const isUrl = this.state.url.substring(0, 4) === "http";
        if (this.state.url) {
            if (isUrl) {
                window.open(this.state.url, "_self");
            } else {
                if (this.state.url.length === 32) {
                    const isNotLive = this.state.url.search("live") === -1;
                    if (isNotLive) {
                        const isNotInteractive = this.state.url.search("live") === -1;
                        if (isNotInteractive) {
                            this.props.history.push(`/classroom/${IdentityType.host}/${this.state.url}/`);
                        } else {
                            this.props.history.push(`/classroom/${IdentityType.guest}/${this.state.url}/`);
                        }
                    } else {
                        this.props.history.push(`/classroom/${IdentityType.listener}/${this.state.url}/`);
                    }
                }
            }
        }
    }

    public render(): React.ReactNode {
        return (
            <div className="page-input-box">
                <Link to="/">
                    <img src={netless_black}/>
                </Link>
                <div className="page-input-left-box">
                    <div className="page-input-left-mid-box">
                        <Tabs className="page-input-left-mid-box-tab" defaultActiveKey="1">
                            <TabPane tab="创建房间" key="1">
                                <div className="page-input-left-inner-box">
                                    <Input className="page-input" onChange={e => this.setState({name: e.target.value})} size={"large"} placeholder={"输入房间名称"}/>
                                    <Button
                                        type="primary"
                                        size="large"
                                        onClick={this.handleWhiteboardClickBtn}
                                        className="name-button">
                                        Create a whiteboard room
                                    </Button>
                                </div>
                            </TabPane>
                            <TabPane tab="加入房间" key="2">
                                <div className="page-input-left-inner-box">
                                    <Input className="page-input"
                                           onChange={e => this.setState({url: e.target.value})}
                                           size={"large"} placeholder={"输入房间地址或者 UUID"}/>
                                    <Button
                                        size="large"
                                        type="primary"
                                        disabled={!this.state.url}
                                        onClick={this.handleClickBtnUrl}
                                        className="name-button">
                                        To join the room
                                    </Button>
                                </div>
                            </TabPane>
                        </Tabs>
                    </div>
                </div>
                <div className="page-input-right-box"/>
            </div>);
    }
}
