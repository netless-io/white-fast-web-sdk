import * as React from "react";
import {Md5} from "md5-typescript";

export type IdenticonProps = {
    className?: string,
    size?: number,
    string?: string,
    bg?: string,
    count?: number,
    palette?: null | string[],
    fg?: null | string,
    padding?: number,
    getColor?: ((e: Int32Array | string) => string) | null,
};

export type IdenticonStates = {
    className: string,
    size: number,
    string: string,
    bg: string,
    count: number,
    palette: null | string[],
    fg: null | string,
    padding: number,
    getColor: ((e: Int32Array | string) => string) | null,
};

class Identicon extends React.Component<IdenticonProps, IdenticonStates> {
    private readonly canvas: any;
    public constructor(props: IdenticonProps) {
        super(props);
        this.canvas = React.createRef();
        this.state = {
            className: this.props.className ? this.props.className : "identicon",
            size: this.props.size ? this.props.size : 400,
            string: this.props.string ? this.props.string : "",
            bg: this.props.bg ? this.props.bg : "transparent",
            count: this.props.count ? this.props.count : 5,
            palette: this.props.palette !== undefined ? this.props.palette : null,
            fg: this.props.fg !== undefined ? this.props.fg : null,
            padding: this.props.padding !== undefined ? this.props.padding : 0,
            getColor: this.props.getColor !== undefined ? this.props.getColor : null,
        };
    }
    public componentDidMount(): void {
        this.updateCanvas(this.state);
    }

    private range = (n: any, in_min: any, in_max: any, out_min: any, out_max: any): number => {
        return (n - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }

    private updateCanvas = (props: IdenticonProps): void => {
        const {fg, bg, count, palette, size, padding} = this.state;
        let selfFg = fg;
        const hash = Md5.init(props.string);
        const block = Math.floor(size / count);
        const hashcolor = hash.slice(0, 6);

        if (palette && palette.length) {
            const palette_index = Math.floor(this.range(parseInt(hash.slice(-3), 16), 0, 4095, 0, palette.length));
            selfFg = palette[palette_index];
        }

        if (this.props.getColor) {
            this.props.getColor(selfFg || hashcolor);
        }

        const pad = padding;
        this.canvas.current.width = block * count + pad;
        this.canvas.current.height = block * count + pad;
        const arr = hash.split("").map((el: any) => {
            el = parseInt(el, 16);
            if (el < 8) {return 0; }
            else {return 1; }
        });

        const map = [];

        map[0] = map[4] = arr.slice(0, 5);
        map[1] = map[3] = arr.slice(5, 10);
        map[2] = arr.slice(10, 15);

        const ctx = this.canvas.current.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, this.canvas.current.width, this.canvas.current.height);

        map.forEach((row, i) => {
            row.forEach((el: any, j: any) => {
                if (el) {
                    ctx.fillStyle = selfFg ? selfFg : "#" + hashcolor  ;
                    ctx.fillRect(block * i + pad, block * j + pad, block - pad, block - pad);
                }
                else {
                    ctx.fillStyle = bg;
                    ctx.fillRect(block * i + pad, block * j + pad, block - pad, block - pad);
                }
            });
        });
    }
    public render(): React.ReactNode {
        return (
            <canvas ref={this.canvas} className={this.props.className} style={{width: this.props.size, height: this.props.size}}/>
        );
    }
}

export default Identicon;
