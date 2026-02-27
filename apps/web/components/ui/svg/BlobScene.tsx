export default function BlobScene({ className }: { className?: string }) {
  return (
    <svg
      id="visual"
      viewBox="0 0 675 900"
      width="675"
      height="900"
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      className={className}
    >
      <rect x="0" y="0" width="675" height="900" fill="transparent"></rect>
      <defs>
        <linearGradient id="grad1_0" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="30%" stopColor="var(--primary)" stopOpacity="1"></stop>
          <stop offset="70%" stopColor="var(--primary)" stopOpacity="1"></stop>
        </linearGradient>
      </defs>
      <defs>
        <linearGradient id="grad1_1" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="30%" stopColor="var(--primary)" stopOpacity="1"></stop>
          <stop
            offset="70%"
            stopColor="var(--background)"
            stopOpacity="1"
          ></stop>
        </linearGradient>
      </defs>
      <defs>
        <linearGradient id="grad2_0" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="30%" stopColor="var(--primary)" stopOpacity="1"></stop>
          <stop offset="70%" stopColor="var(--primary)" stopOpacity="1"></stop>
        </linearGradient>
      </defs>
      <defs>
        <linearGradient id="grad2_1" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop
            offset="30%"
            stopColor="var(--background)"
            stopOpacity="1"
          ></stop>
          <stop offset="70%" stopColor="var(--primary)" stopOpacity="1"></stop>
        </linearGradient>
      </defs>
      <g transform="translate(675, 900)">
        <path
          d="M-337.5 0C-315.3 -38.3 -293.2 -76.6 -276.2 -114.4C-259.3 -152.2 -247.6 -189.6 -224.9 -224.9C-202.2 -260.1 -168.5 -293.4 -129.2 -311.8C-89.8 -330.2 -44.9 -333.9 0 -337.5L0 0Z"
          fill="#6f6f6f"
        ></path>
        <path
          d="M-168.7 0C-157.7 -19.2 -146.6 -38.3 -138.1 -57.2C-129.6 -76.1 -123.8 -94.8 -112.4 -112.4C-101.1 -130.1 -84.2 -146.7 -64.6 -155.9C-44.9 -165.1 -22.5 -166.9 0 -168.7L0 0Z"
          fill="var(--primary)"
        ></path>
      </g>
      <g transform="translate(0, 0)">
        <path
          d="M337.5 0C326.1 42.1 314.7 84.2 298.4 123.6C282.1 163 260.9 199.6 232.6 232.6C204.4 265.6 169.1 294.9 129.2 311.8C89.2 328.7 44.6 333.1 0 337.5L0 0Z"
          fill="#6f6f6f"
        ></path>
        <path
          d="M168.8 0C163.1 21.1 157.4 42.1 149.2 61.8C141.1 81.5 130.4 99.8 116.3 116.3C102.2 132.8 84.6 147.5 64.6 155.9C44.6 164.3 22.3 166.5 0 168.8L0 0Z"
          fill="var(--primary)"
        ></path>
      </g>
    </svg>
  )
}
