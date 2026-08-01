import React, { useState, useEffect } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { adminApi } from "../../lib/adminApi";
import {
  Camera, Save, Eye, EyeOff, Shield, Bell, Monitor, Globe,
  Clock, Smartphone, Laptop, LogOut, AlertTriangle, Check,
  Key, Mail, Phone, MapPin, User, AtSign, FileText, Link,
  ChevronRight, Trash2, RefreshCw, Lock, Unlock, AlertCircle
} from "lucide-react";

const TABS = [
  { id: "profile", label: "Profile", icon: <User size={14} /> },
  { id: "account", label: "Account & Security", icon: <Shield size={14} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={14} /> },
  { id: "preferences", label: "Preferences", icon: <Monitor size={14} /> },
  { id: "sessions", label: "Sessions", icon: <Smartphone size={14} /> },
];

const SESSIONS = [
  { id: 1, device: "MacBook Pro 16\"", browser: "Chrome 126", os: "macOS 14.5", location: "Bangkalan, Jawa Timur", ip: "180.241.xxx.xxx", time: "Active now", current: true, icon: <Laptop size={15} /> },
  { id: 2, device: "iPhone 15 Pro", browser: "Safari Mobile", os: "iOS 17.5", location: "Bangkalan, Jawa Timur", ip: "180.241.xxx.xxx", time: "2 hours ago", current: false, icon: <Smartphone size={15} /> },
  { id: 3, device: "Windows PC", browser: "Firefox 128", os: "Windows 11", location: "Surabaya, Jawa Timur", ip: "36.74.xxx.xxx", time: "3 days ago", current: false, icon: <Monitor size={15} /> },
];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      style={{
        width: 38, height: 22, borderRadius: 99, border: "none", cursor: "pointer",
        background: on ? "var(--brand)" : "#E5E7EB",
        position: "relative", transition: "background 0.2s", flexShrink: 0,
        padding: 0,
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: "50%", background: "#fff",
        position: "absolute", top: 3,
        left: on ? 19 : 3,
        transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

function FieldGroup({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6, letterSpacing: "0.01em" }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11.5, color: "var(--text-tertiary)", margin: "5px 0 0" }}>{hint}</p>}
    </div>
  );
}

const inputStyle = (focused: boolean = false): React.CSSProperties => ({
  width: "100%", padding: "8px 11px", borderRadius: 8,
  border: `1px solid ${focused ? "var(--brand)" : "var(--border)"}`,
  background: "var(--bg-subtle)", color: "var(--text-primary)",
  fontSize: 13.5, outline: "none", fontFamily: "inherit",
  transition: "border-color 0.15s",
});

