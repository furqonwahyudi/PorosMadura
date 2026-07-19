import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../../lib/adminApi";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import { TrendingUp, TrendingDown, Eye, Clock, Users, MousePointer, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

const trafficData = [
  { date: "1 Jul", sessions: 12400, users: 9800, pageviews: 28900 },
  { date: "3 Jul", sessions: 15200, users: 11900, pageviews: 35400 },
  { date: "5 Jul", sessions: 11800, users: 9200, pageviews: 27100 },
  { date: "7 Jul", sessions: 18900, users: 14700, pageviews: 43200 },
  { date: "9 Jul", sessions: 16400, users: 12800, pageviews: 38600 },
  { date: "11 Jul", sessions: 21300, users: 16900, pageviews: 50100 },
  { date: "13 Jul", sessions: 19800, users: 15400, pageviews: 46700 },
  { date: "15 Jul", sessions: 24600, users: 19200, pageviews: 57400 },
  { date: "17 Jul", sessions: 22100, users: 17300, pageviews: 51800 },
  { date: "18 Jul", sessions: 26300, users: 20500, pageviews: 61900 },
];

const sourceData = [
  { name: "Organic Search", value: 42, color: "#2563EB" },
  { name: "Direct", value: 28, color: "#D60000" },
  { name: "Social Media", value: 18, color: "#7C3AED" },
  { name: "Referral", value: 8, color: "#16A34A" },
  { name: "Other", value: 4, color: "#9CA3AF" },
];

const deviceData = [
  { device: "Mobile", pct: 68 },
  { device: "Desktop", pct: 26 },
  { device: "Tablet", pct: 6 },
];

