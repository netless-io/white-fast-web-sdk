import { RoomFacade, PlayerFacade } from "./Facade";
type FastSDK = { Room: any, Player: any , Version: string};
const FastSDK: FastSDK = {
    Room: RoomFacade,
    Player: PlayerFacade,
    Version: "1.0.3",
};
(window as any).WhiteFastSDK = FastSDK;
export default FastSDK;
export type NetlessType = {release: () => void};
