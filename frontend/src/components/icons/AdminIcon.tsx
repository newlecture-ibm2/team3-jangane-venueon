import * as React from "react";
import { SVGProps } from "react";

const AdminIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#clip0_631_8543)">
      <path
        d="M2 3.9198L12.0048 1L22 3.9198V9.90761C22 16.2012 17.9723 21.233 12.0014 23.2225C6.02894 21.2331 2 16.2 2 9.90483V3.9198Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12.0004 11.5556C13.5346 11.5556 14.7782 10.3119 14.7782 8.77778C14.7782 7.24365 13.5346 6 12.0004 6C10.4663 6 9.22266 7.24365 9.22266 8.77778C9.22266 10.3119 10.4663 11.5556 12.0004 11.5556Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.4446 16.0001C16.4446 13.5455 14.4547 11.5557 12.0001 11.5557C9.5455 11.5557 7.55566 13.5455 7.55566 16.0001"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_631_8543">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default AdminIcon;
