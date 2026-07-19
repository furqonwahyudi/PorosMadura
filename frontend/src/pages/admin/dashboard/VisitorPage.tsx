import React from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import { Users, UserPlus, RefreshCw, TrendingUp, Circle, Monitor, Smartphone, Tablet, Globe, MapPin } from "lucide-react";

const realtimeData = Array.from({ length: 20 }, (_, i) => ({
  t: i,
  active: Math.floor(Math.random() * 120 + 680 + Math.sin(i / 3) * 60),
}));

const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, "0")}:00`,
  visitors: Math.floor(
    i < 6 ? Math.random() * 80 + 20 :
    i < 12 ? Math.random() * 300 + 400 :
    i < 18 ? Math.random() * 400 + 600 :
    Math.random() * 200 + 300
  ),
}));

const regionData = [
  { city: "Surabaya", visitors: 18420, pct: 34 },
  { city: "Bangkalan", visitors: 12840, pct: 24 },
  { city: "Pamekasan", visitors: 8960, pct: 17 },
  { city: "Sumenep", visitors: 6230, pct: 12 },
  { city: "Sampang", visitors: 4810, pct: 9 },
  { city: "Jakarta", visitors: 2190, pct: 4 },
];

const deviceShare = [
  { name: "Mobile", value: 68, color: "#D60000" },
  { name: "Desktop", value: 26, color: "#2563EB" },
  { name: "Tablet", value: 6, color: "#7C3AED" },
];

const browserData = [
  { name: "Chrome", pct: 62, color: "#2563EB" },
  { name: "Safari", pct: 22, color: "#7C3AED" },
  { name: "Firefox", pct: 8, color: "#EA580C" },
  { name: "Samsung", pct: 5, color: "#16A34A" },
  { name: "Lainnya", pct: 3, color: "#9CA3AF" },
];

const engagementData = [
  { day: "Sen", sessions: 9800, duration: 198, pages: 2.8 },
  { day: "Sel", sessions: 11200, duration: 214, pages: 3.1 },
  { day: "Rab", sessions: 8600, duration: 187, pages: 2.6 },
  { day: "Kam", sessions: 14300, duration: 231, pages: 3.4 },
  { day: "Jum", sessions: 13100, duration: 224, pages: 3.2 },
  { day: "Sab", sessions: 6400, duration: 172, pages: 2.4 },
  { day: "Min", sessions: 5200, duration: 163, pages: 2.2 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
      <div style={{ color: "var(--text-tertiary)", marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color, display: "flex", gap: 8 }}>
          <span style={{ fontWeight: 600 }}>{p.name}:</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function VisitorPage() {
  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 24 }} className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>Visitors</h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>Audience insights & behavior — Hari ini</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "var(--green-subtle)", borderRadius: 8, border: "1px solid var(--green)" }}>
            <Circle size={7} style={{ color: "var(--green)", fill: "var(--green)" }} className="pulse-live" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--green)", fontFamily: "'JetBrains Mono', monospace" }}>842</span>
            <span style={{ fontSize: 12, color: "var(--green)", fontWeight: 500 }}>online sekarang</span>
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 11px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", fontSize: 12, color: "var(--text-secondary)" }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Unique Visitors Hari Ini", value: "54,380", change: "+12.3%", icon: <Users size={16} />, color: "var(--brand)" },
          { label: "New Visitors", value: "31,540", change: "+9.8%", icon: <UserPlus size={16} />, color: "var(--blue)" },
          { label: "Avg. Pages / Session", value: "2.9", change: "+4.2%", icon: <Globe size={16} />, color: "var(--purple)" },
          { label: "Avg. Session Duration", value: "3:24", change: "+6.1%", icon: <TrendingUp size={16} />, color: "var(--green)" },
        ].map(kpi => (
          <div key={kpi.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11.5, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 6 }}>{kpi.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", letterSpacing: -0.5, lineHeight: 1 }}>{kpi.value}</div>
                <div style={{ marginTop: 6, fontSize: 11.5, fontWeight: 600, color: "var(--green)" }}>{kpi.change} vs kemarin</div>
              </div>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: kpi.color + "18", display: "flex", alignItems: "center", justifyContent: "center", color: kpi.color, flexShrink: 0 }}>
                {kpi.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Realtime + hourly */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Realtime pulse */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px" }}>
          <h3 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Realtime Active</h3>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "var(--text-tertiary)" }}>Pembaruan setiap 30 detik</p>
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 56, fontWeight: 800, color: "var(--brand)", letterSpacing: -2, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>842</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6 }}>pengunjung aktif</div>
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={realtimeData}>
              <defs>
                <linearGradient id="rtGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D60000" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#D60000" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="active" stroke="#D60000" strokeWidth={1.5} fill="url(#rtGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Baca artikel", count: 612 },
              { label: "Halaman utama", count: 148 },
              { label: "Pencarian", count: 82 },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{item.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly chart */}
        <div className="lg:col-span-2" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px" }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Visitor Traffic per Jam</h3>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "var(--text-tertiary)" }}>Hari ini (WIB)</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="visitors" name="Visitors" fill="#D60000" radius={[3, 3, 0, 0]} maxBarSize={14} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Engagement + Region */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Engagement weekly */}
        <div className="lg:col-span-2" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px" }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Engagement Mingguan</h3>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "var(--text-tertiary)" }}>Session, durasi rata-rata, halaman per sesi</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sessions" name="Sessions" fill="#2563EB" radius={[3, 3, 0, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top regions */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
            <MapPin size={14} style={{ color: "var(--brand)" }} />
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Asal Pengunjung</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {regionData.map((r, i) => (
              <div key={r.city}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace", minWidth: 14 }}>{i + 1}</span>
                    <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{r.city}</span>
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {r.visitors.toLocaleString()} ({r.pct}%)
                  </span>
                </div>
                <div style={{ height: 4, borderRadius: 99, background: "var(--bg-muted)", overflow: "hidden" }}>
                  <div style={{ height: "100%", background: i === 0 ? "var(--brand)" : i === 1 ? "var(--blue)" : "var(--green)", width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Browsers list */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Browser Share</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {browserData.map(b => (
            <div key={b.name} style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{b.name}</span>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>{b.pct}%</span>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: b.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