export default function ProfileSettingsPage() {
  const { user, updateUser, logout } = useAdminAuth();

  const [tab, setTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [focused, setFocused] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Profile fields (Dynamic states loaded from Auth Context)
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.name?.toLowerCase().replace(/\s+/g, ".") || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [phone, setPhone] = useState(() => localStorage.getItem("cms_phone") || "+62 811-3456-789");
  const [location, setLocation] = useState(() => localStorage.getItem("cms_location") || "Bangkalan, Madura");
  const [website, setWebsite] = useState(() => localStorage.getItem("cms_website") || "https://porosmadura.com");

  // Alert message states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Security password states
  const [currentPw, setCurrentPw] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  // 2FA mock state
  const [twoFA, setTwoFA] = useState(() => localStorage.getItem("cms_2fa") === "true");

  // Notification prefs
  const [notifs, setNotifs] = useState({
    newComment: () => localStorage.getItem("cms_notif_newComment") !== "false",
    commentApproval: () => localStorage.getItem("cms_notif_commentApproval") !== "false",
    articlePublished: () => localStorage.getItem("cms_notif_articlePublished") !== "false",
    articleScheduled: () => localStorage.getItem("cms_notif_articleScheduled") === "true",
    newUser: () => localStorage.getItem("cms_notif_newUser") !== "false",
    systemAlert: () => localStorage.getItem("cms_notif_systemAlert") !== "false",
    weeklyReport: () => localStorage.getItem("cms_notif_weeklyReport") === "true",
    breakingNews: () => localStorage.getItem("cms_notif_breakingNews") !== "false",
  });

  // UI preferences
  const [prefs, setPrefs] = useState({
    language: () => localStorage.getItem("cms_language") || "id",
    timezone: () => localStorage.getItem("cms_timezone") || "Asia/Jakarta",
    dateFormat: () => localStorage.getItem("cms_date_format") || "DD/MM/YYYY",
    editorMode: () => localStorage.getItem("cms_editor_mode") || "rich",
    compactSidebar: () => localStorage.getItem("cms_sidebar_collapsed") === "true",
    autoSave: () => localStorage.getItem("cms_auto_save") !== "false",
    spellCheck: () => localStorage.getItem("cms_spell_check") !== "false",
    darkMode: () => localStorage.getItem("cms_dark_mode") === "true",
  });

  // Sync state variables with actual localStorage values on load
  useEffect(() => {
    // Check local storage values
    const dm = localStorage.getItem("cms_dark_mode") === "true";
    setPrefs(p => ({ ...p, darkMode: dm }));
  }, []);

  // Update password strength dynamically
  useEffect(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    setPasswordStrength(score);
  }, [password]);

  // Derived user initials from Display Name
  const userInitials = (displayName || "User")
    .split(" ")
    .map(word => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Dynamic Sessions & Activities States
  const [sessions, setSessions] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const res = await adminApi.get<any[]>("/api/users/me/sessions");
      if (res && Array.isArray(res)) {
        setSessions(res);
      } else if (res && (res as any).success && Array.isArray((res as any).data)) {
        setSessions((res as any).data);
      }
    } catch (err: any) {
      console.error("Gagal memuat sesi:", err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const fetchActivity = async () => {
    setIsLoadingActivity(true);
    try {
      const res = await adminApi.get<any[]>("/api/users/me/activity");
      if (res && Array.isArray(res)) {
        setActivity(res);
      } else if (res && (res as any).success && Array.isArray((res as any).data)) {
        setActivity((res as any).data);
      }
    } catch (err: any) {
      console.error("Gagal memuat log aktivitas:", err);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  useEffect(() => {
    if (tab === "sessions") {
      fetchSessions();
    } else if (tab === "account") {
      fetchActivity();
    }
  }, [tab]);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await adminApi.delete<{ success: boolean; message: string }>(`/api/users/me/sessions/${sessionId}`);
      if (res.success) {
        fetchSessions();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mencabut sesi.");
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    try {
      const res = await adminApi.delete<{ success: boolean; message: string }>("/api/users/me/sessions");
      if (res.success) {
        fetchSessions();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mencabut semua sesi lain.");
    }
  };

  const handleSignOutAll = async () => {
    try {
      await adminApi.delete("/api/users/me/sessions");
      logout();
    } catch (err: any) {
      logout();
    }
  };

  // Helper for toggle checkboxes
  const handleToggleNotif = (key: keyof typeof notifs, value: boolean) => {
    setNotifs(prev => ({ ...prev, [key]: value }));
    localStorage.setItem(`cms_notif_${String(key)}`, String(value));
  };

  // Helper for toggle preferences
  const handleTogglePref = (key: keyof typeof prefs, value: boolean) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
    if (key === "compactSidebar") {
      localStorage.setItem("cms_sidebar_collapsed", String(value));
    } else {
      localStorage.setItem(`cms__${String(key)}`, String(value));
    }
  };

  // Handle saving configurations
  const handleSave = async () => {
    setErrorMessage(null);
    setSaved(false);

    try {
      if (tab === "profile") {
        if (!displayName.trim()) throw new Error("Display Name wajib diisi.");
        if (!email.trim()) throw new Error("Email Address wajib diisi.");

        // Send to backend
        const res = await adminApi.put<{
          success: boolean;
          message: string;
          data: { id: string; email: string; name: string; avatar: string; bio: string };
        }>("/api/users/me", {
          name: displayName,
          email,
          bio,
          avatar,
        });

        if (res.success) {
          updateUser({
            name: res.data.name,
            email: res.data.email,
            avatar: res.data.avatar,
            bio: res.data.bio
          } as any);

          // Save local static states to localStorage
          localStorage.setItem("cms_phone", phone);
          localStorage.setItem("cms_location", location);
          localStorage.setItem("cms_website", website);
        }
      } else if (tab === "notifications") {
        // Already handled instantly in localStorage, just visual save
      } else if (tab === "preferences") {
        // Save preference fields to localStorage
        localStorage.setItem("cms_language", prefs.language);
        localStorage.setItem("cms_timezone", prefs.timezone);
        localStorage.setItem("cms_date_format", prefs.dateFormat);
        localStorage.setItem("cms_editor_mode", prefs.editorMode);
        localStorage.setItem("cms_sidebar_collapsed", String(prefs.compactSidebar));
        localStorage.setItem("cms_auto_save", String(prefs.autoSave));
        localStorage.setItem("cms_spell_check", String(prefs.spellCheck));
        localStorage.setItem("cms_dark_mode", String(prefs.darkMode));

        // Apply dark mode theme
        if (prefs.darkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menyimpan perubahan.");
    }
  };

  // Password update action handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSaved(false);

    if (!password) {
      setErrorMessage("Password baru tidak boleh kosong.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Password baru minimal harus 8 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi password baru tidak sesuai.");
      return;
    }

    try {
      const res = await adminApi.put<{ success: boolean; message: string }>("/api/users/me", {
        password,
      });

      if (res.success) {
        setSaved(true);
        setCurrentPw("");
        setPassword("");
        setConfirmPassword("");
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengganti password.");
    }
  };

  // Toggle 2FA state helper
  const handleToggle2FA = (val: boolean) => {
    setTwoFA(val);
    localStorage.setItem("cms_2fa", String(val));
  };

  const notifLabels: { key: keyof typeof notifs; label: string; desc: string }[] = [
    { key: "newComment", label: "New Comment", desc: "When a reader leaves a comment on any article" },
    { key: "commentApproval", label: "Comment Approval", desc: "When a comment is flagged for manual approval" },
    { key: "articlePublished", label: "Article Published", desc: "When your article goes live" },
    { key: "articleScheduled", label: "Scheduled Reminder", desc: "24h before a scheduled article publishes" },
    { key: "newUser", label: "New User Registration", desc: "When a new journalist or contributor joins" },
    { key: "systemAlert", label: "System Alerts", desc: "Server issues, API errors, storage warnings" },
    { key: "weeklyReport", label: "Weekly Analytics Report", desc: "Summary of traffic and performance every Monday" },
    { key: "breakingNews", label: "Breaking News Push", desc: "Notify team when breaking news is posted" },
  ];

  return (
    <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 24, maxWidth: 900, margin: "0 auto" }}>
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
            Profile Settings
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            Manage your account information and preferences
          </p>
        </div>
        {tab !== "sessions" && tab !== "account" && (
          <button
            onClick={handleSave}
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "8px 18px",
              background: saved ? "var(--green)" : "var(--brand)",
              border: "none", borderRadius: 8, cursor: "pointer",
              color: "#fff", fontSize: 13, fontWeight: 600,
              transition: "background 0.2s",
            }}
          >
            {saved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save Changes</>}
          </button>
        )}
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
          background: "var(--red-subtle)", color: "var(--red)", borderRadius: 8,
          fontSize: 13, border: "1px solid rgba(220, 38, 38, 0.15)"
        }}>
          <AlertCircle size={15} /> <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Layout Area */}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* Vertical tab list */}
        <nav style={{
          width: 210, flexShrink: 0,
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: "6px", overflow: "hidden",
        }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setErrorMessage(null); }}
              style={{
                display: "flex", alignItems: "center", gap: 9, width: "100%",
                padding: "8px 12px", border: "none", borderRadius: 8,
                background: tab === t.id ? "var(--brand-subtle)" : "transparent",
                color: tab === t.id ? "var(--brand)" : "var(--text-secondary)",
                cursor: "pointer", fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
                textAlign: "left", transition: "background 0.1s, color 0.1s",
                marginBottom: 2,
              }}
              onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.background = "var(--bg-muted)"; }}
              onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ flexShrink: 0, opacity: tab === t.id ? 1 : 0.65 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        {/* Main panel */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ── PROFILE ── */}
          {tab === "profile" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Avatar card */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px" }}>
                <h3 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                  Profile Photo
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ position: "relative" }}>
                    <div style={{
                      width: 80, height: 80, borderRadius: 16, flexShrink: 0,
                      background: avatar ? "var(--bg-muted)" : "linear-gradient(135deg, #D60000 0%, #7C3AED 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: -1,
                      overflow: "hidden", border: "1px solid var(--border)"
                    }}>
                      {avatar ? (
                        <img
                          src={avatar}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : userInitials}
                    </div>
                    <div style={{
                      position: "absolute", bottom: -4, right: -4,
                      width: 26, height: 26, borderRadius: "50%",
                      background: "var(--surface)", border: "2px solid var(--border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", transition: "border-color 0.1s",
                    }}>
                      <Camera size={12} style={{ color: "var(--text-secondary)" }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      Masukkan link foto profil Anda di input bawah. <br />
                      Mendukung format JPG, PNG, atau WebP.
                    </p>
                    <div style={{ display: "flex", gap: 8, maxWidth: 360 }}>
                      <input
                        type="url"
                        value={avatar}
                        onChange={e => setAvatar(e.target.value)}
                        placeholder="https://example.com/foto.jpg"
                        style={inputStyle(focused === "avatar_url")}
                        onFocus={() => setFocused("avatar_url")}
                        onBlur={() => setFocused("")}
                      />
                      {avatar && (
                        <button
                          type="button"
                          onClick={() => setAvatar("")}
                          style={{
                            padding: "6px 14px", borderRadius: 8,
                            background: "transparent", border: "1px solid var(--border)",
                            color: "var(--red)", cursor: "pointer", fontSize: 12.5,
                          }}
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal info */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px" }}>
                <h3 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                  Personal Information
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <FieldGroup label="Display Name">
                    <div style={{ position: "relative" }}>
                      <User size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                      <input
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        onFocus={() => setFocused("name")}
                        onBlur={() => setFocused("")}
                        style={{ ...inputStyle(focused === "name"), paddingLeft: 30 }}
                      />
                    </div>
                  </FieldGroup>

                  <FieldGroup label="Username" hint="Used in your public author URL">
                    <div style={{ position: "relative" }}>
                      <AtSign size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                      <input
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        onFocus={() => setFocused("username")}
                        onBlur={() => setFocused("")}
                        style={{ ...inputStyle(focused === "username"), paddingLeft: 30 }}
                      />
                    </div>
                  </FieldGroup>

                  <FieldGroup label="Email Address">
                    <div style={{ position: "relative" }}>
                      <Mail size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                      <input
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onFocus={() => setFocused("email")}
                        onBlur={() => setFocused("")}
                        style={{ ...inputStyle(focused === "email"), paddingLeft: 30 }}
                      />
                    </div>
                  </FieldGroup>

                  <FieldGroup label="Phone Number">
                    <div style={{ position: "relative" }}>
                      <Phone size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                      <input
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        onFocus={() => setFocused("phone")}
                        onBlur={() => setFocused("")}
                        style={{ ...inputStyle(focused === "phone"), paddingLeft: 30 }}
                      />
                    </div>
                  </FieldGroup>

                  <FieldGroup label="Location">
                    <div style={{ position: "relative" }}>
                      <MapPin size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                      <input
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        onFocus={() => setFocused("loc")}
                        onBlur={() => setFocused("")}
                        style={{ ...inputStyle(focused === "loc"), paddingLeft: 30 }}
                      />
                    </div>
                  </FieldGroup>

                  <FieldGroup label="Website">
                    <div style={{ position: "relative" }}>
                      <Link size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                      <input
                        value={website}
                        onChange={e => setWebsite(e.target.value)}
                        onFocus={() => setFocused("web")}
                        onBlur={() => setFocused("")}
                        style={{ ...inputStyle(focused === "web"), paddingLeft: 30 }}
                      />
                    </div>
                  </FieldGroup>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <FieldGroup label="Bio" hint={`${bio.length}/160 characters`}>
                      <textarea
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        maxLength={160}
                        rows={3}
                        onFocus={() => setFocused("bio")}
                        onBlur={() => setFocused("")}
                        style={{
                          ...inputStyle(focused === "bio"),
                          resize: "none", lineHeight: 1.6,
                        }}
                      />
                    </FieldGroup>
                  </div>
                </div>
              </div>

              {/* Role badge */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>Role & Permissions</div>
                    <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>Your role determines what you can access in the CMS</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      fontSize: 12, padding: "4px 12px", borderRadius: 99,
                      background: "var(--brand-subtle)", color: "var(--brand)",
                      fontWeight: 700, border: "1px solid var(--brand)",
                      textTransform: "uppercase"
                    }}>
                      {user?.role || "User"}
                    </span>
                    <ChevronRight size={14} style={{ color: "var(--text-tertiary)" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ACCOUNT & SECURITY ── */}
          {tab === "account" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Change password */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px" }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                  Change Password
                </h3>
                <p style={{ margin: "0 0 18px", fontSize: 12.5, color: "var(--text-tertiary)" }}>
                  Use a strong password with at least 8 characters
                </p>

                <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 420 }}>
                  <FieldGroup label="New Password">
                    <div style={{ position: "relative" }}>
                      <Key size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                      <input
                        type={showNewPw ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        onFocus={() => setFocused("npw")}
                        onBlur={() => setFocused("")}
                        style={{ ...inputStyle(focused === "npw"), paddingLeft: 30, paddingRight: 36 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(v => !v)}
                        style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", cursor: "pointer", color: "var(--text-tertiary)", padding: 0, display: "flex" }}
                      >
                        {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </FieldGroup>

                  <FieldGroup label="Confirm New Password">
                    <div style={{ position: "relative" }}>
                      <Key size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        onFocus={() => setFocused("rpw")}
                        onBlur={() => setFocused("")}
                        style={{ ...inputStyle(focused === "rpw"), paddingLeft: 30 }}
                      />
                    </div>
                  </FieldGroup>

                  {/* Password strength */}
                  <div>
                    <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginBottom: 6 }}>Password strength</div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          style={{
                            flex: 1, height: 4, borderRadius: 99,
                            background: i <= passwordStrength
                              ? (passwordStrength <= 2 ? "var(--orange)" : "var(--green)")
                              : "var(--border)"
                          }}
                        />
                      ))}
                    </div>
                    {password && (
                      <div style={{
                        fontSize: 11.5,
                        color: passwordStrength <= 2 ? "var(--orange)" : "var(--green)",
                        marginTop: 4
                      }}>
                        {passwordStrength <= 2 ? "Moderate — add symbols or uppercase" : "Strong password!"}
                      </div>
                    )}
                  </div>

                  {saved && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--green)", fontSize: 13 }}>
                      <Check size={14} /> Password berhasil diperbarui!
                    </div>
                  )}

                  <button
                    type="submit"
                    style={{
                      padding: "8px 16px", borderRadius: 8, background: "var(--brand)", border: "none",
                      color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600,
                      alignSelf: "flex-start", marginTop: 4
                    }}
                  >
                    Update Password
                  </button>
                </form>
              </div>

              {/* 2FA */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                      background: twoFA ? "var(--green-subtle)" : "var(--bg-muted)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {twoFA ? <Lock size={16} style={{ color: "var(--green)" }} /> : <Unlock size={16} style={{ color: "var(--text-tertiary)" }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>
                        Two-Factor Authentication
                      </div>
                      <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                        Add an extra layer of security to your account.<br />
                        {twoFA ? "2FA is currently enabled via authenticator app." : "Requires an authenticator app (Google Authenticator, Authy, etc.)"}
                      </div>
                    </div>
                  </div>
                  <Toggle on={twoFA} onChange={handleToggle2FA} />
                </div>

                {twoFA && (
                  <div style={{ marginTop: 16, padding: "14px 16px", background: "var(--green-subtle)", borderRadius: 8, border: "1px solid var(--green)", display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <Check size={14} style={{ color: "var(--green)", marginTop: 1, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--green)" }}>2FA Enabled</div>
                      <div style={{ fontSize: 12, color: "var(--green)", opacity: 0.8, marginTop: 2 }}>Your account is protected. Last verified 2 hours ago.</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Login history */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px" }}>
                <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                  Recent Login Activity
                </h3>
                {isLoadingActivity ? (
                  <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-secondary)", fontSize: 13 }}>
                    Loading activity...
                  </div>
                ) : activity.length === 0 ? (
                  <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>
                    Tidak ada aktivitas keamanan baru.
                  </div>
                ) : (
                  <>
                    {(showAllActivity ? activity : activity.slice(0, 5)).map((item, i) => (
                      <div key={item.id || i} style={{
                        display: "flex", gap: 10, alignItems: "flex-start",
                        padding: "10px 0", borderBottom: i < (showAllActivity ? activity.length : 5) - 1 ? "1px solid var(--border-subtle)" : "none",
                      }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 7, flexShrink: 0, marginTop: 1,
                          background: item.ok ? "var(--green-subtle)" : "var(--red-subtle)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {item.ok ? <Check size={12} style={{ color: "var(--green)" }} /> : <AlertTriangle size={12} style={{ color: "var(--red)" }} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: item.ok ? "var(--text-primary)" : "var(--red)" }}>{item.action}</div>
                          <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 2 }}>
                            {item.device} · {item.browser} ({item.os}) · {item.location}
                          </div>
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", whiteSpace: "nowrap", fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
                          {new Date(item.time).toLocaleString("id-ID", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                          })}
                        </div>
                      </div>
                    ))}

                    {activity.length > 5 && (
                      <button
                        type="button"
                        onClick={() => setShowAllActivity(!showAllActivity)}
                        style={{
                          display: "block", width: "100%", textAlign: "center", padding: "10px 0 0",
                          background: "transparent", border: "none", borderTop: "1px solid var(--border-subtle)",
                          color: "var(--brand)", fontSize: 13, fontWeight: 600, cursor: "pointer",
                          marginTop: 10, transition: "color 0.15s"
                        }}
                        className="hover:text-[var(--brand-hover)]"
                      >
                        {showAllActivity ? "Sembunyikan" : "Lihat Semua Activity"}
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Danger zone */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--red)", borderRadius: 12, padding: "24px" }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "var(--red)" }}>Danger Zone</h3>
                <p style={{ margin: "0 0 16px", fontSize: 12.5, color: "var(--text-secondary)" }}>
                  These actions are permanent and cannot be undone.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
                      background: "transparent", border: "1px solid var(--border)",
                      borderRadius: 7, cursor: "pointer", color: "var(--text-secondary)", fontSize: 12.5,
                    }}
                  >
                    <RefreshCw size={13} /> Reset All Preferences
                  </button>
                  <button
                    type="button"
                    style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
                      background: "var(--red-subtle)", border: "1px solid var(--red)",
                      borderRadius: 7, cursor: "pointer", color: "var(--red)", fontSize: 12.5, fontWeight: 500,
                    }}
                  >
                    <Trash2 size={13} /> Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {tab === "notifications" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px" }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                  Notification Preferences
                </h3>
                <p style={{ margin: "0 0 20px", fontSize: 12.5, color: "var(--text-tertiary)" }}>
                  Choose how and when you receive notifications
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {notifLabels.map(n => (
                    <div
                      key={n.key}
                      style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "14px 14px", borderRadius: 9, transition: "background 0.1s",
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--bg-subtle)"}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                    >
                      <div style={{ flex: 1, paddingRight: 16 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)", marginBottom: 2 }}>
                          {n.label}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{n.desc}</div>
                      </div>
                      <Toggle
                        on={notifs[n.key]}
                        onChange={v => handleToggleNotif(n.key, v)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Channels */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                  Notification Channels
                </h3>
                {[
                  { label: "Email Notifications", desc: "Receive summaries and alerts by email", key: "email" },
                  { label: "Browser Push Notifications", desc: "Real-time alerts in your browser", key: "push" },
                  { label: "In-App Notifications", desc: "Bell icon notifications in the dashboard", key: "inapp" },
                ].map((ch, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 0",
                    borderBottom: i < 2 ? "1px solid var(--border-subtle)" : "none",
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{ch.label}</div>
                      <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 1 }}>{ch.desc}</div>
                    </div>
                    <Toggle
                      on={localStorage.getItem(`cms_channel_${ch.key}`) !== "false"}
                      onChange={(v) => {
                        localStorage.setItem(`cms_channel_${ch.key}`, String(v));
                        // Force update view
                        setNotifs(prev => ({ ...prev }));
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PREFERENCES ── */}
          {tab === "preferences" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Regional */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px" }}>
                <h3 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Regional Settings</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[
                    { label: "Language", key: "language", options: [{ val: "id", label: "Bahasa Indonesia" }, { val: "en", label: "English" }] },
                    { label: "Timezone", key: "timezone", options: [{ val: "Asia/Jakarta", label: "Asia/Jakarta (WIB)" }, { val: "Asia/Makassar", label: "Asia/Makassar (WITA)" }] },
                    { label: "Date Format", key: "dateFormat", options: [{ val: "DD/MM/YYYY", label: "DD/MM/YYYY" }, { val: "MM/DD/YYYY", label: "MM/DD/YYYY" }, { val: "YYYY-MM-DD", label: "YYYY-MM-DD" }] },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>{f.label}</label>
                      <select
                        value={(prefs as any)[f.key]}
                        onChange={e => setPrefs(prev => ({ ...prev, [f.key]: e.target.value }))}
                        style={{
                          width: "100%", padding: "8px 11px", borderRadius: 8,
                          border: "1px solid var(--border)", background: "var(--bg-subtle)",
                          color: "var(--text-primary)", fontSize: 13, outline: "none", cursor: "pointer",
                        }}
                      >
                        {f.options.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editor */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px" }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Editor Preferences</h3>
                <p style={{ margin: "0 0 18px", fontSize: 12.5, color: "var(--text-tertiary)" }}>Configure how the article editor behaves</p>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Editor Mode</label>
                  <select
                    value={prefs.editorMode}
                    onChange={e => setPrefs(prev => ({ ...prev, editorMode: e.target.value }))}
                    style={{
                      padding: "8px 11px", borderRadius: 8, border: "1px solid var(--border)",
                      background: "var(--bg-subtle)", color: "var(--text-primary)", fontSize: 13, outline: "none",
                      width: "100%", cursor: "pointer"
                    }}
                  >
                    <option value="rich">Rich Text (WYSIWYG)</option>
                    <option value="markdown">Markdown</option>
                    <option value="split">Split View</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 6 }}>
                  {[
                    { label: "Auto-save drafts every 30 seconds", key: "autoSave" },
                    { label: "Enable spell checker", key: "spellCheck" },
                    { label: "Compact sidebar mode", key: "compactSidebar" },
                  ].map(item => (
                    <div key={item.key} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 12px", borderRadius: 8, transition: "background 0.1s",
                    }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--bg-subtle)"}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                    >
                      <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{item.label}</span>
                      <Toggle
                        on={(prefs as any)[item.key]}
                        onChange={v => handleTogglePref(item.key as any, v)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Appearance */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Appearance</h3>
                <div style={{ display: "flex", gap: 10 }}>
                  {[
                    { label: "Light", preview: "bg-white", dark: false },
                    { label: "Dark", preview: "bg-black", dark: true },
                    { label: "System", preview: "split", dark: null },
                  ].map(theme => {
                    const isSelected = prefs.darkMode === theme.dark;
                    return (
                      <div
                        key={theme.label}
                        onClick={() => {
                          // If System theme, default to current system dark preference
                          const val = theme.dark === null ? window.matchMedia("(prefers-color-scheme: dark)").matches : theme.dark;
                          setPrefs(prev => ({ ...prev, darkMode: val }));
                        }}
                        style={{
                          flex: 1, borderRadius: 10, border: "2px solid",
                          borderColor: isSelected ? "var(--brand)" : "var(--border)",
                          overflow: "hidden", cursor: "pointer", transition: "border-color 0.15s",
                        }}
                        onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = "var(--brand)"; }}
                        onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; }}
                      >
                        <div style={{
                          height: 56,
                          background: theme.dark === true ? "#111" : theme.dark === false ? "#fff" :
                            "linear-gradient(135deg, #fff 50%, #111 50%)",
                          borderBottom: "1px solid var(--border)",
                          display: "flex", alignItems: "center", padding: "0 10px", gap: 5,
                        }}>
                          {[1, 2, 3].map(i => (
                            <div key={i} style={{ width: 4 + i * 6, height: 4, borderRadius: 99, background: theme.dark === true ? "#333" : "#E5E7EB" }} />
                          ))}
                        </div>
                        <div style={{ padding: "8px 10px", display: "flex", gap: 5, justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)" }}>{theme.label}</span>
                          {isSelected && <Check size={12} style={{ color: "var(--brand)" }} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === "sessions" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Active Sessions</h3>
                    <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "var(--text-tertiary)" }}>
                      Devices and browsers currently signed in to your account
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRevokeAllOtherSessions}
                    style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
                      background: "var(--red-subtle)", border: "1px solid var(--red)",
                      borderRadius: 8, cursor: "pointer", color: "var(--red)", fontSize: 12.5, fontWeight: 500,
                    }}
                  >
                    <LogOut size={13} /> Revoke All Other Sessions
                  </button>
                </div>

                {isLoadingSessions ? (
                  <div style={{ padding: "30px", textAlign: "center", color: "var(--text-secondary)", fontSize: 13.5 }}>
                    Loading active sessions...
                  </div>
                ) : sessions.length === 0 ? (
                  <div style={{ padding: "30px", textAlign: "center", color: "var(--text-tertiary)", fontSize: 13.5 }}>
                    Tidak ada sesi aktif ditemukan.
                  </div>
                ) : (
                  sessions.map((session, i) => (
                    <div
                      key={session.id || i}
                      style={{
                        padding: "18px 24px",
                        borderBottom: i < sessions.length - 1 ? "1px solid var(--border-subtle)" : "none",
                        display: "flex", gap: 14, alignItems: "flex-start",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--bg-subtle)"}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                    >
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: session.current ? "var(--green-subtle)" : "var(--bg-muted)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: session.current ? "var(--green)" : "var(--text-tertiary)",
                      }}>
                        {session.icon === "laptop" ? <Laptop size={15} /> : session.icon === "smartphone" ? <Smartphone size={15} /> : <Monitor size={15} />}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>
                            {session.device}
                          </span>
                          {session.current && (
                            <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 99, background: "var(--green-subtle)", color: "var(--green)", fontWeight: 600 }}>
                              Current
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 4 }}>
                          {session.browser} · {session.os}
                        </div>
                        <div style={{ display: "flex", gap: 14, fontSize: 11.5, color: "var(--text-tertiary)" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <MapPin size={10} /> {session.location}
                          </span>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{session.ip}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <Clock size={10} /> {session.current ? "Active now" : new Date(session.time).toLocaleString("id-ID", {
                              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                            })}
                          </span>
                        </div>
                      </div>

                      {!session.current && (
                        <button
                          type="button"
                          onClick={() => handleRevokeSession(session.id)}
                          style={{
                            padding: "6px 12px", borderRadius: 7, border: "1px solid var(--border)",
                            background: "transparent", cursor: "pointer",
                            color: "var(--red)", fontSize: 12, fontWeight: 500, flexShrink: 0,
                            transition: "all 0.1s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "var(--red-subtle)"; e.currentTarget.style.borderColor = "var(--red)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--border)"; }}
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Sign out everywhere */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>Sign out everywhere</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>This will end all active sessions including this one</div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOutAll}
                  style={{
                    display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
                    background: "var(--brand)", border: "none", borderRadius: 8,
                    cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 600,
                  }}
                >
                  <LogOut size={14} /> Sign Out All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
