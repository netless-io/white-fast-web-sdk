import {Room, WhiteScene} from "white-web-sdk";
export class WebCourseController {

    private readonly setGlobalState: (netlessState: any) => void;
    private handleStateFuncArray: ((netlessState: any) => void)[] = [];
    private iframeState: any;
    private room: Room;
    private readonly domId: string;
    public constructor(domId: string, room: Room, setGlobalState: (netlessState: any) => void) {
        this.setGlobalState = setGlobalState;
        this.domId = domId;
        this.room = room;
        window.addEventListener("message", this.handleReceiveMessage, false);
    }

    private handleReceiveMessage = (evt: any): void => {
        this.setGlobalState(evt.data);
        const iframeMessage = JSON.parse(evt.data);
        this.handlePage(iframeMessage);
        if (this.handleStateFuncArray.length > 0) {
            for (const handleStateFunc of this.handleStateFuncArray) {
                try {
                    handleStateFunc(evt.data);
                } catch (err) {
                    console.log("addStateChangeListener error" + err);
                }
            }
        }
    }

    private addPages = (pages: number): void => {
        const currentScenes = this.room.state.sceneState.scenes;
        const scenesLength = currentScenes.length;
        const newScenes = [...currentScenes];

        for (let i = 0; i < (pages - scenesLength); i++) {
            newScenes.push({name: `${scenesLength + i}`, componentsCount: 1});
        }
        if (pages !== scenesLength) {
            const scenePath = this.room.state.sceneState.scenePath;
            const pathName = this.pathName(scenePath);
            this.room.putScenes(`/${pathName}`, newScenes);
        }
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
    private setPage = (index: number): void => {
        this.room.setSceneIndex(index - 1);
    }
    private handlePage = (iframeMessage: any): void => {
        if (iframeMessage.method === "onPagenum") {
            console.log(iframeMessage.totalPages);
            this.addPages(iframeMessage.totalPages);
        }
        if (iframeMessage.method === "onJumpPage") {
            console.log(iframeMessage.toPage);
            this.setPage(iframeMessage.toPage);
        }
    }

    public addStateChangeListener = (handleStateChange: (netlessState: any) => void): void => {
        this.handleStateFuncArray.push(handleStateChange);
    }

    public getIframeState = (): any => {
        return this.iframeState;
    }

    public setIframeState = (param: string | {[key: string]: any}): void => {
        if (typeof param === "string") {
            this.iframeState = {
                ...this.iframeState,
                tuoKeJson: param,
            };
            this.handlePushToIframe(this.domId, this.iframeState);
        } else {
            this.iframeState = {
                ...this.iframeState,
                ...param,
            };
            this.handlePushToIframe(this.domId, this.iframeState);
        }
    }

    public deleteIframeState = (stateKey: string): void => {
        delete this.iframeState[stateKey];
        this.handlePushToIframe(this.domId, this.iframeState);
    }

    private handlePushToIframe = (domId: string, netlessState: any): void => {
        const childFrameObj = document.getElementById(domId) as HTMLIFrameElement;
        if (childFrameObj) {
            if (netlessState.tuoKeJson) {
                childFrameObj.contentWindow!.postMessage(netlessState.tuoKeJson, "*");
            } else {
                childFrameObj.contentWindow!.postMessage(netlessState, "*");
            }
        }
    }
}
