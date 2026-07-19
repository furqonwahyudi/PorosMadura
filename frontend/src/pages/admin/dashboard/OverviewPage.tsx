import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../../lib/adminApi";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import {
  FileText, Users, Activity, Server, TrendingUp, TrendingDown,
  ArrowUpRight, Eye, Clock, CheckCircle, Wifi,
  Database, Globe, HardDrive, RefreshCw, ExternalLink,
  Circle, Zap, CloudSun
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const realtimeData = Array.from({ length: 30 }, (_, i) => ({
  t: i,
  visitors: Math.floor(Math.random() * 200 + 300 + Math.sin(i / 4) * 80),
  pageviews: Math.floor(Math.random() * 400 + 600 + Math.sin(i / 4) * 120),
}));

const publishingData = [
  { day: "Mon", articles: 12, comments: 45 },
  { day: "Tue", articles: 18, comments: 67 },
  { day: "Wed", articles: 9, comments: 34 },
  { day: "Thu", articles: 24, comments: 89 },
  { day: "Fri", articles: 21, comments: 72 },
  { day: "Sat", articles: 6, comments: 28 },
  { day: "Sun", articles: 4, comments: 19 },
];

const topArticles = [
  { id: 1, title: "Pemkab Sumenep Luncurkan Program Beasiswa 2025", views: 24810, author: "Rudi Santoso", category: "Pendidikan", trend: "up" },
  { id: 2, title: "Jembatan Suramadu Ditutup Sementara Akibat Cuaca Ekstrem", views: 19340, author: "Fatimah Z.", category: "Infrastruktur", trend: "up" },
  { id: 3, title: "Pelabuhan Kamal Ramai Jelang Libur Lebaran", views: 15670, author: "Budi Hariono", category: "Transportasi", trend: "stable" },
  { id: 4, title: "Festival Kerapan Sapi Bangkalan Dibuka Gubernur", views: 13290, author: "Nia Kurniasih", category: "Budaya", trend: "down" },
  { id: 5, title: "Harga Cabai di Pamekasan Melonjak Tajam", views: 11480, author: "Samsul Arifin", category: "Ekonomi", trend: "up" },
];

const systemItems = [
  { label: "API Server", status: "operational", uptime: "99.98%", icon: <Server size={14} /> },
  { label: "Database (MySQL)", status: "operational", uptime: "99.99%", icon: <Database size={14} /> },
  { label: "CDN (Cloudflare)", status: "operational", uptime: "100%", icon: <Globe size={14} /> },
  { label: "Media Storage", status: "warning", uptime: "99.92%", icon: <HardDrive size={14} /> },
  { label: "Search (Elasticsearch)", status: "operational", uptime: "99.95%", icon: <Wifi size={14} /> },
  { label: "Push Notifications", status: "operational", uptime: "99.87%", icon: <Activity size={14} /> },
];

const cronJobs = [
  { name: "Auto-publish scheduled articles", last: "2 min ago", next: "8 min", status: "ok" },
  { name: "Google Sitemap submission", last: "1h ago", next: "23h", status: "ok" },
  { name: "Image optimization queue", last: "12 min ago", next: "3 min", status: "ok" },
  { name: "Search index rebuild", last: "6h ago", next: "18h", status: "ok" },
  { name: "Analytics aggregation", last: "30 min ago", next: "30 min", status: "warning" },
  { name: "Comment spam detection", last: "5 min ago", next: "5 min", status: "ok" },
];

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  color: string;
}

