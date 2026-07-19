import React, { useState, useEffect, useRef } from "react";
import { Search, FileText, BarChart2, Users, Image, MessageSquare, Settings, Megaphone, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const COMMANDS = [
  { id: "/admin/dashboard", label: "Dashboard Overview", group: "Navigation", icon: <BarChart2 size={14} />, shortcut: "" },
  { id: "/admin/posts", label: "All Articles", group: "Navigation", icon: <FileText size={14} />, shortcut: "" },
  { id: "/admin/posts/create", label: "Create New Article", group: "Actions", icon: <FileText size={14} />, shortcut: "C" },
  { id: "/admin/dashboard/analytics", label: "Analytics Dashboard", group: "Navigation", icon: <BarChart2 size={14} />, shortcut: "" },
  { id: "/admin/media", label: "Media Library", group: "Navigation", icon: <Image size={14} />, shortcut: "" },
  { id: "/admin/comments/moderation", label: "Comment Moderation", group: "Navigation", icon: <MessageSquare size={14} />, shortcut: "" },
  { id: "/admin/users", label: "User Management", group: "Navigation", icon: <Users size={14} />, shortcut: "" },
  { id: "/admin/ads", label: "Advertisement Overview", group: "Navigation", icon: <Megaphone size={14} />, shortcut: "" },
  { id: "/admin/seo/settings", label: "SEO Settings", group: "Navigation", icon: <Search size={14} />, shortcut: "" },
  { id: "/admin/settings/general", label: "Website Settings", group: "Navigation", icon: <Settings size={14} />, shortcut: "" },
];

interface Props {
  onClose: () => void;
}

export default function CommandPalette({ onClose }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = COMMANDS.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.group.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") setHighlighted(h => Math.min(h + 1, filtered.length - 1));
      if (e.key === "ArrowUp") setHighlighted(h => Math.max(h - 1, 0));
      if (e.key === "Enter" && filtered[highlighted]) {
        navigate(filtered[highlighted].id);
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [filtered, highlighted, onClose, navigate]);

  useEffect(() => { setHighlighted(0); }, [query]);

  const groups = [...new Set(filtered.map(c => c.group))];

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "12vh" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="animate-fade-in"
        style={{
          width: 560, background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 14, boxShadow: "0 20px 60px -10px rgba(0,0,0,0.25), 0 8px 20px -4px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        {/* Input */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <Search size={16} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            style={{ flex: 1, border: "none", background: "transparent", color: "var(--text-primary)", fontSize: 15, outline: "none", fontFamily: "inherit" }}
          />
          <kbd style={{ padding: "2px 6px", borderRadius: 4, background: "var(--bg-muted)", border: "1px solid var(--border)", fontSize: 11, color: "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 360, overflowY: "auto" }}>
          {filtered.length === 0 && (
            <div style={{ padding: "32px", textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>
              No results for "{query}"
            </div>
          )}
          {groups.map(group => (
            <div key={group}>
              <div style={{ padding: "8px 16px 4px", fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {group}
              </div>
              {filtered.filter(c => c.group === group).map((cmd, i) => {
                const idx = filtered.indexOf(cmd);
                const isHighlighted = idx === highlighted;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => { navigate(cmd.id); onClose(); }}
                    onMouseEnter={() => setHighlighted(idx)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, width: "100%",
                      padding: "8px 16px", background: isHighlighted ? "var(--bg-muted)" : "transparent",
                      border: "none", cursor: "pointer", textAlign: "left",
                      transition: "background 0.08s",
                    }}
                  >
                    <span style={{ color: isHighlighted ? "var(--brand)" : "var(--text-tertiary)", flexShrink: 0 }}>{cmd.icon}</span>
                    <span style={{ flex: 1, fontSize: 13.5, color: "var(--text-primary)", fontWeight: isHighlighted ? 500 : 400 }}>{cmd.label}</span>
                    {isHighlighted && <ArrowRight size={13} style={{ color: "var(--brand)" }} />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: "8px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: 12, fontSize: 11, color: "var(--text-tertiary)" }}>
          <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <kbd style={{ padding: "1px 5px", borderRadius: 3, background: "var(--bg-muted)", border: "1px solid var(--border)", fontFamily: "'JetBrains Mono', monospace" }}>↵</kbd> select
          </span>
          <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <kbd style={{ padding: "1px 5px", borderRadius: 3, background: "var(--bg-muted)", border: "1px solid var(--border)", fontFamily: "'JetBrains Mono', monospace" }}>↑↓</kbd> navigate
          </span>
          <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <kbd style={{ padding: "1px 5px", borderRadius: 3, background: "var(--bg-muted)", border: "1px solid var(--border)", fontFamily: "'JetBrains Mono', monospace" }}>ESC</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}
