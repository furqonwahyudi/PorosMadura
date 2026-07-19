import React, { useState } from "react";
import { UserPlus, Key, Mail, Shield, User, ArrowLeft, Check, AlertCircle } from "lucide-react";

export default function AddUserPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Reporter");
  const [sendEmail, setSendEmail] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let generated = "";
    for (let i = 0; i < 14; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!username || !email || !firstName || !password) {
      setError("Semua field bertanda * wajib diisi!");
      return;
    }

    // Simulate saving
    setSuccess(true);
    // Reset state
    setUsername("");
    setEmail("");
    setFirstName("");
    setLastName("");
    setPassword("");
  };

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => window.history.back()}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--border)",
            background: "var(--surface)", color: "var(--text-secondary)", cursor: "pointer"
          }}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
            Create New Administrative Account
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            Tambahkan pengguna baru dengan peran tertentu ke dalam sistem CMS
          </p>
        </div>
      </div>

      {success && (
        <div style={{
          background: "var(--green-subtle)", border: "1px solid var(--green)",
          borderRadius: 10, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center",
        }}>
          <Check size={18} style={{ color: "var(--green)", flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: "var(--text-primary)", margin: 0 }}>
            Akun pengguna berhasil dibuat! Email aktivasi telah dikirimkan ke email terdaftar.
          </p>
        </div>
      )}

      {error && (
        <div style={{
          background: "var(--red-subtle)", border: "1px solid var(--red)",
          borderRadius: 10, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center",
        }}>
          <AlertCircle size={18} style={{ color: "var(--red)", flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: "var(--text-primary)", margin: 0 }}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 12, padding: 24, display: "flex", flexDirection: "column", gap: 16,
        maxWidth: 600,
      }}>
        {/* Username */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
            Username *
          </label>
          <div style={{ position: "relative" }}>
            <User size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Contoh: jurnalis_madura"
              style={{
                width: "100%", padding: "8px 12px 8px 36px", background: "var(--bg-subtle)",
                border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
              }}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
            Alamat Email Resmi Perusahaan *
          </label>
          <div style={{ position: "relative" }}>
            <Mail size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@porosmadura.com"
              style={{
                width: "100%", padding: "8px 12px 8px 36px", background: "var(--bg-subtle)",
                border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
              }}
            />
          </div>
        </div>

        {/* Names */}
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
              Nama Depan *
            </label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="Nama Depan"
              style={{
                width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
              Nama Belakang
            </label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Nama Belakang"
              style={{
                width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
              }}
            />
          </div>
        </div>

        {/* Role */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
            Role Assignment *
          </label>
          <div style={{ position: "relative" }}>
            <Shield size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px 8px 36px", background: "var(--bg-subtle)",
                border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                color: "var(--text-primary)", outline: "none", boxSizing: "border-box",
                cursor: "pointer"
              }}
            >
              <option value="Super Admin">Super Admin</option>
              <option value="Pemimpin Redaksi">Pemimpin Redaksi</option>
              <option value="Editor">Editor</option>
              <option value="Reporter">Reporter</option>
              <option value="Kontributor">Kontributor</option>
              <option value="Sales">Sales/Marketing</option>
            </select>
          </div>
        </div>

        {/* Password */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
            Password *
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Key size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
              <input
                type="text"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Buat atau klik Generate Password"
                style={{
                  width: "100%", padding: "8px 12px 8px 36px", background: "var(--bg-subtle)",
                  border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                  color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
                }}
              />
            </div>
            <button
              type="button"
              onClick={generatePassword}
              style={{
                padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border)",
                background: "var(--bg-subtle)", color: "var(--text-secondary)",
                fontSize: 12, fontWeight: 600, cursor: "pointer"
              }}
            >
              Generate Strong Password
            </button>
          </div>
        </div>

        {/* Activation Email Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
          <div
            onClick={() => setSendEmail(v => !v)}
            style={{
              width: 44, height: 24, borderRadius: 99, flexShrink: 0,
              background: sendEmail ? "var(--brand)" : "var(--bg-muted)",
              position: "relative", transition: "background 0.2s", cursor: "pointer",
            }}
          >
            <div style={{
              position: "absolute", top: 4, left: sendEmail ? 23 : 4,
              width: 16, height: 16, borderRadius: "50%",
              background: "#fff", transition: "left 0.2s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
            }} />
          </div>
          <div>
            <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>Kirim Email Aktivasi</span>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
              Kirimkan pemberitahuan otomatis berisi kredensial login dan link aktivasi ke email.
            </p>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "10px 16px", background: "var(--brand)", border: "none", borderRadius: 8,
            cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 600, marginTop: 8
          }}
        >
          <UserPlus size={15} /> Buat Akun Pengguna
        </button>
      </form>
    </div>
  );
}
