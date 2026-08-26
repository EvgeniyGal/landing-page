import { ImageResponse } from "next/og";

export const alt = "Yevgen Galamaga | AI-Powered Automation Architect";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#121212",
          color: "#f2f2f2",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#a0a0a0",
            }}
          >
            System Architect // Automation Expert
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 72,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            Yevgen Galamaga
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              maxWidth: 920,
              fontSize: 30,
              lineHeight: 1.4,
              color: "#c8c8c8",
            }}
          >
            AI-powered automation systems that replace manual work and scale operations.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            color: "#a0a0a0",
            letterSpacing: "0.04em",
          }}
        >
          <span>n8n · Next.js · LLMs</span>
          <span>10–20 hours saved / week</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
