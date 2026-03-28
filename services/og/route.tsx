import { ImageResponse } from "@vercel/og";

export const runtime = "edge";
export const alt = "Blivap — Give Blood. Save Lives.";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hasTitle = searchParams.has("title");
    const title = hasTitle
      ? searchParams.get("title")?.slice(0, 100)
      : "Blivap connects blood and sperm donors with people in need across Nigeria.";

    // Try to load fonts, but don't fail if they're not available
    let fontData;
    let fontDataBold;
    try {
      fontData = await fetch(
        new URL(
          "../../../public/fonts/helvetica/Helvetica.woff",
          import.meta.url,
        ),
      ).then((res) => res.arrayBuffer());
    } catch (e) {
      if (e instanceof Error) {
        console.error("Error loading font:", e.message);
      }
      fontData = null;
    }

    try {
      fontDataBold = await fetch(
        new URL(
          "../../../public/fonts/helvetica/Helvetica.woff",
          import.meta.url,
        ),
      ).then((res) => res.arrayBuffer());
    } catch (e) {
      if (e instanceof Error) {
        console.error("Error loading bold font:", e.message);
      }
      fontDataBold = null;
    }

    return new ImageResponse(
      <div
        tw="flex w-full h-full items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #960018 0%, #7A0013 100%)",
        }}
      >
        {/* Main Container */}
        <div tw="flex flex-col w-full h-full items-center justify-center px-16 py-20 relative">
          {/* Decorative Elements */}
          <div
            tw="absolute top-0 left-0 w-full h-full"
            style={{
              opacity: 0.1,
              backgroundImage:
                "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)",
            }}
          />

          {/* Content */}
          <div tw="flex flex-col items-center justify-center relative z-10">
            {/* Logo/Brand - text B (no Buffer in Edge) */}
            <div
              tw="flex items-center justify-center mb-8"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "60px",
                background: "rgba(255, 255, 255, 0.15)",
              }}
            >
              <span tw="text-white text-6xl font-bold">B</span>
            </div>

            {/* Main Title */}
            <h1
              tw="text-7xl font-bold text-white mb-6 text-center"
              style={{
                fontFamily: fontDataBold ? "Helvetica Bold" : "system-ui",
                letterSpacing: "-0.02em",
                textShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              Blivap
            </h1>

            {/* Tagline */}
            <p
              tw="text-3xl text-white/90 mb-12 text-center max-w-4xl"
              style={{
                fontFamily: fontData ? "Helvetica" : "system-ui",
                lineHeight: "1.4",
                textShadow: "0 2px 10px rgba(0,0,0,0.2)",
              }}
            >
              {title}
            </p>

            {/* Feature Pills */}
            <div tw="flex flex-row gap-6 mb-12">
              <div
                tw="flex items-center px-6 py-3"
                style={{
                  borderRadius: "9999px",
                  background: "rgba(255, 255, 255, 0.2)",
                }}
              >
                <span tw="text-white text-xl font-semibold">
                  💉 Blood Donation
                </span>
              </div>
              <div
                tw="flex items-center px-6 py-3 mx-6"
                style={{
                  borderRadius: "9999px",
                  background: "rgba(255, 255, 255, 0.2)",
                }}
              >
                <span tw="text-white text-xl font-semibold">❤️ Save Lives</span>
              </div>
              <div
                tw="flex items-center px-6 py-3"
                style={{
                  borderRadius: "9999px",
                  background: "rgba(255, 255, 255, 0.2)",
                }}
              >
                <span tw="text-white text-xl font-semibold">🤝 Connect</span>
              </div>
            </div>

            {/* Bottom Message */}
            <div
              tw="flex items-center justify-center px-8 py-4"
              style={{
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.15)",
                border: "2px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              <p
                tw="text-2xl text-white font-semibold"
                style={{
                  fontFamily: fontData ? "Helvetica" : "system-ui",
                }}
              >
                Together we save lives and improve futures
              </p>
            </div>
          </div>

          {/* Bottom Accent */}
          <div
            tw="absolute bottom-0 left-0 w-full h-2"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)",
            }}
          />
        </div>
      </div>,
      {
        ...size,
        fonts: [
          ...(fontData
            ? [
                {
                  name: "Helvetica",
                  data: fontData,
                  style: "normal" as const,
                },
              ]
            : []),
          ...(fontDataBold
            ? [
                {
                  name: "Helvetica Bold",
                  data: fontDataBold,
                  style: "normal" as const,
                },
              ]
            : []),
        ],
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
