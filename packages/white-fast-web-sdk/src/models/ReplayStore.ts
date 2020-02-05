import {observable} from "mobx";
import {PlayerPhase} from "white-web-sdk";
export class ReplayStore {
    @observable
    public phase: PlayerPhase = PlayerPhase.Stopped;
    @observable
    public playerCurrent: any = null;

    public play (): void {
        if (this.playerCurrent) {
            this.playerCurrent.play();
        }
    }

    public pause (): void {
        if (this.playerCurrent) {
            this.playerCurrent.pause();
        }
    }

    public seekToScheduleTime(scheduleTime: number): void {
        this.playerCurrent.currentTime = scheduleTime;
        this.playerCurrent.pause();
    }
}
export const replayStore = new ReplayStore();
