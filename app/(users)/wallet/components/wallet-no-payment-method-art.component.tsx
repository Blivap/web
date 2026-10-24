/** Product-UI empty card slot — not a decorative illustration. */
export function WalletNoPaymentMethodArt({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 200"
      fill="none"
      className={className}
      role="img"
      aria-label="No card"
    >
      <rect
        width="320"
        height="200"
        rx="16"
        className="fill-[#FAFAFA] dark:fill-white/5"
      />
      <rect
        x="48"
        y="36"
        width="224"
        height="128"
        rx="14"
        className="fill-white dark:fill-[#1a1a22]"
        stroke="#960018"
        strokeOpacity="0.4"
        strokeWidth="1.75"
        strokeDasharray="6 5"
      />
      <rect
        x="68"
        y="58"
        width="34"
        height="26"
        rx="5"
        fill="#960018"
        fillOpacity="0.12"
      />
      <rect
        x="72"
        y="62"
        width="26"
        height="18"
        rx="3"
        fill="#960018"
        fillOpacity="0.22"
      />
      <rect
        x="68"
        y="98"
        width="184"
        height="8"
        rx="4"
        fill="#960018"
        fillOpacity="0.1"
      />
      <rect
        x="68"
        y="118"
        width="18"
        height="6"
        rx="3"
        className="fill-black/15 dark:fill-white/20"
      />
      <rect
        x="92"
        y="118"
        width="18"
        height="6"
        rx="3"
        className="fill-black/15 dark:fill-white/20"
      />
      <rect
        x="116"
        y="118"
        width="18"
        height="6"
        rx="3"
        className="fill-black/15 dark:fill-white/20"
      />
      <rect
        x="140"
        y="118"
        width="28"
        height="6"
        rx="3"
        className="fill-black/20 dark:fill-white/25"
      />
      <text
        x="160"
        y="86"
        textAnchor="middle"
        fill="#960018"
        style={{
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        No card
      </text>
    </svg>
  );
}
