import {
    AnimationMode,
    ApplianceNames,
    createPPTTask,
    LegacyPPTConverter,
    PPT,
    PptDescription,
    PPTKind,
    Room
} from "white-web-sdk";
import uuidv4 from "uuid/v4";
import {MultipartUploadResult} from "ali-oss";
import {PPTDataType, PPTType} from "../../components/menu/PPTDatas";
import * as default_cover from "../../assets/image/default_cover.svg";

export type imageSize = {
    width: number,
    height: number,
};
export type NetlessImageFile = {
    width: number;
    height: number;
    file: File;
    coordinateX: number;
    coordinateY: number;
};

export type TaskType = {
    uuid: string,
    imageFile: NetlessImageFile,
};

export type PPTProgressListener = (phase: PPTProgressPhase, percent: number) => void;

export enum PPTProgressPhase {
    Uploading,
    Converting,
}

export class UploadManager {

    private readonly ossClient: any;
    private readonly room: Room;
    private readonly ossUploadCallback?: (res: any) => void;

    public constructor(ossClient: any, room: Room, ossUploadCallback?: (res: any) => void) {
        this.ossClient = ossClient;
        this.room = room;
        this.ossUploadCallback = ossUploadCallback;
    }

    private getFileType = (fileName: string): string => {
        const index1 = fileName.lastIndexOf(".");
        const index2 = fileName.length;
        return fileName.substring(index1, index2);
    }

    private async createPPTTask(pptURL: string): Promise<string> {
        const url = "https://shunt-api.netless.link/v5/services/conversion/tasks";
        const response = await fetch(url, {
            method: "post",
            headers: {
                "content-type": "application/json",
                "Accept": "application/json",
                "token": "WHITEcGFydG5lcl9pZD0zZHlaZ1BwWUtwWVN2VDVmNGQ4UGI2M2djVGhncENIOXBBeTcmc2lnPTc1MTBkOWEwNzM1ZjA2MDYwMTMzODBkYjVlNTQ2NDA0OTAzOWU2NjE6YWRtaW5JZD0xNTgmcm9sZT1taW5pJmV4cGlyZV90aW1lPTE1OTAwNzM1NjEmYWs9M2R5WmdQcFlLcFlTdlQ1ZjRkOFBiNjNnY1RoZ3BDSDlwQXk3JmNyZWF0ZV90aW1lPTE1NTg1MTY2MDkmbm9uY2U9MTU1ODUxNjYwODYxNzAw",
            },
            body: JSON.stringify({
                resource: pptURL,
                type: "dynamic",
                preview: true,
            }),
        });
        if (response.status >= 300) {
            throw new Error(`failed to convert ${JSON.stringify(pptURL)} with status ${response.status}`);
        }
        const {uuid, type, status} = await response.json();
        return uuid;
    }

    private async createTaskToken(uuid: string): Promise<string> {
        const url = `https://shunt-api.netless.link/v5/tokens/tasks/${uuid}`;
        const response = await fetch(url, {
            method: "post",
            headers: {
                "content-type": "application/json",
                "Accept": "application/json",
                "token": "WHITEcGFydG5lcl9pZD0zZHlaZ1BwWUtwWVN2VDVmNGQ4UGI2M2djVGhncENIOXBBeTcmc2lnPTc1MTBkOWEwNzM1ZjA2MDYwMTMzODBkYjVlNTQ2NDA0OTAzOWU2NjE6YWRtaW5JZD0xNTgmcm9sZT1taW5pJmV4cGlyZV90aW1lPTE1OTAwNzM1NjEmYWs9M2R5WmdQcFlLcFlTdlQ1ZjRkOFBiNjNnY1RoZ3BDSDlwQXk3JmNyZWF0ZV90aW1lPTE1NTg1MTY2MDkmbm9uY2U9MTU1ODUxNjYwODYxNzAw",
            },
            body: JSON.stringify({
                lifespan: 0,
                role: "admin",
            }),
        });
        if (response.status >= 300) {
            throw new Error(`failed to convert error`);
        }
        return await response.json();
    }

    public async convertFile(
        rawFile: File,
        pptConverter: LegacyPPTConverter,
        kind: PPTKind,
        folder: string,
        uuid: string,
        documentFileCallback: (data: PPTDataType) => void,
        onProgress?: PPTProgressListener,
    ): Promise<void> {
        const fileType = this.getFileType(rawFile.name);
        const path = `/${folder}/${uuid}${fileType}`;
        const pptURL = await this.addFile(path, rawFile, onProgress);
        let res: PPT;
        if (kind === PPTKind.Static) {
            res = await pptConverter.convert({
                url: pptURL,
                kind: kind,
                onProgressUpdated: progress => {
                    if (onProgress) {
                        onProgress(PPTProgressPhase.Converting, progress);
                    }
                },
            });
            const documentFile: PPTDataType = {
                active: true,
                id: `${uuidv4()}`,
                pptType: PPTType.static,
                data: res.scenes,
                cover: default_cover,
            };
            const newScenes = res.scenes.map(data => {
                if (data.ppt && data.name) {
                    return {
                        name: data.name,
                        ppt: {
                            width: 1080,
                            height: 1080 * (data.ppt.height / data.ppt.width),
                            ...data.ppt,
                        },
                    };
                } else {
                    return  data;
                }
            });
            this.room.putScenes(`/${uuid}/${documentFile.id}`, newScenes);
            this.room.setScenePath(`/${uuid}/${documentFile.id}/${res.scenes[0].name}`);
            this.pptAutoFullScreen(this.room);
            documentFileCallback(documentFile);
        } else {
            const uuid = await this.createPPTTask(pptURL);
            const taskToken = await this.createTaskToken(uuid);
            const resp = createPPTTask({
                uuid: uuid,
                kind: PPTKind.Dynamic,
                taskToken: taskToken,
                callbacks: {
                    onProgressUpdated: progress => {
                        if (onProgress) {
                            onProgress(PPTProgressPhase.Converting, progress.convertedPercentage);
                        }
                    },
                    onTaskFail: () => {},
                    onTaskSuccess: () => {},
                },
            });
            const ppt = await resp.checkUtilGet();
            const documentFile: PPTDataType = {
                active: true,
                id: `${uuidv4()}`,
                pptType: PPTType.dynamic,
                data: ppt.scenes,
                cover: default_cover,
            };
            this.room.putScenes(`/${uuid}/${documentFile.id}`, ppt.scenes);
            this.room.setScenePath(`/${uuid}/${documentFile.id}/${ppt.scenes[0].name}`);
            this.pptAutoFullScreen(this.room);
            documentFileCallback(documentFile);
        }
        if (onProgress) {
            onProgress(PPTProgressPhase.Converting, 1);
        }
    }

