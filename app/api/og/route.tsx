import { ImageResponse } from "@vercel/og";

export const runtime = "edge";
export const alt = "Blivap — Give blood. Save lives.";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

const BRAND_PRIMARY = "#960018";
const BRAND_SECONDARY = "#24afb5";
const FOUNDATION_DARK = "#070416";

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Clamp UTF-8-ish length without slicing mid-surrogate */
function clampText(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/** Edge-safe base64 (no Node Buffer). */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

async function loadOgLogoFromBundle(): Promise<string | null> {
  const candidates = [
    "../../../public/web-app-manifest-192x192.png",
    "../../../public/web-app-manifest-512x512.png",
  ] as const;

  for (const relativePath of candidates) {
    try {
      const res = await fetch(new URL(relativePath, import.meta.url));
      if (!res.ok) continue;
      const buf = await res.arrayBuffer();
      if (buf.byteLength === 0) continue;
      return `data:image/png;base64,${arrayBufferToBase64(buf)}`;
    } catch {
      // try next candidate
    }
  }
  return null;
}

/** When bundled assets are not emitted for this route, load from a public URL. */
async function loadOgLogoFromNetwork(requestUrl: URL): Promise<string | null> {
  const bases = [
    requestUrl.origin,
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ];

  for (const base of bases) {
    try {
      const res = await fetch(`${base}/web-app-manifest-192x192.png`);
      if (!res.ok) continue;
      const buf = await res.arrayBuffer();
      if (buf.byteLength === 0) continue;
      return `data:image/png;base64,${arrayBufferToBase64(buf)}`;
    } catch {
      continue;
    }
  }
  return null;
}

async function resolveOgLogoDataUri(requestUrl: URL): Promise<string | null> {
  return (
    (await loadOgLogoFromBundle()) ?? (await loadOgLogoFromNetwork(requestUrl))
  );
}

/** Stable hash so OG output is cache-friendly per title. */
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const EYEBROW_PRIMARY_POOL = [
  "Social impact",
  "Collective care",
  "Hope in motion",
] as const;

type OgStat = { label: string; value: string };

const DEFAULT_STATS: OgStat[] = [
  { label: "REACH", value: "Nationwide · Diaspora-aware" },
  { label: "TRUST", value: "Verification · consent-first" },
  { label: "SPEED", value: "Urgent blood requests first" },
];

const DEFAULT_BULLETS = [
  "Blood-type and location-aware discovery for donors and recipients.",
  "Discreet sperm donor journeys aligned with clinical guidance.",
  "Coordination built with hospitals, labs, and patient advocates.",
];

function parseStatsParam(raw: string | null): OgStat[] | null {
  if (!raw?.trim()) return null;
  const parts = raw.split("|").slice(0, 3);
  const out: OgStat[] = [];
  for (const part of parts) {
    const idx = part.indexOf(":");
    if (idx === -1) continue;
    const label = clampText(part.slice(0, idx).trim(), 14);
    const value = clampText(part.slice(idx + 1).trim(), 42);
    if (label && value) out.push({ label, value });
  }
  return out.length ? out : null;
}

function resolveStats(searchParams: URLSearchParams): OgStat[] {
  const parsed = parseStatsParam(searchParams.get("stats"));
  if (!parsed?.length) return DEFAULT_STATS;
  const merged: OgStat[] = [...parsed];
  let i = 0;
  while (merged.length < 3) {
    merged.push(DEFAULT_STATS[i % DEFAULT_STATS.length]!);
    i++;
  }
  return merged.slice(0, 3);
}

function resolveBullets(searchParams: URLSearchParams): string[] {
  const raw = searchParams.get("bullets");
  if (!raw?.trim()) return DEFAULT_BULLETS;
  const items = raw
    .split("|")
    .map((s) => clampText(safeDecode(s.trim()), 78))
    .filter(Boolean)
    .slice(0, 3);
  if (items.length === 0) return DEFAULT_BULLETS;
  const merged = [...items];
  let i = 0;
  while (merged.length < 3) {
    merged.push(DEFAULT_BULLETS[i % DEFAULT_BULLETS.length]!);
    i++;
  }
  return merged.slice(0, 3);
}

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const { searchParams } = requestUrl;

    const logoDataUri = await resolveOgLogoDataUri(requestUrl);

    const titleParam = searchParams.get("title");
    const subtitleParam = searchParams.get("subtitle");
    const badgeParam = searchParams.get("badge");

    const title = titleParam
      ? clampText(safeDecode(titleParam), 110)
      : "Connecting donors with people who need blood or sperm across Nigeria.";

    const subtitle = subtitleParam
      ? clampText(safeDecode(subtitleParam), 140)
      : null;

    const badge = badgeParam ? clampText(safeDecode(badgeParam), 32) : null;

    const eyebrowParam = searchParams.get("eyebrow");
    const eyebrow2Param = searchParams.get("eyebrow2");
    const eyebrow3Param = searchParams.get("eyebrow3");

    const eyebrow = eyebrowParam
      ? clampText(safeDecode(eyebrowParam), 28)
      : clampText(
          EYEBROW_PRIMARY_POOL[hashString(title) % EYEBROW_PRIMARY_POOL.length]!,
          28,
        );

    const eyebrowLine2 = eyebrow2Param
      ? clampText(safeDecode(eyebrow2Param), 52)
      : "Real donors · Real needs · Real urgency.";

    const eyebrowLine3 = eyebrow3Param
      ? clampText(safeDecode(eyebrow3Param), 56)
      : "Privacy-first matching · Nigeria-rooted · Human at the center.";

    const stats = resolveStats(searchParams);
    const bulletItems = resolveBullets(searchParams);

    const headlinePx =
      title.length > 110
        ? 34
        : title.length > 88
          ? 38
          : title.length > 64
            ? 44
            : title.length > 42
              ? 50
              : title.length > 28
                ? 54
                : 58;

    let fontData: ArrayBuffer | null = null;
    try {
      fontData = await fetch(
        new URL(
          "../../../public/fonts/helvetica/Helvetica.woff",
          import.meta.url,
        ),
      ).then((res) => res.arrayBuffer());
    } catch (e) {
      if (e instanceof Error) {
        console.error("OG font load:", e.message);
      }
      fontData = null;
    }

    const fontFamily = fontData ? "BlivapHelvetica" : "system-ui";

    return new ImageResponse(
      (
        <div
          tw="flex w-full h-full flex-col"
          style={{
            background:
              "linear-gradient(160deg, #08060c 0%, #030308 55%, #05040a 100%)",
            padding: 18,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              height: 5,
              flexShrink: 0,
              background: `linear-gradient(90deg, ${BRAND_SECONDARY} 0%, ${BRAND_PRIMARY} 42%, ${BRAND_SECONDARY} 100%)`,
              opacity: 0.95,
            }}
          />

          <div
            tw="flex flex-1 flex-row overflow-hidden"
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              borderTop: "none",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.04), 0 24px 80px rgba(0,0,0,0.35)",
            }}
          >
            {/* Brand column — minimal masthead (do not redesign without explicit ask) */}
            <div
              tw="flex flex-col shrink-0 justify-between relative overflow-hidden"
              style={{
                width: 276,
                padding: "48px 36px 40px 40px",
                background: `linear-gradient(180deg, #161018 0%, #0e0c12 42%, #08060c 100%)`,
                borderRight: "1px solid rgba(255,255,255,0.07)",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(circle at 50% -20%, rgba(150,0,24,0.22) 0%, transparent 55%)`,
                }}
              />

              <div tw="flex flex-col items-start relative" style={{ zIndex: 1 }}>
                <span
                  style={{
                    fontFamily,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: BRAND_SECONDARY,
                    marginBottom: 22,
                  }}
                >
                  Give blood · Save lives
                </span>

                <div tw="flex flex-col items-start shrink-0">
                  <div
                    tw="flex items-center justify-center shrink-0 overflow-hidden"
                    style={{
                      width: 84,
                      height: 84,
                      borderRadius: 18,
                    }}
                  >
                    {logoDataUri ? (
                      <img
                        src={logoDataUri}
                        alt=""
                        width={84}
                        height={84}
                        style={{
                          width: 84,
                          height: 84,
                          borderRadius: 18,
                          objectFit: "contain",
                          objectPosition: "center",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        tw="flex items-center justify-center shrink-0"
                        style={{
                          width: 84,
                          height: 84,
                          borderRadius: 18,
                          fontFamily,
                          fontSize: 34,
                          fontWeight: 700,
                          color: "#fff",
                          background: `linear-gradient(155deg, ${BRAND_PRIMARY} 0%, #2a0610 100%)`,
                        }}
                      >
                        B
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      fontFamily,
                      marginTop: 22,
                      fontSize: 30,
                      fontWeight: 700,
                      color: "#f6f6f8",
                      letterSpacing: "-0.035em",
                      lineHeight: 1,
                    }}
                  >
                    Blivap
                  </span>
                </div>

                <span
                  style={{
                    fontFamily,
                    marginTop: 14,
                    fontSize: 12,
                    fontWeight: 400,
                    lineHeight: 1.5,
                    color: "rgba(230,230,238,0.58)",
                    letterSpacing: "-0.01em",
                    maxWidth: 200,
                  }}
                >
                  Connecting donors with people in need.
                </span>

                <div
                  style={{
                    marginTop: 24,
                    width: 52,
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: BRAND_PRIMARY,
                  }}
                />
                <div
                  style={{
                    marginTop: 6,
                    width: 28,
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: BRAND_SECONDARY,
                    opacity: 0.9,
                  }}
                />
              </div>

              {badge ? (
                <div
                  tw="flex justify-start relative"
                  style={{ zIndex: 1, marginTop: "auto", paddingTop: 28 }}
                >
                  <span
                    style={{
                      fontFamily,
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.92)",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid rgba(255,255,255,0.18)",
                      backgroundColor: "rgba(255,255,255,0.06)",
                    }}
                  >
                    {badge}
                  </span>
                </div>
              ) : (
                <div style={{ marginTop: "auto" }} />
              )}
            </div>

            {/* Narrative surface */}
            <div
              tw="flex flex-1 flex-col relative overflow-hidden justify-between"
              style={{
                padding: "44px 48px 36px 44px",
                background: `linear-gradient(165deg, #0c0b14 0%, #07070f 38%, #06060d 100%)`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(ellipse 85% 50% at 92% 8%, rgba(150,0,24,0.14) 0%, transparent 55%), radial-gradient(ellipse 55% 40% at 4% 96%, rgba(36,175,181,0.06) 0%, transparent 50%), linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.35) 100%)",
                }}
              />

              <div
                tw="flex flex-col flex-1 justify-start"
                style={{
                  zIndex: 10,
                  paddingLeft: 8,
                  paddingRight: 4,
                  maxWidth: 780,
                }}
              >
                <div tw="flex flex-col" style={{ marginBottom: 22 }}>
                  <div tw="flex flex-row items-center">
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: BRAND_SECONDARY,
                        marginRight: 14,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontFamily,
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.32em",
                        textTransform: "uppercase",
                        color: BRAND_SECONDARY,
                      }}
                    >
                      {eyebrow}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily,
                      marginTop: 10,
                      paddingLeft: 22,
                      fontSize: 12,
                      fontWeight: 500,
                      letterSpacing: "-0.01em",
                      lineHeight: 1.35,
                      color: "rgba(236,236,244,0.72)",
                      maxWidth: 720,
                    }}
                  >
                    {eyebrowLine2}
                  </span>
                  <span
                    style={{
                      fontFamily,
                      marginTop: 6,
                      paddingLeft: 22,
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "rgba(36,175,181,0.85)",
                      maxWidth: 720,
                    }}
                  >
                    {eyebrowLine3}
                  </span>
                </div>

                <div
                  tw="flex flex-col"
                  style={{
                    padding: "28px 32px 32px",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.07)",
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 55%, rgba(0,0,0,0.15) 100%)",
                    boxShadow:
                      "0 1px 0 rgba(255,255,255,0.06) inset, 0 18px 48px rgba(0,0,0,0.28)",
                  }}
                >
                  <p
                    style={{
                      fontFamily,
                      fontSize: headlinePx,
                      fontWeight: 700,
                      color: "#fdfdfd",
                      letterSpacing: "-0.038em",
                      lineHeight: 1.07,
                      margin: 0,
                      textShadow: "0 2px 18px rgba(0,0,0,0.35)",
                    }}
                  >
                    {title}
                  </p>

                  {subtitle ? (
                    <div
                      style={{
                        marginTop: 26,
                        paddingLeft: 22,
                        borderLeft: `3px solid ${BRAND_SECONDARY}`,
                        background: "rgba(36, 175, 181, 0.06)",
                        paddingTop: 14,
                        paddingBottom: 14,
                        paddingRight: 18,
                        borderRadius: "0 8px 8px 0",
                      }}
                    >
                      <p
                        style={{
                          fontFamily,
                          fontSize: 21,
                          lineHeight: 1.55,
                          fontWeight: 400,
                          color: "#c4c4d4",
                          margin: 0,
                          letterSpacing: "-0.015em",
                        }}
                      >
                        {subtitle}
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Stats strip */}
                <div tw="flex flex-row" style={{ marginTop: 18 }}>
                  {stats.map((stat, idx) => (
                    <div
                      key={`stat-${stat.label}-${idx}`}
                      tw="flex flex-col flex-1"
                      style={{
                        marginRight: idx < stats.length - 1 ? 10 : 0,
                        padding: "11px 12px 12px",
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.09)",
                        background:
                          "linear-gradient(165deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                      }}
                    >
                      <span
                        style={{
                          fontFamily,
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: "0.22em",
                          textTransform: "uppercase",
                          color: BRAND_SECONDARY,
                        }}
                      >
                        {stat.label}
                      </span>
                      <span
                        style={{
                          fontFamily,
                          marginTop: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          color: "rgba(238,238,246,0.92)",
                          letterSpacing: "-0.015em",
                          lineHeight: 1.35,
                        }}
                      >
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Insight bullets */}
                <div tw="flex flex-col" style={{ marginTop: 16 }}>
                  {bulletItems.map((text, idx) => (
                    <div
                      key={`bul-${idx}`}
                      tw="flex flex-row"
                      style={{
                        marginTop: idx === 0 ? 0 : 9,
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          marginTop: 5,
                          marginRight: 11,
                          flexShrink: 0,
                          borderRadius: 9999,
                          background: BRAND_SECONDARY,
                          opacity: 0.85,
                        }}
                      />
                      <span
                        style={{
                          fontFamily,
                          fontSize: 11,
                          fontWeight: 400,
                          lineHeight: 1.45,
                          color: "rgba(210,210,224,0.78)",
                          letterSpacing: "-0.01em",
                          flexGrow: 1,
                          flexShrink: 1,
                        }}
                      >
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                tw="flex flex-row items-center justify-between shrink-0"
                style={{
                  zIndex: 10,
                  marginTop: 12,
                  paddingTop: 26,
                  paddingLeft: 8,
                  paddingRight: 4,
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  background:
                    "linear-gradient(0deg, rgba(0,0,0,0.2) 0%, transparent 100%)",
                }}
              >
                <span
                  style={{
                    fontFamily,
                    fontSize: 15,
                    color: "rgba(255,255,255,0.48)",
                    letterSpacing: "0.04em",
                    lineHeight: 1.45,
                    maxWidth: 480,
                  }}
                >
                  Blood & sperm donor matching · Nigeria & beyond
                </span>
                <div tw="flex flex-row items-center shrink-0">
                  <span
                    style={{
                      fontFamily,
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#ececf2",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    blivap.com
                  </span>
                  <div
                    style={{
                      marginLeft: 12,
                      width: 36,
                      height: 3,
                      borderRadius: 2,
                      background: BRAND_SECONDARY,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        ...size,
        fonts: fontData
          ? [
              {
                name: "BlivapHelvetica",
                data: fontData,
                style: "normal" as const,
                weight: 400 as const,
              },
            ]
          : [],
      },
    );
  } catch (e) {
    if (e instanceof Error) {
      console.error("OG Image generation error:", e.message);
    }
    return new Response(`Failed to generate OG image: ${e}`, {
      status: 500,
    });
  }
}
