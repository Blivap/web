import type { ReactNode } from "react";

type MeetupCareArtProps = {
  code: string;
  title: string;
};

const MAROON = "#960018";
const MAROON_DEEP = "#6E0012";
const INK = "#3C3848";
const MIST = "#F1F1F1";
const DOT = "#D9D9D9";

function artKind(code: string, title: string): string {
  const value = `${code} ${title}`.toLowerCase();
  if (value.includes("transport") || value.includes("fare")) return "transport";
  if (value.includes("meal") || value.includes("feed")) return "meals";
  if (value.includes("refresh") || value.includes("recover")) return "recovery";
  if (value.includes("accommod") || value.includes("stay")) return "stay";
  if (value.includes("companion")) return "companion";
  if (value.includes("child")) return "childcare";
  if (value.includes("airtime") || value.includes("phone")) return "airtime";
  return "time";
}

function Stage({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 280 220" className="size-full" aria-hidden>
      <rect width="280" height="220" fill="#fff" />
      <circle cx="140" cy="118" r="72" fill={MIST} />
      <circle cx="118" cy="100" r="7" fill={DOT} />
      <circle cx="156" cy="132" r="5" fill={DOT} />
      <circle cx="132" cy="148" r="4" fill={DOT} />
      <circle cx="168" cy="108" r="3.5" fill={DOT} />
      {children}
    </svg>
  );
}

function Pin({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M12 0C5.4 0 0 5.2 0 11.6 0 20 12 32 12 32s12-12 12-20.4C24 5.2 18.6 0 12 0z"
        fill={MAROON}
      />
      <circle cx="12" cy="11" r="4.5" fill="#fff" />
    </g>
  );
}

export function MeetupCareArt({ code, title }: MeetupCareArtProps) {
  const kind = artKind(code, title);
  if (kind === "transport") return <TransportArt />;
  if (kind === "meals") return <MealsArt />;
  if (kind === "recovery") return <RecoveryArt />;
  if (kind === "stay") return <StayArt />;
  if (kind === "companion") return <CompanionArt />;
  if (kind === "childcare") return <ChildcareArt />;
  if (kind === "airtime") return <AirtimeArt />;
  return <TimeArt />;
}

function TransportArt() {
  return (
    <Stage>
      <ellipse
        cx="140"
        cy="118"
        rx="108"
        ry="40"
        fill="none"
        stroke={INK}
        strokeWidth="3.5"
      />
      <Pin x={96} y={62} />
      <Pin x={168} y={86} />
      <Pin x={124} y={112} />
      <g transform="translate(188 18) rotate(-16)">
        <path
          d="M4 22c18-2 40-6 58-8l10 4-10 5-22 2 2 16-8-2-4-14-28 4-4-6 6-1z"
          fill={INK}
        />
        <path d="M16 20h36l-2 6H18z" fill={MAROON} />
        <path d="M62 8l8 6-6 2z" fill={INK} />
      </g>
      <g fill={DOT}>
        <circle cx="214" cy="36" r="3" />
        <circle cx="226" cy="30" r="2" />
        <circle cx="206" cy="28" r="2" />
      </g>
      <g transform="translate(28 150)">
        <rect x="6" y="10" width="36" height="16" rx="4" fill={MAROON} />
        <path d="M10 10l6-7h16l6 7z" fill={MAROON_DEEP} />
        <rect
          x="16"
          y="5"
          width="8"
          height="5"
          rx="1"
          fill="#fff"
          opacity="0.85"
        />
        <circle cx="14" cy="28" r="5" fill={INK} />
        <circle cx="34" cy="28" r="5" fill={INK} />
        <circle cx="14" cy="28" r="2" fill="#fff" />
        <circle cx="34" cy="28" r="2" fill="#fff" />
      </g>
      <g transform="translate(206 148)">
        <path d="M8 16h22l8-8h8v6H18z" fill={MAROON} />
        <circle cx="16" cy="22" r="5" fill={INK} />
        <circle cx="34" cy="22" r="5" fill={INK} />
        <circle cx="16" cy="22" r="2" fill="#fff" />
        <circle cx="34" cy="22" r="2" fill="#fff" />
        <path d="M30 8h10l4 6H34z" fill={MAROON_DEEP} />
      </g>
    </Stage>
  );
}

