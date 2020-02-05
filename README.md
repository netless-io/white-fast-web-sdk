![](https://sdk.herewhite.com/fast-sdk/back2.png)

English | [简体中文](./README-zh_CN.md) | [日本語](./README-jp.md) 

![GitHub](https://img.shields.io/github/license/netless-io/whiteboard-designer)
![jenkins](http://ci.netless.group/job/fast-sdk-pr/badge/icon)

⚡ Open source ultra fast whiteboard.

## 🎉 Quickstart 

### Online

[codepen](https://codepen.io/buhe/pen/XWryGWO?editors=1000#0)


[jsrun#china](http://jsrun.pro/zmbKp/edit)

### Collaborative WhiteBoard

```html
<body>
    <div id="app-root"></div>
    <script src="https://sdk.herewhite.com/fast-sdk/index.js"></script>
    <script type="text/javascript">
        var userId = `${Math.floor(Math.random() * 100000)}`;
        var uuid = "8c2ee602f11e4883a75a9be9dd51b4cd";
        var roomToken = "WHITEcGFydG5lcl9pZD0zZHlaZ1BwWUtwWVN2VDVmNGQ4UGI2M2djVGhncENIOXBBeTcmc2lnPWFhODIxMTQ5NjdhZDdmMmVlMzI1NmJhNjUwNmM2OTJmMzFkNGZiODg6YWRtaW5JZD0xNTgmcm9vbUlkPThjMmVlNjAyZjExZTQ4ODNhNzVhOWJlOWRkNTFiNGNkJnRlYW1JZD0yODMmcm9sZT1yb29tJmV4cGlyZV90aW1lPTE2MDA1MTI0OTYmYWs9M2R5WmdQcFlLcFlTdlQ1ZjRkOFBiNjNnY1RoZ3BDSDlwQXk3JmNyZWF0ZV90aW1lPTE1Njg5NTU1NDQmbm9uY2U9MTU2ODk1NTU0NDAwMjAw";
        
        WhiteFastSDK.Room("app-root",{
            uuid: uuid,
            roomToken: roomToken,
            userId: userId,
        });
    </script>
</body>
```

### WhiteBoard Player

```html
<body>
    <div id="app-root"></div>
    <script src="https://sdk.herewhite.com/fast-sdk/index.js"></script>
    <script type="text/javascript">
        var userId = `${Math.floor(Math.random() * 100000)}`;
        var uuid = "8c2ee602f11e4883a75a9be9dd51b4cd";
        var roomToken = "WHITEcGFydG5lcl9pZD0zZHlaZ1BwWUtwWVN2VDVmNGQ4UGI2M2djVGhncENIOXBBeTcmc2lnPWFhODIxMTQ5NjdhZDdmMmVlMzI1NmJhNjUwNmM2OTJmMzFkNGZiODg6YWRtaW5JZD0xNTgmcm9vbUlkPThjMmVlNjAyZjExZTQ4ODNhNzVhOWJlOWRkNTFiNGNkJnRlYW1JZD0yODMmcm9sZT1yb29tJmV4cGlyZV90aW1lPTE2MDA1MTI0OTYmYWs9M2R5WmdQcFlLcFlTdlQ1ZjRkOFBiNjNnY1RoZ3BDSDlwQXk3JmNyZWF0ZV90aW1lPTE1Njg5NTU1NDQmbm9uY2U9MTU2ODk1NTU0NDAwMjAw";
        
        WhiteFastSDK.Player("app-root",{
            uuid: uuid,
            roomToken: roomToken,
            userId: userId,
        });
    </script>
</body>
```

## 📖 Documentation

When setting your whiteboard widget in code, you have several configs at your disposal all of which are described in detail below.

### WhiteBoard

To create a whiteboard, invoke a ```WhiteFastSDK.Room``` method in which you write the selected element in which you want to add the whiteboard and preferred configs.

- element [string] – contains a reference to the element in which whiteboard is
- configs [object] – options object

**uuid [string] required**

Room indentify.

```
uuid: "8c2ee602f11e4883a75a9be9dd51b4cd"
```

**roomToken [string] required**

Room auth token.

```
roomToken: "WHITEcGFydG5lcl9pZD....TOO...LONG"
```

**userId [string] required**

User indentify.

```
userId: "wdqzidmac"
```

**userName [string] optional**

User name.

```
userName: "rick"
```

**userAvatarUrl [string] optional**

User avatar url.

```
userAvatarUrl: "https://ohuuyffq2.qnssl.com/netless_icon.png"
```

**logoUrl [url] optional**

With the default value as undefined, Custom branding logo.

```
logoUrl: "https://path/to/logo.png"
```

**toolBarPosition [string] optional**

With the default value as top, ToolBar position, value include left,top,bottom,right.

```
toolBarPosition: "left"
```

**pagePreviewPosition [string] optional**

With the default value as right, Preview view position, value include left, right.

```
pagePreviewPosition: "left"
```

**boardBackgroundColor [color] optional**

With the default value as white, Background color.

```
boardBackgroundColor: "#F2F2F2"
```

**isReadOnly [boolean] optional**

With the default value as false, read-only meaning can not write at board.

```
isReadOnly: false
```

**identity [string] optional**

With the default value as host, value include host, guest, listener.

```
identity: “guest”
```

**defaultColorArray [string[]] optional**

```
defaultColorArray: [
    "#EC3455",
    "#005BF6",
    "#F5AD46",
    "#68AB5D",
    "#9E51B6",
    "#1E2023",
];
```

**roomCallback [(room: Room) => void] optional**

```
roomCallback: (room) => {
                    console.log(room);
                }
```

**colorArrayStateCallback [(colorArray: string[]) => void] optional**

```
colorArrayStateCallback: (colorArray) => {
                    console.log(colorArray);
                }
```



### WhiteBoard Player

To create a player, invoke a ```WhiteFastSDK.Player``` method in which you write the selected element in which you want to add the player and preferred configs.

- element [string] – contains a reference to the element in which whiteboard is
- configs [object] – options object

**uuid [string] required**

Room indentify.

```
uuid: "8c2ee602f11e4883a75a9be9dd51b4cd"
```

**roomToken [string] required**

Room auth token.

```
roomToken: "WHITEcGFydG5lcl9pZD....TOO...LONG"
```

**userId [string] required**

User indentify.

```
userId: "wdqzidmac"
```

**userName [string] optional**

User name.

```
userName: "rick"
```

**userAvatarUrl [string] optional**

User avatar url.

```
userAvatarUrl: "https://ohuuyffq2.qnssl.com/netless_icon.png"
```

**logoUrl [url] optional**

With the default value as undefined, Custom branding logo.

```
logoUrl: "https://path/to/logo.png"
```

**beginTimestamp [number] optional**

UTC time when the player starts playing

```
beginTimestamp: 1569290494106
```

**duration [number] optional**

How long the player plays

```
duration: 94106
```

**mediaUrl [url] optional**

Recorded media

```
mediaUrl: "https://path/to/media.m3u8"
```

**isChatOpen [boolean] optional**

```
isChatOpen: true
```

**boardBackgroundColor [color] optional**

With the default value as white, Background color.

```
boardBackgroundColor: "#F2F2F2"
```

**Callback [(player: Player) => void] optional**

```
playerCallback: (player) => {
                    console.log(player);
                }
```

## 🚀 Development

1. Run `yarn dev` in your terminal
2. Live room by open facade/index.html
3. Player by open facade/player.html

## 👏 Contributing

Please refer to each project's style and contribution guidelines for submitting patches and additions. In general, we follow the "fork-and-pull" Git workflow.

1. Fork the repo on GitHub
2. Clone the project to your own machine
3. Commit changes to your own branch
4. Push your work back up to your fork
5. Submit a Pull request so that we can review your changes
NOTE: Be sure to merge the latest from "upstream" before making a pull request!
