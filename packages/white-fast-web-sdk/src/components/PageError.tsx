import * as React from "react";
import "./PageError.less";
import {Button} from "antd";

class PageError extends React.Component<{}, {}> {
    public constructor(props: {}) {
        super(props);
    }
    public render(): React.ReactNode {
        return (
            <div className="page404-box">
                <div className="page404-image-box">
                    <img className="page404-image-inner" src="https://white-sdk.oss-cn-beijing.aliyuncs.com/fast-sdk/icons/room_not_find.svg"/>
                    <div className="page404-inner">
                        创建播放器失败，请检查网络！
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        className="page404-btn"
                        onClick={() => location.reload()}
                    >
                       刷新重试
                    </Button>
                </div>
            </div>
        );
    }
}

export default PageError;
