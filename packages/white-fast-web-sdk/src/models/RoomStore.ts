import {observable} from "mobx";
import {IdentityType, RecordDataType} from "../pages/NetlessRoomTypes";

export class RoomStore {
    @observable
    public boardPointerEvents: any = "auto";
    @observable
    public identity: IdentityType = IdentityType.guest;
    @observable
    public h5PptUrl: string = "";
    @observable
    public startRtc: (() => void) | null;
    @observable
    public stopRtc: (() => void) | null;
    @observable
    public startRecord: (() => void) | null;
    @observable
    public stopRecord: (() => void) | null;
    @observable
    public releaseMedia: (() => void) | null;
    @observable
    public isRecording: boolean = false;
    @observable
    public isRtcOpen: boolean = false;
    @observable
    public isScreenZoomLock: boolean = false;
    @observable
    public isInputH5Visible: boolean = false;
    @observable
    public recordDataCallback?: (data: RecordDataType) => void;

    private startTime?: number;

    public startRecordDataCallback (startTime: number): void {
        if (this.recordDataCallback) {
            this.recordDataCallback({startTime: startTime});
            this.startTime = startTime;
        }
    }

    public endRecordDataCallback = (endTime: number, mediaUrl?: string): void => {
        if (this.recordDataCallback) {
            this.recordDataCallback({
                startTime: this.startTime,
                endTime: endTime,
                mediaUrl: mediaUrl});
        }
    }
}
export const roomStore = new RoomStore();
