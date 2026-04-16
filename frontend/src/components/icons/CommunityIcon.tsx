import * as React from "react";
import { SVGProps } from "react";

const CommunityIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M9.99967 16.6668C13.6816 16.6668 16.6663 13.6821 16.6663 10.0002C16.6663 6.31825 13.6816 3.3335 9.99967 3.3335C6.31776 3.3335 3.33301 6.31825 3.33301 10.0002C3.33301 13.6821 6.31776 16.6668 9.99967 16.6668Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    <path d="M15.6521 6.4624C17.4101 6.61582 18.6165 7.15515 18.8547 8.04415C19.3312 9.82236 15.7532 12.3261 10.8631 13.6364C5.97303 14.9467 1.62256 14.5674 1.14608 12.7892C0.896447 11.8575 1.75976 10.7267 3.34163 9.67269" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default CommunityIcon;
