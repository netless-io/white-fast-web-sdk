export type PPTDataType = {
    active: boolean,
    pptType: PPTType,
    id: string,
    data: any,
    cover?: string,
};

export enum PPTType {
    dynamic = "dynamic",
    static = "static",
    init = "init",
}
