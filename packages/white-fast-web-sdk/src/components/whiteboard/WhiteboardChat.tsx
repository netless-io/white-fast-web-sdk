import * as React from "react";
import "./WhiteboardChat.less";
import {
    ThemeProvider,
    MessageGroup,
    Message,
    MessageText,
    MessageList,
    TextComposer,
    Row,
    TextInput,
    SendButton,
} from "@livechat/ui-kit";
import {Room, Player} from "white-web-sdk";
import {MessageType} from "./WhiteboardBottomRight";
import * as empty from "../../assets/image/empty.svg";
import {IdentityType, LanguageEnum} from "../../pages/NetlessRoomTypes";
import { projectStore } from "../../models/ProjectStore";

const timeout = (ms: any) => new Promise(res => setTimeout(res, ms));

export type WhiteboardChatProps = {
    userId: string;
    messages: MessageType[];
    userAvatarUrl?: string;
    userName?: string;
    room?: Room;
    player?: Player;
    identity?: IdentityType;
    elementId: string;
};

export type WhiteboardChatStates = {
    url: string;
    isLandscape: boolean;
};


export default class WhiteboardChat extends React.Component<WhiteboardChatProps, WhiteboardChatStates> {

    private messagesEnd: HTMLDivElement | null = null;

    public constructor(props: WhiteboardChatProps) {
        super(props);
        this.state = {
            url: "",
            isLandscape: true,
        };
        this.scrollToBottom = this.scrollToBottom.bind(this);
    }

    private scrollToBottom(): void {
        if (this.messagesEnd) {
            this.messagesEnd.scrollIntoView({behavior: "smooth"});
        }
    }

    private detectLandscape = (): void => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const isLandscape = (width / height) >= 1;
        this.setState({isLandscape: isLandscape});
    }
    private getElementHeight = (): number => {
        const {elementId} = this.props;
        const documentDom = document.getElementById(elementId);
        if (documentDom) {
            return documentDom.clientHeight;
        } else {
            return window.innerHeight;
        }
    }
    public componentWillUnmount(): void {
        window.removeEventListener("resize", this.detectLandscape);
    }

    public async componentDidMount(): Promise<void> {
        this.detectLandscape();
        window.addEventListener("resize", this.detectLandscape);
        await timeout(0);
        this.scrollToBottom();

    }

    private getAvatarUrl = (id: any): string | null => {
        const canvasArray: any = document.getElementsByClassName(`avatar-${id}`).item(0);
        if (canvasArray) {
            return canvasArray.toDataURL();
        } else {
            return null;
        }
    }

    public async UNSAFE_componentWillReceiveProps(): Promise<void> {
        await timeout(0);
        this.scrollToBottom();
    }

    private renderTextComposer = (): React.ReactNode => {
        const {room, identity} = this.props;
        if (room && identity !== IdentityType.listener) {
            return (
                <div className="chat-box-input">
                    <TextComposer
                        onSend={(event: any) => {
                            if (this.props.room) {
                                this.props.room.dispatchMagixEvent("message", {
                                    name: this.props.userName,
                                    avatar: this.props.userAvatarUrl,
                                    id: this.props.userId,
                                    messageInner: [event],
                                });
                            }
                        }}
                    >
                        <Row align="center">
                            <TextInput placeholder={projectStore.isEnglish() ? "Enter chat content..." : "输入聊天内容..."} fill="true"/>
                            <SendButton fit />
                        </Row>
                    </TextComposer>
                </div>
            );
        } else {
            return null;
        }
    }

    public render(): React.ReactNode {
        const messages: MessageType[] = this.props.messages;
        if (messages.length > 0) {
            let previousName = messages[0].name;
            let previousId = messages[0].id;

            for (let i = 1; i < messages.length; ++ i) {
                const message = messages[i];
                if (previousName === message.name && previousId === message.id) {
                    messages[i - 1].messageInner.push(...message.messageInner);
                    messages.splice(i, 1);
                    i --;
                }
                previousName = message.name;
                previousId = message.id;
            }
        }
        let messageNodes: React.ReactNode = null;
        if (messages.length > 0) {
            messageNodes = messages.map((data: MessageType, index: number) => {
                const messageTextNode = data.messageInner.map((inner: string, index: number) => {
                    return (
                        <Message key={`${index}`}
                                 isOwn={this.props.userId === data.id} authorName={data.name}
                        >
                            <MessageText>{inner}</MessageText>
                        </Message>
                    );
                });
                return (
                    <MessageGroup
                        key={`${index}`}
                        avatar={data.avatar ? data.avatar : this.getAvatarUrl(data.id)}
                        isOwn={this.props.userId === data.id}
                        onlyFirstWithMeta
                    >
                        {messageTextNode}
                    </MessageGroup>
                );
            });
        }
        return (
            <ThemeProvider
                theme={{
                    vars: {
                        "avatar-border-color": "#005BF6",
                    },
                    FixedWrapperMaximized: {
                        css: {
                            boxShadow: "0 0 1em rgba(0, 0, 0, 0.1)",
                        },
                    },
                    Message: {},
                    MessageText: {
                        css: {
                            backgroundColor: "#F8F8F8",
                            borderRadius: 8,
                        },
                    },
                    Avatar: {
                        size: "32px", // special Avatar's property, supported by this component
                        css: { // css object with any CSS properties
                            borderColor: "blue",
                        },
                    },
                    TextComposer: {
                        css: {
                            "color": "#000",
                        },
                    },
                }}
            >
                <div style={{height: this.getElementHeight() - 360}} className="chat-inner-box">
                    <div style={{height: this.getElementHeight() - 407}} className="chat-box-message">
                        {messageNodes !== null ? <MessageList>
                            {messageNodes}
                        </MessageList> : <div className="chat-box-message-empty">
                            <img src={empty}/>
                            <div>
                                {projectStore.isEnglish() ? "No chat history ~" : "暂无聊天记录~"}
                            </div>
                        </div>}
                    </div>
                    {this.renderTextComposer()}
                </div>
            </ThemeProvider>
        );
    }
}
