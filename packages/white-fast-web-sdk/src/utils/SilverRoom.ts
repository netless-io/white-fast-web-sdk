export type MediaStreamConstraints = any;
export type Config = any;
export type StreamInfo = any;

export interface SilverRoomCache {
  appId: number;
  signKey?: number[];

  roomId?: string;
  userId?: string;
  publishStreamId: string;

  loginToken: string;
  loginTokenUrl?: string;
  userName?: string;
  streamList: StreamInfo[];
  playingStreamIds: string[];

  enableLayerCodec?: boolean;
  sdkIsInitial?: boolean;
  appVersion?: "国内版" | "国际版";
  publishViewEl: HTMLVideoElement;
}


export function getEasySDK(ZegoClient: any): any {
  class SilverRoom extends ZegoClient {
    public _defaultCacheConfig: SilverRoomCache = {
      publishStreamId: "",
      streamList: [],
      playingStreamIds: [],
      enableLayerCodec: false,
      sdkIsInitial: false,
      appVersion: "国内版",
    } as any;

    public _cacheSDKConfig: SilverRoomCache = {
      ...this._defaultCacheConfig,
    } as SilverRoomCache;

    public constructor() {
      super();
      this.setUserStateUpdate(true);
    }

    /**
     * 初始化 SDK
     *
     * @param  {{appId:number;signKey:number[];}} para?
     * @param {para.appId} 获取的 appId
     * @param {para.signKey} 获取的 signKey
     */
    public initSDK(para: { appId: number; signKey: number[]; }): any {
      this._cacheSDKConfig.appId = para.appId;
      this._cacheSDKConfig.signKey = para.signKey;
    }

    /**
     * 加入音视频房间
     *
     * @param  {{roomId:string;userId?:string;userName?:string;}} para
     */
    public join = async (para: { roomId: string; userId: string; userName?: string; }) => {
      this._cacheSDKConfig.roomId = para.roomId;
      const idName = para.userId;
      this._cacheSDKConfig.userId = idName;
      const nickName = para.userName || para.userId;
      this._cacheSDKConfig.userName = nickName;

      this._cacheSDKConfig.loginTokenUrl = this._cacheSDKConfig.appVersion === "国内版" ? `https://wsliveroom${this._cacheSDKConfig.appId}-api.zego.im:8282/token` : `https://wsliveroom${this._cacheSDKConfig.appId}-api.zegocloud.com:8282/token`;
      const zegoConfig: Config = {
        appid: this._cacheSDKConfig.appId,
        server: this._cacheSDKConfig.appVersion === "国内版" ? `wss://wsliveroom${this._cacheSDKConfig.appId}-api.zego.im:8282/ws` : `wss://wsliveroom${this._cacheSDKConfig.appId}-api.zegocloud.com:8282/ws`,
        idName,
        nickName,
        logLevel: 3,
        logUrl: "",
        audienceCreateRoom: true,
        remoteLogLevel: 0,
        testEnvironment: false,
      };
      this.config(zegoConfig);

      const getLoginToken = () => {
        return new Promise((resolve, reject) => {
          fetch(`${this._cacheSDKConfig.loginTokenUrl}?app_id=${this._cacheSDKConfig.appId}&id_name=${this._cacheSDKConfig.userId}`, {
            method: "GET",
          })
            .then(res => {
              if (typeof res === "string") {
                resolve(res as string);
              } else {
                res.text().then((text: any) => {
                  resolve(text as string);
                });
              }
              return res;
            })
            .catch(reject);
        });
      };

      if (!this._cacheSDKConfig.loginToken) {
        this._cacheSDKConfig.loginToken = await getLoginToken() as string;
      }

      return new Promise((resolve, reject) => {
        this.login(decodeURIComponent(para.roomId), 2, this._cacheSDKConfig.loginToken, (streamList: any) => {
          this._cacheSDKConfig.streamList = streamList;
          resolve(streamList);
          if (this.handleStreamsUpdate) {
            this.handleStreamsUpdate(streamList);
          }
        }, reject);
      }) as Promise<StreamInfo[]>;
    }

    /** 离开房间
     */
    public leave = () => {
      this.stopPublish();
      this.stopPreview();
      return this.logout();
    }

    /** 反初始化 SDK
     */
    public unInitSDK = () => {
      this.leave();
      this._cacheSDKConfig.streamList.forEach((stream, index) => {
        this.stopPlayingStream(stream.stream_id);
      });

      this._cacheSDKConfig = { ...this._defaultCacheConfig };
      if (this.handleStreamsUpdate) {
        this.handleStreamsUpdate(this._cacheSDKConfig.streamList);
      }

      this.release();
    }

    /**
     * 开始预览摄像头
     *
     * @param  {HTMLVideoElement} viewEl 设置 video 元素预览
     * @param  {MediaStreamConstraints} mediaStreamConstraints? 媒体配置信息
     * @param  {()=>void} success? 成功回调
     * @param  {()=>void} error?失败回调
     */
    public startPreview: any = (viewEl: HTMLVideoElement, mediaStreamConstraints?: MediaStreamConstraints, success?: () => void, error?: () => void): any => {
      this._cacheSDKConfig.publishViewEl = viewEl;
      return new Promise((res, rej) => {
        ZegoClient.prototype.startPreview.call(this, viewEl, {
          audio: true,
          audioInput: null,
          video: true,
          videoInput: null,
          videoQuality: 2,
          horizontal: true,
          ...mediaStreamConstraints,
        }, () => {
          res();
          if (success) { success(); }
        }, () => {
          rej();
          if (error) { error(); }
        });
      });
    }

    /**
     * 停止预览
     *
     * @param  {HTMLVideoElement} viewEl? HTMLVideoElement
     */
    public stopPreview = (viewEl?: HTMLElement) => {
      return ZegoClient.prototype.stopPreview.call(this, viewEl || this._cacheSDKConfig.publishViewEl);
    }

    /**
     * 开始推流
     *
     * @param  {string} streamId? 设置推流 id
     */
    public publish = (streamId?: string) => {
      this._cacheSDKConfig.publishStreamId = streamId || `${Date.now()}-${Math.ceil(Math.random() * Math.pow(10, 8))}`;
      this.startPublishingStream(this._cacheSDKConfig.publishStreamId, this._cacheSDKConfig.publishViewEl);
    }


    /**
     * 停止推流
     */
    public stopPublish = () => {
      this.stopPublishingStream(this._cacheSDKConfig.publishStreamId);
    }

    /**
     * 播放音视频流
     *
     * @param {{viewEl:HTMLCanvasElement|HTMLVideoElement,streamId:string}} stream 流对象
     * @param {HTMLCanvasElement|HTMLVideoElement} stream.viewEl - 播放音视频的元素
     * @param {string} stream.streamId - 播放音视频的流 id
     */
    public playStream = (stream: { viewEl: HTMLCanvasElement | HTMLVideoElement, streamId: string }) => {
      const code = this.startPlayingStream(stream.streamId, stream.viewEl);
      if (!this._cacheSDKConfig.playingStreamIds.includes(stream.streamId)) {
        this._cacheSDKConfig.playingStreamIds.push(stream.streamId);
      }
      return code;
    }
    /**
     * 播放一组音视频流
     *
     * @param  {{viewEl:HTMLCanvasElement|HTMLVideoElement,streamId: string}} streams
     */
    public playStreams = (streams: { viewEl: HTMLCanvasElement | HTMLVideoElement, streamId: string; }[]) => {
      streams.forEach(stream => this.playStream(stream));
    }

    /**
     * 停止播放音视频流
     *
     * @param  {{streamId:string;}} stream 使用流 id 数组来停止播放流列表
     */
    public stopPlayStream = (stream: { streamId: string; }) => {
      this.stopPlayingStream(stream.streamId);
      const index = this._cacheSDKConfig.playingStreamIds.indexOf(stream.streamId);
      if (index > -1) {
        this._cacheSDKConfig.playingStreamIds.splice(index, -1);
      }
    }

    /**
     * 停止播放一组流音视频
     *
     * @param  {string[]} streamListIds
     */
    public stopPlayStreams = (streamIds: string[]) => {
      streamIds.forEach(streamId => {
        this.stopPlayStream({ streamId: streamId });
      });
    }

    /**
     * 流更新回调函数
     *
     * @param  {number} type? 增加为0，减少为1
     * @param  {StreamInfo[]} newStreamList? 新的音视频流
     */
    public onStreamUpdated = (type?: number, newStreamList?: StreamInfo[]) => {
      const { streamList } = this._cacheSDKConfig;
      const streamListIds = streamList.map(stream => stream.stream_id);
      const newStreamListIds = newStreamList ? newStreamList.map(stream => stream.stream_id) : [];
      if (type === 0) {
        newStreamListIds.forEach((id, index) => {
          if (!streamListIds.includes(id)) {
            const newStream = newStreamList ? newStreamList[index] : null;
            if (newStream) {
              streamList.push(newStream);
            }
          }
        });
      } else {
        newStreamListIds.forEach((id, index) => {
          const startIndex = streamListIds.indexOf(id);
          if (startIndex > -1) {
            this.stopPlayingStream(id);
            streamList.splice(startIndex, 1);
            const playingIndex = this._cacheSDKConfig.playingStreamIds.indexOf(id);
            if (playingIndex > -1) {
              this._cacheSDKConfig.playingStreamIds.splice(playingIndex, 1);
            }
          }
        });
      }
      if (this.handleStreamsUpdate) {
        this.handleStreamsUpdate(streamList);
      }
    }

    /**
     * 当覆盖 onStreamUpdate 时，此函数无法调用
     *
     * @param  {{stream_id:string;[key:string]:any;}[]} streamList
     */
    public handleStreamsUpdate = (streamList: { stream_id: string; [key: string]: any; }[]) => { };

    public getEventData = (key: string) => { };

    public handleEventDataChange = (key: string) => {
      return {};
    }
  }

  return SilverRoom;
}
