import * as React from "react";
import * as ReactDOM from "react-dom";
import NetlessPlayer from "../pages/NetlessPlayer";
import NetlessRoom from "../pages/NetlessRoom";
import {
    Room,
    Player,
} from "white-web-sdk";

export interface RoomFacadeObject {
    release(): void;
    setPptPreviewShow(): void;
    setPptPreviewHide(): void;
}

export type RoomFacadeSetter = (delegate: RoomFacadeObject | null) => void;


export const RoomFacade = (element: string, config: any): RoomFacadeObject => {
    let delegate: RoomFacadeObject | null = null;
    const roomFacadeSetter: RoomFacadeSetter = _delegate => delegate = _delegate;
    ReactDOM.render(
        <NetlessRoom elementId={element} roomFacadeSetter={roomFacadeSetter} {...config}/>,
        document.getElementById(element),
    );

    const result: RoomFacadeObject = {
        release: () => delegate!.release(),
        setPptPreviewShow: () => delegate!.setPptPreviewShow(),
        setPptPreviewHide: () => delegate!.setPptPreviewHide(),
    };
    return result;
};

export interface PlayerFacadeObject {
    release(): void;
    getPlayer(): Player | undefined;
}

export type PlayerFacadeSetter = (delegate: PlayerFacadeObject | null) => void;

export const PlayerFacade = (element: string, config: any): PlayerFacadeObject => {
    let delegate: PlayerFacadeObject | null = null;
    const playerFacadeSetter: PlayerFacadeSetter = _delegate => delegate = _delegate;
    ReactDOM.render(
        <NetlessPlayer elementId={element} playerFacadeSetter={playerFacadeSetter} {...config}/>,
        document.getElementById(element),
    );
    const result: PlayerFacadeObject = {
        release: () => delegate!.release(),
        getPlayer: () => delegate!.getPlayer(),
    };
    return result;
};

