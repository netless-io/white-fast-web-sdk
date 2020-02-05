import * as React from "react";
import {Room} from "white-web-sdk";
export type RoomContext = {
    whiteboardLayerDownRef: HTMLDivElement;
    room: Room;
    onColorArrayChange?: (colorArray: string[]) => void;
};

const context = React.createContext<RoomContext>(undefined as any);

export const RoomContextProvider = context.Provider;
export const RoomContextConsumer = context.Consumer;
