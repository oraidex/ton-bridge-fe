import { FC, SVGProps } from "react";

export const LinkIcon: FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.31875 11.25H2.5C1.5375 11.25 0.75 10.4625 0.75 9.5V3.68125C0.75 2.71875 1.5375 1.93125 2.5 1.93125H4.81875C5.125 1.93125 5.3875 2.19375 5.3875 2.5C5.3875 2.80625 5.125 3.06875 4.81875 3.06875H2.5C2.19375 3.06875 1.93125 3.33125 1.93125 3.6375V9.5C1.93125 9.80625 2.19375 10.0687 2.5 10.0687H8.31875C8.625 10.0687 8.8875 9.80625 8.8875 9.5V7.18125C8.8875 6.875 9.15 6.6125 9.45625 6.6125C9.7625 6.6125 10.025 6.875 10.025 7.18125V9.5C10.0688 10.4625 9.28125 11.25 8.31875 11.25ZM4.81875 7.75C4.6875 7.75 4.5125 7.70625 4.425 7.575C4.20625 7.35625 4.20625 6.9625 4.425 6.74375L9.2375 1.93125H7.1375C6.83125 1.93125 6.56875 1.66875 6.56875 1.3625C6.56875 1.05625 6.83125 0.75 7.18125 0.75H10.6813C10.7688 0.75 10.8563 0.75 10.9 0.79375C10.9875 0.8375 11.0312 0.88125 11.075 0.925C11.1188 0.96875 11.1625 1.05625 11.2063 1.1C11.25 1.1875 11.25 1.275 11.25 1.31875V4.81875C11.25 5.125 10.9875 5.3875 10.6813 5.3875C10.375 5.3875 10.1125 5.125 10.1125 4.81875V2.7625L5.25625 7.575C5.125 7.70625 4.99375 7.75 4.81875 7.75Z"
        fill="#A871DF"
      />
    </svg>
  );
};

export const FailedIcon: FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"
        fill="#A81100"
      />
      <path
        d="M20 15V21M20 25.01L20.01 24.999M20 30C25.523 30 30 25.523 30 20C30 14.477 25.523 10 20 10C14.477 10 10 14.477 10 20C10 25.523 14.477 30 20 30Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const InfoIcon: FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"
        fill="#AEE67F"
      />
      <path
        d="M20 19.5V24.5M20 15.51L20.01 15.499M20 30C25.523 30 30 25.523 30 20C30 14.477 25.523 10 20 10C14.477 10 10 14.477 10 20C10 25.523 14.477 30 20 30Z"
        stroke="#232521"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const SuccessIcon: FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"
        fill="#AEE67F"
      />
      <path
        d="M13 21L17 25L27 15"
        stroke="#232521"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const CloseToastIcon: FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.75781 17.2438L12.0008 12.0008L17.2438 17.2438M17.2438 6.75781L11.9998 12.0008L6.75781 6.75781"
        stroke="#979995"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