    private pptAutoFullScreen = (room: Room): void => {
        const scene = room.state.sceneState.scenes[room.state.sceneState.index];
        if (scene && scene.ppt) {
            const width = scene.ppt.width;
            const height = scene.ppt.height;
            room.moveCameraToContain({
                originX: -width / 2,
                originY: -height / 2,
                width: width,
                height: height,
                animationMode: AnimationMode.Immediately,
            });
        }
    }

    private getImageSize(imageInnerSize: imageSize): imageSize {
        const windowSize: imageSize = {width: window.innerWidth, height: window.innerHeight};
        const widthHeightProportion: number = imageInnerSize.width / imageInnerSize.height;
        const maxSize: number = 960;
        if ((imageInnerSize.width > maxSize && windowSize.width > maxSize) || (imageInnerSize.height > maxSize && windowSize.height > maxSize)) {
            if (widthHeightProportion > 1) {
                return {
                    width: maxSize,
                    height: maxSize / widthHeightProportion,
                };
            } else {
                return {
                    width: maxSize * widthHeightProportion,
                    height: maxSize,
                };
            }
        } else {
            if (imageInnerSize.width > windowSize.width || imageInnerSize.height > windowSize.height) {
                if (widthHeightProportion > 1) {
                    return {
                        width: windowSize.width,
                        height: windowSize.width / widthHeightProportion,
                    };
                } else {
                    return {
                        width: windowSize.height * widthHeightProportion,
                        height: windowSize.height,
                    };
                }
            } else {
                return {
                    width: imageInnerSize.width,
                    height: imageInnerSize.height,
                };
            }
        }
    }

    public async uploadImageFiles(imageFiles: File[], x: number, y: number, onProgress?: PPTProgressListener): Promise<void> {
        const newAcceptedFilePromises = imageFiles.map(file => this.fetchWhiteImageFileWith(file, x, y));
        const newAcceptedFiles = await Promise.all(newAcceptedFilePromises);
        await this.uploadImageFilesArray(newAcceptedFiles, onProgress);
    }

    private fetchWhiteImageFileWith(file: File, x: number, y: number): Promise<NetlessImageFile> {
        return new Promise(resolve => {
            const image = new Image();
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                image.src = reader.result as string;
                image.onload = async () => {
                    const res = this.getImageSize(image);
                    const imageFile: NetlessImageFile = {
                        width: res.width,
                        height: res.height,
                        file: file,
                        coordinateX: x,
                        coordinateY: y,
                    };
                    resolve(imageFile);
                };
            };
        });
    }

    private async uploadImageFilesArray(imageFiles: NetlessImageFile[], onProgress?: PPTProgressListener): Promise<void> {
        if (imageFiles.length > 0) {

            const tasks: { uuid: string, imageFile: NetlessImageFile }[] = imageFiles.map(imageFile => {
                return {
                    uuid: uuidv4(),
                    imageFile: imageFile,
                };
            });

            for (const {uuid, imageFile} of tasks) {
                const {x, y} = this.room.convertToPointInWorld({x: imageFile.coordinateX, y: imageFile.coordinateY});
                this.room.insertImage({
                    uuid: uuid,
                    centerX: x,
                    centerY: y,
                    width: imageFile.width,
                    height: imageFile.height,
                    locked: false,
                });
            }
            await Promise.all(tasks.map(task => this.handleUploadTask(task, onProgress)));
            this.room.setMemberState({
                currentApplianceName: ApplianceNames.selector,
            });
        }
    }

    private async handleUploadTask(task: TaskType, onProgress?: PPTProgressListener): Promise<void> {
        const fileUrl: string = await this.addFile(`${task.uuid}${task.imageFile.file.name}`, task.imageFile.file, onProgress);
        this.room.completeImageUpload(task.uuid, fileUrl);
    }

    private getFile = (name: string): string => {
        return this.ossClient.generateObjectUrl(name);
    }
    public addFile = async (path: string, rawFile: File, onProgress?: PPTProgressListener): Promise<string> => {
        const res: MultipartUploadResult = await this.ossClient.multipartUpload(
            path,
            rawFile,
            {
                progress: (p: any) => {
                    if (onProgress) {
                        onProgress(PPTProgressPhase.Uploading, p);
                    }
                },
            });
            
        if (this.ossUploadCallback) {
            const callback_data = {
                ossRes:res,
                file: rawFile,
            };
            this.ossUploadCallback(callback_data);
        }
        if (res.res.status === 200) {
            return this.getFile(path);
        } else {
            throw new Error(`upload to ali oss error, status is ${res.res.status}`);
        }
    }
}
