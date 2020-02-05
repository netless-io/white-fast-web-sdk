import * as React from "react";

export type IconProps = {
    color: string;
};

export class ExtendToolIcon extends React.Component<IconProps, {}> {

    public constructor(props: IconProps) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0)">
                    <path d="M1.07143 0H5.35714C6.07143 0 6.42857 0.357143 6.42857 1.07143V5.35714C6.42857 6.07143 6.07143 6.42857 5.35714 6.42857H1.07143C0.357143 6.42857 0 6.07143 0 5.35714V1.07143C0 0.357143 0.357143 0 1.07143 0V0Z" fill={this.props.color}/>
                    <path d="M1.07143 8.57141H5.35714C6.07143 8.57141 6.42857 8.92855 6.42857 9.64284V13.9286C6.42857 14.6428 6.07143 15 5.35714 15H1.07143C0.357143 15 0 14.6428 0 13.9286V9.64284C0 8.92855 0.357143 8.57141 1.07143 8.57141V8.57141Z" fill={this.props.color}/>
                    <path d="M9.64284 0H13.9286C14.6428 0 15 0.357143 15 1.07143V5.35714C15 6.07143 14.6428 6.42857 13.9286 6.42857H9.64284C8.92855 6.42857 8.57141 6.07143 8.57141 5.35714V1.07143C8.57141 0.357143 8.92855 0 9.64284 0V0Z" fill={this.props.color}/>
                    <path d="M9.64284 8.57141H13.9286C14.6428 8.57141 15 8.92855 15 9.64284V13.9286C15 14.6428 14.6428 15 13.9286 15H9.64284C8.92855 15 8.57141 14.6428 8.57141 13.9286V9.64284C8.57141 8.92855 8.92855 8.57141 9.64284 8.57141Z" fill={this.props.color}/>
                </g>
                <defs>
                    <clipPath id="clip0">
                        <rect width="15" height="15" fill="white"/>
                    </clipPath>
                </defs>
            </svg>


        );
    }
}
