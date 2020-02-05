import Fetcher from "@netless/fetch-middleware";

export class RecordOperator {

    private readonly agoraAppId: string;
    private readonly customerId: string;
    private readonly customerCertificate: string;
    private readonly channelName: string;
    private readonly mode: string;
    private readonly recordingConfig: any;
    private readonly storageConfig: any;
    private recordId?: string;
    public resourceId?: string;
    private readonly uid: string;
    private readonly token: string | undefined = undefined;
    private fetcher: Fetcher;
    public constructor(
        rtcBaseConfig: {
            agoraAppId: string,
            customerId: string,
            customerCertificate: string,
            channelName: string,
            mode: string,
            token: string | undefined,
            uid: string,
        },
        fetchConfig: {
            apiOrigin: string,
            fetchTimeout?: number,
        },
        recordingConfig: any,
        storageConfig: any,
        ) {
        this.agoraAppId = rtcBaseConfig.agoraAppId;
        this.customerId = rtcBaseConfig.customerId;
        this.customerCertificate = rtcBaseConfig.customerCertificate;
        this.channelName = rtcBaseConfig.channelName;
        this.recordingConfig = recordingConfig;
        this.storageConfig = storageConfig;
        this.mode = rtcBaseConfig.mode;
        this.uid = rtcBaseConfig.uid;
        this.token = rtcBaseConfig.token;
        this.fetcher = new Fetcher(
            fetchConfig.fetchTimeout ? fetchConfig.fetchTimeout : 2000,
            fetchConfig.apiOrigin);
    }

    public async acquire(): Promise<void> {
        const json = await this.fetcher.post<any>({
            path: `v1/apps/${this.agoraAppId}/cloud_recording/acquire`,
            headers: {
                Authorization: this.basicAuthorization(this.customerId, this.customerCertificate),
            },
            body: {
                cname: this.channelName,
                uid: this.uid,
                clientRequest: {},
            },
        });
        const res = json as any;
        if (typeof res.resourceId === "string") {
            this.resourceId = res.resourceId;
        } else {
            throw new Error("acquire resource error");
        }
    }

    public async release(): Promise<void> {
        this.resourceId = undefined;
        this.recordId = undefined;
    }


    public async start(): Promise<any> {
        if (this.resourceId === undefined) {
            throw new Error("call 'acquire' method acquire resource");
        }
        const json = await this.fetcher.post<any>({
            path: `v1/apps/${this.agoraAppId}/cloud_recording/resourceid/${this.resourceId}/mode/${this.mode}/start`,
            headers: {
                Authorization: this.basicAuthorization(this.customerId, this.customerCertificate),
            },
            body: {
                cname: this.channelName,
                uid: this.uid,
                clientRequest: {
                    token: this.token,
                    recordingConfig: this.recordingConfig,
                    storageConfig: this.storageConfig,
                },
            },
        });
        const res = json as any;
        if (typeof res.sid === "string") {
            this.recordId = res.sid;
        } else {
            throw new Error("start record error");
        }
        return res;
    }

    public async stop(): Promise<any> {
        if (this.resourceId === undefined) {
            throw new Error("call 'acquire' method acquire resource");
        }
        if (this.recordId === undefined) {
            throw new Error("call 'start' method start record");
        }
        try {
            const json = await this.fetcher.post<any>({
                path: `v1/apps/${this.agoraAppId}/cloud_recording/resourceid/${this.resourceId}/sid/${this.recordId}/mode/${this.mode}/stop`,
                headers: {
                    Authorization: this.basicAuthorization(this.customerId, this.customerCertificate),
                },
                body: {
                    cname: this.channelName,
                    uid: this.uid,
                    clientRequest: {},
                },
            });
            return json as any;
        } catch (err) {
            console.log("stop", err);
        } finally {
            await this.release();
        }
    }

    public async query(): Promise<any> {
        if (this.resourceId === undefined) {
            throw new Error("call 'acquire' method acquire resource");
        }
        if (this.recordId === undefined) {
            throw new Error("call 'start' method start record");
        }
        const json = await this.fetcher.get<any>({
            path: `v1/apps/${this.agoraAppId}/cloud_recording/resourceid/${this.resourceId}/sid/${this.recordId}/mode/${this.mode}/query`,
            headers: {
                Authorization: this.basicAuthorization(this.customerId, this.customerCertificate),
            },
        });
        return json as any;
    }

    private basicAuthorization(appId: string, appSecret: string): string {
        const plainCredentials = `${appId}:${appSecret}`;
        return `Basic ${btoa(plainCredentials)}`;
    }
}
