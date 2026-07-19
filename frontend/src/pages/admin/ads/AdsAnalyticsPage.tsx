import React, { useState } from "react";
import { BarChart3, TrendingUp, Calendar, Search, Filter } from "lucide-react";

export default function AdsAnalyticsPage() {
  const [range, setRange] = useState("7d");
  const [hoveredSegment, setHoveredSegment] = useState<"Direct" | "AdSense" | "MGID" | null>(null);
  const [hoveredDayIdx, setHoveredDayIdx] = useState<number | null>(null);

  const chartData = [
    { label: "Senin", top: 12000, sidebar: 8000, mobile: 14000 },
    { label: "Selasa", top: 15000, sidebar: 9500, mobile: 16000 },
    { label: "Rabu", top: 18000, sidebar: 11000, mobile: 19000 },
    { label: "Kamis", top: 14000, sidebar: 7800, mobile: 15000 },
    { label: "Jumat", top: 16500, sidebar: 9200, mobile: 17500 },
    { label: "Sabtu", top: 22000, sidebar: 13000, mobile: 24000 },
    { label: "Minggu", top: 25000, sidebar: 15400, mobile: 27000 },
  ];

  const compareSlots = [
    { name: "Homepage Top Banner", type: "Header 970x90", cpc: "Rp 850", clicks: 14200, ctr: "2.45%", revenue: "Rp 12,070,000" },
    { name: "Article Middle Sidebar", type: "Sidebar 300x250", cpc: "Rp 650", clicks: 8700, ctr: "1.85%", revenue: "Rp 5,655,000" },
    { name: "Mobile Sticky Footer", type: "Sticky Mobile 320x50", cpc: "Rp 400", clicks: 21800, ctr: "3.20%", revenue: "Rp 8,720,000" },
    { name: "Article Bottom Footer", type: "Footer 728x90", cpc: "Rp 500", clicks: 3100, ctr: "1.10%", revenue: "Rp 1,550,000" },
  ];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
            Granular Advertising Performance Analytics
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            Analisis efisiensi, impresi, klik, dan pendapatan granular per zona penempatan iklan
          </p>
        </div>

        {/* Date filter */}
        <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
          {[
            { key: "24h", label: "24 Jam" },
            { key: "7d", label: "7 Hari" },
            { key: "30d", label: "30 Hari" },
          ].map(d => (
            <button
              key={d.key}
              onClick={() => setRange(d.key)}
              style={{
                padding: "6px 12px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500,
                background: range === d.key ? "var(--bg-muted)" : "var(--surface)",
                color: range === d.key ? "var(--text-primary)" : "var(--text-secondary)",
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout: 60% Left Chart, 40% Right Chart */}
      <div style={{ display: "flex", gap: 20, alignItems: "stretch", flexWrap: "wrap" }}>
        
        {/* Left Column (60%): Impressions Chart */}
        <div style={{
          flex: 1.5, minWidth: 320, background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 16
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 6 }}>
                <TrendingUp size={15} style={{ color: "var(--brand)" }} /> Comparative Slots Impressions Chart
              </h2>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Perbandingan performa impresi harian antar slot iklan</p>
            </div>
            {/* Legend */}
            <div style={{ display: "flex", gap: 10, fontSize: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand)" }} /> Top</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--blue)" }} /> Mobile</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--purple)" }} /> Sidebar</span>
            </div>
          </div>

          {/* Chart area wrapper */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
            
            {/* Grid & Bars Area (height: 130px) */}
            <div style={{ display: "flex", gap: 10, height: 130, position: "relative", paddingLeft: 30 }}>
              {/* Y Axis Labels */}
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: 10, color: "var(--text-tertiary)", textAlign: "right", width: 24 }}>
                <span>30K</span>
                <span>20K</span>
                <span>10K</span>
                <span>0</span>
              </div>

              {/* Grid lines background */}
              <div style={{ position: "absolute", left: 30, right: 0, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none" }}>
                <div style={{ borderBottom: "1px dashed var(--border-subtle)", width: "100%", height: 0 }} />
                <div style={{ borderBottom: "1px dashed var(--border-subtle)", width: "100%", height: 0 }} />
                <div style={{ borderBottom: "1px dashed var(--border-subtle)", width: "100%", height: 0 }} />
                <div style={{ borderBottom: "1px solid var(--border)", width: "100%", height: 0 }} />
              </div>

              {/* Bars container */}
              <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "100%", zIndex: 1 }}>
                {chartData.map((d, idx) => {
                  const maxVal = 30000;
                  const hTop = (d.top / maxVal) * 100;
                  const hMobile = (d.mobile / maxVal) * 100;
                  const hSidebar = (d.sidebar / maxVal) * 100;
                  const isHovered = hoveredDayIdx === idx;

                  return (
                    <div key={idx} 
                      onMouseEnter={() => setHoveredDayIdx(idx)}
                      onMouseLeave={() => setHoveredDayIdx(null)}
                      style={{ 
                        display: "flex", flexDirection: "column", alignItems: "center", 
                        flex: 1, height: "100%", justifyContent: "flex-end",
                        cursor: "pointer",
                        position: "relative",
                        background: isHovered ? "rgba(214, 0, 0, 0.03)" : "transparent",
                        borderLeft: "1px solid transparent",
                        borderRight: "1px solid transparent",
                        borderColor: isHovered ? "rgba(214, 0, 0, 0.08)" : "transparent",
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 110, paddingBottom: 2 }}>
                        <div style={{ width: 6, height: `${hTop}%`, background: "var(--brand)", borderRadius: "3px 3px 0 0", transition: "height 0.3s" }} />
                        <div style={{ width: 6, height: `${hMobile}%`, background: "var(--blue)", borderRadius: "3px 3px 0 0", transition: "height 0.3s" }} />
                        <div style={{ width: 6, height: `${hSidebar}%`, background: "var(--purple)", borderRadius: "3px 3px 0 0", transition: "height 0.3s" }} />
                      </div>

                      {/* Tooltip rendered directly inside the hovered day column */}
                      {isHovered && (
                        <div style={{
                          position: "absolute",
                          left: "50%",
                          bottom: 120,
                          transform: "translateX(-50%)",
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          padding: "8px 12px",
                          boxShadow: "var(--shadow-md)",
                          zIndex: 20,
                          pointerEvents: "none",
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                          minWidth: 110,
                          textAlign: "left"
                        }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-primary)" }}>{d.label}</span>
                          <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 9 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                              <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
                                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--brand)" }} /> Top
                              </span>
                              <strong style={{ color: "var(--text-primary)" }}>{d.top.toLocaleString()}</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                              <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
                                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--blue)" }} /> Mobile
                              </span>
                              <strong style={{ color: "var(--text-primary)" }}>{d.mobile.toLocaleString()}</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                              <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
                                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--purple)" }} /> Sidebar
                              </span>
                              <strong style={{ color: "var(--text-primary)" }}>{d.sidebar.toLocaleString()}</strong>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* X Axis Labels Row (height: 20px) */}
            <div style={{ display: "flex", justifyContent: "space-between", paddingLeft: 30, fontSize: 10, color: "var(--text-tertiary)" }}>
              {chartData.map((d, idx) => (
                <div key={idx} style={{ 
                  flex: 1, textAlign: "center", 
                  fontWeight: hoveredDayIdx === idx ? 600 : 400,
                  color: hoveredDayIdx === idx ? "var(--text-primary)" : "var(--text-tertiary)",
                  transition: "color 0.2s"
                }}>
                  {d.label}
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Right Column (40%): Monetization Donut Chart */}
        <div style={{
          flex: 1, minWidth: 280, background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 14
        }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 6 }}>
              <BarChart3 size={15} style={{ color: "var(--brand)" }} /> Ad Revenue Distribution Share
            </h2>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Pembagian porsi pendapatan per jaringan iklan</p>
          </div>

          <div style={{ display: "flex", gap: 20, alignItems: "center", justifyContent: "center", marginTop: 10, flexWrap: "wrap" }}>
            {/* SVG Donut Chart */}
            <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
              <svg width="100%" height="100%" viewBox="0 0 42 42" className="donut">
                <circle className="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="transparent"></circle>
                <circle className="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--bg-muted)" strokeWidth="4.5"></circle>

                {/* Direct Ads: 55% */}
                <circle className="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--brand)" 
                  strokeWidth={hoveredSegment === "Direct" ? "5.5" : "4.5"} 
                  strokeDasharray="55 45" strokeDashoffset="25"
                  onMouseEnter={() => setHoveredSegment("Direct")}
                  onMouseLeave={() => setHoveredSegment(null)}
                  style={{ cursor: "pointer", transition: "stroke-width 0.2s" }}
                ></circle>
                
                {/* Google AdSense: 30% */}
                <circle className="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--blue)" 
                  strokeWidth={hoveredSegment === "AdSense" ? "5.5" : "4.5"} 
                  strokeDasharray="30 70" strokeDashoffset="-30"
                  onMouseEnter={() => setHoveredSegment("AdSense")}
                  onMouseLeave={() => setHoveredSegment(null)}
                  style={{ cursor: "pointer", transition: "stroke-width 0.2s" }}
                ></circle>
                
                {/* MGID: 15% */}
                <circle className="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--purple)" 
                  strokeWidth={hoveredSegment === "MGID" ? "5.5" : "4.5"} 
                  strokeDasharray="15 85" strokeDashoffset="-60"
                  onMouseEnter={() => setHoveredSegment("MGID")}
                  onMouseLeave={() => setHoveredSegment(null)}
                  style={{ cursor: "pointer", transition: "stroke-width 0.2s" }}
                ></circle>
              </svg>
              {/* Dynamic Center Info Display */}
              <div style={{ 
                position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", 
                textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", width: "70%"
              }}>
                <span style={{ 
                  fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em",
                  color: hoveredSegment === "Direct" ? "var(--brand)" : hoveredSegment === "AdSense" ? "var(--blue)" : hoveredSegment === "MGID" ? "var(--purple)" : "var(--text-tertiary)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%"
                }}>
                  {hoveredSegment === "Direct" ? "Direct" : hoveredSegment === "AdSense" ? "AdSense" : hoveredSegment === "MGID" ? "MGID" : "Revenue"}
                </span>
                <span style={{ 
                  fontSize: 13, fontWeight: 800, 
                  color: hoveredSegment === "Direct" ? "var(--brand)" : hoveredSegment === "AdSense" ? "var(--blue)" : hoveredSegment === "MGID" ? "var(--purple)" : "var(--text-primary)",
                  marginTop: 1
                }}>
                  {hoveredSegment === "Direct" ? "55%" : hoveredSegment === "AdSense" ? "30%" : hoveredSegment === "MGID" ? "15%" : "Rp 27.8M"}
                </span>
              </div>
            </div>

            {/* Share details */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 120 }}>
              {[
                { id: "Direct", label: "Direct Ads", val: "55%", color: "var(--brand)", details: "Rp 15.3M" },
                { id: "AdSense", label: "AdSense", val: "30%", color: "var(--blue)", details: "Rp 8.3M" },
                { id: "MGID", label: "MGID Native", val: "15%", color: "var(--purple)", details: "Rp 4.1M" },
              ].map(item => {
                const isHovered = hoveredSegment === item.id;
                return (
                  <div key={item.label} 
                    onMouseEnter={() => setHoveredSegment(item.id as any)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    style={{ 
                      display: "flex", flexDirection: "column", gap: 1, padding: "4px 8px", 
                      borderRadius: 6, background: isHovered ? "var(--bg-subtle)" : "transparent",
                      transition: "background 0.2s", cursor: "pointer"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                        <span style={{ color: isHovered ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: isHovered ? 600 : 400 }}>{item.label}</span>
                      </div>
                      <strong style={{ color: isHovered ? item.color : "var(--text-primary)" }}>{item.val}</strong>
                    </div>
                    <span style={{ fontSize: 9, color: "var(--text-tertiary)", paddingLeft: 13 }}>{item.details}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Grid Comparison Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1.5fr 1fr 100px 100px 100px 120px",
          gap: 12, padding: "12px 16px",
          background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)",
        }}>
          {["Zona Penempatan", "Layout Type", "Avg CPC", "Total Clicks", "CTR", "Pendapatan"].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
          ))}
        </div>

        {compareSlots.map((c, i) => (
          <div key={c.name} style={{
            display: "grid", gridTemplateColumns: "1.5fr 1fr 100px 100px 100px 120px",
            gap: 12, padding: "14px 16px", alignItems: "center",
            borderBottom: i < compareSlots.length - 1 ? "1px solid var(--border)" : "none",
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{c.name}</span>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{c.type}</span>
            <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "monospace" }}>{c.cpc}</span>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{c.clicks.toLocaleString()}</span>
            <span style={{ fontSize: 12, color: "var(--brand)", fontWeight: 700 }}>{c.ctr}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>{c.revenue}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