function MealsArt() {
  return (
    <svg viewBox="0 0 280 220" className="size-full" aria-hidden>
      <rect width="280" height="220" fill="#fff" />
      <path
        d="M46 168h188"
        stroke="#E4E4E4"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <g transform="translate(58 78)">
        <rect x="8" y="18" width="22" height="52" rx="6" fill={INK} />
        <rect x="12" y="28" width="14" height="18" rx="2" fill={MAROON} />
        <path d="M12 18h14l-2 8H14z" fill={MAROON_DEEP} />
        <rect x="14" y="66" width="10" height="6" rx="1" fill={INK} />
      </g>

      <g transform="translate(96 62)">
        <circle cx="44" cy="52" r="46" fill={MAROON} />
        <circle cx="44" cy="52" r="36" fill="#2C3142" />
        <g transform="translate(18 28)">
          <rect x="0" y="4" width="8" height="22" rx="4" fill="#F09AA4" />
          <rect x="12" y="0" width="8" height="22" rx="4" fill="#E36B78" />
        </g>
        <g transform="translate(48 22)">
          <circle cx="14" cy="14" r="14" fill="#fff" />
          <circle cx="14" cy="14" r="6" fill="#F2C14E" />
        </g>
        <g fill="#E7A23A">
          <rect
            x="30"
            y="62"
            width="16"
            height="4"
            rx="2"
            transform="rotate(-18 38 64)"
          />
          <rect
            x="34"
            y="70"
            width="16"
            height="4"
            rx="2"
            transform="rotate(8 42 72)"
          />
          <rect
            x="22"
            y="68"
            width="14"
            height="4"
            rx="2"
            transform="rotate(-8 29 70)"
          />
        </g>
        <g>
          <circle cx="58" cy="58" r="3" fill="#E23B4A" />
          <circle cx="66" cy="54" r="2.5" fill="#5B6CFF" />
          <circle cx="62" cy="64" r="2.5" fill="#F2C14E" />
        </g>
      </g>

      <g transform="translate(198 92)">
        <path d="M8 8h22l4 18v36c0 6-6 10-15 10s-15-4-15-10V26z" fill={INK} />
        <circle cx="16" cy="40" r="1.6" fill="#fff" />
        <circle cx="24" cy="48" r="1.4" fill="#fff" />
        <circle cx="14" cy="52" r="1.3" fill="#fff" />
        <path
          d="M30 4v28"
          stroke={MAROON}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

function RecoveryArt() {
  return (
    <svg viewBox="0 0 280 220" className="size-full" aria-hidden>
      <rect width="280" height="220" fill="#fff" />
      <path
        d="M78 176h124"
        stroke="#E4E4E4"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="140" cy="108" r="58" fill={MAROON} />
      <circle cx="140" cy="108" r="48" fill="#fff" />
      <circle cx="140" cy="60" r="6" fill={MAROON} />
      <circle cx="140" cy="156" r="4" fill={INK} />
      <circle cx="92" cy="108" r="4" fill={INK} />
      <circle cx="188" cy="108" r="4" fill={INK} />
      <path
        d="M140 108V78"
        stroke={MAROON}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M140 108h22"
        stroke={INK}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="140" cy="108" r="4" fill={MAROON} />
    </svg>
  );
}

function StayArt() {
  return (
    <Stage>
      <path d="M92 108h96v36H92z" fill={MAROON} />
      <path d="M84 108h112v10H84z" fill={MAROON_DEEP} />
      <path d="M100 96h40l8 12H92z" fill={INK} />
      <rect x="108" y="118" width="28" height="16" rx="3" fill="#fff" />
      <rect
        x="146"
        y="122"
        width="22"
        height="12"
        rx="2"
        fill="#fff"
        opacity="0.8"
      />
      <path
        d="M88 144h104"
        stroke={INK}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </Stage>
  );
}

function Person({ x, y, fill }: { x: number; y: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="16" cy="10" r="10" fill={fill} />
      <path d="M4 28c0-10 6-16 12-16s12 6 12 16v18H4z" fill={fill} />
    </g>
  );
}

function CompanionArt() {
  return (
    <Stage>
      <Person x={96} y={78} fill={INK} />
      <Person x={132} y={86} fill={MAROON} />
    </Stage>
  );
}

function ChildcareArt() {
  return (
    <svg viewBox="0 0 280 220" className="size-full" aria-hidden>
      <rect width="280" height="220" fill="#fff" />
      <path
        d="M70 176h140"
        stroke="#E4E4E4"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M136 78h8v86h-8z" fill={INK} />
      <circle cx="140" cy="74" r="8" fill={MAROON} />
      <ellipse cx="140" cy="104" rx="40" ry="14" fill="#F2C14E" />
      <ellipse cx="140" cy="122" rx="32" ry="12" fill={MAROON} />
      <ellipse cx="140" cy="138" rx="24" ry="10" fill="#7EC8C4" />
      <ellipse cx="140" cy="152" rx="16" ry="8" fill={MAROON_DEEP} />
      <circle cx="92" cy="128" r="14" fill="#F09AA4" />
      <circle cx="86" cy="124" r="3" fill={INK} />
      <circle cx="98" cy="124" r="3" fill={INK} />
      <path
        d="M86 132c4 4 10 4 14 0"
        fill="none"
        stroke={INK}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AirtimeArt() {
  return (
    <Stage>
      <rect x="112" y="62" width="56" height="96" rx="10" fill={INK} />
      <rect x="118" y="72" width="44" height="68" rx="4" fill="#fff" />
      <circle cx="140" cy="148" r="4" fill={MAROON} />
      <path
        d="M184 88c8 8 8 28 0 36"
        fill="none"
        stroke={MAROON}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M194 78c14 14 14 50 0 64"
        fill="none"
        stroke={MAROON}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </Stage>
  );
}

function TimeArt() {
  return (
    <Stage>
      <rect x="96" y="96" width="72" height="52" rx="6" fill={MAROON} />
      <path d="M96 108h72" stroke={MAROON_DEEP} strokeWidth="8" />
      <path d="M118 96V84h28v12" fill="none" stroke={INK} strokeWidth="4" />
      <circle
        cx="184"
        cy="86"
        r="22"
        fill="#fff"
        stroke={INK}
        strokeWidth="4"
      />
      <path
        d="M184 86V74"
        stroke={MAROON}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M184 86h10" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </Stage>
  );
}
