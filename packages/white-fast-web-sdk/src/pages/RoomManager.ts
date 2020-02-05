import {Room, ViewMode} from "white-web-sdk";
import {message} from "antd";
import {ClassModeType, IdentityType} from "./NetlessRoomTypes";



export type GuestUserType = {
    userId: string,
    identity: IdentityType,
    avatar?: string,
    name?: string,
    isReadOnly: boolean,
    isHandUp: boolean,
    cameraState: ViewMode,
    disableCameraTransform: boolean,
    isReminded: boolean,
    applyForRtc: boolean,
    isOnline: boolean,
};
export type HostUserType = {
    userId: string,
    identity: IdentityType,
    classMode: ClassModeType,
    cameraState: ViewMode,
    disableCameraTransform: boolean,
    isVideoEnable: boolean,
    isAllMemberAudioClose: boolean,
    isAllowHandUp: boolean,
    secondsElapsed?: number,
    avatar?: string,
    name?: string,
    isVideoFullScreen?: boolean,
    isRecording?: boolean,
};

export class RoomManager {
  private readonly identity: IdentityType;
  private readonly userAvatarUrl?: string;
  private readonly name?: string;
  private readonly userId: string;
  private readonly room: Room;
  private readonly classMode?: ClassModeType;
  public constructor(userId: string, room: Room, userAvatarUrl?: string, identity?: IdentityType, name?: string, classMode?: ClassModeType) {
    this.room = room;
    this.identity = identity ? identity : IdentityType.guest;
    this.userId = userId;
    this.userAvatarUrl = userAvatarUrl;
    this.name = name;
    this.classMode = classMode;
  }

  private detectIsReadyOnly = (): boolean => {
      const hostInfo: HostUserType = (this.room.state.globalState as any).hostInfo;
      if (hostInfo) {
          return hostInfo.classMode !== ClassModeType.discuss;
      } else {
          return this.classMode !== ClassModeType.discuss;
      }
  }

  public start = async (): Promise<void> => {
      if (this.identity === IdentityType.host) {
          const hostInfo: HostUserType = (this.room.state.globalState as any).hostInfo;
          if (hostInfo) {
              this.room.setViewMode(ViewMode.Broadcaster);
              if (hostInfo.userId !== this.userId) {
                  const myHostInfo: HostUserType = {
                      userId: this.userId,
                      identity: this.identity,
                      avatar: this.userAvatarUrl,
                      name: this.name,
                      isAllowHandUp: false,
                      classMode: this.classMode ? this.classMode : ClassModeType.discuss,
                      cameraState: ViewMode.Broadcaster,
                      disableCameraTransform: false,
                      isVideoEnable: false,
                      isAllMemberAudioClose: false,
                  };
                  this.room.disableCameraTransform = false;
                  this.room.setGlobalState({hostInfo: myHostInfo});
                  message.success("您成为主持人");
              }
          } else {
              const myHostInfo: HostUserType = {
                  userId: this.userId,
                  identity: this.identity,
                  avatar: this.userAvatarUrl,
                  name: this.name,
                  classMode: this.classMode ? this.classMode : ClassModeType.discuss,
                  cameraState: ViewMode.Broadcaster,
                  isAllowHandUp: false,
                  disableCameraTransform: false,
                  isVideoEnable: false,
                  isAllMemberAudioClose: false,
              };
              this.room.disableCameraTransform = false;
              this.room.setGlobalState({hostInfo: myHostInfo});
              this.room.setViewMode(ViewMode.Broadcaster);
          }
      } else if (this.identity === IdentityType.listener) {
          this.room.setViewMode(ViewMode.Follower);
          this.room.disableCameraTransform = true;
          await this.room.setWritable(false);
      } else {
          const isReadOnly = this.detectIsReadyOnly();
          const globalGuestUsers: GuestUserType[] = (this.room.state.globalState as any).guestUsers;
          if (globalGuestUsers === undefined) {
              const guestUser: GuestUserType = {
                  userId: this.userId,
                  identity: this.identity,
                  avatar: this.userAvatarUrl,
                  name: this.name,
                  isReadOnly: isReadOnly,
                  isHandUp: false,
                  cameraState: ViewMode.Follower,
                  disableCameraTransform: true,
                  isReminded: false,
                  applyForRtc: false,
                  isOnline: true,
              };
              this.room.disableCameraTransform = true;
              this.room.setGlobalState({guestUsers: [guestUser]});
              this.room.disableDeviceInputs = true;
              this.room.setViewMode(ViewMode.Follower);
          } else {
              const myUser = globalGuestUsers.find((data: GuestUserType) => data.userId === this.userId);
              if (myUser) {
                  this.room.disableDeviceInputs = myUser.isReadOnly;
                  this.room.disableCameraTransform = myUser.disableCameraTransform;
                  const newGuestUsers = globalGuestUsers.map(guestUser => {
                      if (guestUser.userId === this.userId) {
                          guestUser.isOnline = true;
                          return guestUser;
                      } else {
                          return guestUser;
                      }
                  });
                  this.room.setGlobalState({guestUsers: newGuestUsers});
              } else {
                  const guestUser: GuestUserType = {
                      userId: this.userId,
                      identity: this.identity,
                      avatar: this.userAvatarUrl,
                      name: this.name,
                      isReadOnly: isReadOnly,
                      isHandUp: false,
                      cameraState: ViewMode.Follower,
                      disableCameraTransform: true,
                      isReminded: false,
                      applyForRtc: false,
                      isOnline: true,
                  };
                  this.room.disableCameraTransform = true;
                  globalGuestUsers.push(guestUser);
                  this.room.setGlobalState({guestUsers: globalGuestUsers});
                  this.room.disableDeviceInputs = true;
              }
          }
      }
  }
  public leave = (): void => {
      if (this.identity === IdentityType.guest) {
          const guestUsers: GuestUserType[] = (this.room.state.globalState as any).guestUsers;
          if (guestUsers && guestUsers.length > 0) {
              const newGuestUsers = guestUsers.map(guestUser => {
                  if (guestUser.userId === this.userId) {
                      guestUser.isOnline = false;
                      return guestUser;
                  } else {
                      return guestUser;
                  }
              });
              this.room.setGlobalState({guestUsers: newGuestUsers});
          }
      }
  }

  public stop = (): void => {
      this.room.removeMagixEventListener("take-back-all");
      this.room.removeMagixEventListener("agree");
  }
}
