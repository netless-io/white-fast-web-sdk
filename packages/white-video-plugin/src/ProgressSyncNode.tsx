const SyncTimeInterval = 1000;

export class ProgressSyncNode {

    private isFirstSync: boolean = true;

    public constructor(
        private readonly player: HTMLVideoElement,
    ) {}

    public syncProgress(progressTimestamp: number): void {
        if (this.isFirstSync) {
            this.isFirstSync = false;
            this.player.currentTime = progressTimestamp;

        } else {
            const delta = Math.abs(this.player.currentTime * 1000 - progressTimestamp);
            if (delta >= SyncTimeInterval) {
                this.player.currentTime = Math.round(progressTimestamp / 1000);
            }
        }
    }
}