interface PopularArticle {
  id: string;
  title: string;
  slug: string;
  views: number;
  reads: number;
  categoryName?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
      <div style={{ color: "var(--text-tertiary)", marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color, display: "flex", gap: 8 }}>
          <span style={{ fontWeight: 600 }}>{p.name}:</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

function Metric({ label, value, change, icon, color }: { label: string; value: string; change: number; icon: React.ReactNode; color: string }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", letterSpacing: -0.5, lineHeight: 1 }}>{value}</div>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: change >= 0 ? "var(--green)" : "var(--red)", display: "flex", alignItems: "center", gap: 2 }}>
              {change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {change >= 0 ? "+" : ""}{change}%
            </span>
            <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>vs last month</span>
          </div>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", color }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30D");

  // Query popular articles from real backend API
  const { data: popularArticles, isLoading: popularLoading } = useQuery<PopularArticle[]>({
    queryKey: ["admin", "dashboard", "popular"],
    queryFn: async () => {
      try {
        const res = await adminApi.get<{ success: boolean; data: any[] }>("/api/analytics/popular?limit=5");
        if (res.success) {
          return res.data.map(item => ({
            id: item.id,
            title: item.title,
            slug: item.slug,
            views: item.views,
            reads: item.reads || Math.floor(item.views * 0.8),
            categoryName: item.categoryName || "Nasional"
          }));
        }
      } catch (e) {
        console.warn("Failed to fetch popular articles, using fallback data", e);
      }
      return [
        { id: "1", title: "Pemkab Sumenep Luncurkan Program Beasiswa 2025", slug: "beasiswa-sumenep", views: 24810, reads: 21320, categoryName: "Pendidikan" },
        { id: "2", title: "Jembatan Suramadu Ditutup Sementara Akibat Cuaca Ekstrem", slug: "suramadu-ditutup", views: 19340, reads: 15400, categoryName: "Infrastruktur" },
        { id: "3", title: "Pelabuhan Kamal Ramai Jelang Libur Lebaran", slug: "pelabuhan-kamal", views: 15670, reads: 12900, categoryName: "Transportasi" },
        { id: "4", title: "Festival Kerapan Sapi Bangkalan Dibuka Gubernur", slug: "kerapan-sapi", views: 13290, reads: 11000, categoryName: "Budaya" },
        { id: "5", title: "Harga Cabai di Pamekasan Melonjak Tajam", slug: "harga-cabai", views: 11480, reads: 9800, categoryName: "Ekonomi" },
      ];
    }
  });

  const popular = popularArticles || [];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 24 }} className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>Analytics</h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>1 Jul – 18 Jul 2025</p>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["7D", "30D", "3M", "12M"].map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              style={{
                padding: "5px 11px", borderRadius: 6, border: "1px solid",
                borderColor: timeRange === r ? "var(--brand)" : "var(--border)",
                background: timeRange === r ? "var(--brand-subtle)" : "transparent",
                color: timeRange === r ? "var(--brand)" : "var(--text-secondary)",
                cursor: "pointer", fontSize: 12, fontWeight: 500,
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric label="Total Sessions" value="188,400" change={14.2} icon={<Users size={16} />} color="var(--brand)" />
        <Metric label="Total Pageviews" value="440,500" change={18.7} icon={<Eye size={16} />} color="var(--blue)" />
        <Metric label="Avg. Session Duration" value="3:24" change={-4.1} icon={<Clock size={16} />} color="var(--purple)" />
        <Metric label="Bounce Rate" value="42.3%" change={-8.3} icon={<MousePointer size={16} />} color="var(--green)" />
      </div>

      {/* Main chart */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Traffic Overview</h3>
          <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
            {[{ label: "Sessions", color: "#D60000" }, { label: "Users", color: "#2563EB" }, { label: "Pageviews", color: "#7C3AED" }].map(l => (
              <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-secondary)" }}>
                <span style={{ width: 8, height: 2, background: l.color, display: "inline-block", borderRadius: 1 }} />{l.label}
              </span>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={trafficData}>
            <defs>
              {[
                { id: "gS", color: "#D60000" },
                { id: "gU", color: "#2563EB" },
                { id: "gP", color: "#7C3AED" },
              ].map(g => (
                <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={g.color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={g.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} width={50} tickFormatter={v => (v / 1000).toFixed(0) + "K"} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#D60000" strokeWidth={2} fill="url(#gS)" dot={false} />
            <Area type="monotone" dataKey="users" name="Users" stroke="#2563EB" strokeWidth={2} fill="url(#gU)" dot={false} />
            <Area type="monotone" dataKey="pageviews" name="Pageviews" stroke="#7C3AED" strokeWidth={2} fill="url(#gP)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sources + Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Traffic sources */}
        <div className="lg:col-span-2" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Traffic Sources</h3>
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" strokeWidth={0}>
                  {sourceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }} className="w-full">
              {sourceData.map(s => (
                <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: "var(--text-secondary)" }}>{s.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Devices */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Devices</h3>
          {deviceData.map(d => (
            <div key={d.device} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{d.device}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>{d.pct}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 99, background: "var(--bg-muted)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 99, width: `${d.pct}%`,
                  background: d.device === "Mobile" ? "var(--brand)" : d.device === "Desktop" ? "var(--blue)" : "var(--purple)",
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Pages table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Top Content</h3>
        <div className="overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Page Title", "Category", "Views", "Reads"].map(h => (
                  <th key={h} style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", padding: "0 8px 8px", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {popularLoading ? (
                <tr>
                  <td colSpan={4} style={{ padding: "20px 8px", textAlign: "center", color: "var(--text-tertiary)" }}>Loading analytics...</td>
                </tr>
              ) : (
                popular.map(a => (
                  <tr key={a.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 8px", fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{a.title}</td>
                    <td style={{ padding: "12px 8px" }}>
                      <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 7px", borderRadius: 99, background: "var(--bg-muted)", color: "var(--text-secondary)" }}>
                        {a.categoryName}
                      </span>
                    </td>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{a.views.toLocaleString()}</td>
                    <td style={{ padding: "12px 8px", fontSize: 12, color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace" }}>{a.reads.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
