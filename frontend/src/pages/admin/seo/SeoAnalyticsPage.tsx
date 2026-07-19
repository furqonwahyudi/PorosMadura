import React from "react";
import { Search, TrendingUp, Eye, MousePointer, Percent, Award, ArrowUpRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function SeoAnalyticsPage() {
  const stats = [
    { label: "Total Clicks (30 Hari)", val: "24,802", change: "+8.4%", color: "var(--brand)" },
    { label: "Total Impressions", val: "482,903", change: "+14.2%", color: "var(--blue)" },
    { label: "Average CTR", val: "5.13%", change: "+0.32%", color: "var(--green)" },
    { label: "Average SERP Position", val: "12.4", change: "-1.2 (Naik)", color: "var(--purple)" },
  ];

  const chartData = [
    { day: "1", Clicks: 500, Impressions: 12000 },
    { day: "3", Clicks: 620, Impressions: 13500 },
    { day: "5", Clicks: 580, Impressions: 13000 },
    { day: "7", Clicks: 710, Impressions: 14200 },
    { day: "9", Clicks: 650, Impressions: 13800 },
    { day: "11", Clicks: 800, Impressions: 15500 },
    { day: "13", Clicks: 750, Impressions: 15000 },
    { day: "15", Clicks: 920, Impressions: 17200 },
    { day: "17", Clicks: 880, Impressions: 16800 },
    { day: "19", Clicks: 1050, Impressions: 18500 },
    { day: "21", Clicks: 980, Impressions: 17800 },
    { day: "23", Clicks: 1150, Impressions: 19500 },
    { day: "25", Clicks: 1100, Impressions: 19000 },
    { day: "27", Clicks: 1280, Impressions: 21000 },
    { day: "29", Clicks: 1350, Impressions: 22000 },
  ];

  const queries = [
    { query: "berita madura terkini", clicks: 1200, impressions: 18000, ctr: "6.6%", position: 2.1 },
    { query: "karapan sapi madura 2026", clicks: 840, impressions: 12400, ctr: "6.7%", position: 1.8 },
    { query: "kuliner bebek sinjay bangkalan", clicks: 610, impressions: 9800, ctr: "6.2%", position: 3.4 },
    { query: "wisata sumenep pantai lombang", clicks: 430, impressions: 8200, ctr: "5.2%", position: 4.0 },
    { query: "dprd sampang anggaran", clicks: 210, impressions: 4500, ctr: "4.6%", position: 5.5 },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          padding: "10px 14px",
          borderRadius: 8,
          boxShadow: "var(--shadow-md)",
        }}>
          <p style={{ margin: 0, fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600 }}>Hari ke-{payload[0].payload.day}</p>
          <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 700, color: "var(--brand)" }}>
            Clicks: {payload[0].value.toLocaleString()}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 600, color: "var(--blue)" }}>
            Impressions: {payload[1].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
          Organic Search Performance Engine Metrics
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Integrasi Google Search Console API untuk pelacakan metrik pencarian organik dan kata kunci teratas
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "14px 16px",
          }}>
            <p style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 8px" }}>{s.label}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: s.color, margin: "0 0 2px" }}>{s.val}</p>
            <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 600 }}>{s.change}</span>
          </div>
        ))}
      </div>

      {/* Main Interactive GSC Graph */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 14
      }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
          <TrendingUp size={15} style={{ color: "var(--brand)" }} /> Google Search Console API Core Sync (30d)
        </h2>

        {/* Responsive AreaChart */}
        <div style={{ width: "100%", height: 260, marginTop: 10 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--brand)" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="var(--blue)" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis 
                dataKey="day" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                dy={10}
              />
              <YAxis 
                yAxisId="left"
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="Clicks" 
                stroke="var(--brand)" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorClicks)" 
              />
              <Area 
                yAxisId="right"
                type="monotone" 
                dataKey="Impressions" 
                stroke="var(--blue)" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorImpressions)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Search Queries Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Organic Search Queries Monitor Table
          </h2>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "2fr 100px 100px 100px 100px",
          gap: 12, padding: "10px 16px",
          background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)",
        }}>
          {["Kueri Pencarian", "Clicks", "Impresi", "CTR", "Posisi Rata-rata"].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
          ))}
        </div>

        {queries.map((q, idx) => (
          <div key={idx} style={{
            display: "grid", gridTemplateColumns: "2fr 100px 100px 100px 100px",
            gap: 12, padding: "12px 16px", alignItems: "center",
            borderBottom: idx < queries.length - 1 ? "1px solid var(--border)" : "none",
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 5 }}>
              <ArrowUpRight size={13} style={{ color: "var(--text-tertiary)" }} /> {q.query}
            </span>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{q.clicks.toLocaleString()}</span>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{q.impressions.toLocaleString()}</span>
            <span style={{ fontSize: 12, color: "var(--brand)", fontWeight: 700 }}>{q.ctr}</span>
            <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "monospace" }}>{q.position}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
