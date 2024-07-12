import React, { FC, SVGProps } from "react";

export const CloseIcon: FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      {...props}
    >
      <path
        d="M14 26.4998C20.9036 26.4998 26.5 20.9033 26.5 13.9998C26.5 7.0962 20.9036 1.49976 14 1.49976C7.09644 1.49976 1.5 7.0962 1.5 13.9998C1.5 20.9033 7.09644 26.4998 14 26.4998Z"
        stroke="#979995"
        strokeWidth="2"
      />
      <path
        d="M17.125 10.8748L10.875 17.1248M10.875 10.8748L17.125 17.1248"
        stroke="#979995"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const SwapIcon: FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="26.75"
        y="26.75"
        width="25.5"
        height="25.5"
        rx="12.75"
        transform="rotate(-180 26.75 26.75)"
        fill="#494949"
      />
      <rect
        x="26.75"
        y="26.75"
        width="25.5"
        height="25.5"
        rx="12.75"
        transform="rotate(-180 26.75 26.75)"
        stroke="#1B1D19"
        strokeWidth="1.5"
      />
      <path
        d="M19.4858 10.5713L8.51441 10.5713M8.51441 10.5713L10.5715 8.51417M8.51441 10.5713L10.5715 12.6285M8.5144 17.4285L19.4858 17.4285M19.4858 17.4285L17.4287 15.3713M19.4858 17.4285L17.4287 19.4856"
        stroke="#F7F7F7"
        strokeWidth="1.02857"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const SearchIcon: FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.1579 9.52632C16.1579 13.1888 13.1888 16.1579 9.52632 16.1579C5.8638 16.1579 2.89474 13.1888 2.89474 9.52632C2.89474 5.8638 5.8638 2.89474 9.52632 2.89474C13.1888 2.89474 16.1579 5.8638 16.1579 9.52632ZM16.1881 14.8483C17.3549 13.3897 18.0526 11.5395 18.0526 9.52632C18.0526 4.81736 14.2353 1 9.52632 1C4.81736 1 1 4.81736 1 9.52632C1 14.2353 4.81736 18.0526 9.52632 18.0526C11.5395 18.0526 13.3897 17.3549 14.8483 16.1881L17.3827 18.7225C17.7527 19.0925 18.3526 19.0925 18.7225 18.7225C19.0925 18.3526 19.0925 17.7527 18.7225 17.3827L16.1881 14.8483Z"
        fill="#EFEFEF"
      />
    </svg>
  );
};

export const CopyIcon: FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      {...props}
    >
      <path
        d="M14.1667 14.6667H6C5.86739 14.6667 5.74021 14.614 5.64645 14.5202C5.55268 14.4265 5.5 14.2993 5.5 14.1667V6C5.5 5.86739 5.55268 5.74021 5.64645 5.64645C5.74021 5.55268 5.86739 5.5 6 5.5H14.1667C14.2993 5.5 14.4265 5.55268 14.5202 5.64645C14.614 5.74021 14.6667 5.86739 14.6667 6V14.1667C14.6667 14.2993 14.614 14.4265 14.5202 14.5202C14.4265 14.614 14.2993 14.6667 14.1667 14.6667Z"
        stroke="#979995"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.4997 5.49992V1.83325C10.4997 1.70064 10.447 1.57347 10.3532 1.4797C10.2595 1.38593 10.1323 1.33325 9.99967 1.33325H1.83301C1.7004 1.33325 1.57322 1.38593 1.47945 1.4797C1.38569 1.57347 1.33301 1.70064 1.33301 1.83325V9.99992C1.33301 10.1325 1.38569 10.2597 1.47945 10.3535C1.57322 10.4472 1.7004 10.4999 1.83301 10.4999H5.49967"
        stroke="#979995"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
