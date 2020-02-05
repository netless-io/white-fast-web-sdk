![](https://sdk.herewhite.com/fast-sdk/back2.png)

[English](./README.md) | [简体中文](./README-zh_CN.md)  | 日本語

![GitHub](https://img.shields.io/github/license/netless-io/whiteboard-designer)
![jenkins](http://ci.netless.group/job/fast-sdk-pr/badge/icon)

⚡ オープンソースの超高速ホワイトボラッド

## 🎉 クイックスタート

### オンライン

[codepen](https://codepen.io/buhe/pen/XWryGWO?editors=1000#0)

### リアルタイムのインタラクティブホワイトボード

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

### ホワイトボード再生プレーヤー

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

## 📖 ドキュメント

### リアルタイムのインタラクティブホワイトボード

```javascript
var userId = `${Math.floor(Math.random() * 100000)}`;
var uuid = "3dac59e714d2443eb733e9de5dc2beb4";
var roomToken = "WHITEcGFydG5lcl9pZD0zZHlaZ1BwWUtwWVN2VDVmNGQ4UGI2M2djVGhncENIOXBBeTcmc2lnPWE4ZWIyZWE3ZDliMWJiZDkyNWQ0Yzg4YTgwYjVlYjFiOTQxOTZiYmY6YWRtaW5JZD0xNTgmcm9vbUlkPTNkYWM1OWU3MTRkMjQ0M2ViNzMzZTlkZTVkYzJiZWI0JnRlYW1JZD0yODMmcm9sZT1yb29tJmV4cGlyZV90aW1lPTE2MDA1MDEzNTkmYWs9M2R5WmdQcFlLcFlTdlQ1ZjRkOFBiNjNnY1RoZ3BDSDlwQXk3JmNyZWF0ZV90aW1lPTE1Njg5NDQ0MDcmbm9uY2U9MTU2ODk0NDQwNjY0MzAw";
WhiteFastSDK.Room("app-root",{
        uuid: uuid,
        userInf: {
            name: "Netless",
            id: userId,
            avatar: "https://ohuuyffq2.qnssl.com/netless_icon.png",
        },
        roomToken: roomToken,
        logoUrl: "",
        toolBarPosition: "left",
        pagePreviewPosition: "right",
        boardBackgroundColor: "#F2F2F2",
        isReadOnly: false,
        identity: "host",
        defaultColorArray: [
            "#E77345",
            "#005BF6",
            "#F5AD46",
            "#68AB5D",
            "#9E51B6",
            "#1E2023",
        ],
        colorArrayStateCallback: (colorArray) => {
            console.log(colorArray);
        }
    });
});
```

### ホワイトボード再生プレーヤー

```javascript
var uuid = "8c2ee602f11e4883a75a9be9dd51b4cd";
var roomToken = "WHITEcGFydG5lcl9pZD0zZHlaZ1BwWUtwWVN2VDVmNGQ4UGI2M2djVGhncENIOXBBeTcmc2lnPWFhODIxMTQ5NjdhZDdmMmVlMzI1NmJhNjUwNmM2OTJmMzFkNGZiODg6YWRtaW5JZD0xNTgmcm9vbUlkPThjMmVlNjAyZjExZTQ4ODNhNzVhOWJlOWRkNTFiNGNkJnRlYW1JZD0yODMmcm9sZT1yb29tJmV4cGlyZV90aW1lPTE2MDA1MTI0OTYmYWs9M2R5WmdQcFlLcFlTdlQ1ZjRkOFBiNjNnY1RoZ3BDSDlwQXk3JmNyZWF0ZV90aW1lPTE1Njg5NTU1NDQmbm9uY2U9MTU2ODk1NTU0NDAwMjAw";
WhiteFastSDK.Player("app-root",{
    uuid: uuid,
    userInf: {
        name: "Netless",
        id: "1",
    },
    roomToken: roomToken,
    logoUrl: "",
    toolBarPosition: "left",
    pagePreviewPosition: "left",
    boardBackgroundColor: "#F2F2F2",
    isReadOnly: false,
    defaultColorArray: [
        "#E77345",
        "#005BF6",
        "#F5AD46",
        "#68AB5D",
        "#9E51B6",
        "#1E2023",
    ],
    colorArrayStateCallback: (colorArray) => {
        console.log(colorArray);
    }
});
```

## 🚀 開発

1. コマンドラインでyarn devを実行する
2. ブラウザで facade/index.html を開き、インタラクティブホワイトボードを入力します。
3. ブラウザで facade/player.html を開き、ホワイトボードプレーヤーを入力します。

## 👏 寄稿

パッチと追加の提出については、各プロジェクトのスタイルと貢献のガイドラインを参照してください。一般に、「フォークアンドプル」Gitワークフローに従います。

1. GitHubでレポをフォークします
2. プロジェクトを自分のマシンに複製する
3. 変更を自分のブランチにコミットする
4. 作業をフォークに戻す
5. プルリクエストを送信して、変更を確認できるようにします
注：プルリクエストを行う前に、「上流」から最新のものを必ずマージしてください。