function KPICard({ icon, label, value, change, changeLabel, color }: KPICardProps) {
  const positive = change >= 0;
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: "20px",
      boxShadow: "var(--shadow-sm)",
      transition: "box-shadow 0.15s, border-color 0.15s",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-md)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--text-tertiary)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-sm)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", letterSpacing: -1, lineHeight: 1 }}>{value}</div>
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{
              fontSize: 11, fontWeight: 600, color: positive ? "var(--green)" : "var(--red)",
              display: "flex", alignItems: "center", gap: 2,
            }}>
              {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {positive ? "+" : ""}{change}%
            </span>
            <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{changeLabel}</span>
          </div>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: color + "18",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: color, flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--surface-raised)", border: "1px solid var(--border)",
      borderRadius: 8, padding: "8px 12px", boxShadow: "var(--shadow-md)",
      fontSize: 12,
    }}>
      <div style={{ color: "var(--text-tertiary)", marginBottom: 4, fontWeight: 500 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color, display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontWeight: 600 }}>{p.name}:</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default function OverviewPage() {
  const navigate = useNavigate();

  // Query stats from backend API
  const { data: statsData } = useQuery({
    queryKey: ["admin", "dashboard", "summary"],
    queryFn: async () => {
      try {
        const res = await adminApi.get<{ success: boolean; data: any }>("/api/analytics/summary");
        if (res.success) {
          return {
            totalToday: res.data.articles || 12,
            pendingReview: 4,
            onlineJournalists: 7,
            serverStatus: "99.9%",
            dbLatency: 12,
          };
        }
      } catch (e) {
        console.warn("Failed to fetch analytics summary, using default mock values", e);
      }
      return {
        totalToday: 24,
        pendingReview: 8,
        onlineJournalists: 7,
        serverStatus: "99.9%",
        dbLatency: 15,
      };
    }
  });

  const { data: leaderboardData } = useQuery({
    queryKey: ["admin", "dashboard", "leaderboard"],
    queryFn: async () => {
      return [
        { rank: 1, name: "Rudi Santoso", avatar: "RS", articles: 28, views: 142300, color: "#D60000" },
        { rank: 2, name: "Fatimah Zahra", avatar: "FZ", articles: 24, views: 118900, color: "#7C3AED" },
        { rank: 3, name: "Budi Hariono", avatar: "BH", articles: 19, views: 97400, color: "#2563EB" },
        { rank: 4, name: "Nia Kurniasih", avatar: "NK", articles: 17, views: 84100, color: "#16A34A" },
        { rank: 5, name: "Samsul Arifin", avatar: "SA", articles: 14, views: 71200, color: "#EA580C" },
      ];
    }
  });

  const stats = statsData || {
    totalToday: 24,
    pendingReview: 8,
    onlineJournalists: 7,
    serverStatus: "99.9%",
  };

  const leaderboard = leaderboardData || [];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 24 }} className="animate-fade-in">
      {/* Page title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
            Editorial Dashboard
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            Portal Berita Poros Madura
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 12px", background: "var(--green-subtle)",
            borderRadius: 8, border: "1px solid var(--green)",
          }}>
            <Circle size={7} style={{ color: "var(--green)", fill: "var(--green)" }} className="pulse-live" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--green)" }}>
              842 online now
            </span>
          </div>
          <button style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
            background: "var(--bg-subtle)", border: "1px solid var(--border)",
            borderRadius: 8, cursor: "pointer", fontSize: 12, color: "var(--text-secondary)",
          }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={<FileText size={18} />} label="Articles Today" value={String(stats.totalToday)} change={12} changeLabel="vs yesterday" color="var(--brand)" />
        <KPICard icon={<Clock size={18} />} label="Pending Review" value={String(stats.pendingReview)} change={-25} changeLabel="vs yesterday" color="var(--orange)" />
        <KPICard icon={<Users size={18} />} label="Online Journalists" value={String(stats.onlineJournalists)} change={17} changeLabel="vs last week" color="var(--blue)" />
        <KPICard icon={<CheckCircle size={18} />} label="Server Status" value={stats.serverStatus} change={0.1} changeLabel="uptime today" color="var(--green)" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Realtime traffic */}
        <div className="lg:col-span-2" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Realtime Traffic</h3>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-tertiary)" }}>Last 30 minutes</p>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-secondary)" }}>
                <span style={{ width: 8, height: 2, background: "var(--brand)", display: "inline-block", borderRadius: 1 }} />
                Visitors
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-secondary)" }}>
                <span style={{ width: 8, height: 2, background: "var(--blue)", display: "inline-block", borderRadius: 1 }} />
                Pageviews
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={realtimeData}>
              <defs>
                <linearGradient id="gVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D60000" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#D60000" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gPageviews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="t" tick={false} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#D60000" strokeWidth={2} fill="url(#gVisitors)" dot={false} />
              <Area type="monotone" dataKey="pageviews" name="Pageviews" stroke="#2563EB" strokeWidth={2} fill="url(#gPageviews)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Publishing activity */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px" }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Publishing Activity</h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-tertiary)" }}>This week</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={publishingData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="articles" name="Articles" fill="#D60000" radius={[3, 3, 0, 0]} maxBarSize={18} />
              <Bar dataKey="comments" name="Comments" fill="#3B82F6" radius={[3, 3, 0, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leaderboard + Top Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Leaderboard */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Editorial Leaderboard</h3>
            <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>This month</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {leaderboard.map(entry => (
              <div key={entry.rank} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", width: 14, fontFamily: "'JetBrains Mono', monospace", textAlign: "right" }}>
                  {entry.rank}
                </span>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: entry.color + "20", color: entry.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700,
                }} className="flex items-center justify-center">
                  {entry.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }} className="truncate">{entry.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{entry.articles} articles</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {(entry.views / 1000).toFixed(1)}K
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>views</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Articles */}
        <div className="lg:col-span-2" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Top Articles</h3>
            <button onClick={() => navigate("/admin/posts")} style={{
              fontSize: 12, color: "var(--brand)", background: "none", border: "none",
              cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 4,
            }}>
              View all <ExternalLink size={11} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["#", "Title", "Author", "Category", "Views", ""].map(h => (
                    <th key={h} style={{
                      textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)",
                      padding: "0 8px 8px", borderBottom: "1px solid var(--border)",
                      textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topArticles.map((article, i) => (
                  <tr key={article.id} style={{ transition: "background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-subtle)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "10px 8px", fontSize: 12, color: "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}>{i + 1}</td>
                    <td style={{ padding: "10px 8px", fontSize: 13, color: "var(--text-primary)", fontWeight: 500, maxWidth: 300 }}>
                      <div className="truncate">{article.title}</div>
                    </td>
                    <td style={{ padding: "10px 8px", fontSize: 12, color: "var(--text-secondary)" }}>{article.author}</td>
                    <td style={{ padding: "10px 8px" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 500, padding: "2px 7px", borderRadius: 99,
                        background: "var(--blue-subtle)", color: "var(--blue)",
                      }}>{article.category}</span>
                    </td>
                    <td style={{ padding: "10px 8px", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-primary)", fontWeight: 600 }}>
                      {article.views.toLocaleString()}
                    </td>
                    <td style={{ padding: "10px 8px" }}>
                      {article.trend === "up" && <TrendingUp size={13} style={{ color: "var(--green)" }} />}
                      {article.trend === "down" && <TrendingDown size={13} style={{ color: "var(--red)" }} />}
                      {article.trend === "stable" && <ArrowUpRight size={13} style={{ color: "var(--text-tertiary)" }} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Services */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>System Health</h3>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--green)", fontWeight: 500 }}>
              <Circle size={7} fill="var(--green)" style={{ color: "var(--green)" }} className="pulse-live" /> All systems operational
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {systemItems.map(item => (
              <div key={item.label} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                borderRadius: 8, background: "var(--bg-subtle)",
              }}>
                <span style={{ color: "var(--text-tertiary)", flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1, fontSize: 13, color: "var(--text-primary)" }}>{item.label}</span>
                <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-tertiary)" }}>{item.uptime}</span>
                <span style={{
                  width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                  background: item.status === "operational" ? "var(--green)" : "var(--orange)",
                }} />
              </div>
            ))}
          </div>
        </div>

        {/* Cron Jobs */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Scheduled Tasks</h3>
            <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>6 active jobs</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cronJobs.map(job => (
              <div key={job.name} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                borderRadius: 8, background: "var(--bg-subtle)",
              }}>
                <RefreshCw size={13} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: "var(--text-primary)" }} className="truncate">
                    {job.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 1 }}>Last: {job.last} · Next: {job.next}</div>
                </div>
                <span style={{
                  fontSize: 11, padding: "1px 7px", borderRadius: 99, fontWeight: 500,
                  background: job.status === "ok" ? "var(--green-subtle)" : "var(--orange-subtle)",
                  color: job.status === "ok" ? "var(--green)" : "var(--orange)",
                }}>
                  {job.status === "ok" ? "Active" : "Warning"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
