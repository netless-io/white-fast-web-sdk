import * as React from "react";

export type IconProps = {
    color?: string;
    className?: string;
};

export class ToolBoxSelector extends React.Component<IconProps, {}> {

    public constructor(props: IconProps) {
        super(props);
    }

    public render(): React.ReactNode {
        const isActive = this.props.color !== "rgb(162,167,173)";
        return (
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd"
                      d="M2.4868 6.58275C1.62719 6.24058 1.65327 5.01496 2.52665 4.70966L14.0769 0.672222C14.8612 0.398074 15.6184 1.14442 15.3555 1.93256L11.5076 13.4712C11.2154 14.3477 9.99264 14.3929 9.63635 13.5405L7.73683 8.99596C7.63313 8.74785 7.43386 8.55196 7.18402 8.45251L2.4868 6.58275Z"
                      transform="translate(16) scale(-1 1)"
                      fill={isActive ? "#141414" : this.props.color}
                />
            </svg>

        );
    }
}

export class ToolBoxPencil extends React.Component<IconProps, {}> {

    public constructor(props: IconProps) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M0.0182346 1.54448C0.83115 1.03978 11.0803 -1.33972 12.0561 1.03978C13.0318 3.41928 0.61548 2.16248 0.0182346 5.45443C-0.579009 8.74638 13.7165 2.52969 12.8863 6.04973C12.0561 9.56977 0.0182346 7.06741 0.0182346 10.8533C0.0182346 14.6391 11.9891 8.31318 12.8863 10.5679C13.7834 12.8226 8.20001 13.3065 5.7957 14.0422"
                    transform="translate(1 1.90564) rotate(-4)"
                    stroke={this.props.color} strokeWidth="2" strokeLinecap="round"
                    strokeLinejoin="round"/>
            </svg>
        );
    }
}

export class ToolBoxText extends React.Component<IconProps, {}> {

    public constructor(props: IconProps) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 2V0H12V2" transform="translate(1 1)" stroke={this.props.color} strokeWidth="1.86667"
                      strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M0 0H7" transform="translate(3.5 12.5)" stroke={this.props.color} strokeWidth="1.86667"
                      strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M0 0V11" transform="translate(7 1)" stroke={this.props.color} strokeWidth="1.86667"
                      strokeLinecap="round" strokeLinejoin="round"/>
            </svg>

        );
    }
}

export class ToolBoxEraser extends React.Component<IconProps, {}> {

    public constructor(props: IconProps) {
        super(props);
    }

    public render(): React.ReactNode {
        const isActive = this.props.color !== "rgb(162,167,173)";
        return (
            <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10.968 1.41667C10.1704 0.637358 8.88965 0.660726 8.1211 1.46861L0.651229 9.32083C0.285744 9.70502 0.283692 10.3077 0.646551 10.6944L3.352 13.5774C3.54103 13.7788 3.80496 13.8931 4.0812 13.8931H5.86992C6.14522 13.8931 6.40834 13.7796 6.59727 13.5793L13.316 6.45851C14.0646 5.66504 14.0393 4.41798 13.2591 3.65553L10.968 1.41667Z"
                    transform="translate(1 0.711777)"
                    stroke={isActive ? "#141414" : this.props.color} strokeLinecap="round" strokeLinejoin="round"/>
                <path fillRule="evenodd" clipRule="evenodd"
                      d="M4.90193 2.35191C6.03948 1.07145 8.0164 1.00167 9.24141 2.19873L10.7139 3.63766C11.8959 4.79261 11.9212 6.68589 10.7706 7.87207L5.56447 13.2393L-7.02753e-08 7.86966L4.90193 2.35191Z"
                      transform="translate(3.51389)"
                      fill={isActive ? "#141414" : this.props.color}/>
            </svg>

        );
    }
}

export class ToolBoxUpload extends React.Component<IconProps, {}> {

    public constructor(props: IconProps) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0 13.4766C0 14.3174 0.651367 15 1.45459 15H14.5454C15.3486 15 16 14.3174 16 13.4766V3.04785C16 2.49512 15.5522 2.04785 15 2.04785H8.39575C8.1416 2.04785 7.89673 1.95117 7.71143 1.77637L6.10669 0.270508C5.92139 0.0966797 5.67676 0 5.42236 0H1C0.447754 0 0 0.447266 0 1V13.4766ZM8.69995 5.33301C8.69995 4.94629 8.38672 4.63281 8 4.63281C7.61353 4.63281 7.30005 4.94629 7.30005 5.33301V11.3994C7.30005 11.7861 7.61353 12.0996 8 12.0996C8.38672 12.0996 8.69995 11.7861 8.69995 11.3994V5.33301Z"
                    fill={this.props.color}/>
                <path
                    d="M0 2.83111L2.625 0L5.25 2.83111"
                    transform="translate(5.37524 5.33301)"
                    fill="white"/>
                <path
                    d="M0 2.83111L2.625 0L5.25 2.83111H0Z"
                    transform="translate(5.37524 5.33301)"
                    stroke="white"
                    strokeWidth="1.4"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"/>
            </svg>
        );
    }
}


export class ToolBoxEllipse extends React.Component<IconProps, {}> {

    public constructor(props: IconProps) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M7.5 15C11.6421 15 15 11.6421 15 7.5C15 3.35786 11.6421 0 7.5 0C3.35786 0 0 3.35786 0 7.5C0 11.6421 3.35786 15 7.5 15Z"
                    transform="translate(1 1)"
                    stroke={this.props.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"/>
            </svg>
        );
    }
}

export class ToolBoxRectangle extends React.Component<IconProps, {}> {

    public constructor(props: IconProps) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 0H0V14H14V0Z" transform="translate(1 1)"
                      stroke={this.props.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>

        );
    }
}

export class StrokeWidth extends React.Component<IconProps, {}> {

    public constructor(props: IconProps) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <div className={this.props.className}>
                <svg width="242" height="32" viewBox="0 0 269 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M252 31.9693V32L0 16V15L252 0V0.030742C252.331 0.0103478 252.664 0 253 0C261.837 0 269 7.16344 269 16C269 24.8366 261.837 32 253 32C252.664 32 252.331 31.9897 252 31.9693Z"
                        fill={this.props.color}/>
                </svg>
            </div>
        );
    }
}
