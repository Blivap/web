interface IconProps {
  color?: string;
  fill?: string;
  className?: string;
}

export const DashBoardIcon = ({ color = "#960018", className }: IconProps) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M17 10H19C21 10 22 9 22 7V5C22 3 21 2 19 2H17C15 2 14 3 14 5V7C14 9 15 10 17 10Z"
      stroke={color}
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 22H7C9 22 10 21 10 19V17C10 15 9 14 7 14H5C3 14 2 15 2 17V19C2 21 3 22 5 22Z"
      stroke={color}
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 10C8.20914 10 10 8.20914 10 6C10 3.79086 8.20914 2 6 2C3.79086 2 2 3.79086 2 6C2 8.20914 3.79086 10 6 10Z"
      fill={color}
    />
    <path
      d="M18 22C20.2091 22 22 20.2091 22 18C22 15.7909 20.2091 14 18 14C15.7909 14 14 15.7909 14 18C14 20.2091 15.7909 22 18 22Z"
      stroke={color}
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Add more icon components as needed
export const WalletIcon = ({ color = "#070416", className }: IconProps) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M18.04 13.55C17.62 13.96 17.38 14.55 17.44 15.18C17.53 16.26 18.52 17.05 19.6 17.05H21.5V18.24C21.5 20.31 19.81 22 17.74 22H6.26C4.19 22 2.5 20.31 2.5 18.24V11.51C2.5 9.44001 4.19 7.75 6.26 7.75H17.74C19.81 7.75 21.5 9.44001 21.5 11.51V12.95H19.48C18.92 12.95 18.41 13.17 18.04 13.55Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.5 12.4093V7.83937C2.5 6.64937 3.23 5.58933 4.34 5.16933L12.28 2.16933C13.52 1.69933 14.85 2.61936 14.85 3.94936V7.74934"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22.5588 13.9692V16.0292C22.5588 16.5792 22.1188 17.0292 21.5588 17.0492H19.5988C18.5188 17.0492 17.5288 16.2592 17.4388 15.1792C17.3788 14.5492 17.6188 13.9592 18.0388 13.5492C18.4088 13.1692 18.9188 12.9492 19.4788 12.9492H21.5588C22.1188 12.9692 22.5588 13.4192 22.5588 13.9692Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const DonorsIcon = ({ color = "#070416", className }: IconProps) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M20.0101 18.5106L15.0601 13.5605"
      stroke={color}
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.06 13.56L11.52 17.1C10.74 17.88 9.47 17.88 8.69 17.1L4.44999 12.86C3.66999 12.08 3.66999 10.81 4.44999 10.03L11.52 2.96C12.3 2.18 13.57 2.18 14.35 2.96L18.59 7.20002C19.37 7.98002 19.37 9.25001 18.59 10.03L15.06 13.56Z"
      stroke={color}
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.56006 7.91992L13.6301 14.9899"
      stroke={color}
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const HistoryIcon = ({ color = "#070416", className }: IconProps) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.7099 15.1798L12.6099 13.3298C12.0699 13.0098 11.6299 12.2398 11.6299 11.6098V7.50977"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const SettingsIcon = ({ color = "#070416", className }: IconProps) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M3 9.10937V14.8794C3 16.9994 3 16.9994 5 18.3494L10.5 21.5294C11.33 22.0094 12.68 22.0094 13.5 21.5294L19 18.3494C21 16.9994 21 16.9994 21 14.8894V9.10937C21 6.99937 21 6.99937 19 5.64937L13.5 2.46937C12.68 1.98937 11.33 1.98937 10.5 2.46937L5 5.64937C3 6.99937 3 6.99937 3 9.10937Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ModeIcon = ({ color = "#070416", className }: IconProps) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M20.3541 15.3545C18.7173 16.0127 16.9232 16.1753 15.1948 15.8222C13.4663 15.4691 11.8797 14.6158 10.6323 13.3683C9.38484 12.1209 8.53151 10.5343 8.17839 8.80584C7.82527 7.07738 7.98791 5.28326 8.64611 3.64648C6.70782 4.42722 5.10148 5.85787 4.10244 7.6932C3.1034 9.52854 2.77391 11.6542 3.17043 13.7059C3.56695 15.7575 4.6648 17.6074 6.27577 18.9383C7.88674 20.2692 9.9105 20.9982 12.0001 21.0005C13.797 21.0005 15.5529 20.4629 17.0417 19.4567C18.5305 18.4505 19.6841 17.0218 20.3541 15.3545Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20.9807 12.5891C21.0638 11.3226 20.878 10.0528 20.4357 8.86319C19.9933 7.67354 19.3043 6.59091 18.4139 5.68638C17.5235 4.78185 16.4519 4.07588 15.2694 3.61482C14.0868 3.15375 12.8202 2.94802 11.5525 3.01113"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const MoonIcon = ({ color = "#070416", fill, className }: IconProps) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g opacity="0.5">
      <path
        d="M5.18406 11.2452C5.39406 14.2494 7.94322 16.6936 10.9941 16.8277C13.1466 16.9211 15.0716 15.9177 16.2266 14.3369C16.7049 13.6894 16.4482 13.2577 15.6491 13.4036C15.2582 13.4736 14.8557 13.5027 14.4357 13.4852C11.5832 13.3686 9.24989 10.9827 9.23822 8.16522C9.23239 7.40689 9.38989 6.68939 9.67572 6.03605C9.99072 5.31272 9.61156 4.96855 8.88239 5.27772C6.57239 6.25189 4.99156 8.57939 5.18406 11.2452Z"
        stroke={color}
        fill={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

export const SunIcon = ({ color = "#5429FF", fill, className }: IconProps) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M6.99992 10.7923C9.094 10.7923 10.7916 9.09473 10.7916 7.00065C10.7916 4.90657 9.094 3.20898 6.99992 3.20898C4.90584 3.20898 3.20825 4.90657 3.20825 7.00065C3.20825 9.09473 4.90584 10.7923 6.99992 10.7923Z"
      fill={fill || color}
    />
    <path
      d="M11.1651 11.1643L11.0892 11.0885M11.0892 2.91018L11.1651 2.83435L11.0892 2.91018ZM2.83508 11.1643L2.91091 11.0885L2.83508 11.1643ZM7.00008 1.21268V1.16602V1.21268ZM7.00008 12.8327V12.786V12.8327ZM1.21341 6.99935H1.16675H1.21341ZM12.8334 6.99935H12.7867H12.8334ZM2.91091 2.91018L2.83508 2.83435L2.91091 2.91018Z"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
