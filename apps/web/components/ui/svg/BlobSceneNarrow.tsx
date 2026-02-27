export default function BlobSceneNarrow({ className }: { className?: string }) {
  return (
    <svg
      id="visual"
      viewBox="0 0 450 900"
      width="450"
      height="900"
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      className={className}
    >
      <rect x="0" y="0" width="450" height="900" fill="transparent"></rect>
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
      <g transform="translate(450, 900)">
        <path
          d="M-247.5 0C-229.4 -28.6 -211.3 -57.3 -194.9 -80.7C-178.6 -104.2 -163.9 -122.5 -149.2 -149.2C-134.5 -175.9 -119.6 -210.9 -94.7 -228.7C-69.8 -246.4 -34.9 -247 0 -247.5L0 0Z"
          fill="#6f6f6f"
        ></path>
        <path
          d="M-123.7 0C-114.7 -14.3 -105.7 -28.6 -97.5 -40.4C-89.3 -52.1 -82 -61.3 -74.6 -74.6C-67.2 -87.9 -59.8 -105.4 -47.4 -114.3C-34.9 -123.2 -17.5 -123.5 0 -123.7L0 0Z"
          fill="var(--primary)"
        ></path>
      </g>
      <g transform="translate(0, 0)">
        <path
          d="M247.5 0C224.7 24.4 201.8 48.8 193.1 80C184.4 111.2 189.7 149.2 175 175C160.3 200.8 125.5 214.5 93 224.5C60.5 234.6 30.2 241 0 247.5L0 0Z"
          fill="#6f6f6f"
        ></path>
        <path
          d="M123.8 0C112.3 12.2 100.9 24.4 96.5 40C92.2 55.6 94.9 74.6 87.5 87.5C80.1 100.4 62.8 107.2 46.5 112.3C30.2 117.3 15.1 120.5 0 123.8L0 0Z"
          fill="var(--primary)"
        ></path>
      </g>
    </svg>
  )
}
