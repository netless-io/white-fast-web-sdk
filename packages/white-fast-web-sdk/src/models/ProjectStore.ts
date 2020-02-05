import {observable} from "mobx";
import { LanguageEnum } from "../pages/NetlessRoomTypes";
export class ProjectStore {
    @observable
    public language: LanguageEnum = LanguageEnum.Chinese;

    public isEnglish(): boolean {
        if (this.language === LanguageEnum.Chinese) {
            return false;
        } else {
            return true;
        }
    }
}
export const projectStore = new ProjectStore();
