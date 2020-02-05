const config = require("./tokenConfig");
export type OSSConfigObjType = {
    accessKeyId: string;
    accessKeySecret: string;
    region: string;
    bucket: string;
    folder: string;
    prefix: string;
};
export const ossConfigObj: OSSConfigObjType = {
    accessKeyId: config.ossConfigObj.accessKeyId,
    accessKeySecret: config.ossConfigObj.accessKeySecret,
    region: config.ossConfigObj.region,
    bucket: config.ossConfigObj.bucket,
    folder: config.ossConfigObj.folder,
    prefix: config.ossConfigObj.prefix,
};
