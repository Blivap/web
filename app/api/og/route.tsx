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

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

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

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const nameRaw = requestUrl.searchParams.get("name");
    const appName = nameRaw
      ? clampText(safeDecode(nameRaw), 48)
      : "Blivap";

    const logoDataUri = await resolveOgLogoDataUri(requestUrl);

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
            padding: 14,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              height: 9,
              flexShrink: 0,
              background: `linear-gradient(90deg, ${BRAND_SECONDARY} 0%, ${BRAND_PRIMARY} 42%, ${BRAND_SECONDARY} 100%)`,
              opacity: 0.95,
            }}
          />

          <div
            tw="flex flex-1 flex-row overflow-hidden items-center justify-center"
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              borderTop: "none",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.04), 0 24px 80px rgba(0,0,0,0.35)",
            }}
          >
            <div tw="flex flex-col items-center justify-center shrink-0">
              <div
                tw="flex items-center justify-center shrink-0 overflow-hidden"
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: 36,
                }}
              >
                {logoDataUri ? (
                  <img
                    src={logoDataUri}
                    alt=""
                    width={200}
                    height={200}
                    style={{
                      width: 200,
                      height: 200,
                      borderRadius: 36,
                      objectFit: "contain",
                      objectPosition: "center",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    tw="flex items-center justify-center shrink-0"
                    style={{
                      width: 200,
                      height: 200,
                      borderRadius: 36,
                      fontFamily,
                      fontSize: 96,
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
                  marginTop: 36,
                  fontSize: 72,
                  fontWeight: 700,
                  color: "#f6f6f8",
                  letterSpacing: "-0.035em",
                  lineHeight: 1,
                }}
              >
                {appName}
              </span>
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
              {
                name: "BlivapHelvetica",
                data: fontData,
                style: "normal" as const,
                weight: 700 as const,
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
