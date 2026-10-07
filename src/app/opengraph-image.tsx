import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "RoadResQ - On-Demand Roadside Assistance Platform";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#0f172a",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "#1E40AF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            RR
          </div>
          <span style={{ fontSize: "32px", fontWeight: "bold", color: "#3b82f6" }}>
            RoadResQ
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: "56px",
              fontWeight: "800",
              color: "#f8fafc",
              lineHeight: 1.15,
              maxWidth: "900px",
            }}
          >
            On-Demand Roadside Rescue, From Breakdown to Payment
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#94a3b8",
              maxWidth: "850px",
              lineHeight: 1.4,
            }}
          >
            Real-time mechanic dispatch, live status tracking, transparent frozen parts invoices, and SSLCommerz test payments.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            fontSize: "18px",
            color: "#F97316",
            fontWeight: "600",
          }}
        >
          <span>• Full-Stack Demo Platform</span>
          <span>• Customer, Mechanic & Admin Roles</span>
          <span>• SSLCommerz Gateway</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
